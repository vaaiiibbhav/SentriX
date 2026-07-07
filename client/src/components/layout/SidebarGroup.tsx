import type { NavigationSection } from '../../config/navigation';
import SidebarItem from './SidebarItem';

interface SidebarGroupProps {
  section: NavigationSection;
  collapsed?: boolean;
  onNavigate?: () => void;
}

export default function SidebarGroup({ section, collapsed = false, onNavigate }: SidebarGroupProps) {
  return (
    <section className="sidebar-group" aria-label={section.label}>
      {!collapsed && <div className="sidebar-group-label">{section.label}</div>}
      <div className="sidebar-group-items">
        {section.items.map((item) => (
          <SidebarItem key={item.path} item={item} collapsed={collapsed} onNavigate={onNavigate} />
        ))}
      </div>
    </section>
  );
}