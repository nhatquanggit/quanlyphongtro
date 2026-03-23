import React from 'react';
import './Header.css';
import { translations } from '../translations';
import type { Language } from '../translations';
import { Search, Calendar, UserPlus, Home, FilePlus, Bell, ChevronDown, User, Menu } from 'lucide-react';
import { BACKEND_ORIGIN } from '../api/client';
import {
  getNotifications,
  getUnreadCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type NotificationItem,
} from '../api/notifications';

const iconSize = 18;

interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: string;
  avatar: string | null;
}

interface HeaderProps {
  activePage: string;
  lang: Language;
  onAction: (action: string) => void;
  currentUser?: AuthUser | null;
  onToggleSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = ({ activePage, lang, onAction, currentUser, onToggleSidebar }) => {
  const t = translations[lang].header;
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [notificationOpen, setNotificationOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [loadingNotifications, setLoadingNotifications] = React.useState(false);
  const [now, setNow] = React.useState(new Date());
  const notificationRef = React.useRef<HTMLDivElement | null>(null);

  const loadUnread = React.useCallback(async () => {
    try {
      const data = await getUnreadCount();
      setUnreadCount(data.unread ?? 0);
    } catch {
      // Ignore notification errors to avoid breaking header interactions.
    }
  }, []);

  const loadNotifications = React.useCallback(async () => {
    try {
      setLoadingNotifications(true);
      const [items, unread] = await Promise.all([getNotifications(12), getUnreadCount()]);
      setNotifications(items);
      setUnreadCount(unread.unread ?? 0);
    } catch {
      // Ignore notification errors to keep the dashboard usable.
    } finally {
      setLoadingNotifications(false);
    }
  }, []);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  React.useEffect(() => {
    void loadUnread();
    const timer = setInterval(() => {
      void loadUnread();
    }, 30000);
    return () => clearInterval(timer);
  }, [loadUnread]);

  React.useEffect(() => {
    if (!notificationOpen) return;
    void loadNotifications();
  }, [notificationOpen, loadNotifications]);

  React.useEffect(() => {
    const onDocMouseDown = (event: MouseEvent) => {
      if (!notificationRef.current) return;
      if (!notificationRef.current.contains(event.target as Node)) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, []);

  const getTitle = () => {
    if (activePage === 'dashboard') return t.adminDash;
    if (activePage === 'room-management') return t.roomDash;
    if (activePage === 'tenants') return t.tenantDash;
    if (activePage === 'contracts') return t.contractDash;
    if (activePage === 'invoices') return t.invoiceDash;
    if (activePage === 'reports') return t.reportDash;
    if (activePage === 'maintenance') return t.maintDash;
    if (activePage === 'chat') return t.chatDash;
    if (activePage === 'settings') return t.settingsDash;
    return 'Dashboard';
  };

  const handleAction = (action: string) => {
    setDropdownOpen(false);
    onAction(action);
  };

  const mapLinkToPage = (link?: string) => {
    if (!link) return null;
    if (link.includes('/maintenance')) return 'maintenance';
    if (link.includes('/chat')) return 'chat';
    if (link.includes('/room-management')) return 'room-management';
    if (link.includes('/invoices')) return 'invoices';
    if (link.includes('/contracts')) return 'contracts';
    if (link.includes('/tenants')) return 'tenants';
    if (link.includes('/reports')) return 'reports';
    return null;
  };

  const handleNotificationClick = async (item: NotificationItem) => {
    if (!item.isRead) {
      setNotifications((prev) => prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
      try {
        await markNotificationAsRead(item.id);
      } catch {
        // Do not block navigation when mark-as-read API fails.
      }
    }

    const page = mapLinkToPage(item.link);
    if (page) {
      setNotificationOpen(false);
      onAction(page);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Ignore mark-all failures and keep panel open for retry.
    }
  };

  return (
    <header className="header">
      <button
        type="button"
        className="header__mobile-menu"
        onClick={onToggleSidebar}
        aria-label={lang === 'vn' ? 'Mở menu' : 'Open menu'}
      >
        <Menu size={20} strokeWidth={2.2} />
      </button>
      <div className="header__title-container">
        <div className="header__title">{getTitle()}</div>
      </div>
      <div className="header__search-container">
        <Search className="header__search-icon" size={iconSize} strokeWidth={2} />
        <input className="header__search" placeholder={t.search} />
      </div>
      <div className="header__meta">
        <div className="header__date">
          <Calendar size={iconSize} strokeWidth={2} />
          <span>{new Intl.DateTimeFormat(lang === 'vn' ? 'vi-VN' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' }).format(now)}</span>
        </div>

        <div className="dropdown-wrapper">
          <button
            className={`header__action ${dropdownOpen ? 'active' : ''}`}
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            {t.quickAction}
            <ChevronDown className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`} size={14} style={{ marginLeft: 6 }} />
          </button>

          {dropdownOpen && (
            <div className="dropdown-menu header-dropdown">
              <button className="dropdown-item" onClick={() => handleAction('new-tenant')}>
                <UserPlus size={iconSize} strokeWidth={2} className="item-icon" />
                {t.newTenant}
              </button>
              <button className="dropdown-item" onClick={() => handleAction('new-room')}>
                <Home size={iconSize} strokeWidth={2} className="item-icon" />
                {t.newRoom}
              </button>
              <button className="dropdown-item" onClick={() => handleAction('gen-invoices')}>
                <FilePlus size={iconSize} strokeWidth={2} className="item-icon" />
                {t.genInvoices}
              </button>
            </div>
          )}
        </div>

        <div className="header__notification-wrap" ref={notificationRef}>
          <button
            type="button"
            className={`header__notification ${notificationOpen ? 'active' : ''}`}
            onClick={() => setNotificationOpen((prev) => !prev)}
            aria-label="Notifications"
          >
            <Bell size={iconSize} className="header__icon-bell" strokeWidth={2} />
            {unreadCount > 0 && <span className="header__notification-dot" />}
            {unreadCount > 0 && <span className="header__notification-count">{Math.min(unreadCount, 99)}</span>}
          </button>

          {notificationOpen && (
            <div className="header__notification-panel">
              <div className="header__notification-head">
                <span>{lang === 'vn' ? 'Thông báo' : 'Notifications'}</span>
                <button type="button" className="header__mark-all" onClick={() => { void handleMarkAllAsRead(); }}>
                  {lang === 'vn' ? 'Đánh dấu đã đọc' : 'Mark all read'}
                </button>
              </div>

              <div className="header__notification-list">
                {loadingNotifications ? (
                  <div className="header__notification-empty">{lang === 'vn' ? 'Đang tải...' : 'Loading...'}</div>
                ) : notifications.length === 0 ? (
                  <div className="header__notification-empty">{lang === 'vn' ? 'Chưa có thông báo' : 'No notifications yet'}</div>
                ) : (
                  notifications.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      className={`header__notification-item ${item.isRead ? '' : 'unread'}`}
                      onClick={() => { void handleNotificationClick(item); }}
                    >
                      <div className="header__notification-item-title">{item.title}</div>
                      <div className="header__notification-item-message">{item.message}</div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        <div className="header__profile">
          {currentUser?.avatar ? (
            <img
              src={currentUser.avatar.startsWith('http') ? currentUser.avatar : `${BACKEND_ORIGIN}${currentUser.avatar}`}
              alt="avatar"
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <User size={22} strokeWidth={2} />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
