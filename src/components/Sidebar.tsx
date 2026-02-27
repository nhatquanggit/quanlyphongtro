import React from 'react';
import './Sidebar.css';
import { translations } from '../translations';
import type { Language } from '../translations';
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  BarChart3,
  Wrench,
  Settings,
  LogOut,
  HelpCircle,
} from 'lucide-react';

const iconSize = 20;

const navItems: { key: string; Icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }> }[] = [
  { key: 'dashboard', Icon: LayoutDashboard },
  { key: 'room-management', Icon: Building2 },
  { key: 'tenants', Icon: Users },
  { key: 'invoices', Icon: FileText },
  { key: 'reports', Icon: BarChart3 },
  { key: 'maintenance', Icon: Wrench },
];

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  lang: Language;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate, lang }) => {
  const t = translations[lang].sidebar;
  return (
    <aside className="sidebar">
      <div className="sidebar__top">
        <div className="sidebar__brand">
          <div className="sidebar__logo-box">
            <Building2 size={22} color="white" strokeWidth={2.5} />
          </div>
          <div>
            <div className="sidebar__title">Property Pro</div>
            <div className="sidebar__subtitle">Admin Portal</div>
          </div>
        </div>
        <nav className="sidebar__nav">
          <ul>
            {navItems.map(({ key, Icon }) => (
              <li
                key={key}
                className={activePage === key ? 'active' : ''}
                onClick={() => onNavigate(key)}
              >
                <span className="sidebar__icon">
                  <Icon size={iconSize} strokeWidth={2} />
                </span>
                <span>
                  {key === 'dashboard' && t.dashboard}
                  {key === 'room-management' && t.rooms}
                  {key === 'tenants' && t.tenants}
                  {key === 'invoices' && t.invoices}
                  {key === 'reports' && t.reports}
                  {key === 'maintenance' && t.maintenance}
                </span>
              </li>
            ))}
          </ul>
        </nav>

        {activePage === 'room-management' && (
          <div className="sidebar__filters">
            <div className="filter-group">
              <div className="filter-title">{lang === 'vn' ? 'LOẠI PHÒNG' : 'ROOM TYPE'}</div>
              <label><input type="checkbox" defaultChecked /> {lang === 'vn' ? 'Đơn' : 'Single'}</label>
              <label><input type="checkbox" defaultChecked /> {lang === 'vn' ? 'Đôi' : 'Double'}</label>
              <label><input type="checkbox" /> VIP</label>
              <label><input type="checkbox" /> Studio</label>
            </div>
            <div className="filter-group">
              <div className="filter-title">{lang === 'vn' ? 'TRẠNG THÁI' : 'STATUS'}</div>
              <label><input type="radio" name="status" defaultChecked /> {lang === 'vn' ? 'Tất cả phòng' : 'All Rooms'}</label>
              <label><input type="radio" name="status" /> {lang === 'vn' ? 'Đã thuê' : 'Occupied'}</label>
              <label><input type="radio" name="status" /> {lang === 'vn' ? 'Trống' : 'Vacant'}</label>
            </div>
          </div>
        )}

        {activePage === 'tenants' && (
          <div className="sidebar__filters">
            <div className="filter-group">
              <div className="filter-title">{lang === 'vn' ? 'BỘ LỌC NHANH' : 'QUICK FILTERS'}</div>
              <label><input type="checkbox" defaultChecked /> {lang === 'vn' ? 'HĐ hoạt động' : 'Active Leases'}</label>
              <label><input type="checkbox" /> {lang === 'vn' ? 'Sắp hết hạn' : 'Ending Soon'}</label>
              <label><input type="checkbox" /> {lang === 'vn' ? 'Khách cũ' : 'Past Tenants'}</label>
            </div>
          </div>
        )}

        {activePage === 'invoices' && (
          <div className="sidebar__filters">
            <div className="filter-group">
              <div className="filter-title">{lang === 'vn' ? 'TRẠNG THÁI THANH TOÁN' : 'PAYMENT STATUS'}</div>
              <label><input type="checkbox" defaultChecked /> {lang === 'vn' ? 'Đã thanh toán' : 'Paid'}</label>
              <label><input type="checkbox" defaultChecked /> {lang === 'vn' ? 'Chưa thanh toán' : 'Unpaid'}</label>
              <label><input type="checkbox" defaultChecked /> {lang === 'vn' ? 'Thanh toán 1 phần' : 'Partially Paid'}</label>
            </div>
          </div>
        )}

        {activePage === 'reports' && (
          <div className="sidebar__filters">
            <div className="filter-group">
              <div className="filter-title">{lang === 'vn' ? 'DANH MỤC BÁO CÁO' : 'REPORT CATEGORIES'}</div>
              <label><input type="radio" name="cat" defaultChecked /> {lang === 'vn' ? 'Tóm tắt tài chính' : 'Financial Summary'}</label>
              <label><input type="radio" name="cat" /> {lang === 'vn' ? 'Xu hướng lấp đầy' : 'Occupancy Trends'}</label>
              <label><input type="radio" name="cat" /> {lang === 'vn' ? 'Chi phí bảo trì' : 'Maintenance Costs'}</label>
            </div>
          </div>
        )}
      </div>

      <div className="sidebar__bottom">
        <div className={`sidebar__settings ${activePage === 'settings' ? 'active' : ''}`} onClick={() => onNavigate('settings')}>
          <span className="sidebar__icon"><Settings size={iconSize} strokeWidth={2} /></span>
          <span>{t.settings}</span>
        </div>
        <div className="sidebar__support">
          <span className="sidebar__icon"><HelpCircle size={iconSize} strokeWidth={2} /></span>
          <span>{lang === 'vn' ? 'Hỗ trợ' : 'Support'}</span>
        </div>
        <div className="sidebar__logout">
          <span className="sidebar__icon"><LogOut size={iconSize} strokeWidth={2} /></span>
          <span>{lang === 'vn' ? 'Đăng xuất' : 'Logout'}</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
