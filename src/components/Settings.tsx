import React from 'react';
import './Settings.css';
import { translations } from '../translations';
import type { Language } from '../translations';
import { User, Home, Bell, Shield, CreditCard } from 'lucide-react';

const navIconSize = 18;

interface SettingsProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
}

const Settings: React.FC<SettingsProps> = ({ lang, onLanguageChange }) => {
  const t = translations[lang].settings;

  return (
    <div className="settings-container">
      <div className="settings-grid">
        {/* Left Col: Navigation / Short Sections */}
        <div className="settings-nav-col">
          <div className="card settings-nav-card">
            <div className="settings-nav-item active"><User size={navIconSize} strokeWidth={2} className="settings-nav-icon" /> {t.title}</div>
            <div className="settings-nav-item"><Home size={navIconSize} strokeWidth={2} className="settings-nav-icon" /> {t.propertyTitle}</div>
            <div className="settings-nav-item"><Bell size={navIconSize} strokeWidth={2} className="settings-nav-icon" /> {lang === 'vn' ? 'Thông báo' : 'Notifications'}</div>
            <div className="settings-nav-item"><Shield size={navIconSize} strokeWidth={2} className="settings-nav-icon" /> {lang === 'vn' ? 'Bảo mật & Quyền riêng tư' : 'Security & Privacy'}</div>
            <div className="settings-nav-item"><CreditCard size={navIconSize} strokeWidth={2} className="settings-nav-icon" /> {lang === 'vn' ? 'Thanh toán & Gói dịch vụ' : 'Billing & Plan'}</div>
          </div>
        </div>

        {/* Right Col: Main Content */}
        <div className="settings-main-col">
          {/* Profile Section */}
          <div className="card settings-section">
            <h3 className="section-title">{t.title}</h3>
            {/* ... other code remains similar ... */}
            <div className="profile-edit-header">
               <div className="settings-avatar-big"><User size={32} strokeWidth={2} /></div>
               <div className="avatar-actions">
                  <button className="btn-upload">{lang === 'vn' ? 'Tải ảnh mới' : 'Upload New Photo'}</button>
                  <button className="btn-remove">{lang === 'vn' ? 'Xóa' : 'Remove'}</button>
               </div>
            </div>
            <div className="settings-form">
               <div className="form-row">
                  <div className="form-group">
                     <label>{t.fullName}</label>
                     <input type="text" defaultValue="Admin User" />
                  </div>
                  <div className="form-group">
                     <label>{t.email}</label>
                     <input type="email" defaultValue="admin@propertypro.com" />
                  </div>
               </div>
               <div className="form-group">
                  <label>{t.role}</label>
                  <input type="text" defaultValue="Head Property Manager" />
               </div>
            </div>
          </div>

          {/* Property Section */}
          <div className="card settings-section">
            <h3 className="section-title">{t.propertyTitle}</h3>
            <div className="settings-form">
               <div className="form-group">
                  <label>{t.propertyName}</label>
                  <input type="text" defaultValue="Green View Apartments" />
               </div>
               <div className="form-row">
                  <div className="form-group">
                     <label>{t.currency}</label>
                     <select>
                        <option>USD ($)</option>
                        <option>VND (₫)</option>
                        <option>EUR (€)</option>
                     </select>
                  </div>
                  <div className="form-group">
                     <label>{t.timezone}</label>
                     <select>
                        <option>(GMT+07:00) Bangkok, Hanoi</option>
                     </select>
                  </div>
               </div>
               <div className="form-group">
                  <label>{t.lang}</label>
                  <select value={lang} onChange={(e) => onLanguageChange(e.target.value as Language)}>
                     <option value="en">English (UK/US)</option>
                     <option value="vn">Tiếng Việt</option>
                     <option value="zh">中文 (Chinese)</option>
                  </select>
               </div>
            </div>
          </div>

          {/* Toggles Section */}
          <div className="card settings-section">
            <h3 className="section-title">{t.prefTitle}</h3>
            <div className="toggle-list">
               <div className="toggle-item">
                  <div className="toggle-info">
                     <div className="toggle-label">{t.autoRemind}</div>
                     <div className="toggle-desc">{lang === 'vn' ? 'Tự động nhắc nhở khách thuê 3 ngày trước hạn thanh toán.' : 'Automatically notify tenants 3 days before due date.'}</div>
                  </div>
                  <label className="switch">
                     <input type="checkbox" defaultChecked />
                     <span className="slider round"></span>
                  </label>
               </div>
               <div className="toggle-item">
                  <div className="toggle-info">
                     <div className="toggle-label">{t.maintSms}</div>
                     <div className="toggle-desc">{lang === 'vn' ? 'Nhận thông báo SMS cho các sự cố ưu tiên cao.' : 'Get SMS notification for high-priority issues.'}</div>
                  </div>
                  <label className="switch">
                     <input type="checkbox" />
                     <span className="slider round"></span>
                  </label>
               </div>
               <div className="toggle-item">
                  <div className="toggle-info">
                     <div className="toggle-label">{t.twoFactor}</div>
                     <div className="toggle-desc">{lang === 'vn' ? 'Thêm lớp bảo mật bổ sung cho tài khoản của bạn.' : 'Add an extra layer of security to your account.'}</div>
                  </div>
                  <label className="switch">
                     <input type="checkbox" defaultChecked />
                     <span className="slider round"></span>
                  </label>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
