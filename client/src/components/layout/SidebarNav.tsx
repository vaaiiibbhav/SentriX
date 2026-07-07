import { ChevronLeft, ChevronRight, PanelLeftClose, PanelLeftOpen, Sparkles } from 'lucide-react';
import { navigationSections, utilityNavigationItems } from '../../config/navigation';
import { useAppStore } from '../../store/useAppStore';
import BrandLogo from './BrandLogo';
import SidebarGroup from './SidebarGroup';
import SidebarItem from './SidebarItem';

interface SidebarNavProps {
  mobileOpen?: boolean;
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

export default function SidebarNav({ mobileOpen = false, isMobile = false, onCloseMobile }: SidebarNavProps) {
  const { sidebarCollapsed, toggleSidebar, selectedStandards, currentAssessment } = useAppStore();
  const collapsed = isMobile ? false : sidebarCollapsed;
  const standardCount = currentAssessment?.standards.length || selectedStandards.length;

  return (
    <>
      {isMobile && mobileOpen && <button type="button" className="sidebar-backdrop" onClick={onCloseMobile} aria-label="Close navigation overlay" />}
      <aside
        className={[
          'app-sidebar',
          collapsed ? 'collapsed' : '',
          isMobile ? 'mobile' : '',
          isMobile && mobileOpen ? 'mobile-open' : '',
        ].filter(Boolean).join(' ')}
        aria-label="Primary sidebar navigation"
      >
        <div className="sidebar-header">
          <BrandLogo compact={collapsed} />
          <button
            type="button"
            className="sidebar-collapse-button"
            onClick={isMobile ? onCloseMobile : toggleSidebar}
            aria-label={isMobile ? 'Close navigation' : collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isMobile ? <PanelLeftClose size={16} /> : collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {!collapsed && (
          <div className="sidebar-overview-card">
            <div className="sidebar-overview-eyebrow">Threat Intelligence Hub</div>
            <div className="sidebar-overview-title">Attack surface at a glance</div>
            <div className="sidebar-overview-copy">
              Navigate scan modules, OSINT pipelines, and remediation outputs from one unified workspace.
            </div>
            <div className="sidebar-overview-chip">
              <Sparkles size={14} />
              <span>{standardCount || 0} modules in scope</span>
            </div>
          </div>
        )}

        <nav className="sidebar-scroll" role="navigation" aria-label="Workspace sections">
          {navigationSections.map((section) => (
            <SidebarGroup
              key={section.label}
              section={section}
              collapsed={collapsed}
              onNavigate={isMobile ? onCloseMobile : undefined}
            />
          ))}
        </nav>

        <div className="sidebar-utility-area">
          {!collapsed && <div className="sidebar-group-label muted">Utilities</div>}
          <div className="sidebar-group-items compact">
            {utilityNavigationItems.map((item) => (
              <SidebarItem key={item.path} item={item} collapsed={collapsed} onNavigate={isMobile ? onCloseMobile : undefined} />
            ))}
          </div>
          {!isMobile && (
            <button
              type="button"
              className={['sidebar-toggle-row', collapsed ? 'collapsed' : ''].join(' ')}
              onClick={toggleSidebar}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
              {!collapsed && <span>Collapse navigation</span>}
            </button>
          )}
        </div>
      </aside>
    </>
  );
}