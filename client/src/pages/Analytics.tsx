import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, Legend, PieChart, Pie, Cell,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Scale, TrendingUp } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { AssessmentResult, KnowledgeBaseOverview } from '../types';
import { standardsApi } from '../utils/apiClient';
import ComplianceReadinessTimeline from '../components/analytics/ComplianceReadinessTimeline';
import OrganizationalRiskHeatmap from '../components/analytics/OrganizationalRiskHeatmap';
import { EmptyWorkspace, MetricCard, PageHero, Panel } from '../components/ui/EnterpriseLayout';
import { getAssessmentNarrative, getRiskDistribution, getStandardLabel } from '../utils/enterpriseData';

const tooltipStyle = {
  contentStyle: {
    background: 'var(--chart-tooltip-bg)',
    border: '1px solid var(--chart-tooltip-border)',
    borderRadius: '12px',
    color: 'var(--color-text-primary)',
    fontSize: 12,
  },
};

const gapColors: Record<string, string> = {
  process: 'var(--chart-5)',
  training: 'var(--risk-medium)',
  technology: 'var(--chart-2)',
  documentation: 'var(--green-light)',
  policy: 'var(--risk-critical)',
};

const renderGapLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, name } = props;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.62;
  const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
  const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

  return (
    <text x={x} y={y} fill="var(--chart-axis)" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${name} ${((percent || 0) * 100).toFixed(0)}%`}
    </text>
  );
};

function buildTrendData(history: AssessmentResult[], current: AssessmentResult) {
  const items = [...history];
  if (!items.find((entry) => entry.id === current.id)) {
    items.push(current);
  }

  const recent = items.slice(-6);
  return recent.map((assessment, index) => {
    const point: Record<string, string | number> = {
      label: recent.length === 1 ? 'Current' : new Date(assessment.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      overall: assessment.overallScore,
      order: index,
    };

    assessment.standards.forEach((standard) => {
      point[standard.standardCode] = standard.overallScore;
    });

    return point;
  });
}

export default function Analytics() {
  const navigate = useNavigate();
  const { currentAssessment, assessmentHistory, loadDemoData } = useAppStore();
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseOverview | null>(null);

  useEffect(() => {
    if (!currentAssessment) {
      return;
    }

    let active = true;
    standardsApi
      .getKnowledgeBase(currentAssessment.orgProfile.industrySector || 'Other')
      .then((data) => {
        if (active) {
          setKnowledgeBase(data);
        }
      })
      .catch(() => {
        if (active) {
          setKnowledgeBase(null);
        }
      });

    return () => {
      active = false;
    };
  }, [currentAssessment]);

  const benchmarkData = useMemo(() => {
    if (!currentAssessment) return [];

    const averages = knowledgeBase?.industryBenchmark.averageScores || {};
    return currentAssessment.standards.map((standard) => ({
      standard: standard.standardCode.replace('ISO', 'ISO '),
      yours: standard.overallScore,
      benchmark: averages[standard.standardCode] || 0,
    }));
  }, [currentAssessment, knowledgeBase]);

  const maturityData = useMemo(() => {
    if (!currentAssessment) return [];

    return currentAssessment.standards.map((standard) => {
      const distribution = { level1: 0, level2: 0, level3: 0, level4: 0, level5: 0 };
      standard.clauseScores.forEach((clause) => {
        if (clause.score >= 80) distribution.level5 += 1;
        else if (clause.score >= 65) distribution.level4 += 1;
        else if (clause.score >= 50) distribution.level3 += 1;
        else if (clause.score >= 35) distribution.level2 += 1;
        else distribution.level1 += 1;
      });

      return {
        standard: standard.standardCode.replace('ISO', 'ISO '),
        ...distribution,
      };
    });
  }, [currentAssessment]);

  const gapDistribution = useMemo(() => {
    if (!currentAssessment) return [];

    const counts = currentAssessment.gaps.reduce<Record<string, number>>((accumulator, gap) => {
      accumulator[gap.category] = (accumulator[gap.category] || 0) + 1;
      return accumulator;
    }, {});

    return Object.entries(counts).map(([name, value]) => ({
      name: name[0].toUpperCase() + name.slice(1),
      value,
      color: gapColors[name] || '#94A3B8',
    }));
  }, [currentAssessment]);

  const trendData = useMemo(() => {
    if (!currentAssessment) return [];
    return buildTrendData(assessmentHistory, currentAssessment);
  }, [assessmentHistory, currentAssessment]);

  const overlapCards = useMemo(() => {
    if (!currentAssessment) return [];

    const pairCounts = new Map<string, number>();
    currentAssessment.gaps.forEach((gap) => {
      gap.crossStandardOverlap.forEach((overlap) => {
        const pair = [gap.standardCode, overlap].sort().join(' ↔ ');
        pairCounts.set(pair, (pairCounts.get(pair) || 0) + 1);
      });
    });

    return [...pairCounts.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 3)
      .map(([pair, count]) => ({
        pair: pair.replace(/ISO/g, 'ISO '),
        overlaps: count,
        savings: `${count * 2} person-days`,
      }));
  }, [currentAssessment]);

  const riskDistribution = useMemo(() => {
    if (!currentAssessment) {
      return { critical: 0, high: 0, medium: 0, low: 0 };
    }

    return getRiskDistribution(currentAssessment.gaps);
  }, [currentAssessment]);

  const weakestStandard = useMemo(() => {
    if (!currentAssessment) return null;
    return [...currentAssessment.standards].sort((left, right) => left.overallScore - right.overallScore)[0] || null;
  }, [currentAssessment]);

  const strongestStandard = useMemo(() => {
    if (!currentAssessment) return null;
    return [...currentAssessment.standards].sort((left, right) => right.overallScore - left.overallScore)[0] || null;
  }, [currentAssessment]);

  const benchmarkGaps = useMemo(() => {
    if (!currentAssessment) return [];

    const averages = knowledgeBase?.industryBenchmark.averageScores || {};
    return currentAssessment.standards
      .map((standard) => ({
        code: standard.standardCode,
        label: getStandardLabel(standard.standardCode),
        delta: standard.overallScore - (averages[standard.standardCode] || 0),
      }))
      .sort((left, right) => left.delta - right.delta);
  }, [currentAssessment, knowledgeBase]);

  const topThemes = useMemo(() => {
    if (!currentAssessment) return [];

    const counts = currentAssessment.gaps.reduce<Record<string, number>>((accumulator, gap) => {
      accumulator[gap.category] = (accumulator[gap.category] || 0) + 1;
      return accumulator;
    }, {});

    return Object.entries(counts)
      .sort((left, right) => right[1] - left[1])
      .slice(0, 3)
      .map(([name, count]) => ({
        name: name[0].toUpperCase() + name.slice(1),
        count,
      }));
  }, [currentAssessment]);

  if (!currentAssessment) {
    return (
      <EmptyWorkspace
        title="Analytics activates after an assessment"
        description="Run a live assessment or load demo data to unlock posture trends, benchmark comparisons, and the risk intelligence surface."
        action={
          <>
            <button onClick={() => navigate('/assessment')} className="btn btn-primary">Start assessment</button>
            <button onClick={loadDemoData} className="btn btn-secondary">Load demo</button>
          </>
        }
      />
    );
  }

  return (
    <div className="space-y-6 analytics-page">
      <PageHero
        eyebrow="Portfolio analytics"
        title="Compliance posture, exposure, and readiness trends"
        description={getAssessmentNarrative(currentAssessment)}
        actions={
          <>
            <button onClick={() => navigate('/risk-intelligence')} className="btn btn-primary">Open risk intelligence</button>
            <button onClick={() => navigate('/reports')} className="btn btn-secondary">Open report pack</button>
          </>
        }
        aside={
          <div className="hero-stat-stack analytics-hero-aside">
            <div className="hero-stat-label">Executive signal</div>
            <div className="hero-stat-value">{weakestStandard ? getStandardLabel(weakestStandard.standardCode) : 'n/a'}</div>
            <div className="hero-stat-copy">Weakest standards domain currently sits at {weakestStandard?.overallScore ?? 0}% and should anchor remediation sequencing.</div>
          </div>
        }
      />

      <div className="metric-grid">
        <MetricCard label="Overall posture" value={`${currentAssessment.overallScore}%`} caption="Current cross-standard compliance score" tone="brand" />
        <MetricCard label="Critical exposures" value={riskDistribution.critical} caption="Immediate executive intervention items" tone="danger" />
        <MetricCard label="Benchmark pressure" value={knowledgeBase?.industryBenchmark.regulatoryPressure || 'n/a'} caption="Industry regulatory intensity signal" tone="warn" />
        <MetricCard label="Reuse opportunities" value={overlapCards.reduce((sum, card) => sum + card.overlaps, 0)} caption="Gap overlaps that can reduce delivery effort" tone="success" />
      </div>

      <div className="enterprise-two-column analytics-takeaways-grid">
        <Panel label="Executive takeaways" title="What needs attention now" description="Condensed analytics narrative to make the page easier to read at a glance.">
          <div className="enterprise-three-column analytics-takeaways-cards">
            <div className="insight-card analytics-feature-card analytics-feature-card-critical">
              <div className="insight-kicker insight-kicker-critical">Primary risk</div>
              <div className="insight-title">{weakestStandard ? getStandardLabel(weakestStandard.standardCode) : 'No risk flagged'}</div>
              <div className="insight-copy">{weakestStandard ? `${weakestStandard.overallScore}% current score with the largest delivery gap against target state.` : 'No standards assessment available.'}</div>
            </div>
            <div className="insight-card analytics-feature-card analytics-feature-card-neutral">
              <div className="insight-kicker">Best position</div>
              <div className="insight-title">{strongestStandard ? getStandardLabel(strongestStandard.standardCode) : 'No benchmark'}</div>
              <div className="insight-copy">{strongestStandard ? `${strongestStandard.overallScore}% current score with the strongest evidence-backed control position.` : 'No standards assessment available.'}</div>
            </div>
            <div className="insight-card analytics-feature-card analytics-feature-card-brand">
              <div className="insight-kicker">Dominant theme</div>
              <div className="insight-title">{topThemes[0]?.name || 'No gap theme'}</div>
              <div className="insight-copy">{topThemes[0] ? `${topThemes[0].count} open gaps are concentrated in this remediation domain.` : 'No open gaps found in the current assessment.'}</div>
            </div>
          </div>
        </Panel>

        <Panel label="Benchmark delta" title="Below-industry pressure points" description="The biggest negative benchmark deltas should guide board-level questions and sequencing.">
          <div className="insight-list">
            {benchmarkGaps.slice(0, 4).map((item) => (
              <div key={item.code} className="insight-row">
                <div className="insight-kicker">{item.label}</div>
                <div style={{ flex: 1 }}>
                  <div className="insight-title">{item.delta >= 0 ? 'Above sector baseline' : 'Below sector baseline'}</div>
                  <div className="insight-copy">{item.delta >= 0 ? `Outperforming benchmark by ${item.delta} points.` : `Trailing benchmark by ${Math.abs(item.delta)} points.`}</div>
                </div>
                <div className={`delta-pill ${item.delta < 0 ? 'delta-pill-negative' : 'delta-pill-positive'}`}>
                  {item.delta > 0 ? '+' : ''}{item.delta} pts
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Panel
          label="Core feature"
          title="Organizational risk heatmap"
          description="The matrix now surfaces selected-bucket context and a more decision-oriented risk rail instead of a raw event list."
          action={<div className="analytics-panel-callout"><Scale size={14} /> Exposure model includes control weakness, evidence sufficiency, and industry pressure.</div>}
        >
          <OrganizationalRiskHeatmap
            assessment={currentAssessment}
            regulatoryPressure={knowledgeBase?.industryBenchmark.regulatoryPressure}
          />
        </Panel>
      </motion.div>

      <div className="enterprise-two-column">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Panel label="Standards coverage" title="Clause maturity distribution" description="Shows where clauses cluster across maturity bands for each assessed standard.">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={maturityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-primary-600)" />
                <XAxis dataKey="standard" tick={{ fill: 'var(--chart-axis)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'var(--chart-axis-muted)', fontSize: 12 }} />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12, color: 'var(--chart-axis)' }} />
                <Bar dataKey="level1" stackId="a" fill="var(--chart-6)" name="Level 1" />
                <Bar dataKey="level2" stackId="a" fill="var(--chart-5)" name="Level 2" />
                <Bar dataKey="level3" stackId="a" fill="var(--risk-warning)" name="Level 3" />
                <Bar dataKey="level4" stackId="a" fill="var(--chart-3)" name="Level 4" />
                <Bar dataKey="level5" stackId="a" fill="var(--risk-success)" name="Level 5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Panel>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <Panel label="Gap composition" title="Remediation domain distribution" description="Shows whether the gap load is concentrated in policy, process, training, technology, or documentation work.">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={gapDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  labelLine={false}
                  label={renderGapLabel}
                >
                  {gapDistribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </Panel>
        </motion.div>
      </div>

      <div className="enterprise-two-column">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Panel label="Assessment history" title="Score trend" description="Trendline across recent assessments, including overall score and per-standard movement.">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-primary-600)" />
                <XAxis dataKey="label" tick={{ fill: 'var(--chart-axis)', fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fill: 'var(--chart-axis-muted)', fontSize: 12 }} />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12, color: 'var(--chart-axis)' }} />
                <Line type="monotone" dataKey="overall" stroke="var(--color-accent-500)" strokeWidth={2.5} dot={{ r: 3 }} name="Overall" />
                <Line type="monotone" dataKey="ISO37001" stroke="var(--chart-5)" strokeWidth={2} dot={{ r: 2 }} name="ISO 37001" />
                <Line type="monotone" dataKey="ISO37301" stroke="var(--chart-3)" strokeWidth={2} dot={{ r: 2 }} name="ISO 37301" />
                <Line type="monotone" dataKey="ISO27001" stroke="var(--chart-2)" strokeWidth={2} dot={{ r: 2 }} name="ISO 27001" />
                <Line type="monotone" dataKey="ISO9001" stroke="var(--risk-warning)" strokeWidth={2} dot={{ r: 2 }} name="ISO 9001" />
              </LineChart>
            </ResponsiveContainer>
          </Panel>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Panel label="Benchmark view" title="Your score vs industry average" description="Combines standard-level benchmark deltas with the sector-level pressure narrative.">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={benchmarkData} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-primary-600)" />
                <XAxis dataKey="standard" tick={{ fill: 'var(--chart-axis)', fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fill: 'var(--chart-axis-muted)', fontSize: 12 }} />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12, color: 'var(--chart-axis)' }} />
                <Bar dataKey="yours" fill="var(--color-accent-500)" name="Your Score" radius={[4, 4, 0, 0]} />
                <Bar dataKey="benchmark" fill="var(--color-primary-600)" name="Industry Avg" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            {knowledgeBase?.industryBenchmark && (
              <div className="analytics-benchmark-footnotes">
                <div className="analytics-footnote-card">
                  <div className="hero-stat-label">Regulatory pressure</div>
                  <div className="insight-title" style={{ marginBottom: 0 }}>{knowledgeBase.industryBenchmark.regulatoryPressure.replace('-', ' ')}</div>
                </div>
                <div className="analytics-footnote-card">
                  <div className="hero-stat-label">Recurring sector gaps</div>
                  <div className="insight-copy">{knowledgeBase.industryBenchmark.commonGaps.slice(0, 2).join(' • ')}</div>
                </div>
              </div>
            )}
          </Panel>
        </motion.div>
      </div>

      <div className="enterprise-two-column">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Panel label="Cross-standard analysis" title="Overlap opportunities" description="Shared workstreams that can remove duplicate remediation effort across standards.">
            <div className="analytics-overlap-grid">
              {overlapCards.length > 0 ? overlapCards.map((item) => (
                <div key={item.pair} className="insight-card analytics-overlap-card">
                  <div className="insight-kicker">Overlap set</div>
                  <div className="insight-title">{item.pair}</div>
                  <div className="metric-card-value score-display" style={{ fontSize: 26, marginTop: 10 }}>{item.overlaps}</div>
                  <div className="insight-copy">Potential savings: {item.savings}</div>
                </div>
              )) : (
                <div className="insight-card">
                  <div className="insight-title">No overlap opportunities detected</div>
                  <div className="insight-copy">This assessment set does not currently show reusable cross-standard gap clusters.</div>
                </div>
              )}
            </div>
          </Panel>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Panel label="Executive cues" title="How to read this page" description="Short guidance so the page feels instructive instead of visually dense.">
            <div className="insight-list">
              <div className="insight-row">
                <div className="insight-kicker"><AlertTriangle size={14} /></div>
                <div>
                  <div className="insight-title">Start with the heatmap</div>
                  <div className="insight-copy">Use the highest exposure bucket to identify where legal and operational risk are clustering together.</div>
                </div>
              </div>
              <div className="insight-row">
                <div className="insight-kicker"><TrendingUp size={14} /></div>
                <div>
                  <div className="insight-title">Then compare to benchmark</div>
                  <div className="insight-copy">Negative benchmark deltas tell you where the organization is lagging sector expectations, even if internal trendlines look stable.</div>
                </div>
              </div>
              <div className="insight-row">
                <div className="insight-kicker"><Scale size={14} /></div>
                <div>
                  <div className="insight-title">Use the simulator last</div>
                  <div className="insight-copy">The maturity simulator helps estimate payoff after you know which themes and standards deserve priority investment.</div>
                </div>
              </div>
            </div>
          </Panel>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Panel label="Scenario planning" title="Compliance readiness timeline" description="Model the likely score improvement from closing top gaps, delivering quick wins, or executing the full remediation roadmap.">
          <ComplianceReadinessTimeline assessment={currentAssessment} />
        </Panel>
      </motion.div>
    </div>
  );
}
