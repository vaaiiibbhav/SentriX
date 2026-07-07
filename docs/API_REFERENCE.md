# API Reference

## Base URL
```
http://localhost:3001/api
```

## Endpoints

### Health Check
```
GET /api/health
```
**Response:**
```json
{ "status": "ok", "timestamp": "2025-01-14T10:00:00.000Z" }
```

---

### Assessment

#### Start Assessment
```
POST /api/assessment/start
```
Starts an asynchronous compliance assessment. Returns immediately with an `assessmentId` that can be used to stream progress and fetch results.

**Request Body:**
```json
{
  "filePaths": ["/uploads/uuid-policy.pdf", "/uploads/uuid-controls.docx"],
  "standards": ["ISO37001", "ISO37301", "ISO27001", "ISO9001"],
  "orgProfile": {
    "company": "Acme Corp",
    "industry": "Financial Services",
    "employees": "501-1000",
    "scope": "Global Operations"
  }
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `filePaths` | `string[]` | No | Paths to uploaded documents (from /api/upload) |
| `standards` | `string[]` | Yes | One or more of: `ISO37001`, `ISO37301`, `ISO27001`, `ISO9001` |
| `orgProfile.company` | `string` | Yes | Organization name |
| `orgProfile.industry` | `string` | Yes | Industry sector |
| `orgProfile.employees` | `string` | Yes | Employee count range |
| `orgProfile.scope` | `string` | Yes | Assessment scope description |

**Response (202):**
```json
{ "assessmentId": "550e8400-e29b-41d4-a716-446655440000", "status": "processing" }
```

**Error (400):**
```json
{ "error": "At least one standard is required" }
```

---

#### Stream Assessment Progress (SSE)
```
GET /api/assessment/:id/stream
```
Opens a Server-Sent Events connection for real-time agent progress. The connection sends events as each of the 9 agents starts, completes, logs progress, or encounters errors. Closes automatically after the final `complete` event.

**Headers:** `Accept: text/event-stream`

**SSE Event Types:**

| Event Type | Description |
|---|---|
| `agent-start` | An agent has begun processing |
| `agent-complete` | An agent has finished successfully |
| `agent-error` | An agent encountered an error |
| `log` | Progress log message from an agent |
| `complete` | All agents done — full result payload |
| `error` | Fatal assessment error |

**Event Examples:**
```
data: {"type":"agent-start","agent":"Document Agent","timestamp":"2025-01-14T10:00:01Z"}

data: {"type":"log","message":"🔍 Document Agent — Extracted content, 12 controls identified","timestamp":"2025-01-14T10:00:05Z"}

data: {"type":"agent-complete","agent":"Document Agent","timestamp":"2025-01-14T10:00:06Z"}

data: {"type":"agent-start","agent":"Bribery Risk Agent","timestamp":"2025-01-14T10:00:06Z"}

data: {"type":"log","message":"⚖️ Bribery Risk Agent — 72% overall (Level 3, method: ml+claude)","timestamp":"2025-01-14T10:00:12Z"}

data: {"type":"agent-start","agent":"Evidence Validation Agent","timestamp":"2025-01-14T10:00:30Z"}

data: {"type":"log","message":"🔐 Evidence Validation Agent — Score: 65%, 8 sufficient, 3 insufficient, 1 missing","timestamp":"2025-01-14T10:00:38Z"}

