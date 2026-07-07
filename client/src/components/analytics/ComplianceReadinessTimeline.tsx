import { useMemo, useState } from 'react';
import { ArrowUpRight, CalendarDays, Sparkles, Target } from 'lucide-react';
import type { AssessmentResult } from '../../types';
import {
  buildComplianceReadinessForecast,
  getComplianceReadinessScenarios,
  getStandardLabel,
} from '../../utils/enterpriseData';
import { RiskIndicator, ScoreBadge } from '../ui/EnterpriseComponents';

export default function ComplianceReadinessTimeline({ assessment }: { assessment: AssessmentResult }) {
  const scenarios = useMemo(() => getComplianceReadinessScenarios(assessment), [assessment]);
  const [scenarioId, setScenarioId] = useState<string>('full-roadmap');

  const activeScenario = scenarios.find((scenario) => scenario.id === scenarioId) || scenarios[scenarios.length - 1];
  const forecast = useMemo(
    () => buildComplianceReadinessForecast(assessment, activeScenario?.gapIds || []),
    [assessment, activeScenario]
  );

  const topMovers = [...forecast.standardProgress]
    .sort((left, right) => right.delta - left.delta)
    .slice(0, 3)
    .filter((item) => item.delta > 0);

  return (
    <div className="readiness-module">
      <div className="readiness-toolbar">
        <div>
          <div className="readiness-toolbar-label">Simulation mode</div>
          <div className="readiness-toolbar-title">{activeScenario?.label || 'Full roadmap'}</div>
          <div className="readiness-toolbar-copy">{activeScenario?.description || 'Apply the complete remediation roadmap across all phases.'}</div>
        </div>
        <div className="readiness-scenario-group" role="tablist" aria-label="Compliance readiness scenarios">
          {scenarios.map((scenario) => (
            <button
              key={scenario.id}
              type="button"
              className={`readiness-scenario-chip ${scenario.id === activeScenario?.id ? 'is-active' : ''}`}
              onClick={() => setScenarioId(scenario.id)}
            >
              {scenario.label}
            </button>
          ))}
        </div>
      </div>

      <div className="readiness-summary-grid">
        <div className="readiness-summary-card readiness-summary-card-primary">
          <div className="readiness-summary-label">Current compliance</div>
          <div className="readiness-summary-value">{forecast.currentScore}%</div>
          <div className="readiness-summary-copy">Baseline score before remediation milestones are delivered.</div>
        </div>
        <div className="readiness-summary-card">
          <div className="readiness-summary-label">Projected score</div>
          <div className="readiness-summary-value">{forecast.projectedScore}%</div>
          <div className="readiness-summary-copy">Estimated score after the selected scenario is completed.</div>
        </div>
        <div className="readiness-summary-card">
          <div className="readiness-summary-label">Modeled uplift</div>
          <div className="readiness-summary-value readiness-summary-delta">+{forecast.projectedImprovement}</div>
          <div className="readiness-summary-copy">Improvement based on open-gap severity and remediation linkage.</div>
        </div>
        <div className="readiness-summary-card">
          <div className="readiness-summary-label">Delivery load</div>
          <div className="readiness-summary-value">{forecast.totalEffortDays}d</div>
          <div className="readiness-summary-copy">Estimated remediation effort across {forecast.selectedGapIds.length} selected gaps.</div>
        </div>
      </div>

      <div className="readiness-timeline" aria-label="Compliance readiness roadmap">
        <div className="readiness-timeline-step readiness-timeline-step-current">
          <div className="readiness-step-pin">Now</div>
          <div className="readiness-step-card">
            <div className="readiness-step-headline">Current posture</div>
            <div className="readiness-step-score-row">
              <ScoreBadge score={forecast.currentScore} />
              <span className="readiness-step-window">Current state</span>
            </div>
            <div className="readiness-step-copy">{assessment.gaps.length} open gaps currently limit score progression across the active standards portfolio.</div>
          </div>
        </div>

        {forecast.milestones.map((milestone) => (
          <div key={milestone.phase} className="readiness-timeline-step">
            <div className="readiness-step-pin">{milestone.phaseLabel}</div>
            <div className="readiness-step-card">
              <div className="readiness-step-topline">
                <span className="readiness-step-window"><CalendarDays size={14} /> {milestone.timeWindow}</span>
                <span className={`readiness-step-delta ${milestone.delta > 0 ? 'is-positive' : ''}`}>
                  {milestone.delta > 0 ? '+' : ''}{milestone.delta} pts
                </span>
              </div>
              <div className="readiness-step-score-row readiness-step-score-row-spread">
                <div>
                  <div className="readiness-step-headline">Projected compliance</div>
                  <div className="readiness-step-score">{milestone.projectedScore}%</div>
                </div>
                <div className="readiness-step-meta">
                  <span>{milestone.addressedGapCount} gaps addressed</span>
                  <span>{milestone.effortDays} effort days</span>
                </div>
              </div>
              <div className="readiness-step-riskmix">
                <RiskIndicator level="critical" label={`${milestone.riskMix.critical} critical`} />
                <RiskIndicator level="high" label={`${milestone.riskMix.high} high`} />
                <RiskIndicator level="medium" label={`${milestone.riskMix.medium} medium`} />
                <RiskIndicator level="low" label={`${milestone.riskMix.low} low`} />
              </div>
              <div className="readiness-step-actions">
                {milestone.actions.length > 0 ? milestone.actions.slice(0, 3).map((action) => (
                  <div key={action.id} className="readiness-action-chip">
                    <Target size={13} />
                    <span>{action.title}</span>
                  </div>
                )) : (
                  <div className="readiness-step-copy">No explicitly linked remediation actions fall into this phase for the selected scenario.</div>
                )}
              </div>
              {milestone.fallbackSummary ? <div className="readiness-fallback-note">{milestone.fallbackSummary}</div> : null}
            </div>
          </div>
        ))}
      </div>

      <div className="readiness-detail-grid">
        <section className="readiness-detail-card">
          <div className="readiness-detail-header">
            <div>
              <div className="readiness-toolbar-label">Standard-level lift</div>
              <div className="readiness-detail-title">Where score gains concentrate</div>
            </div>
            <div className="readiness-detail-icon"><ArrowUpRight size={16} /></div>
          </div>
          <div className="readiness-standard-list">
            {forecast.standardProgress.map((standard) => (
              <div key={standard.standardCode} className="readiness-standard-row">
                <div className="readiness-standard-head">
                  <span>{getStandardLabel(standard.standardCode)}</span>
                  <span>{standard.projected}%</span>
                </div>
                <div className="readiness-standard-bar-track">
                  <div className="readiness-standard-bar-current" style={{ width: `${standard.current}%` }} />
                  <div className="readiness-standard-bar-projected" style={{ width: `${standard.projected}%` }} />
                </div>
                <div className="readiness-standard-meta">
                  <span>Current {standard.current}%</span>
                  <span>{standard.delta > 0 ? `+${standard.delta}` : `${standard.delta}`} pts</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="readiness-detail-card">
          <div className="readiness-detail-header">
            <div>
              <div className="readiness-toolbar-label">Scenario focus</div>
              <div className="readiness-detail-title">Selected remediation scope</div>
            </div>
            <div className="readiness-detail-icon"><Sparkles size={16} /></div>
          </div>
          <div className="readiness-focus-copy">
            {forecast.selectedGapIds.length > 0
              ? `${forecast.selectedGapIds.length} gaps are included in this scenario. The strongest modeled gains are expected in ${topMovers.map((item) => item.label).join(', ') || 'the selected standards set'}.`
              : 'No gaps are selected in the current-state view, so the roadmap shows baseline posture only.'}
          </div>
          <div className="readiness-gap-list">
            {forecast.selectedGaps.slice(0, 5).map((gap) => (
              <div key={gap.id} className="readiness-gap-card">
                <div className="readiness-gap-card-top">
                  <RiskIndicator level={gap.impact} label={`${gap.impact} risk`} />
                  <span className="readiness-gap-standard">{getStandardLabel(gap.standardCode)}</span>
                </div>
                <div className="readiness-gap-title">{gap.title}</div>
                <div className="readiness-gap-copy">Clause {gap.clauseId} · Impact {gap.impactScore}/10 · Effort {gap.effortScore}/10</div>
              </div>
            ))}
            {forecast.selectedGapIds.length === 0 ? <div className="readiness-empty-state">Select a scenario to see modeled remediation scope.</div> : null}
          </div>
        </section>
      </div>
    </div>
  );
}
