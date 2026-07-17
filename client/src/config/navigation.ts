import {
  Activity,
  BarChart3,
  Bot,
  BookOpen,
  ClipboardCheck,
  Command,
  FileText,
  LayoutDashboard,
  LibraryBig,
  PanelsTopLeft,
  Settings2,
  ShieldCheck,
  Siren,
  Workflow,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

export interface NavigationItem {
  path: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

export interface NavigationSection {
  label: string;
  items: NavigationItem[];
}

export const navigationSections: NavigationSection[] = [
  {
    label: 'Workspace',
    items: [
      { path: '/dashboard', label: 'Dashboard', description: 'Executive posture and readiness summary', icon: LayoutDashboard },
      { path: '/assessment', label: 'Assessment Pipeline', description: 'Run AI-led multi-agent compliance assessments', icon: ClipboardCheck },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { path: '/standards', label: 'Standards', description: 'ISO clause libraries, questionnaires, and audit overlays', icon: BookOpen },
      { path: '/control-library', label: 'Control Library', description: 'Compliance controls mapped to clause requirements', icon: ShieldCheck },
    ],
  },
  {
    label: 'Analysis',
    items: [
      { path: '/analytics', label: 'Analytics', description: 'Trends, heatmaps, and portfolio readiness analytics', icon: BarChart3 },
      { path: '/risk-intelligence', label: 'Risk Intelligence', description: 'Benchmarking, top gaps, and regulatory pressure indicators', icon: Siren },
      { path: '/knowledge-base', label: 'Knowledge Base', description: 'Standards frameworks, maturity models, and clause crosswalks', icon: LibraryBig },
    ],
  },
  {
    label: 'Reporting',
    items: [
      { path: '/reports', label: 'Reports', description: 'Executive briefings, findings, and downloadable outputs', icon: FileText },
    ],
  },
];

export const utilityNavigationItems: NavigationItem[] = [
  { path: '/agents', label: 'Agent Workflow', description: 'Orchestration design and pipeline outputs', icon: Workflow },
  { path: '/agent-monitoring', label: 'Agent Monitoring', description: 'Runtime execution state and activity logs', icon: Activity },
  { path: '/remediation-tracker', label: 'Remediation Tracker', description: 'Phased action plan and accountable owners', icon: Wrench },
  { path: '/settings', label: 'Settings', description: 'Environment configuration and workspace controls', icon: Settings2 },
];

export const quickAccessItems: NavigationItem[] = [
  { path: '/dashboard', label: 'Platform', description: 'Launch the enterprise compliance intelligence workspace', icon: PanelsTopLeft },
  { path: '/assessment', label: 'New Assessment', description: 'Start a guided multi-agent compliance assessment', icon: Command },
  { path: '/knowledge-base', label: 'Knowledge Base', description: 'Explore standards intelligence and clause crosswalks', icon: LibraryBig },
  { path: '/reports', label: 'Reports', description: 'Review executive briefings and downloadable outputs', icon: FileText },
  { path: '/agents', label: 'AI Copilot', description: 'Inspect the AI workflow and operating context', icon: Bot },
];

export const workspaceOptions = [
  { id: 'enterprise', label: 'Enterprise Workspace', description: 'Primary compliance intelligence workspace' },
  { id: 'board', label: 'Executive Briefing', description: 'C-suite reporting and audit-readiness review' },
  { id: 'controls', label: 'Controls Review', description: 'Clause coverage and compliance control analysis' },
];

export const footerLinkGroups = [
  {
    label: 'Product',
    links: [
      { label: 'Platform', href: '/dashboard', type: 'route' as const },
      { label: 'Standards', href: '/#modules', type: 'anchor' as const },
      { label: 'How It Works', href: '/#how-it-works', type: 'anchor' as const },
      { label: 'Security', href: '/settings', type: 'route' as const },
    ],
  },
  {
    label: 'Resources',
    links: [
      { label: 'Documentation', href: '/knowledge-base', type: 'route' as const },
      { label: 'API', href: '/settings', type: 'route' as const },
      { label: 'Knowledge Base', href: '/knowledge-base', type: 'route' as const },
    ],
  },
  {
    label: 'Company',
    links: [
      { label: 'About', href: '/#top', type: 'anchor' as const },
      { label: 'Contact', href: '/assessment', type: 'route' as const },
    ],
  },
];

export const navigationItems = [...navigationSections.flatMap((section) => section.items), ...utilityNavigationItems];

export const pageMetaByPath = Object.fromEntries(
  navigationItems.map((item) => [item.path, { title: item.label, subtitle: item.description }])
) as Record<string, { title: string; subtitle: string }>;
