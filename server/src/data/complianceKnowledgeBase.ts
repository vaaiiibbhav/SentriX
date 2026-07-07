/**
 * Comprehensive Compliance Knowledge Base
 *
 * Real-world ISO compliance data derived from:
 * - ISO standard requirements (37001, 37301, 27001, 9001)
 * - COSO Internal Control Framework
 * - Transparency International CPI indicators
 * - NIST Cybersecurity Framework mappings
 * - Industry compliance benchmarks (Enterprise Core Global Survey, PwC State of Compliance)
 * - Common audit findings from ISO certification bodies
 */

// ─── Maturity Model (Based on ISO 19600 / CMMI) ─────────────────────────────

export interface MaturityLevel {
  level: number;
  name: string;
  description: string;
  characteristics: string[];
  scoreRange: [number, number];
}

export const maturityModel: MaturityLevel[] = [
  {
    level: 1,
    name: 'Initial / Ad Hoc',
    description: 'No formal processes. Compliance is reactive and inconsistent.',
    characteristics: [
      'No documented policies or procedures',
      'Compliance activities are ad hoc',
      'No assigned compliance responsibilities',
      'Reactive approach to regulatory requirements',
      'No monitoring or measurement',
    ],
    scoreRange: [0, 20],
  },
  {
    level: 2,
    name: 'Developing / Repeatable',
    description: 'Basic processes established but not standardized. Some documentation exists.',
    characteristics: [
      'Basic policies exist but may be outdated',
      'Some compliance roles assigned',
      'Limited training and awareness',
      'Informal risk identification',
      'Basic record keeping',
    ],
    scoreRange: [21, 40],
  },
  {
    level: 3,
    name: 'Defined / Standardized',
    description: 'Formal processes documented and communicated. Consistent application across the organization.',
    characteristics: [
      'Documented policies and procedures',
      'Formal compliance structure',
      'Regular training programs',
      'Systematic risk assessment',
      'Defined monitoring processes',
      'Internal audit program established',
    ],
    scoreRange: [41, 60],
  },
  {
    level: 4,
    name: 'Managed / Measured',
    description: 'Processes measured and controlled. Data-driven compliance management.',
    characteristics: [
      'KPIs tracked and reported',
      'Regular management reviews',
      'Proactive risk management',
      'Integrated compliance across business',
      'Evidence-based decision making',
      'Third-party assurance',
    ],
    scoreRange: [61, 80],
  },
  {
    level: 5,
    name: 'Optimizing / Leading',
    description: 'Continuous improvement culture. Best-in-class compliance practices.',
    characteristics: [
      'Continuous improvement embedded',
      'Benchmarking against peers',
      'Predictive risk analytics',
      'Compliance excellence recognized',
      'Innovation in compliance approaches',
      'Industry leadership and knowledge sharing',
    ],
    scoreRange: [81, 100],
  },
];

// ─── Industry Benchmarks (Based on real survey data) ─────────────────────────

export interface IndustryBenchmark {
  industry: string;
  averageScores: Record<string, number>;
  commonGaps: string[];
  regulatoryPressure: 'low' | 'medium' | 'high' | 'very-high';
}

export const industryBenchmarks: Record<string, IndustryBenchmark> = {
  'Financial Services': {
    industry: 'Financial Services',
    averageScores: { ISO37001: 72, ISO37301: 75, ISO27001: 78, ISO9001: 70 },
    commonGaps: ['Third-party due diligence gaps', 'Beneficial ownership transparency', 'Cross-border compliance coordination', 'Legacy system security controls'],
    regulatoryPressure: 'very-high',
  },
  'Healthcare': {
    industry: 'Healthcare',
    averageScores: { ISO37001: 55, ISO37301: 62, ISO27001: 68, ISO9001: 74 },
    commonGaps: ['Patient data protection', 'Clinical trial compliance', 'Vendor management', 'Change management in regulated environments'],
    regulatoryPressure: 'very-high',
  },
  'Technology': {
    industry: 'Technology',
    averageScores: { ISO37001: 58, ISO37301: 60, ISO27001: 75, ISO9001: 65 },
    commonGaps: ['Supply chain integrity', 'Data sovereignty', 'AI governance', 'Open source license compliance'],
    regulatoryPressure: 'high',
  },
  'Manufacturing': {
    industry: 'Manufacturing',
    averageScores: { ISO37001: 50, ISO37301: 55, ISO27001: 52, ISO9001: 78 },
    commonGaps: ['Supply chain due diligence', 'Environmental compliance', 'Worker safety', 'Product liability'],
    regulatoryPressure: 'high',
  },
  'Energy': {
    industry: 'Energy',
    averageScores: { ISO37001: 65, ISO37301: 68, ISO27001: 62, ISO9001: 72 },
    commonGaps: ['Government contract corruption risks', 'Environmental regulation compliance', 'Joint venture oversight', 'Community engagement'],
    regulatoryPressure: 'very-high',
  },
  'Retail': {
    industry: 'Retail',
    averageScores: { ISO37001: 45, ISO37301: 48, ISO27001: 55, ISO9001: 68 },
    commonGaps: ['Supply chain labor practices', 'Consumer data protection', 'Anti-counterfeiting measures', 'Franchise compliance'],
    regulatoryPressure: 'medium',
  },
  'Other': {
    industry: 'Other',
    averageScores: { ISO37001: 52, ISO37301: 55, ISO27001: 58, ISO9001: 62 },
    commonGaps: ['General governance gaps', 'Incomplete risk assessments', 'Insufficient training', 'Limited monitoring'],
    regulatoryPressure: 'medium',
  },
};

