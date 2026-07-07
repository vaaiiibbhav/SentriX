import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Bot, FileText, GitBranch, ScrollText, Search, ShieldCheck, Wrench } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { EmptyWorkspace, MetricCard, PageHero, Panel } from '../components/ui/EnterpriseLayout';

const stages = [
  { key: 'document', title: 'Document parsing', description: 'Parses uploaded source material into structured governance and policy evidence.', icon: Search, agents: ['Document Parsing Agent'] },
  { key: 'mapping', title: 'Clause mapping', description: 'Maps extracted evidence to relevant ISO clauses before scoring.', icon: Bot, agents: ['Clause Mapping Agent'] },
  { key: 'evidence', title: 'Evidence validation', description: 'Tests evidence sufficiency and cross-standard reuse.', icon: ShieldCheck, agents: ['Evidence Validation Agent'] },
  { key: 'scoring', title: 'Compliance scoring', description: 'Calculates clause readiness scores and confidence levels.', icon: Bot, agents: ['Compliance Scoring Agent'] },
  { key: 'gap', title: 'Gap detection', description: 'Consolidates scored findings into missing controls and weak implementation gaps.', icon: GitBranch, agents: ['Gap Detection Agent'] },
  { key: 'remediation', title: 'Remediation planning', description: 'Builds a phased action plan with owners and success metrics.', icon: Wrench, agents: ['Remediation Planning Agent'] },
  { key: 'policy', title: 'Policy generation', description: 'Generates policy outputs to close the identified gaps.', icon: ScrollText, agents: ['Policy Generation Agent'] },
];

