# OmniAgent Integration Guide

## Overview

SentriX integrates with Enterprise Core's OmniAgent platform as the enterprise orchestration layer for ISO governance assessments. The implementation now uses a dedicated GenW bridge, a GenW-aware pipeline service, and an orchestration discovery service so GenW execution, stage ordering, and fallback behavior are explicit and production-operable.

The implemented GenW pipeline covers these agents:

1. Document Parsing Agent
2. Clause Mapping Agent
3. Evidence Validation Agent
4. Compliance Scoring Agent
5. Gap Detection Agent
6. Remediation Planning Agent
7. Policy Generation Agent

Every stage attempts GenW execution first and falls back to local scoring or local agent execution when GenW is unavailable or unconfigured.

## Module Mapping

| OmniAgent Module | ID | SentriX Pipeline Agent(s) | Capability |
|---|---|---|---|
| Document Intelligence | `genw-doc-intel` | Document Parsing Agent | Multi-format document parsing with structural understanding, entity extraction, and section classification |
| Compliance Knowledge Graph | `genw-knowledge` | Clause Mapping Agent, Gap Detection Agent | Standards cross-referencing, clause mapping, and gap inference |
| Evidence Validation Engine | `genw-evidence` | Evidence Validation Agent | AI-powered evidence sufficiency analysis, chain-of-custody verification, and evidence reuse detection |
| Risk Analytics Engine | `genw-risk` | Compliance Scoring Agent | Clause-level readiness scoring, confidence calculation, and analytics support |
| Remediation Planning Engine | `genw-remediation` | Remediation Planning Agent | Phased roadmap generation, resource estimation, and prioritization |
| Policy Generation Engine | `genw-policy` | Policy Generation Agent | AI-powered compliant policy section generation and coverage drafting |
| Audit Trail | `genw-audit` | Platform support module | Reserved for immutable audit logging and evidence governance |

## Integration Architecture

```text
Uploaded Documents / Org Profile
                        |
                        v
CompliancePipelineService
    1. Document Parsing Agent
    2. Clause Mapping Agent
    3. Evidence Validation Agent
    4. Compliance Scoring Agent
    5. Gap Detection Agent
    6. Remediation Planning Agent
    7. Policy Generation Agent
                        |
                        v
GenWAIBridge
    - module registry
    - GenW client
    - streaming transport handler
    - health and configuration checks
                        |
                        +--> GenW endpoint available -> streamed GenW execution
                        |
                        +--> GenW unavailable -> local fallback execution
```

## Production Architecture Patterns

- Bridge pattern: `server/src/services/GenWAIBridge.ts` isolates GenW transport, module resolution, streaming response parsing, and health/configuration checks.
- Pipeline service pattern: `server/src/services/CompliancePipelineService.ts` defines the ordered GenW-aware multi-agent execution flow.
- Graceful degradation: each stage independently falls back to local scoring or local agent execution if GenW fails.
- Capability discovery: `server/src/services/GenWOrchestrationService.ts` exposes runtime status, module catalog, and pipeline metadata.
- Operational API pattern: `server/src/routes/genw.ts` exposes status and discovery endpoints for operations and debugging.
- Execution audit metadata: each completed assessment records whether each stage ran on GenW or on local fallback.

## Runtime Endpoints

| Endpoint | Purpose |
|---|---|
| `/api/genw/status` | Returns GenW configuration, connectivity, fallback state, and ordered pipeline stages |
| `/api/genw/modules` | Returns module catalog and endpoint mapping |
| `/api/genw/pipeline` | Returns the ordered 7-agent orchestration definition |

## Current Implementation Notes

- `CompliancePipelineService.ts` is the execution entry point used by the assessment orchestrator.
- `GenWAIClient.executeAgent()` supports streamed GenW responses when the upstream service uses SSE or NDJSON.
- `GenWAIClient.getHealthStatus()` performs lightweight connectivity checks for operational visibility.
- The assessment result includes orchestration metadata with provider mix (`genw`, `local`, or `hybrid`) and per-stage execution summaries.
- Local fallback remains available for clause mapping, evidence validation, compliance scoring, gap detection, remediation planning, and policy generation.

## Environment Variables

| Variable | Purpose |
|---|---|
| `GENW_API_BASE_URL` | Base URL for the GenW orchestration environment |
| `GENW_API_KEY` | Bearer token used for GenW requests |
| `GENW_TIMEOUT_MS` | Per-request timeout for GenW stage execution |
| `GENW_HEALTH_ENDPOINT` | Endpoint used for GenW health verification |

If these values are unset, SentriX automatically runs in local fallback mode.

## Code Reference

- `server/src/services/GenWAIBridge.ts` — Module registry, GenW client, streaming support, health checks
- `server/src/services/CompliancePipelineService.ts` — Ordered GenW-aware multi-agent pipeline with local fallback
- `server/src/services/GenWOrchestrationService.ts` — Runtime status, module catalog, and pipeline discovery
- `server/src/routes/genw.ts` — Operational API for status, modules, and pipeline metadata
- `server/src/agents/orchestrator.ts` — Thin orchestrator wrapper that delegates execution to the pipeline service
