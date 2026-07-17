import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  Legend, ResponsiveContainer, Tooltip,
} from 'recharts';
import ComplianceScoreRing from '../components/dashboard/ComplianceScoreRing';
import ClauseHeatmap from '../components/analytics/ClauseHeatmap';
import ComplianceReadinessTimeline from '../components/analytics/ComplianceReadinessTimeline';
import GapPriorityMatrix from '../components/analytics/GapPriorityMatrix';
import OrganizationalRiskHeatmap from '../components/analytics/OrganizationalRiskHeatmap';
import EvidenceValidationPanel from '../components/reports/EvidenceValidationPanel';
import PolicyGeneratorPanel from '../components/reports/PolicyGeneratorPanel';
import { ClauseStatusTag, DataTable, RiskIndicator, ScoreBadge, StatusBadge } from '../components/ui/EnterpriseComponents';
import { EmptyWorkspace, MetricCard, PageHero, Panel } from '../components/ui/EnterpriseLayout';
import { useAppStore } from '../store/useAppStore';
import { formatDate } from '../utils/helpers';
import { sortGapsByPriority } from '../utils/enterpriseData';

const tooltipStyle = {
  contentStyle: {
    background: 'var(--chart-tooltip-bg)',
    border: '1px solid var(--chart-tooltip-border)',
    borderRadius: 'var(--radius-lg)',
    fontSize: 12,
    color: 'var(--color-text-primary)',
    boxShadow: 'var(--shadow-lg)',
  },
};

const standardsMeta: Record<string, { short: string; color: string }> = {
  ISO37001: { short: 'ISO 37001', color: 'var(--chart-5)' },
  ISO37301: { short: 'ISO 37301', color: 'var(--chart-1)' },
  ISO27001: { short: 'ISO 27001', color: 'var(--chart-2)' },
  ISO9001:  { short: 'ISO 9001',  color: 'var(--chart-3)' },
};

