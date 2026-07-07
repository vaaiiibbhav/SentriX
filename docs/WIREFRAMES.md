# Wireframes & UI Flow

## Page Flow

```
Landing (/)
    │
    ├─── "Start Assessment" ──→ Assessment (/assessment)
    │                              │
    │                              ├─ Step 0: Org Profile
    │                              ├─ Step 1: Document Upload
    │                              ├─ Step 2: AI Processing (9-Agent Animation)
    │                              └─ Step 3: Results Summary
    │                                         │
    │                                         ▼
    └─── "Dashboard" ──────────→ Dashboard (/dashboard)
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
            Standards       Agent Workflow    Analytics
            (/standards)    (/agents)        (/analytics)
                                                    │
                                                    ▼
                                              Reports
                                              (/reports)
```

## Landing Page Layout

```
┌─────────────────────────────────────────────────────┐
│ [Logo] SentriX                    [Get Started pill] │
├─────────────────────────────────────────────────────┤
│                                                      │
│        ┌──────────┐                                  │
│        │ Score    │    SentriX™                      │
│        │ Ring 87% │    Tagline text                  │
│        └──────────┘    [Start Assessment] [Try Demo] │
│                        (pill buttons, teal bg)       │
│                                                      │
│  ┌──── Floating Standard Badges ────┐               │
│  │ ISO 37001  ISO 37301  ISO 27001  ISO 9001 │      │
│  └──────────────────────────────────┘               │
├─────────────────────────────────────────────────────┤
│  500+ Standards │ 37+ Controls │ 80% Faster │ <2hrs │
├─────────────────────────────────────────────────────┤
│  How it Works: Upload → AI Analysis → Actionable    │
├─────────────────────────────────────────────────────┤
│  Standards Showcase (4 Cards)                        │
├─────────────────────────────────────────────────────┤
│  OmniAgent Integration Section                         │
├─────────────────────────────────────────────────────┤
│  Footer                                              │
└─────────────────────────────────────────────────────┘
```

## Dashboard Layout

```
┌──────┬──────────────────────────────────────────────┐
│      │ [Navbar: Title | Pill Search | Demo | Org]    │
│  S   ├──────────────────────────────────────────────┤
│  i   │                                               │
│  d   │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │
│  e   │  │Score │ │ KPI  │ │ KPI  │ │ KPI  │       │
│  b   │  │ Ring │ │ Card │ │ Card │ │ Card │       │
│  a   │  └──────┘ └──────┘ └──────┘ └──────┘       │
│  r   │                                               │
│  (   │  ┌─────────────┐  ┌─────────────┐           │
│  b   │  │ Radar Chart │  │Gap Priority │           │
│  l   │  │  (Current   │  │  Matrix     │           │
│  a   │  │   vs Target)│  │ (Scatter)   │           │
│  c   │  └─────────────┘  └─────────────┘           │
│  k   │                                               │
│  )   │  ┌─────────────┐  ┌─────────────┐           │
│      │  │  Clause     │  │ Agent       │           │
│  w   │  │  Heatmap    │  │ Activity    │           │
│  h   │  └─────────────┘  └─────────────┘           │
│  i   │                                               │
│  t   │  ┌─────────────────────────────┐             │
│  e   │  │ Evidence Validation Panel   │             │
│      │  │ 6 KPIs + Filterable Rows    │             │
│  t   │  └─────────────────────────────┘             │
│  e   │                                               │
│  x   │  ┌─────────────────────────────┐             │
│  t   │  │ Remediation Timeline        │             │
│      │  └─────────────────────────────┘             │
│  t   │                                               │
│  e   │  ┌─────────────────────────────┐             │
│  x   │  │ Policy Generator Panel      │             │
│  t   │  │ 6 KPIs + Policy Cards +     │             │
│      │  │ Download Buttons             │             │
│  t   │  └─────────────────────────────┘             │
│  e   │                          ┌──────────┐        │
│  a   │                          │ Chat FAB │        │
│  l   │                          └──────────┘        │
└──────┴──────────────────────────────────────────────┘
```

## Assessment Wizard

