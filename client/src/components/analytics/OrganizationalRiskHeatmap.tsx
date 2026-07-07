import { Fragment, useMemo, useState } from 'react';
import type { AssessmentResult, Gap } from '../../types';

interface OrganizationalRiskHeatmapProps {
  assessment: AssessmentResult;
  regulatoryPressure?: 'low' | 'medium' | 'high' | 'very-high';
}

interface RiskCell {
  id: string;
  title: string;
  standardCode: string;
  clauseId: string;
  severity: number;
  likelihood: number;
  exposure: number;
  gap: Gap;
}

const pressureWeight: Record<NonNullable<OrganizationalRiskHeatmapProps['regulatoryPressure']>, number> = {
  low: 0,
  medium: 0.5,
  high: 1,
  'very-high': 1.5,
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getCellColor(exposure: number): string {
  if (exposure >= 20) return 'var(--heat-risk-critical)';
  if (exposure >= 15) return 'var(--heat-risk-high)';
  if (exposure >= 10) return 'var(--heat-risk-medium)';
  if (exposure >= 6) return 'var(--heat-risk-low)';
  return 'var(--heat-risk-minimal)';
}

function getExposureTone(exposure: number): 'critical' | 'high' | 'medium' | 'low' {
  if (exposure >= 20) return 'critical';
  if (exposure >= 15) return 'high';
  if (exposure >= 10) return 'medium';
  return 'low';
}

export default function OrganizationalRiskHeatmap({
  assessment,
  regulatoryPressure = 'medium',
}: OrganizationalRiskHeatmapProps) {
  const [selectedCell, setSelectedCell] = useState<{ severity: number; likelihood: number } | null>(null);

  const risks = useMemo<RiskCell[]>(() => {
    return assessment.gaps.map((gap) => {
      const standard = assessment.standards.find((item) => item.standardCode === gap.standardCode);
      const clause = standard?.clauseScores.find((item) => item.clauseId === gap.clauseId);
      const evidenceItems = assessment.evidenceValidation.evidenceItems.filter(
        (item) => item.standardCode === gap.standardCode && item.clauseId === gap.clauseId
      );
      const weakEvidenceCount = evidenceItems.filter(
        (item) => item.validationResult === 'insufficient' || item.validationResult === 'missing'
      ).length;
      const controlWeakness = 5 - Math.round((clause?.score || standard?.overallScore || 50) / 20);
      const evidenceWeakness = weakEvidenceCount > 0 ? 1 : 0;
      const likelihood = clamp(
        Math.round((controlWeakness + evidenceWeakness + pressureWeight[regulatoryPressure]) / 1.5),
        1,
        5
      );
      const severity = clamp(Math.ceil(gap.impactScore / 2), 1, 5);

      return {
        id: gap.id,
        title: gap.title,
        standardCode: gap.standardCode,
        clauseId: gap.clauseId,
        severity,
        likelihood,
        exposure: severity * likelihood,
        gap,
      };
    });
  }, [assessment, regulatoryPressure]);

  const cells = useMemo(() => {
    return Array.from({ length: 5 }, (_, rowIndex) =>
      Array.from({ length: 5 }, (_, columnIndex) => {
        const severity = 5 - rowIndex;
        const likelihood = columnIndex + 1;
        const items = risks.filter((risk) => risk.severity === severity && risk.likelihood === likelihood);
        const maxExposure = items.reduce((highest, item) => Math.max(highest, item.exposure), 0);

        return {
          severity,
          likelihood,
          items,
          maxExposure,
        };
      })
    );
  }, [risks]);

  const selectedItems = selectedCell
    ? risks.filter((risk) => risk.severity === selectedCell.severity && risk.likelihood === selectedCell.likelihood)
    : [];

  const focusedRisks = selectedItems.length > 0 ? selectedItems : risks;

  const focusedSummary = useMemo(() => {
    const sorted = [...focusedRisks].sort((left, right) => right.exposure - left.exposure);
    const highestExposure = sorted[0]?.exposure || 0;
    const averageExposure = sorted.length > 0 ? Math.round(sorted.reduce((sum, item) => sum + item.exposure, 0) / sorted.length) : 0;

    return {
      count: sorted.length,
      highestExposure,
      averageExposure,
      themes: [...new Set(sorted.map((risk) => risk.gap.category))].slice(0, 3),
    };
  }, [focusedRisks]);

  const visibleRisks = selectedCell
    ? risks
        .filter((risk) => risk.severity === selectedCell.severity && risk.likelihood === selectedCell.likelihood)
        .sort((left, right) => right.exposure - left.exposure)
    : [...risks].sort((left, right) => right.exposure - left.exposure).slice(0, 6);

  const highestRisk = [...risks].sort((left, right) => right.exposure - left.exposure)[0] || null;

  return (
    <div className="analytics-heatmap-layout">
      <div className="analytics-heatmap-shell">
        <div className="analytics-heatmap-topline">
          <div>
            <div className="hero-stat-label">Likelihood axis</div>
            <div className="insight-copy">Left to right progression reflects control weakness, evidence weakness, and current regulatory pressure.</div>
          </div>
          <div className="analytics-heatmap-badges">
            <span className="badge badge-low">Low exposure</span>
            <span className="badge badge-medium">Moderate exposure</span>
            <span className="badge badge-high">High exposure</span>
            <span className="badge badge-critical">Critical exposure</span>
          </div>
        </div>

        <div className="analytics-matrix-grid">
          <div />
          {[1, 2, 3, 4, 5].map((value) => (
            <div key={`likelihood-${value}`} className="analytics-axis-label analytics-axis-label-top">
              L{value}
            </div>
          ))}

          {cells.map((row) => (
            <Fragment key={`row-${row[0].severity}`}>
              <div key={`severity-${row[0].severity}`} className="analytics-axis-label analytics-axis-label-side">
                S{row[0].severity}
              </div>
              {row.map((cell) => {
                const isSelected = selectedCell?.severity === cell.severity && selectedCell?.likelihood === cell.likelihood;
                return (
                  <button
                    key={`${cell.severity}-${cell.likelihood}`}
                    type="button"
                    onClick={() => setSelectedCell(isSelected ? null : { severity: cell.severity, likelihood: cell.likelihood })}
                    className={`analytics-heatmap-cell ${isSelected ? 'analytics-heatmap-cell-selected' : ''}`}
                    style={{
                      background: getCellColor(cell.maxExposure),
                    }}
                    aria-label={`Severity ${cell.severity}, likelihood ${cell.likelihood}, ${cell.items.length} risks`}
                  >
                    <div className="analytics-heatmap-cell-count score-display">{cell.items.length}</div>
                    <div className="analytics-heatmap-cell-meta">{cell.items.length === 1 ? 'risk' : 'risks'}</div>
                  </button>
                );
              })}
            </Fragment>
          ))}
        </div>

        <div className="analytics-heatmap-footnote">
          <span>Severity rises from bottom to top based on impact score and legal criticality.</span>
          <span>Click any bucket to narrow the intelligence rail to that risk cluster.</span>
        </div>
      </div>

      <aside className="analytics-risk-pane">
        <div className="analytics-risk-pane-head">
          <div>
            <div className="hero-stat-label">{selectedCell ? `Selected bucket S${selectedCell.severity} / L${selectedCell.likelihood}` : 'Highest exposure view'}</div>
            <div className="analytics-risk-pane-title">{selectedCell ? 'Focused risk cluster' : 'Priority risk stack'}</div>
            <div className="insight-copy">{selectedCell ? 'This pane is filtered to the chosen matrix bucket.' : 'The pane defaults to the most exposed risks across the current assessment.'}</div>
          </div>
          {selectedCell ? (
            <button type="button" className="btn btn-ghost" onClick={() => setSelectedCell(null)}>
              Clear filter
            </button>
          ) : null}
        </div>

        <div className="analytics-risk-summary-grid">
          <div className="analytics-risk-summary-card">
            <div className="metric-card-label">Visible risks</div>
            <div className="metric-card-value score-display">{focusedSummary.count}</div>
            <div className="metric-card-caption">Items currently represented in this intelligence rail.</div>
          </div>
          <div className="analytics-risk-summary-card">
            <div className="metric-card-label">Peak exposure</div>
            <div className="metric-card-value score-display">{focusedSummary.highestExposure}</div>
            <div className="metric-card-caption">Highest exposure score in the current selection.</div>
          </div>
          <div className="analytics-risk-summary-card analytics-risk-summary-card-wide">
            <div className="metric-card-label">Risk themes</div>
            <div className="insight-tags" style={{ marginTop: 8 }}>
              {focusedSummary.themes.length > 0 ? focusedSummary.themes.map((theme) => (
                <span key={theme} className="badge badge-pending">{theme}</span>
              )) : <span className="badge badge-pending">No active themes</span>}
            </div>
          </div>
        </div>

        <div className="analytics-risk-highlight">
          <div className="hero-stat-label">Exposure narrative</div>
          <div className="analytics-risk-highlight-title">{highestRisk?.title || 'No active risk found'}</div>
          <div className="insight-copy">
            {selectedCell
              ? `The selected bucket averages ${focusedSummary.averageExposure} exposure points. Focus here if you need a targeted remediation brief.`
              : `Highest overall exposure is currently ${highestRisk?.exposure || 0}, shaped by combined severity, likelihood, and evidence weakness.`}
          </div>
        </div>

        <div className="analytics-risk-list">
          {visibleRisks.map((risk) => (
            <div
              key={risk.id}
              className="analytics-risk-card"
            >
              <div className="analytics-risk-card-head">
                <div>
                  <div className="analytics-risk-card-title">{risk.title}</div>
                  <div className="analytics-risk-card-subtitle">{risk.standardCode.replace('ISO', 'ISO ')} · Clause {risk.clauseId}</div>
                </div>
                <div className={`badge badge-${getExposureTone(risk.exposure)}`}>
                  {risk.exposure} exposure
                </div>
              </div>
              <div className="analytics-risk-card-metrics">
                <span>Severity {risk.severity}/5</span>
                <span>Likelihood {risk.likelihood}/5</span>
                <span className="analytics-risk-category">{risk.gap.category}</span>
              </div>
              <div className="analytics-risk-card-copy">
                {risk.gap.description}
              </div>
            </div>
          ))}
          {visibleRisks.length === 0 && (
            <div className="analytics-risk-empty">
              No active risks in this cell.
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
