import React, { useRef, useState, useEffect } from 'react';
import './Settings.css';
import { translations } from '../translations';
import type { Language } from '../translations';
import { User, Home, Bell, Shield, CreditCard, Loader } from 'lucide-react';
import { getProfile } from '../api/auth';
import { uploadAvatar } from '../api/files';
import { BACKEND_ORIGIN } from '../api/client';

const navIconSize = 18;

interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: string;
  avatar: string | null;
}

interface SettingsProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  currentUser?: AuthUser | null;
  onUserUpdate?: (user: AuthUser) => void;
}

const buildAvatarUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${BACKEND_ORIGIN}${path}`;
};

const Settings: React.FC<SettingsProps> = ({ lang, onLanguageChange, currentUser, onUserUpdate }) => {
  const t = translations[lang].settings;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<AuthUser | null>(currentUser ?? null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    buildAvatarUrl(currentUser?.avatar)
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Load profile from API on mount
  useEffect(() => {
    getProfile()
      .then((user) => {
        setProfile(user);
        setAvatarPreview(buildAvatarUrl(user.avatar));
      })
      .catch(() => {
        // keep currentUser if API fails (offline)
      });
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    setUploadError(null);

    try {
      const { avatarUrl } = await uploadAvatar(file);

      const fullUrl = buildAvatarUrl(avatarUrl) ?? avatarUrl;
      setAvatarPreview(fullUrl);

      // Persist to localStorage so avatar survives reload / re-login
      const savedRaw = localStorage.getItem('currentUser');
      if (savedRaw) {
        try {
          const saved = JSON.parse(savedRaw) as AuthUser;
          saved.avatar = avatarUrl;
          localStorage.setItem('currentUser', JSON.stringify(saved));
        } catch {
          // ignore parse errors
        }
      }

      if (profile) {
        const updated = { ...profile, avatar: avatarUrl };
        setProfile(updated);
        onUserUpdate?.(updated);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload thất bại';
      setUploadError(msg);
      // Revert preview on failure
      setAvatarPreview(buildAvatarUrl(profile?.avatar));
    } finally {
      setUploading(false);
      // Reset file input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
  };

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
            <div className="profile-edit-header">
              <div className="settings-avatar-big">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="avatar"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                  />
                ) : (
                  <User size={32} strokeWidth={2} />
                )}
              </div>
              <div className="avatar-actions">
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <button
                  className="btn-upload"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <><Loader size={14} className="spin-icon" style={{ marginRight: 4 }} />{lang === 'vn' ? 'Đang tải...' : 'Uploading...'}</>
                  ) : (
                    lang === 'vn' ? 'Tải ảnh mới' : 'Upload New Photo'
                  )}
                </button>
                <button className="btn-remove" onClick={handleRemoveAvatar} disabled={uploading}>
                  {lang === 'vn' ? 'Xóa' : 'Remove'}
                </button>
              </div>
            </div>
            {uploadError && (
              <p style={{ color: '#e53e3e', fontSize: '0.85rem', marginTop: 4 }}>{uploadError}</p>
            )}
            <div className="settings-form">
               <div className="form-row">
                  <div className="form-group">
                     <label>{t.fullName}</label>
                     <input type="text" defaultValue={profile?.fullName ?? 'Admin User'} readOnly />
                  </div>
                  <div className="form-group">
                     <label>{t.email}</label>
                     <input type="email" defaultValue={profile?.email ?? ''} readOnly />
                  </div>
               </div>
               <div className="form-group">
                  <label>{t.role}</label>
                  <input type="text" defaultValue={profile?.role ?? ''} readOnly />
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
