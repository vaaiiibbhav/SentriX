# Project Overview

## What Is SentriX

SentriX is an enterprise AI-powered compliance intelligence platform that evaluates organizational readiness against multiple ISO standards. It replaces manual compliance assessments — traditionally weeks-long engagements requiring teams of auditors and consultants — with an automated, AI-driven pipeline that delivers clause-level analysis, gap detection, evidence validation, remediation roadmaps, and executive reporting in minutes.

The platform processes uploaded governance documents (policies, procedures, manuals) through a coordinated team of nine specialized AI agents, each responsible for a distinct phase of the compliance assessment lifecycle. The result is a structured, audit-defensible compliance posture report covering four ISO management system standards simultaneously.

## The Problem

Organizations pursuing ISO certification or maintaining compliance face significant challenges:

- **Manual clause-by-clause review** across hundreds of requirements per standard is time-consuming and error-prone.
- **Multi-standard programs** (anti-bribery + compliance + information security + quality) multiply the workload, often resulting in siloed assessments that miss cross-standard synergies.
- **Evidence validation** is subjective — different auditors interpret sufficiency differently, and organizations struggle to prove their documentation actually supports compliance claims.
- **Gap remediation** lacks structured prioritization, leading to effort wasted on low-impact areas while critical exposures remain unaddressed.
- **Executive visibility** is limited — leadership receives static PDF reports with no interactive drill-down into the underlying analysis.

Traditional compliance consulting engagements cost $50,000–$500,000+ depending on scope and involve 4–12 week timelines. SentriX compresses this into an automated pipeline that runs in minutes while maintaining audit-grade analysis quality.

## Target Users

| User | Use Case |
|------|----------|
| **Compliance Officers** | Assess organizational readiness, identify gaps, track remediation progress |
| **Internal Auditors** | Validate evidence quality, benchmark against industry standards, prepare for certification audits |
| **Risk Managers** | Prioritize exposures by severity, model remediation scenarios, monitor risk reduction over time |
| **Management Consultants** | Deliver rapid compliance assessments for client engagements, generate professional reports |
| **Enterprise Leadership** | Review executive dashboards, understand compliance posture across business units |
| **Certification Bodies** | Reference structured assessment output during audit engagements |

## Key Innovation

SentriX introduces several capabilities not found in existing compliance tools:

### 1. Nine-Agent Orchestrated Pipeline

Rather than submitting a single prompt to an LLM, SentriX coordinates nine specialized AI agents through a sequential pipeline. Each agent has domain expertise (document parsing, clause mapping, evidence validation, scoring, gap detection, remediation planning, policy generation) and passes structured context to the next. This produces deeper, more consistent analysis than monolithic prompt approaches.

### 2. Three-Tier Hybrid Scoring Engine

Compliance scores are calculated through a cascading system:

1. **Tier 1 — ML Semantic Scoring**: Sentence-transformer models measure semantic similarity between document content and clause requirements.
2. **Tier 2 — AI Enhancement**: Groq-powered large language model acts as a lead auditor, refining scores with expert judgment.
3. **Tier 3 — Keyword + NLP Fallback**: Enhanced keyword matching with compliance phrase patterns ensures the system always produces results, even without API connectivity.

### 3. Evidence Validation Agent

An industry-first capability that examines whether cited evidence actually supports compliance claims. The agent assesses evidence sufficiency (sufficient, partial, insufficient, missing), quality level (direct, indirect, anecdotal, none), and identifies cross-standard reuse opportunities where a single piece of evidence satisfies requirements across multiple standards.

### 4. Cross-Standard Synergy Detection

When organizations pursue multiple ISO certifications simultaneously, SentriX identifies overlapping requirements and shared remediation opportunities. Nine synergy areas are mapped with 35–70% efficiency gains, reducing the total cost and effort of multi-standard compliance programs.

### 5. OmniAgent Platform Integration

Architected with a clean bridge layer for Enterprise Core's OmniAgent infrastructure, enabling seamless deployment within enterprise AI governance frameworks while maintaining full local fallback capability.

## System Capabilities

### Assessment Pipeline
- Multi-format document upload (PDF, DOCX, TXT) with structural parsing
- Clause-level mapping of document content to ISO requirements
- Evidence quality validation with sufficiency scoring
- Hybrid compliance scoring across three analysis tiers
- Automated gap detection with severity classification
- Phased remediation roadmap generation with effort estimates
- Compliant policy document generation addressing identified gaps

### Analytics & Reporting
- Real-time executive dashboard with compliance score visualization
- Organizational risk heatmap with exposure modeling
- Clause-level heatmaps showing coverage across standards
- Gap priority scatter plots (impact vs. effort analysis)
- Industry benchmark comparison with regulatory pressure context
- Compliance readiness timeline with scenario modeling
- Professional PDF report generation with executive formatting

### Intelligence
- SentriX Copilot for natural language compliance Q&A
- Structured ISO questionnaire library with legal-grade audit questions
- Knowledge base with maturity models and industry benchmarks
- Cross-standard mapping and synergy identification
- Common audit findings database with remediation guidance

## Product Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│                       SentriX Assessment Flow                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. UPLOAD DOCUMENTS                                                │
│     └─ Upload governance policies, procedures, manuals              │
│        (PDF, DOCX, TXT — up to 10 files, 20 MB each)               │
│                                                                     │
│  2. CONFIGURE ASSESSMENT                                            │
│     └─ Provide organization profile (industry, size, jurisdiction)  │
│     └─ Select ISO standards (37001, 37301, 27001, 9001)             │
│                                                                     │
│  3. AI ANALYZES ISO STANDARDS                                       │
│     └─ 7-agent pipeline processes documents against clauses         │
│     └─ Real-time agent progress streamed via SSE                    │
│                                                                     │
│  4. GAP DETECTION                                                   │
│     └─ Identifies non-conformities by severity                      │
│     └─ Maps gaps to specific clauses and standards                  │
│     └─ Classifies as critical / high / medium / low                 │
│                                                                     │
│  5. REMEDIATION RECOMMENDATIONS                                     │
│     └─ Generates phased action plan (Phase 1: 0–30d, 2: 30–60d,    │
│        3: 60–120d) with effort estimates and owners                 │
│     └─ AI generates ready-to-adopt policy documents                 │
│                                                                     │
│  6. EXECUTIVE ANALYTICS & REPORTING                                 │
│     └─ Interactive dashboard with visualizations                    │
│     └─ Risk heatmaps, benchmark comparisons, score trends           │
│     └─ PDF export for board presentations and auditor handoff       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Supported Standards

| Standard | Full Name | Version | Clauses | Domain |
|----------|-----------|---------|---------|--------|
| ISO 37001 | Anti-Bribery Management Systems | 2025 | 28 | Anti-corruption |
| ISO 37301 | Compliance Management Systems | 2021 | 25 | Regulatory compliance |
| ISO 27001 | Information Security Management Systems | 2022 | 23 | Cybersecurity |
| ISO 9001 | Quality Management Systems | 2015 | 28 | Quality assurance |
| ISO 37000 | Governance of Organizations | 2021 | — | Governance guidance |
| ISO 37002 | Whistleblowing Management Systems | 2021 | — | Ethics guidance |

ISO 37000 and 37002 are integrated as governance guidance standards referenced within the questionnaire and knowledge base systems, rather than standalone assessment targets.
