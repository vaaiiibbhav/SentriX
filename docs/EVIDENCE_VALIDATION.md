# Evidence Validation Agent

## Overview

The **Evidence Validation Agent** is SentriX's novel 8th agent — an industry-first capability that validates whether the evidence cited for each compliance clause actually supports the compliance claim. While traditional compliance tools stop at scoring clauses against documents, SentriX goes further by analyzing the **quality, sufficiency, and traceability** of the evidence itself.

This addresses a critical gap in compliance assessment: organizations often cite vague or indirect evidence to satisfy clause requirements. The Evidence Validation Agent catches these issues before an auditor does.

## Position in Pipeline

The Evidence Validation Agent runs as **Step 4** in the 6-step orchestration pipeline, after Gap Analysis and before Remediation:

```
Document Agent → 4 Standard Agents → Gap Analysis → [Evidence Validation] → Remediation → Policy Generator
```

This positioning is intentional:
- It has access to all clause scores and evidence citations (from standard agents)
- It has gap analysis context (knows which clauses are already flagged as gaps)
- Its output informs the Remediation Agent (remediation can account for evidence deficiencies)

## What It Validates

### 1. Evidence Sufficiency
Each piece of cited evidence is classified:

| Rating | Meaning | Example |
|---|---|---|
| `sufficient` | Evidence fully supports the compliance claim | Documented policy with approval records |
| `partial` | Some evidence exists but doesn't fully cover requirements | Policy document exists but lacks implementation records |
| `insufficient` | Evidence is too weak or vague to support the claim | General mention without specific procedures |
| `missing` | No evidence found for this clause | Clause not addressed in any document |

### 2. Evidence Quality Level
The quality of evidence is categorized:

| Level | Meaning | Example |
|---|---|---|
| `direct` | Policy text directly addresses the clause | "Section 4.2: Anti-Bribery Risk Assessment Procedure" |
| `indirect` | Evidence can be inferred but isn't explicitly stated | Organizational chart implies governance structure |
| `anecdotal` | Informal or unverifiable evidence | Meeting notes mentioning a process |
| `none` | No evidence quality can be assessed | No relevant content found |

### 3. Quality Score
A numeric score (0-100) representing overall evidence quality for each clause, factoring in both sufficiency and quality level.

### 4. Chain of Custody
Verifies that evidence is traceable — can the auditor follow the evidence from the compliance claim back to the source document, section, and author?

### 5. Cross-Standard Evidence Reuse
Identifies where a single piece of evidence satisfies requirements across multiple ISO standards. For example, a risk assessment procedure might satisfy:
- ISO 37001 Clause 4.1 (Bribery risk context)
- ISO 27001 Clause 6.1 (Information security risk assessment)
- ISO 9001 Clause 6.1 (Quality risk assessment)

This is valuable because it reduces evidence collection effort and highlights organizational synergies.

## Input

The Evidence Validation Agent receives:

```
- All standard assessment results (clause scores + findings from 4 standard agents)
- Gap analysis results (identified gaps with severity)
- Organization profile (company, industry, employees, scope)
```

## Output Schema

### Per-Clause Evidence Item
```typescript
interface EvidenceValidationItem {
  id: string;                    // Unique identifier
  clauseId: string;              // e.g., "4.1"
  standardCode: string;          // e.g., "ISO37001"
  evidenceText: string;          // The cited evidence text
  validationResult: 'sufficient' | 'partial' | 'insufficient' | 'missing';
  qualityScore: number;          // 0-100
  qualityLevel: 'direct' | 'indirect' | 'anecdotal' | 'none';
  issues: string[];              // Specific problems found
  recommendation: string;        // What additional evidence is needed
  crossStandardReuse: string[];  // Other standards this evidence covers
}
```

### Aggregate Result
```typescript
interface EvidenceValidationResult {
  evidenceItems: EvidenceValidationItem[];
  overallEvidenceScore: number;       // Average quality score
  sufficientCount: number;            // Count of sufficient evidence
  partialCount: number;               // Count of partial evidence
  insufficientCount: number;          // Count of insufficient evidence
  missingCount: number;               // Count of missing evidence
  crossStandardOpportunities: number; // Number of cross-standard reuse opportunities
  summary: string;                    // Executive summary of evidence validation
}
```

## Frontend Presentation

The `EvidenceValidationPanel` component (in `client/src/components/reports/`) displays:

### 6-KPI Summary Row
1. Overall Evidence Score (0-100)
2. Sufficient Evidence Count
3. Partial Evidence Count
4. Insufficient Evidence Count
5. Missing Evidence Count
6. Cross-Standard Reuse Opportunities

### Filter Pills
Filter evidence items by validation result: All | Sufficient | Partial | Insufficient | Missing

### Expandable Evidence Rows
Each row shows:
- Clause ID and standard code
- Validation result badge (color-coded)
- Quality level badge
- Quality score bar
- Expand to see: evidence text, issues list, recommendation, cross-standard reuse tags

## OmniAgent Integration

The Evidence Validation Agent maps to the **Evidence Validation Engine** (`genw-evidence`) OmniAgent module:

| Property | Value |
|---|---|
| Module ID | `genw-evidence` |
| Module Name | Evidence Validation Engine |
| Capability | AI-powered evidence sufficiency analysis and chain-of-custody verification |
| Endpoint | `/api/genw/evidence-validation` |

In production, the OmniAgent Evidence Validation Engine would provide:
- Enterprise-grade chain-of-custody verification with digital signatures
- Historical evidence pattern analysis across organizations
- Automated evidence collection and linking from document management systems

## Why This Matters

| Problem | How Evidence Validation Solves It |
|---|---|
| Weak evidence goes unnoticed until audit | Proactively flags insufficient evidence |
| Manual evidence review is expensive | Automated AI-powered validation at scale |
| Cross-standard evidence not leveraged | Identifies reuse opportunities to reduce effort |
| No evidence quality standard | Consistent 4-level quality classification |
| Auditors question evidence traceability | Chain of custody verification |

## Code Reference

- **Agent prompt**: `server/src/agents/agentRunner.ts` → `buildEvidenceValidationPrompt()`
- **Orchestration**: `server/src/agents/orchestrator.ts` → Step 4
- **Types (backend)**: `server/src/agents/orchestrator.ts` → `EvidenceValidationItem`, `EvidenceValidationResult`
- **Types (frontend)**: `client/src/types/index.ts` → `EvidenceValidationItem`, `EvidenceValidation`
- **UI Component**: `client/src/components/reports/EvidenceValidationPanel.tsx`
- **OmniAgent Mapping**: `server/src/services/GenWAIBridge.ts` → `evidenceValidator` module
