import { Router, Request, Response } from 'express';
import { isoStandards } from '../data/standards';
import { isoStandardsEnhanced, getStandardSummary } from '../data/isoStandards';
import {
  allQuestionnaires,
  governanceStandards,
  getMandatoryQuestions,
  getQuestionsForStandard,
  legalFrameworkReferences,
  legalSeverityMatrix,
} from '../data/isoQuestionnaires';
import {
  commonAuditFindings,
  crossStandardMappings,
  industryBenchmarks,
  maturityModel,
} from '../data/complianceKnowledgeBase';
import { checkMLServiceHealth } from '../services/HybridScoringService';

export const standardsRouter = Router();

standardsRouter.get('/', (_req: Request, res: Response) => {
  const summary = getStandardSummary();
  res.json(summary);
});

standardsRouter.get('/library', (_req: Request, res: Response) => {
  const standards = Object.values(isoStandardsEnhanced).map((standard) => {
    const questions = getQuestionsForStandard(standard.code);
    const questionnaire = allQuestionnaires[standard.code];

    return {
      code: standard.code,
      name: standard.name,
      fullName: standard.fullName,
      version: standard.version,
      clauseCount: standard.clauses.length,
      questionnaireAvailable: !!questionnaire,
      totalQuestions: questions.length,
      mandatoryQuestions: getMandatoryQuestions(standard.code).length,
      categories: [...new Set(questions.map((question) => question.category))],
      clauseCategories: [...new Set(standard.clauses.map((clause) => clause.category))],
    };
  });

  const governance = Object.values(governanceStandards).map((standard) => ({
    code: standard.code,
    name: standard.name,
    scope: standard.scope,
    year: standard.year,
    totalQuestions: standard.auditQuestions.length,
    categories: [...new Set(standard.auditQuestions.map((question) => question.category))],
    keyPrinciples: standard.keyPrinciples,
  }));

  res.json({
    standards,
    governance,
  });
});

standardsRouter.get('/knowledge-base/overview', (req: Request, res: Response) => {
  const requestedIndustry = typeof req.query.industry === 'string' ? req.query.industry : 'Other';
  const industryBenchmark = industryBenchmarks[requestedIndustry] || industryBenchmarks.Other;

  res.json({
    industryBenchmark,
    maturityModel,
    legalFrameworkReferences,
    legalSeverityMatrix,
    commonAuditFindings,
    crossStandardMappings,
  });
});

standardsRouter.get('/:code/questionnaire', (req: Request, res: Response) => {
  const code = req.params.code as string;
  const questionnaire = allQuestionnaires[code];
  const governance = governanceStandards[code];

  if (questionnaire) {
    res.json({
      type: 'questionnaire',
      standardCode: questionnaire.standardCode,
      standardName: questionnaire.standardName,
      version: questionnaire.version,
      effectiveDate: questionnaire.effectiveDate,
      totalMandatoryRequirements: questionnaire.totalMandatoryRequirements,
      totalQuestions: questionnaire.questions.length,
      mandatoryQuestions: getMandatoryQuestions(code).length,
      categories: [...new Set(questionnaire.questions.map((question) => question.category))],
      questions: questionnaire.questions,
    });
    return;
  }

  if (governance) {
    res.json({
      type: 'governance',
      code: governance.code,
      name: governance.name,
      year: governance.year,
      scope: governance.scope,
      keyPrinciples: governance.keyPrinciples,
      totalQuestions: governance.auditQuestions.length,
      categories: [...new Set(governance.auditQuestions.map((question) => question.category))],
      questions: governance.auditQuestions,
    });
    return;
  }

  res.status(404).json({ error: `Questionnaire for ${code} not found` });
});

standardsRouter.get('/:code/clauses', (req: Request, res: Response) => {
  const code = req.params.code as string;
  const enhanced = isoStandardsEnhanced[code];

  if (enhanced) {
    res.json({
      code: enhanced.code,
      name: enhanced.name,
      fullName: enhanced.fullName,
      version: enhanced.version,
      clauses: enhanced.clauses,
    });
    return;
  }

  // Fallback to basic standards
  const standard = isoStandards[code as keyof typeof isoStandards];
  if (!standard) {
    res.status(404).json({ error: `Standard ${code} not found` });
    return;
  }

  res.json({
    code: standard.code,
    name: standard.name,
    fullName: standard.fullName,
    clauses: standard.clauses,
  });
});

standardsRouter.get('/health/ml', async (_req: Request, res: Response) => {
  const mlHealthy = await checkMLServiceHealth();
  const hasApiKey = !!process.env.GROQ_API_KEY;
  res.json({
    mlService: mlHealthy,
    groqApi: hasApiKey,
    scoringMode: mlHealthy && hasApiKey ? 'ml+groq' : mlHealthy ? 'ml-only' : hasApiKey ? 'groq-only' : 'keyword-fallback',
  });
});
