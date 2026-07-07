import { Router, Request, Response } from 'express';

export const demoRouter = Router();

const demoResult = {
  id: 'demo-001',
  orgProfile: { company: 'Acme Corp Financial Services', industry: 'Financial Services', employees: '501-1000', scope: 'Global Operations' },
  overallScore: 62,
  maturityLevel: 3,
  timestamp: new Date().toISOString(),
  standardAssessments: [
    {
      standard: 'ISO37001', name: 'Anti-Bribery Management Systems', overallScore: 54, maturityLevel: 2,
      clauseScores: [
        { clauseId: '4.1', score: 65, finding: 'Context analysis exists but lacks depth' },
        { clauseId: '4.5', score: 35, finding: 'Bribery risk assessment incomplete' },
        { clauseId: '5.1', score: 72, finding: 'Leadership commitment documented' },
        { clauseId: '5.2', score: 60, finding: 'Anti-bribery policy needs wider communication' },
        { clauseId: '7.3', score: 45, finding: 'Training program insufficient' },
        { clauseId: '8.2', score: 30, finding: 'Due diligence procedures critically lacking' },
        { clauseId: '8.3', score: 35, finding: 'Financial controls need documentation' },
        { clauseId: '8.6', score: 40, finding: 'Whistleblowing channels underutilized' },
        { clauseId: '9.1', score: 55, finding: 'Monitoring exists but not systematic' },
        { clauseId: '9.2', score: 68, finding: 'Internal audit program functional' },
      ],
    },
    {
      standard: 'ISO37301', name: 'Compliance Management Systems', overallScore: 61, maturityLevel: 3,
      clauseScores: [
        { clauseId: '4.5', score: 40, finding: 'Compliance obligations register incomplete' },
        { clauseId: '4.6', score: 50, finding: 'Risk assessment methodology needs improvement' },
        { clauseId: '5.1', score: 75, finding: 'Strong board commitment to compliance' },
        { clauseId: '5.2', score: 68, finding: 'Compliance policy well-documented' },
        { clauseId: '7.2', score: 58, finding: 'Competence gaps in middle management' },
        { clauseId: '8.2', score: 55, finding: 'Controls partially effective' },
        { clauseId: '8.3', score: 62, finding: 'Reporting channels exist but underused' },
        { clauseId: '9.1', score: 65, finding: 'Monitoring metrics defined' },
      ],
    },
    {
      standard: 'ISO27001', name: 'Information Security Management', overallScore: 58, maturityLevel: 2,
      clauseScores: [
        { clauseId: '4.1', score: 60, finding: 'ISMS context partially defined' },
        { clauseId: '5.1', score: 70, finding: 'Management supports ISMS' },
        { clauseId: '6.1', score: 45, finding: 'Risk assessment process immature' },
        { clauseId: '7.2', score: 55, finding: 'Security training needed' },
        { clauseId: '8.2', score: 38, finding: 'Risk assessment not covering all assets' },
        { clauseId: '8.3', score: 35, finding: 'Risk treatment plan missing for key areas' },
        { clauseId: '9.1', score: 62, finding: 'Security metrics tracked' },
        { clauseId: '9.2', score: 70, finding: 'Security audits performed regularly' },
      ],
    },
    {
      standard: 'ISO9001', name: 'Quality Management Systems', overallScore: 74, maturityLevel: 3,
      clauseScores: [
        { clauseId: '4.4', score: 72, finding: 'QMS framework well-established' },
        { clauseId: '5.1', score: 82, finding: 'Strong quality leadership' },
        { clauseId: '5.2', score: 78, finding: 'Quality policy comprehensive' },
        { clauseId: '7.2', score: 70, finding: 'Good quality competence levels' },
        { clauseId: '8.1', score: 75, finding: 'Operational control effective' },
        { clauseId: '8.5', score: 68, finding: 'Service delivery well-managed' },
        { clauseId: '9.1', score: 72, finding: 'Performance monitoring active' },
        { clauseId: '10.2', score: 65, finding: 'Improvement processes maturing' },
      ],
    },
  ],
  gaps: [
    { id: 'GAP-001', title: 'Insufficient Due Diligence', severity: 'critical', standard: 'ISO37001', clauseRef: '8.2', impactScore: 9, effortScore: 7, description: 'Due diligence procedures for business associates critically lacking' },
    { id: 'GAP-002', title: 'Missing Risk Treatment Plan', severity: 'critical', standard: 'ISO27001', clauseRef: '8.3', impactScore: 9, effortScore: 6, description: 'No formal risk treatment plan for identified security risks' },
    { id: 'GAP-003', title: 'Incomplete Compliance Register', severity: 'critical', standard: 'ISO37301', clauseRef: '4.5', impactScore: 8, effortScore: 5, description: 'Compliance obligation register missing key regulatory requirements' },
    { id: 'GAP-004', title: 'Weak Financial Controls', severity: 'critical', standard: 'ISO37001', clauseRef: '8.3', impactScore: 8, effortScore: 7, description: 'Financial controls lack documentation and regular review' },
    { id: 'GAP-005', title: 'Inadequate Bribery Risk Assessment', severity: 'high', standard: 'ISO37001', clauseRef: '4.5', impactScore: 7, effortScore: 5, description: 'Bribery risk assessment not comprehensive or systematic' },
    { id: 'GAP-006', title: 'Security Risk Assessment Gaps', severity: 'high', standard: 'ISO27001', clauseRef: '8.2', impactScore: 7, effortScore: 6, description: 'Risk assessment not covering all information assets' },
    { id: 'GAP-007', title: 'Training Program Deficiency', severity: 'high', standard: 'ISO37001', clauseRef: '7.3', impactScore: 6, effortScore: 4, description: 'Anti-bribery training insufficient for high-risk positions' },
    { id: 'GAP-008', title: 'Whistleblowing Channel Gaps', severity: 'high', standard: 'ISO37001', clauseRef: '8.6', impactScore: 6, effortScore: 3, description: 'Whistleblowing channels exist but poorly communicated' },
    { id: 'GAP-009', title: 'Compliance Risk Method', severity: 'medium', standard: 'ISO37301', clauseRef: '4.6', impactScore: 5, effortScore: 4, description: 'Risk assessment methodology needs standardization' },
    { id: 'GAP-010', title: 'Management Competence', severity: 'medium', standard: 'ISO37301', clauseRef: '7.2', impactScore: 5, effortScore: 5, description: 'Middle management compliance competence gaps' },
    { id: 'GAP-011', title: 'Security Training', severity: 'medium', standard: 'ISO27001', clauseRef: '7.2', impactScore: 4, effortScore: 3, description: 'Information security awareness training needed' },
    { id: 'GAP-012', title: 'Quality Improvement', severity: 'low', standard: 'ISO9001', clauseRef: '10.2', impactScore: 3, effortScore: 3, description: 'Continual improvement process could be more structured' },
  ],
  remediationActions: [
    { id: 'REM-001', title: 'Implement Due Diligence Framework', description: 'Develop comprehensive third-party due diligence procedures', priority: 'critical', phase: 1, effortDays: 21, standard: 'ISO37001', responsible: 'Compliance' },
    { id: 'REM-002', title: 'Create Risk Treatment Plan', description: 'Develop formal information security risk treatment plan', priority: 'critical', phase: 1, effortDays: 14, standard: 'ISO27001', responsible: 'IT Security' },
    { id: 'REM-003', title: 'Complete Compliance Register', description: 'Build comprehensive compliance obligation register', priority: 'critical', phase: 1, effortDays: 10, standard: 'ISO37301', responsible: 'Legal' },
    { id: 'REM-004', title: 'Strengthen Financial Controls', description: 'Document and enhance financial control procedures', priority: 'critical', phase: 1, effortDays: 18, standard: 'ISO37001', responsible: 'Finance' },
    { id: 'REM-005', title: 'Enhance Risk Assessment', description: 'Implement systematic bribery risk assessment', priority: 'high', phase: 2, effortDays: 14, standard: 'ISO37001', responsible: 'Compliance' },
    { id: 'REM-006', title: 'Expand Security Risk Coverage', description: 'Extend risk assessment to all information assets', priority: 'high', phase: 2, effortDays: 12, standard: 'ISO27001', responsible: 'IT Security' },
    { id: 'REM-007', title: 'Launch Training Programs', description: 'Comprehensive anti-bribery and security training', priority: 'high', phase: 2, effortDays: 21, standard: 'ISO37001', responsible: 'HR' },
    { id: 'REM-008', title: 'Improve Whistleblowing Channels', description: 'Enhance and promote reporting mechanisms', priority: 'high', phase: 2, effortDays: 7, standard: 'ISO37001', responsible: 'Compliance' },
    { id: 'REM-009', title: 'Continuous Monitoring Framework', description: 'Establish cross-standard monitoring and metrics', priority: 'medium', phase: 3, effortDays: 28, standard: 'ISO37301', responsible: 'Compliance' },
  ],
};

demoRouter.get('/assessment', (_req: Request, res: Response) => {
  res.json(demoResult);
});
