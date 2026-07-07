import type { ReactNode } from 'react';
import { useInView, useCountUp } from '../../hooks/useCountUp';

interface KPICardProps {
  title: string;
  value: number;
  suffix?: string;
  prefix?: string;
  subtitle?: string;
  icon: ReactNode;
  color?: string;
  delay?: number;
  trend?: { value: number; label: string };
  hideValue?: boolean;
}

export default function KPICard({
  title,
  value,
  suffix = '',
  prefix = '',
  subtitle,
  icon,
  color = 'var(--blue-700)',
  delay = 0,
  trend,
  hideValue = false,
}: KPICardProps) {
  const { ref, inView } = useInView();
  const displayValue = useCountUp(inView ? value : 0, 1200);

  return (
    <div
      ref={ref}
      className="kpi-card"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {title}
        </span>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 'var(--radius-md)',
          background: 'var(--slate-100)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color,
          flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>

      {!hideValue && (
        <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--slate-900)', lineHeight: 1, marginBottom: 6 }} className="score-display">
          {prefix}{displayValue}{suffix}
        </div>
      )}

      {subtitle && (
        <div style={{ fontSize: 12, color: 'var(--slate-500)' }}>{subtitle}</div>
      )}

      {trend && (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 3,
          marginTop: 6,
          fontSize: 11,
          fontWeight: 600,
          color: trend.value >= 0 ? 'var(--status-compliant)' : 'var(--risk-critical)',
        }}>
          <span>{trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
          <span style={{ color: 'var(--slate-400)', fontWeight: 400 }}>{trend.label}</span>
        </div>
      )}
    </div>
  );
}
