# Contributing Guide

## Overview

This guide covers how to extend SentriX — adding new compliance standards, building new AI agents, creating analytics modules, and working with the codebase.

---

## Project Structure

```
SentriX/
├── client/                     # React frontend
│   └── src/
│       ├── components/         # UI components
│       │   ├── analytics/      # Analytics visualizations
│       │   ├── dashboard/      # Dashboard widgets
│       │   ├── layout/         # App shell (Sidebar, Navbar)
│       │   ├── reports/        # Report panels
│       │   └── ui/             # Shared primitives
│       ├── config/             # Navigation config
│       ├── data/               # Client-side data files
│       ├── hooks/              # Custom React hooks
│       ├── pages/              # Route pages
│       ├── store/              # Zustand state management
│       ├── styles/             # Global CSS
│       ├── types/              # TypeScript types
│       └── utils/              # Utility modules
├── server/                     # Express backend
│   └── src/
│       ├── agents/             # AI agent orchestration
│       ├── data/               # Standards data files
│       ├── middleware/         # Express middleware
│       ├── routes/             # API route handlers
│       ├── services/           # Business logic services
│       └── types/              # TypeScript types
└── docs/                       # Documentation
```

---

## Development Setup

```bash
# Server (terminal 1)
cd server
npm install
cp .env.example .env      # Configure your GROQ_API_KEY
npm run dev                # Starts on port 3001

# Client (terminal 2)
cd client
npm install
npm run dev                # Starts on port 5173
```

See [10-DEPLOYMENT.md](10-DEPLOYMENT.md) for detailed setup instructions.

---

## Adding a New Compliance Standard

Adding a new standard (e.g., SOC 2) requires changes in four locations.

### Step 1: Add Standard Definition (Server)

Edit `server/src/data/isoStandards.ts` and add to the `isoStandards` array:

```typescript
{
  code: 'SOC2',
  name: 'SOC 2 Type II',
  description: 'Service Organization Control 2 — Trust Services Criteria',
  version: '2024',
  clauses: [
    {
      id: 'CC1.1',
      title: 'Control Environment',
      description: 'The entity demonstrates a commitment to integrity and ethical values.',
      category: 'Common Criteria',
      requirements: [
        'Board oversight of internal controls',
        'Code of conduct established and communicated'
      ]
    },
    // ... additional clauses
  ]
}
```

### Step 2: Add Questionnaire (Server)

Edit `server/src/data/isoQuestionnaires.ts` and add a questionnaire:

```typescript
{
  standardCode: 'SOC2',
  questions: [
    {
      id: 'soc2-q1',
      clauseRef: 'CC1.1',
      question: 'Does the organization have a formally documented code of conduct?',
      evidenceHints: ['Code of conduct document', 'Board meeting minutes'],
      weight: 0.8
    },
    // ... additional questions
  ]
}
```

### Step 3: Update Knowledge Base (Server)

Edit `server/src/data/complianceKnowledgeBase.ts` to add domain knowledge entries for the new standard.

### Step 4: Add Client-Side Data

Edit `client/src/data/standards.ts` and `client/src/data/complianceData.ts` to include:
- Standard listing for the Standards Library page
- Clause definitions for clause-level detail views
- Any default questionnaire data needed for client-side rendering

The pipeline will automatically process the new standard during assessment if it appears in the `isoStandards` data.

---

## Adding a New AI Agent

The assessment pipeline is a sequential chain of agents. Adding a new agent requires changes to the agent runner and pipeline service.

### Step 1: Create the Prompt Builder

In `server/src/agents/agentRunner.ts`, add a new prompt builder function:

```typescript
function buildNewAgentPrompt(context: PipelineContext): string {
  return `You are a compliance ${agentRole} agent.

Organization: ${context.orgProfile.name}
Industry: ${context.orgProfile.industry}

Previous analysis:
${JSON.stringify(context.previousResults)}

Provide your analysis in the following JSON format:
{
  "findings": [...],
  "recommendations": [...]
}`;
}
```

### Step 2: Register the Agent

In `server/src/services/CompliancePipelineService.ts`, add the agent to the pipeline execution sequence in the `run()` method:

