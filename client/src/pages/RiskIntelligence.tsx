import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldAlert } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { standardsApi } from '../utils/apiClient';
import type { KnowledgeBaseOverview } from '../types';
import ComplianceReadinessTimeline from '../components/analytics/ComplianceReadinessTimeline';
import { EmptyWorkspace, MetricCard, PageHero, Panel } from '../components/ui/EnterpriseLayout';
import { DataTable, RiskIndicator, ScoreBadge } from '../components/ui/EnterpriseComponents';
import { getRiskDistribution, getStandardLabel, sortGapsByPriority } from '../utils/enterpriseData';

export default function RiskIntelligence() {
  const navigate = useNavigate();
  const { currentAssessment, orgProfile } = useAppStore();
  const [overview, setOverview] = useState<KnowledgeBaseOverview | null>(null);

  const industry = currentAssessment?.orgProfile.industrySector || orgProfile.industrySector || 'Other';

  useEffect(() => {
    let active = true;
    standardsApi.getKnowledgeBase(industry).then((result) => {
      if (active) setOverview(result);
    }).catch(() => {
      if (active) setOverview(null);
    });

    return () => {
      active = false;
    };
  }, [industry]);

  if (!currentAssessment) {
    return (
      <EmptyWorkspace
        title="Risk intelligence activates after an assessment"
        description="Run a live assessment to compare current posture against industry benchmarks and regulatory pressure indicators."
        action={<button onClick={() => navigate('/assessment')} className="btn btn-primary">Run assessment</button>}
      />
    );
  }

  const sortedGaps = sortGapsByPriority(currentAssessment.gaps);
  const riskDistribution = getRiskDistribution(currentAssessment.gaps);
  const benchmarkRows = currentAssessment.standards.map((standard) => {
    const benchmark = overview?.industryBenchmark.averageScores[standard.standardCode] ?? null;
    return {
      standard: getStandardLabel(standard.standardCode),
      score: standard.overallScore,
      benchmark,
      delta: benchmark === null ? null : standard.overallScore - benchmark,
    };
  });

  const topExposure = useMemo(
    () => [...currentAssessment.standards].sort((left, right) => left.overallScore - right.overallScore)[0],
    [currentAssessment]
  );

  return (
    <div className="page-stack">
      <PageHero
        eyebrow="Risk intelligence"
        title="Organizational exposure and benchmark context"
        description={`Assessment signals for ${currentAssessment.orgProfile.companyName || 'the organization'} benchmarked against ${industry} expectations. This page prioritizes readability for executives and control owners who need quick interpretation rather than raw technical detail.`}
        actions={<button onClick={() => navigate('/remediation-tracker')} className="btn btn-primary">Open remediation tracker <ArrowRight size={14} /></button>}
        aside={
          <div className="hero-stat-stack">
            <div className="hero-stat-label">Highest exposure</div>
            <div className="hero-stat-value">{topExposure ? getStandardLabel(topExposure.standardCode) : 'N/A'}</div>
            <div className="hero-stat-copy">Current weakest overall score in the standards portfolio.</div>
          </div>
        }
      />

      <div className="metric-grid">
        <MetricCard label="Critical risks" value={riskDistribution.critical} caption="Gaps requiring immediate intervention" tone="danger" />
        <MetricCard label="High risks" value={riskDistribution.high} caption="Material control or policy exposures" tone="warn" />
        <MetricCard label="Benchmark pressure" value={overview?.industryBenchmark.regulatoryPressure || 'n/a'} caption="Industry regulatory intensity indicator" tone="brand" />
        <MetricCard label="Overall score" value={`${currentAssessment.overallScore}%`} caption="Cross-standard compliance posture" tone="success" />
      </div>
      <Panel
        label="Readiness forecast"
        title="Compliance readiness timeline"
        description="Model how exposure changes as the organization clears its highest-priority gaps or executes the full remediation roadmap."
      >
        <ComplianceReadinessTimeline assessment={currentAssessment} />
      </Panel>

      <div className="enterprise-two-column">
        <Panel label="Benchmark analysis" title="Current score vs industry average" description="Negative deltas indicate areas operating below sector baseline expectations.">
          <DataTable
            caption="Compare each assessed standard with the available industry benchmark."
            rows={benchmarkRows}
            rowKey={(row) => row.standard}
            columns={[
              { key: 'standard', header: 'Standard', cell: (row) => row.standard },
              { key: 'score', header: 'Current score', cell: (row) => <ScoreBadge score={row.score} /> },
              { key: 'benchmark', header: 'Benchmark', cell: (row) => row.benchmark !== null ? `${row.benchmark}%` : 'No benchmark' },
              {
                key: 'delta',
                header: 'Delta',
                cell: (row) => row.delta === null ? '—' : <RiskIndicator level={row.delta < 0 ? 'high' : 'low'} label={`${row.delta > 0 ? '+' : ''}${row.delta} pts`} />,
              },
            ]}
          />
        </Panel>

        <Panel label="Priority queue" title="Top risk items" description="Ranked by severity and impact score to support executive escalation.">
          <div className="stack-list">
            {sortedGaps.slice(0, 6).map((gap) => (
              <div key={gap.id} className="risk-register-card">
                <div style={{ marginBottom: 8 }}><RiskIndicator level={gap.impact} label={`${gap.impact} risk`} /></div>
                <div>
                  <div className="risk-register-title">{gap.title}</div>
                  <div className="insight-copy">{getStandardLabel(gap.standardCode)} clause {gap.clauseId} · Impact {gap.impactScore}/10 · Effort {gap.effortScore}/10</div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="enterprise-two-column">
        <Panel label="Control risk themes" title="Recurring risk categories" description="Aggregate gaps by delivery domain to guide control owner alignment.">
          <div className="enterprise-three-column">
            {['policy', 'process', 'training', 'technology', 'documentation'].map((category) => {
              const count = currentAssessment.gaps.filter((gap) => gap.category === category).length;
              return (
                <div key={category} className="insight-card">
                  <div className="insight-kicker">{category}</div>
                  <div className="insight-title">{count} open gaps</div>
                  <div className="insight-copy">Controls and remediation actions tagged to this capability domain.</div>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel label="Regulatory context" title="Pressure indicators and common fail modes" description="Reference points from the knowledge base for narrative shaping.">
          <div className="insight-list">
            {overview?.industryBenchmark.commonGaps.slice(0, 6).map((gap) => (
              <div key={gap} className="insight-row">
                <div className="insight-kicker"><ShieldAlert size={14} /></div>
                <div>
                  <div className="insight-title">{gap}</div>
                  <div className="insight-copy">Common industry exposure highlighted by the compliance knowledge base.</div>
                </div>
              </div>
            )) || <div className="insight-copy">No industry context available.</div>}
          </div>
        </Panel>
      </div>
    </div>
  );
}