export default function AgentWorkflow() {
  const navigate = useNavigate();
  const { currentAssessment, agentStatuses, agentLog, isAssessing } = useAppStore();

  const stageStates = useMemo(() => {
    return stages.map((stage) => {
      const members = agentStatuses.filter((agent) => stage.agents.includes(agent.name));
      const hasError = members.some((agent) => agent.status === 'error');
      const isActive = members.some((agent) => agent.status === 'processing');
      const isComplete = members.length > 0 && members.every((agent) => agent.status === 'complete');
      const avgProgress = members.length > 0 ? Math.round(members.reduce((sum, agent) => sum + agent.progress, 0) / members.length) : 0;

      return {
        ...stage,
        state: hasError ? 'error' : isActive ? 'active' : isComplete ? 'complete' : 'idle',
        avgProgress,
      };
    });
  }, [agentStatuses]);

  if (!currentAssessment && agentLog.length === 0 && !isAssessing) {
    return (
      <EmptyWorkspace
        title="Workflow intelligence appears after execution begins"
        description="Run an assessment to populate stage progress, outputs, and runtime logs for the orchestration pipeline."
        action={<button onClick={() => navigate('/assessment')} className="btn btn-primary">Start assessment</button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Agent orchestration"
        title="Workflow and execution output"
        description="The multi-agent pipeline converts uploaded evidence into standards findings, remediation actions, and policy outputs."
        actions={<button onClick={() => navigate('/agent-monitoring')} className="btn btn-secondary">Open monitoring</button>}
        aside={
          <div className="hero-stat-stack">
            <div className="hero-stat-label">Runtime mode</div>
            <div className="hero-stat-value">{isAssessing ? 'Running' : 'Complete'}</div>
            <div className="hero-stat-copy">The workflow view summarizes orchestration stages rather than raw logs.</div>
          </div>
        }
      />

      <div className="metric-grid">
        <MetricCard label="Stages" value={stages.length} caption="Pipeline checkpoints in the orchestration design" tone="brand" />
        <MetricCard label="Agents" value={agentStatuses.length} caption="Specialized services participating in the workflow" />
        <MetricCard label="Gap outputs" value={currentAssessment?.gaps.length || 0} caption="Findings produced by the assessment workflow" tone="warn" />
        <MetricCard label="Policies" value={currentAssessment?.policyDocuments?.length || 0} caption="Generated policy outputs from the workflow" tone="success" />
      </div>

      <Panel label="Stage map" title="End-to-end orchestration" description="Each stage rolls up the runtime state of the agents assigned to that segment of the workflow.">
        <div className="workflow-stage-grid">
          {stageStates.map((stage) => (
            <div key={stage.key} className={`workflow-stage-card workflow-stage-${stage.state}`}>
              <div className="workflow-stage-head">
                <div className="workflow-stage-icon"><stage.icon size={18} /></div>
                <span className={`badge badge-${stage.state === 'error' ? 'critical' : stage.state === 'active' ? 'medium' : stage.state === 'complete' ? 'compliant' : 'pending'}`}>{stage.state}</span>
              </div>
              <div className="workflow-stage-title">{stage.title}</div>
              <div className="workflow-stage-copy">{stage.description}</div>
              <div className="benchmark-bar" style={{ marginTop: 12 }}>
                <div className="benchmark-bar-fill" style={{ width: `${stage.avgProgress}%` }} />
              </div>
              <div className="insight-tags" style={{ marginTop: 12 }}>
                {stage.agents.map((agent) => (
                  <span key={agent} className="badge badge-pending">{agent}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="enterprise-two-column">
        <Panel label="Runtime output" title="What the workflow produced" description="Current outputs from the latest assessment execution.">
          <div className="insight-list">
            <div className="insight-row">
              <div className="insight-kicker">Clauses</div>
              <div>
                <div className="insight-title">{currentAssessment?.standards.reduce((sum, standard) => sum + standard.clauseScores.length, 0) || 0} clause assessments</div>
                <div className="insight-copy">Clause-level scores and findings generated by the standard specialist agents.</div>
              </div>
            </div>
            <div className="insight-row">
              <div className="insight-kicker">Gaps</div>
              <div>
                <div className="insight-title">{currentAssessment?.gaps.length || 0} prioritized gaps</div>
                <div className="insight-copy">Cross-standard deficiency set produced after consolidation.</div>
              </div>
            </div>
            <div className="insight-row">
              <div className="insight-kicker">Evidence</div>
              <div>
                <div className="insight-title">{currentAssessment?.evidenceValidation?.evidenceItems.length || 0} evidence checks</div>
                <div className="insight-copy">Evidence sufficiency and reuse validation completed by the evidence agent.</div>
              </div>
            </div>
            <div className="insight-row">
              <div className="insight-kicker">Policies</div>
              <div>
                <div className="insight-title">{currentAssessment?.policyDocuments?.length || 0} generated policy packs</div>
                <div className="insight-copy">Output documents ready for report packaging and adoption review.</div>
              </div>
            </div>
          </div>
        </Panel>

        <Panel label="Latest activity" title="Recent execution log" description="Short operational summary from the most recent agent events.">
          <div className="insight-list">
            {[...agentLog].slice(-8).reverse().map((entry) => (
              <div key={entry.id} className="insight-row">
                <div className="insight-kicker">{entry.agentName}</div>
                <div>
                  <div className="insight-title">{entry.message}</div>
                  <div className="insight-copy">{new Date(entry.timestamp).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel label="Operational handoff" title="Recommended next steps" description="Move from orchestration output to action planning and evidence-backed reporting.">
        <div className="insight-list">
          <div className="insight-row">
            <div className="insight-kicker"><FileText size={14} /></div>
            <div>
              <div className="insight-title">Generate executive report</div>
              <div className="insight-copy">Use the report pack to package findings, evidence, and remediation into a board-ready output.</div>
            </div>
            <button onClick={() => navigate('/reports')} className="btn btn-ghost">Open reports <ArrowRight size={14} /></button>
          </div>
          <div className="insight-row">
            <div className="insight-kicker"><Wrench size={14} /></div>
            <div>
              <div className="insight-title">Operationalize remediation</div>
              <div className="insight-copy">Move prioritized actions into the tracker to align delivery owners and time horizons.</div>
            </div>
            <button onClick={() => navigate('/remediation-tracker')} className="btn btn-ghost">Open tracker <ArrowRight size={14} /></button>
          </div>
        </div>
      </Panel>
    </div>
  );
}
