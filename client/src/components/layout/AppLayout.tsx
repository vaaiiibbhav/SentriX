import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import ChatAssistant from '../dashboard/ChatAssistant';
import GlobalSearch from '../GlobalSearch';
import { useAppStore } from '../../store/useAppStore';

export default function AppLayout() {
  const { sidebarCollapsed, toggleSidebar } = useAppStore();
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 960);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 960px)');
    setIsMobile(mq.matches);
    if (mq.matches && !sidebarCollapsed) toggleSidebar();
    const handler = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
      if (e.matches && !sidebarCollapsed) toggleSidebar();
      if (!e.matches) setMobileSidebarOpen(false);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="app-shell">
      <Sidebar mobileOpen={mobileSidebarOpen} isMobile={isMobile} onCloseMobile={() => setMobileSidebarOpen(false)} />
      <div className="app-content">
        <Navbar isMobile={isMobile} onToggleSidebar={() => setMobileSidebarOpen((value) => !value)} />
        <main className="app-main">
          <div className="page-stack">
            <Outlet />
          </div>
        </main>
      </div>
      <ChatAssistant />
      <GlobalSearch />
    </div>
  );
}
