import type { StandardAssessment } from '../../types';
import { getRiskColor } from '../../utils/helpers';

interface ClauseHeatmapProps {
  standards: StandardAssessment[];
}

export default function ClauseHeatmap({ standards }: ClauseHeatmapProps) {
  return (
    <div className="space-y-5 overflow-x-auto">
      {standards.map((std) => (
        <div key={std.standardCode} style={{ border: '1px solid var(--border-subtle)', borderRadius: 18, padding: 16, background: 'linear-gradient(180deg, var(--card), var(--surface-elevated))' }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold" style={{ color: 'var(--slate-900)', fontFamily: 'var(--font-display)' }}>
              {std.standardCode.replace('ISO', 'ISO ')}
            </span>
            <span className="text-xs" style={{ color: 'var(--slate-500)' }}>
              {std.standardName}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {std.clauseScores.map((clause) => {
              const color = getRiskColor(clause.score);
              return (
                <div
                  key={`${std.standardCode}-${clause.clauseId}`}
                  className="group relative"
                >
                  <div
                    className="w-14 h-11 rounded-xl flex items-center justify-center cursor-pointer transition-all hover:scale-105"
                    style={{
                      background: `${color}18`,
                      border: `1px solid ${color}40`,
                      boxShadow: `inset 0 1px 0 ${color}10`,
                    }}
                  >
                    <div style={{ textAlign: 'center' }}>
                      <div className="score-display text-[11px] font-bold" style={{ color }}>{clause.score}%</div>
                      <div style={{ fontSize: 9, color: 'var(--slate-500)', marginTop: 1 }}>{clause.clauseId}</div>
                    </div>
                  </div>
                  {/* Tooltip */}
                  <div
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
                    style={{ background: 'var(--surface-overlay-strong)', border: '1px solid var(--border-subtle)' }}
                  >
                    <div className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      {clause.clauseId}: {clause.clauseTitle}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span style={{ color }}>Score: {clause.score}%</span>
                      <span style={{ color: 'var(--color-text-muted)' }}>| {clause.status}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
