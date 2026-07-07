import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { standardsApi } from '../utils/apiClient';
import type { KnowledgeBaseOverview, StandardLibraryItem } from '../types';
import { useAppStore } from '../store/useAppStore';
import { EmptyWorkspace, MetricCard, PageHero, Panel } from '../components/ui/EnterpriseLayout';
import { ActionCard, DataTable, InsightCard, SummaryStatCard } from '../components/ui/EnterpriseComponents';

export default function KnowledgeBase() {
  const { currentAssessment, orgProfile } = useAppStore();
  const [library, setLibrary] = useState<StandardLibraryItem[]>([]);
  const [overview, setOverview] = useState<KnowledgeBaseOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const industry = currentAssessment?.orgProfile.industrySector || orgProfile.industrySector || 'Other';

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    Promise.all([standardsApi.getLibrary(), standardsApi.getKnowledgeBase(industry)])
      .then(([libraryResponse, overviewResponse]) => {
        if (!active) return;
        setLibrary(libraryResponse.standards);
        setOverview(overviewResponse);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Unable to load the compliance knowledge base.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [industry]);

  const frameworkCount = useMemo(
    () => Object.values(overview?.legalFrameworkReferences || {}).reduce((count, items) => count + items.length, 0),
    [overview]
  );

  if (loading) {
    return <div className="skeleton" style={{ height: 420 }} />;
  }

  if (error || !overview) {
    return (
      <EmptyWorkspace
        title="Knowledge services unavailable"
        description={error || 'The knowledge base endpoint did not return data for this industry context.'}
        action={<button onClick={() => window.location.reload()} className="btn btn-primary">Retry</button>}
      />
    );
  }

  return (
    <div className="page-stack">
      <PageHero
        eyebrow="Compliance intelligence"
        title="Knowledge Base"
        description={`Legal references, maturity guidance, and cross-standard mappings tailored to ${industry}.`}
        actions={<button onClick={() => window.location.reload()} className="btn btn-secondary"><RefreshCw size={14} /> Refresh</button>}
        aside={
          <div className="hero-stat-stack">
            <div className="hero-stat-label">Industry pressure</div>
            <div className="hero-stat-value">{overview.industryBenchmark.regulatoryPressure}</div>
            <div className="hero-stat-copy">Benchmark anchored to current industry selection.</div>
          </div>
        }
      />

      <div className="metric-grid">
        <MetricCard label="Supported standards" value={library.length} caption="Live clause and questionnaire coverage" tone="brand" />
        <MetricCard label="Framework references" value={frameworkCount} caption="Mapped across ISO compliance domains" />
        <MetricCard label="Common findings" value={overview.commonAuditFindings.length} caption="Observed gap archetypes in the knowledge pack" tone="warn" />
        <MetricCard label="Crosswalk mappings" value={overview.crossStandardMappings.length} caption="Clause relationships for reuse and harmonization" tone="success" />
      </div>

      <div className="enterprise-two-column">
        <Panel label="Standards library" title="Assurance content inventory" description="Each standard exposes clauses, questionnaire coverage, and category metadata.">
          <DataTable<StandardLibraryItem>
            caption="Supported standards loaded from the live standards service."
            columns={[
              {
                key: 'standard',
                header: 'Standard',
                cell: (standard) => (
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{standard.fullName}</div>
                    <div style={{ fontSize: 12, color: 'var(--slate-500)' }}>{standard.code.replace('ISO', 'ISO ')}</div>
                  </div>
                ),
              },
              { key: 'version', header: 'Version', cell: (standard) => standard.version },
              { key: 'clauses', header: 'Clauses', cell: (standard) => standard.clauseCount },
              { key: 'questions', header: 'Questions', cell: (standard) => standard.totalQuestions },
              { key: 'mandatory', header: 'Mandatory', cell: (standard) => standard.mandatoryQuestions },
            ]}
            rows={library}
            rowKey={(standard) => standard.code}
          />
        </Panel>

        <Panel label="Maturity model" title="Readiness progression" description="Use the model to frame executive reporting and remediation sequencing.">
          <div className="enterprise-three-column">
            {overview.maturityModel.map((item) => (
              <InsightCard
                key={item.level}
                eyebrow={`Level ${item.level}`}
                title={item.name}
                description={item.description}
                tone={item.level >= 4 ? 'success' : item.level === 3 ? 'brand' : 'default'}
                footer={
                  <>
                    <span className="badge badge-pending">Score {item.scoreRange[0]}-{item.scoreRange[1]}</span>
                    {item.characteristics.slice(0, 2).map((characteristic) => (
                      <span key={characteristic} className="badge badge-pending">{characteristic}</span>
                    ))}
                  </>
                }
              />
            ))}
          </div>
        </Panel>
      </div>

      <div className="enterprise-two-column">
        <Panel label="Legal references" title="Framework map" description="Reference sources captured by the standards knowledge service.">
          <div className="action-grid">
            {Object.entries(overview.legalFrameworkReferences).map(([standardCode, references]) => (
              <ActionCard
                key={standardCode}
                label={standardCode.replace('ISO', 'ISO ')}
                title={`${references.length} related instruments`}
                description={references
                  .slice(0, 3)
                  .map((reference) => String(reference.name || reference.title || reference.jurisdiction || 'Reference'))
                  .join(' • ')}
              />
            ))}
          </div>
        </Panel>

        <Panel label="Cross-standard reuse" title="Control harmonization opportunities" description="Where standards align, reuse evidence and remediation artifacts instead of rebuilding them.">
          <div className="insight-list">
            {overview.crossStandardMappings.slice(0, 8).map((mapping, index) => (
              <div key={`${mapping.sourceStandard}-${mapping.sourceClause}-${index}`} className="insight-row">
                <div className="insight-kicker">{mapping.relationship}</div>
                <div>
                  <div className="insight-title">{mapping.sourceStandard} {mapping.sourceClause} → {mapping.targetStandard} {mapping.targetClause}</div>
                  <div className="insight-copy">{mapping.rationale}</div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel label="Audit findings" title="Frequent failure patterns" description="Use these archetypes to calibrate assessment narratives and remediation playbooks.">
        <div className="enterprise-three-column">
          {overview.commonAuditFindings.map((finding, index) => (
            <InsightCard
              key={`${finding.standardCode}-${finding.clauseCategory}-${index}`}
              eyebrow={`${finding.standardCode.replace('ISO', 'ISO ')} · ${finding.criticality}`}
              title={finding.clauseCategory}
              description={`Typical score: ${finding.typicalScore}%. ${finding.commonFindings.slice(0, 2).join(' ')}`}
              tone={finding.criticality === 'critical' ? 'danger' : finding.criticality === 'high' ? 'warn' : 'default'}
              footer={
                <>
                  {finding.commonFindings.slice(0, 3).map((item) => (
                    <span key={item} className="badge badge-pending">{item}</span>
                  ))}
                </>
              }
            />
          ))}
        </div>
      </Panel>

      <Panel label="Benchmarks" title="Industry context" description="Benchmark data enriches narrative quality and remediation prioritization.">
        <div className="enterprise-two-column">
          <ActionCard
            label={overview.industryBenchmark.industry}
            title="Benchmark references available for all supported standards"
            description="Use the benchmark set as contextual evidence, not a substitute for clause-level verification."
            action={<a href="/risk-intelligence" className="btn btn-ghost">Review risk intelligence <ExternalLink size={14} /></a>}
          />
          <div className="summary-grid-responsive">
            {Object.entries(overview.industryBenchmark.averageScores).map(([code, value]) => (
              <SummaryStatCard
                key={code}
                label={code.replace('ISO', 'ISO ')}
                value={`${value}%`}
                description="Industry benchmark score"
                tone="brand"
              />
            ))}
          </div>
        </div>
      </Panel>
    </div>
  );
}