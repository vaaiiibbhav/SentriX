import { useNavigate } from 'react-router-dom';
import { Activity, ArrowRight } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { EmptyWorkspace, MetricCard, PageHero, Panel } from '../components/ui/EnterpriseLayout';
import { getAgentHealth } from '../utils/enterpriseData';

export default function AgentMonitoring() {
  const navigate = useNavigate();
  const { currentAssessment, agentStatuses, agentLog, isAssessing } = useAppStore();
  const health = getAgentHealth(agentStatuses, agentLog);

  const hasRuntimeData = agentLog.length > 0 || agentStatuses.some((agent) => agent.status !== 'idle') || isAssessing;

  if (!hasRuntimeData && !currentAssessment) {
    return (
      <EmptyWorkspace
        title="No live agent activity yet"
        description="Launch an assessment to populate runtime status, processing telemetry, and agent event logs."
        action={<button onClick={() => navigate('/assessment')} className="btn btn-primary">Launch assessment</button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Operational telemetry"
        title="Agent Monitoring"
        description="Runtime visibility into orchestration progress, execution outcomes, and the latest agent event stream."
        actions={<button onClick={() => navigate('/agents')} className="btn btn-secondary">View workflow design</button>}
        aside={
          <div className="hero-stat-stack">
            <div className="hero-stat-label">Runtime state</div>
            <div className="hero-stat-value">{isAssessing ? 'Active' : 'Idle'}</div>
            <div className="hero-stat-copy">Monitoring reflects the in-browser assessment session.</div>
          </div>
        }
      />

      <div className="metric-grid">
        <MetricCard label="Processing" value={health.processing} caption="Agents currently executing" tone="brand" />
        <MetricCard label="Completed" value={health.completed} caption="Agents that reached terminal success" tone="success" />
        <MetricCard label="Errors" value={health.errors} caption="Agents that returned execution failures" tone={health.errors > 0 ? 'danger' : 'default'} />
        <MetricCard label="Log entries" value={agentLog.length} caption="Events stored in the runtime feed" />
      </div>

      <div className="enterprise-two-column">
        <Panel label="Status board" title="Agent execution state" description="Progress and action summaries are taken from the Zustand runtime store.">
          <div className="insight-list">
            {agentStatuses.map((agent) => (
              <div key={agent.name} className="insight-row">
                <div className={`status-dot ${agent.status === 'complete' ? 'active' : agent.status === 'error' ? 'error' : agent.status === 'processing' ? 'warning' : 'idle'}`} />
                <div style={{ flex: 1 }}>
                  <div className="insight-title">{agent.name}</div>
                  <div className="insight-copy">{agent.currentAction || 'Awaiting execution signal.'}</div>
                  <div className="benchmark-bar" style={{ marginTop: 8 }}>
                    <div className="benchmark-bar-fill" style={{ width: `${agent.progress}%` }} />
                  </div>
                </div>
                <span className={`badge badge-${agent.status === 'complete' ? 'compliant' : agent.status === 'error' ? 'critical' : agent.status === 'processing' ? 'medium' : 'pending'}`}>{agent.status}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel label="Event stream" title="Latest runtime log" description="Recent events from the orchestration loop, newest first.">
          <div className="insight-list">
            {health.latestEntries.length > 0 ? health.latestEntries.map((entry) => (
              <div key={entry.id} className="insight-row">
                <div className="insight-kicker"><Activity size={14} /></div>
                <div>
                  <div className="insight-title">{entry.agentName}</div>
                  <div className="insight-copy">{entry.message}</div>
                </div>
                <span className={`badge badge-${entry.type === 'error' ? 'critical' : entry.type === 'success' ? 'compliant' : 'pending'}`}>{entry.type}</span>
              </div>
            )) : <div className="insight-copy">No log events recorded in this session.</div>}
          </div>
        </Panel>
      </div>

      <Panel label="Workflow link" title="Operational next step" description="Use the workflow page to interpret how each agent contributes to the final assessment outputs.">
        <button onClick={() => navigate('/agents')} className="btn btn-primary">Open agent workflow <ArrowRight size={14} /></button>
      </Panel>
    </div>
  );
}