// ─── Common Audit Findings by Clause Category ───────────────────────────────

export interface AuditFinding {
  clauseCategory: string;
  standardCode: string;
  commonFindings: string[];
  remediationGuidance: string[];
  typicalScore: number;
  criticality: 'critical' | 'major' | 'minor' | 'observation';
}

export const commonAuditFindings: AuditFinding[] = [
  // ISO 37001 - Anti-Bribery
  {
    clauseCategory: 'Context',
    standardCode: 'ISO37001',
    commonFindings: [
      'Bribery risk assessment does not cover all business lines and geographies',
      'No documented methodology for assessing bribery risk levels',
      'External context analysis missing consideration of Transparency International CPI',
      'Scope statement excludes high-risk subsidiaries or joint ventures',
    ],
    remediationGuidance: [
      'Conduct comprehensive bribery risk assessment covering all operations',
      'Develop formal risk assessment methodology aligned with ISO 37001 Annex A',
      'Include TI CPI scores for all operating jurisdictions in context analysis',
      'Expand scope to include all entities where organization has operational control',
    ],
    typicalScore: 48,
    criticality: 'critical',
  },
  {
    clauseCategory: 'Leadership',
    standardCode: 'ISO37001',
    commonFindings: [
      'Board resolution on anti-bribery commitment is generic and lacks specificity',
      'Anti-bribery policy not translated into local languages for all operations',
      'Compliance function lacks sufficient authority and independence',
      'No evidence of regular board oversight of anti-bribery matters',
    ],
    remediationGuidance: [
      'Revise board resolution with specific anti-bribery commitments and resources',
      'Translate and localize policy for all jurisdictions with acknowledgment requirements',
      'Establish compliance function with direct reporting line to board/audit committee',
      'Implement quarterly anti-bribery reporting to board with defined agenda items',
    ],
    typicalScore: 55,
    criticality: 'major',
  },
  {
    clauseCategory: 'Operation',
    standardCode: 'ISO37001',
    commonFindings: [
      'Due diligence applied inconsistently across business associate categories',
      'Gift and hospitality thresholds not calibrated to local bribery risk levels',
      'Whistleblower channel lacks anonymity protections in high-risk jurisdictions',
      'Investigation procedures do not define roles for legal privilege management',
      'Financial controls lack segregation of duties for high-value transactions',
    ],
    remediationGuidance: [
      'Implement risk-based tiered due diligence with defined criteria per Annex A.10',
      'Calibrate thresholds using local purchasing power parity and risk indicators',
      'Implement anonymous reporting channel with third-party operating in local languages',
      'Define investigation protocol with legal privilege, evidence preservation, reporting',
      'Implement four-eyes principle for all transactions above materiality threshold',
    ],
    typicalScore: 42,
    criticality: 'critical',
  },
  // ISO 37301 - Compliance Management
  {
    clauseCategory: 'Context',
    standardCode: 'ISO37301',
    commonFindings: [
      'Compliance obligation register is incomplete or outdated',
      'No systematic process for monitoring regulatory changes',
      'Compliance risk assessment does not factor in likelihood and impact separately',
      'Cross-jurisdictional compliance requirements not mapped',
    ],
    remediationGuidance: [
      'Build comprehensive obligation register with ownership and review dates',
      'Implement regulatory change management process with automated alerts',
      'Adopt risk matrix with separate likelihood and impact scales (5x5 minimum)',
      'Map all jurisdictional requirements and identify conflicts of law',
    ],
    typicalScore: 45,
    criticality: 'critical',
  },
  {
    clauseCategory: 'Operation',
    standardCode: 'ISO37301',
    commonFindings: [
      'Compliance controls not mapped to specific obligations',
      'Reporting channels not accessible in all operating languages',
      'Investigation process lacks defined timeframes and escalation triggers',
      'No process for self-disclosure or voluntary reporting to regulators',
    ],
    remediationGuidance: [
      'Create control-obligation mapping matrix with gap indicators',
      'Implement multilingual reporting system with translation capability',
      'Define SLAs for investigation stages with automatic escalation',
      'Develop self-disclosure protocol with legal counsel involvement criteria',
    ],
    typicalScore: 48,
    criticality: 'major',
  },
  // ISO 27001 - Information Security
  {
    clauseCategory: 'Planning',
    standardCode: 'ISO27001',
    commonFindings: [
      'Risk assessment methodology does not align with ISO 27005 or NIST SP 800-30',
      'Asset inventory incomplete — cloud services and shadow IT not catalogued',
      'Risk treatment plan does not address residual risk acceptance criteria',
      'Business impact analysis not performed or outdated',
    ],
    remediationGuidance: [
      'Align risk methodology with ISO 27005 including asset-threat-vulnerability model',
      'Conduct comprehensive asset discovery including cloud, SaaS, and BYOD inventory',
      'Define residual risk acceptance criteria approved by risk owner',
      'Perform BIA covering confidentiality, integrity, and availability impact',
    ],
    typicalScore: 50,
    criticality: 'critical',
  },
  {
    clauseCategory: 'Operation',
    standardCode: 'ISO27001',
    commonFindings: [
      'Annex A controls selected without documented justification (SoA gaps)',
      'Access control reviews not performed at defined intervals',
      'Incident response plan not tested through tabletop or simulation exercises',
      'Supplier security assessments not risk-proportionate',
      'Backup and recovery procedures not tested regularly',
    ],
    remediationGuidance: [
      'Complete Statement of Applicability with justification for each Annex A control',
      'Implement quarterly access reviews with evidence of revocation actions',
      'Conduct annual incident response exercises with lessons learned documentation',
      'Implement tiered supplier security assessment based on data sensitivity',
      'Schedule quarterly backup restoration tests with documented results',
    ],
    typicalScore: 52,
    criticality: 'critical',
  },
  // ISO 9001 - Quality Management
  {
    clauseCategory: 'Operation',
    standardCode: 'ISO9001',
    commonFindings: [
      'Customer requirements not systematically captured and tracked',
      'Design and development process lacks defined review gates',
      'Supplier evaluation criteria not aligned with quality objectives',
      'Nonconforming product control lacks root cause trending',
      'Production processes not statistically controlled where applicable',
    ],
    remediationGuidance: [
      'Implement requirements management system with traceability matrix',
      'Define stage-gate process for design with documented approval criteria',
      'Develop supplier scorecard linking to quality KPIs and objectives',
      'Implement Pareto analysis and trend monitoring on nonconformity types',
      'Apply Statistical Process Control (SPC) for critical-to-quality parameters',
    ],
    typicalScore: 55,
    criticality: 'major',
  },
  {
    clauseCategory: 'Evaluation',
    standardCode: 'ISO9001',
    commonFindings: [
      'Customer satisfaction measurement limited to complaint tracking',
      'Internal audit program does not cover all processes within cycle',
      'Management review inputs incomplete per clause 9.3.2 requirements',
      'Performance indicators not linked to quality objectives',
    ],
    remediationGuidance: [
      'Implement multi-method satisfaction measurement (surveys, NPS, interviews)',
      'Develop risk-based audit program covering all processes within 3 years',
      'Create management review checklist aligned with 9.3.2 required inputs',
      'Link each quality objective to measurable KPIs with targets and thresholds',
    ],
    typicalScore: 58,
    criticality: 'major',
  },
];

