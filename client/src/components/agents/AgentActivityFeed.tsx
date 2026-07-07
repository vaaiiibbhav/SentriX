import { motion } from 'framer-motion';
import { Search, Bot, ShieldCheck, GitBranch, Wrench, Clock, ScrollText } from 'lucide-react';

const feedItems = [
  { agent: 'Surface Parsing Agent', icon: Search, message: 'Structured 42 target asset sections and extracted attack surface signals from ingested OSINT seeds', time: '2 min ago', color: '#00ABBD' },
  { agent: 'OSINT Mapping Agent', icon: Bot, message: 'Mapped subdomain enumeration and leaked credential signals to high-relevance CVE entries with semantic matches', time: '4 min ago', color: '#0076A8' },
  { agent: 'Evidence Validation Agent', icon: ShieldCheck, message: 'Classified signal quality and flagged unconfirmed exploits as indirect or missing evidence', time: '6 min ago', color: '#86BC25' },
  { agent: 'Exposure Scoring Agent', icon: Bot, message: 'Calculated vulnerability exposure and confidence levels across the scanned attack surface', time: '8 min ago', color: '#DD6B20' },
  { agent: 'Gap Detection Agent', icon: GitBranch, message: 'Identified unpatched CVEs and misconfigured controls across the mapped exposure surface', time: '10 min ago', color: '#E53E3E' },
  { agent: 'Remediation Planning Agent', icon: Wrench, message: 'Generated a prioritized remediation roadmap with phases, owners, and effort signals', time: '12 min ago', color: '#A8D048' },
  { agent: 'Policy Hardening Agent', icon: ScrollText, message: 'Drafted hardened control configurations to close the highest-priority attack surface gaps', time: '14 min ago', color: '#70563C' },
];

export default function AgentActivityFeed() {
  return (
    <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2">
      {feedItems.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex items-start gap-3 p-3 rounded-xl transition-all hover:bg-[var(--color-primary-700)]"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: `${item.color}15`, color: item.color }}
          >
            <item.icon size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-bold" style={{ color: item.color }}>{item.agent}</span>
            </div>
            <p className="text-sm truncate" style={{ color: 'var(--color-text-secondary)' }}>{item.message}</p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Clock size={12} style={{ color: 'var(--color-text-muted)' }} />
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{item.time}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
