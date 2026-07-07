import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { EmptyWorkspace, MetricCard, PageHero, Panel } from '../components/ui/EnterpriseLayout';
import { getRemediationSummary, getStandardLabel, sortGapsByPriority } from '../utils/enterpriseData';

export default function RemediationTracker() {
  const navigate = useNavigate();
  const { currentAssessment } = useAppStore();

  if (!currentAssessment) {
    return (
      <EmptyWorkspace
        title="Remediation tracker requires assessment output"
        description="Actions, owners, and phase sequencing are built from the latest assessment results."
        action={<button onClick={() => navigate('/assessment')} className="btn btn-primary">Run assessment</button>}
      />
    );
  }

  const summary = getRemediationSummary(currentAssessment.remediation);
  const prioritizedGaps = sortGapsByPriority(currentAssessment.gaps).slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Execution management"
        title="Remediation Tracker"
        description="Phased delivery plan, owner accountability, and the highest-priority gaps behind each remediation stream."
        actions={<button onClick={() => navigate('/reports')} className="btn btn-secondary">Open report pack</button>}
        aside={
          <div className="hero-stat-stack">
            <div className="hero-stat-label">Total effort</div>
            <div className="hero-stat-value">{summary.totalEffortDays} days</div>
            <div className="hero-stat-copy">Estimated implementation effort across all remediation actions.</div>
          </div>
        }
      />

      <div className="metric-grid">
        <MetricCard label="Open actions" value={currentAssessment.remediation.length} caption="Generated from the latest gap set" tone="brand" />
        <MetricCard label="Critical actions" value={currentAssessment.remediation.filter((action) => action.priority === 'critical').length} caption="Immediate executive priority items" tone="danger" />
        <MetricCard label="Owner groups" value={new Set(currentAssessment.remediation.map((action) => action.responsibleFunction)).size} caption="Functions accountable for remediation delivery" />
        <MetricCard label="Cross-standard overlaps" value={currentAssessment.gaps.filter((gap) => gap.crossStandardOverlap.length > 0).length} caption="Reuse opportunities across standards" tone="success" />
      </div>

      <div className="enterprise-two-column">
        <Panel label="Phase plan" title="Delivery sequencing" description="Phase counts are derived from the generated remediation roadmap.">
          <div className="enterprise-three-column">
            {summary.byPhase.map((phase) => (
              <div key={phase.phase} className="insight-card">
                <div className="insight-kicker">Phase {phase.phase}</div>
                <div className="insight-title">{phase.count} actions</div>
                <div className="insight-copy">Actions sequenced for this delivery wave.</div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel label="Gap drivers" title="Top gaps feeding the roadmap" description="High-severity findings that should anchor steering committee conversations.">
          <div className="insight-list">
            {prioritizedGaps.map((gap) => (
              <div key={gap.id} className="insight-row">
                <div className={`insight-kicker insight-kicker-${gap.impact}`}>{gap.impact}</div>
                <div>
                  <div className="insight-title">{gap.title}</div>
                  <div className="insight-copy">{getStandardLabel(gap.standardCode)} clause {gap.clauseId} · {gap.description}</div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel label="Action register" title="Owner and dependency tracker" description="Generated remediation actions with priority, phase, and accountable function.">
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Priority</th>
                <th>Phase</th>
                <th>Owner</th>
                <th>Standards</th>
                <th>Effort</th>
              </tr>
            </thead>
            <tbody>
              {currentAssessment.remediation.map((action) => (
                <tr key={action.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{action.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--slate-500)' }}>{action.description}</div>
                  </td>
                  <td><span className={`badge badge-${action.priority === 'critical' ? 'critical' : action.priority}`}>{action.priority}</span></td>
                  <td>Phase {action.phase}</td>
                  <td>{action.responsibleFunction}</td>
                  <td>{action.standards.map(getStandardLabel).join(', ')}</td>
                  <td>{action.effortDays} days</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel label="Success metrics" title="Closure guidance" description="Use generated metrics to make remediation closure auditable.">
        <div className="insight-list">
          {currentAssessment.remediation.slice(0, 6).map((action) => (
            <div key={`${action.id}-metric`} className="insight-row">
              <div className="insight-kicker">{action.phaseLabel}</div>
              <div>
                <div className="insight-title">{action.title}</div>
                <div className="insight-copy">Success metric: {action.successMetric}</div>
              </div>
              <button onClick={() => navigate('/control-library')} className="btn btn-ghost">Trace controls <ArrowRight size={14} /></button>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}