import { useState } from 'react';
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
import type { Language } from './translations.ts';
import { translations } from './translations.ts';

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [lang, setLang] = useState<Language>('vn');
  const [activeModal, setActiveModal] = useState<string | null>(null);

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

  return (
    <div className="app-layout">
      {renderModal()}
      <Sidebar activePage={activePage} onNavigate={setActivePage} lang={lang} />
      <div className="main-content">
        <Header activePage={activePage} lang={lang} onAction={handleAction} />
        {renderContent()}
      </div>
    </div>
  );
}

export default App;
