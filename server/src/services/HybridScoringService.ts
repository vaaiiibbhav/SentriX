/**
 * HybridScoringService — Multi-tiered compliance scoring with NLP enhancement
 *
 * Tier 1: Local ML scoring via Python microservice (sentence-transformers)
 * Tier 2: Groq AI assessment (if GROQ_API_KEY is set, using openai/gpt-oss-120b)
 * Tier 3: Enhanced keyword + NLP fallback (always available)
 *
 * The service gracefully degrades while maintaining scoring quality at every tier.
 */

import { isoStandardsEnhanced, ISOClause, ISOStandard } from '../data/isoStandards';
import {
  complianceKeywordTaxonomy,
  compliancePhrases,
  commonAuditFindings,
  calculateConfidence,
} from '../data/complianceKnowledgeBase';

interface ClauseScoreResult {
  clauseId: string;
  clauseTitle: string;
  score: number;
  confidence: number;
  confidenceLevel: string;
  method: string;
  finding: string;
}

interface StandardScoringResult {
  standard: string;
  name: string;
  overallScore: number;
  maturityLevel: number;
  clauseScores: ClauseScoreResult[];
  scoringMethod: string;
  averageConfidence: number;
}

interface MLScoreResponse {
  results: Array<{
    clauseId: string;
    clauseTitle: string;
    score: number;
    confidence: string;
    method: string;
    semanticSimilarity: number;
    keywordMatchRatio: number;
  }>;
  aggregate: {
    averageScore: number;
    totalClauses: number;
  };
}

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

function getMaturityLevel(score: number): number {
  if (score >= 90) return 5;
  if (score >= 75) return 4;
  if (score >= 60) return 3;
  if (score >= 40) return 2;
  return 1;
}

// ─── Enhanced Finding Generator ──────────────────────────────────────────────

function generateDetailedFinding(
  clause: ISOClause,
  score: number,
  keywordHits: string[],
  standardCode: string,
): string {
  const auditFindings = commonAuditFindings.filter(
    af => af.standardCode === standardCode && af.clauseCategory === clause.category,
  );

  if (score >= 80) {
    const hitList = keywordHits.slice(0, 3).join(', ');
    return `Strong compliance evidence for ${clause.title} (${clause.id}). Document demonstrates ${hitList}${keywordHits.length > 3 ? ` and ${keywordHits.length - 3} additional indicators` : ''}. Implementation appears well-documented consistent with ${standardCode} requirements.`;
  }
  if (score >= 60) {
    const auditGap = auditFindings.length > 0 ? auditFindings[0].commonFindings[0] : `Strengthening recommended for ${clause.title}`;
    return `Partial compliance with ${clause.title} (${clause.id}). ${keywordHits.length} of expected compliance indicators found. Potential area for improvement: ${auditGap}.`;
  }
  if (score >= 30) {
    const gaps = auditFindings.length > 0
      ? auditFindings[0].commonFindings.slice(0, 2).join('; ')
      : `Limited implementation of ${clause.title} controls`;
    return `Limited compliance with ${clause.title} (${clause.id}). Only ${keywordHits.length} relevant indicators detected. Common findings in this area: ${gaps}. Remediation recommended.`;
  }
  const typicalGap = auditFindings.length > 0
    ? auditFindings[0].commonFindings[0]
    : `No evidence of ${clause.title} implementation`;
  return `Non-compliant with ${clause.title} (${clause.id}). Minimal evidence found. Typical audit finding: ${typicalGap}. Immediate action required to establish baseline controls per ${standardCode}.`;
}

// ─── Tier 1: ML Scoring ──────────────────────────────────────────────────────

async function scoreWithML(
  documentText: string,
  clauses: ISOClause[],
): Promise<ClauseScoreResult[] | null> {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/score-all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documentText: documentText.slice(0, 8000),
        clauses: clauses.map(c => ({
          id: c.id,
          title: c.title,
          description: c.description,
          guidance: c.guidance,
          keywords: c.keywords,
        })),
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) return null;

    const data = await response.json() as MLScoreResponse;
    return data.results.map(r => {
      const { score: confScore, level } = calculateConfidence('ml-semantic', r.keywordMatchRatio, 0);
      return {
        clauseId: r.clauseId,
        clauseTitle: r.clauseTitle,
        score: r.score,
        confidence: confScore,
        confidenceLevel: level,
        method: r.method,
        finding: generateDetailedFinding(
          clauses.find(c => c.id === r.clauseId) || clauses[0],
          r.score,
          [],
          '',
        ),
      };
    });
  } catch {
    return null;
  }
}

// ─── Tier 2: Groq AI Assessment ──────────────────────────────────────────────

