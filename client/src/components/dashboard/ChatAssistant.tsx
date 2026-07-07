import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Building2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  FileSearch,
  Files,
  Gauge,
  Layers3,
  RefreshCcw,
  Scale,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  TriangleAlert,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { copilotApi } from '../../utils/apiClient';
import type { ChatMessage, ComplianceCopilotResponse, CopilotContextSnapshot } from '../../types';

interface CommandAction {
  label: string;
  prompt: string;
  icon: LucideIcon;
}

interface InsightModule {
  label: string;
  value: string;
  detail: string;
  tone?: 'default' | 'accent' | 'warning';
}

interface AnalysisPanel {
  id: string;
  title: string;
  icon: LucideIcon;
  content: string[];
}

interface WelcomeMessage {
  headline: string;
  summary: string;
  issues: string[];
}

function toTitleCase(value?: string) {
  if (!value) return 'Unavailable';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatTimestamp(timestamp: string) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

function buildCopilotContext(
  currentAssessment: ReturnType<typeof useAppStore.getState>['currentAssessment'],
  uploadedDocuments: ReturnType<typeof useAppStore.getState>['uploadedDocuments']
): CopilotContextSnapshot | undefined {
  if (!currentAssessment) {
    return undefined;
  }

  const weakestClauses = currentAssessment.standards
    .flatMap((standard) => standard.clauseScores.map((clause) => ({
      standard: standard.standardCode,
      clauseId: clause.clauseId,
      clauseTitle: clause.clauseTitle,
      score: clause.score,
      finding: clause.finding || clause.gap || clause.evidence,
    })))
    .sort((left, right) => left.score - right.score)
    .slice(0, 16);

  const weakestStandard = [...currentAssessment.standards].sort((left, right) => left.overallScore - right.overallScore)[0];
  const weakestClause = weakestClauses[0];
  const highRiskGapCount = currentAssessment.gaps.filter((gap) => gap.impact === 'critical' || gap.impact === 'high').length;
  const targetScore = 80;

  return {
    orgProfile: {
      company: currentAssessment.orgProfile.companyName,
      industry: currentAssessment.orgProfile.industrySector,
      employees: currentAssessment.orgProfile.employeeCount,
      scope: currentAssessment.orgProfile.assessmentScope,
    },
    uploadedDocuments,
    overallScore: currentAssessment.overallScore,
    maturityLevel: currentAssessment.overallMaturity,
    executiveSummary: currentAssessment.executiveSummary,
    evidenceSummary: currentAssessment.evidenceValidation?.summary,
    evidenceStats: {
      sufficientCount: currentAssessment.evidenceValidation.sufficientCount,
      partialCount: currentAssessment.evidenceValidation.partialCount,
      insufficientCount: currentAssessment.evidenceValidation.insufficientCount,
      missingCount: currentAssessment.evidenceValidation.missingCount,
      crossStandardOpportunities: currentAssessment.evidenceValidation.crossStandardOpportunities,
      overallEvidenceScore: currentAssessment.evidenceValidation.overallEvidenceScore,
    },
    standards: currentAssessment.standards.map((standard) => ({
      code: standard.standardCode,
      name: standard.standardName,
      overallScore: standard.overallScore,
      maturityLevel: standard.maturityLevel,
      summary: standard.summary,
    })),
    clauseScores: weakestClauses,
    gaps: currentAssessment.gaps.slice(0, 12).map((gap) => ({
      id: gap.id,
      standard: gap.standardCode,
      clauseRef: gap.clauseId,
      title: gap.title,
      severity: gap.impact,
      description: gap.description,
    })),
    remediationActions: currentAssessment.remediation.slice(0, 10).map((action) => ({
      id: action.id,
      title: action.title,
      priority: action.priority,
      phase: action.phase,
      description: action.description,
      standard: action.standards[0],
      responsible: action.responsibleFunction,
    })),
    orchestration: {
      provider: currentAssessment.orchestration?.provider,
      executionCount: currentAssessment.orchestration?.executions.length,
    },
    workspaceMetrics: {
      highRiskGapCount,
      remediationCount: currentAssessment.remediation.length,
      activeStandardCount: currentAssessment.standards.length,
      weakestStandard: weakestStandard?.standardCode,
      weakestClause: weakestClause ? `${weakestClause.standard} ${weakestClause.clauseId}` : undefined,
      targetScore,
      scoreGapToTarget: Math.max(0, targetScore - currentAssessment.overallScore),
    },
    commandHints: [
      'Explain compliance score drivers',
      'Summarize executive report',
      'Identify critical risk clauses',
      'Recommend remediation plan',
      'Compare ISO standards',
      'Generate audit-ready summary',
    ],
  };
}

function buildDynamicActionPrompts(
  currentAssessment: ReturnType<typeof useAppStore.getState>['currentAssessment']
) {
  if (!currentAssessment) {
    return [
      'What assets should I connect first for a useful attack surface scan?',
      'How does SentriX Copilot use scan context?',
      'What kinds of remediation guidance can you generate?',
      'Generate a breach-readiness briefing template for a first scan.',
    ];
  }

  const weakestStandard = [...currentAssessment.standards].sort((left, right) => left.overallScore - right.overallScore)[0];
  const highRiskGaps = currentAssessment.gaps.filter((gap) => gap.impact === 'critical' || gap.impact === 'high');
  const evidence = currentAssessment.evidenceValidation;

  const prompts = [
    weakestStandard
      ? `Why is ${weakestStandard.standardCode} my lowest scoring standard?`
      : 'Explain my lowest scoring standard.',
    currentAssessment.overallScore < 80
      ? `How can we increase our compliance score from ${currentAssessment.overallScore}% to 80%?`
      : 'Explain what is driving the current compliance score.',
    highRiskGaps.length >= 5
      ? 'Show the top 5 gaps impacting compliance score.'
      : 'Identify the most critical risk clauses right now.',
    evidence.insufficientCount + evidence.missingCount > 0
      ? 'Explain which clauses lack sufficient evidence.'
      : 'Summarize evidence quality across the active standards.',
    currentAssessment.remediation.length > 0
      ? 'Generate a 90-day remediation roadmap.'
      : 'Recommend remediation priorities for the next 30 days.',
    'Summarize the executive report for leadership.',
    'Compare ISO standards and show overlap opportunities.',
    'Generate an audit-ready summary for the current assessment.',
  ];

  return [...new Set(prompts)].slice(0, 6);
}

function buildCapabilityCommands(): CommandAction[] {
  return [
    {
      label: 'Score Drivers',
      prompt: 'Explain compliance score drivers.',
      icon: BarChart3,
    },
    {
      label: 'Executive Summary',
      prompt: 'Summarize the executive report for leadership.',
      icon: Sparkles,
    },
    {
      label: 'Critical Clauses',
      prompt: 'Identify critical risk clauses.',
      icon: Scale,
    },
    {
      label: 'Remediation Plan',
      prompt: 'Recommend a remediation plan.',
      icon: ClipboardList,
    },
    {
      label: 'Standards Compare',
      prompt: 'Compare ISO standards.',
      icon: Layers3,
    },
    {
      label: 'Audit Summary',
      prompt: 'Generate an audit-ready summary.',
      icon: ShieldCheck,
    },
  ];
}

function buildInsightModules(
  response: ComplianceCopilotResponse,
  currentAssessment: ReturnType<typeof useAppStore.getState>['currentAssessment']
): InsightModule[] {
  const highRiskCount = currentAssessment?.gaps.filter((gap) => gap.impact === 'critical' || gap.impact === 'high').length ?? 0;
  const weakestStandard = currentAssessment?.standards
    ? [...currentAssessment.standards].sort((left, right) => left.overallScore - right.overallScore)[0]
    : undefined;
  const targetGap = currentAssessment ? Math.max(0, 80 - currentAssessment.overallScore) : 0;
  const evidence = currentAssessment?.evidenceValidation;

  return [
    {
      label: 'Compliance score insight',
      value: currentAssessment ? `${currentAssessment.overallScore}% overall` : 'Awaiting assessment',
      detail: weakestStandard
        ? `${weakestStandard.standardCode} is the lowest scoring standard at ${weakestStandard.overallScore}%.`
        : 'Run an assessment to reveal score drivers.',
      tone: targetGap > 0 ? 'accent' : 'default',
    },
    {
      label: 'Risk severity overview',
      value: `${highRiskCount} high-risk gaps`,
      detail: response.recommendedActions[0]?.title || 'No remediation action has been generated yet.',
      tone: highRiskCount > 0 ? 'warning' : 'default',
    },
    {
      label: 'Standards comparison',
      value: currentAssessment ? `${currentAssessment.standards.length} standards in scope` : 'No active standards',
      detail: weakestStandard
        ? `Priority focus should start with ${weakestStandard.standardCode}.`
        : 'Comparison appears once an assessment is loaded.',
    },
    {
      label: 'Evidence posture',
      value: evidence ? `${evidence.overallEvidenceScore}% evidence quality` : 'Evidence pending',
      detail: evidence
        ? `${evidence.missingCount} missing and ${evidence.insufficientCount} insufficient evidence items detected.`
        : 'Upload evidence to reveal documentation quality issues.',
      tone: evidence && evidence.missingCount + evidence.insufficientCount > 0 ? 'warning' : 'default',
    },
  ];
}

function buildAnalysisPanels(
  response: ComplianceCopilotResponse,
  currentAssessment: ReturnType<typeof useAppStore.getState>['currentAssessment']
): AnalysisPanel[] {
  const weakestStandard = currentAssessment?.standards
    ? [...currentAssessment.standards].sort((left, right) => left.overallScore - right.overallScore)[0]
    : undefined;
  const weakestClause = currentAssessment?.standards
    .flatMap((standard) => standard.clauseScores.map((clause) => ({ standard: standard.standardCode, clause })))
    .sort((left, right) => left.clause.score - right.clause.score)[0];
  const evidence = currentAssessment?.evidenceValidation;
  const highRiskGaps = currentAssessment?.gaps.filter((gap) => gap.impact === 'critical' || gap.impact === 'high') ?? [];
  const remediationPhases = currentAssessment?.remediation.reduce<Record<number, number>>((acc, action) => {
    acc[action.phase] = (acc[action.phase] || 0) + 1;
    return acc;
  }, {}) ?? {};

  return [
    {
      id: 'drivers',
      title: 'Score drivers',
      icon: BarChart3,
      content: [
        weakestStandard
          ? `${weakestStandard.standardCode} is currently the weakest standard at ${weakestStandard.overallScore}%, which is dragging down overall readiness.`
          : 'No lowest standard is available yet.',
        weakestClause
          ? `${weakestClause.standard} ${weakestClause.clause.clauseId} is the weakest clause observed and should be reviewed first.`
          : 'No weakest clause is available yet.',
        response.reportSummary[0] || 'Additional score-driver analysis is available once the assistant generates a response.',
      ],
    },
    {
      id: 'risk',
      title: 'Risk severity overview',
      icon: TriangleAlert,
      content: [
        `${highRiskGaps.length} high-risk gaps are open across the workspace.`,
        highRiskGaps[0]
          ? `The highest priority gap currently visible is ${highRiskGaps[0].standardCode} ${highRiskGaps[0].clauseId}: ${highRiskGaps[0].title}.`
          : 'No high-risk gaps are currently open.',
        response.recommendedActions[0]?.rationale || 'Ask for a remediation plan to connect these risks to actions.',
      ],
    },
    {
      id: 'evidence',
      title: 'Evidence posture',
      icon: FileSearch,
      content: [
        evidence
          ? `${evidence.missingCount} evidence items are missing and ${evidence.insufficientCount} are insufficient.`
          : 'No evidence summary is available.',
        evidence
          ? `${evidence.crossStandardOpportunities} cross-standard evidence reuse opportunities were found.`
          : 'Cross-standard reuse becomes available after assessment.',
        currentAssessment?.evidenceValidation.summary || 'Ask which clauses lack sufficient evidence for a clause-level trace.',
      ],
    },
    {
      id: 'roadmap',
      title: 'Remediation path',
      icon: Target,
      content: [
        currentAssessment?.remediation.length
          ? `${currentAssessment.remediation.length} remediation tasks are active across phases ${Object.keys(remediationPhases).join(', ') || '1'} .`
          : 'No remediation tasks are loaded yet.',
        response.recommendedActions[0]
          ? `Lead recommendation: ${response.recommendedActions[0].title}.`
          : 'Ask for a 90-day remediation roadmap to generate an execution path.',
        currentAssessment && currentAssessment.overallScore < 80
          ? `Reaching 80% requires closing approximately ${80 - currentAssessment.overallScore} score points through targeted remediation and stronger evidence.`
          : 'The current score is at or above the 80% target threshold.',
      ],
    },
  ];
}

function renderRichText(text: string) {
  const blocks = text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks.map((block, index) => {
    const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
    const isBulletBlock = lines.every((line) => /^[-*•]/.test(line));

    if (isBulletBlock) {
      return (
        <ul key={`${block}-${index}`} className="copilot-bullet-list">
          {lines.map((line, lineIndex) => (
            <li key={`${line}-${lineIndex}`}>{line.replace(/^[-*•]\s*/, '')}</li>
          ))}
        </ul>
      );
    }

    return <p key={`${block}-${index}`} className="copilot-body-copy">{block}</p>;
  });
}

function ResponseSection({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="copilot-response-section-v2">
      <div className="copilot-response-section-header">
        <span className="copilot-response-section-icon" aria-hidden="true">
          <Icon size={14} />
        </span>
        <div className="copilot-response-section-title">{title}</div>
      </div>
      <div className="copilot-response-section-body">{children}</div>
    </section>
  );
}

function AssistantInsights({ modules }: { modules: InsightModule[] }) {
  return (
    <div className="copilot-inline-insight-grid">
      {modules.map((module) => (
        <div key={module.label} className={['copilot-inline-insight-card', module.tone ? `tone-${module.tone}` : ''].join(' ')}>
          <div className="copilot-inline-insight-label">{module.label}</div>
          <div className="copilot-inline-insight-value">{module.value}</div>
          <div className="copilot-inline-insight-detail">{module.detail}</div>
        </div>
      ))}
    </div>
  );
}

function AnalysisDisclosure({ panel }: { panel: AnalysisPanel }) {
  const [open, setOpen] = useState(false);
  const Icon = panel.icon;

  return (
    <div className={['copilot-analysis-panel', open ? 'open' : ''].join(' ')}>
      <button
        type="button"
        className="copilot-analysis-toggle"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <span className="copilot-analysis-title-row">
          <span className="copilot-analysis-icon" aria-hidden="true">
            <Icon size={14} />
          </span>
          <span className="copilot-analysis-title">{panel.title}</span>
        </span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {open && (
        <div className="copilot-analysis-content">
          {panel.content.map((line, index) => (
            <p key={`${panel.id}-${index}`} className="copilot-body-copy compact">{line}</p>
          ))}
        </div>
      )}
    </div>
  );
}

function UserMessageBubble({ message }: { message: ChatMessage }) {
  return (
    <div className="copilot-message-row user">
      <div className="copilot-message-shell user">
        <div className="copilot-message-bubble user">
          <div className="copilot-message-meta">
            <span className="copilot-message-author">You</span>
            <span className="copilot-message-time">{formatTimestamp(message.timestamp)}</span>
          </div>
          <div className="copilot-plain-response">{renderRichText(message.content)}</div>
        </div>
        <div className="copilot-avatar user" aria-hidden="true">
          <span>U</span>
        </div>
      </div>
    </div>
  );
}

function AssistantMessageBubble({
  message,
  currentAssessment,
  onSend,
}: {
  message: ChatMessage;
  currentAssessment: ReturnType<typeof useAppStore.getState>['currentAssessment'];
  onSend: (message: string) => Promise<void>;
}) {
  const structuredResponse = message.role === 'assistant' ? message.structuredResponse : undefined;
  const keyFindings = structuredResponse
    ? [
        ...structuredResponse.reportSummary.slice(0, 3),
        ...structuredResponse.evidence.slice(0, 2).map((item) => `${item.label}: ${item.detail}`),
      ].slice(0, 4)
    : [];
  const nextSteps = structuredResponse?.followUpQuestions?.length
    ? structuredResponse.followUpQuestions.slice(0, 3)
    : structuredResponse?.recommendedActions.slice(0, 2).map((action) => `Advance ${action.title.toLowerCase()} as a near-term remediation step.`) ?? [];
  const insightModules = structuredResponse ? buildInsightModules(structuredResponse, currentAssessment) : [];
  const analysisPanels = structuredResponse ? buildAnalysisPanels(structuredResponse, currentAssessment) : [];

  return (
    <div className="copilot-message-row assistant">
      <div className="copilot-message-shell assistant">
        <div className="copilot-avatar assistant" aria-hidden="true">
          <Sparkles size={15} />
        </div>

        <div className="copilot-message-bubble assistant">
          <div className="copilot-message-meta">
            <span className="copilot-message-author">SentriX Copilot</span>
            <span className="copilot-message-time">{formatTimestamp(message.timestamp)}</span>
          </div>

          {structuredResponse ? (
            <div className="copilot-structured-stack">
              <div className="copilot-message-headline">{structuredResponse.headline}</div>

              <ResponseSection icon={Sparkles} title="Summary">
                {renderRichText(structuredResponse.directAnswer)}
                {renderRichText(structuredResponse.explanation)}
              </ResponseSection>

              {keyFindings.length > 0 && (
                <ResponseSection icon={TriangleAlert} title="Key Findings">
                  <ul className="copilot-bullet-list">
                    {keyFindings.map((issue, index) => (
                      <li key={`${issue}-${index}`}>{issue}</li>
                    ))}
                  </ul>
                </ResponseSection>
              )}

              {structuredResponse.isoGuidance.length > 0 && (
                <ResponseSection icon={Scale} title="Relevant ISO Clauses">
                  <div className="copilot-clause-list">
                    {structuredResponse.isoGuidance.map((guidance, index) => (
                      <div key={`${guidance.standard}-${guidance.clause || index}`} className="copilot-clause-card">
                        <div className="copilot-clause-title">{guidance.standard}{guidance.clause ? ` clause ${guidance.clause}` : ''}</div>
                        <div className="copilot-clause-requirement">{guidance.requirement}</div>
                        <div className="copilot-clause-guidance">{guidance.guidance}</div>
                      </div>
                    ))}
                  </div>
                </ResponseSection>
              )}

              {structuredResponse.recommendedActions.length > 0 && (
                <ResponseSection icon={ClipboardList} title="Recommended Remediation">
                  <div className="copilot-action-list">
                    {structuredResponse.recommendedActions.map((action, index) => (
                      <div key={`${action.title}-${index}`} className="copilot-action-card">
                        <div className="copilot-action-topline">
                          <div className="copilot-action-title">{action.title}</div>
                          <span className={`badge badge-${action.priority === 'critical' ? 'critical' : action.priority === 'high' ? 'high' : action.priority === 'medium' ? 'medium' : 'low'}`}>
                            {action.priority}
                          </span>
                        </div>
                        <div className="copilot-action-meta">{[action.owner, action.standard, action.clause].filter(Boolean).join(' · ') || 'Owner and clause context available on request'}</div>
                        <div className="copilot-body-copy compact">{action.rationale}</div>
                      </div>
                    ))}
                  </div>
                </ResponseSection>
              )}

              {nextSteps.length > 0 && (
                <ResponseSection icon={Target} title="Next Steps">
                  <div className="copilot-next-step-list">
                    {nextSteps.map((step, index) => (
                      <button
                        key={`${step}-${index}`}
                        type="button"
                        className="copilot-response-followup-button"
                        onClick={() => void onSend(step)}
                      >
                        <span>{step}</span>
                        <ArrowRight size={14} />
                      </button>
                    ))}
                  </div>
                </ResponseSection>
              )}

              <AssistantInsights modules={insightModules} />

              <div className="copilot-analysis-stack">
                {analysisPanels.map((panel) => (
                  <AnalysisDisclosure key={panel.id} panel={panel} />
                ))}
              </div>

              <div className="copilot-audit-footnote">
                <FileSearch size={13} />
                <span>
                  {structuredResponse.auditTrail.responseMode} response · {structuredResponse.auditTrail.pipelineProvider} pipeline · {structuredResponse.auditTrail.contextSources.join(', ') || 'workspace context'}
                </span>
              </div>
            </div>
          ) : (
            <div className="copilot-plain-response">{renderRichText(message.content)}</div>
          )}
        </div>
      </div>
    </div>
  );
}

function CopilotConversation({
  chatMessages,
  isTyping,
  welcomeMessage,
  currentAssessment,
  onSend,
  endRef,
}: {
  chatMessages: ChatMessage[];
  isTyping: boolean;
  welcomeMessage: WelcomeMessage;
  currentAssessment: ReturnType<typeof useAppStore.getState>['currentAssessment'];
  onSend: (message: string) => Promise<void>;
  endRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="copilot-conversation-region">
      <section className="copilot-conversation-viewport" role="log" aria-live="polite" aria-label="Copilot conversation">
        {chatMessages.length === 0 && (
          <div className="copilot-message-row assistant">
            <div className="copilot-message-shell assistant">
              <div className="copilot-avatar assistant" aria-hidden="true">
                <Sparkles size={15} />
              </div>
              <div className="copilot-message-bubble assistant">
                <div className="copilot-message-meta">
                  <span className="copilot-message-author">SentriX Copilot</span>
                  <span className="copilot-message-time">Ready</span>
                </div>
                <div className="copilot-structured-stack">
                  <div className="copilot-message-headline">{welcomeMessage.headline}</div>
                  <ResponseSection icon={Sparkles} title="Summary">
                    <p className="copilot-body-copy">{welcomeMessage.summary}</p>
                  </ResponseSection>
                  <ResponseSection icon={TriangleAlert} title="Key Issues">
                    <ul className="copilot-bullet-list">
                      {welcomeMessage.issues.map((issue) => (
                        <li key={issue}>{issue}</li>
                      ))}
                    </ul>
                  </ResponseSection>
                </div>
              </div>
            </div>
          </div>
        )}

        {chatMessages.map((message) => (
          message.role === 'user' ? (
            <UserMessageBubble key={message.id} message={message} />
          ) : (
            <AssistantMessageBubble
              key={message.id}
              message={message}
              currentAssessment={currentAssessment}
              onSend={onSend}
            />
          )
        ))}

        {isTyping && (
          <div className="copilot-message-row assistant">
            <div className="copilot-message-shell assistant">
              <div className="copilot-avatar assistant" aria-hidden="true">
                <Sparkles size={15} />
              </div>
              <div className="copilot-message-bubble assistant typing">
                <div className="copilot-typing-indicator">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </section>
    </div>
  );
}

export default function ChatAssistant() {
  const {
    isChatOpen,
    toggleChat,
    clearChat,
    chatMessages,
    addChatMessage,
    currentAssessment,
    activeAssessmentSessionId,
    uploadedDocuments,
    isDemoMode,
  } = useAppStore();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: chatMessages.length > 0 ? 'smooth' : 'auto', block: 'end' });
  }, [chatMessages, isTyping, isChatOpen]);

  const contextSummaryCards = useMemo(() => {
    const documentsAnalyzed = uploadedDocuments.length || currentAssessment?.uploadedDocuments?.length || 0;
    const activeStandards = currentAssessment?.standards.length || 0;

    return [
      {
        label: 'Organization',
        value: currentAssessment?.orgProfile.companyName || 'No active organization',
        icon: Building2,
      },
      {
        label: 'Documents analyzed',
        value: String(documentsAnalyzed),
        icon: Files,
      },
      {
        label: 'Open gaps',
        value: String(currentAssessment?.gaps.length || 0),
        icon: TriangleAlert,
      },
      {
        label: 'Active standards',
        value: activeStandards ? String(activeStandards) : '0',
        icon: Layers3,
      },
      {
        label: 'Assessment mode',
        value: currentAssessment ? toTitleCase(currentAssessment.orgProfile.assessmentScope) : isDemoMode ? 'Demo' : 'Awaiting run',
        icon: Gauge,
      },
    ];
  }, [currentAssessment, uploadedDocuments, isDemoMode]);

  const suggestionPrompts = useMemo(() => buildDynamicActionPrompts(currentAssessment), [currentAssessment]);
  const capabilityCommands = useMemo(() => buildCapabilityCommands(), []);
  const quickAskItems = useMemo(
    () => [
      ...capabilityCommands.map((command) => ({
        id: `command-${command.label}`,
        label: command.label,
        prompt: command.prompt,
        icon: command.icon,
        type: 'capability' as const,
      })),
      ...suggestionPrompts.map((prompt, index) => ({
        id: `prompt-${index}`,
        label: prompt,
        prompt,
        icon: Sparkles,
        type: 'prompt' as const,
      })),
    ],
    [capabilityCommands, suggestionPrompts]
  );

  const welcomeMessage = useMemo(() => {
    if (!currentAssessment) {
      return {
        headline: 'Ready when your assessment is ready',
        summary: 'Ask about expected evidence, likely risk themes, or how the assistant will reason over your assessment once a run is available.',
        issues: [
          'No active assessment is loaded in the workspace.',
          'Upload evidence and complete an assessment to unlock clause-grounded guidance.',
        ],
      };
    }

    const weakestStandard = [...currentAssessment.standards].sort((left, right) => left.overallScore - right.overallScore)[0];
    const highRiskGaps = currentAssessment.gaps.filter((gap) => gap.impact === 'critical' || gap.impact === 'high').length;

    return {
      headline: 'Assessment context loaded',
      summary: `${currentAssessment.orgProfile.companyName} is currently at ${currentAssessment.overallScore}% overall readiness across ${currentAssessment.standards.length} active standards.`,
      issues: [
        weakestStandard ? `${weakestStandard.standardCode} is the weakest standard currently at ${weakestStandard.overallScore}%.` : 'No standard score is available yet.',
        `${highRiskGaps} high-risk gaps are currently open in the workspace.`,
      ],
    };
  }, [currentAssessment]);

  const handleClose = () => {
    if (isChatOpen) {
      toggleChat();
    }
  };

  const handleSend = async (message?: string) => {
    const text = (message || input).trim();
    if (!text || isTyping) {
      return;
    }

    setInput('');

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    addChatMessage(userMessage);
    setIsTyping(true);

    try {
      const conversationHistory = [...chatMessages, userMessage]
        .slice(-6)
        .map((messageItem) => ({ role: messageItem.role, content: messageItem.content }));

      const structured = await copilotApi.askQuestion({
        message: text,
        assessmentId: activeAssessmentSessionId || currentAssessment?.sessionId || currentAssessment?.id || null,
        conversationHistory,
        context: buildCopilotContext(currentAssessment, uploadedDocuments),
      });

      const reply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: structured.directAnswer,
        timestamp: new Date().toISOString(),
        structuredResponse: structured,
      };
      addChatMessage(reply);
    } catch (error) {
      const reply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: error instanceof Error ? error.message : 'SentriX Copilot could not complete this request.',
        timestamp: new Date().toISOString(),
      };
      addChatMessage(reply);
    } finally {
      setIsTyping(false);
    }
  };

  const handleComposerKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  };

  return (
    <AnimatePresence>
      {isChatOpen ? (
        <>
          <motion.button
            type="button"
            className="copilot-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            aria-label="Close SentriX Copilot"
          />

          <motion.aside
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="copilot-panel"
            role="complementary"
            aria-label="SentriX Copilot"
          >
            <header className="copilot-panel-header">
              <div className="copilot-panel-title-row">
                <div className="copilot-panel-mark" aria-hidden="true">
                  <Sparkles size={18} />
                </div>
                <div className="copilot-panel-title-group">
                  <div className="copilot-panel-title">SentriX Copilot</div>
                  <div className="copilot-panel-subtitle">AI guidance grounded in your current threat intelligence scan</div>
                </div>
              </div>

              <div className="copilot-panel-actions">
                {chatMessages.length > 0 && (
                  <button type="button" className="copilot-utility-button" onClick={clearChat}>
                    <RefreshCcw size={14} />
                    <span>New thread</span>
                  </button>
                )}
                <button type="button" className="copilot-close-button" onClick={handleClose} aria-label="Close SentriX Copilot">
                  <X size={18} />
                </button>
              </div>
            </header>

            <section className="copilot-context-summary" aria-label="Current workspace context">
              <div className="copilot-context-grid-v2">
                {contextSummaryCards.map((card) => (
                  <div key={card.label} className="copilot-context-summary-card">
                    <span className="copilot-context-summary-icon" aria-hidden="true">
                      <card.icon size={14} />
                    </span>
                    <div className="copilot-context-summary-copy">
                      <div className="copilot-context-summary-label">{card.label}</div>
                      <div className="copilot-context-summary-value">{card.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <CopilotConversation
              chatMessages={chatMessages}
              isTyping={isTyping}
              welcomeMessage={welcomeMessage}
              currentAssessment={currentAssessment}
              onSend={handleSend}
              endRef={endRef}
            />

            <section className="copilot-smart-actions compact" aria-label="Suggested prompts">
              <div className="copilot-smart-actions-header compact">
                <div>
                  <div className="copilot-smart-actions-title">Quick asks</div>
                  <div className="copilot-smart-actions-copy">Shortcuts based on the current assessment context.</div>
                </div>
              </div>
              <div className="copilot-quick-ask-rail" aria-label="Quick ask carousel">
                {quickAskItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={['copilot-quick-ask-chip', item.type].join(' ')}
                      onClick={() => void handleSend(item.prompt)}
                    >
                      <span className="copilot-quick-ask-icon" aria-hidden="true">
                        <Icon size={13} />
                      </span>
                      <span className="copilot-quick-ask-label">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            <form
              className="copilot-composer"
              onSubmit={(event) => {
                event.preventDefault();
                void handleSend();
              }}
            >
              <div className="copilot-composer-shell">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleComposerKeyDown}
                  placeholder="Ask about your compliance posture, risk exposure, or remediation priorities."
                  className="copilot-composer-input"
                  rows={1}
                  aria-label="Ask SentriX Copilot a question"
                />
                <button type="submit" disabled={!input.trim() || isTyping} className="copilot-composer-send" aria-label="Send message">
                  <Send size={16} />
                </button>
              </div>
              <div className="copilot-composer-meta">
                <span>Enter to send · Shift + Enter for a new line</span>
                <span>{isTyping ? 'Generating audit-friendly guidance...' : 'Responses stay grounded in the active assessment context'}</span>
              </div>
            </form>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}