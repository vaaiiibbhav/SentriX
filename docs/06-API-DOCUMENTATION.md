# API Documentation

## Base URL

```
Development: http://localhost:3001/api
Production:  Configured via deployment environment
```

All endpoints are prefixed with `/api`. The frontend Vite development server proxies `/api` requests to the backend at port 3001.

---

## Assessment Endpoints

### Start Assessment

Initiates a new compliance assessment pipeline.

```
POST /api/assessment/start
Content-Type: application/json
```

**Request Body**:

```json
{
  "standards": ["ISO37001", "ISO37301", "ISO27001", "ISO9001"],
  "orgProfile": {
    "company": "Acme Corp Financial Services",
    "industry": "Financial Services",
    "employees": "5000",
    "scope": "Global operations"
  },
  "uploadedDocuments": [
    {
      "originalName": "compliance-policy-v3.pdf",
      "savedPath": "uploads/a1b2c3d4-compliance-policy-v3.pdf",
      "size": 245000,
      "mimetype": "application/pdf"
    }
  ]
}
```

**Response** (`200 OK`):

```json
{
  "assessmentId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "status": "processing"
}
```

The assessment runs asynchronously. Use the stream or results endpoints to track progress.

---

### Stream Assessment Progress (SSE)

Server-Sent Events endpoint for real-time assessment progress.

```
GET /api/assessment/:id/stream
Accept: text/event-stream
```

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `string` | Assessment session ID from start response |

**Event Types**:

```
data: {"type":"agent-start","data":{"agentName":"Document Parsing"}}

data: {"type":"agent-complete","data":{"agentName":"Document Parsing","summary":"Parsed 3 documents..."}}

data: {"type":"log","data":{"message":"Starting clause mapping for ISO 37001","timestamp":"2026-03-09T..."}}

data: {"type":"complete","data":{...fullAssessmentResult}}

data: {"type":"error","data":{"message":"Pipeline execution failed"}}
```

The connection remains open until the pipeline completes or errors. The client should close the EventSource on receiving `complete` or `error`.

---

### Get Assessment Results (Poll)

Polling endpoint for assessment status and results.

```
GET /api/assessment/:id/results
```

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `string` | Assessment session ID |

**Response (processing)**:

```json
{
  "status": "processing",
  "logs": [
    { "message": "Document Parsing started", "timestamp": "..." },
    { "message": "Document Parsing completed", "timestamp": "..." }
  ]
}
```

**Response (complete)** (`200 OK`):

```json
{
  "status": "complete",
  "result": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "orgProfile": { "company": "Acme Corp", "industry": "Financial Services", "employees": "5000" },
    "overallScore": 62,
    "maturityLevel": 3,
    "standardAssessments": [
      {
        "standard": "ISO37001",
        "name": "Anti-Bribery Management Systems",
        "overallScore": 58,
        "maturityLevel": 3,
        "clauseScores": [
          {
            "clauseId": "4.1",
            "clauseTitle": "Understanding the organization and its context",
            "score": 65,
            "confidence": 72,
            "confidenceLevel": "medium",
            "method": "groq-only",
            "finding": "Organization has documented its external and internal issues..."
          }
        ],
        "scoringMethod": "groq-only",
        "averageConfidence": 68
      }
    ],
    "gaps": [
      {
        "id": "gap-001",
        "title": "Incomplete bribery risk assessment",
        "severity": "critical",
        "standard": "ISO37001",
        "clauseRef": "4.5",
        "impactScore": 9,
        "effortScore": 6,
        "description": "No formal bribery risk assessment process documented...",
        "category": "process"
      }
    ],
    "evidenceValidation": {
      "items": [
        {
          "id": "ev-001",
          "clauseId": "4.1",
          "standardCode": "ISO37001",
          "evidenceText": "Section 2.1 defines organizational context...",
          "validationResult": "partial",
          "qualityScore": 55,
          "qualityLevel": "indirect",
          "issues": ["No explicit external stakeholder analysis"],
          "recommendation": "Document formal stakeholder mapping exercise",
          "crossStandardReuse": ["ISO37301"]
        }
      ],
      "summary": "Evidence coverage is partial...",
      "overallScore": 52
    },
    "remediationActions": [
      {
        "id": "rem-001",
        "title": "Conduct formal bribery risk assessment",
        "description": "Implement structured risk assessment methodology...",
        "priority": "critical",
        "phase": 1,
        "effortDays": 15,
        "standard": "ISO37001",
        "responsible": "Compliance & Legal",
        "successMetric": "Risk register documenting all high-risk areas"
      }
    ],
    "policyDocuments": [
      {
        "id": "pol-001",
        "standardCode": "ISO37001",
        "standardName": "Anti-Bribery Management Systems",
        "title": "Anti-Bribery Management Policy",
        "version": "1.0",
        "effectiveDate": "2026-03-09",
        "sections": [
          {
            "sectionNumber": "1",
            "title": "Policy Statement",
            "clauseRef": "5.1",
            "content": "Acme Corp is committed to...",
            "status": "new"
          }
        ],
        "complianceScore": 75,
        "gapsAddressed": 4,
        "summary": "New policy addressing identified anti-bribery gaps..."
      }
    ],
    "orchestration": {
      "executionLog": [
        {
          "agentName": "Document Parsing",
          "provider": "groq",
          "status": "completed",
          "startedAt": "2026-03-09T10:00:00Z",
          "completedAt": "2026-03-09T10:00:05Z",
          "summary": "Parsed 3 documents with 15,000 words"
        }
      ],
      "totalDurationMs": 45000
    },
    "timestamp": "2026-03-09T10:00:45Z"
  }
}
```

