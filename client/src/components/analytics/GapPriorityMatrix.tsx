import {
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';
import type { Gap } from '../../types';

const standardColors: Record<string, string> = {
  ISO37001: 'var(--chart-5)',
  ISO37301: 'var(--green)',
  ISO27001: 'var(--chart-2)',
  ISO9001: 'var(--risk-medium)',
};

interface GapPriorityMatrixProps {
  gaps: Gap[];
}

function MatrixTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { title: string; standardCode: string; impactScore: number; effortScore: number; category: string; impact: string } }> }) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const point = payload[0].payload;

  return (
    <div style={{ background: 'var(--chart-tooltip-bg)', border: '1px solid var(--chart-tooltip-border)', borderRadius: 14, padding: '12px 14px', boxShadow: 'var(--shadow-lg)', minWidth: 220 }}>
      <div style={{ fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>{point.title}</div>
      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 8 }}>{point.standardCode.replace('ISO', 'ISO ')} · {point.category}</div>
      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
        <div>Business impact: {point.impactScore}/10</div>
        <div>Implementation effort: {point.effortScore}/10</div>
        <div>Priority: {point.impact}</div>
      </div>
    </div>
  );
}

export default function GapPriorityMatrix({ gaps }: GapPriorityMatrixProps) {
  const pointsByStandard = Object.keys(standardColors).map((standardCode) => ({
    standardCode,
    color: standardColors[standardCode],
    data: gaps
      .filter((gap) => gap.standardCode === standardCode)
      .map((gap) => ({
        id: gap.id,
        title: gap.title,
        standardCode: gap.standardCode,
        effortScore: gap.effortScore,
        impactScore: gap.impactScore,
        category: gap.category,
        impact: gap.impact,
        size: gap.impact === 'critical' ? 260 : gap.impact === 'high' ? 210 : 160,
      })),
  }));

  return (
    <div className="analytics-priority-matrix">
      <ResponsiveContainer width="100%" height={340}>
        <ScatterChart margin={{ top: 20, right: 24, bottom: 28, left: 8 }}>
          <ReferenceArea x1={0} x2={5} y1={5} y2={10} fill="var(--chart-quadrant-quick)" fillOpacity={1} ifOverflow="extendDomain" />
          <ReferenceArea x1={5} x2={10} y1={5} y2={10} fill="var(--chart-quadrant-strategic)" fillOpacity={1} ifOverflow="extendDomain" />
          <ReferenceArea x1={0} x2={5} y1={0} y2={5} fill="var(--chart-quadrant-monitor)" fillOpacity={1} ifOverflow="extendDomain" />
          <ReferenceArea x1={5} x2={10} y1={0} y2={5} fill="var(--chart-quadrant-defer)" fillOpacity={1} ifOverflow="extendDomain" />
          <CartesianGrid strokeDasharray="4 4" stroke="var(--chart-grid)" />
          <ReferenceLine x={5} stroke="var(--chart-grid)" strokeDasharray="6 6" />
          <ReferenceLine y={5} stroke="var(--chart-grid)" strokeDasharray="6 6" />
          <XAxis
            type="number"
            dataKey="effortScore"
            domain={[0, 10]}
            ticks={[0, 2, 4, 6, 8, 10]}
            tick={{ fill: 'var(--chart-axis)', fontSize: 11 }}
            stroke="var(--chart-grid)"
            label={{ value: 'Implementation effort', position: 'insideBottom', offset: -12, fill: 'var(--chart-axis)', fontSize: 12 }}
          />
          <YAxis
            type="number"
            dataKey="impactScore"
            domain={[0, 10]}
            ticks={[0, 2, 4, 6, 8, 10]}
            tick={{ fill: 'var(--chart-axis)', fontSize: 11 }}
            stroke="var(--chart-grid)"
            label={{ value: 'Business impact', angle: -90, position: 'insideLeft', fill: 'var(--chart-axis)', fontSize: 12 }}
          />
          <ZAxis type="number" dataKey="size" range={[80, 260]} />
          <Tooltip content={<MatrixTooltip />} cursor={{ stroke: 'var(--chart-grid)', strokeDasharray: '4 4' }} />
          {pointsByStandard.map((group) => (
            <Scatter key={group.standardCode} name={group.standardCode.replace('ISO', 'ISO ')} data={group.data} fill={group.color} stroke="var(--chart-scatter-stroke)" strokeWidth={1.5} />
          ))}
        </ScatterChart>
      </ResponsiveContainer>

      <div className="analytics-priority-matrix-legend">
        <div className="analytics-priority-matrix-legend-pill analytics-priority-matrix-legend-pill-quick">Quick wins</div>
        <div className="analytics-priority-matrix-legend-pill analytics-priority-matrix-legend-pill-strategic">Strategic</div>
        <div className="analytics-priority-matrix-legend-pill analytics-priority-matrix-legend-pill-monitor">Monitor</div>
        <div className="analytics-priority-matrix-legend-pill analytics-priority-matrix-legend-pill-defer">Defer</div>
      </div>

      <div className="analytics-priority-matrix-legend">
        {Object.entries(standardColors).map(([code, color]) => (
          <div key={code} className="analytics-priority-matrix-legend-item">
            <div className="analytics-priority-matrix-legend-dot" style={{ background: color }} />
            <span className="analytics-priority-matrix-legend-label">{code.replace('ISO', 'ISO ')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
