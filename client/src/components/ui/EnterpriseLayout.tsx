import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const heroContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const heroItem = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
};

export function PageHero({
  eyebrow,
  title,
  description,
  actions,
  aside,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <motion.section className="enterprise-hero" variants={heroContainer} initial="hidden" animate="visible">
      <div>
        <motion.span className="section-label" variants={heroItem}>{eyebrow}</motion.span>
        <motion.h1 className="enterprise-hero-title" variants={heroItem}>{title}</motion.h1>
        <motion.p className="enterprise-hero-copy" variants={heroItem}>{description}</motion.p>
        {actions ? <motion.div className="enterprise-hero-actions" variants={heroItem}>{actions}</motion.div> : null}
      </div>
      {aside ? (
        <motion.div
          className="enterprise-hero-aside"
          initial={{ opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          {aside}
        </motion.div>
      ) : null}
    </motion.section>
  );
}

export function MetricCard({
  label,
  value,
  caption,
  tone = 'default',
}: {
  label: string;
  value: string | number;
  caption: string;
  tone?: 'default' | 'brand' | 'success' | 'warn' | 'danger';
}) {
  return (
    <motion.div
      className={`metric-card metric-card-${tone}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
    >
      <div className="metric-card-label">{label}</div>
      <div className="metric-card-value score-display">{value}</div>
      <div className="metric-card-caption">{caption}</div>
    </motion.div>
  );
}

export function Panel({
  label,
  title,
  description,
  action,
  children,
}: {
  label: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <motion.section
      className="card analytics-panel"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -40px 0px' }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="card-header">
        <div>
          <span className="section-label">{label}</span>
          <div className="enterprise-panel-title">{title}</div>
          {description ? <div className="enterprise-panel-copy">{description}</div> : null}
        </div>
        {action}
      </div>
      <div className="card-body analytics-panel-body">{children}</div>
    </motion.section>
  );
}

export function EmptyWorkspace({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <motion.div
      className="empty-workspace"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="empty-workspace-mark"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
      >
        <ArrowRight size={18} />
      </motion.div>
      <div className="empty-workspace-title">{title}</div>
      <div className="empty-workspace-copy">{description}</div>
      {action ? <div className="enterprise-hero-actions">{action}</div> : null}
    </motion.div>
  );
}