**Response (error)** (`200 OK`):

```json
{
  "status": "error",
  "error": "Pipeline execution failed: Groq API timeout"
}
```

---

## Chat Endpoints

### Compliance Copilot (Structured)

Context-aware compliance Q&A returning structured responses.

```
POST /api/chat/copilot
Content-Type: application/json
```

**Request Body**:

```json
{
  "message": "Why is our ISO 37001 score so low?",
  "assessmentId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "conversationHistory": [
    { "role": "user", "content": "What should we fix first?" },
    { "role": "assistant", "content": "Based on your assessment..." }
  ],
  "context": {
    "orgProfile": { "company": "Acme Corp", "industry": "Financial Services" },
    "overallScore": 62,
    "standards": [{ "code": "ISO37001", "overallScore": 58 }],
    "gaps": [{ "title": "Incomplete risk assessment", "severity": "critical" }]
  }
}
```

**Response** (`200 OK`):

```json
{
  "headline": "Anti-Bribery Management Score Analysis",
  "directAnswer": "Your ISO 37001 score of 58% reflects gaps in risk assessment and due diligence processes.",
  "explanation": "The assessment identified 4 critical gaps...",
  "evidence": [
    {
      "source": "clause-score",
      "label": "Clause 4.5 — Bribery Risk Assessment",
      "detail": "Score: 25/100 — No formal risk assessment documented"
    },
    {
      "source": "uploaded-document",
      "label": "Section 3.2 of compliance-policy-v3.pdf",
      "detail": "References risk management but lacks bribery-specific methodology"
    }
  ],
  "recommendedActions": [
    {
      "action": "Implement formal bribery risk assessment methodology",
      "priority": "critical",
      "rationale": "Addresses highest-impact gap in ISO 37001 clause 4.5"
    }
  ],
  "isoGuidance": [
    {
      "standard": "ISO37001",
      "clause": "4.5",
      "requirement": "The organization shall assess bribery risks...",
      "guidance": "Implement a structured risk assessment process..."
    }
  ],
  "reportSummary": ["Overall compliance: 62%", "4 critical gaps identified"],
  "followUpQuestions": [
    "What resources are needed for the bribery risk assessment?",
    "How does this affect our ISO 37301 compliance?"
  ],
  "auditTrail": {
    "responseMode": "groq",
    "structuredFormat": true,
    "assessmentReference": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "contextSources": ["organization-profile", "clause-scores", "gaps", "uploaded-documents"],
    "pipelineProvider": "groq",
    "generatedAt": "2026-03-09T10:05:30Z",
    "caveats": []
  }
}
```

---

### Streaming Chat

Word-by-word streaming chat response.

```
POST /api/chat/stream
Content-Type: application/json
Accept: text/event-stream
```

**Request Body**:

```json
{
  "message": "Explain ISO 37001 clause 5.1 requirements",
  "conversationHistory": []
}
```

**Response**: Server-Sent Events stream with word-level deltas:

```
data: {"delta":"ISO"}
data: {"delta":" 37001"}
data: {"delta":" clause"}
data: {"delta":" 5.1"}
...
data: [DONE]
```

If `GROQ_API_KEY` is not configured, returns a simulated response based on keyword matching.

---

### Non-Streaming Chat

Simple question-response endpoint.

```
POST /api/chat
Content-Type: application/json
```

**Request Body**:

```json
{
  "message": "What is the maturity model?"
}
```

**Response** (`200 OK`):

```json
{
  "response": "The compliance maturity model defines five levels..."
}
```

---

## Standards Endpoints

### List All Standards

Returns summary of all available ISO standards.

```
GET /api/standards
```

**Response** (`200 OK`):

