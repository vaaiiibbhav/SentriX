import { useCallback, useMemo, useState, type DragEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle,
  ChevronDown,
  FileText,
  Loader2,
  Play,
  Upload,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '../store/useAppStore';
import { demoAssessmentResult } from '../data/demo-data';
import { useAssessmentStream } from '../hooks/useAssessmentStream';
import { assessmentApi } from '../utils/apiClient';
import { adaptAssessmentResult } from '../utils/assessmentAdapter';
import type { AssessmentResult, OrgProfile, StandardCode, UploadedDocumentInfo } from '../types';
import { MetricCard, PageHero, Panel } from '../components/ui/EnterpriseLayout';
import { ActionCard, InsightCard, SummaryStatCard, WorkflowStage } from '../components/ui/EnterpriseComponents';

const industries = [
  'Financial Services', 'Healthcare', 'Technology', 'Manufacturing',
  'Energy & Utilities', 'Retail & Consumer', 'Government', 'Professional Services',
];

const employeeRanges = ['1-50', '51-200', '201-500', '501-1000', '1000-5000', '5000+'];

const jurisdictions = [
  'Australia', 'Canada', 'European Union', 'Germany', 'Singapore',
  'United Kingdom', 'United States', 'Other',
];

const maturityOptions: Array<{ value: NonNullable<OrgProfile['currentMaturity']>; label: string; desc: string }> = [
  { value: 'initial', label: 'Initial', desc: 'Ad-hoc processes and no formal program baseline.' },
  { value: 'developing', label: 'Developing', desc: 'Some documented policies but inconsistent execution.' },
  { value: 'defined', label: 'Defined', desc: 'Formal program established and maintained.' },
  { value: 'managed', label: 'Managed', desc: 'Monitored, measured, and controlled across functions.' },
  { value: 'optimizing', label: 'Optimizing', desc: 'Continuous improvement and evidence-driven governance.' },
];

const standardOptions: { code: StandardCode; name: string; desc: string; clauses: number; scope: string }[] = [
  { code: 'ISO37001', name: 'ISO 37001:2025', desc: 'Anti-Bribery Management Systems', clauses: 33, scope: 'Anti-bribery, gifts and hospitality, third-party risk' },
  { code: 'ISO37301', name: 'ISO 37301:2021', desc: 'Compliance Management Systems', clauses: 28, scope: 'Governance framework, obligations register, culture' },
  { code: 'ISO27001', name: 'ISO 27001:2022', desc: 'Information Security Management', clauses: 24, scope: 'ISMS, risk treatment, incident response' },
  { code: 'ISO9001', name: 'ISO 9001:2015', desc: 'Quality Management Systems', clauses: 28, scope: 'Process control, customer focus, continual improvement' },
];

const steps = [
  { id: 0, label: 'Step 1', title: 'Organization', copy: 'Frame the assessment around industry, size, and maturity context.' },
  { id: 1, label: 'Step 2', title: 'Documents', copy: 'Provide policy and governance evidence for better clause scoring.' },
  { id: 2, label: 'Step 3', title: 'Standards', copy: 'Select the standards set for the current review.' },
  { id: 3, label: 'Step 4', title: 'Analysis', copy: 'Run the multi-agent workflow and observe execution state.' },
  { id: 4, label: 'Step 5', title: 'Results', copy: 'Review the readiness outcome and commit it to the workspace.' },
];

const agentNodes = [
  { name: 'Document Parsing Agent', task: 'Extracting structured governance, policy, and control evidence from uploaded material.' },
  { name: 'Clause Mapping Agent', task: 'Aligning evidence to relevant ISO clauses using semantic and standards knowledge.' },
  { name: 'Evidence Validation Agent', task: 'Testing evidence sufficiency and cross-standard reuse.' },
  { name: 'Compliance Scoring Agent', task: 'Calculating clause readiness scores and confidence levels.' },
  { name: 'Gap Detection Agent', task: 'Detecting missing controls, weak implementations, and legal exposure points.' },
  { name: 'Remediation Planning Agent', task: 'Generating a phased remediation program with owners and sequencing.' },
  { name: 'Policy Generation Agent', task: 'Drafting policy artifacts for weak control areas.' },
];

function StepProgress({ step }: { step: number }) {
  return (
    <div className="assessment-progress">
      {steps.map((item, index) => {
        const state = index < step ? 'is-complete' : index === step ? 'is-active' : '';

        return (
          <div key={item.id} className={`assessment-progress-step ${state}`.trim()}>
            <div className="assessment-progress-top">
              <div className="assessment-progress-index">{index < step ? <CheckCircle size={16} /> : index + 1}</div>
              <div className="assessment-progress-label">{item.label}</div>
            </div>
            <div>
              <div className="assessment-progress-title">{item.title}</div>
              <div className="assessment-progress-copy">{item.copy}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <div>
      <label className="form-label">
        {label}
        {required ? <span style={{ color: 'var(--risk-critical)', marginLeft: 2 }}>*</span> : null}
      </label>
      {children}
    </div>
  );
}

export default function Assessment() {
  const navigate = useNavigate();
  const {
    orgProfile,
    setOrgProfile,
    selectedStandards,
    setSelectedStandards,
    setAssessment,
    setAssessmentContext,
    clearChat,
    isDemoMode,
    addNotification,
  } = useAppStore();
  const { startStream } = useAssessmentStream();
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [agentStates, setAgentStates] = useState(
    agentNodes.map((agent) => ({ ...agent, status: 'idle' as 'idle' | 'processing' | 'complete', progress: 0 }))
  );
  const [logs, setLogs] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [finalScore, setFinalScore] = useState(62);
  const [completedAssessment, setCompletedAssessment] = useState<AssessmentResult | null>(null);

  const buildUploadedDocumentContext = (uploads: UploadedDocumentInfo[]) => uploads.map((upload) => ({
    originalName: upload.originalName,
    savedPath: upload.savedPath,
    size: upload.size,
    mimetype: upload.mimetype,
  }));

  const toggleStandard = (code: StandardCode) => {
    setSelectedStandards(
      selectedStandards.includes(code)
        ? selectedStandards.filter((standard) => standard !== code)
        : [...selectedStandards, code]
    );
  };

  const handleDrop = useCallback((event: DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    const newFiles = Array.from(event.dataTransfer.files).filter((file) => (
      ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'].includes(file.type)
    ));
    setFiles((current) => [...current, ...newFiles]);
  }, []);

  const removeFile = (index: number) => setFiles((current) => current.filter((_, currentIndex) => currentIndex !== index));

  const runDemoSimulation = async () => {
    setProcessing(true);
    setDone(false);
    setCompletedAssessment(null);

    const sequence = [
      { idx: 0, msg: 'Document Parsing Agent — Extracting content from uploaded policy documents...' },
      { idx: 1, msg: 'Clause Mapping Agent — Linking policy evidence to the live ISO clause architecture...' },
      { idx: 2, msg: 'Evidence Validation Agent — Classifying evidence as direct, indirect, anecdotal, or missing...' },
      { idx: 3, msg: 'Compliance Scoring Agent — Calculating readiness scores and confidence levels...' },
      { idx: 4, msg: 'Gap Detection Agent — Identified 12 compliance gaps, 5 critical severity...' },
      { idx: 5, msg: 'Remediation Planning Agent — Building a phased remediation roadmap...' },
      { idx: 6, msg: 'Policy Generation Agent — Drafting policies for missing controls...' },
    ];

    for (let index = 0; index < sequence.length; index += 1) {
      await new Promise((resolve) => setTimeout(resolve, 750));
      const { idx, msg } = sequence[index];
      setAgentStates((current) => current.map((agent, agentIndex) => {
        if (agentIndex === idx) {
          return { ...agent, status: 'processing' as const };
        }
        if (agentIndex < idx && current[agentIndex].status !== 'complete') {
          return { ...agent, status: 'complete' as const };
        }
        return agent;
      }));
      setLogs((current) => [...current, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    }

    setAgentStates((current) => current.map((agent) => ({ ...agent, status: 'complete' as const })));
    setLogs((current) => [...current, `[${new Date().toLocaleTimeString()}] Assessment complete — Overall Score: 62%`]);
    setCompletedAssessment({
      ...demoAssessmentResult,
      orgProfile: { ...demoAssessmentResult.orgProfile, ...orgProfile },
      timestamp: new Date().toISOString(),
      overallScore: 62,
      uploadedDocuments: files.map((file) => ({
        originalName: file.name,
        size: file.size,
        mimetype: file.type || undefined,
      })),
    });
    setProcessing(false);
    setDone(true);
    setFinalScore(62);
  };

  const startAnalysis = async () => {
    setProcessing(true);
    setDone(false);
    setLogs([]);
    setCompletedAssessment(null);
    setAgentStates(agentNodes.map((agent) => ({ ...agent, status: 'idle' as const, progress: 0 })));

    if (!isDemoMode) {
      try {
        const uploadedDocuments = await assessmentApi.uploadDocuments(files);
        const filePaths = uploadedDocuments.map((document) => document.savedPath).filter((path): path is string => Boolean(path));
        const response = await assessmentApi.startAssessment({
          filePaths,
          standards: selectedStandards,
          orgProfile: {
            company: orgProfile.companyName,
            industry: orgProfile.industrySector,
            employees: orgProfile.employeeCount,
            scope: orgProfile.assessmentScope,
          },
          uploadedDocuments: buildUploadedDocumentContext(uploadedDocuments),
        });

        startStream(
          response.assessmentId,
          (event) => {
            if (event.type === 'agent-start' && event.agent) {
              setAgentStates((current) => current.map((agent) => (
                agent.name === event.agent ? { ...agent, status: 'processing' as const } : agent
              )));
            }
            if (event.type === 'agent-complete' && event.agent) {
              setAgentStates((current) => current.map((agent) => (
                agent.name === event.agent ? { ...agent, status: 'complete' as const } : agent
              )));
            }
            if (event.type === 'log' && event.message) {
              setLogs((current) => [...current, `[${new Date().toLocaleTimeString()}] ${event.message}`]);
            }
          },
          (result, sessionId) => {
            const normalizedResult = adaptAssessmentResult(result, {
              sessionId: sessionId || response.assessmentId,
              uploadedDocuments,
            });
            setAgentStates((current) => current.map((agent) => ({ ...agent, status: 'complete' as const })));
            clearChat();
            setAssessmentContext(sessionId || response.assessmentId, uploadedDocuments);
            setCompletedAssessment(normalizedResult);
            setFinalScore(normalizedResult.overallScore || 62);
            setProcessing(false);
            setDone(true);
            toast.success('Assessment complete');
            addNotification({ type: 'success', title: 'Assessment Complete', message: `Overall score: ${normalizedResult.overallScore}%` });
          },
          (error) => {
            setProcessing(false);
            setLogs((current) => [...current, `[${new Date().toLocaleTimeString()}] Assessment failed: ${error}`]);
            toast.error(`Assessment failed: ${error}`);
            addNotification({ type: 'error', title: 'Assessment Failed', message: String(error) });
          }
        );
      } catch (error) {
        setProcessing(false);
        const message = error instanceof Error ? error.message : 'Unable to start assessment';
        toast.error(message);
        addNotification({ type: 'error', title: 'Assessment Failed', message });
      }
      return;
    }

    runDemoSimulation();
  };

  const finishAssessment = () => {
    if (!completedAssessment) {
      toast.error('No completed assessment is available to save.');
      return;
    }

    setAssessment(completedAssessment);
    setAssessmentContext(completedAssessment.sessionId || null, completedAssessment.uploadedDocuments || []);
    addNotification({ type: 'success', title: 'Assessment Saved', message: `Score: ${finalScore}%` });
    navigate('/dashboard');
  };

  const canProceed = () => {
    if (step === 0) return Boolean(orgProfile.companyName && orgProfile.industrySector);
    if (step === 1) return true;
    if (step === 2) return selectedStandards.length > 0;
    if (step === 3) return done;
    return true;
  };

  const selectedStandardDetails = useMemo(
    () => standardOptions.filter((option) => selectedStandards.includes(option.code)),
    [selectedStandards]
  );

  const scoreColor = finalScore >= 75 ? 'var(--status-compliant)' : finalScore >= 50 ? 'var(--risk-medium)' : 'var(--risk-critical)';
  const scoreLabel = finalScore >= 75 ? 'Compliant' : finalScore >= 50 ? 'Partially Compliant' : 'Non-Compliant';
  const criticalGapCount = completedAssessment?.gaps.filter((gap) => gap.impact === 'critical').length || 0;
  const highGapCount = completedAssessment?.gaps.filter((gap) => gap.impact === 'high').length || 0;
  const remediationCount = completedAssessment?.remediation.length || 0;
  const assessedStandardsCount = completedAssessment?.standards.length || selectedStandards.length || 0;
  const currentStep = steps[step];
  const modeLabel = isDemoMode ? 'Demo simulation' : 'Live orchestration';

  return (
    <div className="assessment-shell">
      <PageHero
        eyebrow="Scan pipeline"
        title="Run an AI-led multi-agent vulnerability scan"
        description="Capture asset context, attach OSINT seeds and infrastructure targets, choose scan modules, and launch the multi-agent pipeline that scores exposure and generates remediation output."
        actions={(
          <>
            <button className="btn btn-secondary" onClick={() => navigate('/knowledge-base')}>Review knowledge base</button>
            {step === 3 && !processing && !done ? (
              <button className="btn btn-primary" onClick={startAnalysis}><Play size={14} /> Start analysis</button>
            ) : null}
          </>
        )}
        aside={
          <div className="hero-stat-stack">
            <div className="hero-stat-label">Execution mode</div>
            <div className="hero-stat-value">{modeLabel}</div>
            <div className="hero-stat-copy">{selectedStandards.length || 0} standards selected · {files.length} evidence files queued · {steps.length} guided stages.</div>
          </div>
        }
      />

      <div className="metric-grid">
        <MetricCard label="Selected standards" value={selectedStandards.length} caption="Frameworks included in this run" tone="brand" />
        <MetricCard label="Evidence files" value={files.length} caption="Documents uploaded for clause mapping" />
        <MetricCard label="Execution state" value={done ? 'Complete' : processing ? 'Running' : 'Ready'} caption="Pipeline readiness for the current run" tone={done ? 'success' : processing ? 'brand' : 'default'} />
        <MetricCard label="Workspace mode" value={isDemoMode ? 'Demo' : 'Live'} caption="Assessment backend execution source" tone="warn" />
      </div>

      <StepProgress step={step} />

      <div className="assessment-grid">
        <div className="assessment-main">
          {step === 0 ? (
            <Panel label={currentStep.label} title="Organization context" description="This profile informs benchmark selection, legal context, and narrative quality in the report.">
              <div className="assessment-form-grid">
                <Field label="Legal entity name" required>
                  <div style={{ position: 'relative' }}>
                    <Building2 size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
                    <input
                      value={orgProfile.companyName}
                      onChange={(event) => setOrgProfile({ companyName: event.target.value })}
                      placeholder="Acme Corporation"
                      className="form-input"
                      style={{ paddingLeft: 30 }}
                    />
                  </div>
                </Field>

                <Field label="Industry sector" required>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={orgProfile.industrySector}
                      onChange={(event) => setOrgProfile({ industrySector: event.target.value })}
                      className="form-select"
                    >
                      <option value="">Select sector...</option>
                      {industries.map((industry) => <option key={industry} value={industry}>{industry}</option>)}
                    </select>
                    <ChevronDown size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)', pointerEvents: 'none' }} />
                  </div>
                </Field>

                <Field label="Employee count">
                  <div style={{ position: 'relative' }}>
                    <select
                      value={orgProfile.employeeCount}
                      onChange={(event) => setOrgProfile({ employeeCount: event.target.value })}
                      className="form-select"
                    >
                      <option value="">Select range...</option>
                      {employeeRanges.map((range) => <option key={range} value={range}>{range}</option>)}
                    </select>
                    <ChevronDown size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)', pointerEvents: 'none' }} />
                  </div>
                </Field>

                <Field label="Jurisdiction">
                  <div style={{ position: 'relative' }}>
                    <select
                      value={orgProfile.jurisdiction || ''}
                      onChange={(event) => setOrgProfile({ jurisdiction: event.target.value })}
                      className="form-select"
                    >
                      <option value="">Select jurisdiction...</option>
                      {jurisdictions.map((jurisdiction) => <option key={jurisdiction} value={jurisdiction}>{jurisdiction}</option>)}
                    </select>
                    <ChevronDown size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)', pointerEvents: 'none' }} />
                  </div>
                </Field>

                <div className="assessment-full-span">
                  <Field label="Current compliance maturity">
                    <div className="assessment-choice-grid">
                      {maturityOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          className={`assessment-choice-card ${orgProfile.currentMaturity === option.value ? 'is-selected' : ''}`.trim()}
                          onClick={() => setOrgProfile({ currentMaturity: option.value })}
                        >
                          <div className="assessment-choice-title">{option.label}</div>
                          <div className="assessment-choice-copy">{option.desc}</div>
                        </button>
                      ))}
                    </div>
                  </Field>
                </div>
              </div>
            </Panel>
          ) : null}

          {step === 1 ? (
            <Panel label={currentStep.label} title="Document ingestion" description="Evidence quality materially improves clause-level scoring, validation confidence, and remediation specificity.">
              <div className="page-stack">
                <div
                  className={`assessment-upload-zone ${dragOver ? 'is-dragover' : ''}`.trim()}
                  onDragOver={(event) => { event.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.multiple = true;
                    input.accept = '.pdf,.docx,.txt';
                    input.onchange = (event) => {
                      const target = event.target as HTMLInputElement;
                      const selectedFiles = target.files;
                      if (selectedFiles) {
                        setFiles((current) => [...current, ...Array.from(selectedFiles)]);
                      }
                    };
                    input.click();
                  }}
                >
                  <Upload size={28} style={{ color: dragOver ? 'var(--blue-800)' : 'var(--slate-400)', marginBottom: 12 }} />
                  <div className="assessment-standard-title">Drag files here or click to browse</div>
                  <div className="assessment-standard-copy">PDF, DOCX, and TXT are supported. Real assessments can run without documents, but evidence improves output quality.</div>
                </div>

                {files.length > 0 ? (
                  <div className="assessment-file-list">
                    {files.map((file, index) => (
                      <div key={`${file.name}-${index}`} className="assessment-file-row">
                        <div className="assessment-row-head">
                          <div className="assessment-row-meta">
                            <FileText size={16} style={{ color: 'var(--blue-700)', flexShrink: 0 }} />
                            <div>
                              <div className="assessment-standard-title" style={{ marginBottom: 2 }}>{file.name}</div>
                              <div className="assessment-subcopy">{(file.size / 1024).toFixed(1)} KB · {file.name.split('.').pop()?.toUpperCase()}</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span className="badge badge-compliant">Ready</span>
                            <button onClick={(event) => { event.stopPropagation(); removeFile(index); }} style={{ color: 'var(--slate-400)' }}>
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}

                <ActionCard
                  label="Evidence guidance"
                  title="Stronger source packs produce better clause mapping"
                  description="Prioritize policies, procedures, committee terms, registers, and control standards. Weak or sparse evidence increases narrative caveats and reduces scoring confidence."
                />
              </div>
            </Panel>
          ) : null}

          {step === 2 ? (
            <Panel label={currentStep.label} title="Standards selection" description="Each framework is assessed independently while the system also looks for cross-standard reuse opportunities.">
              <div className="assessment-file-list">
                {standardOptions.map((option) => {
                  const isSelected = selectedStandards.includes(option.code);

                  return (
                    <button
                      key={option.code}
                      type="button"
                      className={`assessment-standard-card ${isSelected ? 'is-selected' : ''}`.trim()}
                      onClick={() => toggleStandard(option.code)}
                      style={{ padding: 18, textAlign: 'left' }}
                    >
                      <div className="assessment-row-head">
                        <div>
                          <div className="assessment-standard-title">{option.name}</div>
                          <div className="assessment-standard-copy">{option.desc}</div>
                          <div className="assessment-subcopy" style={{ marginTop: 8 }}>{option.scope}</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                          <span className="badge badge-pending">{option.clauses} clauses</span>
                          {isSelected ? <span className="badge badge-compliant">Selected</span> : null}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedStandards.length === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'var(--risk-critical-bg)', border: '1px solid var(--risk-critical-border)', borderRadius: 'var(--radius-md)', fontSize: 12, color: 'var(--risk-critical)' }}>
                  <AlertCircle size={14} /> Select at least one ISO standard to proceed.
                </div>
              ) : null}
            </Panel>
          ) : null}

          {step === 3 ? (
            <>
              <Panel label={currentStep.label} title="Multi-agent analysis" description="The orchestration layer parses evidence, maps clauses, validates sufficiency, scores controls, detects gaps, and drafts remediation outputs.">
                <div className="workflow-stage-grid">
                  {agentStates.map((agent, index) => (
                    <WorkflowStage
                      key={agent.name}
                      index={index + 1}
                      title={agent.name}
                      description={agent.status === 'processing' ? agent.task : agent.status === 'complete' ? 'Completed for the current run.' : 'Waiting for execution.'}
                      state={agent.status === 'processing' ? 'active' : agent.status === 'complete' ? 'complete' : 'idle'}
                    />
                  ))}
                </div>

                {!processing && !done ? (
                  <div style={{ marginTop: 18 }}>
                    <button onClick={startAnalysis} className="btn btn-primary"><Play size={15} /> Start analysis</button>
                  </div>
                ) : null}
              </Panel>

              <Panel label="Execution log" title="Pipeline activity" description="Use the log to inspect execution order, warnings, and key scoring milestones.">
                {logs.length > 0 ? (
                  <div className="assessment-log">
                    {logs.map((log, index) => (
                      <div
                        key={`${log}-${index}`}
                        style={{
                          color:
                            log.includes('complete') || log.includes('Complete') ? '#86EFAC'
                              : log.includes('critical') || log.includes('Critical') || log.includes('Error') ? '#FCA5A5'
                                : '#94A3B8',
                        }}
                      >
                        {log}
                      </div>
                    ))}
                    {processing ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#93C5FD', marginTop: 6 }}>
                        <Loader2 size={10} className="animate-spin" /> Processing...
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <ActionCard
                    label="Execution trace"
                    title="No live events yet"
                    description="Start the pipeline to populate the execution log with agent activity, scoring milestones, and any failure messages returned by the assessment service."
                  />
                )}
              </Panel>
            </>
          ) : null}

          {step === 4 ? (
            <>
              <Panel label={currentStep.label} title="Assessment results" description="Review the readiness posture, confirm the summary, and commit the completed run to the workspace.">
                <div className="assessment-results-grid">
                  <div className="assessment-score-card">
                    <div className="assessment-score-value" style={{ color: scoreColor }}>{finalScore}%</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: scoreColor }}>{scoreLabel}</div>
                    <div className="assessment-subcopy">Overall compliance score</div>
                  </div>

                  <div className="summary-grid-responsive">
                    <SummaryStatCard label="Critical gaps" value={criticalGapCount} description="Items requiring immediate executive attention" tone="danger" />
                    <SummaryStatCard label="High gaps" value={highGapCount} description="Priority actions for the next remediation cycle" tone="warn" />
                    <SummaryStatCard label="Standards assessed" value={assessedStandardsCount} description="Frameworks evaluated in the completed run" tone="brand" />
                    <SummaryStatCard label="Remediation actions" value={remediationCount} description="Actions generated for follow-through" tone="success" />
                  </div>
                </div>

                {completedAssessment ? (
                  <div style={{ marginTop: 18 }}>
                    <ActionCard
                      label="Executive summary"
                      title="Board-ready narrative generated"
                      description={completedAssessment.executiveSummary}
                    />
                  </div>
                ) : null}
              </Panel>

              {completedAssessment ? (
                <Panel label="Immediate follow-through" title="Top remediation priorities" description="The first actions below are pulled from the generated remediation plan.">
                  <div className="action-grid">
                    {completedAssessment.remediation.slice(0, 4).map((action) => (
                      <ActionCard
                        key={action.id}
                        label={`${action.priority} priority · ${action.phase}`}
                        title={action.title}
                        description={action.description}
                        action={<span className="badge badge-pending">{action.responsibleFunction}</span>}
                      />
                    ))}
                  </div>
                </Panel>
              ) : null}
            </>
          ) : null}

          <div className="assessment-navigation">
            <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="btn btn-ghost">
              <ArrowLeft size={14} /> Back
            </button>

            <div className="assessment-navigation-meta">
              <span style={{ fontSize: 12, color: 'var(--slate-500)' }}>{currentStep.label} of {steps.length}</span>
              {step < 4 ? (
                <button
                  onClick={() => setStep((current) => Math.min(4, current + 1))}
                  disabled={!canProceed() || (step === 3 && !done)}
                  className="btn btn-primary"
                >
                  {step === 3 ? 'View results' : 'Continue'} <ArrowRight size={14} />
                </button>
              ) : (
                <>
                  <button onClick={() => navigate('/reports')} className="btn btn-secondary">View full report</button>
                  <button onClick={finishAssessment} className="btn btn-primary">Open dashboard <ArrowRight size={13} /></button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="assessment-aside">
          <Panel label="Run brief" title="Current assessment frame" description="These details follow the workflow and update as the run matures.">
            <div className="summary-grid-responsive">
              <SummaryStatCard label="Company" value={orgProfile.companyName || 'Pending'} description="Legal entity in scope" tone="brand" />
              <SummaryStatCard label="Industry" value={orgProfile.industrySector || 'Pending'} description="Benchmark context" />
              <SummaryStatCard label="Evidence" value={files.length} description="Queued documents" />
              <SummaryStatCard label="Maturity" value={orgProfile.currentMaturity || 'Unstated'} description="Starting operating model" />
            </div>
          </Panel>

          <Panel label="Selected standards" title="Framework pack" description="Use this view to confirm scope before the pipeline runs.">
            {selectedStandardDetails.length > 0 ? (
              <div className="insight-list">
                {selectedStandardDetails.map((standard) => (
                  <div key={standard.code} className="insight-row">
                    <div className="insight-kicker">{standard.name}</div>
                    <div>
                      <div className="insight-title">{standard.clauses} clauses in scope</div>
                      <div className="insight-copy">{standard.scope}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <InsightCard
                title="No standards selected yet"
                description="Choose at least one framework to activate the analysis stage and generate a cross-standard findings set."
              />
            )}
          </Panel>

          <Panel label="Execution notes" title="What the pipeline is doing" description="This remains visible even before execution so the operating model is clear.">
            <div className="action-grid">
              <ActionCard
                label="Context"
                title={isDemoMode ? 'Demo orchestration' : 'Live backend orchestration'}
                description="The workflow reuses uploaded evidence, organization profile data, and the selected standards pack to build an auditable assessment result."
              />
              <ActionCard
                label="Output"
                title="Readiness score, gaps, and remediation"
                description="Completed runs populate the dashboard, reports, and copilot context automatically after you save the assessment into the workspace."
              />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}