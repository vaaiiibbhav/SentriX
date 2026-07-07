import { useEffect, useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import type { KnowledgeBaseOverview, QuestionnaireResponse, StandardCode, StandardLibraryItem } from '../types';
import { useAppStore } from '../store/useAppStore';
import { standardsApi } from '../utils/apiClient';
import { EmptyWorkspace, MetricCard, PageHero, Panel } from '../components/ui/EnterpriseLayout';
import { ClauseStatusTag, DataTable, RiskIndicator, ScoreBadge } from '../components/ui/EnterpriseComponents';
import { getStandardLabel, getStandardStatus, standardColors } from '../utils/enterpriseData';

const supportedStandards: StandardCode[] = ['ISO37001', 'ISO37301', 'ISO27001', 'ISO9001'];

export default function Standards() {
  const { currentAssessment, orgProfile } = useAppStore();
  const [selected, setSelected] = useState<StandardCode>('ISO37001');
  const [library, setLibrary] = useState<StandardLibraryItem[]>([]);
  const [clauses, setClauses] = useState<Array<{ id: string; title: string; description: string; category: string; weight?: number }>>([]);
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireResponse | null>(null);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseOverview | null>(null);
  const [libraryLoading, setLibraryLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(true);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const industry = currentAssessment?.orgProfile.industrySector || orgProfile.industrySector || 'Other';

  useEffect(() => {
    let active = true;
    setLibraryLoading(true);
    standardsApi.getLibrary()
      .then((response) => {
        if (!active) return;
        setLibrary(response.standards);
      })
      .catch(() => {
        if (!active) return;
        setLibrary([]);
      })
      .finally(() => {
        if (active) setLibraryLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const loadStandardDetails = () => {
    setDetailLoading(true);
    setDetailError(null);

    Promise.all([
      standardsApi.getClauses(selected),
      standardsApi.getQuestionnaire(selected),
      standardsApi.getKnowledgeBase(industry),
    ])
      .then(([clauseResponse, questionnaireResponse, knowledgeResponse]) => {
        setClauses(clauseResponse.clauses);
        setQuestionnaire(questionnaireResponse);
        setKnowledgeBase(knowledgeResponse);
      })
      .catch((error) => {
        setClauses([]);
        setQuestionnaire(null);
        setDetailError(error instanceof Error ? error.message : 'Unable to load standards content.');
      })
      .finally(() => {
        setDetailLoading(false);
      });
  };

  useEffect(() => {
    loadStandardDetails();
  }, [selected, industry]);

  const selectedLibrary = library.find((item) => item.code === selected);
  const standardOverlay = currentAssessment?.standards.find((standard) => standard.standardCode === selected);

  const filteredClauses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return clauses;
    return clauses.filter((clause) => [clause.id, clause.title, clause.description, clause.category].some((value) => value.toLowerCase().includes(query)));
  }, [clauses, searchQuery]);

  const filteredQuestions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return questionnaire?.questions || [];
    return (questionnaire?.questions || []).filter((question) =>
      [question.question, question.category, question.legalBasis, question.clauseRef, question.failureConsequence]
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [questionnaire, searchQuery]);

  const groupedClauses = useMemo(() => {
    return Object.entries(
      filteredClauses.reduce<Record<string, typeof filteredClauses>>((accumulator, clause) => {
        if (!accumulator[clause.category]) accumulator[clause.category] = [];
        accumulator[clause.category].push(clause);
        return accumulator;
      }, {})
    );
  }, [filteredClauses]);

  const groupedQuestions = useMemo(() => {
    return Object.entries(
      filteredQuestions.reduce<Record<string, typeof filteredQuestions>>((accumulator, question) => {
        if (!accumulator[question.category]) accumulator[question.category] = [];
        accumulator[question.category].push(question);
        return accumulator;
      }, {})
    );
  }, [filteredQuestions]);

  const commonFindings = knowledgeBase?.commonAuditFindings.filter((finding) => finding.standardCode === selected) || [];
  const benchmark = knowledgeBase?.industryBenchmark.averageScores[selected];

  if (libraryLoading && !selectedLibrary) {
    return <div className="skeleton" style={{ height: 480 }} />;
  }

  if (!selectedLibrary && library.length === 0 && !libraryLoading) {
    return (
      <EmptyWorkspace
        title="Standards library unavailable"
        description="The standards service did not return library metadata. Verify the backend is running and retry."
        action={<button onClick={() => window.location.reload()} className="btn btn-primary">Retry</button>}
      />
    );
  }

  return (
    <div className="page-stack">
      <PageHero
        eyebrow="Standards intelligence"
        title={`${getStandardLabel(selected)} clause and questionnaire workspace`}
        description={selectedLibrary?.fullName || selectedLibrary?.name || 'Live standards library and compliance overlay'}
        actions={<button onClick={loadStandardDetails} className="btn btn-secondary"><RefreshCw size={14} /> Refresh content</button>}
        aside={
          <div className="hero-stat-stack">
            <div className="hero-stat-label">Assessment overlay</div>
            <div className="hero-stat-value">{standardOverlay ? `${standardOverlay.overallScore}%` : 'Not assessed'}</div>
            <div className="hero-stat-copy">Latest score for this standard in the active assessment.</div>
          </div>
        }
      />

      <div className="metric-grid">
        <MetricCard label="Clauses" value={selectedLibrary?.clauseCount || clauses.length} caption="Current clause inventory" tone="brand" />
        <MetricCard label="Audit questions" value={questionnaire?.totalQuestions || 0} caption="Live questionnaire entries" />
        <MetricCard label="Mandatory questions" value={questionnaire?.mandatoryQuestions || selectedLibrary?.mandatoryQuestions || 0} caption="Questions tagged as mandatory" tone="warn" />
        <MetricCard label="Benchmark" value={benchmark ? `${benchmark}%` : 'n/a'} caption={`Industry average for ${industry}`} tone="success" />
      </div>

      <Panel label="Standard selector" title="Switch library context" description="The standards workspace is fully backed by the live standards routes.">
        <div className="filter-row">
          {supportedStandards.map((code) => (
            <button key={code} className={`filter-chip ${selected === code ? 'active' : ''}`} onClick={() => setSelected(code)}>
              {getStandardLabel(code)}
            </button>
          ))}
        </div>
      </Panel>

      <Panel label="Search" title="Clause and questionnaire search" description="Filter clauses, legal basis text, and questionnaire prompts for the selected standard.">
        <input
          className="form-input"
          placeholder="Search clause id, title, category, or legal basis"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      </Panel>

      {detailError ? (
        <EmptyWorkspace
          title="Standards content could not be loaded"
          description={detailError}
          action={<button onClick={loadStandardDetails} className="btn btn-primary">Retry standard load</button>}
        />
      ) : detailLoading ? (
        <div className="skeleton" style={{ height: 360 }} />
      ) : (
        <>
          <div className="enterprise-two-column">
            <Panel label="Clause categories" title="Control architecture" description="Browse categories and the current assessment overlay at clause level.">
              <div className="enterprise-three-column">
                {groupedClauses.map(([category, items]) => {
                  const scored = items
                    .map((clause) => standardOverlay?.clauseScores.find((score) => score.clauseId === clause.id)?.score)
                    .filter((score): score is number => typeof score === 'number');
                  const average = scored.length > 0 ? Math.round(scored.reduce((sum, score) => sum + score, 0) / scored.length) : null;
                  return (
                    <div key={category} className="insight-card">
                      <div className="insight-kicker">{category}</div>
                      <div className="insight-title">{items.length} clauses</div>
                      <div className="insight-copy">{average !== null ? `Average overlay score ${average}%` : 'No current assessment overlay for this category.'}</div>
                    </div>
                  );
                })}
              </div>
            </Panel>

            <Panel label="Risk context" title="Benchmark and audit intelligence" description="Knowledge-base guidance associated with the selected standard.">
              <div className="insight-list">
                <div className="insight-row">
                  <div className="insight-kicker">Benchmark</div>
                  <div>
                    <div className="insight-title">Industry average {benchmark ? `${benchmark}%` : 'not available'}</div>
                    <div className="insight-copy">Use benchmark context to frame reporting, but keep clause-level evidence as the primary source of truth.</div>
                  </div>
                </div>
                {commonFindings.slice(0, 4).map((finding, index) => (
                  <div key={`${finding.clauseCategory}-${index}`} className="insight-row">
                    <div className="insight-kicker"><RiskIndicator level={finding.criticality === 'critical' ? 'critical' : finding.criticality === 'high' ? 'high' : 'medium'} label={finding.criticality} /></div>
                    <div>
                      <div className="insight-title">{finding.clauseCategory}</div>
                      <div className="insight-copy">{finding.commonFindings[0] || 'Common audit issue available in the knowledge base.'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <Panel label="Clause breakdown" title="Detailed clause register" description="Each row shows the live library content and the latest assessment overlay status.">
            <DataTable
              caption="Library clauses shown alongside current assessment overlay, if one exists."
              rows={filteredClauses.map((clause) => {
                const overlay = standardOverlay?.clauseScores.find((item) => item.clauseId === clause.id);
                return { clause, overlay };
              })}
              rowKey={(row) => row.clause.id}
              columns={[
                {
                  key: 'clause',
                  header: 'Clause',
                  cell: (row) => (
                    <div>
                      <div style={{ fontWeight: 700, color: standardColors[selected] || 'var(--teal)' }}>{row.clause.id}</div>
                      <div style={{ color: 'var(--slate-900)' }}>{row.clause.title}</div>
                    </div>
                  ),
                },
                { key: 'category', header: 'Category', cell: (row) => row.clause.category },
                { key: 'description', header: 'Description', cell: (row) => row.clause.description },
                {
                  key: 'status',
                  header: 'Status',
                  cell: (row) => row.overlay ? <ClauseStatusTag status={row.overlay.status} /> : <span style={{ color: 'var(--slate-500)' }}>Not assessed</span>,
                },
                { key: 'score', header: 'Score', cell: (row) => row.overlay ? <ScoreBadge score={row.overlay.score} /> : '—' },
              ]}
            />
          </Panel>

          <Panel label="Questionnaire" title="Audit prompts, legal basis, and consequences" description="The questionnaire section is fully expanded and searchable to avoid hidden or empty content states.">
            <div className="space-y-4">
              {groupedQuestions.map(([category, questions]) => (
                <section key={category} className="insight-card" style={{ padding: 20 }}>
                  <div className="insight-kicker">{category}</div>
                  <div className="insight-title" style={{ marginBottom: 12 }}>{questions.length} questions</div>
                  <div className="space-y-3">
                    {questions.map((question) => (
                      <div key={question.id} className="question-card">
                        <div className="question-card-meta">
                          <span>{question.clauseRef}</span>
                          <span className={`badge badge-${question.severity === 'mandatory' ? 'critical' : 'medium'}`}>{question.severity}</span>
                        </div>
                        <div className="question-card-title">{question.question}</div>
                        <div className="question-card-copy">{question.legalBasis}</div>
                        <div className="question-card-copy"><strong>Failure impact:</strong> {question.failureConsequence}</div>
                        <div className="insight-tags">
                          {question.evidenceRequired.map((item) => (
                            <span key={item} className="badge badge-pending">{item}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}