```json
[
  {
    "code": "ISO37001",
    "name": "Anti-Bribery Management Systems",
    "version": "2025",
    "clauseCount": 28
  },
  {
    "code": "ISO37301",
    "name": "Compliance Management Systems",
    "version": "2021",
    "clauseCount": 25
  },
  {
    "code": "ISO27001",
    "name": "Information Security Management Systems",
    "version": "2022",
    "clauseCount": 23
  },
  {
    "code": "ISO9001",
    "name": "Quality Management Systems",
    "version": "2015",
    "clauseCount": 28
  }
]
```

---

### Standards Library

Comprehensive standards catalog with metadata.

```
GET /api/standards/library
```

**Response** (`200 OK`):

```json
[
  {
    "code": "ISO37001",
    "name": "Anti-Bribery Management Systems",
    "version": "2025",
    "clauseCount": 28,
    "hasQuestionnaire": true,
    "mandatoryQuestionCount": 45,
    "categories": ["Context", "Leadership", "Planning", "Support", "Operation", "Evaluation", "Improvement"],
    "governanceStandards": ["ISO37000", "ISO37002"]
  }
]
```

---

### Get Clauses for Standard

Returns all clause definitions for a specific standard.

```
GET /api/standards/:code/clauses
```

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `code` | `string` | Standard code (e.g., `ISO37001`) |

**Response** (`200 OK`):

```json
[
  {
    "id": "4.1",
    "title": "Understanding the organization and its context",
    "description": "The organization shall determine external and internal issues...",
    "category": "Context",
    "weight": 3,
    "keywords": ["context", "stakeholders", "interested parties", "external issues"],
    "evidenceExamples": ["PESTLE analysis", "Stakeholder register", "Risk assessment"]
  }
]
```

---

### Get Questionnaire

Returns structured audit questionnaire for a standard.

```
GET /api/standards/:code/questionnaire
```

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `code` | `string` | Standard code |

**Response** (`200 OK`):

```json
{
  "standard": "ISO37001",
  "totalQuestions": 95,
  "mandatoryCount": 45,
  "categories": ["Context", "Leadership", "Planning", "Support", "Operation", "Evaluation", "Improvement"],
  "questions": [
    {
      "id": "Q-37001-001",
      "clauseRef": "4.1",
      "category": "Context",
      "question": "Has the organization determined external and internal issues relevant to anti-bribery?",
      "legalBasis": "UK Bribery Act 2010 s.7(2) — Adequate procedures defence",
      "severity": "mandatory",
      "evidenceRequired": ["PESTLE analysis", "Stakeholder register"],
      "failureConsequence": "Inability to demonstrate systematic approach to anti-bribery",
      "scoringCriteria": "Full marks require documented context analysis with stakeholder mapping"
    }
  ]
}
```

---

### Knowledge Base Overview

Returns compliance intelligence data including benchmarks, audit findings, and maturity model.

```
GET /api/standards/knowledge-base/overview
```

**Query Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `industry` | `string` | Optional. Industry name for targeted benchmarks |

**Response** (`200 OK`):

```json
{
  "industryBenchmarks": {
    "industryName": "Financial Services",
    "averageScores": {
      "ISO37001": 68,
      "ISO37301": 72,
      "ISO27001": 75,
      "ISO9001": 70
    },
    "commonGaps": ["Risk assessment methodology", "Third-party due diligence"],
    "regulatoryPressure": "very-high"
  },
  "maturityModel": [
    {
      "level": 1,
      "name": "Ad-hoc",
      "scoreRange": [0, 20],
      "characteristics": ["No formal processes", "Reactive approach"]
    }
  ],
  "legalFrameworkReferences": {
    "ISO37001": ["UK Bribery Act 2010", "US FCPA", "EU Anti-Corruption Directive"],
    "ISO27001": ["EU GDPR", "NIS2 Directive"]
  },
  "severityMatrix": [
    {
      "level": "critical",
      "description": "Immediate legal and regulatory exposure",
      "timeframe": "0-30 days",
      "remediationGuidance": ["Engage legal counsel", "Implement interim controls"]
    }
  ],
  "commonAuditFindings": {
    "ISO37001": {
      "Leadership": {
        "findings": ["Lack of anti-bribery policy signed by top management"],
        "typicalScore": 45,
        "criticality": "high"
      }
    }
  },
  "crossStandardMappings": [
    {
      "area": "Risk Management",
      "standards": ["ISO37001-6.1", "ISO37301-6.1", "ISO27001-6.1", "ISO9001-6.1"],
      "synergyPercentage": 45,
      "rationale": "Unified risk assessment framework applicable across all standards"
    }
  ]
}
```

---

### ML Service Health Check

Check scoring service availability and determine active scoring mode.

```
GET /api/standards/health/ml
```

**Response** (`200 OK`):