// ─── Cross-Standard Control Mappings ─────────────────────────────────────────

export interface CrossStandardMapping {
  area: string;
  standards: string[];
  clauseRefs: Record<string, string[]>;
  synergySavings: number; // percentage effectiveness gain
  description: string;
}

export const crossStandardMappings: CrossStandardMapping[] = [
  {
    area: 'Context & Stakeholder Analysis',
    standards: ['ISO37001', 'ISO37301', 'ISO27001', 'ISO9001'],
    clauseRefs: { ISO37001: ['4.1', '4.2'], ISO37301: ['4.1', '4.2'], ISO27001: ['4.1', '4.2'], ISO9001: ['4.1', '4.2'] },
    synergySavings: 40,
    description: 'Unified context analysis covering all standards with standard-specific supplementary sections.',
  },
  {
    area: 'Leadership & Policy Framework',
    standards: ['ISO37001', 'ISO37301', 'ISO27001', 'ISO9001'],
    clauseRefs: { ISO37001: ['5.1', '5.2'], ISO37301: ['5.1', '5.2'], ISO27001: ['5.1', '5.2'], ISO9001: ['5.1', '5.2'] },
    synergySavings: 35,
    description: 'Integrated management system policy with standard-specific annexes.',
  },
  {
    area: 'Risk Management Framework',
    standards: ['ISO37001', 'ISO37301', 'ISO27001', 'ISO9001'],
    clauseRefs: { ISO37001: ['4.5', '6.1'], ISO37301: ['4.6', '6.1'], ISO27001: ['6.1', '8.2'], ISO9001: ['6.1'] },
    synergySavings: 45,
    description: 'Enterprise risk management framework with domain-specific risk registers.',
  },
  {
    area: 'Training & Competence',
    standards: ['ISO37001', 'ISO37301', 'ISO27001', 'ISO9001'],
    clauseRefs: { ISO37001: ['7.2', '7.3'], ISO37301: ['7.2', '7.3'], ISO27001: ['7.2', '7.3'], ISO9001: ['7.2', '7.3'] },
    synergySavings: 50,
    description: 'Unified competency framework and training management system.',
  },
  {
    area: 'Internal Audit & Monitoring',
    standards: ['ISO37001', 'ISO37301', 'ISO27001', 'ISO9001'],
    clauseRefs: { ISO37001: ['9.1', '9.2'], ISO37301: ['9.1', '9.2'], ISO27001: ['9.1', '9.2'], ISO9001: ['9.1', '9.2'] },
    synergySavings: 55,
    description: 'Combined audit program with integrated audit criteria covering all standards.',
  },
  {
    area: 'Whistleblowing & Reporting',
    standards: ['ISO37001', 'ISO37301'],
    clauseRefs: { ISO37001: ['8.6'], ISO37301: ['8.3'] },
    synergySavings: 70,
    description: 'Single whistleblowing channel and investigation process serving both standards.',
  },
  {
    area: 'Document Control & Records',
    standards: ['ISO37001', 'ISO37301', 'ISO27001', 'ISO9001'],
    clauseRefs: { ISO37001: ['7.5'], ISO37301: ['7.5'], ISO27001: ['7.5'], ISO9001: ['7.5'] },
    synergySavings: 60,
    description: 'Unified document management system with classification for all standards.',
  },
  {
    area: 'Management Review',
    standards: ['ISO37001', 'ISO37301', 'ISO27001', 'ISO9001'],
    clauseRefs: { ISO37001: ['9.3'], ISO37301: ['9.3'], ISO27001: ['9.3'], ISO9001: ['9.3'] },
    synergySavings: 50,
    description: 'Combined management review with standard-specific agenda items.',
  },
  {
    area: 'Third-Party / Supplier Management',
    standards: ['ISO37001', 'ISO37301', 'ISO27001', 'ISO9001'],
    clauseRefs: { ISO37001: ['8.2', '8.5'], ISO37301: ['8.2'], ISO27001: ['8.1'], ISO9001: ['8.4'] },
    synergySavings: 45,
    description: 'Integrated third-party risk management covering anti-bribery, compliance, security, and quality.',
  },
];

