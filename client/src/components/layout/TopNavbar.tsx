import { useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Command, Menu, Monitor, Moon, Plus, Sparkles, Sun } from 'lucide-react';
import { pageMetaByPath } from '../../config/navigation';
import { useAppStore } from '../../store/useAppStore';
import type { ThemeMode } from '../../store/useAppStore';
import BrandLogo from './BrandLogo';
import NotificationBell from './NotificationBell';
import SearchBar from './SearchBar';
import WorkspaceSelector from './WorkspaceSelector';

interface TopNavbarProps {
  isMobile?: boolean;
  onToggleSidebar?: () => void;
}

function resolvePage(pathname: string) {
  if (pageMetaByPath[pathname]) return pageMetaByPath[pathname];
  const matched = Object.entries(pageMetaByPath).find(([path]) => pathname.startsWith(path + '/'));
  return matched?.[1] || { title: 'SentriX', subtitle: 'Enterprise compliance intelligence workspace' };
}

export default function TopNavbar({ isMobile = false, onToggleSidebar }: TopNavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentAssessment, isDemoMode, orgProfile, selectedStandards, setThemeMode, themeMode, toggleChat } = useAppStore();
  const page = resolvePage(location.pathname);
  const standardsInScope = currentAssessment?.standards.length || selectedStandards.length;

  const themeOrder: ThemeMode[] = ['light', 'dark', 'system'];
  const nextThemeMode = themeOrder[(themeOrder.indexOf(themeMode) + 1) % themeOrder.length];
  const themeMeta: Record<ThemeMode, { icon: typeof Sun; label: string }> = {
    light: { icon: Sun, label: 'Light' },
    dark: { icon: Moon, label: 'Dark' },
    system: { icon: Monitor, label: 'System' },
  };
  const ThemeIcon = themeMeta[themeMode].icon;

  const workspaceLabel = useMemo(() => orgProfile.companyName || 'SentriX', [orgProfile.companyName]);

  return (
    <header className="app-topbar" role="banner">
      <div className="top-navbar-left">
        {isMobile && (
          <button
            type="button"
            className="top-navbar-menu-button"
            onClick={onToggleSidebar}
            aria-label="Open navigation menu"
          >
            <Menu size={18} />
          </button>
        )}
        <Link to="/dashboard" className="top-navbar-brand" aria-label="Go to SentriX dashboard">
          <BrandLogo compact={false} className="top-navbar-brand-lockup" descriptionClassName="top-navbar-brand-description" />
        </Link>
        <div className="top-navbar-context-block">
          <div className="top-navbar-workspace-label">{workspaceLabel}</div>
          <div className="top-navbar-page-meta">{page.title} · {page.subtitle}</div>
        </div>
      </div>

      <div className="top-navbar-center">
        <SearchBar compact={isMobile} />
      </div>

      <div className="top-navbar-right">
        {isMobile && <SearchBar compact />}

        <div className="top-navbar-chip" aria-label={`${standardsInScope} standards in scope`}>
          <Sparkles size={14} />
          <span>{standardsInScope || 0} in scope</span>
        </div>

        {!isMobile && <WorkspaceSelector />}

        {isDemoMode && !isMobile && (
          <div className="top-navbar-chip warn" aria-label="Demo mode active">
            <span className="top-navbar-chip-dot" aria-hidden="true" />
            <span>Demo mode</span>
          </div>
        )}

        <NotificationBell />

        <button
          type="button"
          className="top-navbar-icon-button"
          onClick={() => setThemeMode(nextThemeMode)}
          aria-label={`Theme mode ${themeMeta[themeMode].label}. Switch to ${themeMeta[nextThemeMode].label}.`}
          title={`Theme: ${themeMeta[themeMode].label}`}
        >
          <ThemeIcon size={16} />
        </button>

        <button
          type="button"
          className="top-navbar-copilot-button"
          onClick={toggleChat}
          aria-label="Open SentriX Copilot"
        >
          <Command size={15} />
          {!isMobile && <span>SentriX Copilot</span>}
        </button>

        <button
          type="button"
          className="btn btn-primary top-navbar-primary-action"
          onClick={() => navigate('/assessment')}
          aria-label="Start new assessment"
        >
          <Plus size={16} />
          <span>New Assessment</span>
        </button>
      </div>
    </header>
  );
}