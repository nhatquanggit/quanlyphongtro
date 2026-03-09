import { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar.tsx';
import Header from './components/Header.tsx';
import DashboardContent from './components/DashboardContent.tsx';
import RoomManagement from './components/RoomManagement.tsx';
import TenantManagement from './components/TenantManagement.tsx';
import InvoiceManagement from './components/InvoiceManagement.tsx';
import Reports from './components/Reports.tsx';
import Maintenance from './components/Maintenance.tsx';
import Settings from './components/Settings.tsx';
import LandingPage from './components/LandingPage.tsx';
import AuthLoginPage, { type LoginApiResponse } from './components/AuthLoginPage.tsx';
import TenantPortal from './components/TenantPortal.tsx';
import type { Language } from './translations.ts';
import { translations } from './translations.ts';

interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: string;
  avatar: string | null;
}

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [lang, setLang] = useState<Language>('vn');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<'landing' | 'login'>('landing');
  const [loginInitialMode, setLoginInitialMode] = useState<'login' | 'signup'>('login');
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const savedUser = localStorage.getItem('currentUser');
    
    if (token && savedUser) {
      try {
        const user = JSON.parse(savedUser) as User;
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Failed to parse saved user', err);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const closeModal = () => setActiveModal(null);

  const tHeader = (translations[lang] as any).header;
  
  const tForm = {
    vn: {
      roomNum: 'Số phòng',
      floor: 'Tầng',
      type: 'Loại phòng',
      price: 'Giá thuê',
      deposit: 'Tiền cọc',
      save: 'Lưu thông tin',
      cancel: 'Hủy',
      tenantName: 'Họ và tên khách',
      phone: 'Số điện thoại',
      idCard: 'Số CCCD/Passport',
      startDate: 'Ngày bắt đầu',
      room: 'Chọn phòng'
    },
    en: {
      roomNum: 'Room Number',
      floor: 'Floor',
      type: 'Room Type',
      price: 'Monthly Price',
      deposit: 'Security Deposit',
      save: 'Save Information',
      cancel: 'Cancel',
      tenantName: 'Full Name',
      phone: 'Phone Number',
      idCard: 'ID Card / Passport',
      startDate: 'Start Date',
      room: 'Select Room'
    }
  }[lang === 'vn' ? 'vn' : 'en'];

  const renderModal = () => {
    if (!activeModal) return null;
    const isRoom = activeModal === 'new-room';

    return (
      <div className="modal-overlay" onClick={closeModal}>
        <div className="modal-container" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3>{isRoom ? tHeader.newRoom : tHeader.newTenant}</h3>
            <button className="close-btn" onClick={closeModal}>&times;</button>
          </div>
          <div className="modal-body">
            <form className="dashboard-form" onSubmit={(e) => { e.preventDefault(); alert('Saved!'); closeModal(); }}>
              {isRoom ? (
                <>
                  <div className="form-group-row">
                    <div className="form-group">
                      <label>{tForm.roomNum}</label>
                      <input type="text" placeholder="e.g. 101" required />
                    </div>
                    <div className="form-group">
                      <label>{tForm.floor}</label>
                      <input type="number" placeholder="1" required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>{tForm.type}</label>
                    <select required>
                      <option value="single">Single Room</option>
                      <option value="double">Double Room</option>
                      <option value="studio">Studio</option>
                    </select>
                  </div>
                  <div className="form-group-row">
                    <div className="form-group">
                      <label>{tForm.price}</label>
                      <input type="text" placeholder="5,000,000" required />
                    </div>
                    <div className="form-group">
                      <label>{tForm.deposit}</label>
                      <input type="text" placeholder="5,000,000" required />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label>{tForm.tenantName}</label>
                    <input type="text" placeholder="Nguyen Van A" required />
                  </div>
                  <div className="form-group">
                    <label>{tForm.idCard}</label>
                    <input type="text" placeholder="0123456789XX" required />
                  </div>
                  <div className="form-group-row">
                    <div className="form-group">
                      <label>{tForm.phone}</label>
                      <input type="tel" placeholder="090 123 4567" required />
                    </div>
                    <div className="form-group">
                      <label>{tForm.room}</label>
                      <select required className="scrollable-select">
                        <option value="">-- {tForm.room} --</option>
                        {Array.from({ length: 200 }, (_, i) => {
                          const roomNum = 1 + i;
                          return (
                            <option key={roomNum} value={roomNum}>
                              {lang === 'vn' ? `Phòng ${roomNum}` : `Room ${roomNum}`}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>{tForm.startDate}</label>
                    <input type="date" required />
                  </div>
                </>
              )}
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={closeModal}>{tForm.cancel}</button>
                <button type="submit" className="btn-submit">{tForm.save}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const handleAction = (action: string) => {
    if (action === 'new-room' || action === 'new-tenant') {
      setActiveModal(action);
    } else if (action === 'gen-invoices') {
      alert('Generating invoices...');
    }
  };

  const handleShowLogin = (mode: 'login' | 'signup') => {
    setAuthView('login');
    setLoginInitialMode(mode);
  };

  const handleLoginSuccess = (auth: LoginApiResponse) => {
    console.info('Logged in user', auth.user);
    setCurrentUser(auth.user);
    setIsAuthenticated(true);
    setAuthView('landing');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setActivePage('dashboard');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
  };

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard': return <DashboardContent lang={lang} onNavigate={setActivePage} />;
      case 'room-management': return <RoomManagement lang={lang} />;
      case 'tenants': return <TenantManagement lang={lang} />;
      case 'invoices': return <InvoiceManagement lang={lang} />;
      case 'reports': return <Reports lang={lang} />;
      case 'maintenance': return <Maintenance lang={lang} />;
      case 'settings': return <Settings lang={lang} onLanguageChange={setLang} />;
      default: return <DashboardContent lang={lang} onNavigate={setActivePage} />;
    }
  };

  if (!isAuthenticated) {
    if (authView === 'login') {
      return (
        <AuthLoginPage
          lang={lang}
          onLoginSuccess={handleLoginSuccess}
          onBackToLanding={() => setAuthView('landing')}
          initialMode={loginInitialMode}
        />
      );
    }

    return (
      <LandingPage
        lang={lang}
        onLoginClick={() => handleShowLogin('login')}
        onSignUpClick={() => handleShowLogin('signup')}
      />
    );
  }

  // Check user role and render appropriate interface
  const isAdmin = currentUser?.role === 'ADMIN';

  // If user is TENANT, show Tenant Portal
  if (!isAdmin) {
    return <TenantPortal lang={lang} onLogout={handleLogout} />;
  }

  // If user is ADMIN, show Admin Dashboard
  return (
    <div className="app-layout">
      {renderModal()}
      <Sidebar activePage={activePage} onNavigate={setActivePage} lang={lang} onLogout={handleLogout} />
      <div className="main-content">
        <Header activePage={activePage} lang={lang} onAction={handleAction} />
        {renderContent()}
      </div>
    </div>
  );
}

export default App;