```typescript
// After existing agents, before scoring
const newAgentResult = await this.executeAgent(
  'New Agent Name',
  buildNewAgentPrompt,
  context,
  sessionId
);
context.newAgentOutput = newAgentResult;
```

### Step 3: Add GenW Module Mapping (Optional)

If the agent has a OmniAgent equivalent, add the mapping in `server/src/services/GenWAIBridge.ts`:

```typescript
{
  moduleId: 'new-module',
  name: 'New Module Name',
  endpoint: '/api/v1/new-module',
  description: 'Description of the module',
  inputSchema: { /* expected input fields */ },
  outputSchema: { /* expected output fields */ }
}
```

### Step 4: Update SSE Events

The agent will automatically emit SSE events (`agent-start`, `agent-complete`) via the pipeline service. The frontend Agent Monitoring page will display the new agent automatically.

---

## Adding an Analytics Component

### Step 1: Create the Component

Create a new file in `client/src/components/analytics/`:

```tsx
import { motion } from 'framer-motion';

interface Props {
  data: YourDataType;
}

export default function NewAnalyticsWidget({ data }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-200 p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Widget Title
      </h3>
      {/* Visualization content */}
    </motion.div>
  );
}
```

### Step 2: Integrate Into a Page

Import and render the component in the appropriate page (`AnalyticsPage.tsx`, `DashboardPage.tsx`, etc.):

```tsx
import NewAnalyticsWidget from '../components/analytics/NewAnalyticsWidget';

// Inside the page component
<NewAnalyticsWidget data={assessmentData} />
```

### Design Guidelines

- Use `framer-motion` for entrance animations
- Follow the card pattern: white background, `rounded-2xl`, `border-gray-200`
- Use `Recharts` for charts and `D3` for custom visualizations
- Use Tailwind CSS utility classes — no custom CSS files
- Responsive: use `grid` with responsive column counts

---

## Adding a New API Endpoint

### Step 1: Create the Route File

Create a new file in `server/src/routes/`:

```typescript
import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    // Implementation
    res.json({ data: result });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
```

### Step 2: Register the Route

In `server/src/index.ts`, add the route registration:

```typescript
import newRoutes from './routes/new';
app.use('/api/new', newRoutes);
```

---

## Code Conventions

### TypeScript

- Use TypeScript strict mode
- Define interfaces for all data structures
- Avoid `any` — use `unknown` with type narrowing
- Export types from `/types/` directories

### React Components

- Use functional components with hooks
- Colocate component-specific types with the component
- Use `motion.div` from Framer Motion for animated containers
- Use the `@/` path alias for imports (resolves to `client/src/`)

### Styling

- Tailwind CSS utility classes exclusively — no custom CSS files per component
- Common patterns:
  - Cards: `bg-white rounded-2xl border border-gray-200 p-6 shadow-sm`
  - Headings: `text-lg font-semibold text-gray-900`
  - Muted text: `text-sm text-gray-500`
  - Gradients: `bg-gradient-to-r from-blue-500 to-indigo-600`

### API Design

- RESTful routing: `/api/{resource}/{action}`
- JSON request and response bodies
- Consistent error response format: `{ error: string, message: string }`
- SSE for streaming: use `text/event-stream` content type

---

## Documentation

When adding features, update the relevant documentation files in `/docs/`:

| Change | Docs to Update |
|--------|---------------|
| New standard | [01-PROJECT-OVERVIEW.md](01-PROJECT-OVERVIEW.md), [07-DATA-MODEL.md](07-DATA-MODEL.md) |
| New AI agent | [03-AI-AGENT-PIPELINE.md](03-AI-AGENT-PIPELINE.md), [05-BACKEND-SERVICES.md](05-BACKEND-SERVICES.md) |
| New API endpoint | [06-API-DOCUMENTATION.md](06-API-DOCUMENTATION.md) |
| New analytics module | [04-FRONTEND-ARCHITECTURE.md](04-FRONTEND-ARCHITECTURE.md), [08-ANALYTICS-AND-SCORING.md](08-ANALYTICS-AND-SCORING.md) |
| Security changes | [09-SECURITY-AND-DATA-HANDLING.md](09-SECURITY-AND-DATA-HANDLING.md) |
| Deployment changes | [10-DEPLOYMENT.md](10-DEPLOYMENT.md) |
