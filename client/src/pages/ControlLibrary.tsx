import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { standardsApi } from '../utils/apiClient';
import type { StandardCode } from '../types';
import { EmptyWorkspace, MetricCard, PageHero, Panel } from '../components/ui/EnterpriseLayout';
import { DataTable, InsightCard, SummaryStatCard } from '../components/ui/EnterpriseComponents';
import { getAssessedStandardCodes, getControlCoverage, getStandardLabel, getStandardStatus, standardColors } from '../utils/enterpriseData';

interface LoadedControlSet {
  code: string;
  fullName: string;
  clauses: Array<{ id: string; title: string; description: string; category: string; weight?: number }>;
}

export default function ControlLibrary() {
  const navigate = useNavigate();
  const { currentAssessment } = useAppStore();
  const [selected, setSelected] = useState<'ALL' | StandardCode>('ALL');
  const [controls, setControls] = useState<LoadedControlSet[]>([]);

  useEffect(() => {
    let active = true;
    const codes = getAssessedStandardCodes(currentAssessment);

    Promise.all(codes.map((code) => standardsApi.getClauses(code)))
      .then((responses) => {
        if (!active) return;
        setControls(responses.map((response) => ({ code: response.code, fullName: response.fullName || response.name, clauses: response.clauses })));
      })
      .catch(() => {
        if (active) setControls([]);
      });

    return () => {
      active = false;
    };
  }, [currentAssessment]);

  if (!currentAssessment) {
    return (
      <EmptyWorkspace
        title="Control library is generated from assessed standards"
        description="Run an assessment to overlay clause-level performance on the live standards library."
        action={<button onClick={() => navigate('/assessment')} className="btn btn-primary">Start assessment</button>}
      />
    );
  }

  const visibleControls = controls.filter((controlSet) => selected === 'ALL' || controlSet.code === selected);
  const totalControls = visibleControls.reduce((count, controlSet) => count + controlSet.clauses.length, 0);
  const weakestStandard = [...currentAssessment.standards].sort((left, right) => left.overallScore - right.overallScore)[0];
  const categoryCounts = useMemo(
    () => Array.from(new Set(visibleControls.flatMap((controlSet) => controlSet.clauses.map((clause) => clause.category))))
      .map((category) => ({
        category,
        count: visibleControls.reduce((sum, controlSet) => sum + controlSet.clauses.filter((clause) => clause.category === category).length, 0),
      }))
      .sort((left, right) => right.count - left.count),
    [visibleControls]
  );

  return (
    <div className="page-stack">
      <PageHero
        eyebrow="Control intelligence"
        title="Control Library"
        description="Clause inventory, implementation overlay, and category-level control coverage across the assessed standards set."
        aside={
          <div className="hero-stat-stack">
            <div className="hero-stat-label">Weakest coverage</div>
            <div className="hero-stat-value">{weakestStandard ? getStandardLabel(weakestStandard.standardCode) : 'N/A'}</div>
            <div className="hero-stat-copy">Review low-scoring clauses before approving remediation plans.</div>
          </div>
        }
      />

      <div className="metric-grid">
        <MetricCard label="Control points" value={totalControls} caption="Live clauses loaded from the standards service" tone="brand" />
        <MetricCard label="Standards loaded" value={controls.length} caption="Control inventories currently in the workspace" />
        <MetricCard label="Implemented controls" value={currentAssessment.standards.reduce((sum, standard) => sum + getControlCoverage(standard).implemented, 0)} caption="Clauses scoring 85% or higher" tone="success" />
        <MetricCard label="Coverage gaps" value={currentAssessment.gaps.length} caption="Open deficiencies linked to control obligations" tone="warn" />
      </div>

      <Panel label="Standard filter" title="View control families" description="Switch between all standards or inspect one control framework at a time.">
        <div className="filter-row">
          <button className={`filter-chip ${selected === 'ALL' ? 'active' : ''}`} onClick={() => setSelected('ALL')}>All standards</button>
          {currentAssessment.standards.map((standard) => (
            <button
              key={standard.standardCode}
              className={`filter-chip ${selected === standard.standardCode ? 'active' : ''}`}
              onClick={() => setSelected(standard.standardCode as StandardCode)}
            >
              {getStandardLabel(standard.standardCode)}
            </button>
          ))}
        </div>
      </Panel>

      <div className="enterprise-two-column">
        <Panel label="Coverage overview" title="Implementation by standard" description="Derived from clause scores on the latest assessment.">
          <div className="summary-grid-responsive">
            {currentAssessment.standards.map((standard) => {
              const coverage = getControlCoverage(standard);
              return (
                <SummaryStatCard
                  key={standard.standardCode}
                  label={getStandardLabel(standard.standardCode)}
                  value={`${coverage.implementedPct}%`}
                  description={`${coverage.partial} partial · ${coverage.missing} missing · ${getStandardStatus(standard.overallScore)}`}
                  tone={coverage.implementedPct >= 80 ? 'success' : coverage.implementedPct >= 65 ? 'brand' : 'warn'}
                />
              );
            })}
          </div>
        </Panel>

        <Panel label="Category scan" title="Most represented control domains" description="Use category density to identify broad operating model themes.">
          <div className="enterprise-three-column">
            {categoryCounts.slice(0, 6).map(({ category, count }) => (
              <InsightCard
                key={category}
                eyebrow={category}
                title={`${count} controls`}
                description="Cross-standard clause count for this control family. Use this to identify repeatable evidence packs and shared operating controls."
                tone={count >= 8 ? 'brand' : 'default'}
              />
            ))}
          </div>
        </Panel>
      </div>

      <Panel label="Control inventory" title="Clause-level implementation register" description="Mapped directly to live standards content and the latest assessment overlay.">
        <DataTable<{
          standard: string;
          clauseId: string;
          category: string;
          title: string;
          description: string;
          score: number | null;
        }>
          caption="Live clause inventory with current assessment overlay."
          columns={[
            { key: 'standard', header: 'Standard', cell: (row) => <span style={{ color: standardColors[row.standard] || 'var(--slate-700)', fontWeight: 700 }}>{getStandardLabel(row.standard)}</span> },
            { key: 'clauseId', header: 'Clause', cell: (row) => row.clauseId },
            { key: 'category', header: 'Category', cell: (row) => row.category },
            {
              key: 'title',
              header: 'Control title',
              cell: (row) => (
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{row.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--slate-500)' }}>{row.description}</div>
                </div>
              ),
            },
            {
              key: 'status',
              header: 'Status',
              cell: (row) => row.score === null
                ? <span className="badge badge-pending">Not assessed</span>
                : <span className={`badge badge-${getStandardStatus(row.score) === 'non-compliant' ? 'critical' : getStandardStatus(row.score)}`}>{getStandardStatus(row.score)}</span>,
            },
            { key: 'score', header: 'Score', cell: (row) => row.score === null ? '—' : `${row.score}%` },
          ]}
          rows={visibleControls.flatMap((controlSet) => {
            const overlay = currentAssessment.standards.find((standard) => standard.standardCode === controlSet.code);
            return controlSet.clauses.map((clause) => {
              const clauseOverlay = overlay?.clauseScores.find((item) => item.clauseId === clause.id);
              return {
                standard: controlSet.code,
                clauseId: clause.id,
                category: clause.category,
                title: clause.title,
                description: clause.description,
                score: clauseOverlay?.score ?? null,
              };
            });
          })}
          rowKey={(row) => `${row.standard}-${row.clauseId}`}
        />
      </Panel>
    </div>
  );
}