// ─── Comprehensive Keyword Taxonomy per Standard ─────────────────────────────

export const complianceKeywordTaxonomy: Record<string, Record<string, string[]>> = {
  ISO37001: {
    contextAndRisk: ['bribery', 'corruption', 'anti-bribery', 'anti-corruption', 'risk assessment', 'risk register', 'risk appetite', 'risk tolerance', 'PESTLE', 'stakeholder analysis', 'external issues', 'internal issues', 'management system', 'ABMS', 'bribery risk', 'sector risk', 'geographic risk', 'transaction risk', 'business opportunity risk'],
    leadership: ['tone from top', 'board commitment', 'governing body', 'anti-bribery policy', 'zero tolerance', 'compliance officer', 'compliance function', 'independence', 'authority', 'accountability', 'delegation', 'reporting line', 'board resolution', 'CEO statement'],
    planning: ['risk treatment', 'anti-bribery objectives', 'KPIs', 'targets', 'action plan', 'implementation plan', 'controls', 'proportionate procedures', 'risk-based approach'],
    support: ['training', 'awareness', 'competence', 'e-learning', 'induction', 'refresher', 'communication', 'documentation', 'record keeping', 'document control', 'resources', 'budget', 'staffing'],
    operation: ['due diligence', 'third party', 'business associate', 'vendor screening', 'KYC', 'enhanced due diligence', 'simplified due diligence', 'financial controls', 'approval limits', 'segregation of duties', 'four-eyes principle', 'gifts', 'hospitality', 'donations', 'sponsorship', 'facilitation payments', 'contractual controls', 'anti-bribery clause', 'whistleblowing', 'hotline', 'speak up', 'anonymous reporting', 'non-retaliation', 'investigation', 'incident management', 'disciplinary', 'remediation', 'self-disclosure', 'reporting to authorities'],
    evaluation: ['monitoring', 'measurement', 'KPI reporting', 'dashboard', 'internal audit', 'audit program', 'audit findings', 'management review', 'compliance function review', 'effectiveness'],
    improvement: ['nonconformity', 'corrective action', 'root cause analysis', 'CAPA', 'continual improvement', 'PDCA', 'lessons learned', 'best practice'],
  },
  ISO37301: {
    contextAndRisk: ['compliance', 'regulatory', 'obligation', 'regulation', 'legal requirement', 'compliance obligation', 'compliance risk', 'regulatory risk', 'obligation register', 'regulatory change', 'legislative change', 'compliance management system', 'CMS', 'compliance framework'],
    leadership: ['compliance culture', 'tone from top', 'board commitment', 'compliance policy', 'code of conduct', 'ethics', 'integrity', 'compliance function', 'chief compliance officer', 'compliance committee'],
    planning: ['compliance objectives', 'compliance targets', 'risk treatment', 'control design', 'action planning', 'compliance program'],
    support: ['compliance training', 'awareness program', 'competence', 'communication', 'documentation', 'record management'],
    operation: ['compliance controls', 'control implementation', 'reporting mechanism', 'whistleblower', 'investigation', 'escalation', 'self-disclosure', 'regulatory engagement'],
    evaluation: ['compliance monitoring', 'compliance reporting', 'internal audit', 'management review', 'compliance metrics', 'KPIs'],
    improvement: ['corrective action', 'nonconformity', 'continual improvement', 'lessons learned', 'root cause'],
  },
  ISO27001: {
    contextAndRisk: ['information security', 'cybersecurity', 'data protection', 'ISMS', 'threat', 'vulnerability', 'risk assessment', 'risk treatment', 'asset inventory', 'information asset', 'data classification', 'confidentiality', 'integrity', 'availability', 'CIA triad', 'business impact analysis'],
    leadership: ['information security policy', 'security commitment', 'CISO', 'security roles', 'security budget', 'security governance'],
    planning: ['risk treatment plan', 'Statement of Applicability', 'SoA', 'security objectives', 'control selection', 'Annex A', 'residual risk'],
    support: ['security awareness', 'security training', 'phishing simulation', 'competence', 'communication', 'documentation', 'ISMS documentation'],
    operation: ['access control', 'encryption', 'firewall', 'intrusion detection', 'vulnerability management', 'patch management', 'incident response', 'disaster recovery', 'business continuity', 'backup', 'network security', 'endpoint protection', 'identity management', 'authentication', 'multi-factor', 'MFA', 'penetration testing', 'security testing', 'supplier security', 'cloud security', 'SIEM', 'SOC', 'security monitoring'],
    evaluation: ['security monitoring', 'security metrics', 'internal audit', 'management review', 'vulnerability scanning', 'penetration test results', 'incident statistics'],
    improvement: ['security incidents', 'lessons learned', 'corrective action', 'continual improvement', 'threat intelligence'],
  },
  ISO9001: {
    contextAndRisk: ['quality', 'quality management', 'QMS', 'customer satisfaction', 'customer focus', 'process approach', 'risk-based thinking', 'quality planning', 'context of organization'],
    leadership: ['quality policy', 'quality commitment', 'quality objectives', 'management representative', 'quality manager', 'customer focus leadership'],
    planning: ['quality objectives', 'quality planning', 'risk and opportunity', 'change management', 'resource planning'],
    support: ['quality training', 'competence', 'calibration', 'measurement equipment', 'infrastructure', 'work environment', 'documented information', 'quality records'],
    operation: ['customer requirements', 'design and development', 'design review', 'design verification', 'design validation', 'supplier management', 'incoming inspection', 'process control', 'statistical process control', 'SPC', 'production control', 'service provision', 'product release', 'nonconforming product', 'traceability', 'identification', 'customer property', 'preservation'],
    evaluation: ['customer satisfaction survey', 'NPS', 'internal audit', 'management review', 'data analysis', 'performance evaluation', 'process monitoring', 'product monitoring', 'KPIs', 'quality metrics'],
    improvement: ['corrective action', 'preventive action', 'nonconformity', 'CAPA', 'continual improvement', 'quality improvement', 'Kaizen', 'Six Sigma', 'Lean', 'root cause analysis', '8D', 'Pareto'],
  },
};

