# SentriX™

> **Agentic AI-Powered Multi-Standard Compliance Assessment Platform**  
> Engineered by Vaibhav Verma for Enterprise Core's Hackathon 2026 | Powered by OmniAgent™

![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![React](https://img.shields.io/badge/React-19-61dafb)
![Claude](https://img.shields.io/badge/Claude-sonnet--5%20%7C%20fable--5-orange)
![Express](https://img.shields.io/badge/Express-5-green)
![License](https://img.shields.io/badge/License-Proprietary-red)

---

## What is SentriX?

SentriX is a **production-grade enterprise application** that transforms how organizations approach regulatory compliance. Upload your policy documents and receive **instant readiness scores, gap analysis, evidence validation, maturity levels, and phased remediation roadmaps** across multiple ISO standards simultaneously — powered by a pipeline of specialized AI agents and a 3-tier hybrid scoring engine.

**Supported Standards**: ISO 37001 (Anti-Bribery) · ISO 37301 (Compliance) · ISO 27001 (InfoSec) · ISO 9001 (Quality) · ISO 37000 (Governance) · ISO 37002 (Whistleblowing)

---

## Key Differentiators

| Innovation | Description |
|---|---|
| **7-Agent Orchestrated Pipeline** | Coordinated team of specialized AI agents that hand off structured context through a sequential pipeline |
| **3-Tier Hybrid Scoring** | ML semantic scoring → Groq AI enhancement → keyword+NLP fallback with graceful degradation |
| **Evidence Validation** | Validates whether cited evidence actually supports compliance claims — checks sufficiency, quality, and cross-standard reuse |
| **Policy Generation** | Generates compliant policy documents addressing all identified gaps for immediate download |
| **Cross-Standard Synergy** | Identifies where a single remediation action satisfies requirements across multiple standards |
| **Real-Time Streaming** | SSE-based live progress as each agent executes |
| **OmniAgent Integration** | Architected for Enterprise Core's OmniAgent infrastructure with transparent fallback |

---

## Quick Start

### Prerequisites

- **Node.js** 18+ and **npm** 9+
- **Anthropic API key** (optional — demo mode works without it)
- **Python 3.9+** (optional — for ML scoring)
- **PostgreSQL 14+** (optional — for persisted assessment sessions/results)

### Install and Run

```bash
# Server
cd server
npm install
cp .env.example .env          # Add your ANTHROPIC_API_KEY and optional DATABASE_URL
npm run dev                    # → http://localhost:3001

# Client (separate terminal)
cd client
npm install
npm run dev                    # → http://localhost:5173
```

### Optional Postgres Persistence

If you want assessment sessions, logs, uploaded-document metadata, and final results to survive server restarts, set `DATABASE_URL` in `.env`:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/SentriX
```

You can start a local Postgres instance from the repo root with:

```bash
docker compose up -d postgres
```

When `DATABASE_URL` is present, the server bootstraps the required `assessment_sessions` table automatically on startup. If it is absent, the backend continues using the existing in-memory runtime store.

### Demo Mode

Click **"Try Demo"** in the navbar to load a complete sample assessment with all agents' output — no API keys or uploads required.

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, TypeScript, Vite 6, Tailwind CSS 4, Framer Motion, Recharts, Zustand, React Router 7 |
| **Backend** | Express 5, TypeScript, Anthropic SDK, Groq SDK, pg, pdf-parse, mammoth, Multer, SSE |
| **AI/ML** | Anthropic Claude (`claude-sonnet-5`, `claude-fable-5`), Groq Cloud (`openai/gpt-oss-120b`), sentence-transformers (Python), OmniAgent platform |
| **Tooling** | ESLint, tsx (watch mode), jsPDF, D3, Fuse.js |

---

## Architecture at a Glance

```
Client (React)  ──HTTP/SSE──▶  Express API  ──▶  AI Pipeline (7 agents)
                                    │                    │
                                    ├──▶ Claude API      ├──▶ Document Parsing
                                    ├──▶ Groq Cloud      ├──▶ Standard Scoring (×4)
                                    ├──▶ OmniAgent       ├──▶ Gap Analysis
                                    └──▶ Python ML       ├──▶ Evidence Validation
                                                         ├──▶ Remediation Planning
                                                         └──▶ Policy Generation
```

The pipeline uses a **3-tier provider cascade** — OmniAgent → Anthropic Claude → local generation — so every agent produces results regardless of external service availability.

---

## Project Structure

```
SentriX/
├── client/                     # React 19 frontend
│   └── src/
│       ├── components/         # Layout, dashboard, analytics, reports, UI primitives
│       ├── pages/              # 13 route pages
│       ├── store/              # Zustand state management
│       ├── hooks/              # Custom React hooks
│       ├── utils/              # API client, helpers, report generation
│       ├── data/               # Standards data, demo assessment data
│       └── types/              # TypeScript interfaces
├── server/                     # Express 5 backend
│   └── src/
│       ├── agents/             # Agent runner + orchestrator
│       ├── services/           # Pipeline, scoring, copilot, GenW bridge
│       ├── routes/             # 8 API route modules
│       ├── data/               # ISO standards, questionnaires, knowledge base
│       └── middleware/         # File upload handling
├── docs/                       # Comprehensive documentation (13 sections)
└── .env.example
```

---

## Documentation

SentriX includes a comprehensive documentation system covering every aspect of the platform.

### Architecture & Design

| Document | Description |
|---|---|
| [01 — Project Overview](docs/01-PROJECT-OVERVIEW.md) | Problem statement, target users, capabilities, supported standards |
| [02 — System Architecture](docs/02-SYSTEM-ARCHITECTURE.md) | Layer architecture, data flow diagrams, design decisions |
| [03 — AI Agent Pipeline](docs/03-AI-AGENT-PIPELINE.md) | All 7 pipeline agents with inputs, processing, outputs, and prompt patterns |
| [04 — Frontend Architecture](docs/04-FRONTEND-ARCHITECTURE.md) | Component system, routing, state management, design system |
| [05 — Backend Services](docs/05-BACKEND-SERVICES.md) | Service catalog, pipeline orchestration, scoring engine, GenW bridge |

### Reference

| Document | Description |
|---|---|
| [06 — API Documentation](docs/06-API-DOCUMENTATION.md) | All endpoints with request/response examples |
| [07 — Data Model](docs/07-DATA-MODEL.md) | Entity definitions, TypeScript interfaces, ER diagrams |
| [08 — Analytics & Scoring](docs/08-ANALYTICS-AND-SCORING.md) | Scoring algorithms, confidence calculation, forecasting |

### Operations & Planning

| Document | Description |
|---|---|
| [09 — Security & Data Handling](docs/09-SECURITY-AND-DATA-HANDLING.md) | Upload controls, data privacy, audit logging, dependency security |
| [10 — Deployment Guide](docs/10-DEPLOYMENT.md) | Local setup, production build, Docker, environment configuration |
| [11 — Future Roadmap](docs/11-FUTURE-ROADMAP.md) | Planned features across 5 phases |
| [12 — Contributing Guide](docs/12-CONTRIBUTING-GUIDE.md) | How to add standards, agents, analytics modules, and endpoints |

### Legacy Documentation

| Document | Description |
|---|---|
| [Agent Design](docs/AGENT_DESIGN.md) | Original multi-agent pipeline specification |
| [API Reference](docs/API_REFERENCE.md) | Original API endpoint reference |
| [Architecture](docs/ARCHITECTURE.md) | Original system architecture document |
| [Evidence Validation](docs/EVIDENCE_VALIDATION.md) | Evidence Validation Agent specification |
| [OmniAgent Integration](docs/OmniAgent_INTEGRATION.md) | OmniAgent platform integration guide |
| [Novelty](docs/NOVELTY.md) | Value proposition and differentiators |
| [Scoring Engine](docs/SCORING_ENGINE.md) | 3-tier hybrid scoring documentation |
| [Wireframes](docs/WIREFRAMES.md) | UI flow wireframes and design tokens |

---

## License

Proprietary — Built for Enterprise Core Hackathon 2026 by Vaibhav Verma

**SentriX™** — *Where Integrity Meets Compliance Intelligence*
