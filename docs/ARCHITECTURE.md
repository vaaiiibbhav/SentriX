# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT  (React 19 + Vite 6)               │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌───────────┐  │
│  │  Zustand  │  │  Router  │  │  Framer   │  │ Tailwind  │  │
│  │  Store    │  │  v6      │  │  Motion   │  │  CSS v4   │  │
│  └────┬─────┘  └────┬─────┘  └───────────┘  └───────────┘  │
│       │              │                                       │
│  ┌────┴──────────────┴───────────────────────────────┐      │
│  │         8 Lazy-loaded Page Components              │      │
│  │  Landing │ Dashboard │ Assessment │ Standards      │      │
│  │  AgentWorkflow │ Analytics │ Reports │ Settings    │      │
│  └────┬──────────────────────────────────────────────┘      │
│       │ fetch() + EventSource (SSE)                          │
└───────┼─────────────────────────────────────────────────────┘
        │ HTTP / SSE  (port 5173 → proxy → 3001)
┌───────┼─────────────────────────────────────────────────────┐
│       │          SERVER  (Express 5 + TypeScript)            │
│  ┌────┴──────────────────────────────────────────────┐      │
│  │           6 Route Modules                          │      │
│  │  /api/assessment │ /api/chat   │ /api/standards   │      │
│  │  /api/upload     │ /api/report │ /api/demo        │      │
│  └────┬──────────────────────────────────────────────┘      │
│       │                                                      │
│  ┌────┴──────────────────────────────────────────────┐      │
│  │        Agent Orchestrator  (orchestrator.ts)       │      │
│  │                                                    │      │
│  │  Step 1 : Document Agent                           │      │
│  │  Step 2 : ┌──────┐┌──────┐┌──────┐┌──────┐       │      │
│  │           │Brib. ││Gov.  ││Sec.  ││Qual. │       │      │
│  │           │Agent ││Agent ││Agent ││Agent │       │      │
│  │           └──────┘└──────┘└──────┘└──────┘       │      │
│  │  Step 3 : Gap Analysis Agent                       │      │
│  │  Step 4 : Evidence Validation Agent (NOVEL)        │      │
│  │  Step 5 : Remediation Agent                        │      │
│  └────┬──────────────────────────────────────────────┘      │
│       │                                                      │
│  ┌────┴──────────────────────────────────────────────┐      │
│  │         Services Layer                             │      │
│  │  HybridScoringService │ DocumentParser             │      │
│  │  GenWAIBridge          │ AgentRunner               │      │
│  └────┬──────────────────────────────────────────────┘      │
│       │                                                      │
└───────┼─────────────────────────────────────────────────────┘
        │
┌───────┼─────────────────────────────────────────────────────┐
│       │       EXTERNAL SERVICES                              │
│  ┌────┴──────┐  ┌─────────────┐  ┌────────────┐            │
│  │ Anthropic │  │  ML Service  │  │  OmniAgent™  │            │
│  │ Claude    │  │  (Python,    │  │  Platform   │            │
│  │ Sonnet 4  │  │  optional)   │  │ (production)│            │
│  └───────────┘  └─────────────┘  └────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Technology Stack
- **React 19** with TypeScript strict mode
- **Vite 6** for development HMR and production builds
- **Tailwind CSS v4** with custom `@theme` design tokens (Enterprise Core brand palette)
- **Framer Motion** for `AnimatePresence` page transitions and micro-animations
- **Zustand** for global state (assessment results, agent statuses, chat messages, settings)
- **React Router v6** with lazy-loaded route components wrapped in `<Suspense>`
- **Recharts** for radar charts, bar charts, and data visualizations
- **Lucide React** for a consistent icon system

### Routing & Code Splitting
All 8 pages are loaded via `React.lazy()` with `<Suspense>` fallbacks, wrapped in Framer Motion `<AnimatePresence>` for smooth transitions. The `AppLayout` component (sidebar + navbar) wraps all routes except the Landing page.

### State Management
The Zustand store (`client/src/store/`) manages:
- Assessment results, per-standard scores, gaps, evidence validation, remediation actions
- Agent status tracking (9 agents: idle → processing → complete/error)
- Agent log entries (timestamped, typed)
- Chat message history
- Demo mode toggle
- Notification queue

### Component Hierarchy (Dashboard)
```
Dashboard
├── KPI Summary Row (4 × KPICard)
├── Radar Chart (current vs. target scores per standard)
├── Compliance Heatmap (clause × standard matrix)
├── Gap Priority Matrix (impact vs. effort scatter)
├── EvidenceValidationPanel (6-KPI summary + filterable evidence rows)
├── Remediation Timeline (3-phase action cards)
├── Agent Activity Feed
└── ChatAssistant (floating FAB → drawer)
```

---

## Backend Architecture

