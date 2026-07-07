# Agent Design Document

## Multi-Agent Architecture

SentriX employs a **sequential-parallel orchestration pattern** where **9 specialized agents** work together to produce a comprehensive compliance assessment. This is not a single LLM call — it is a coordinated team of domain experts, each with distinct prompts, inputs, outputs, and error handling.

## Agent Pipeline

```
                    ┌─────────────────┐
                    │  Document Agent  │  Step 1: Parse & structure documents
                    │  (Sequential)    │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │              │
     ┌────────┴───┐ ┌───────┴──┐ ┌────────┴──┐ ┌───────┴────┐
     │ Bribery    │ │Governance│ │ Security  │ │ Quality    │
     │ Risk Agent │ │ Agent    │ │ Agent     │ │ Agent      │  Step 2:
     │ (ISO37001) │ │(ISO37301)│ │(ISO27001) │ │ (ISO9001)  │  Parallel
     └────────┬───┘ └───────┬──┘ └────────┬──┘ └───────┬────┘  Scoring
              │              │              │              │
              └──────────────┼──────────────┘
                             │
                    ┌────────┴────────┐
                    │  Gap Analysis   │  Step 3: Cross-standard gaps
                    │  Agent          │
                    └────────┬────────┘
                             │
                    ┌────────┴────────┐
                    │  Evidence       │  Step 4: Validate evidence
                    │  Validation     │         sufficiency & quality
                    │  Agent (NOVEL)  │
                    └────────┬────────┘
                             │
                    ┌────────┴────────┐
                    │  Remediation    │  Step 5: Phased roadmap
                    │  Agent          │
                    └────────┬────────┘
                             │
                    ┌────────┴────────┐
                    │  Policy         │  Step 6: Generate 100%
                    │  Generator      │         compliant policies
                    │  Agent (NOVEL)  │         for download
                    └─────────────────┘
```

## Agent Specifications

### 1. Document Agent
- **Purpose**: Parse and structure uploaded policy documents using NLP
- **Input**: Raw document text (PDF/DOCX/TXT), organization profile
- **Output**: Structured sections, controls identified, content summary, evidence artifacts
- **OmniAgent Module**: Document Intelligence
- **Orchestration**: Sequential — must complete before any other agent starts

### 2. Bribery Risk Agent (ISO 37001:2025)
- **Purpose**: Evaluate anti-bribery management clauses
- **Input**: Structured document content + ISO 37001 clause list + org profile
- **Output**: Clause-level scores (0-100), evidence citations, findings per clause
- **Scoring**: Via HybridScoringService (ML → Claude → Keyword)
- **OmniAgent Module**: Risk Analytics Engine

### 3. Governance Agent (ISO 37301:2021)
- **Purpose**: Assess compliance management system maturity
- **Input**: Structured document content + ISO 37301 clause list + org profile
- **Output**: Clause-level scores, compliance findings, maturity indicators
- **Scoring**: Via HybridScoringService (ML → Claude → Keyword)
- **OmniAgent Module**: Compliance Knowledge Graph

### 4. Security Agent (ISO 27001:2022)
- **Purpose**: Analyze information security controls
- **Input**: Structured document content + ISO 27001 clause list + org profile
- **Output**: Clause-level scores, security findings, control gap indicators
- **Scoring**: Via HybridScoringService (ML → Claude → Keyword)
- **OmniAgent Module**: Risk Analytics Engine

### 5. Quality Agent (ISO 9001:2015)
- **Purpose**: Review quality management processes
- **Input**: Structured document content + ISO 9001 clause list + org profile
- **Output**: Clause-level scores, quality findings, process maturity indicators
- **Scoring**: Via HybridScoringService (ML → Claude → Keyword)
- **OmniAgent Module**: Compliance Knowledge Graph

### 6. Gap Analysis Agent
- **Purpose**: Cross-standard gap identification and synergy detection
- **Input**: All 4 standard assessment results (clause scores + findings)
- **Output**: Prioritized gaps with severity (critical/high/medium/low), impact and effort scores, cross-standard overlaps, category tags (policy/process/training/technology/documentation)
- **OmniAgent Module**: Compliance Knowledge Graph

### 7. Evidence Validation Agent *(Novel Feature)*
- **Purpose**: Validate whether cited evidence actually supports compliance claims
- **Input**: All clause scores, evidence citations, gap analysis results, org profile
- **Output**: Per-clause evidence validation with:
  - **Sufficiency**: `sufficient` | `partial` | `insufficient` | `missing`
  - **Quality Level**: `direct` (policy text) | `indirect` (inferred) | `anecdotal` | `none`
  - **Quality Score**: 0-100 numeric rating
  - **Issues**: Specific problems found with the evidence
  - **Recommendation**: What additional evidence is needed
  - **Cross-Standard Reuse**: Which other standards this evidence also covers