data: {"type":"complete","result":{...},"timestamp":"2025-01-14T10:00:45Z"}
```

**Error (404):**
```json
{ "error": "Assessment not found" }
```

---

#### Get Assessment Results
```
GET /api/assessment/:id/results
```
Fetches the final assessment result (or current status if still processing).

**Response (complete):**
```json
{
  "status": "complete",
  "result": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "orgProfile": {
      "company": "Acme Corp",
      "industry": "Financial Services",
      "employees": "501-1000",
      "scope": "Global Operations"
    },
    "overallScore": 62,
    "maturityLevel": 3,
    "standardAssessments": [
      {
        "standard": "ISO37001",
        "name": "Anti-Bribery Management Systems",
        "overallScore": 68,
        "maturityLevel": 3,
        "clauseScores": [
          { "clauseId": "4.1", "score": 72, "finding": "Strong compliance with..." }
        ]
      }
    ],
    "gaps": [
      {
        "id": "gap-1",
        "title": "Missing whistleblower protection policy",
        "severity": "critical",
        "standard": "ISO37001",
        "clauseRef": "8.9",
        "impactScore": 9,
        "effortScore": 4,
        "description": "No documented whistleblower protection mechanism found."
      }
    ],
    "evidenceValidation": {
      "evidenceItems": [
        {
          "id": "ev-1",
          "clauseId": "4.1",
          "standardCode": "ISO37001",
          "evidenceText": "Section 3.2 of the anti-bribery policy...",
          "validationResult": "sufficient",
          "qualityScore": 85,
          "qualityLevel": "direct",
          "issues": [],
          "recommendation": "Evidence is adequate.",
          "crossStandardReuse": ["ISO37301"]
        },
        {
          "id": "ev-2",
          "clauseId": "8.9",
          "standardCode": "ISO37001",
          "evidenceText": "",
          "validationResult": "missing",
          "qualityScore": 0,
          "qualityLevel": "none",
          "issues": ["No whistleblower protection evidence found"],
          "recommendation": "Establish and document a whistleblower protection policy.",
          "crossStandardReuse": []
        }
      ],
      "overallEvidenceScore": 65,
      "sufficientCount": 8,
      "partialCount": 5,
      "insufficientCount": 3,
      "missingCount": 1,
      "crossStandardOpportunities": 4,
      "summary": "Evidence coverage is moderate with notable gaps in..."
    },
    "remediationActions": [
      {
        "id": "rem-1",
        "title": "Establish whistleblower protection policy",
        "description": "Draft and implement a formal whistleblower mechanism...",
        "priority": "critical",
        "phase": 1,
        "effortDays": 15,
        "standard": "ISO37001",
        "responsible": "Compliance Officer"
      }
    ],
    "timestamp": "2025-01-14T10:00:45.000Z"
  }
}
```

**Response (processing):**
```json
{
  "status": "processing",
  "logs": ["Document Agent completed", "Bribery Risk Agent completed"]
}
```

---

### Chat
```
POST /api/chat
```
AI-powered compliance Q&A using Claude. Contextually aware of the current assessment results.

**Request Body:**
```json
{
  "message": "What are my biggest compliance gaps?",
  "context": {
    "overallScore": 62,
    "standards": ["ISO37001", "ISO37301"],
    "gapCount": 12
  }
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `message` | `string` | Yes | User's question |
| `context` | `object` | No | Assessment context for more relevant answers |

**Response:**
```json
{ "response": "Based on your assessment, your most critical gaps are..." }
```

---

### Standards

#### List Standards
```
GET /api/standards
```
Returns all supported ISO standards with metadata.

**Response:**
```json
[
  {
    "code": "ISO37001",
    "name": "ISO 37001",
    "fullName": "Anti-Bribery Management Systems",
    "edition": "2025",
    "clauseCount": 28
  },
  {
    "code": "ISO37301",
    "name": "ISO 37301",
    "fullName": "Compliance Management Systems",
    "edition": "2021",
    "clauseCount": 25
  },
  {
    "code": "ISO27001",
    "name": "ISO 27001",
    "fullName": "Information Security Management Systems",
    "edition": "2022",
    "clauseCount": 30
  },
  {
    "code": "ISO9001",
    "name": "ISO 9001",
    "fullName": "Quality Management Systems",
    "edition": "2015",
    "clauseCount": 24
  }
]
```

#### Get Standard Clauses
```
GET /api/standards/:code/clauses
```
Returns all clauses for a specific standard, including descriptions, categories, weights, and keyword tags.

**Response:**
```json
{
  "code": "ISO37001",
  "clauses": [
    {
      "id": "4.1",
      "title": "Understanding the organization and its context",
      "description": "The organization shall determine external and internal issues...",
      "category": "Context of the organization",
      "weight": 3,
      "keywords": ["context", "stakeholder", "external", "internal", "risk"],
      "guidance": "Organizations should consider legal, regulatory, contractual..."
    }
  ]
}
```

---

### File Upload
```
POST /api/upload
Content-Type: multipart/form-data
```
Upload one or more policy documents for assessment.

**Constraints:**
- Maximum 10 files per upload
- Maximum 20MB per file
- Accepted MIME types: `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `text/plain`

**Request Body:** `files` (multipart form field, multiple files)

**Response:**
```json
{
  "files": [
    {
      "originalName": "anti-bribery-policy.pdf",
      "savedPath": "/uploads/550e8400-policy.pdf",
      "size": 1024000,
      "mimetype": "application/pdf"
    },
    {
      "originalName": "security-controls.docx",
      "savedPath": "/uploads/550e8401-controls.docx",
      "size": 512000,
      "mimetype": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    }
  ]
}
```

---

### Report
```
POST /api/report/generate
```
Generates a structured executive report from assessment results. The JSON response is used client-side with jsPDF + html2canvas for PDF generation.

**Request Body:**
```json
{
  "assessmentResult": { "...full AssessmentResult object..." }
}
```

**Response:** Structured report JSON with sections for executive summary, per-standard findings, gap analysis, evidence validation summary, and remediation roadmap.

---

### Demo
```
GET /api/demo/assessment
```
Returns a complete pre-computed assessment result for "Acme Corp" with all 9 agents' output. Used by the Demo Mode toggle in the UI.

**Response:** Full `AssessmentResult` object (same schema as `/api/assessment/:id/results`), including evidence validation data and remediation actions.

---

## Error Responses

All endpoints return errors in a consistent format:

```json
{ "error": "Human-readable error message" }
```

| Status Code | Meaning |
|---|---|
| 400 | Bad request (missing required fields) |
| 404 | Resource not found (invalid assessment ID or standard code) |
| 500 | Internal server error (agent failure, API error) |
