/**
 * Enterprise shared UI components
 * StatusBadge, RiskChip, ScoreBadge, SectionHeader, EmptyState, LoadingRows
 */

import type { ReactNode } from 'react';

/* ── StatusBadge ────────────────────────────────────────── */
type StatusValue = 'compliant' | 'partial' | 'non-compliant' | 'not-assessed' | 'pending';

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase().replace(/_/g, '-') as StatusValue;

  const map: Record<StatusValue, { label: string; cls: string }> = {
    compliant:     { label: 'Compliant',     cls: 'badge badge-compliant' },
    partial:       { label: 'Partial',       cls: 'badge badge-partial' },
    'non-compliant': { label: 'Non-Compliant', cls: 'badge badge-noncompliant' },
    'not-assessed':  { label: 'Not Assessed',  cls: 'badge badge-pending' },
    pending:       { label: 'Pending',       cls: 'badge badge-pending' },
  };

  const entry = map[normalized] || { label: status, cls: 'badge badge-pending' };
  return <span className={entry.cls}>{entry.label}</span>;
}

/* ── RiskChip ───────────────────────────────────────────── */
type RiskLevel = 'critical' | 'high' | 'medium' | 'low';

export function RiskChip({ level }: { level: string }) {
  const norm = level.toLowerCase() as RiskLevel;
  const map: Record<RiskLevel, string> = {
    critical: 'badge badge-critical',
    high:     'badge badge-high',
    medium:   'badge badge-medium',
    low:      'badge badge-low',
  };
  return (
    <span className={map[norm] || 'badge badge-pending'}>
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </span>
  );
}

export function RiskIndicator({ level, label }: { level: string; label?: string }) {
  const normalized = level.toLowerCase();
  const colorMap: Record<string, string> = {
    critical: 'var(--risk-critical)',
    high: 'var(--risk-high)',
    medium: 'var(--risk-medium)',
    low: 'var(--risk-low)',
  };

  return (
    <span className="risk-indicator">
      <span className="risk-indicator-dot" style={{ background: colorMap[normalized] || 'var(--slate-400)' }} />
      <span>{label || `${level.charAt(0).toUpperCase()}${level.slice(1)} risk`}</span>
    </span>
  );
}

/* ── ScoreBadge ─────────────────────────────────────────── */
export function ScoreBadge({ score }: { score: number }) {
  let color = 'var(--status-compliant)';
  let bg = 'var(--status-compliant-bg)';
  if (score < 50) { color = 'var(--risk-critical)'; bg = 'var(--risk-critical-bg)'; }
  else if (score < 70) { color = 'var(--risk-medium)'; bg = 'var(--risk-medium-bg)'; }

  return (
    <span
      className="score-display"
      style={{
        display: 'inline-block',
        padding: '4px 10px',
        background: bg,
        color,
        borderRadius: 'var(--radius-sm)',
        fontSize: 13,
        fontWeight: 700,
      }}
    >
      {score}%
    </span>
  );
}

export function ClauseStatusTag({
  status,
}: {
  status: 'implemented' | 'partial' | 'planned' | 'not-started';
}) {
  const labels: Record<typeof status, string> = {
    implemented: 'Implemented',
    partial: 'Partial',
    planned: 'Planned',
    'not-started': 'Not started',
  };

  return <span className={`clause-status-tag clause-status-tag-${status}`}>{labels[status]}</span>;
}

/* ── SectionHeader ──────────────────────────────────────── */
interface SectionHeaderProps {
  label?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function SectionHeader({ label, title, description, action }: SectionHeaderProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 24 }}>
      <div>
        {label && <span className="section-label">{label}</span>}
        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--slate-900)', lineHeight: 1.3 }}>{title}</h3>
        {description && <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.65 }}>{description}</p>}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  );
}

interface DataTableColumn<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
}

export function DataTable<T>({
  caption,
  columns,
  rows,
  rowKey,
}: {
  caption?: string;
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
}) {
  return (
    <div className="enterprise-table-wrap">
      <table className="enterprise-data-table">
        {caption ? <caption>{caption}</caption> : null}
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col">{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((column) => (
                <td key={column.key}>{column.cell(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SummaryStatCard({
  label,
  value,
  description,
  tone = 'default',
}: {
  label: string;
  value: ReactNode;
  description?: string;
  tone?: 'default' | 'brand' | 'success' | 'warn' | 'danger';
}) {
  return (
    <div className={`summary-stat-card summary-stat-card-${tone}`}>
      <div className="summary-stat-label">{label}</div>
      <div className="summary-stat-value">{value}</div>
      {description ? <div className="summary-stat-copy">{description}</div> : null}
    </div>
  );
}

export function InsightCard({
  eyebrow,
  title,
  description,
  footer,
  tone = 'default',
}: {
  eyebrow?: string;
  title: string;
  description: string;
  footer?: ReactNode;
  tone?: 'default' | 'brand' | 'success' | 'warn' | 'danger';
}) {
  return (
    <article className={`insight-card insight-card-${tone}`}>
      {eyebrow ? <div className="insight-kicker">{eyebrow}</div> : null}
      <div className="insight-title">{title}</div>
      <div className="insight-copy">{description}</div>
      {footer ? <div className="insight-tags">{footer}</div> : null}
    </article>
  );
}

export function ActionCard({
  label,
  title,
  description,
  action,
}: {
  label?: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <article className="action-card">
      <div className="action-card-copywrap">
        {label ? <div className="insight-kicker">{label}</div> : null}
        <div className="action-card-title">{title}</div>
        <div className="action-card-copy">{description}</div>
      </div>
      {action ? <div className="action-card-action">{action}</div> : null}
    </article>
  );
}

export function WorkflowStage({
  index,
  title,
  description,
  state,
}: {
  index: number;
  title: string;
  description: string;
  state: 'idle' | 'active' | 'complete';
}) {
  return (
    <article className={`workflow-stage workflow-stage-${state}`}>
      <div className="workflow-stage-index">{index}</div>
      <div>
        <div className="workflow-stage-title">{title}</div>
        <div className="workflow-stage-copy">{description}</div>
      </div>
    </article>
  );
}

/* ── EmptyState ─────────────────────────────────────────── */
interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      textAlign: 'center',
      gap: 8,
    }}>
      {icon && (
        <div style={{ color: 'var(--slate-400)', marginBottom: 4 }}>{icon}</div>
      )}
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--slate-700)' }}>{title}</div>
      {description && (
        <div style={{ fontSize: 12, color: 'var(--slate-500)', maxWidth: 320 }}>{description}</div>
      )}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}

/* ── LoadingRow ─────────────────────────────────────────── */
export function LoadingRows({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r}>
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} style={{ padding: '10px 12px' }}>
              <div className="skeleton" style={{ height: 14, borderRadius: 3 }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/* ── InfoTooltip ────────────────────────────────────────── */
export function InfoTooltip({ text }: { text: string }) {
  return (
    <span
      data-tooltip={text}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 14,
        height: 14,
        borderRadius: '50%',
        background: 'var(--slate-200)',
        color: 'var(--slate-500)',
        fontSize: 10,
        fontWeight: 700,
        cursor: 'default',
        flexShrink: 0,
      }}
    >
      ?
    </span>
  );
}