- **Aggregate Output**: Overall evidence score, counts by sufficiency category, cross-standard reuse opportunities, executive summary
- **OmniAgent Module**: Evidence Validation Engine

### 8. Remediation Agent
- **Purpose**: Generate consultant-quality phased remediation roadmaps
- **Input**: Gap analysis results, evidence validation results, org profile
- **Output**: Prioritized actions across 3 phases with effort estimates (days), responsible functions, success metrics, standard references
- **Phase Structure**:
  - Phase 1 (Immediate): Critical gaps, quick wins
  - Phase 2 (Short-term): High-priority structural changes
  - Phase 3 (Long-term): Continuous improvement and monitoring
- **OmniAgent Module**: Remediation Planning Engine

### 9. Policy Generator Agent *(Novel Feature)*
- **Purpose**: Generate 100% compliant, ready-to-adopt policy documents that address all identified gaps
- **Input**: All standard assessment results, gaps, evidence validation findings, remediation actions, org profile
- **Output**: Per-standard policy documents with:
  - **Structured Sections**: Numbered sections mapped to specific clause references
  - **Section Status**: `new` (created to fill gap) | `revised` (updated existing) | `retained` (kept as-is)
  - **Compliance Score**: 100% target for every generated policy
  - **Gaps Addressed**: Count of gaps resolved by this policy
  - **Executive Summary**: Overview of policy scope and coverage
- **Download**: Users can download individual or all policy documents as formatted text files
- **OmniAgent Module**: Policy Generation Engine

## Orchestration Logic

The orchestrator (`server/src/agents/orchestrator.ts`) implements a 6-step pipeline:

1. **Step 1 — Sequential Start**: Document Agent parses all uploaded documents. Must complete before others start because all subsequent agents depend on structured document content.

2. **Step 2 — Parallel Scoring**: All 4 standard-specific agents score their respective standards concurrently via `HybridScoringService.scoreAllStandards()`. Each agent uses the 3-tier hybrid scoring engine (ML → Claude → Keyword).

3. **Step 3 — Aggregation**: Gap Analysis Agent receives all 4 standard assessment results and identifies cross-standard gaps, synergies, and overlap opportunities.

4. **Step 4 — Evidence Validation**: Evidence Validation Agent receives all clause scores and gap analysis, and validates the sufficiency and quality of cited evidence for each clause.

5. **Step 5 — Remediation Planning**: Remediation Agent receives gap analysis output and generates a phased, prioritized action plan.

6. **Step 6 — Policy Generation**: Policy Generator Agent receives all assessment data (gaps, remediation actions, evidence validation) and generates 100% compliant policy documents for each standard that users can download immediately.

### Streaming
All agent lifecycle events (start, complete, error, log) are emitted via SSE to the connected client in real-time. The client UI updates progressively as each agent completes.

## Error Handling

- Each agent has independent error handling — if one fails, others continue
- `safeParseJSON()` handles both raw JSON and JSON wrapped in markdown code blocks
- Gap Analysis uses whatever results are available, even if some standard agents error
- Evidence Validation degrades gracefully with partial data
- Client shows partial results with error indicators for failed agents
- SSE handles client disconnects; completed assessments remain fetchable via GET

## Prompt Engineering

Each agent uses a carefully crafted system prompt (`agentRunner.ts`) that:
- Defines the agent's specific role and domain expertise
- Specifies the expected JSON output schema precisely
- Includes scoring rubrics and maturity level definitions (5-level scale)
- References the organizational context from the user's profile
- Enforces structured output to enable reliable `safeParseJSON()` extraction

## Assessment Result Schema

The final `AssessmentResult` aggregates all agent outputs:

```typescript
interface AssessmentResult {
  id: string;
  orgProfile: { company, industry, employees, scope };
  overallScore: number;           // Average of all standard scores
  maturityLevel: number;          // 1-5 based on overallScore
  standardAssessments: [...];     // Per-standard clause scores & findings
  gaps: [...];                    // Prioritized gaps with severity/impact/effort
  evidenceValidation: {           // Evidence Validation Agent output
    evidenceItems: [...];         // Per-clause validation results
    overallEvidenceScore: number;
    sufficientCount: number;
    partialCount: number;
    insufficientCount: number;
    missingCount: number;
    crossStandardOpportunities: number;
    summary: string;
  };
  remediationActions: [...];      // Phased roadmap actions
  timestamp: string;
}
```
