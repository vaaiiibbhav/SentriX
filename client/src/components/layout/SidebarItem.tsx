import { NavLink } from 'react-router-dom';
import type { NavigationItem } from '../../config/navigation';

interface SidebarItemProps {
  item: NavigationItem;
  collapsed?: boolean;
  onNavigate?: () => void;
}

export default function SidebarItem({ item, collapsed = false, onNavigate }: SidebarItemProps) {
  return (
    <NavLink
      to={item.path}
      end={item.path === '/dashboard'}
      className={({ isActive }) => ['sidebar-nav-item', isActive ? 'active' : '', collapsed ? 'collapsed' : ''].filter(Boolean).join(' ')}
      title={collapsed ? item.label : undefined}
      aria-label={collapsed ? item.label : undefined}
      onClick={onNavigate}
    >
      {({ isActive }) => (
        <>
          <span className="sidebar-nav-item-indicator" aria-hidden="true" />
          <span className={['sidebar-nav-icon', isActive ? 'active' : ''].join(' ')} aria-hidden="true">
            <item.icon size={18} />
          </span>
          {!collapsed && (
            <span className="sidebar-nav-copy">
              <span className="sidebar-nav-label">{item.label}</span>
              <span className="sidebar-nav-meta">{item.description}</span>
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}