```json
{
  "mlService": true,
  "groqApi": true,
  "scoringMode": "ml+groq",
  "details": {
    "mlServiceUrl": "http://localhost:5001",
    "groqKeyConfigured": true
  }
}
```

Possible `scoringMode` values: `ml+groq`, `ml-only`, `groq-only`, `keyword-fallback`

---

## Upload Endpoints

### Upload Documents

Upload governance documents for assessment.

```
POST /api/upload
Content-Type: multipart/form-data
```

**Form Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `documents` | `File[]` | Up to 10 files. Accepted formats: PDF, DOCX, TXT. Max 20 MB each. |

**Response** (`200 OK`):

```json
[
  {
    "originalName": "compliance-policy-v3.pdf",
    "savedPath": "uploads/a1b2c3d4-e5f6-7890-abcd-ef0123456789.pdf",
    "size": 245000,
    "mimetype": "application/pdf"
  }
]
```

---

## Report Endpoints

### Generate Report

Generate a structured compliance report from assessment results.

```
POST /api/report/generate
Content-Type: application/json
```

**Request Body**: Full `AssessmentResult` object.

**Response** (`200 OK`):

```json
{
  "orgProfile": { "company": "Acme Corp", "industry": "Financial Services" },
  "executiveSummary": {
    "overallScore": 62,
    "maturityLevel": 3,
    "gapCount": 12,
    "standardCount": 4
  },
  "standardAssessments": [...],
  "gaps": [...],
  "remediationRoadmap": [...],
  "disclaimer": "This report is generated by SentriX..."
}
```

---

## Policy Endpoints

### Download Policy Document

Download a generated policy as a plain text file.

```
POST /api/policy/download
Content-Type: application/json
```

**Request Body**:

```json
{
  "policyDocument": {
    "standardCode": "ISO37001",
    "title": "Anti-Bribery Management Policy",
    "version": "1.0",
    "sections": [
      {
        "sectionNumber": "1",
        "title": "Policy Statement",
        "clauseRef": "5.1",
        "content": "Acme Corp is committed to...",
        "status": "new"
      }
    ]
  }
}
```

**Response**: File download (`Content-Disposition: attachment`)

```
Content-Type: text/plain
Content-Disposition: attachment; filename="ISO37001_Policy_v1.0.txt"
```

---

## Demo Endpoints

### Get Demo Assessment

Returns a hardcoded sample assessment for demonstration purposes.

```
GET /api/demo/assessment
```

**Response** (`200 OK`): Full `AssessmentResult` object for Acme Corp Financial Services with:
- Overall score: 62%
- 4 standards assessed
- ~10 clause scores per standard
- 12 gaps (critical, high, medium, low distribution)
- 9 remediation actions across 3 phases
- Demo evidence validation items
- Sample policy documents

---

## OmniAgent Endpoints

### List GenW Modules

Returns all available OmniAgent modules.

```
GET /api/genw/modules
```

**Response** (`200 OK`):

```json
[
  {
    "id": "documentIntelligence",
    "name": "Document Intelligence",
    "capability": "AI-powered document structure and content analysis",
    "endpoint": "/api/genw/document-intelligence"
  }
]
```

---

### Get Pipeline Definition

Returns the 7-stage pipeline with GenW module mappings.

```
GET /api/genw/pipeline
```

**Response** (`200 OK`):

```json
[
  {
    "order": 1,
    "agentName": "Document Parsing",
    "moduleId": "documentIntelligence",
    "moduleName": "Document Intelligence",
    "endpoint": "/api/genw/document-intelligence",
    "capability": "AI-powered document structure and content analysis",
    "description": "Extracts structure, topics, and compliance signals from uploaded documents",
    "fallbackMode": "local-nlp"
  }
]
```

---

### Get GenW Runtime Status

Returns platform availability and configuration.

```
GET /api/genw/status
```

**Response** (`200 OK`):

```json
{
  "status": "fallback-only",
  "genWConfigured": false,
  "groqConfigured": true,
  "pipeline": [...],
  "localFallback": {
    "available": true,
    "description": "Keyword+NLP scoring with heuristic gap analysis and rule-based remediation"
  }
}
```

Possible `status` values: `available`, `degraded`, `fallback-only`

---

## Health Check

### Server Health

```
GET /api/health
```

**Response** (`200 OK`):

```json
{
  "status": "ok",
  "timestamp": "2026-03-09T10:00:00.000Z"
}
```

---

## Error Responses

All endpoints return consistent error shapes:

```json
{
  "error": "Description of the error"
}
```

| Status Code | Meaning |
|------------|---------|
| `400` | Bad request (missing required fields) |
| `404` | Resource not found (invalid assessment ID) |
| `500` | Internal server error |
