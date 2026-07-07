import { useState } from 'react';
import { ShieldCheck, AlertTriangle, XCircle, MinusCircle, ChevronDown, ChevronRight, ArrowRightLeft } from 'lucide-react';
import { SectionHeader } from '../ui/EnterpriseComponents';
import type { EvidenceValidation, EvidenceValidationItem } from '../../types';

const validationColors: Record<string, { bg: string; color: string; label: string; icon: typeof ShieldCheck }> = {
  sufficient:   { bg: 'var(--surface-success)', color: 'var(--risk-success)', label: 'Sufficient',   icon: ShieldCheck },
  partial:      { bg: 'var(--surface-warning)', color: 'var(--risk-warning)', label: 'Partial',      icon: MinusCircle },
  insufficient: { bg: 'var(--risk-high-bg)', color: 'var(--risk-high)', label: 'Insufficient', icon: AlertTriangle },
  missing:      { bg: 'var(--surface-critical)', color: 'var(--risk-critical)', label: 'Missing',      icon: XCircle },
};

const qualityColors: Record<string, string> = {
  direct:    'var(--risk-success)',
  indirect:  'var(--risk-warning)',
  anecdotal: 'var(--risk-high)',
  none:      'var(--risk-critical)',
};

function EvidenceRow({ item }: { item: EvidenceValidationItem }) {
  const [expanded, setExpanded] = useState(false);
  const v = validationColors[item.validationResult] || validationColors.missing;
  const Icon = v.icon;

  return (
    <div className="evidence-row-shell">
      <button
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        className="disclosure-trigger"
      >
        <Icon size={16} style={{ color: v.color, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>
              {item.standardCode.replace('ISO', 'ISO ')} § {item.clauseId}
            </span>
            <span style={{
              fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
              padding: '4px 8px', borderRadius: 4, background: v.bg, color: v.color,
            }}>{v.label}</span>
            <span style={{
              fontSize: 12, fontWeight: 600, color: qualityColors[item.qualityLevel] || 'var(--text-secondary)',
              textTransform: 'capitalize',
            }}>
              {item.qualityLevel} evidence
            </span>
          </div>
          <div style={{
            fontSize: 13, color: 'var(--slate-600)', marginTop: 2,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {item.evidenceText || 'No evidence provided'}
          </div>
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700,
          color: v.color, minWidth: 36, textAlign: 'right',
        }}>
          {item.qualityScore}%
        </div>
        {expanded ? <ChevronDown size={14} style={{ color: 'var(--slate-400)' }} /> : <ChevronRight size={14} style={{ color: 'var(--slate-400)' }} />}
      </button>

      {expanded && (
        <div className="disclosure-panel">
          <div style={{ paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {item.issues.length > 0 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Issues Found</div>
                <ul style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {item.issues.map((issue, i) => (
                    <li key={i} style={{ fontSize: 13, color: 'var(--slate-700)', lineHeight: 1.5 }}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}
            {item.recommendation && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Recommendation</div>
                <p style={{ fontSize: 13, color: 'var(--slate-700)', lineHeight: 1.5 }}>{item.recommendation}</p>
              </div>
            )}
            {item.crossStandardReuse.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <ArrowRightLeft size={12} style={{ color: 'var(--accent)' }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)' }}>Cross-standard reuse:</span>
                {item.crossStandardReuse.map(s => (
                  <span key={s} style={{
                    fontSize: 11, fontWeight: 600, padding: '2px 6px',
                    borderRadius: 2, background: 'var(--accent-soft)', color: 'var(--accent)',
                  }}>{s.replace('ISO', 'ISO ')}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function EvidenceValidationPanel({ data }: { data: EvidenceValidation }) {
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all'
    ? data.evidenceItems
    : data.evidenceItems.filter(i => i.validationResult === filter);

  const summaryCards = [
    { label: 'Evidence Score', value: `${data.overallEvidenceScore}%`, color: data.overallEvidenceScore >= 60 ? 'var(--risk-success)' : data.overallEvidenceScore >= 40 ? 'var(--risk-warning)' : 'var(--risk-critical)' },
    { label: 'Sufficient', value: data.sufficientCount, color: 'var(--risk-success)' },
    { label: 'Partial', value: data.partialCount, color: 'var(--risk-warning)' },
    { label: 'Insufficient', value: data.insufficientCount, color: 'var(--risk-high)' },
    { label: 'Missing', value: data.missingCount, color: 'var(--risk-critical)' },
    { label: 'Reuse Opportunities', value: data.crossStandardOpportunities, color: 'var(--accent)' },
  ];

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'sufficient', label: 'Sufficient' },
    { key: 'partial', label: 'Partial' },
    { key: 'insufficient', label: 'Insufficient' },
    { key: 'missing', label: 'Missing' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="summary-grid-responsive">
        {summaryCards.map(c => (
          <div key={c.label} className="summary-stat-card">
            <div className="summary-stat-value" style={{ color: c.color }}>{c.value}</div>
            <div className="summary-stat-label">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="report-banner">
        {data.summary}
      </div>

      <div className="segmented-filter-row" role="tablist" aria-label="Evidence validation filters">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`segmented-filter-button ${filter === f.key ? 'active' : ''}`}
            aria-pressed={filter === f.key}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(item => (
          <EvidenceRow key={item.id} item={item} />
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--slate-400)', fontSize: 14 }}>
            No evidence items match this filter.
          </div>
        )}
      </div>
    </div>
  );
}
