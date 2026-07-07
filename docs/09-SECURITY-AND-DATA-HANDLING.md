# Security and Data Handling

## Overview

SentriX processes sensitive organizational governance documents and compliance data. This section documents the security practices, data handling procedures, and access control mechanisms implemented in the platform.

---

## Document Processing Security

### Upload Controls

| Control | Implementation |
|---------|---------------|
| **File type restriction** | Server-side validation via Multer: only `.pdf`, `.docx`, and `.txt` files are accepted |
| **File size limit** | Maximum 20 MB per file, enforced at the middleware layer |
| **File count limit** | Maximum 10 files per upload request |
| **Filename sanitization** | Uploaded files are renamed to UUID + original extension, preventing path traversal and injection via filenames |
| **Storage isolation** | Files are stored in a dedicated `server/uploads/` directory, not in the web root |

### Document Text Extraction

- **PDF parsing**: Uses the `pdf-parse` library for text-only extraction. No executable content is processed from PDF files.
- **DOCX parsing**: Uses the `mammoth` library for content extraction. Only text content is extracted; embedded macros, scripts, and OLE objects are ignored.
- **TXT files**: Read as UTF-8 text directly.

Document text is combined using a separator marker (`--- DOCUMENT SEPARATOR ---`) and held in memory during pipeline execution. Document text is not persisted to disk after extraction — only the original uploaded files remain on the file system.

### Processing Isolation

- Each assessment pipeline runs in its own in-memory context.
- Document text is passed through the pipeline as a string parameter, not as file system references.
- AI agent prompts include only the first 8,000 characters of document text to limit exposure in API calls.

---

## Data Privacy

### Data at Rest

| Data Type | Storage | Persistence |
|-----------|---------|-------------|
| Uploaded documents | Server file system (`uploads/`) | Persisted until manually deleted |
| Assessment sessions | Server in-memory store | Volatile (cleared on server restart) |
| Assessment results | Client `localStorage` | Persisted in browser until cleared |
| Chat conversations | Client component state | Ephemeral (cleared on page reload) |
| API keys | Server `.env` file | Not committed to version control |

### Data in Transit

- **Frontend ↔ Backend**: HTTP communication over localhost in development. In production deployments, HTTPS should be configured at the reverse proxy or load balancer level.
- **Backend → Groq API**: HTTPS with Bearer token authentication. Document excerpts (up to 8,000 characters) are sent to Groq for AI analysis.
- **Backend → OmniAgent**: HTTPS with Bearer token authentication. Payload includes assessment context data.
- **Backend → Python ML Service**: HTTP on localhost (port 5001). Designed for same-host deployment only.

### Sensitive Data Handling

- **API keys** (`GROQ_API_KEY`, `GENW_API_KEY`) are loaded from environment variables and never logged or included in API responses.
- The `.env` file is listed in `.gitignore` and an `.env.example` template is provided with placeholder values.
- Organization names, assessment scores, and gap details are included in API responses to the client but are not logged to server-side files.

---

## Access Control

### Current Architecture

SentriX is currently deployed as a single-user application without authentication. It is designed for:
- Local development and demonstration
- Single-organization assessment sessions
- Hackathon evaluation environments

All API endpoints are publicly accessible on the configured port. This is appropriate for the current deployment context (local development, demo environments).

### Production Readiness Considerations

For production deployment, the following access controls should be implemented:

| Layer | Recommendation |
|-------|---------------|
| **Authentication** | JWT or OAuth 2.0 integration with enterprise identity provider |
| **Authorization** | Role-based access (Admin, Auditor, Viewer) with route-level middleware |
| **API rate limiting** | Per-user request limits to prevent abuse |
| **Session management** | Server-side session tokens with expiration |
| **CORS policy** | Restrict `CLIENT_URL` to the specific production domain |

---

## Audit Logging

### Assessment Pipeline Audit Trail

Every assessment execution generates an audit trail in the orchestration metadata:

```json
{
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
  }
}
```

This records:
- Which AI provider was used for each agent (GenW, Groq, local)
- Execution timing for each stage
- Whether any agents fell back to alternative providers
- Summary of each agent's work