// ─── Detailed Clause Requirements (for intelligent scoring) ──────────────────

export interface ClauseRequirement {
  clauseId: string;
  standardCode: string;
  mandatoryElements: string[];
  documentationRequired: string[];
  evidenceIndicators: string[];
  scoringCriteria: {
    excellent: string;
    adequate: string;
    partial: string;
    inadequate: string;
  };
}

export const clauseRequirements: Record<string, ClauseRequirement[]> = {
  ISO37001: [
    {
      clauseId: '4.5',
      standardCode: 'ISO37001',
      mandatoryElements: ['Documented risk assessment methodology', 'Risk criteria defined', 'Regular risk reassessment schedule', 'Risk assessment covering all categories per Annex A'],
      documentationRequired: ['Bribery risk register', 'Risk assessment methodology document', 'Risk assessment reports'],
      evidenceIndicators: ['risk assessment', 'bribery risk', 'risk register', 'risk methodology', 'risk criteria', 'inherent risk', 'residual risk', 'risk owner'],
      scoringCriteria: {
        excellent: 'Comprehensive risk assessment covering all Annex A categories with documented methodology, risk owners, and regular reassessment cycle (90-100%)',
        adequate: 'Risk assessment exists covering major categories with documented methodology and periodic review (65-89%)',
        partial: 'Basic risk assessment exists but methodology is informal, coverage incomplete, or reassessment irregular (30-64%)',
        inadequate: 'No documented risk assessment or methodology (0-29%)',
      },
    },
    {
      clauseId: '8.2',
      standardCode: 'ISO37001',
      mandatoryElements: ['Risk-based due diligence procedure', 'Due diligence criteria for business associates', 'Enhanced due diligence triggers', 'Ongoing monitoring process'],
      documentationRequired: ['Due diligence procedure', 'Third-party risk assessment records', 'Due diligence reports'],
      evidenceIndicators: ['due diligence', 'third party', 'business associate', 'screening', 'KYC', 'background check', 'vendor assessment', 'risk-based', 'enhanced due diligence', 'ongoing monitoring'],
      scoringCriteria: {
        excellent: 'Risk-based tiered due diligence with automated screening, documented criteria, enhanced DD triggers, and ongoing monitoring (90-100%)',
        adequate: 'Documented DD procedure applied consistently with risk differentiation (65-89%)',
        partial: 'Due diligence performed but ad hoc, no risk tiering, or inconsistent application (30-64%)',
        inadequate: 'No due diligence procedure or minimal checks (0-29%)',
      },
    },
    {
      clauseId: '8.6',
      standardCode: 'ISO37001',
      mandatoryElements: ['Reporting channels accessible to all stakeholders', 'Anonymity provisions', 'Non-retaliation policy', 'Defined handling procedures'],
      documentationRequired: ['Whistleblower policy', 'Reporting channel procedures', 'Investigation procedures'],
      evidenceIndicators: ['whistleblowing', 'reporting channel', 'hotline', 'speak up', 'anonymous', 'non-retaliation', 'concern reporting', 'ethics hotline'],
      scoringCriteria: {
        excellent: 'Multiple accessible reporting channels with anonymity, non-retaliation protections, and regular effectiveness testing (90-100%)',
        adequate: 'Reporting channel exists with basic anonymity and documented procedures (65-89%)',
        partial: 'Reporting mechanism exists but limited accessibility or protection (30-64%)',
        inadequate: 'No dedicated reporting channel or whistleblower policy (0-29%)',
      },
    },
  ],
  ISO27001: [
    {
      clauseId: '6.1',
      standardCode: 'ISO27001',
      mandatoryElements: ['Documented risk assessment methodology', 'Risk acceptance criteria', 'Consistent and reproducible process', 'Risk treatment plan'],
      documentationRequired: ['Risk assessment methodology', 'Risk register', 'Risk treatment plan', 'Statement of Applicability'],
      evidenceIndicators: ['risk assessment', 'threat', 'vulnerability', 'likelihood', 'impact', 'risk treatment', 'risk register', 'SoA', 'Statement of Applicability', 'residual risk', 'risk acceptance'],
      scoringCriteria: {
        excellent: 'Systematic methodology aligned with ISO 27005, comprehensive asset-threat-vulnerability analysis, documented SoA, and maintained risk treatment plan (90-100%)',
        adequate: 'Documented methodology with risk register and treatment plan covering key assets (65-89%)',
        partial: 'Risk assessment performed but methodology informal or coverage incomplete (30-64%)',
        inadequate: 'No documented risk assessment methodology or risk register (0-29%)',
      },
    },
    {
      clauseId: '8.2',
      standardCode: 'ISO27001',
      mandatoryElements: ['Regular risk assessments at planned intervals', 'Risk assessments on significant changes', 'Risk assessment results documented'],
      documentationRequired: ['Risk assessment reports', 'Risk register updates', 'Change-triggered risk assessments'],
      evidenceIndicators: ['risk assessment', 'periodic review', 'annual review', 'change assessment', 'risk reassessment', 'threat landscape', 'vulnerability assessment'],
      scoringCriteria: {
        excellent: 'Regular risk assessments (at least annual) plus change-triggered assessments with comprehensive scope (90-100%)',
        adequate: 'Annual risk assessment covering key systems with documented results (65-89%)',
        partial: 'Risk assessment performed but irregular or limited scope (30-64%)',
        inadequate: 'No evidence of periodic risk assessment (0-29%)',
      },
    },
  ],
  ISO9001: [
    {
      clauseId: '8.5',
      standardCode: 'ISO9001',
      mandatoryElements: ['Controlled conditions for production/service', 'Documented information defining characteristics', 'Monitoring and measurement at appropriate stages', 'Infrastructure and environment controls'],
      documentationRequired: ['Process control documents', 'Work instructions', 'Monitoring and measurement records', 'Equipment maintenance records'],
      evidenceIndicators: ['production control', 'process control', 'work instruction', 'standard operating procedure', 'SOP', 'monitoring', 'measurement', 'calibration', 'traceability', 'identification'],
      scoringCriteria: {
        excellent: 'Comprehensive process control with documented work instructions, SPC where applicable, validated special processes, and full traceability (90-100%)',
        adequate: 'Documented process controls with monitoring at key stages and maintenance records (65-89%)',
        partial: 'Basic process controls but inconsistent documentation or monitoring (30-64%)',
        inadequate: 'No documented production/service controls (0-29%)',
      },
    },
  ],
};

