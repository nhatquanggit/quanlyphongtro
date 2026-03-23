import { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar.tsx';
import Header from './components/Header.tsx';
import DashboardContent from './components/DashboardContent.tsx';
import RoomManagement from './components/RoomManagement.tsx';
import TenantManagement from './components/TenantManagement.tsx';
import ContractManagement from './components/ContractManagement.tsx';
import InvoiceManagement from './components/InvoiceManagement.tsx';
import Reports from './components/Reports.tsx';
import Maintenance from './components/Maintenance.tsx';
import Settings from './components/Settings.tsx';
import LandingPage from './components/LandingPage.tsx';
import AuthLoginPage, { type LoginApiResponse } from './components/AuthLoginPage.tsx';
import TenantPortal from './components/TenantPortal.tsx';
import ChatBox from './components/ChatBox.tsx';
import AdminChat from './components/AdminChat.tsx';
import type { Language } from './translations.ts';
import { translations } from './translations.ts';
import { getProperties } from './api/properties.ts';
import { createRoom } from './api/rooms.ts';
import { createTenant } from './api/tenants.ts';
import { generateInvoices } from './api/invoices.ts';

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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [lang, setLang] = useState<Language>('vn');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<'landing' | 'login'>('landing');
  const [loginInitialMode, setLoginInitialMode] = useState<'login' | 'signup'>('login');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isSubmittingModal, setIsSubmittingModal] = useState(false);

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
            <form
              className="dashboard-form"
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const formData = new FormData(form);

                try {
                  setIsSubmittingModal(true);
                  const properties = await getProperties();
                  const propertyId = properties[0]?.id;

                  if (!propertyId) {
                    alert(lang === 'vn' ? 'Không tìm thấy property để tạo dữ liệu.' : 'No property found for creating data.');
                    return;
                  }

                  if (isRoom) {
                    const typeMap = {
                      single: 'SINGLE',
                      double: 'DOUBLE',
                      studio: 'STUDIO',
                    } as const;

                    const roomTypeRaw = String(formData.get('roomType') || 'single') as keyof typeof typeMap;
                    const priceRaw = String(formData.get('price') || '0').replace(/[^\d.-]/g, '');
                    const depositRaw = String(formData.get('deposit') || '0').replace(/[^\d.-]/g, '');

                    await createRoom({
                      propertyId,
                      roomNumber: String(formData.get('roomNumber') || '').trim(),
                      floor: Number(formData.get('floor') || 1),
                      type: typeMap[roomTypeRaw] || 'SINGLE',
                      price: Number(priceRaw || 0),
                      deposit: Number(depositRaw || 0),
                    });
                  } else {
                    await createTenant({
                      propertyId,
                      fullName: String(formData.get('tenantName') || '').trim(),
                      phone: String(formData.get('phone') || '').trim(),
                      idCard: String(formData.get('idCard') || '').trim(),
                    });
                  }

                  closeModal();
                  alert(lang === 'vn' ? 'Lưu thành công.' : 'Saved successfully.');
                } catch (err) {
                  const message = err instanceof Error ? err.message : 'Failed to save';
                  alert(message);
                } finally {
                  setIsSubmittingModal(false);
                }
              }}
            >
              {isRoom ? (
                <>
                  <div className="form-group-row">
                    <div className="form-group">
                      <label>{tForm.roomNum}</label>
                      <input type="text" name="roomNumber" placeholder="e.g. 101" required />
                    </div>
                    <div className="form-group">
                      <label>{tForm.floor}</label>
                      <input type="number" name="floor" placeholder="1" required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>{tForm.type}</label>
                    <select name="roomType" required>
                      <option value="single">Single Room</option>
                      <option value="double">Double Room</option>
                      <option value="studio">Studio</option>
                    </select>
                  </div>
                  <div className="form-group-row">
                    <div className="form-group">
                      <label>{tForm.price}</label>
                      <input type="text" name="price" placeholder="5,000,000" required />
                    </div>
                    <div className="form-group">
                      <label>{tForm.deposit}</label>
                      <input type="text" name="deposit" placeholder="5,000,000" required />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label>{tForm.tenantName}</label>
                    <input type="text" name="tenantName" placeholder="Nguyen Van A" required />
                  </div>
                  <div className="form-group">
                    <label>{tForm.idCard}</label>
                    <input type="text" name="idCard" placeholder="0123456789XX" required />
                  </div>
                  <div className="form-group-row">
                    <div className="form-group">
                      <label>{tForm.phone}</label>
                      <input type="tel" name="phone" placeholder="090 123 4567" required />
                    </div>
                    <div className="form-group">
                      <label>{tForm.room}</label>
                      <select required className="scrollable-select" disabled>
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
                    <input type="date" disabled />
                  </div>
                </>
              )}
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={closeModal}>{tForm.cancel}</button>
                <button type="submit" className="btn-submit" disabled={isSubmittingModal}>
                  {isSubmittingModal ? (lang === 'vn' ? 'Đang lưu...' : 'Saving...') : tForm.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const handleAction = (action: string) => {
    if (['dashboard', 'room-management', 'tenants', 'contracts', 'invoices', 'reports', 'maintenance', 'chat', 'settings'].includes(action)) {
      setActivePage(action);
      setMobileSidebarOpen(false);
      return;
    }

    if (action === 'new-room' || action === 'new-tenant') {
      setActiveModal(action);
    } else if (action === 'gen-invoices') {
      const run = async () => {
        try {
          const properties = await getProperties();
          const propertyId = properties[0]?.id;
          if (!propertyId) {
            alert(lang === 'vn' ? 'Không tìm thấy property để tạo hóa đơn.' : 'No property found to generate invoices.');
            return;
          }

          const now = new Date();
          const billingMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
          const dueDate = new Date(now.getFullYear(), now.getMonth() + 1, 5, 12, 0, 0).toISOString();
          await generateInvoices(propertyId, billingMonth, dueDate);
          alert(lang === 'vn' ? 'Đã tạo hóa đơn thành công.' : 'Invoices generated successfully.');
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to generate invoices';
          alert(message);
        }
      };

      void run();
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
      case 'contracts': return <ContractManagement lang={lang} />;
      case 'invoices': return <InvoiceManagement lang={lang} />;
      case 'reports': return <Reports lang={lang} />;
      case 'maintenance': return <Maintenance lang={lang} />;
      case 'settings': return <Settings lang={lang} onLanguageChange={setLang} currentUser={currentUser} onUserUpdate={(u) => {
        setCurrentUser(u);
        localStorage.setItem('currentUser', JSON.stringify(u));
      }} />;
      case 'chat': return <AdminChat lang={lang} userId={currentUser?.id ?? ''} userName={currentUser?.fullName ?? 'Admin'} />;
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
    return (
      <>
        <TenantPortal
          lang={lang}
          onLogout={handleLogout}
          currentUser={currentUser}
          onUserUpdate={(u) => {
            setCurrentUser(u);
            localStorage.setItem('currentUser', JSON.stringify(u));
          }}
          onLangChange={setLang}
        />
        <ChatBox lang={lang} userId={currentUser?.id ?? ''} userName={currentUser?.fullName ?? ''} />
      </>
    );
  }

  // If user is ADMIN, show Admin Dashboard
  return (
    <div className="app-layout">
      {renderModal()}
      <Sidebar
        activePage={activePage}
        onNavigate={(page) => {
          setActivePage(page);
          setMobileSidebarOpen(false);
        }}
        lang={lang}
        onLogout={handleLogout}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />
      <div
        className={`mobile-sidebar-backdrop ${mobileSidebarOpen ? 'show' : ''}`}
        onClick={() => setMobileSidebarOpen(false)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setMobileSidebarOpen(false);
          }
        }}
      />
      <div className="main-content">
        <Header
          activePage={activePage}
          lang={lang}
          onAction={handleAction}
          currentUser={currentUser}
          onToggleSidebar={() => setMobileSidebarOpen((prev) => !prev)}
        />
        {renderContent()}
      </div>
    </div>
  );
}

export default App;