function EmptyDashboard() {
  const navigate = useNavigate();
  const { loadDemoData } = useAppStore();

  return (
    <div className="page-stack">
      <PageHero
        eyebrow="Enterprise workspace"
        title="Compliance intelligence command center"
        description="Run an assessment to populate readiness metrics, clause findings, gap clusters, and remediation priorities in a single unified workspace."
        actions={
          <>
            <button onClick={() => navigate('/assessment')} className="btn btn-primary">Start assessment pipeline</button>
            <button onClick={loadDemoData} className="btn btn-secondary">Load demo dataset</button>
          </>
        }
        aside={
          <div className="hero-stat-stack">
            <div className="hero-stat-label">Platform mode</div>
            <div className="hero-stat-value">Ready</div>
            <div className="hero-stat-copy">Upload documents and the analytics workspace will populate with readiness scores, clause heatmaps, and gap intelligence.</div>
          </div>
        }
      />

      <div className="metric-grid">
        <MetricCard label="Overall score" value="-" caption="Awaiting first assessment" tone="brand" />
        <MetricCard label="Standards assessed" value="0" caption="No active standards selected" />
        <MetricCard label="Critical findings" value="0" caption="No gaps on record yet" />
        <MetricCard label="Report pack" value="Idle" caption="Executive briefing appears after analysis" />
      </div>

      <EmptyWorkspace
        title="No assessment data yet"
        description="This dashboard is designed for compliance leadership. Once an assessment runs, it will show clear readiness scores, clause heatmaps, evidence findings, and recommended remediation actions."
      />
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentAssessment, assessmentHistory, isDemoMode } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  if (!currentAssessment) return <EmptyDashboard />;

  const a = currentAssessment;
  const criticalGaps = a.gaps.filter((g) => g.impact === 'critical').length;
  const highGaps = a.gaps.filter((g) => g.impact === 'high').length;
  const previousAssessment = [...assessmentHistory].reverse().find((entry) => entry.id !== a.id);
  const trendDelta = previousAssessment ? a.overallScore - previousAssessment.overallScore : 0;
  const weakestClauses = a.standards
    .flatMap((standard) => standard.clauseScores.map((clause) => ({ ...clause, standardCode: standard.standardCode })))
    .sort((left, right) => left.score - right.score)
    .slice(0, 6);
  const priorityActions = a.remediation.slice(0, 4);
  const sortedGaps = sortGapsByPriority(a.gaps).slice(0, 4);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="kpi-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="kpi-card">
              <div className="skeleton" style={{ height: 12, width: '55%', marginBottom: 16 }} />
              <div className="skeleton" style={{ height: 28, width: '40%', marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 10, width: '70%' }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="card" style={{ height: 320 }}><div style={{ padding: 20 }}><div className="skeleton" style={{ height: 280 }} /></div></div>
          <div className="card" style={{ height: 320 }}><div style={{ padding: 20 }}><div className="skeleton" style={{ height: 280 }} /></div></div>
        </div>
      </div>
    );
  }

  const radarData = a.standards.map((s) => ({
    standard: standardsMeta[s.standardCode]?.short || s.standardCode,
    Current: s.overallScore,
    Target: 85,
  }));

  return (
    <div className="page-stack analytics-page">

      {isDemoMode && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 16px',
          background: 'var(--surface-warning)',
          border: '1px solid var(--risk-medium-border)',
          borderRadius: 'var(--radius-lg)',
          fontSize: 12,
          color: 'var(--risk-warning)',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--risk-medium)', flexShrink: 0 }} />
          <span><strong>Demo Mode</strong> — Displaying sample assessment data for {a.orgProfile.companyName}.</span>
          <button onClick={() => navigate('/assessment')} className="btn btn-ghost" style={{ marginLeft: 'auto', fontSize: 11, padding: '3px 8px' }}>
            Run Real Assessment <ArrowRight size={11} />
          </button>
        </div>
      )}

      <PageHero
        eyebrow="Executive dashboard"
        title={`${a.orgProfile.companyName} posture overview`}
        description={`Designed for compliance, audit, and operations leaders. Review score trends, risk concentration, clause exposure, and the next recommended remediation moves without needing raw technical logs.`}
        actions={
          <>
            <button onClick={() => navigate('/reports')} className="btn btn-primary">Open report pack</button>
            <button onClick={() => navigate('/analytics')} className="btn btn-secondary">Open analytics</button>
          </>
        }
        aside={<ComplianceScoreRing score={a.overallScore} maturityLevel={a.overallMaturity} label="overall posture" size={180} />}
      />

      <div className="metric-grid">
        <MetricCard label="Overall score" value={`${a.overallScore}%`} caption={`Maturity ${a.overallMaturityLabel}${previousAssessment ? ` · ${trendDelta >= 0 ? '+' : ''}${trendDelta}% vs last assessment` : ''}`} tone="brand" />
        <MetricCard label="Standards in scope" value={a.standards.length} caption={a.standards.map((s) => standardsMeta[s.standardCode]?.short || s.standardCode).join(', ')} />
        <MetricCard label="Critical exposure" value={criticalGaps} caption={`${highGaps} high-severity findings also require management action`} tone="danger" />
        <MetricCard label="Last review" value={formatDate(a.timestamp)} caption="Latest completed assessment in this workspace" />
      </div>
      <Panel
        label="Readiness forecast"
        title="Compliance readiness timeline"
        description="Simulate how the score improves as remediation phases land, including top-gap and full-roadmap scenarios."
      >
        <ComplianceReadinessTimeline assessment={a} />
      </Panel>

      <div className="dashboard-grid">
        <Panel label="Assessment results" title="Standards scorecard" description="A concise score view for business users, showing where attention is needed first.">
          <DataTable
            caption="Each row summarizes one assessed ISO standard."
            rowKey={(row) => row.standardCode}
            rows={a.standards}
            columns={[
              {
                key: 'standard',
                header: 'Standard',
                cell: (row) => (
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--slate-900)' }}>{standardsMeta[row.standardCode]?.short || row.standardCode}</div>
                    <div style={{ fontSize: 12, color: 'var(--slate-500)' }}>{row.standardName}</div>
                  </div>
                ),
              },
              { key: 'score', header: 'Score', cell: (row) => <ScoreBadge score={row.overallScore} /> },
              {
                key: 'status',
                header: 'Status',
                cell: (row) => <StatusBadge status={row.overallScore >= 75 ? 'compliant' : row.overallScore >= 50 ? 'partial' : 'non-compliant'} />,
              },
              {
                key: 'risk',
                header: 'Priority risk',
                cell: (row) => {
                  const count = a.gaps.filter((gap) => gap.standardCode === row.standardCode && gap.impact === 'critical').length;
                  return count > 0 ? <RiskIndicator level="critical" label={`${count} critical gaps`} /> : <RiskIndicator level="low" label="No critical gaps" />;
                },
              },
            ]}
          />
        </Panel>

        <Panel label="Target comparison" title="Current vs target maturity" description="This view compares the current posture against a management target of 85% across standards.">
          <div style={{ padding: '8px 4px 0' }}>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData} margin={{ top: 8, right: 20, bottom: 8, left: 20 }}>
                <PolarGrid stroke="var(--chart-grid)" />
                <PolarAngleAxis dataKey="standard" tick={{ fill: 'var(--chart-axis)', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'var(--chart-axis-muted)', fontSize: 12 }} />
                <Radar
                  name="Current"
                  dataKey="Current"
                  stroke="var(--blue-700)"
                  fill="var(--blue-700)"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Radar
                  name="Target (85%)"
                  dataKey="Target"
                  stroke="var(--slate-400)"
                  fill="none"
                  strokeDasharray="4 3"
                  strokeWidth={1.5}
                />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12, color: 'var(--chart-axis)', paddingTop: 8 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="dashboard-risk-grid">
        <Panel label="Risk visualization" title="Organizational exposure heatmap" description="Risks are grouped into severity and likelihood buckets for rapid executive review.">
          <OrganizationalRiskHeatmap assessment={a} regulatoryPressure="high" />
        </Panel>

        <div className="dashboard-stack">
          <Panel label="Action focus" title="Priority remediation actions" description="The most immediate actions translated into a business-readable execution list.">
            <div className="dashboard-priority-list">
              {priorityActions.map((action) => (
                <div key={action.id} className="dashboard-priority-item">
                  <div className="dashboard-priority-head">
                    <div>
                      <div className="dashboard-priority-title">{action.title}</div>
                      <div className="dashboard-priority-meta">Phase {action.phaseLabel} · {action.responsibleFunction}</div>
                    </div>
                    <RiskIndicator level={action.priority} label={action.priority} />
                  </div>
                  <div style={{ color: 'var(--slate-600)', fontSize: 13, lineHeight: 1.6 }}>{action.description}</div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel label="Risk prioritization" title="Impact vs implementation effort" description="Use this matrix to identify quick wins versus longer strategic remediation work.">
            <GapPriorityMatrix gaps={a.gaps} />
          </Panel>
        </div>
      </div>

      <div className="dashboard-grid">
        <Panel label="Clause analysis" title="Clause exposure heatmap" description="Clause-level scoring is condensed into a visual register so weak controls can be found quickly.">
          <ClauseHeatmap standards={a.standards} />
        </Panel>

        <Panel label="Weakest clauses" title="Immediate control attention" description="These clauses are the most likely to drive audit challenge or certification delay.">
          <DataTable
            rows={weakestClauses}
            rowKey={(row) => `${row.standardCode}-${row.clauseId}`}
            columns={[
              {
                key: 'clause',
                header: 'Clause',
                cell: (row) => (
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{row.standardCode.replace('ISO', 'ISO ')} {row.clauseId}</div>
                    <div style={{ fontSize: 12, color: 'var(--slate-500)' }}>{row.clauseTitle}</div>
                  </div>
                ),
              },
              { key: 'score', header: 'Score', cell: (row) => <ScoreBadge score={row.score} /> },
              { key: 'status', header: 'Status', cell: (row) => <ClauseStatusTag status={row.status} /> },
            ]}
          />
        </Panel>
      </div>

      {a.evidenceValidation && a.evidenceValidation.evidenceItems.length > 0 && (
        <Panel
          label="Evidence intelligence"
          title="Evidence validation review"
          description="The assistant tested evidence quality, sufficiency, and reuse potential across standards."
          action={<button onClick={() => navigate('/reports')} className="btn btn-ghost" style={{ fontSize: 12, flexShrink: 0 }}>
              Full Report <ChevronRight size={12} />
            </button>}
        >
          <EvidenceValidationPanel data={a.evidenceValidation} />
        </Panel>
      )}

      {a.policyDocuments && a.policyDocuments.length > 0 && (
        <Panel label="Policy intelligence" title="Generated compliant policy packs" description="Drafted policy outputs linked directly to the gaps identified in this assessment.">
          <PolicyGeneratorPanel documents={a.policyDocuments} />
        </Panel>
      )}

      {criticalGaps > 0 && (
        <Panel
          label="Immediate attention required"
          title={`Critical findings requiring action`}
          description="These findings should be reviewed before lower-severity items because they carry the highest operational or audit exposure."
          action={<button onClick={() => navigate('/reports')} className="btn btn-ghost" style={{ fontSize: 12, flexShrink: 0 }}>
            View report <ChevronRight size={12} />
          </button>}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {sortedGaps.map((gap) => (
              <div key={gap.id} style={{
                padding: 14,
                borderRadius: 16,
                background: 'var(--risk-critical-bg)',
                border: '1px solid var(--risk-critical-border)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span className="badge badge-critical">Critical</span>
                  <span style={{ fontSize: 11, color: 'var(--slate-500)', fontFamily: 'var(--font-mono)' }}>
                    {gap.standardCode.replace('ISO', 'ISO ')}
                  </span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--slate-800)', marginBottom: 4 }}>{gap.title}</div>
                <div style={{ fontSize: 12, color: 'var(--slate-600)', lineHeight: 1.4 }}>{gap.description}</div>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