async function enhanceWithGroq(
  documentText: string,
  standardCode: string,
  baseScores: ClauseScoreResult[],
): Promise<ClauseScoreResult[] | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  try {
    const Groq = (await import('groq-sdk')).default;
    const client = new Groq({ apiKey });

    const std = isoStandardsEnhanced[standardCode];
    const auditFindings = commonAuditFindings.filter(af => af.standardCode === standardCode);
    const commonIssues = auditFindings.flatMap(af => af.commonFindings.slice(0, 2)).slice(0, 4).join('; ');

    const prompt = `You are a certified ${standardCode} Lead Auditor performing a clause-by-clause compliance assessment with legal-grade rigor.

DOCUMENT (excerpt, ${documentText.length} chars total):
${documentText.slice(0, 6000)}

STANDARD: ${standardCode} — ${std?.fullName || standardCode}
CLAUSES: ${std?.clauses.length || 0} total

PRELIMINARY SCORES (from keyword/semantic analysis):
${baseScores.map(s => `${s.clauseId} (${s.clauseTitle}): ${s.score}% — ${s.finding}`).join('\n')}

KNOWN COMMON FINDINGS for ${standardCode}: ${commonIssues}

STRICT INSTRUCTIONS:
1. Refine each score based on ACTUAL document content — do not infer compliance from vague statements
2. Provide specific findings referencing what the document explicitly states or omits
3. Score 70-95 only if clause area is well-covered with mandatory language ("shall")
4. Score 40-69 if mentioned but vague, aspirational, or lacking formal documentation
5. Score 15-30 if absent or only superficially referenced
6. Typical first-time assessments average 45-65%. Do not inflate scores.
7. Un-evidenced mandatory requirements ("shall" in ISO) constitute non-conformities

Return ONLY valid JSON (no markdown):
{
  "clauseScores": [
    { "clauseId": "4.1", "score": 72, "finding": "Document addresses organizational context with PESTLE analysis reference. Stakeholder identification present but risk criteria not defined." }
  ]
}`;

    const response = await client.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      max_tokens: 4096,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.choices?.[0]?.message?.content || '';
    if (!text) return null;

    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, text];
    const parsed = JSON.parse(jsonMatch[1]?.trim() || '{}');

    if (parsed.clauseScores && Array.isArray(parsed.clauseScores)) {
      return baseScores.map(base => {
        const enhanced = parsed.clauseScores.find(
          (cs: { clauseId: string }) => cs.clauseId === base.clauseId,
        );
        if (enhanced) {
          const newScore = Math.max(0, Math.min(100, enhanced.score));
          const { score: confScore, level } = calculateConfidence('ml+groq', base.score / 100, 3);
          return {
            ...base,
            score: newScore,
            finding: enhanced.finding || base.finding,
            method: base.method === 'ml-semantic' ? 'ml+groq' : 'groq-enhanced',
            confidence: confScore,
            confidenceLevel: level,
          };
        }
        return base;
      });
    }

    return null;
  } catch {
    return null;
  }
}

// ─── Tier 3: Enhanced Keyword + NLP Scoring ──────────────────────────────────

function scoreWithEnhancedKeywords(
  documentText: string,
  clauses: ISOClause[],
  standardCode: string,
): ClauseScoreResult[] {
  const textLower = documentText.toLowerCase();
  const taxonomy = complianceKeywordTaxonomy[standardCode] || {};

  // Build a flat list of all taxonomy keywords for this standard
  const allTaxonomyKeywords: string[] = Object.values(taxonomy).flat() as string[];

  return clauses.map(clause => {
    // 1. Direct keyword matching from clause definition
    const keywordHits = clause.keywords.filter(kw => textLower.includes(kw.toLowerCase()));
    const keywordRatio = clause.keywords.length > 0 ? keywordHits.length / clause.keywords.length : 0;

    // 2. Extended taxonomy matching for the clause category
    const categoryKeywords = (taxonomy[
      clause.category === 'Context' ? 'contextAndRisk' :
      clause.category.toLowerCase()
    ] || []) as string[];
    const taxonomyHits = categoryKeywords.filter(kw => textLower.includes(kw.toLowerCase()));
    const taxonomyRatio = categoryKeywords.length > 0 ? taxonomyHits.length / categoryKeywords.length : 0;

    // 3. Compliance phrase pattern matching
    let phraseScore = 0;
    let phraseCount = 0;
    for (const phrase of compliancePhrases) {
      if (phrase.clauseCategories.includes('all') || phrase.clauseCategories.includes(clause.category)) {
        if (phrase.pattern.test(documentText)) {
          phraseScore += phrase.weight;
          phraseCount++;
        }
      }
    }

    // 4. Contextual proximity bonus — keywords near each other
    let proximityBonus = 0;
    if (keywordHits.length >= 2) {
      for (let i = 0; i < Math.min(keywordHits.length - 1, 5); i++) {
        const idx1 = textLower.indexOf(keywordHits[i].toLowerCase());
        const idx2 = textLower.indexOf(keywordHits[i + 1].toLowerCase());
        if (idx1 >= 0 && idx2 >= 0 && Math.abs(idx1 - idx2) < 300) {
          proximityBonus += 3;
        }
      }
    }
    proximityBonus = Math.min(proximityBonus, 12);

    // 5. Evidence example matching
    let evidenceBonus = 0;
    for (const example of clause.evidenceExamples) {
      const exampleWords = example.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      const matchingWords = exampleWords.filter(w => textLower.includes(w));
      if (matchingWords.length >= 2) {
        evidenceBonus += 4;
      }
    }
    evidenceBonus = Math.min(evidenceBonus, 15);

    // 6. Document volume bonus (more content = more coverage)
    const volumeBonus = Math.min(documentText.length / 15000, 5);

    // Composite score
    const rawScore =
      (keywordRatio * 40) +      // Primary keyword match
      (taxonomyRatio * 15) +     // Taxonomy coverage
      Math.min(phraseScore, 15) + // Compliance language
      proximityBonus +            // Context proximity
      evidenceBonus +             // Evidence example matches
      volumeBonus;                // Document volume

    const score = Math.max(0, Math.min(100, Math.round(rawScore)));
    
    const { score: confScore, level } = calculateConfidence('keyword+nlp', keywordRatio, phraseCount);
    const finding = generateDetailedFinding(clause, score, keywordHits, standardCode);

    return {
      clauseId: clause.id,
      clauseTitle: clause.title,
      score,
      confidence: confScore,
      confidenceLevel: level,
      method: 'keyword+nlp',
      finding,
    };
  });
}

