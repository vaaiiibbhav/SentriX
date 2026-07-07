import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, AlertTriangle, BookOpen, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Fuse from 'fuse.js';
import { useAppStore } from '../store/useAppStore';
import { navigationItems } from '../config/navigation';

interface SearchItem {
  id: string;
  type: 'clause' | 'gap' | 'standard' | 'remediation' | 'page';
  title: string;
  description: string;
  path: string;
  meta?: string;
}

const staticPages: SearchItem[] = navigationItems.map((item) => ({
  id: `page-${item.path}`,
  type: 'page',
  title: item.label,
  description: item.description,
  path: item.path,
}));

const typeIcons = {
  clause: BookOpen,
  gap: AlertTriangle,
  standard: FileText,
  remediation: ArrowRight,
  page: Search,
};

const typeColors = {
  clause: 'var(--accent)',
  gap: 'var(--color-risk-critical)',
  standard: 'var(--chart-2)',
  remediation: 'var(--risk-warning)',
  page: 'var(--text-secondary)',
};

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { currentAssessment } = useAppStore();

  // Build search index from assessment data
  const searchItems = useMemo<SearchItem[]>(() => {
    const items: SearchItem[] = [...staticPages];

    if (currentAssessment) {
      for (const std of currentAssessment.standards) {
        items.push({
          id: `std-${std.standardCode}`,
          type: 'standard',
          title: `${std.standardCode.replace('ISO', 'ISO ')} — ${std.standardName}`,
          description: `Score: ${std.overallScore}% | Maturity Level ${std.maturityLevel}`,
          path: '/standards',
          meta: std.summary,
        });

        for (const clause of std.clauseScores) {
          items.push({
            id: `clause-${std.standardCode}-${clause.clauseId}`,
            type: 'clause',
            title: `${std.standardCode} Clause ${clause.clauseId}: ${clause.clauseTitle}`,
            description: `Score: ${clause.score}% | ${clause.status}`,
            path: '/reports',
            meta: clause.gap || clause.evidence,
          });
        }
      }

      for (const gap of currentAssessment.gaps) {
        items.push({
          id: `gap-${gap.id}`,
          type: 'gap',
          title: gap.title,
          description: `${gap.standardCode.replace('ISO', 'ISO ')} Clause ${gap.clauseId} | ${gap.impact.toUpperCase()}`,
          path: '/reports',
          meta: gap.description,
        });
      }

      for (const rem of currentAssessment.remediation) {
        items.push({
          id: `rem-${rem.id}`,
          type: 'remediation',
          title: rem.title,
          description: `Phase ${rem.phase} | ${rem.effortDays} days | ${rem.responsibleFunction}`,
          path: '/reports',
          meta: rem.description,
        });
      }
    }

    return items;
  }, [currentAssessment]);

  const fuse = useMemo(
    () =>
      new Fuse(searchItems, {
        keys: [
          { name: 'title', weight: 0.4 },
          { name: 'description', weight: 0.3 },
          { name: 'meta', weight: 0.2 },
          { name: 'type', weight: 0.1 },
        ],
        threshold: 0.4,
        includeScore: true,
      }),
    [searchItems]
  );

  const results = query.trim()
    ? fuse.search(query).slice(0, 8).map((r) => r.item)
    : staticPages;

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    const openHandler = () => setOpen(true);
    window.addEventListener('keydown', handler);
    window.addEventListener('SentriX:open-search', openHandler);
    return () => {
      window.removeEventListener('keydown', handler);
      window.removeEventListener('SentriX:open-search', openHandler);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (item: SearchItem) => {
    navigate(item.path);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      handleSelect(results[selectedIndex]);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[60]"
            style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}
          />

          {/* Search modal */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed top-[12%] left-1/2 -translate-x-1/2 w-[640px] max-w-[92vw] z-[61] rounded-2xl overflow-hidden"
            style={{
              background: 'var(--surface-overlay-strong)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            {/* Input */}
            <div
              className="flex items-center gap-3 px-5 py-4"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <Search size={20} style={{ color: 'var(--color-text-muted)' }} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search standards, gaps, policies..."
                className="flex-1 bg-transparent border-none outline-none text-base"
                style={{ color: 'var(--text-primary)' }}
                aria-label="Search standards, gaps, policies, and pages"
              />
              <kbd
                className="text-xs font-mono px-2 py-1 rounded"
                style={{ background: 'var(--surface-muted)', color: 'var(--slate-500)', border: '1px solid var(--border-subtle)' }}
              >
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-[400px] overflow-y-auto py-2">
              {results.length === 0 && (
                <div className="px-5 py-8 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  No results found for "{query}"
                </div>
              )}
              {results.map((item, i) => {
                const Icon = typeIcons[item.type];
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(i)}
                    className="w-full flex items-center gap-3 px-5 py-3 text-left transition-colors"
                    style={{
                      background: i === selectedIndex ? 'var(--surface-muted)' : 'transparent',
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${typeColors[item.type]}15` }}
                    >
                      <Icon size={16} style={{ color: typeColors[item.type] }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                        {item.title}
                      </div>
                      <div className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                        {item.description}
                      </div>
                    </div>
                    <span
                      className="text-xs px-2 py-1 rounded capitalize flex-shrink-0"
                      style={{ background: `${typeColors[item.type]}15`, color: typeColors[item.type] }}
                    >
                      {item.type}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-between px-5 py-3 text-xs"
              style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--color-text-muted)', background: 'var(--surface-muted)' }}
            >
              <span>↑↓ Navigate &nbsp; ↵ Select &nbsp; ESC Close</span>
              <span>{searchItems.length} items indexed</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Export a trigger button for Navbar
export function SearchTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all"
      style={{ background: 'var(--surface-overlay-strong)', border: '1px solid var(--border-subtle)' }}
    >
      <Search size={16} style={{ color: 'var(--color-text-muted)' }} />
      <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Search...</span>
      <kbd
        className="text-xs font-mono px-2 py-1 rounded ml-4"
        style={{ background: 'var(--surface-muted)', color: 'var(--color-text-muted)', border: '1px solid var(--border-subtle)' }}
      >
        Ctrl K
      </kbd>
    </button>
  );
}
