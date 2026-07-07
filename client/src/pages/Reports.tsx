import { Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { formatDate } from '../utils/helpers';
import { generateReport } from '../utils/generateReport';
import ComplianceReadinessTimeline from '../components/analytics/ComplianceReadinessTimeline';
import { EmptyWorkspace, MetricCard, PageHero, Panel } from '../components/ui/EnterpriseLayout';
import { ClauseStatusTag, DataTable, RiskIndicator, ScoreBadge } from '../components/ui/EnterpriseComponents';
import RemediationTimeline from '../components/reports/RemediationTimeline';
import EvidenceValidationPanel from '../components/reports/EvidenceValidationPanel';
import PolicyGeneratorPanel from '../components/reports/PolicyGeneratorPanel';
import { getStandardLabel, getStandardStatus, sortGapsByPriority } from '../utils/enterpriseData';

export default function Reports() {
  const navigate = useNavigate();
  const { currentAssessment, loadDemoData } = useAppStore();

  if (!currentAssessment) {
    return (
      <EmptyWorkspace
        title="No report pack available"
        description="Complete an assessment to generate an executive compliance pack with findings, evidence, and remediation priorities."
        action={
          <>
            <button onClick={() => navigate('/assessment')} className="btn btn-primary">Start assessment</button>
            <button onClick={loadDemoData} className="btn btn-secondary">Load demo dataset</button>
          </>
        }
      />
    );
  }

  const criticalGaps = sortGapsByPriority(currentAssessment.gaps).filter((gap) => gap.impact === 'critical');

  return (
    <div className="page-stack">
      <PageHero
        eyebrow="Executive reporting"
        title={`${currentAssessment.orgProfile.companyName} compliance report pack`}
        description={`Assessment date ${formatDate(currentAssessment.timestamp)}. This reporting pack is structured for board, audit, and compliance stakeholders and translates technical outputs into readable exposure and remediation narratives.`}
        actions={<button onClick={() => generateReport(currentAssessment)} className="btn btn-primary"><Download size={14} /> Download PDF</button>}
        aside={
          <div className="hero-stat-stack">
            <div className="hero-stat-label">Overall maturity</div>
            <div className="hero-stat-value">{currentAssessment.overallMaturity}</div>
            <div className="hero-stat-copy">{currentAssessment.overallMaturityLabel}</div>
          </div>
        }
      />

      <div className="metric-grid">
        <MetricCard label="Overall score" value={`${currentAssessment.overallScore}%`} caption="Cross-standard compliance position" tone="brand" />
        <MetricCard label="Critical gaps" value={criticalGaps.length} caption="Items requiring immediate action" tone="danger" />
        <MetricCard label="Evidence items" value={currentAssessment.evidenceValidation?.evidenceItems.length || 0} caption="Validated evidence references in the report" tone="success" />
        <MetricCard label="Policy outputs" value={currentAssessment.policyDocuments?.length || 0} caption="Generated policy documents linked to the assessment" />
      </div>

      <div className="enterprise-two-column">
        <Panel label="Executive summary" title="AI narrative" description="Board-level summary generated from the latest assessment output.">
          <p style={{ color: 'var(--slate-700)', lineHeight: 1.8 }}>{currentAssessment.executiveSummary}</p>
        </Panel>

        <Panel label="Standards summary" title="Scorecard" description="Latest overall position by standard.">
          <div className="insight-list">
            {currentAssessment.standards.map((standard) => {
              const status = getStandardStatus(standard.overallScore);
              return (
                <div key={standard.standardCode} className="insight-row">
                  <div className="insight-kicker">{getStandardLabel(standard.standardCode)}</div>
                  <div>
                    <div className="insight-title"><span className="data-emphasis">{standard.overallScore}%</span> overall score</div>
                    <div className="insight-copy">{standard.summary}</div>
                  </div>
                  <RiskIndicator level={status === 'non-compliant' ? 'critical' : status === 'partial' ? 'medium' : 'low'} label={status} />
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <Panel label="Clause findings" title="Detailed assessment register" description="Clause-level scores, status, and narrative findings.">
        <DataTable
          caption="Clause-by-clause position with the plain-language narrative used in the report pack."
          rows={currentAssessment.standards.flatMap((standard) =>
            standard.clauseScores.map((clause) => ({
              standardCode: standard.standardCode,
              ...clause,
            }))
          )}
          rowKey={(row) => `${row.standardCode}-${row.clauseId}`}
          columns={[
            { key: 'standard', header: 'Standard', cell: (row) => getStandardLabel(row.standardCode) },
            { key: 'clause', header: 'Clause', cell: (row) => row.clauseId },
            { key: 'title', header: 'Title', cell: (row) => row.clauseTitle },
            { key: 'score', header: 'Score', cell: (row) => <ScoreBadge score={row.score} /> },
            { key: 'status', header: 'Status', cell: (row) => <ClauseStatusTag status={row.status} /> },
            { key: 'narrative', header: 'Gap narrative', cell: (row) => row.gap || row.finding || 'No gap narrative recorded.' },
          ]}
        />
      </Panel>

      {criticalGaps.length > 0 && (
        <Panel label="Critical findings" title="Immediate attention required" description="Highest-severity gaps extracted from the current report pack.">
          <div className="enterprise-two-column">
            {criticalGaps.map((gap) => (
              <div key={gap.id} className="risk-register-card">
                <div className="insight-kicker insight-kicker-critical">{getStandardLabel(gap.standardCode)} clause {gap.clauseId}</div>
                <div className="risk-register-title">{gap.title}</div>
                <div style={{ marginBottom: 8 }}><RiskIndicator level="critical" label="Immediate management attention" /></div>
                <div className="insight-copy">{gap.description}</div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {currentAssessment.evidenceValidation && currentAssessment.evidenceValidation.evidenceItems.length > 0 && (
        <Panel label="Evidence validation" title="Evidence sufficiency review" description="Assessment evidence tested for quality, sufficiency, and reuse opportunities.">
          <EvidenceValidationPanel data={currentAssessment.evidenceValidation} />
        </Panel>
      )}
      <Panel
        label="Forecast outlook"
        title="Compliance readiness timeline"
        description="Use the same remediation scenarios from analytics to explain expected score progression inside the executive report pack."
      >
        <ComplianceReadinessTimeline assessment={currentAssessment} />
      </Panel>

      <Panel label="Remediation roadmap" title="Generated action plan" description="Phased sequence of actions linked to identified gaps.">
        <RemediationTimeline actions={currentAssessment.remediation} />
      </Panel>

      {currentAssessment.policyDocuments && currentAssessment.policyDocuments.length > 0 && (
        <Panel label="Policy outputs" title="Generated policy documents" description="Download-ready policy artifacts generated by the policy agent.">
          <PolicyGeneratorPanel documents={currentAssessment.policyDocuments} />
        </Panel>
      )}
    </div>
  );
}