// ─── Main Entry Point ────────────────────────────────────────────────────────

export async function scoreStandard(
  documentText: string,
  standardCode: string,
  onLog?: (msg: string) => void,
): Promise<StandardScoringResult> {
  const standard = isoStandardsEnhanced[standardCode];
  if (!standard) {
    throw new Error(`Unknown standard: ${standardCode}`);
  }

  onLog?.(`[HybridScoring] Scoring ${standardCode} (${standard.clauses.length} clauses)...`);

  let clauseScores: ClauseScoreResult[];
  let scoringMethod = 'keyword+nlp';

  // Try Tier 1: ML scoring
  onLog?.(`[HybridScoring] Attempting ML scoring via ${ML_SERVICE_URL}...`);
  const mlScores = await scoreWithML(documentText, standard.clauses);

  if (mlScores) {
    onLog?.(`[HybridScoring] ML scoring successful. Attempting Groq AI enhancement...`);
    scoringMethod = 'ml-semantic';

    const enhancedScores = await enhanceWithGroq(documentText, standardCode, mlScores);
    if (enhancedScores) {
      clauseScores = enhancedScores;
      scoringMethod = 'ml+groq';
      onLog?.(`[HybridScoring] ML + Groq AI assessment applied.`);
    } else {
      clauseScores = mlScores;
      onLog?.(`[HybridScoring] Using ML scores (Groq unavailable).`);
    }
  } else {
    onLog?.(`[HybridScoring] ML service unavailable. Using enhanced keyword+NLP scoring...`);

    // Enhanced keyword+NLP scoring (much better than simple keyword matching)
    const nlpScores = scoreWithEnhancedKeywords(documentText, standard.clauses, standardCode);

    // Try to enhance with Groq AI
    const groqEnhanced = await enhanceWithGroq(documentText, standardCode, nlpScores);

    if (groqEnhanced) {
      clauseScores = groqEnhanced;
      scoringMethod = 'groq-enhanced';
      onLog?.(`[HybridScoring] Groq-enhanced NLP scoring applied.`);
    } else {
      clauseScores = nlpScores;
      scoringMethod = 'keyword+nlp';
      onLog?.(`[HybridScoring] Using enhanced keyword+NLP scoring.`);
    }
  }

  const overallScore = Math.round(
    clauseScores.reduce((sum, cs) => sum + cs.score, 0) / clauseScores.length,
  );

  const averageConfidence = Math.round(
    clauseScores.reduce((sum, cs) => sum + cs.confidence, 0) / clauseScores.length,
  );

  onLog?.(`[HybridScoring] ${standardCode}: ${overallScore}% (method: ${scoringMethod}, confidence: ${averageConfidence}%)`);

  return {
    standard: standardCode,
    name: standard.fullName,
    overallScore,
    maturityLevel: getMaturityLevel(overallScore),
    clauseScores,
    scoringMethod,
    averageConfidence,
  };
}

export async function scoreAllStandards(
  documentText: string,
  standardCodes: string[],
  onLog?: (msg: string) => void,
): Promise<StandardScoringResult[]> {
  const results: StandardScoringResult[] = [];

  for (const code of standardCodes) {
    const result = await scoreStandard(documentText, code, onLog);
    results.push(result);
  }

  return results;
}

export async function checkMLServiceHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/health`, {
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
