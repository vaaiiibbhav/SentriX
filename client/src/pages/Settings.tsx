import { motion } from 'framer-motion';
import { Info, Palette, Monitor, Moon, Sun } from 'lucide-react';
import { PageHero, Panel } from '../components/ui/EnterpriseLayout';
import { useAppStore } from '../store/useAppStore';

const themeOptions = [
  {
    id: 'light',
    label: 'Light',
    description: 'Bright neutral dashboard palette for daytime and shared review sessions.',
    icon: Sun,
  },
  {
    id: 'dark',
    label: 'Dark',
    description: 'High-contrast executive dashboard palette optimized for long analytics sessions.',
    icon: Moon,
  },
  {
    id: 'system',
    label: 'System',
    description: 'Automatically match the operating system theme preference.',
    icon: Monitor,
  },
] as const;

export default function Settings() {
  const themeMode = useAppStore((state) => state.themeMode);
  const setThemeMode = useAppStore((state) => state.setThemeMode);

  return (
    <div className="page-stack">
      <PageHero
        eyebrow="Configuration"
        title="Workspace settings"
        description="Manage appearance, integrations, and workspace defaults. Theme selection is persisted and applied across dashboards, tables, and charts."
      />

      <div className="enterprise-two-column">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Panel label="Appearance" title="Theme mode" description="Choose the dashboard palette that should drive all analytics surfaces and charts.">
            <div className="settings-theme-grid">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                const isActive = themeMode === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setThemeMode(option.id)}
                    className={`settings-theme-card ${isActive ? 'active' : ''}`}
                    aria-pressed={isActive}
                  >
                    <div className="settings-theme-card-head">
                      <div className="settings-theme-icon"><Icon size={18} /></div>
                      <div>
                        <div className="settings-theme-title">{option.label}</div>
                        <div className="settings-theme-copy">{option.description}</div>
                      </div>
                    </div>
                    <div className="settings-theme-preview">
                      <span className="settings-theme-swatch settings-theme-swatch-strong" />
                      <span className="settings-theme-swatch settings-theme-swatch-soft" />
                      <span className="settings-theme-swatch settings-theme-swatch-accent" />
                    </div>
                  </button>
                );
              })}
            </div>
          </Panel>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Panel label="Integrations" title="API configuration" description="Integration keys remain local to this workspace and are not transmitted until you save them to the backend.">
            <div className="page-stack" style={{ gap: 16 }}>
              <div>
                <label className="form-label">Anthropic API Key</label>
                <input type="password" placeholder="sk-ant-..." className="form-input" />
              </div>
              <div>
                <label className="form-label">OmniAgent Endpoint</label>
                <input type="text" placeholder="https://api.OmniAgent" className="form-input" />
              </div>
            </div>
          </Panel>
        </motion.div>
      </div>

      <div className="enterprise-two-column">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Panel label="Display behavior" title="Theme behavior notes" description="All dashboards, tables, and charts consume shared tokens so the same components render correctly in both light and dark mode.">
            <div className="stack-list">
              <div className="insight-card">
                <div className="insight-kicker"><Palette size={14} /></div>
                <div className="insight-title">Shared theme tokens</div>
                <div className="insight-copy">Light and dark modes are driven by CSS variables, so components are not duplicated to support them.</div>
              </div>
              <div className="insight-card">
                <div className="insight-kicker"><Monitor size={14} /></div>
                <div className="insight-title">Chart adaptation</div>
                <div className="insight-copy">Graph grids, axis labels, tooltips, and dashboard surfaces adapt automatically when the theme changes.</div>
              </div>
            </div>
          </Panel>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Panel label="About" title="SentriX platform" description="Workspace, product, and model metadata for the current build.">
            <div className="stack-list">
              <div className="insight-row">
                <div className="insight-kicker"><Info size={14} /></div>
                <div>
                  <div className="insight-title">Version 2.0.0</div>
                  <div className="insight-copy">AI engine: Claude 5th-Gen Agentic Engine (Claude Sonnet 5 · Claude Fable 5) · Platform: Enterprise Core OmniAgent™ · Engineered by Vaibhav Verma for Hackathon 2026.</div>
                </div>
              </div>
            </div>
          </Panel>
        </motion.div>
      </div>
    </div>
  );
}
