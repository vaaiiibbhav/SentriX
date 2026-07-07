# Future Roadmap

## Overview

SentriX is designed as an extensible compliance intelligence platform. This roadmap outlines planned capabilities, architectural improvements, and expansion areas based on the current codebase foundation.

---

## Phase 1 — Platform Hardening

**Priority: High | Complexity: Medium**

These improvements build on existing architecture to make the platform production-ready.

### Database Persistence

**Current state**: Assessment results are stored in server-side in-memory sessions (volatile) and client-side `localStorage`.

**Target**:
- PostgreSQL database for assessment storage, audit logs, and standards data
- Migration from `AssessmentRuntimeStore` to a persistent session model
- Queryable assessment history with filtering and comparison
- Assessment version tracking for re-assessment workflows

### Authentication and Authorization

**Current state**: No authentication — all endpoints are publicly accessible.

**Target**:
- JWT-based authentication with refresh tokens
- OAuth 2.0 / SSO integration (Google Workspace, Microsoft Entra ID, Okta)
- Role-based access control: Admin, Compliance Officer, Auditor, Viewer
- Route-level middleware for endpoint protection
- API key management for programmatic access

### Multi-Tenant Architecture

**Current state**: Single-user, single-organization model.

**Target**:
- Tenant isolation at the data layer
- Organization-level settings and branding
- Cross-tenant standard library sharing
- Tenant-scoped API keys and access policies

---

## Phase 2 — Intelligence Enhancement

**Priority: High | Complexity: High**

These features deepen the AI-powered analysis capabilities.

### Enhanced ML Scoring Pipeline

**Current state**: Three-tier scoring with optional Python ML service (sentence-transformers).

**Target**:
- Fine-tuned compliance-specific embedding models
- Domain-adapted models for industry-specific standards (healthcare, fintech)
- Confidence calibration using historical assessment data
- Ensemble scoring combining multiple model outputs

### Evidence Chain Validation

**Current state**: Evidence is classified into 4 categories (Direct, Partial, Inferred, None) using AI analysis.

**Target**:
- Multi-document cross-referencing for evidence validation
- Automated evidence gap identification with document section suggestions
- Evidence strength scoring based on specificity and recency
- Support for evidence attachments (screenshots, audit logs, certificates)

### Remediation Intelligence

**Current state**: Static remediation actions generated per gap.

**Target**:
- Dynamic remediation plans with dependency ordering
- Effort estimation based on organization profile and gap severity
- Resource allocation suggestions
- Progress tracking with milestone verification
- Integration with project management tools (Jira, Azure DevOps)

### Simulation Engine

**Current state**: Compliance readiness forecasting uses projection algorithms.

**Target**:
- "What-if" scenario modeling: simulate impact of specific remediation actions
- Timeline simulation: project compliance trajectory under different investment levels
- Risk scenario modeling: simulate audit outcomes based on current posture
- Comparative analysis: benchmark against industry peer organizations

---

## Phase 3 — Standards Expansion

**Priority: Medium | Complexity: Medium**

Expand coverage beyond the current ISO standard set.

### Additional Standards

| Standard | Domain | Status |
|----------|--------|--------|
| SOC 2 Type II | Service organizations | Planned |
| GDPR | Data privacy (EU) | Planned |
| HIPAA | Healthcare (US) | Planned |
| PCI DSS 4.0 | Payment card industry | Planned |
| NIST CSF 2.0 | Cybersecurity (US) | Planned |
| FedRAMP | US government cloud | Future |
| ISO 42001 | AI management systems | Future |

### Cross-Standard Mapping

**Current state**: Standards are assessed independently.

**Target**:
- Automated control mapping between overlapping standards
- Unified control library with multi-standard linkage
- "Assess once, map many" — single evidence set mapped to multiple frameworks
- Compliance coverage matrix showing standard intersections

### Custom Framework Support

**Target**:
- User-defined compliance frameworks
- Custom clause definition with scoring criteria
- Import frameworks from CSV/JSON/XBRL
- Framework versioning and change tracking

---

## Phase 4 — Enterprise Features

**Priority: Medium | Complexity: High**

Enterprise-grade capabilities for large-scale deployment.

### Reporting and Export

**Current state**: PDF report generation via jsPDF.

**Target**:
- Branded report templates with organization logo and styling
- Executive summary auto-generation
- Board-ready compliance dashboards
- Scheduled report generation and distribution
- Export to Excel, PowerPoint, and compliance-specific formats (XBRL)

### Collaboration

**Target**:
- Multi-user assessment workflows with task assignment
- Comment and annotation system on assessment findings
- Review and approval workflows for remediation actions
- Real-time collaborative editing using WebSocket/CRDT
- Notification system (email, in-app, Slack/Teams webhooks)

### Audit Management

**Target**:
- Audit scheduling and calendar management
- Auditor assignment and workload tracking
- Finding management with response workflows
- Corrective action tracking with evidence collection
- Audit history timeline with change tracking

### Integration Ecosystem

**Target**:
- GRC platform connectors (ServiceNow, Archer, OneTrust)
- Document management system integration (SharePoint, Google Drive)
- SIEM integration for continuous compliance monitoring
- Webhook system for third-party event triggering
- REST API with comprehensive OpenAPI specification

---

## Phase 5 — Advanced Analytics

**Priority: Low | Complexity: High**

Advanced data science and analytics capabilities.

### Continuous Compliance Monitoring

**Target**:
- Scheduled re-assessments with drift detection
- Automated compliance regression alerts
- Control effectiveness metrics over time
- Integration with cloud configuration monitoring (AWS Config, Azure Policy)

### Predictive Analytics

**Target**:
- Machine learning models trained on historical assessment data
- Predictive risk scoring based on organizational characteristics
- Anomaly detection for compliance metric deviations
- Industry trend analysis and benchmarking

### Dark Mode and Accessibility

**Current state**: Theme infrastructure exists (`ThemeController` in `useAppStore`). CSS custom properties define the color system.

**Target**:
- Complete dark mode theme with proper contrast ratios
- WCAG 2.1 AA compliance for all UI components
- Keyboard navigation improvements
- Screen reader optimization
- High-contrast mode option

---

## Technical Debt

These items represent known areas for improvement in the current codebase.

| Area | Current | Target |
|------|---------|--------|
| **Testing** | No test suite | Unit tests for services, integration tests for API, E2E tests for workflows |
| **Error handling** | Basic try/catch | Structured error types, centralized error middleware, user-friendly error messages |
| **Logging** | Console output | Structured logging (Winston/Pino) with log levels and rotation |
| **Type safety** | Partial typing | Full type coverage, strict mode, no `any` types |
| **API validation** | Manual checks | Schema validation with Zod or Joi |
| **Rate limiting** | None | Per-endpoint rate limiting with configurable thresholds |
| **Caching** | None | Redis-based caching for standards data and ML model outputs |

---

## Contributing to the Roadmap

Roadmap priorities are driven by:
1. User feedback from compliance teams
2. Industry demand for specific standard support
3. Technical feasibility within the current architecture
4. Security and compliance requirements for the platform itself

See [12-CONTRIBUTING-GUIDE.md](12-CONTRIBUTING-GUIDE.md) for how to contribute features and proposals.