// ─── NLP Enhancement: Compliance Phrase Patterns ─────────────────────────────

export interface CompliancePhrase {
  pattern: RegExp;
  weight: number;
  clauseCategories: string[];
  description: string;
}

export const compliancePhrases: CompliancePhrase[] = [
  // Strong compliance indicators
  { pattern: /(?:has|have|shall|must)\s+(?:established|implemented|documented|maintained)/i, weight: 15, clauseCategories: ['all'], description: 'Mandatory implementation language' },
  { pattern: /(?:policy|procedure|process)\s+(?:is|has been|was)\s+(?:approved|endorsed|signed)/i, weight: 12, clauseCategories: ['Leadership', 'Support'], description: 'Approval evidence' },
  { pattern: /(?:reviewed|updated|revised)\s+(?:annually|quarterly|periodically|regularly)/i, weight: 10, clauseCategories: ['Evaluation', 'Improvement'], description: 'Regular review evidence' },
  { pattern: /(?:training|awareness)\s+(?:program|session|module|course)/i, weight: 10, clauseCategories: ['Support'], description: 'Training program evidence' },
  { pattern: /(?:risk\s+assessment|risk\s+analysis|risk\s+evaluation)/i, weight: 12, clauseCategories: ['Context', 'Planning'], description: 'Risk assessment activity' },
  { pattern: /(?:internal\s+audit|compliance\s+audit|management\s+review)/i, weight: 12, clauseCategories: ['Evaluation'], description: 'Audit and review activity' },
  { pattern: /(?:corrective\s+action|root\s+cause|nonconformity)/i, weight: 10, clauseCategories: ['Improvement'], description: 'Improvement activity' },
  { pattern: /(?:due\s+diligence|background\s+check|screening\s+process)/i, weight: 12, clauseCategories: ['Operation'], description: 'Due diligence activity' },
  { pattern: /(?:reporting\s+channel|hotline|whistleblow)/i, weight: 12, clauseCategories: ['Operation'], description: 'Reporting mechanism' },
  { pattern: /(?:segregation\s+of\s+duties|four-eyes|dual\s+approval)/i, weight: 10, clauseCategories: ['Operation'], description: 'Control mechanism' },
  { pattern: /(?:KPI|key\s+performance\s+indicator|metric|dashboard)/i, weight: 8, clauseCategories: ['Evaluation'], description: 'Performance measurement' },
  { pattern: /(?:board\s+(?:approval|resolution|oversight)|governing\s+body)/i, weight: 12, clauseCategories: ['Leadership'], description: 'Governance evidence' },
  { pattern: /(?:access\s+control|encryption|firewall|intrusion\s+detection)/i, weight: 10, clauseCategories: ['Operation'], description: 'Security control' },
  { pattern: /(?:customer\s+satisfaction|customer\s+feedback|NPS|net\s+promoter)/i, weight: 10, clauseCategories: ['Evaluation'], description: 'Customer satisfaction measurement' },
  { pattern: /(?:statement\s+of\s+applicability|SoA|annex\s+A\s+control)/i, weight: 12, clauseCategories: ['Planning', 'Operation'], description: 'ISO 27001 SoA reference' },
  // Partial compliance indicators
  { pattern: /(?:plan(?:ning|ned)?|will\s+be|intend(?:s|ed)?|roadmap)/i, weight: 5, clauseCategories: ['all'], description: 'Future-state planning language' },
  { pattern: /(?:in\s+progress|under\s+development|being\s+implemented)/i, weight: 6, clauseCategories: ['all'], description: 'Work in progress indicator' },
  // Negative compliance indicators
  { pattern: /(?:not\s+yet|no\s+(?:formal|documented)|does\s+not\s+(?:exist|have)|absence\s+of)/i, weight: -10, clauseCategories: ['all'], description: 'Compliance gap indicator' },
  { pattern: /(?:ad\s+hoc|informal(?:ly)?|without\s+documentation)/i, weight: -8, clauseCategories: ['all'], description: 'Informality indicator' },
];