### Technology Stack
- **Express 5** with TypeScript
- **Anthropic SDK** for Claude claude-sonnet-4-20250514 integration
- **pdf-parse** + **mammoth** for PDF/DOCX document extraction
- **Multer** for multipart file uploads (max 10 files × 20MB each)
- **SSE (Server-Sent Events)** for real-time agent progress streaming
- **uuid** for assessment ID generation

### Route Modules (6)
| Route | Purpose |
|---|---|
| `/api/assessment` | Start assessments, stream progress (SSE), fetch results |
| `/api/chat` | Claude-powered compliance Q&A |
| `/api/standards` | Standards library and clause data |
| `/api/upload` | Multi-file document upload |
| `/api/report` | Executive report generation |
| `/api/demo` | Pre-computed demo assessment data |

### Services Layer
| Service | File | Purpose |
|---|---|---|
| HybridScoringService | `services/HybridScoringService.ts` | 3-tier scoring: ML → Claude → Keyword fallback |
| DocumentParser | `services/documentParser.ts` | PDF/DOCX/TXT text extraction |
| GenWAIBridge | `services/GenWAIBridge.ts` | OmniAgent module registry + agent-module mappings |

### Agent Layer
| File | Purpose |
|---|---|
| `agents/agentRunner.ts` | Prompt builders for all 9 agents + generic `runAgent()` that calls Claude |
| `agents/orchestrator.ts` | 6-step orchestration pipeline, SSE event emission, result aggregation |

---

## Data Flow

### Assessment Flow (End-to-End)
```
1. User fills org profile (company, industry, employees, scope)
2. User selects ISO standards (one or more of 37001/37301/27001/9001)
3. User uploads policy documents (PDF/DOCX/TXT)
4. Client POSTs to /api/assessment/start
   └── Server returns { assessmentId, status: "processing" }
5. Client connects to /api/assessment/:id/stream via EventSource (SSE)
6. Orchestrator runs 6-step pipeline:
   a. Document Agent — parse & structure documents
   b. 4 Standard Agents — HybridScoringService scores each standard
   c. Gap Analysis Agent — cross-standard gap identification
   d. Evidence Validation Agent — validate evidence sufficiency & quality
   e. Remediation Agent — generate phased roadmap
   f. Policy Generator Agent — generate 100% compliant downloadable policies
7. Each agent start/complete/error event streamed to client in real-time
8. Final AssessmentResult stored in-memory and sent via SSE "complete" event
9. Client renders Dashboard with full results
```

### SSE Event Types
| Event Type | Payload | When |
|---|---|---|
| `agent-start` | `{ agent, timestamp }` | Agent begins processing |
| `agent-complete` | `{ agent, timestamp }` | Agent finishes successfully |
| `agent-error` | `{ agent, error, timestamp }` | Agent encounters an error |
| `log` | `{ message, timestamp }` | Agent progress log message |
| `complete` | `{ result, timestamp }` | All agents done, full result |

### State Management
- **Server-side**: In-memory `Map<assessmentId, { status, result, logs }>` (suitable for demo/hackathon)
- **Client-side**: Zustand store persists assessment results after completion
- **Demo mode**: Pre-computed results loaded directly into store without API calls

---

## Key Design Decisions

| Decision | Rationale |
|---|---|
| **SSE over WebSocket** | Simpler protocol for unidirectional server→client streaming; built-in reconnection; HTTP-compatible |
| **Zustand over Redux** | Minimal boilerplate, no action creators/reducers ceremony; perfect for hackathon velocity |
| **Express 5** | Latest stable with improved TypeScript support and async error handling |
| **Vite 6** | Fastest HMR in the ecosystem; native ESM; zero-config Tailwind CSS v4 |
| **Tailwind CSS v4** | Native CSS `@theme` variables; no PostCSS config; design tokens in CSS not JS |
| **3-Tier Hybrid Scoring** | Graceful degradation ensures the app works without ML service or API key |
| **Evidence Validation as separate agent** | Decoupled from scoring — can be independently improved, disabled, or replaced |
| **In-memory assessment store** | Sufficient for hackathon demo; production would use a database |
| **Lazy-loaded routes** | Keeps initial bundle small; 8 pages loaded on demand |
| **Enterprise Core-inspired design** | Professional, enterprise-grade aesthetic with teal/green palette and serif headings |

---

## Error Handling Strategy

- Each agent has independent error handling — if one standard agent fails, others continue
- Gap Analysis uses whatever results are available, even if some agents errored
- `safeParseJSON()` extracts JSON from markdown code blocks or raw text
- Client shows partial results with error indicators for failed agents
- SSE connection handles disconnects gracefully; completed assessments can be fetched via GET

---

## Security Considerations

- File uploads restricted by type (PDF, DOCX, TXT) and size (20MB per file, 10 files max)
- CORS configured to allow only the client origin (`CLIENT_URL` env var)
- API key stored server-side only (never sent to client)
- Document text truncated before sending to external APIs (8000 chars for ML, 4000 for Claude)
- No user authentication in hackathon demo (would use Enterprise Core SSO in production)
