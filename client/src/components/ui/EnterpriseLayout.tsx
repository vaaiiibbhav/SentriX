import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';

export function PageHero({
  eyebrow,
  title,
  description,
  actions,
  aside,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className="enterprise-hero">
      <div>
        <span className="section-label">{eyebrow}</span>
        <h1 className="enterprise-hero-title">{title}</h1>
        <p className="enterprise-hero-copy">{description}</p>
        {actions ? <div className="enterprise-hero-actions">{actions}</div> : null}
      </div>
      {aside ? <div className="enterprise-hero-aside">{aside}</div> : null}
    </section>
  );
}

export function MetricCard({
  label,
  value,
  caption,
  tone = 'default',
}: {
  label: string;
  value: string | number;
  caption: string;
  tone?: 'default' | 'brand' | 'success' | 'warn' | 'danger';
}) {
  return (
    <div className={`metric-card metric-card-${tone}`}>
      <div className="metric-card-label">{label}</div>
      <div className="metric-card-value score-display">{value}</div>
      <div className="metric-card-caption">{caption}</div>
    </div>
  );
}

export function Panel({
  label,
  title,
  description,
  action,
  children,
}: {
  label: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="card analytics-panel">
      <div className="card-header">
        <div>
          <span className="section-label">{label}</span>
          <div className="enterprise-panel-title">{title}</div>
          {description ? <div className="enterprise-panel-copy">{description}</div> : null}
        </div>
        {action}
      </div>
      <div className="card-body analytics-panel-body">{children}</div>
    </section>
  );
}

export function EmptyWorkspace({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-workspace">
      <div className="empty-workspace-mark">
        <ArrowRight size={18} />
      </div>
      <div className="empty-workspace-title">{title}</div>
      <div className="empty-workspace-copy">{description}</div>
      {action ? <div className="enterprise-hero-actions">{action}</div> : null}
    </div>
  );
}