```
Step 0: Organization Profile
┌─────────────────────────────────┐
│  Company: [___________]          │
│  Industry: [Dropdown]            │
│  Employees: [Range]              │
│  Scope: [___________]            │
│                                  │
│  Select Standards:               │
│  [✓ ISO 37001] [✓ ISO 37301]   │
│  [✓ ISO 27001] [✓ ISO 9001]    │
│                     [Next pill]  │
└─────────────────────────────────┘

Step 1: Document Upload
┌─────────────────────────────────┐
│  ┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │
│  │   Drag & Drop Zone       │  │
│  │   PDF, DOCX, TXT         │  │
│  └─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │
│  📄 policy.pdf        [×]      │
│  📄 controls.docx     [×]      │
│              [Back] [Next pill] │
└─────────────────────────────────┘

Step 2: AI Processing (9 Agents)
┌─────────────────────────────────┐
│  Agent Flow Visualization       │
│  [Doc] → [Brib][Gov][Sec][Qual]│
│       → [Gap] → [Evid] → [Rem] → [Pol]│
│                                  │
│  Log Panel (SSE-driven):         │
│  [10:00] 🔍 Document Agent...  │
│  [10:01] ⚖️ Bribery Agent...   │
│  [10:02] 🔐 Evidence Val...    │
│                          [...]   │
└─────────────────────────────────┘

Step 3: Results
┌─────────────────────────────────┐
│  ┌────────┐                     │
│  │  62%   │  Overall Score     │
│  │ Ring   │  Maturity Level 3  │
│  └────────┘                     │
│  4 Standards │ 12 Gaps │ 9 Act │
│                                  │
│      [View Dashboard pill]       │
└─────────────────────────────────┘
```

## Agent Workflow Page

```
┌──────┬──────────────────────────────────────────────┐
│      │                                               │
│  S   │  Agent Orchestration                          │
│  i   │  ┌──────────────┐                            │
│  d   │  │ Document     │                            │
│  e   │  │ Agent        │                            │
│  b   │  └──────┬───────┘                            │
│  a   │         │                                     │
│  r   │  ┌──────┼──────┬──────┐                      │
│      │  │      │      │      │                      │
│      │  ▼      ▼      ▼      ▼                      │
│      │ [Brib] [Gov]  [Sec] [Qual]                   │
│      │  │      │      │      │                      │
│      │  └──────┼──────┴──────┘                      │
│      │         ▼                                     │
│      │  [Gap Analysis]                               │
│      │         ▼                                     │
│      │  [Evidence Validation]  ← NOVEL               │
│      │         ▼                                     │
│      │  [Remediation]                                │
│      │  [Policy Generator]                            │
│      │                                               │
│      │  Agent Detail Cards (9 × 2-col grid)          │
│      │  Each card: icon, name, OmniAgent module,       │
│      │  input spec, output spec, description         │
└──────┴──────────────────────────────────────────────┘
```

## Design System (Enterprise Core-Inspired)

### Color Palette
| Token | Value | Usage |
|---|---|---|
| `--color-dt-teal` | `#0076A8` | Primary actions, links, accents |
| `--color-dt-teal-dark` | `#005A80` | Hover states |
| `--color-dt-teal-light` | `#009CDE` | Active/focus states |
| `--color-dt-green` | `#86BC25` | Enterprise Core brand green, success states |
| `--color-dt-green-dark` | `#6A9A1E` | Green hover |
| `--color-dt-green-light` | `#A8D048` | Green accents |
| `--color-dt-black` | `#000000` | Sidebar, landing background, nav |
| `--color-dt-cool-gray-1` | `#75787B` | Secondary text |
| `--color-dt-cool-gray-2` | `#97999B` | Muted text, borders |
| `--color-dt-cool-gray-3` | `#BBBCBC` | Disabled, subtle borders |

### Risk Severity Colors
| Token | Value | Level |
|---|---|---|
| `--color-risk-critical` | `#E53E3E` | Critical |
| `--color-risk-high` | `#DD6B20` | High |
| `--color-risk-medium` | `#D69E2E` | Medium |
| `--color-risk-low` | `#86BC25` | Low |
| `--color-risk-planned` | `#0076A8` | Planned |

### Typography
| Role | Font | Fallback |
|---|---|---|
| Display headings | Libre Baskerville (serif) | Georgia, serif |
| Body text | Source Sans 3 | Source Sans Pro, system-ui, sans-serif |
| Code / data | JetBrains Mono | Fira Code, Consolas, monospace |

### Surfaces
| Context | Background | Text |
|---|---|---|
| Sidebar | `#000000` (black) | White, teal accents |
| Navbar | `#000000` (black) | White, pill search bar |
| Landing page | `#000000` (dark) | White text, teal/green accents |
| App pages | `#FFFFFF` (white) | Dark text |
| Cards | `#FFFFFF` | Dark text, subtle border |
| Inputs | `#0E0E0E` (dark context) / white | Contextual |

### Component Tokens
| Token | Value |
|---|---|
| Border radius (pill buttons) | `999px` |
| Border radius (cards) | `6px` |
| Border radius (inputs) | `6px` |
| Card shadow | `0 1px 3px rgba(0,0,0,0.08)` |
| Transition duration | `200ms` |
| Transition easing | `ease` |

### Animations
| Animation | Usage |
|---|---|
| `pulse-green` | Active agent indicator |
| `pulse-glow` | Teal glow effect |
| `float` | Floating badge elements |
| `fadeInUp` | Content entrance |
| `shimmer` | Loading skeleton |
| Framer Motion spring | Page transitions, card reveals |
