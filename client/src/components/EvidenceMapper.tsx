import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ChevronRight, Shield, AlertTriangle } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { ClauseScore, StandardAssessment } from '../types';

function getScoreColor(score: number): string {
  if (score >= 75) return 'var(--color-accent-500)';
  if (score >= 60) return '#FFD32A';
  if (score >= 33) return '#DD6B20';
  return 'var(--color-risk-critical)';
}

export default function EvidenceMapper() {
  const { currentAssessment } = useAppStore();
  const [selectedStandard, setSelectedStandard] = useState<string>(
    currentAssessment?.standards[0]?.standardCode || ''
  );
  const [selectedClause, setSelectedClause] = useState<ClauseScore | null>(null);

  if (!currentAssessment) return null;

  const standard = currentAssessment.standards.find((s) => s.standardCode === selectedStandard);
  const clauses = standard?.clauseScores || [];

  return (
    <div className="space-y-6">
      {/* Standard tabs */}
      <div className="flex gap-2 flex-wrap">
        {currentAssessment.standards.map((s) => (
          <button
            key={s.standardCode}
            onClick={() => {
              setSelectedStandard(s.standardCode);
              setSelectedClause(null);
            }}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              background: selectedStandard === s.standardCode ? 'rgba(134, 188, 37, 0.15)' : 'var(--color-primary-700)',
              border: `1px solid ${selectedStandard === s.standardCode ? 'var(--color-accent-500)' : 'var(--glass-border)'}`,
              color: selectedStandard === s.standardCode ? 'var(--color-accent-400)' : 'var(--color-text-secondary)',
            }}
          >
            {s.standardCode.replace('ISO', 'ISO ')} ({s.overallScore}%)
          </button>
        ))}
      </div>

      {/* Two-pane layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Clause list */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
        >
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--glass-border)' }}>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Clauses ({clauses.length})
            </h3>
          </div>
          <div className="max-h-[500px] overflow-y-auto">
            {clauses.map((clause) => (
              <button
                key={clause.clauseId}
                onClick={() => setSelectedClause(clause)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                style={{
                  background: selectedClause?.clauseId === clause.clauseId ? 'var(--color-primary-700)' : 'transparent',
                  borderBottom: '1px solid var(--glass-border)',
                }}
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: getScoreColor(clause.score) }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                    {clause.clauseId} — {clause.clauseTitle}
                  </div>
                  <div className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                    {clause.status} | {clause.score}%
                  </div>
                </div>
                <span
                  className="text-sm font-bold score-display flex-shrink-0"
                  style={{ color: getScoreColor(clause.score) }}
                >
                  {clause.score}%
                </span>
                <ChevronRight size={14} style={{ color: 'var(--color-text-muted)' }} />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Evidence detail */}
        <AnimatePresence mode="wait">
          {selectedClause ? (
            <motion.div
              key={selectedClause.clauseId}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="rounded-2xl p-6 space-y-5"
              style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full capitalize"
                    style={{ background: `${getScoreColor(selectedClause.score)}15`, color: getScoreColor(selectedClause.score) }}
                  >
                    {selectedClause.status}
                  </span>
                  <span className="score-display text-lg font-bold" style={{ color: getScoreColor(selectedClause.score) }}>
                    {selectedClause.score}%
                  </span>
                </div>
                <h3 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  Clause {selectedClause.clauseId}: {selectedClause.clauseTitle}
                </h3>
              </div>

              {selectedClause.evidence && (
                <div className="p-4 rounded-xl" style={{ background: 'rgba(134, 188, 37, 0.05)', border: '1px solid rgba(134, 188, 37, 0.1)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Shield size={14} style={{ color: 'var(--color-accent-500)' }} />
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-accent-500)' }}>
                      Evidence Found
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {selectedClause.evidence}
                  </p>
                </div>
              )}

              {selectedClause.gap && (
                <div className="p-4 rounded-xl" style={{ background: 'rgba(255, 71, 87, 0.05)', border: '1px solid rgba(255, 71, 87, 0.1)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={14} style={{ color: 'var(--color-risk-critical)' }} />
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-risk-critical)' }}>
                      Gap Identified
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {selectedClause.gap}
                  </p>
                </div>
              )}

              {selectedClause.remediation && (
                <div className="p-4 rounded-xl" style={{ background: 'rgba(74, 144, 255, 0.05)', border: '1px solid rgba(74, 144, 255, 0.1)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText size={14} style={{ color: '#00ABBD' }} />
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#00ABBD' }}>
                      Recommended Action
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {selectedClause.remediation}
                  </p>
                </div>
              )}

              {/* Score bar */}
              <div>
                <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
                  <span>Compliance Score</span>
                  <span>{selectedClause.score}%</span>
                </div>
                <div className="w-full h-2 rounded-full" style={{ background: 'var(--color-primary-700)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${selectedClause.score}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: getScoreColor(selectedClause.score) }}
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl p-6 flex flex-col items-center justify-center min-h-[300px]"
              style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
            >
              <FileText size={40} className="mb-3" style={{ color: 'var(--color-text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Select a clause to view evidence details
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
