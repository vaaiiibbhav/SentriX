/**
 * ISO Compliance Structured Questionnaires — Legal-Grade Assessment Framework
 *
 * These questionnaires translate ISO framework requirements into structured
 * audit-style questions that compliance agents use to assess organizations.
 *
 * Sources & References:
 * - ISO 37001:2016 Anti-bribery management systems — Requirements with guidance for use
 * - ISO 37301:2021 Compliance management systems — Requirements with guidance for use
 * - ISO 27001:2022 Information security, cybersecurity and privacy protection — ISMS
 * - ISO 9001:2015 Quality management systems — Requirements
 * - ISO 37000:2021 Governance of organizations — Guidance
 * - ISO 37002:2021 Whistleblowing management systems — Guidelines
 * - ISO 31000:2018 Risk management — Guidelines
 * - ISO 19600:2014 Compliance management systems — Guidelines (superseded by 37301)
 *
 * LEGAL NOTICE: Questions are derived from publicly available clause titles,
 * structure (Annex SL / Harmonized Structure), and requirements. This does not
 * reproduce copyrighted ISO normative text verbatim.
 *
 * Severity: MANDATORY = "shall" requirement, RECOMMENDED = "should" requirement
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export interface AuditQuestion {
  id: string;
  clauseRef: string;
  category: string;
  question: string;
  legalBasis: string;
  severity: 'mandatory' | 'recommended';
  evidenceRequired: string[];
  failureConsequence: string;
  scoringCriteria: {
    full: string;
    partial: string;
    nonCompliant: string;
  };
}

export interface StandardQuestionnaire {
  standardCode: string;
  standardName: string;
  version: string;
  effectiveDate: string;
  totalMandatoryRequirements: number;
  questions: AuditQuestion[];
}

export interface GovernanceStandard {
  code: string;
  name: string;
  year: number;
  scope: string;
  keyPrinciples: string[];
  auditQuestions: AuditQuestion[];
}

// ─── ISO 37001:2016 Anti-Bribery Management Systems ─────────────────────────

export const iso37001Questionnaire: StandardQuestionnaire = {
  standardCode: 'ISO37001',
  standardName: 'Anti-Bribery Management Systems',
  version: '2016',
  effectiveDate: '2016-10-15',
  totalMandatoryRequirements: 112,
  questions: [
    // Clause 4 — Context of the Organization
    {
      id: 'Q-37001-4.1-01',
      clauseRef: '4.1',
      category: 'Context',
      question: 'Has the organization determined external and internal issues that are relevant to its purpose and that affect its ability to achieve the intended outcome(s) of its anti-bribery management system?',
      legalBasis: 'ISO 37001:2016 Clause 4.1 — Understanding the organization and its context',
      severity: 'mandatory',
      evidenceRequired: [
        'Context analysis documentation (PESTLE, SWOT)',
        'Industry bribery risk profile assessment',
        'Jurisdictional legal environment analysis',
        'Board or senior management review of context factors',
      ],
      failureConsequence: 'Inability to scope the ABMS appropriately; risk of non-detection of bribery risks arising from operating environment.',
      scoringCriteria: {
        full: 'Documented context analysis covering all relevant factors, reviewed at defined intervals, with evidence of management input.',
        partial: 'Some context factors identified but analysis incomplete or not formally documented.',
        nonCompliant: 'No documented context analysis. Organization has not assessed its bribery-related operating environment.',
      },
    },
    {
      id: 'Q-37001-4.2-01',
      clauseRef: '4.2',
      category: 'Context',
      question: 'Has the organization identified the stakeholders relevant to its anti-bribery management system and their requirements, including legal and regulatory obligations to prevent bribery?',
      legalBasis: 'ISO 37001:2016 Clause 4.2 — Understanding the needs and expectations of stakeholders',
      severity: 'mandatory',
      evidenceRequired: [
        'Stakeholder register',
        'Legal and regulatory obligations register',
        'Contractual anti-bribery requirements log',
        'Records of stakeholder consultation',
      ],
      failureConsequence: 'Failure to address legal obligations; potential regulatory sanctions; inadequate anti-bribery controls for stakeholder expectations.',
      scoringCriteria: {
        full: 'Comprehensive stakeholder register with documented requirements; legal obligations mapped and monitored.',
        partial: 'Key stakeholders identified but requirements not fully documented or tracked.',
        nonCompliant: 'No systematic identification of stakeholders or their anti-bribery requirements.',
      },
    },
    {
      id: 'Q-37001-4.3-01',
      clauseRef: '4.3',
      category: 'Context',
      question: 'Has the organization determined the boundaries and applicability of its anti-bribery management system to establish its scope, considering its context analysis, stakeholder requirements, and the results of its bribery risk assessment?',
      legalBasis: 'ISO 37001:2016 Clause 4.3 — Determining the scope of the ABMS',
      severity: 'mandatory',
      evidenceRequired: [
        'ABMS scope statement',
        'Statement of applicability',
        'Justification for any exclusions',
        'Organizational boundary mapping',
      ],
      failureConsequence: 'Gaps in anti-bribery coverage; certification scope challenges; legal exposure in excluded areas.',
      scoringCriteria: {
        full: 'Clear, documented scope aligned with context and risk assessment; exclusions justified.',
        partial: 'Scope defined but not fully aligned with risk assessment or missing exclusion justifications.',
        nonCompliant: 'No documented ABMS scope statement.',
      },
    },
    {
      id: 'Q-37001-4.5-01',
      clauseRef: '4.5',
      category: 'Context',
      question: 'Has the organization performed a bribery risk assessment that identifies, analyzes, and evaluates bribery risks, considering the nature, scale, complexity, and locations of its operations?',
      legalBasis: 'ISO 37001:2016 Clause 4.5 — Bribery risk assessment',
      severity: 'mandatory',
      evidenceRequired: [
        'Bribery risk assessment methodology',
        'Risk register with likelihood and impact ratings',
        'Country/jurisdiction risk ratings',
        'Transaction and business relationship risk analysis',
        'Records of risk assessment review and update',
      ],
      failureConsequence: 'Critical deficiency: failure to assess bribery risk is a fundamental non-conformity. Organization cannot demonstrate adequate prevention measures.',
      scoringCriteria: {
        full: 'Comprehensive risk assessment covering all required factors; documented methodology; regular review cycle; management-approved.',
        partial: 'Risk assessment performed but incomplete in coverage or methodology.',
        nonCompliant: 'No bribery risk assessment performed or documented.',
      },
    },

    // Clause 5 — Leadership
    {
      id: 'Q-37001-5.1-01',
      clauseRef: '5.1',
      category: 'Leadership',
      question: 'Does top management demonstrate leadership and commitment with respect to the anti-bribery management system, including establishing an anti-bribery policy and ensuring the ABMS achieves its intended outcomes?',
      legalBasis: 'ISO 37001:2016 Clause 5.1 — Leadership and commitment',
      severity: 'mandatory',
      evidenceRequired: [
        'Board minutes evidencing ABMS oversight',
        'Management review records',
        'Resource allocation documentation',
        'Leadership communications on anti-bribery commitment',
      ],
      failureConsequence: 'Systemic failure: without top management commitment, the ABMS lacks authority and resources for effective implementation.',
      scoringCriteria: {
        full: 'Documented evidence of active leadership engagement: policy endorsement, resource allocation, performance reviews, communication.',
        partial: 'Policy exists but limited evidence of ongoing leadership engagement.',
        nonCompliant: 'No evidence of top management commitment to anti-bribery objectives.',
      },
    },
    {
      id: 'Q-37001-5.2-01',
      clauseRef: '5.2',
      category: 'Leadership',
      question: 'Has the organization established an anti-bribery policy that prohibits bribery, requires compliance with applicable anti-bribery laws, and is appropriate to the organization\'s purpose?',
      legalBasis: 'ISO 37001:2016 Clause 5.2 — Anti-bribery policy',
      severity: 'mandatory',
      evidenceRequired: [
        'Anti-bribery policy document',
        'Evidence of policy communication to all personnel',
        'Policy acknowledgment records',
        'Policy review and approval records',
      ],
      failureConsequence: 'Major non-conformity: absence of anti-bribery policy is a foundational failure. Organization has no formal commitment to bribery prevention.',
      scoringCriteria: {
        full: 'Policy meets all ISO 37001 Clause 5.2 requirements; communicated, acknowledged, and reviewed.',
        partial: 'Policy exists but missing some required elements or not fully communicated.',
        nonCompliant: 'No anti-bribery policy established.',
      },
    },
    {
      id: 'Q-37001-5.3-01',
      clauseRef: '5.3',
      category: 'Leadership',
      question: 'Has the organization assigned responsibility and authority for the anti-bribery management system, including appointment of a compliance function with appropriate authority and independence?',
      legalBasis: 'ISO 37001:2016 Clause 5.3 — Organizational roles, responsibilities and authorities',
      severity: 'mandatory',
      evidenceRequired: [
        'ABMS responsibility matrix (RACI)',
        'Compliance function appointment letter',
        'Independence and authority documentation',
        'Reporting lines to governing body',
      ],
      failureConsequence: 'Lack of clear accountability undermines ABMS effectiveness. Compliance function without independence cannot fulfill its mandate.',
      scoringCriteria: {
        full: 'Clear RACI matrix; compliance function appointed with documented independence and direct access to governing body.',
        partial: 'Roles assigned but compliance function independence not fully established.',
        nonCompliant: 'No formal assignment of ABMS responsibilities; no compliance function appointed.',
      },
    },

    // Clause 6 — Planning
    {
      id: 'Q-37001-6.1-01',
      clauseRef: '6.1',
      category: 'Planning',
      question: 'Has the organization determined actions to address bribery risks and opportunities identified in its risk assessment, with plans to implement and evaluate these actions?',
      legalBasis: 'ISO 37001:2016 Clause 6.1 — Actions to address risks and opportunities',
      severity: 'mandatory',
      evidenceRequired: [
        'Risk treatment plan',
        'Control selection justification',
        'Implementation timeline',
        'Effectiveness evaluation criteria',
      ],
      failureConsequence: 'Identified risks remain untreated; prevention controls may be inappropriate or insufficient.',
      scoringCriteria: {
        full: 'All identified risks have documented treatment plans with controls, timelines, and effectiveness criteria.',
        partial: 'Some risk treatment plans exist but not comprehensive.',
        nonCompliant: 'No documented plans to address identified bribery risks.',
      },
    },
    {
      id: 'Q-37001-6.2-01',
      clauseRef: '6.2',
      category: 'Planning',
      question: 'Has the organization established measurable anti-bribery objectives at relevant functions and levels, consistent with the anti-bribery policy?',
      legalBasis: 'ISO 37001:2016 Clause 6.2 — Anti-bribery objectives and planning to achieve them',
      severity: 'mandatory',
      evidenceRequired: [
        'Documented anti-bribery objectives',
        'KPIs and measurement criteria',
        'Responsible persons for each objective',
        'Target dates and review records',
      ],
      failureConsequence: 'Without measurable objectives, the organization cannot demonstrate improvement or measure ABMS effectiveness.',
      scoringCriteria: {
        full: 'SMART objectives established, with responsible parties, timelines, and regular measurement.',
        partial: 'Objectives exist but are not measurable or not fully deployed.',
        nonCompliant: 'No documented anti-bribery objectives.',
      },
    },

    // Clause 7 — Support
    {
      id: 'Q-37001-7.1-01',
      clauseRef: '7.1',
      category: 'Support',
      question: 'Has the organization determined and provided the resources needed for the establishment, implementation, maintenance, and continual improvement of the anti-bribery management system?',
      legalBasis: 'ISO 37001:2016 Clause 7.1 — Resources',
      severity: 'mandatory',
      evidenceRequired: [
        'ABMS budget allocation',
        'Staffing plan for compliance function',
        'Technology and tools provisioned',
        'External resource contracts (if applicable)',
      ],
      failureConsequence: 'Under-resourced ABMS cannot effectively prevent or detect bribery. Regulatory defense of "adequate procedures" may fail.',
      scoringCriteria: {
        full: 'Documented resource allocation with budget, staffing, and technology adequate for ABMS scope.',
        partial: 'Some resources allocated but gaps in staffing or budget.',
        nonCompliant: 'No dedicated resources for ABMS.',
      },
    },
    {
      id: 'Q-37001-7.2-01',
      clauseRef: '7.2',
      category: 'Support',
      question: 'Has the organization ensured that persons performing work under its control are competent on the basis of appropriate education, training, or experience, and are aware of bribery risks?',
      legalBasis: 'ISO 37001:2016 Clause 7.2 — Competence; Clause 7.3 — Awareness',
      severity: 'mandatory',
      evidenceRequired: [
        'Training needs assessment',
        'Anti-bribery training records',
        'Competency assessments',
        'Training completion rates',
        'Refresher training schedule',
      ],
      failureConsequence: 'Untrained personnel are bribery risk vectors. Organization cannot demonstrate "adequate procedures" defense without training program.',
      scoringCriteria: {
        full: 'Comprehensive training program with needs assessment, role-based content, completion tracking, and competency evaluation.',
        partial: 'Some training conducted but not role-based or lacking completion tracking.',
        nonCompliant: 'No anti-bribery training program in place.',
      },
    },

    // Clause 8 — Operation
    {
      id: 'Q-37001-8.1-01',
      clauseRef: '8.1',
      category: 'Operation',
      question: 'Has the organization planned, implemented, and controlled the processes needed to meet anti-bribery management system requirements, including establishing criteria for processes and implementing control of processes in accordance with the criteria?',
      legalBasis: 'ISO 37001:2016 Clause 8.1 — Operational planning and control',
      severity: 'mandatory',
      evidenceRequired: [
        'Process documentation for anti-bribery controls',
        'Operational procedures',
        'Process performance criteria',
        'Change management records',
      ],
      failureConsequence: 'Without operational controls, bribery prevention measures are ad hoc and inconsistent.',
      scoringCriteria: {
        full: 'Documented operational procedures with defined criteria, controls, and change management.',
        partial: 'Some procedures documented but gaps in coverage or criteria.',
        nonCompliant: 'No documented operational controls for anti-bribery processes.',
      },
    },
    {
      id: 'Q-37001-8.2-01',
      clauseRef: '8.2',
      category: 'Operation',
      question: 'Has the organization implemented due diligence procedures, proportionate to the bribery risk, for transactions, projects, activities, business associates, and personnel?',
      legalBasis: 'ISO 37001:2016 Clause 8.2 — Due diligence',
      severity: 'mandatory',
      evidenceRequired: [
        'Due diligence policy and procedures',
        'Risk-based due diligence criteria (enhanced/standard/simplified)',
        'Due diligence records and reports',
        'Third-party screening evidence',
        'Ongoing monitoring procedures',
      ],
      failureConsequence: 'Critical: Due diligence is a cornerstone of anti-bribery compliance. Failure constitutes willful blindness to bribery risk.',
      scoringCriteria: {
        full: 'Risk-proportionate due diligence with documented procedures, screening records, and ongoing monitoring.',
        partial: 'Due diligence conducted but not risk-proportionate or lacking documentation.',
        nonCompliant: 'No due diligence procedures implemented.',
      },
    },
    {
      id: 'Q-37001-8.3-01',
      clauseRef: '8.3',
      category: 'Operation',
      question: 'Has the organization implemented financial controls to manage bribery risk, including controls over payments, approvals, and segregation of duties?',
      legalBasis: 'ISO 37001:2016 Clause 8.3 — Financial controls',
      severity: 'mandatory',
      evidenceRequired: [
        'Financial control procedures',
        'Approval authority matrix',
        'Segregation of duties documentation',
        'Payment verification processes',
        'Exception and override logging',
      ],
      failureConsequence: 'Financial controls are the primary deterrent to bribery. Their absence facilitates corrupt payments.',
      scoringCriteria: {
        full: 'Comprehensive financial controls with approval matrices, segregation, and exception tracking.',
        partial: 'Some financial controls exist but not comprehensive or lacking segregation.',
        nonCompliant: 'No specific financial controls to prevent bribery.',
      },
    },
    {
      id: 'Q-37001-8.4-01',
      clauseRef: '8.4',
      category: 'Operation',
      question: 'Has the organization implemented controls over non-financial matters to manage bribery risk, including gifts, hospitality, entertainment, donations, and similar benefits?',
      legalBasis: 'ISO 37001:2016 Clause 8.4 — Non-financial controls',
      severity: 'mandatory',
      evidenceRequired: [
        'Gifts and hospitality policy with thresholds',
        'Gift register',
        'Pre-approval procedures',
        'Donations and sponsorship policy',
        'Facilitation payment prohibition records',
      ],
      failureConsequence: 'Uncontrolled gifts/hospitality are a primary bribery vector. Register failures enable concealment.',
      scoringCriteria: {
        full: 'Documented policies with thresholds, register, pre-approval process, and periodic review.',
        partial: 'Policy exists but lacks thresholds, register, or consistent enforcement.',
        nonCompliant: 'No gifts/hospitality/donations controls.',
      },
    },
    {
      id: 'Q-37001-8.6-01',
      clauseRef: '8.6',
      category: 'Operation',
      question: 'Has the organization established procedures to encourage and enable reporting of attempted, suspected, or actual bribery (whistleblowing) with protection from retaliation?',
      legalBasis: 'ISO 37001:2016 Clause 8.6 — Raising concerns',
      severity: 'mandatory',
      evidenceRequired: [
        'Whistleblowing policy',
        'Reporting channels documentation',
        'Anonymity and confidentiality protections',
        'Anti-retaliation policy',
        'Whistleblowing case records (anonymized)',
      ],
      failureConsequence: 'Without safe reporting channels, bribery goes undetected. Legal exposure under whistleblower protection laws.',
      scoringCriteria: {
        full: 'Multiple accessible channels with documented anonymity protections, anti-retaliation measures, and case management.',
        partial: 'Reporting mechanism exists but limited channels or weak protections.',
        nonCompliant: 'No whistleblowing mechanism established.',
      },
    },
    {
      id: 'Q-37001-8.7-01',
      clauseRef: '8.7',
      category: 'Operation',
      question: 'Has the organization implemented procedures for investigating reported or suspected bribery, including defined investigation protocols, preservation of evidence, and disciplinary procedures?',
      legalBasis: 'ISO 37001:2016 Clause 8.7 — Investigation and dealing with bribery',
      severity: 'mandatory',
      evidenceRequired: [
        'Investigation procedures manual',
        'Evidence preservation protocols',
        'Investigation report templates',
        'Disciplinary procedures linked to anti-bribery violations',
        'Escalation and referral to authorities procedures',
      ],
      failureConsequence: 'Inadequate investigation procedures may constitute obstruction. Failure to preserve evidence damages legal proceedings.',
      scoringCriteria: {
        full: 'Documented investigation procedures with evidence protocols, reporting templates, and escalation paths.',
        partial: 'Investigation process exists but informal or lacking evidence protocols.',
        nonCompliant: 'No investigation procedures for bribery matters.',
      },
    },

    // Clause 9 — Performance Evaluation
    {
      id: 'Q-37001-9.1-01',
      clauseRef: '9.1',
      category: 'Evaluation',
      question: 'Has the organization determined what needs to be monitored and measured regarding anti-bribery performance, including methods, timing, and reporting?',
      legalBasis: 'ISO 37001:2016 Clause 9.1 — Monitoring, measurement, analysis and evaluation',
      severity: 'mandatory',
      evidenceRequired: [
        'Anti-bribery KPIs and metrics',
        'Monitoring schedule',
        'Performance reports',
        'Trend analysis documentation',
      ],
      failureConsequence: 'Without monitoring, the organization cannot demonstrate ABMS effectiveness or identify failing controls.',
      scoringCriteria: {
        full: 'Defined KPIs, regular monitoring, documented analysis, and trend reporting.',
        partial: 'Some monitoring activities but not systematic or comprehensive.',
        nonCompliant: 'No performance monitoring for anti-bribery.',
      },
    },
    {
      id: 'Q-37001-9.2-01',
      clauseRef: '9.2',
      category: 'Evaluation',
      question: 'Has the organization conducted internal audits at planned intervals to assess whether the ABMS conforms to ISO 37001 requirements and is effectively implemented and maintained?',
      legalBasis: 'ISO 37001:2016 Clause 9.2 — Internal audit',
      severity: 'mandatory',
      evidenceRequired: [
        'Internal audit program and schedule',
        'Audit procedures',
        'Auditor independence and competence records',
        'Audit reports with findings',
        'Corrective action tracking',
      ],
      failureConsequence: 'Major non-conformity: internal audit is a mandatory requirement. Its absence demonstrates inadequate governance.',
      scoringCriteria: {
        full: 'Planned audit program with independent auditors, documented findings, and corrective action follow-up.',
        partial: 'Audits conducted but not per documented program or lacking follow-up.',
        nonCompliant: 'No internal audits of the ABMS conducted.',
      },
    },
    {
      id: 'Q-37001-9.3-01',
      clauseRef: '9.3',
      category: 'Evaluation',
      question: 'Has top management reviewed the ABMS at planned intervals to ensure its continuing suitability, adequacy, and effectiveness?',
      legalBasis: 'ISO 37001:2016 Clause 9.3 — Management review',
      severity: 'mandatory',
      evidenceRequired: [
        'Management review meeting minutes',
        'Review agenda covering required inputs',
        'Decision and action records',
        'Resource reallocation decisions',
      ],
      failureConsequence: 'Without management review, the ABMS stagnates. Top management cannot demonstrate ongoing commitment.',
      scoringCriteria: {
        full: 'Documented management reviews at planned intervals covering all required inputs with recorded decisions.',
        partial: 'Reviews conducted but not covering all required inputs or lacking action records.',
        nonCompliant: 'No management reviews conducted.',
      },
    },

    // Clause 10 — Improvement
    {
      id: 'Q-37001-10.1-01',
      clauseRef: '10.1',
      category: 'Improvement',
      question: 'Has the organization addressed nonconformities with corrective actions, including root cause analysis and actions to prevent recurrence?',
      legalBasis: 'ISO 37001:2016 Clause 10.1 — Nonconformity and corrective action',
      severity: 'mandatory',
      evidenceRequired: [
        'Nonconformity register',
        'Root cause analysis records',
        'Corrective action plans',
        'Effectiveness verification records',
      ],
      failureConsequence: 'Recurring nonconformities indicate systemic failure. Pattern of uncorrected issues damages certification.',
      scoringCriteria: {
        full: 'Systematic nonconformity management with root cause analysis, corrective actions, and effectiveness verification.',
        partial: 'Corrective actions taken but without systematic root cause analysis.',
        nonCompliant: 'No process for managing nonconformities.',
      },
    },
    {
      id: 'Q-37001-10.2-01',
      clauseRef: '10.2',
      category: 'Improvement',
      question: 'Does the organization continually improve the suitability, adequacy, and effectiveness of the anti-bribery management system?',
      legalBasis: 'ISO 37001:2016 Clause 10.2 — Continual improvement',
      severity: 'mandatory',
      evidenceRequired: [
        'Improvement initiative records',
        'Lesson learned documentation',
        'Benchmark comparisons',
        'Enhancement project documentation',
      ],
      failureConsequence: 'Stagnant ABMS fails to adapt to evolving bribery risks and regulatory landscape.',
      scoringCriteria: {
        full: 'Documented improvement initiatives based on audit findings, performance data, and external developments.',
        partial: 'Some improvements made but not systematically driven by data.',
        nonCompliant: 'No evidence of continual improvement activities.',
      },
    },
  ],
};

// ─── ISO 37301:2021 Compliance Management Systems ───────────────────────────

export const iso37301Questionnaire: StandardQuestionnaire = {
  standardCode: 'ISO37301',
  standardName: 'Compliance Management Systems',
  version: '2021',
  effectiveDate: '2021-04-13',
  totalMandatoryRequirements: 128,
  questions: [
    {
      id: 'Q-37301-4.1-01',
      clauseRef: '4.1',
      category: 'Context',
      question: 'Has the organization determined external and internal issues relevant to its purpose and that affect its ability to achieve the intended outcomes of its compliance management system (CMS)?',
      legalBasis: 'ISO 37301:2021 Clause 4.1 — Understanding the organization and its context',
      severity: 'mandatory',
      evidenceRequired: [
        'External/internal context analysis',
        'Regulatory environment mapping',
        'Industry-specific compliance landscape analysis',
        'Geopolitical and market risk assessment',
      ],
      failureConsequence: 'CMS may be misaligned with actual compliance obligations and risks.',
      scoringCriteria: {
        full: 'Comprehensive context analysis documented and regularly reviewed, covering regulatory, industry, and organizational factors.',
        partial: 'Context partially analyzed; some factors not considered.',
        nonCompliant: 'No context analysis performed.',
      },
    },
    {
      id: 'Q-37301-4.2-01',
      clauseRef: '4.2',
      category: 'Context',
      question: 'Has the organization identified the needs and expectations of interested parties relevant to its compliance management system, including compliance obligations?',
      legalBasis: 'ISO 37301:2021 Clause 4.2 — Understanding the needs and expectations of interested parties',
      severity: 'mandatory',
      evidenceRequired: [
        'Interested party register',
        'Compliance obligations register',
        'Regulatory body mapping',
        'Contractual obligations log',
      ],
      failureConsequence: 'Failure to identify obligations may result in legal violations and sanctions.',
      scoringCriteria: {
        full: 'All interested parties and their compliance requirements identified, documented, and monitored.',
        partial: 'Key parties identified but obligations not fully mapped.',
        nonCompliant: 'No systematic identification of interested parties or compliance obligations.',
      },
    },
    {
      id: 'Q-37301-4.5-01',
      clauseRef: '4.5',
      category: 'Context',
      question: 'Has the organization identified, analyzed, evaluated, and documented its compliance obligations from all applicable sources (statutory, regulatory, contractual, organizational)?',
      legalBasis: 'ISO 37301:2021 Clause 4.5 — Identification and evaluation of compliance obligations',
      severity: 'mandatory',
      evidenceRequired: [
        'Compliance obligations register (statute, regulation, contract, voluntary)',
        'Legal applicability assessment',
        'Obligation ownership assignment',
        'Change monitoring procedures for new/amended obligations',
      ],
      failureConsequence: 'Critical: Unidentified obligations cannot be satisfied. Organization faces legal exposure to unknown requirements.',
      scoringCriteria: {
        full: 'Comprehensive obligations register maintained with ownership, monitoring, and regular updates.',
        partial: 'Some obligations identified but register incomplete or not regularly updated.',
        nonCompliant: 'No compliance obligations register or systematic identification process.',
      },
    },
    {
      id: 'Q-37301-4.6-01',
      clauseRef: '4.6',
      category: 'Context',
      question: 'Has the organization assessed compliance risks by identifying, analyzing, and evaluating risks of non-compliance, including their likelihood and consequences?',
      legalBasis: 'ISO 37301:2021 Clause 4.6 — Compliance risk assessment',
      severity: 'mandatory',
      evidenceRequired: [
        'Compliance risk assessment methodology',
        'Risk register with likelihood/impact ratings',
        'Residual risk analysis',
        'Risk appetite/tolerance statement approved by governing body',
      ],
      failureConsequence: 'Without risk assessment, compliance resources cannot be prioritized and controls may be inadequate.',
      scoringCriteria: {
        full: 'Formal risk assessment with methodology, register, residual risk analysis, and governing body-approved risk appetite.',
        partial: 'Risk assessment conducted but methodology informal or risk appetite undefined.',
        nonCompliant: 'No compliance risk assessment performed.',
      },
    },

    // Clause 5 — Leadership
    {
      id: 'Q-37301-5.1-01',
      clauseRef: '5.1',
      category: 'Leadership',
      question: 'Does the governing body and top management demonstrate leadership and commitment to the CMS by establishing policy, ensuring integration into business processes, and promoting a compliance culture?',
      legalBasis: 'ISO 37301:2021 Clause 5.1 — Leadership and commitment',
      severity: 'mandatory',
      evidenceRequired: [
        'Governing body meeting minutes on compliance matters',
        'Compliance culture assessment results',
        'Tone from the top communications',
        'Performance objectives linked to compliance',
      ],
      failureConsequence: 'Systemic deficiency: without leadership commitment, compliance culture cannot be established.',
      scoringCriteria: {
        full: 'Active leadership with documented governance, culture initiatives, and integration into business objectives.',
        partial: 'Policy endorsed but limited evidence of active leadership engagement.',
        nonCompliant: 'No evidence of leadership commitment to compliance management.',
      },
    },
    {
      id: 'Q-37301-5.2-01',
      clauseRef: '5.2',
      category: 'Leadership',
      question: 'Has the organization established a compliance policy that includes commitment to satisfying compliance obligations, continual improvement, and providing a framework for compliance objectives?',
      legalBasis: 'ISO 37301:2021 Clause 5.2 — Compliance policy',
      severity: 'mandatory',
      evidenceRequired: [
        'Compliance policy document',
        'Policy communication records',
        'Policy acknowledgment by all relevant persons',
        'Policy review cycle documentation',
      ],
      failureConsequence: 'Major non-conformity. Policy is the foundation of CMS; its absence undermines all subsequent controls.',
      scoringCriteria: {
        full: 'Policy meets all requirements, is communicated, acknowledged, regularly reviewed, and accessible.',
        partial: 'Policy exists but is incomplete or not fully communicated.',
        nonCompliant: 'No compliance policy established.',
      },
    },
    {
      id: 'Q-37301-5.3-01',
      clauseRef: '5.3',
      category: 'Leadership',
      question: 'Has the organization assigned roles, responsibilities, and authorities for the CMS, including a compliance function with appropriate competence, status, authority, and independence?',
      legalBasis: 'ISO 37301:2021 Clause 5.3 — Organizational roles, responsibilities and authorities',
      severity: 'mandatory',
      evidenceRequired: [
        'Compliance function terms of reference',
        'Compliance officer job description and reporting lines',
        'Independence safeguards documentation',
        'RACI matrix for CMS activities',
      ],
      failureConsequence: 'Without an independent compliance function, conflicts of interest undermine the CMS.',
      scoringCriteria: {
        full: 'Compliance function established with documented independence, authority, direct reporting to governing body.',
        partial: 'Compliance roles assigned but independence or authority not fully established.',
        nonCompliant: 'No compliance function or role assignment.',
      },
    },

    // Clause 7 — Support
    {
      id: 'Q-37301-7.2-01',
      clauseRef: '7.2',
      category: 'Support',
      question: 'Has the organization ensured that all relevant persons are competent on the basis of education, training, or experience, with specific compliance training appropriate to their roles?',
      legalBasis: 'ISO 37301:2021 Clause 7.2 — Competence',
      severity: 'mandatory',
      evidenceRequired: [
        'Compliance training program documentation',
        'Role-based training matrix',
        'Training completion and competency records',
        'New employee induction compliance module',
      ],
      failureConsequence: 'Incompetent personnel create compliance risk; undermines defense of adequate procedures.',
      scoringCriteria: {
        full: 'Structured training program with role-based content, completion tracking, and competency assessment.',
        partial: 'Some training provided but not role-based or systematically tracked.',
        nonCompliant: 'No compliance training program.',
      },
    },

    // Clause 8 — Operation
    {
      id: 'Q-37301-8.2-01',
      clauseRef: '8.2',
      category: 'Operation',
      question: 'Has the organization implemented compliance controls to manage compliance obligations and risks, including processes, procedures, and practices?',
      legalBasis: 'ISO 37301:2021 Clause 8.2 — Establishing and implementing compliance controls',
      severity: 'mandatory',
      evidenceRequired: [
        'Compliance control register',
        'Control design and implementation evidence',
        'Control testing results',
        'Control owner assignments',
      ],
      failureConsequence: 'Without controls, compliance obligations cannot be met. Legal exposure to identified risks.',
      scoringCriteria: {
        full: 'Comprehensive compliance controls designed, implemented, tested, and owned.',
        partial: 'Some controls in place but not comprehensive or not tested.',
        nonCompliant: 'No compliance controls implemented.',
      },
    },
    {
      id: 'Q-37301-8.3-01',
      clauseRef: '8.3',
      category: 'Operation',
      question: 'Has the organization established processes for raising compliance concerns, including mechanisms for reporting without fear of retaliation?',
      legalBasis: 'ISO 37301:2021 Clause 8.3 — Raising concerns',
      severity: 'mandatory',
      evidenceRequired: [
        'Compliance concern reporting procedures',
        'Multiple reporting channels (hotline, email, in-person)',
        'Anti-retaliation protections',
        'Concern tracking and resolution records',
      ],
      failureConsequence: 'Suppressed reporting allows violations to continue. Potential liability under whistleblower protection legislation.',
      scoringCriteria: {
        full: 'Multiple accessible channels, documented anti-retaliation, case tracking, and resolution.',
        partial: 'Some channels exist but protections or tracking are inadequate.',
        nonCompliant: 'No concern-raising mechanism established.',
      },
    },

    // Clause 9 — Performance Evaluation
    {
      id: 'Q-37301-9.1-01',
      clauseRef: '9.1',
      category: 'Evaluation',
      question: 'Does the organization monitor, measure, analyze, and evaluate compliance performance, including the effectiveness of the CMS and compliance obligations fulfillment?',
      legalBasis: 'ISO 37301:2021 Clause 9.1 — Monitoring, measurement, analysis and evaluation',
      severity: 'mandatory',
      evidenceRequired: [
        'Compliance KPIs and metrics dashboard',
        'Monitoring schedule',
        'Compliance performance reports',
        'Trend and root cause analysis',
      ],
      failureConsequence: 'Without performance measurement, CMS effectiveness is unknown. Cannot demonstrate due diligence.',
      scoringCriteria: {
        full: 'Defined KPIs, regular monitoring, documented analysis, and trend reporting with management review.',
        partial: 'Some monitoring activities but not systematic or comprehensive.',
        nonCompliant: 'No compliance performance monitoring.',
      },
    },
    {
      id: 'Q-37301-9.2-01',
      clauseRef: '9.2',
      category: 'Evaluation',
      question: 'Has the organization conducted internal audits at planned intervals to assess whether the CMS conforms to requirements and is effectively implemented?',
      legalBasis: 'ISO 37301:2021 Clause 9.2 — Internal audit',
      severity: 'mandatory',
      evidenceRequired: [
        'Internal audit program',
        'Audit plan and schedule',
        'Auditor independence and competence evidence',
        'Audit reports and findings',
        'Corrective action follow-up records',
      ],
      failureConsequence: 'Major non-conformity. Internal audit is mandatory; its absence is a governance failure.',
      scoringCriteria: {
        full: 'Planned audit program with independent auditors, documented findings, and corrective action follow-up.',
        partial: 'Audits conducted but not following a planned program or lacking independence.',
        nonCompliant: 'No internal audits conducted.',
      },
    },

    // Clause 10 — Improvement
    {
      id: 'Q-37301-10.1-01',
      clauseRef: '10.1',
      category: 'Improvement',
      question: 'Does the organization systematically react to nonconformities and compliance failures, including taking corrective actions to eliminate root causes and prevent recurrence?',
      legalBasis: 'ISO 37301:2021 Clause 10.1 — Nonconformity and corrective action',
      severity: 'mandatory',
      evidenceRequired: [
        'Nonconformity/compliance failure register',
        'Root cause analysis records',
        'Corrective action plans with timelines',
        'Effectiveness reviews',
      ],
      failureConsequence: 'Recurring failures indicate CMS inadequacy. Pattern may constitute negligence.',
      scoringCriteria: {
        full: 'Systematic process for managing nonconformities with root cause analysis and verified corrective actions.',
        partial: 'Some corrective actions taken but without root cause analysis or verification.',
        nonCompliant: 'No process for managing compliance nonconformities.',
      },
    },
  ],
};

// ─── ISO 27001:2022 Information Security Management Systems ─────────────────

export const iso27001Questionnaire: StandardQuestionnaire = {
  standardCode: 'ISO27001',
  standardName: 'Information Security Management Systems',
  version: '2022',
  effectiveDate: '2022-10-25',
  totalMandatoryRequirements: 93,
  questions: [
    {
      id: 'Q-27001-4.1-01',
      clauseRef: '4.1',
      category: 'Context',
      question: 'Has the organization determined external and internal issues relevant to its purpose and that affect its ability to achieve the intended outcome(s) of its information security management system?',
      legalBasis: 'ISO 27001:2022 Clause 4.1 — Understanding the organization and its context',
      severity: 'mandatory',
      evidenceRequired: [
        'Context analysis (threat landscape, regulatory environment)',
        'Information asset inventory',
        'Business environment analysis',
        'Technology infrastructure assessment',
      ],
      failureConsequence: 'ISMS scope and controls may not address actual information security risks.',
      scoringCriteria: {
        full: 'Documented context analysis covering threats, regulations, assets, and business environment.',
        partial: 'Partial context analysis or outdated assessment.',
        nonCompliant: 'No context analysis performed for ISMS.',
      },
    },
    {
      id: 'Q-27001-4.3-01',
      clauseRef: '4.3',
      category: 'Context',
      question: 'Has the organization determined the boundaries and applicability of the ISMS to establish its scope, taking into account the external and internal issues, requirements of interested parties, and interfaces and dependencies?',
      legalBasis: 'ISO 27001:2022 Clause 4.3 — Determining the scope of the ISMS',
      severity: 'mandatory',
      evidenceRequired: [
        'ISMS scope statement',
        'Network diagrams and data flow maps',
        'Third-party interface documentation',
        'Scope exclusion justification',
      ],
      failureConsequence: 'Undefined scope means unprotected information assets. Certification invalid without clear scope.',
      scoringCriteria: {
        full: 'Scope documented with boundaries, interfaces, dependencies, and exclusion justification.',
        partial: 'Scope defined but boundaries not fully documented or justified.',
        nonCompliant: 'No documented ISMS scope.',
      },
    },
    {
      id: 'Q-27001-5.1-01',
      clauseRef: '5.1',
      category: 'Leadership',
      question: 'Does top management demonstrate leadership and commitment to the ISMS by ensuring policy and objectives are established, resources are available, and the ISMS achieves its intended outcomes?',
      legalBasis: 'ISO 27001:2022 Clause 5.1 — Leadership and commitment',
      severity: 'mandatory',
      evidenceRequired: [
        'Board/senior management meeting minutes on ISMS',
        'Resource allocation documentation',
        'Management communications on information security',
        'Integration evidence into business processes',
      ],
      failureConsequence: 'Systemic: ISMS without leadership commitment lacks authority and resources.',
      scoringCriteria: {
        full: 'Active leadership with policy endorsement, resource allocation, and regular governance.',
        partial: 'Policy endorsed but limited active engagement.',
        nonCompliant: 'No evidence of top management commitment.',
      },
    },
    {
      id: 'Q-27001-5.2-01',
      clauseRef: '5.2',
      category: 'Leadership',
      question: 'Has the organization established an information security policy appropriate to its purpose, including commitment to satisfying applicable requirements and continual improvement?',
      legalBasis: 'ISO 27001:2022 Clause 5.2 — Policy',
      severity: 'mandatory',
      evidenceRequired: [
        'Information security policy document',
        'Policy communication evidence',
        'Policy review and approval records',
        'Accessibility to all relevant persons',
      ],
      failureConsequence: 'Major non-conformity. Policy is mandatory foundation for ISMS.',
      scoringCriteria: {
        full: 'Policy meets all requirements, communicated, accessible, and regularly reviewed.',
        partial: 'Policy exists but incomplete or not fully communicated.',
        nonCompliant: 'No information security policy.',
      },
    },
    {
      id: 'Q-27001-6.1-01',
      clauseRef: '6.1',
      category: 'Planning',
      question: 'Has the organization defined and applied an information security risk assessment process that establishes risk criteria, ensures consistent and comparable results, identifies risks to confidentiality, integrity, and availability, and analyzes and evaluates those risks?',
      legalBasis: 'ISO 27001:2022 Clause 6.1.2 — Information security risk assessment',
      severity: 'mandatory',
      evidenceRequired: [
        'Risk assessment methodology document',
        'Risk criteria (acceptance, likelihood, impact scales)',
        'Risk register',
        'Risk assessment reports',
        'Risk owner assignments',
      ],
      failureConsequence: 'Critical: Risk assessment is the core of ISO 27001. Without it, control selection has no basis.',
      scoringCriteria: {
        full: 'Documented methodology, defined criteria, comprehensive register, risk owners assigned.',
        partial: 'Risk assessment exists but methodology incomplete or criteria unclear.',
        nonCompliant: 'No information security risk assessment process.',
      },
    },
    {
      id: 'Q-27001-6.1.3-01',
      clauseRef: '6.1.3',
      category: 'Planning',
      question: 'Has the organization defined and applied an information security risk treatment process, selected appropriate controls (referencing Annex A), and produced a Statement of Applicability?',
      legalBasis: 'ISO 27001:2022 Clause 6.1.3 — Information security risk treatment',
      severity: 'mandatory',
      evidenceRequired: [
        'Risk treatment plan',
        'Statement of Applicability (SoA)',
        'Control selection justification',
        'Residual risk acceptance records',
      ],
      failureConsequence: 'Critical: SoA is a mandatory document. Without risk treatment, identified risks remain unaddressed.',
      scoringCriteria: {
        full: 'SoA with all Annex A controls addressed, risk treatment plan with justifications, residual risk accepted by owners.',
        partial: 'Treatment plans exist but SoA incomplete or justifications lacking.',
        nonCompliant: 'No risk treatment process or SoA.',
      },
    },
    {
      id: 'Q-27001-8.1-01',
      clauseRef: '8.1',
      category: 'Operation',
      question: 'Has the organization planned, implemented, and controlled the processes needed to meet information security requirements and to implement the risk treatment plan?',
      legalBasis: 'ISO 27001:2022 Clause 8.1 — Operational planning and control',
      severity: 'mandatory',
      evidenceRequired: [
        'Operational security procedures',
        'Change management process',
        'Outsourced process controls',
        'Operational planning documentation',
      ],
      failureConsequence: 'Security controls may not be implemented as planned, leaving gaps in protection.',
      scoringCriteria: {
        full: 'Documented operational procedures aligned with risk treatment plan and change management.',
        partial: 'Some procedures documented but gaps in implementation.',
        nonCompliant: 'No operational planning or control for information security.',
      },
    },
    {
      id: 'Q-27001-8.2-01',
      clauseRef: '8.2',
      category: 'Operation',
      question: 'Has the organization performed information security risk assessments at planned intervals or when significant changes occur?',
      legalBasis: 'ISO 27001:2022 Clause 8.2 — Information security risk assessment',
      severity: 'mandatory',
      evidenceRequired: [
        'Risk assessment schedule',
        'Periodic risk assessment reports',
        'Change-triggered risk assessments',
        'Updated risk register',
      ],
      failureConsequence: 'Stale risk assessments fail to capture new threats and vulnerabilities.',
      scoringCriteria: {
        full: 'Risk assessments conducted per schedule and on significant change, with documented results.',
        partial: 'Some assessments done but not on schedule or change-triggered.',
        nonCompliant: 'No periodic risk assessments performed.',
      },
    },
    {
      id: 'Q-27001-9.1-01',
      clauseRef: '9.1',
      category: 'Evaluation',
      question: 'Has the organization determined what needs to be monitored and measured for information security performance and the effectiveness of the ISMS?',
      legalBasis: 'ISO 27001:2022 Clause 9.1 — Monitoring, measurement, analysis and evaluation',
      severity: 'mandatory',
      evidenceRequired: [
        'Security metrics and KPIs',
        'Monitoring tools and dashboards',
        'Performance reports',
        'Trend analysis documentation',
      ],
      failureConsequence: 'ISMS effectiveness unknown without monitoring. Cannot demonstrate continual improvement.',
      scoringCriteria: {
        full: 'Defined metrics, regular monitoring, documented analysis, and management reporting.',
        partial: 'Some monitoring but not systematic or comprehensive.',
        nonCompliant: 'No information security performance monitoring.',
      },
    },
    {
      id: 'Q-27001-9.2-01',
      clauseRef: '9.2',
      category: 'Evaluation',
      question: 'Has the organization conducted internal audits at planned intervals to verify the ISMS conforms to its own requirements and ISO 27001, and is effectively implemented and maintained?',
      legalBasis: 'ISO 27001:2022 Clause 9.2 — Internal audit',
      severity: 'mandatory',
      evidenceRequired: [
        'Internal audit program',
        'Audit plan and procedures',
        'Auditor competence and independence records',
        'Audit reports with findings',
        'Corrective action follow-up',
      ],
      failureConsequence: 'Major non-conformity. Internal audit is mandatory for certification.',
      scoringCriteria: {
        full: 'Comprehensive audit program with independent, competent auditors and corrective action tracking.',
        partial: 'Audits done but program informal or lacking independence.',
        nonCompliant: 'No internal audits of ISMS.',
      },
    },
    {
      id: 'Q-27001-10.2-01',
      clauseRef: '10.2',
      category: 'Improvement',
      question: 'Does the organization continually improve the suitability, adequacy, and effectiveness of the information security management system based on audit results, performance evaluation, and management review?',
      legalBasis: 'ISO 27001:2022 Clause 10.2 — Continual improvement',
      severity: 'mandatory',
      evidenceRequired: [
        'Improvement action register',
        'Data-driven improvement decisions',
        'Benchmark comparisons',
        'Enhancement initiatives documentation',
      ],
      failureConsequence: 'Static ISMS cannot adapt to evolving threat landscape.',
      scoringCriteria: {
        full: 'Documented improvement initiatives driven by data, audits, and management reviews.',
        partial: 'Some improvements but not systematically driven.',
        nonCompliant: 'No continual improvement evidence.',
      },
    },
  ],
};

// ─── ISO 9001:2015 Quality Management Systems ──────────────────────────────

export const iso9001Questionnaire: StandardQuestionnaire = {
  standardCode: 'ISO9001',
  standardName: 'Quality Management Systems',
  version: '2015',
  effectiveDate: '2015-09-23',
  totalMandatoryRequirements: 84,
  questions: [
    {
      id: 'Q-9001-4.1-01',
      clauseRef: '4.1',
      category: 'Context',
      question: 'Has the organization determined external and internal issues relevant to its purpose and strategic direction that affect its ability to achieve the intended outcomes of its quality management system?',
      legalBasis: 'ISO 9001:2015 Clause 4.1 — Understanding the organization and its context',
      severity: 'mandatory',
      evidenceRequired: [
        'Context analysis documentation',
        'Strategic planning documents referencing QMS',
        'Market and competitive analysis',
        'Internal capability assessment',
      ],
      failureConsequence: 'QMS may not be aligned with organizational strategy and business environment.',
      scoringCriteria: {
        full: 'Documented context analysis aligned with strategic direction and reviewed periodically.',
        partial: 'Some context factors identified but not formally documented or linked to QMS.',
        nonCompliant: 'No context analysis for QMS.',
      },
    },
    {
      id: 'Q-9001-4.4-01',
      clauseRef: '4.4',
      category: 'Context',
      question: 'Has the organization established, implemented, maintained, and continually improved a quality management system, including the processes needed and their interactions?',
      legalBasis: 'ISO 9001:2015 Clause 4.4 — Quality management system and its processes',
      severity: 'mandatory',
      evidenceRequired: [
        'Process map / interaction diagram',
        'Process documentation (inputs, outputs, sequence)',
        'Process performance indicators',
        'Process owners assignment',
      ],
      failureConsequence: 'Without process-based approach, QMS cannot ensure consistent quality.',
      scoringCriteria: {
        full: 'Documented process-based QMS with interactions, owners, inputs/outputs, and performance indicators.',
        partial: 'Some processes documented but interactions or performance criteria missing.',
        nonCompliant: 'No documented process-based QMS.',
      },
    },
    {
      id: 'Q-9001-5.1-01',
      clauseRef: '5.1',
      category: 'Leadership',
      question: 'Does top management demonstrate leadership and commitment with respect to the QMS by ensuring quality policy and objectives are established, ensuring integration of QMS requirements into business processes, and promoting the use of the process approach and risk-based thinking?',
      legalBasis: 'ISO 9001:2015 Clause 5.1.1 — General; Clause 5.1.2 — Customer focus',
      severity: 'mandatory',
      evidenceRequired: [
        'Management review minutes',
        'Quality policy endorsement',
        'Customer satisfaction analysis and action',
        'Business process integration evidence',
      ],
      failureConsequence: 'QMS without leadership commitment lacks authority and business alignment.',
      scoringCriteria: {
        full: 'Active leadership with customer focus, process approach promotion, and regular governance.',
        partial: 'Policy endorsed but limited ongoing engagement.',
        nonCompliant: 'No evidence of top management commitment to quality.',
      },
    },
    {
      id: 'Q-9001-6.1-01',
      clauseRef: '6.1',
      category: 'Planning',
      question: 'Has the organization determined risks and opportunities that need to be addressed to give assurance that the QMS can achieve its intended results, enhance desirable effects, prevent or reduce undesired effects, and achieve improvement?',
      legalBasis: 'ISO 9001:2015 Clause 6.1 — Actions to address risks and opportunities',
      severity: 'mandatory',
      evidenceRequired: [
        'Risk and opportunity register',
        'Risk assessment records',
        'Action plans for identified risks/opportunities',
        'Effectiveness evaluation of actions taken',
      ],
      failureConsequence: 'Unaddressed risks may lead to quality failures; missed opportunities reduce competitiveness.',
      scoringCriteria: {
        full: 'Documented risk/opportunity assessment with action plans and effectiveness evaluation.',
        partial: 'Some risks identified but action plans incomplete.',
        nonCompliant: 'No risk-based thinking applied to QMS planning.',
      },
    },
    {
      id: 'Q-9001-7.1-01',
      clauseRef: '7.1',
      category: 'Support',
      question: 'Has the organization determined and provided the resources needed for the establishment, implementation, maintenance, and continual improvement of the QMS, including people, infrastructure, environment, monitoring/measuring resources, and organizational knowledge?',
      legalBasis: 'ISO 9001:2015 Clause 7.1 — Resources (7.1.1 through 7.1.6)',
      severity: 'mandatory',
      evidenceRequired: [
        'Resource planning documents',
        'Infrastructure maintenance records',
        'Calibration records for measuring equipment',
        'Knowledge management processes',
      ],
      failureConsequence: 'Inadequate resources compromise quality of products and services.',
      scoringCriteria: {
        full: 'All resource categories addressed with documented planning, provision, and maintenance.',
        partial: 'Some resources addressed but gaps in categories.',
        nonCompliant: 'No systematic resource management for QMS.',
      },
    },
    {
      id: 'Q-9001-8.1-01',
      clauseRef: '8.1',
      category: 'Operation',
      question: 'Has the organization planned, implemented, and controlled the processes needed to meet the requirements for the provision of products and services, including establishing criteria and implementing control in accordance with the criteria?',
      legalBasis: 'ISO 9001:2015 Clause 8.1 — Operational planning and control',
      severity: 'mandatory',
      evidenceRequired: [
        'Operational procedures',
        'Process criteria documentation',
        'Control of changes records',
        'Outsourced process controls',
      ],
      failureConsequence: 'Uncontrolled operations lead to inconsistent product/service quality.',
      scoringCriteria: {
        full: 'Documented operational procedures with criteria, controls, and change management.',
        partial: 'Some procedures but gaps in criteria or change control.',
        nonCompliant: 'No operational planning and control.',
      },
    },
    {
      id: 'Q-9001-8.2-01',
      clauseRef: '8.2',
      category: 'Operation',
      question: 'Has the organization implemented arrangements for communicating with customers, including providing information about products and services, handling enquiries and orders, obtaining customer feedback, handling customer property, and establishing contingency actions?',
      legalBasis: 'ISO 9001:2015 Clause 8.2 — Requirements for products and services',
      severity: 'mandatory',
      evidenceRequired: [
        'Customer communication procedures',
        'Order processing records',
        'Customer feedback mechanisms',
        'Customer property handling procedures',
      ],
      failureConsequence: 'Customer requirements not properly understood or managed; quality failures.',
      scoringCriteria: {
        full: 'Systematic customer communication with feedback mechanisms and property handling.',
        partial: 'Some communication channels but not systematic.',
        nonCompliant: 'No formal customer communication arrangements.',
      },
    },
    {
      id: 'Q-9001-8.5-01',
      clauseRef: '8.5',
      category: 'Operation',
      question: 'Has the organization implemented production and service provision under controlled conditions, including the availability of documented information, the use of suitable infrastructure and process environment, the appointment of competent persons, and implementation of actions to prevent human error?',
      legalBasis: 'ISO 9001:2015 Clause 8.5 — Production and service provision',
      severity: 'mandatory',
      evidenceRequired: [
        'Production/service delivery procedures',
        'Work instructions',
        'Traceability records',
        'Post-delivery activities documentation',
        'Change control records',
      ],
      failureConsequence: 'Uncontrolled production leads to defects, customer complaints, and liability.',
      scoringCriteria: {
        full: 'Controlled conditions with documented procedures, traceability, and change management.',
        partial: 'Some controls in place but not comprehensive.',
        nonCompliant: 'No controlled conditions for production/service provision.',
      },
    },
    {
      id: 'Q-9001-9.1-01',
      clauseRef: '9.1',
      category: 'Evaluation',
      question: 'Has the organization determined what needs to be monitored and measured, the methods for monitoring and measurement, when results shall be analyzed and evaluated, and when monitoring and measuring shall be performed?',
      legalBasis: 'ISO 9001:2015 Clause 9.1 — Monitoring, measurement, analysis and evaluation',
      severity: 'mandatory',
      evidenceRequired: [
        'Quality metrics and KPIs',
        'Customer satisfaction measurement',
        'Process performance data',
        'Performance trend analysis',
      ],
      failureConsequence: 'QMS effectiveness unknown. Cannot demonstrate conformity or improvement.',
      scoringCriteria: {
        full: 'Defined metrics including customer satisfaction, regular monitoring, and trend analysis.',
        partial: 'Some monitoring but not systematic or missing customer satisfaction.',
        nonCompliant: 'No quality performance monitoring.',
      },
    },
    {
      id: 'Q-9001-9.2-01',
      clauseRef: '9.2',
      category: 'Evaluation',
      question: 'Has the organization conducted internal audits at planned intervals to provide information on whether the QMS conforms to requirements and is effectively implemented and maintained?',
      legalBasis: 'ISO 9001:2015 Clause 9.2 — Internal audit',
      severity: 'mandatory',
      evidenceRequired: [
        'Internal audit program',
        'Audit plan',
        'Auditor qualification records',
        'Audit reports',
        'Corrective action follow-up',
      ],
      failureConsequence: 'Major non-conformity. Internal audit is mandatory for QMS certification.',
      scoringCriteria: {
        full: 'Comprehensive audit program with qualified auditors, findings, and corrective actions.',
        partial: 'Audits done but program informal.',
        nonCompliant: 'No internal QMS audits.',
      },
    },
    {
      id: 'Q-9001-10.2-01',
      clauseRef: '10.2',
      category: 'Improvement',
      question: 'When a nonconformity occurs, does the organization react to the nonconformity, evaluate the need for action to eliminate the cause, implement any action needed, review the effectiveness of corrective action taken, and update risks and opportunities determined during planning if necessary?',
      legalBasis: 'ISO 9001:2015 Clause 10.2 — Nonconformity and corrective action',
      severity: 'mandatory',
      evidenceRequired: [
        'Nonconformity register',
        'Root cause analysis records',
        'Corrective action records',
        'Effectiveness review documentation',
      ],
      failureConsequence: 'Recurring quality issues, customer complaints, and potential product liability.',
      scoringCriteria: {
        full: 'Systematic nonconformity management with root cause analysis, corrective actions, and effectiveness verification.',
        partial: 'Some corrective actions but no root cause analysis or verification.',
        nonCompliant: 'No nonconformity management process.',
      },
    },
  ],
};

// ─── ISO 37000:2021 Governance of Organizations ─────────────────────────────

export const iso37000Governance: GovernanceStandard = {
  code: 'ISO37000',
  name: 'Governance of Organizations — Guidance',
  year: 2021,
  scope: 'Provides guidance on the governance of organizations, including principles and key aspects. Applicable to all organizations regardless of type, size, or purpose.',
  keyPrinciples: [
    'Purpose: Governance ensures the organization has a clear purpose and creates value for stakeholders',
    'Value generation: Focus on sustainable value creation for the organization and its stakeholders',
    'Strategy: Governance ensures strategy is set and monitored to fulfill the organization\'s purpose',
    'Oversight: The governing body oversees management and holds it accountable',
    'Accountability: Those who govern are accountable to stakeholders for their decisions and actions',
    'Stakeholder engagement: Governance considers and responds to stakeholder interests',
    'Societal responsibility: Governance ensures the organization acts responsibly toward society and the environment',
    'Risk governance: Governance ensures risks are managed in alignment with strategy and purpose',
    'Ethical conduct: Governance establishes and maintains an ethical culture',
    'Performance: Governance ensures the organization performs effectively and efficiently',
    'Transparency and disclosure: Governance ensures transparent and timely disclosure of information',
    'Human rights: Governance ensures respect for human rights throughout the organization\'s activities',
  ],
  auditQuestions: [
    {
      id: 'Q-37000-P1-01',
      clauseRef: 'Principle 1',
      category: 'Leadership',
      question: 'Has the governing body ensured the organization has established a clear and meaningful organizational purpose that defines the value it creates for stakeholders and society?',
      legalBasis: 'ISO 37000:2021 — Purpose principle; aligned with stakeholder theory and corporate governance codes',
      severity: 'recommended',
      evidenceRequired: [
        'Statement of organizational purpose',
        'Stakeholder value proposition',
        'Purpose integration into strategy',
        'Board-level purpose review records',
      ],
      failureConsequence: 'Organization lacks clear direction; governance decisions may not align with stakeholder expectations.',
      scoringCriteria: {
        full: 'Clear purpose statement, integrated into strategy, reviewed by governing body, communicated to stakeholders.',
        partial: 'Purpose exists but not formally documented or reviewed.',
        nonCompliant: 'No articulated organizational purpose.',
      },
    },
    {
      id: 'Q-37000-P5-01',
      clauseRef: 'Principle 5',
      category: 'Leadership',
      question: 'Does the governing body hold itself and management accountable for the organization\'s conduct, performance, and compliance, with clear mechanisms for accountability?',
      legalBasis: 'ISO 37000:2021 — Accountability principle; corporate governance best practice',
      severity: 'recommended',
      evidenceRequired: [
        'Governing body terms of reference',
        'Delegation of authority framework',
        'Performance evaluation of governing body',
        'Accountability reporting mechanisms',
      ],
      failureConsequence: 'Governance failures go unaddressed; stakeholder trust erodes.',
      scoringCriteria: {
        full: 'Clear accountability framework with delegation, performance evaluation, and reporting.',
        partial: 'Some accountability mechanisms but not comprehensive.',
        nonCompliant: 'No accountability framework for governance.',
      },
    },
    {
      id: 'Q-37000-P9-01',
      clauseRef: 'Principle 9',
      category: 'Leadership',
      question: 'Has the governing body established and maintained an ethical culture that promotes integrity, transparency, and ethical behavior throughout the organization?',
      legalBasis: 'ISO 37000:2021 — Ethical conduct principle; aligned with ISO 37001, 37301, and corporate integrity standards',
      severity: 'recommended',
      evidenceRequired: [
        'Code of ethics/conduct',
        'Ethics committee or function',
        'Ethics training program',
        'Ethical culture assessment results',
        'Speak-up/whistleblowing mechanism',
      ],
      failureConsequence: 'Ethical failures, reputational damage, and potential legal liability.',
      scoringCriteria: {
        full: 'Comprehensive ethics framework with code, committee, training, culture assessment, and speak-up channels.',
        partial: 'Code of ethics exists but ethics management not systematic.',
        nonCompliant: 'No formal ethical conduct framework.',
      },
    },
    {
      id: 'Q-37000-P8-01',
      clauseRef: 'Principle 8',
      category: 'Planning',
      question: 'Does the governing body ensure that risk governance is integrated into strategy setting and performance management, with clear risk appetite, tolerance, and oversight?',
      legalBasis: 'ISO 37000:2021 — Risk governance principle; aligned with ISO 31000:2018',
      severity: 'recommended',
      evidenceRequired: [
        'Risk governance framework',
        'Risk appetite statement',
        'Risk committee terms of reference',
        'Integration of risk into strategic planning',
        'Risk reporting to governing body',
      ],
      failureConsequence: 'Strategic decisions made without proper risk consideration; governance oversight gaps.',
      scoringCriteria: {
        full: 'Integrated risk governance with appetite statement, committee, and strategic integration.',
        partial: 'Risk management exists but not integrated into governance framework.',
        nonCompliant: 'No risk governance framework.',
      },
    },
    {
      id: 'Q-37000-P11-01',
      clauseRef: 'Principle 11',
      category: 'Evaluation',
      question: 'Does the governing body ensure transparent and timely disclosure of material information about the organization\'s governance, strategy, performance, and outlook to stakeholders?',
      legalBasis: 'ISO 37000:2021 — Transparency and disclosure principle',
      severity: 'recommended',
      evidenceRequired: [
        'Disclosure policy',
        'Annual governance report',
        'Stakeholder communication records',
        'Transparency assessment',
      ],
      failureConsequence: 'Stakeholder trust undermined; potential regulatory non-compliance for mandatory disclosures.',
      scoringCriteria: {
        full: 'Documented disclosure policy with regular, transparent reporting to stakeholders.',
        partial: 'Some disclosures made but not comprehensive or timely.',
        nonCompliant: 'No systematic disclosure or transparency practices.',
      },
    },
  ],
};

// ─── ISO 37002:2021 Whistleblowing Management Systems ──────────────────────

export const iso37002Whistleblowing: GovernanceStandard = {
  code: 'ISO37002',
  name: 'Whistleblowing Management Systems — Guidelines',
  year: 2021,
  scope: 'Provides guidelines for establishing, implementing, maintaining, and improving a whistleblowing management system based on trust, impartiality, and protection.',
  keyPrinciples: [
    'Trust: The system builds and maintains trust at all levels of the organization',
    'Impartiality: Reports are assessed and investigated objectively and without bias',
    'Protection: Whistleblowers are protected from retaliation, detriment, and victimization',
    'Accessibility: The system is accessible to all persons who may need to report wrongdoing',
    'Confidentiality: The identity of whistleblowers and the information they provide is protected',
    'Responsiveness: Reports are acknowledged and handled in a timely manner',
    'Anonymity: Anonymous reports are accepted and investigated where permitted by law',
  ],
  auditQuestions: [
    {
      id: 'Q-37002-5.1-01',
      clauseRef: '5.1',
      category: 'Leadership',
      question: 'Has the organization established a whistleblowing policy endorsed by the governing body that prohibits retaliation and commits to protecting whistleblowers?',
      legalBasis: 'ISO 37002:2021 Clause 5 — Leadership; aligned with EU Directive 2019/1937, SOX, and Dodd-Frank whistleblower protections',
      severity: 'recommended',
      evidenceRequired: [
        'Whistleblowing policy document',
        'Governing body endorsement records',
        'Anti-retaliation commitment',
        'Policy accessibility and communication records',
      ],
      failureConsequence: 'Whistleblowers deterred from reporting; organization misses critical intelligence on wrongdoing.',
      scoringCriteria: {
        full: 'Comprehensive policy with governing body endorsement, anti-retaliation provisions, and wide communication.',
        partial: 'Policy exists but lacks some elements or not widely communicated.',
        nonCompliant: 'No whistleblowing policy.',
      },
    },
    {
      id: 'Q-37002-7.1-01',
      clauseRef: '7.1',
      category: 'Operation',
      question: 'Has the organization established multiple accessible and secure reporting channels that allow confidential and/or anonymous reporting of wrongdoing?',
      legalBasis: 'ISO 37002:2021 Clause 7 — Receiving reports of wrongdoing',
      severity: 'recommended',
      evidenceRequired: [
        'List of reporting channels (hotline, web portal, physical, email)',
        'Channel accessibility assessment',
        'Anonymity and confidentiality mechanisms',
        'Channel testing and availability records',
      ],
      failureConsequence: 'Inaccessible channels prevent reporting; legal non-compliance with mandatory channel requirements.',
      scoringCriteria: {
        full: 'Multiple secure channels with anonymity, confidentiality, and regular testing.',
        partial: 'Channels exist but limited in number or lacking security features.',
        nonCompliant: 'No dedicated reporting channels.',
      },
    },
    {
      id: 'Q-37002-8.1-01',
      clauseRef: '8.1',
      category: 'Operation',
      question: 'Has the organization established processes for assessing, triaging, and investigating reports of wrongdoing using impartial and competent persons, with documented investigation protocols?',
      legalBasis: 'ISO 37002:2021 Clause 8 — Assessing reports of wrongdoing',
      severity: 'recommended',
      evidenceRequired: [
        'Triage and assessment procedures',
        'Investigation protocol',
        'Investigator independence and competence records',
        'Case management documentation',
        'Evidence handling procedures',
      ],
      failureConsequence: 'Reports mishandled; investigations compromised; potential obstruction of justice.',
      scoringCriteria: {
        full: 'Documented triage, assessment, and investigation processes with independent investigators.',
        partial: 'Investigation processes exist but informal or lacking independence.',
        nonCompliant: 'No structured investigation process.',
      },
    },
    {
      id: 'Q-37002-9.1-01',
      clauseRef: '9.1',
      category: 'Operation',
      question: 'Has the organization implemented measures to protect whistleblowers from retaliation, detriment, or discriminatory treatment, and does it actively monitor for retaliation?',
      legalBasis: 'ISO 37002:2021 Clause 9 — Addressing reports of wrongdoing; EU Directive 2019/1937 Art. 19-21',
      severity: 'recommended',
      evidenceRequired: [
        'Anti-retaliation measures documentation',
        'Retaliation monitoring procedures',
        'Support services for whistleblowers',
        'Retaliation incident records (if any)',
      ],
      failureConsequence: 'Retaliation deters future reporting; legal liability under whistleblower protection laws.',
      scoringCriteria: {
        full: 'Active anti-retaliation measures with monitoring, support services, and incident tracking.',
        partial: 'Anti-retaliation policy exists but no active monitoring.',
        nonCompliant: 'No anti-retaliation measures.',
      },
    },
    {
      id: 'Q-37002-10.1-01',
      clauseRef: '10.1',
      category: 'Evaluation',
      question: 'Does the organization monitor and evaluate the effectiveness of the whistleblowing management system, including analyzing trends, response times, and whistleblower satisfaction?',
      legalBasis: 'ISO 37002:2021 Clause 10 — Closing reports of wrongdoing',
      severity: 'recommended',
      evidenceRequired: [
        'Whistleblowing system metrics',
        'Response time tracking',
        'Trend analysis reports',
        'System effectiveness evaluation',
        'Lessons learned documentation',
      ],
      failureConsequence: 'System may deteriorate without evaluation; missed patterns of wrongdoing.',
      scoringCriteria: {
        full: 'Comprehensive evaluation with metrics, trend analysis, and continuous improvement.',
        partial: 'Some evaluation done but not comprehensive.',
        nonCompliant: 'No evaluation of whistleblowing system effectiveness.',
      },
    },
  ],
};

// ─── Legal & Regulatory Reference Data ──────────────────────────────────────

export const legalFrameworkReferences = {
  antiBribery: [
    { jurisdiction: 'International', law: 'UN Convention Against Corruption (UNCAC)', year: 2003, relevance: 'ISO 37001' },
    { jurisdiction: 'UK', law: 'UK Bribery Act 2010', year: 2010, relevance: 'ISO 37001', keyProvision: 'Section 7: Adequate Procedures defense' },
    { jurisdiction: 'US', law: 'Foreign Corrupt Practices Act (FCPA)', year: 1977, relevance: 'ISO 37001', keyProvision: 'Anti-bribery and books & records provisions' },
    { jurisdiction: 'EU', law: 'EU Anti-Corruption Directive (proposed 2023)', year: 2023, relevance: 'ISO 37001' },
    { jurisdiction: 'France', law: 'Sapin II Law', year: 2016, relevance: 'ISO 37001', keyProvision: 'Article 17: Eight compliance pillars' },
    { jurisdiction: 'Germany', law: 'Supply Chain Due Diligence Act (LkSG)', year: 2023, relevance: 'ISO 37001, ISO 37301' },
  ],
  compliance: [
    { jurisdiction: 'International', law: 'OECD Guidelines for Multinational Enterprises', year: 2023, relevance: 'ISO 37301' },
    { jurisdiction: 'EU', law: 'Corporate Sustainability Due Diligence Directive (CSDDD)', year: 2024, relevance: 'ISO 37301' },
    { jurisdiction: 'EU', law: 'EU Whistleblower Protection Directive 2019/1937', year: 2019, relevance: 'ISO 37002' },
    { jurisdiction: 'US', law: 'Sarbanes-Oxley Act (SOX)', year: 2002, relevance: 'ISO 37301, ISO 27001' },
    { jurisdiction: 'US', law: 'Dodd-Frank Act — Whistleblower provisions', year: 2010, relevance: 'ISO 37002' },
  ],
  informationSecurity: [
    { jurisdiction: 'EU', law: 'General Data Protection Regulation (GDPR)', year: 2018, relevance: 'ISO 27001', keyProvision: 'Article 32: Technical and organizational measures' },
    { jurisdiction: 'EU', law: 'NIS2 Directive 2022/2555', year: 2022, relevance: 'ISO 27001', keyProvision: 'Article 21: Cybersecurity risk-management measures' },
    { jurisdiction: 'EU', law: 'Digital Operational Resilience Act (DORA)', year: 2023, relevance: 'ISO 27001' },
    { jurisdiction: 'US', law: 'NIST Cybersecurity Framework 2.0', year: 2024, relevance: 'ISO 27001' },
    { jurisdiction: 'International', law: 'PCI DSS v4.0', year: 2024, relevance: 'ISO 27001' },
  ],
  governance: [
    { jurisdiction: 'International', law: 'OECD Principles of Corporate Governance', year: 2023, relevance: 'ISO 37000' },
    { jurisdiction: 'UK', law: 'UK Corporate Governance Code', year: 2024, relevance: 'ISO 37000' },
    { jurisdiction: 'International', law: 'King IV Report on Corporate Governance', year: 2016, relevance: 'ISO 37000' },
    { jurisdiction: 'EU', law: 'EU Shareholder Rights Directive II', year: 2017, relevance: 'ISO 37000' },
  ],
};

// ─── Severity Classification for Legal Compliance ───────────────────────────

export const legalSeverityMatrix = {
  criticalViolation: {
    description: 'Fundamental breach of mandatory legal requirement; potential criminal liability',
    examples: [
      'No anti-bribery controls where legally mandated (UK Bribery Act s.7)',
      'Failure to report data breaches within 72 hours (GDPR Art. 33)',
      'No whistleblower channel where legally required (EU Directive 2019/1937)',
    ],
    recommendedAction: 'Immediate remediation required. Engage legal counsel. Board-level escalation.',
    timeframe: '0-30 days',
  },
  majorNonConformity: {
    description: 'Absence or total failure of a required management system element',
    examples: [
      'No risk assessment performed',
      'No internal audit program',
      'No management review conducted',
      'No compliance policy established',
    ],
    recommendedAction: 'Priority remediation. Establish required element within certification timeline.',
    timeframe: '30-60 days',
  },
  minorNonConformity: {
    description: 'Partial failure of a management system requirement; does not constitute systemic failure',
    examples: [
      'Risk assessment performed but not covering all required factors',
      'Training records incomplete',
      'Some monitoring metrics missing',
    ],
    recommendedAction: 'Corrective action required. Address during next review cycle.',
    timeframe: '60-90 days',
  },
  observation: {
    description: 'Opportunity for improvement; system functions but could be strengthened',
    examples: [
      'Documentation could be more specific',
      'Process could benefit from automation',
      'Additional training would enhance competence',
    ],
    recommendedAction: 'Consider in continual improvement planning.',
    timeframe: 'Next management review cycle',
  },
};

// ─── Consolidated Questionnaire Access ──────────────────────────────────────

export const allQuestionnaires: Record<string, StandardQuestionnaire> = {
  ISO37001: iso37001Questionnaire,
  ISO37301: iso37301Questionnaire,
  ISO27001: iso27001Questionnaire,
  ISO9001: iso9001Questionnaire,
};

export const governanceStandards: Record<string, GovernanceStandard> = {
  ISO37000: iso37000Governance,
  ISO37002: iso37002Whistleblowing,
};

export function getQuestionsForStandard(standardCode: string): AuditQuestion[] {
  const questionnaire = allQuestionnaires[standardCode];
  if (questionnaire) return questionnaire.questions;
  const governance = governanceStandards[standardCode];
  if (governance) return governance.auditQuestions;
  return [];
}

export function getQuestionsForClause(standardCode: string, clauseRef: string): AuditQuestion[] {
  return getQuestionsForStandard(standardCode).filter(q => q.clauseRef === clauseRef);
}

export function getQuestionsByCategory(standardCode: string, category: string): AuditQuestion[] {
  return getQuestionsForStandard(standardCode).filter(q => q.category === category);
}

export function getMandatoryQuestions(standardCode: string): AuditQuestion[] {
  return getQuestionsForStandard(standardCode).filter(q => q.severity === 'mandatory');
}

export function getAllMandatoryRequirementCount(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const [code, q] of Object.entries(allQuestionnaires)) {
    counts[code] = q.totalMandatoryRequirements;
  }
  return counts;
}