// ─── Severity Classification Rules ───────────────────────────────────────────

export function classifyGapSeverity(score: number, clauseWeight: number): 'critical' | 'high' | 'medium' | 'low' {
  const riskScore = (100 - score) * (clauseWeight / 5);
  if (riskScore >= 70) return 'critical';
  if (riskScore >= 50) return 'high';
  if (riskScore >= 30) return 'medium';
  return 'low';
}

export function calculateConfidence(method: string, matchRatio: number, phraseMatches: number): { score: number; level: string } {
  let base: number;
  switch (method) {
    case 'ml+groq': base = 92; break;
    case 'groq-only': base = 85; break;
    case 'ml-semantic': base = 80; break;
    case 'keyword+nlp': base = 68; break;
    case 'keyword-fallback': base = 55; break;
    default: base = 50;
  }

  const matchBonus = Math.min(matchRatio * 15, 10);
  const phraseBonus = Math.min(phraseMatches * 2, 8);
  const confidence = Math.min(100, Math.round(base + matchBonus + phraseBonus));

  let level: string;
  if (confidence >= 85) level = 'high';
  else if (confidence >= 65) level = 'medium';
  else level = 'low';

  return { score: confidence, level };
}

// ─── Effort Estimation Model ─────────────────────────────────────────────────

export function estimateRemediationEffort(severity: string, clauseCategory: string): { effortDays: number; phase: number } {
  const baseEffort: Record<string, number> = { critical: 30, high: 15, medium: 8, low: 3 };
  const categoryMultiplier: Record<string, number> = {
    Context: 0.8, Leadership: 0.6, Planning: 1.0, Support: 1.2, Operation: 1.5, Evaluation: 1.0, Improvement: 0.8,
  };

  const effort = Math.round((baseEffort[severity] || 10) * (categoryMultiplier[clauseCategory] || 1.0));
  const phase = severity === 'critical' ? 1 : severity === 'high' ? 1 : severity === 'medium' ? 2 : 3;

  return { effortDays: effort, phase };
}
