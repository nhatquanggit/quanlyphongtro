import React from 'react';
import './Header.css';
import { translations } from '../translations';
import type { Language } from '../translations';
import { Search, Calendar, UserPlus, Home, FilePlus, Bell, ChevronDown } from 'lucide-react';

const iconSize = 18;

interface HeaderProps {
  activePage: string;
  lang: Language;
  onAction: (action: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activePage, lang, onAction }) => {
  const t = translations[lang].header;
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [now, setNow] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const getTitle = () => {
    if (activePage === 'dashboard') return t.adminDash;
    if (activePage === 'room-management') return t.roomDash;
    if (activePage === 'tenants') return t.tenantDash;
    if (activePage === 'invoices') return t.invoiceDash;
    if (activePage === 'reports') return t.reportDash;
    if (activePage === 'maintenance') return t.maintDash;
    if (activePage === 'chat') return (t as any).chatDash ?? 'Chat';
    if (activePage === 'settings') return t.settingsDash;
    return 'Dashboard';
  };

  const handleAction = (action: string) => {
    setDropdownOpen(false);
    onAction(action);
  };

  return (
    <header className="header">
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

        <div className="header__notification">
          <Bell size={iconSize} className="header__icon-bell" strokeWidth={2} />
          <span className="header__notification-dot" />
        </div>
        <div className="header__profile" />
      </div>
    </header>
  );
};

export default Header;
