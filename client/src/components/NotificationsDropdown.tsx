import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, CheckCheck, Trash2, AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

const typeConfig = {
  info: { icon: Info, color: 'var(--accent)', bg: 'var(--surface-info)' },
  success: { icon: CheckCircle, color: 'var(--risk-success)', bg: 'var(--surface-success)' },
  warning: { icon: AlertTriangle, color: 'var(--risk-warning)', bg: 'var(--surface-warning)' },
  error: { icon: XCircle, color: 'var(--risk-critical)', bg: 'var(--surface-critical)' },
};

export default function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead, clearNotifications } = useAppStore();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const formatTime = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={['top-navbar-icon-button', 'notification-bell-trigger', open ? 'active' : ''].join(' ')}
        aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Open notifications'}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="notification-bell-badge"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-[380px] max-w-[calc(100vw-24px)] rounded-2xl overflow-hidden z-50"
            style={{
              background: 'var(--surface-overlay-strong)',
              border: '1px solid var(--border-subtle)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: '1px solid var(--border-subtle)' }}
            >
              <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 text-xs font-normal" style={{ color: 'var(--color-accent-500)' }}>
                    {unreadCount} new
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="p-1.5 rounded-lg transition-colors hover:bg-[var(--surface-muted)]"
                    title="Mark all read"
                  >
                    <CheckCheck size={14} style={{ color: 'var(--color-text-muted)' }} />
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearNotifications}
                    className="p-1.5 rounded-lg transition-colors hover:bg-[var(--surface-muted)]"
                    title="Clear all"
                  >
                    <Trash2 size={14} style={{ color: 'var(--color-text-muted)' }} />
                  </button>
                )}
              </div>
            </div>

            {/* Notifications list */}
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 && (
                <div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  No notifications yet
                </div>
              )}
              {notifications.map((n) => {
                const config = typeConfig[n.type];
                const Icon = config.icon;
                return (
                  <button
                    key={n.id}
                    onClick={() => markNotificationRead(n.id)}
                    className="w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--surface-muted)]"
                    style={{
                      background: n.read ? 'transparent' : 'var(--accent-soft)',
                      borderBottom: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: config.bg }}
                    >
                      <Icon size={14} style={{ color: config.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                          {n.title}
                        </span>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--color-accent-500)' }} />
                        )}
                      </div>
                      <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                        {n.message}
                      </p>
                      <span className="text-xs mt-2 block" style={{ color: 'var(--color-text-muted)' }}>
                        {formatTime(n.timestamp)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