### Copilot Response Audit Trail

Every copilot response includes an audit trail:

```json
{
  "auditTrail": {
    "responseMode": "groq",
    "structuredFormat": true,
    "assessmentReference": "assessment-id",
    "contextSources": ["organization-profile", "clause-scores", "gaps"],
    "pipelineProvider": "groq",
    "generatedAt": "2026-03-09T10:05:30Z",
    "caveats": []
  }
}
```

This enables:
- Traceability of which data sources informed each response
- Identification of whether responses used AI or local generation
- Assessment-level linkage for response context verification

### Runtime Session Logging

The `AssessmentRuntimeStore` accumulates timestamped log entries during pipeline execution:

```json
{
  "logs": [
    { "message": "Document Parsing agent started", "timestamp": "2026-03-09T10:00:00Z" },
    { "message": "Document Parsing agent completed: Parsed 3 documents", "timestamp": "2026-03-09T10:00:05Z" }
  ]
}
```

These logs are streamed to connected clients via SSE during execution and can be reviewed retrospectively via the Agent Monitoring page.

---

## Secure Storage

### File System

- Uploaded documents are stored at `server/uploads/` with UUID-based filenames
- The uploads directory is created automatically on server startup
- Files are served via Express static middleware for download functionality
- No directory listing is exposed

### Environment Variables

| Variable | Sensitivity | Purpose |
|----------|------------|---------|
| `GROQ_API_KEY` | High | Groq Cloud API authentication |
| `GENW_API_KEY` | High | OmniAgent platform authentication |
| `GENW_API_BASE_URL` | Medium | OmniAgent endpoint URL |
| `PORT` | Low | Server listening port |
| `CLIENT_URL` | Low | CORS allowed origin |

All high-sensitivity variables are:
- Loaded via `dotenv` at server startup
- Never included in client-facing responses
- Listed in `.gitignore` via the `.env` file

### Client-Side Storage

Assessment data persisted in `localStorage` (key: `SentriX-store`) includes:
- Assessment results with scores and findings
- Organization profile
- Theme preferences
- Notifications

This data is scoped to the browser origin and is not accessible cross-origin.

---

## Input Validation

### API Request Validation

| Endpoint | Validation |
|----------|-----------|
| `POST /api/assessment/start` | Requires `standards` array and `orgProfile` object |
| `POST /api/upload` | Multer middleware validates file types and sizes |
| `POST /api/chat/copilot` | Requires `message` field |
| `POST /api/policy/download` | Requires `policyDocument` with sections array |

### Document Content Handling

- Document text is processed as read-only strings — no dynamic evaluation (no `eval()`, no template injection)
- AI prompts use string concatenation with document excerpts, not user-controlled templates
- JSON response parsing uses `JSON.parse()` with error handling, including extraction from markdown code blocks

---

## Dependencies

### Backend Dependencies and Security

| Package | Version | Purpose | Security Notes |
|---------|---------|---------|---------------|
| `express` | 5.x | Web framework | Express 5 includes improved async error handling |
| `cors` | 2.8.x | Cross-origin resource sharing | Configured with `CLIENT_URL` origin restriction |
| `multer` | 2.1.x | File upload handling | Configured with type/size restrictions |
| `groq-sdk` | 0.37.x | Groq API client | Uses HTTPS with API key auth |
| `pdf-parse` | 2.4.x | PDF text extraction | Text-only extraction, no script execution |
| `mammoth` | 1.11.x | DOCX text extraction | Content extraction only |
| `uuid` | 13.x | ID generation | Cryptographically strong random UUIDs |
| `dotenv` | 17.x | Environment variable loading | Loads from `.env` file |

### Frontend Dependencies

| Package | Version | Security Notes |
|---------|---------|---------------|
| `axios` | 1.13.x | HTTP client with centralized error handling |
| `zustand` | 5.x | State management (localStorage persistence) |
| `react` | 19.x | Latest stable release |
| `fuse.js` | 7.x | Client-side fuzzy search (no server calls) |
