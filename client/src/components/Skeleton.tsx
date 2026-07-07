import { motion } from 'framer-motion';

function Shimmer({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) {
  return (
    <motion.div
      className={`rounded-xl overflow-hidden ${className}`}
      style={{ background: 'var(--color-primary-700)', ...style }}
    >
      <motion.div
        className="w-full h-full"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
          backgroundSize: '200% 100%',
        }}
        animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />
    </motion.div>
  );
}

export function CardSkeleton() {
  return (
    <div className="glass-card space-y-4">
      <Shimmer className="w-24 h-3" />
      <Shimmer className="w-48 h-5" />
      <div className="space-y-2">
        <Shimmer className="w-full h-3" />
        <Shimmer className="w-3/4 h-3" />
        <Shimmer className="w-1/2 h-3" />
      </div>
    </div>
  );
}

export function KPISkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="glass-card flex items-center gap-4">
          <Shimmer className="w-16 h-16 rounded-2xl" />
          <div className="space-y-2 flex-1">
            <Shimmer className="w-20 h-3" />
            <Shimmer className="w-12 h-6" />
            <Shimmer className="w-24 h-2.5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div className="glass-card">
      <Shimmer className="w-32 h-3 mb-2" />
      <Shimmer className="w-48 h-5 mb-4" />
      <Shimmer className="w-full" style={{ height }} />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="glass-card">
      <Shimmer className="w-32 h-3 mb-2" />
      <Shimmer className="w-48 h-5 mb-4" />
      <div className="space-y-3">
        <div className="flex gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Shimmer key={i} className="flex-1 h-3" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4" style={{ opacity: 1 - i * 0.15 }}>
            {Array.from({ length: 5 }).map((_, j) => (
              <Shimmer key={j} className="flex-1 h-3" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="w-12 h-12 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, var(--color-accent-500), var(--color-accent-400))',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
        <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading...</span>
      </motion.div>
    </div>
  );
}

export default Shimmer;
