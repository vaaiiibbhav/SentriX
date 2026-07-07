import { motion } from 'framer-motion';
import type { RemediationAction } from '../../types';

const priorityColors: Record<string, string> = {
  critical: 'var(--color-risk-critical)',
  high: 'var(--color-risk-high)',
  medium: 'var(--color-risk-medium)',
  low: 'var(--color-risk-low)',
};

interface RemediationTimelineProps {
  actions: RemediationAction[];
}

export default function RemediationTimeline({ actions }: RemediationTimelineProps) {
  return (
    <div className="space-y-1 max-h-[380px] overflow-y-auto pr-2">
      {actions.map((action, i) => (
        <motion.div
          key={action.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex gap-4 relative"
        >
          {/* Timeline line */}
          <div className="flex flex-col items-center">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0 mt-1.5"
              style={{ background: priorityColors[action.priority], boxShadow: `0 0 8px ${priorityColors[action.priority]}60` }}
            />
            {i < actions.length - 1 && (
              <div className="w-px flex-1 my-1" style={{ background: 'var(--color-primary-600)' }} />
            )}
          </div>

          <div className="pb-4 flex-1" style={{ padding: '10px 14px', border: '1px solid var(--border-subtle)', borderRadius: 16, background: 'linear-gradient(180deg, var(--card), var(--surface-elevated))' }}>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                style={{ background: `${priorityColors[action.priority]}20`, color: priorityColors[action.priority] }}
              >
                {action.priority}
              </span>
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Phase {action.phase} · {action.effortDays}d
              </span>
            </div>
            <h4 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {action.title}
            </h4>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
              {action.standards.join(' · ')} | {action.responsibleFunction}
            </p>
            <p className="text-xs mt-2" style={{ color: 'var(--slate-600)', lineHeight: 1.6 }}>
              {action.description}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
