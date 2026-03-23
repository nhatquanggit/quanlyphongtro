import { useState, useEffect, useRef, useCallback } from 'react';
import './TenantPortal.css';
import type { Language } from '../translations';
import { getProfile, type AuthUser } from '../api/auth';
import { getContracts, getPrintableContract, type Contract } from '../api/contracts';
import { getInvoices, type Invoice } from '../api/invoices';
import { getMaintenanceList, createMaintenance, type MaintenanceItem } from '../api/maintenance';
import { getRooms, type Room } from '../api/rooms';
import { BACKEND_ORIGIN, apiRequest } from '../api/client';
import { CHAT_WS_URL } from '../api/realtime';

type TenantPageKey = 'dashboard' | 'bills' | 'maintenance' | 'profile' | 'rooms';

interface TenantPortalProps {
  lang: Language;
  onLogout: () => void;
  currentUser: AuthUser | null;
  onUserUpdate?: (user: AuthUser) => void;
  onLangChange?: (lang: Language) => void;
}

/* ── Helpers ────────────────────────────────────────── */
const fmtCurrency = (amount: number) =>
  amount.toLocaleString('vi-VN') + '₫';

const fmtDate = (iso: string | undefined | null, isVn: boolean) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(isVn ? 'vi-VN' : 'en-US', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const statusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE': case 'PAID': case 'COMPLETED': return 'positive';
    case 'PENDING': case 'UNPAID': case 'IN_PROGRESS': case 'PARTIALLY_PAID': return 'warning';
    case 'OVERDUE': case 'CANCELLED': case 'TERMINATED': case 'EXPIRED': return 'danger';
    default: return 'neutral';
  }
};

const statusLabel = (status: string, isVn: boolean) => {
  const map: Record<string, [string, string]> = {
    ACTIVE: ['Đang hoạt động', 'Active'],
    EXPIRED: ['Hết hạn', 'Expired'],
    TERMINATED: ['Đã chấm dứt', 'Terminated'],
    PAID: ['Đã thanh toán', 'Paid'],
    UNPAID: ['Chưa thanh toán', 'Unpaid'],
    PARTIALLY_PAID: ['Thanh toán một phần', 'Partial'],
    OVERDUE: ['Quá hạn', 'Overdue'],
    PENDING: ['Đang chờ', 'Pending'],
    IN_PROGRESS: ['Đang xử lý', 'In progress'],
    COMPLETED: ['Đã hoàn thành', 'Completed'],
    CANCELLED: ['Đã hủy', 'Cancelled'],
  };
  const pair = map[status];
  if (!pair) return status;
  return isVn ? pair[0] : pair[1];
};

/* ── Spinner ─────────────────────────────────────────── */
const Spinner: React.FC = () => (
  <div className="tp-spinner-wrap"><div className="tp-spinner" /></div>
);

/* ── Avatar ──────────────────────────────────────────── */
const Avatar: React.FC<{ user: AuthUser | null; size?: number; className?: string }> = ({ user, size = 32, className = '' }) => {
  const src = user?.avatar ? `${BACKEND_ORIGIN}${user.avatar}` : null;
  const initials = user ? getInitials(user.fullName || user.email || '?') : '?';
  if (src) {
    return (
      <img
        src={src}
        alt={user?.fullName ?? ''}
        className={`tp-avatar-img ${className}`}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }}
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
      />
    );
  }
  return (
    <span className={`tenant-avatar-circle ${className}`} style={{ width: size, height: size, fontSize: Math.floor(size * 0.4) }}>
      {initials}
    </span>
  );
};

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
const TenantPortal: React.FC<TenantPortalProps> = ({ lang, onLogout, currentUser: propUser, onUserUpdate, onLangChange }) => {
  const [page, setPage] = useState<TenantPageKey>('dashboard');
  const [isVn, setIsVn] = useState(lang === 'vn');
  const [user, setUser] = useState<AuthUser | null>(propUser);

  useEffect(() => { setIsVn(lang === 'vn'); }, [lang]);
  useEffect(() => { setUser(propUser); }, [propUser]);

  // Refresh profile từ API khi mount
  useEffect(() => {
    getProfile().then((u) => {
      setUser(u);
      onUserUpdate?.(u);
    }).catch(() => { /* giữ propUser */ });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleLang = () => {
    const next: Language = isVn ? 'en' : 'vn';
    setIsVn(!isVn);
    onLangChange?.(next);
  };

  const pageTitles: Record<TenantPageKey, [string, string]> = {
    dashboard: [`Chào mừng, ${user?.fullName ?? ''}!`, `Welcome, ${user?.fullName ?? ''}!`],
    bills: ['Hóa đơn & Thanh toán', 'Bills & Payments'],
    maintenance: ['Báo cáo sự cố', 'Maintenance Requests'],
    profile: ['Hồ sơ & Hợp đồng', 'Profile & Contract'],
    rooms: ['Phòng còn trống', 'Available Rooms'],
  };

  const pageSubs: Record<TenantPageKey, [string, string]> = {
    dashboard: ['Tổng quan tình trạng phòng và hóa đơn của bạn.', "Overview of your room and billing status."],
    bills: ['Xem các khoản phí và lịch sử thanh toán từ CSDL.', 'Review charges and payment history from the database.'],
    maintenance: ['Báo cáo sự cố mới hoặc theo dõi yêu cầu của bạn.', 'Report issues or track your maintenance tickets.'],
    profile: ['Thông tin cá nhân và chi tiết hợp đồng thực tế.', 'Your personal info and actual contract details.'],
    rooms: ['Xem danh sách phòng còn trống và đăng ký thuê.', 'Browse vacant rooms and send a rental request.'],
  };

  const renderContent = () => {
    switch (page) {
      case 'dashboard':   return <TenantDashboard isVn={isVn} user={user} onNavigate={setPage} />;
      case 'bills':       return <TenantBills isVn={isVn} user={user} />;
      case 'maintenance': return <TenantMaintenance isVn={isVn} user={user} />;
      case 'profile':     return <TenantProfile isVn={isVn} user={user} onUserUpdate={(u) => { setUser(u); onUserUpdate?.(u); }} />;
      case 'rooms':       return <TenantRooms isVn={isVn} user={user} />;
      default:            return <TenantDashboard isVn={isVn} user={user} onNavigate={setPage} />;
    }
  };

  return (
    <div className="tenant-shell">
      <aside className="tenant-sidebar">
        <div className="tenant-sidebar-top">
          <div className="tenant-logo-row">
            <div className="tenant-logo-mark">PT</div>
            <div className="tenant-logo-text">
              <span className="tenant-logo-title">Phòng Trọ</span>
              <span className="tenant-logo-sub">{isVn ? 'Cổng khách thuê' : 'Tenant Portal'}</span>
            </div>
          </div>

          <nav className="tenant-nav">
            {([
              ['dashboard',   '🏠', 'Trang chủ',       'Dashboard'],
              ['bills',       '💳', 'Hóa đơn',          'My Bills'],
              ['maintenance', '🛠', 'Báo cáo sự cố',    'Maintenance'],
              ['rooms',       '🏢', 'Phòng trống',       'Vacant Rooms'],
              ['profile',     '👤', 'Hồ sơ & Hợp đồng', 'Profile'],
            ] as [TenantPageKey, string, string, string][]).map(([key, icon, vn, en]) => (
              <button
                key={key}
                type="button"
                className={page === key ? 'nav-item active' : 'nav-item'}
                onClick={() => setPage(key)}
              >
                <span className="nav-icon">{icon}</span>
                <span>{isVn ? vn : en}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="tenant-sidebar-bottom">
          <div className="tenant-mini-card">
            <div className="tenant-tenant-name">{user?.fullName ?? '—'}</div>
            <div className="tenant-tenant-unit">{user?.email ?? ''}</div>
          </div>
          <button type="button" className="tp-lang-btn" onClick={toggleLang}>
            🌐 {isVn ? 'English' : 'Tiếng Việt'}
          </button>
          <button type="button" className="tenant-logout-btn" onClick={onLogout}>
            {isVn ? 'Đăng xuất' : 'Logout'}
          </button>
        </div>
      </aside>

      <main className="tenant-main">
        <header className="tenant-header">
          <div className="tenant-header-left">
            <h1 className="tenant-page-title">
              {isVn ? pageTitles[page][0] : pageTitles[page][1]}
            </h1>
            <p className="tenant-page-sub">
              {isVn ? pageSubs[page][0] : pageSubs[page][1]}
            </p>
          </div>
          <div className="tenant-header-right">
            <button type="button" className="tenant-avatar-chip" onClick={() => setPage('profile')}>
              <Avatar user={user} size={28} />
              <span className="tenant-avatar-meta">
                <span className="tenant-avatar-name">{user?.fullName ?? '—'}</span>
                <span className="tenant-avatar-sub">{isVn ? 'Khách thuê' : 'Tenant'}</span>
              </span>
            </button>
          </div>
        </header>

        <div className="tenant-content">{renderContent()}</div>
      </main>
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   DASHBOARD
══════════════════════════════════════════════════════ */
interface DashboardProps { isVn: boolean; user: AuthUser | null; onNavigate: (p: TenantPageKey) => void; }

const TenantDashboard: React.FC<DashboardProps> = ({ isVn, onNavigate }) => {
  const [contract, setContract] = useState<Contract | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [maint, setMaint] = useState<MaintenanceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [cs, invs, ms] = await Promise.all([
          getContracts({ status: 'ACTIVE', page: 1, limit: 1 }),
          getInvoices(),
          getMaintenanceList(),
        ]);
        setContract(cs[0] ?? null);
        setInvoices(invs.slice(0, 5));
        setMaint(ms.filter(m => m.status !== 'COMPLETED' && m.status !== 'CANCELLED').slice(0, 5));
      } catch { /* bỏ qua lỗi */ }
      finally { setLoading(false); }
    };
    void load();
  }, []);

  if (loading) return <Spinner />;

  const unpaidInvoice = invoices.find(i => i.status === 'UNPAID' || i.status === 'OVERDUE');

  return (
    <div className="tenant-dashboard">
      {/* Stats row */}
      <section className="tenant-grid top-grid">
        <div className="tenant-card status-card">
          <div className="status-label-row">
            <span className="status-label">{isVn ? 'Hợp đồng' : 'Contract'}</span>
            <span className={`status-pill ${contract ? statusColor(contract.status) : 'warning'}`}>
              {contract ? statusLabel(contract.status, isVn) : (isVn ? 'Không có' : 'None')}
            </span>
          </div>
          <div className="status-value">{contract?.room?.roomNumber ?? '—'}</div>
          <div className="status-sub">
            {contract ? (isVn ? 'Phòng đang thuê' : 'Current room') : (isVn ? 'Chưa có hợp đồng' : 'No active contract')}
          </div>
        </div>

        <div className="tenant-card status-card">
          <div className="status-label-row">
            <span className="status-label">{isVn ? 'Hóa đơn cần trả' : 'Due invoice'}</span>
            {unpaidInvoice && (
              <span className={`status-pill ${statusColor(unpaidInvoice.status)}`}>
                {statusLabel(unpaidInvoice.status, isVn)}
              </span>
            )}
          </div>
          <div className="status-value">
            {unpaidInvoice ? fmtCurrency(unpaidInvoice.totalAmount) : (isVn ? 'Đã trả hết' : 'All paid')}
          </div>
          <div className="status-sub">
            {unpaidInvoice
              ? `${isVn ? 'Hạn' : 'Due'}: ${fmtDate(unpaidInvoice.dueDate, isVn)}`
              : (isVn ? 'Không có hóa đơn chờ' : 'No pending invoices')}
          </div>
        </div>

        <div className="tenant-card status-card">
          <div className="status-label-row">
            <span className="status-label">{isVn ? 'Yêu cầu bảo trì' : 'Maintenance'}</span>
            {maint.length > 0 && (
              <span className="status-pill warning">{maint.length} {isVn ? 'đang xử lý' : 'active'}</span>
            )}
          </div>
          <div className="status-value">{maint.length}</div>
          <div className="status-sub">
            {maint.length > 0 ? (isVn ? 'Đang xử lý' : 'In progress') : (isVn ? 'Không có yêu cầu mở' : 'No open requests')}
          </div>
        </div>
      </section>

      {/* Hợp đồng + quick actions */}
      {contract ? (
        <section className="tenant-grid middle-grid">
          <div className="tenant-card residence-card">
            <h2 className="section-title">{isVn ? 'Phòng đang thuê' : 'Current Room'}</h2>
            <div className="residence-main">
              <div className="residence-image" />
              <div className="residence-meta">
                <div className="residence-unit-label">{isVn ? 'Phòng' : 'Room'}</div>
                <div className="residence-unit">{contract.room?.roomNumber ?? '—'}</div>
                <div className="residence-row">
                  <div>
                    <div className="residence-foot-label">{isVn ? 'Bắt đầu' : 'Start'}</div>
                    <div className="residence-foot-value">{fmtDate(contract.startDate, isVn)}</div>
                  </div>
                  <div>
                    <div className="residence-foot-label">{isVn ? 'Kết thúc' : 'End'}</div>
                    <div className="residence-foot-value">{fmtDate(contract.endDate, isVn)}</div>
                  </div>
                  <div>
                    <div className="residence-foot-label">{isVn ? 'Tiền thuê/tháng' : 'Monthly rent'}</div>
                    <div className="residence-foot-value">{fmtCurrency(contract.monthlyRent)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="tenant-card quick-actions-card">
            <h2 className="section-title">{isVn ? 'Thao tác nhanh' : 'Quick Actions'}</h2>
            {unpaidInvoice && (
              <button type="button" className="qa-primary" onClick={() => onNavigate('bills')}>
                <span>{isVn ? 'Xem hóa đơn chưa trả' : 'View unpaid invoice'}</span>
                <span className="qa-sub">{fmtCurrency(unpaidInvoice.totalAmount)}</span>
              </button>
            )}
            <button type="button" className="qa-secondary" onClick={() => onNavigate('maintenance')}>
              {isVn ? '🛠 Báo cáo sự cố' : '🛠 Report Issue'}
            </button>
            <button type="button" className="qa-secondary" onClick={() => onNavigate('profile')}>
              {isVn ? '📄 Xem hợp đồng' : '📄 View Contract'}
            </button>
          </div>
        </section>
      ) : (
        <div className="tenant-card tp-no-contract">
          <div className="tp-no-contract-icon">🏢</div>
          <h3>{isVn ? 'Bạn chưa có hợp đồng thuê phòng' : 'No active rental contract'}</h3>
          <p>{isVn ? 'Hãy xem danh sách phòng trống và gửi yêu cầu thuê cho admin.' : 'Browse available rooms and send a rental request to admin.'}</p>
          <button type="button" className="qa-primary" onClick={() => onNavigate('rooms')}>
            {isVn ? '🔍 Xem phòng trống' : '🔍 Browse Rooms'}
          </button>
        </div>
      )}

      {/* Bảo trì gần đây */}
      {maint.length > 0 && (
        <div className="tenant-card">
          <h2 className="section-title">{isVn ? 'Yêu cầu bảo trì gần đây' : 'Recent Maintenance'}</h2>
          <ul className="maint-list">
            {maint.map(m => (
              <li key={m.id} className="maint-item">
                <div className="maint-code">#{m.id.slice(-6).toUpperCase()}</div>
                <div className="maint-main">{m.title}</div>
                <div className="maint-sub">{fmtDate(m.reportedDate ?? m.createdAt, isVn)}</div>
                <span className={`status-pill ${statusColor(m.status)} small`}>{statusLabel(m.status, isVn)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   HÓA ĐƠN
══════════════════════════════════════════════════════ */
interface BillsProps { isVn: boolean; user: AuthUser | null; }

const TenantBills: React.FC<BillsProps> = ({ isVn }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getInvoices()
      .then(setInvoices)
      .catch(() => setError(isVn ? 'Không thể tải hóa đơn' : 'Failed to load invoices'))
      .finally(() => setLoading(false));
  }, [isVn]);

  if (loading) return <Spinner />;

  const unpaid = invoices.filter(i => i.status !== 'PAID');
  const totalUnpaid = unpaid.reduce((s, i) => s + (i.remainingAmount ?? i.totalAmount), 0);
  const latest = unpaid[0];

  return (
    <div className="tenant-bills">
      {error && <div className="tp-error">{error}</div>}
      <section className="tenant-grid bills-grid">
        <div className="tenant-card bills-summary-card">
          <div className="bills-summary-label">{isVn ? 'Tổng cần thanh toán' : 'Total outstanding'}</div>
          <div className="bills-summary-amount">{fmtCurrency(totalUnpaid)}</div>
          {latest && (
            <div className="bills-summary-sub">{isVn ? 'Hạn' : 'Due'}: {fmtDate(latest.dueDate, isVn)}</div>
          )}

          {latest && (
            <div className="charges">
              <div className="charges-header">
                <div>{isVn ? 'Chi phí kỳ' : 'Current charges'}</div>
                <div className="charges-period">{latest.billingMonth}</div>
              </div>
              <ul className="charges-list">
                <li>
                  <span>{isVn ? 'Tiền phòng' : 'Monthly Rent'}</span>
                  <span>{fmtCurrency(latest.rentAmount)}</span>
                </li>
                {(latest.electricityCost ?? 0) > 0 && (
                  <li>
                    <span>{isVn ? `Điện (${latest.electricityUsage} kWh)` : `Electricity (${latest.electricityUsage} kWh)`}</span>
                    <span>{fmtCurrency(latest.electricityCost ?? 0)}</span>
                  </li>
                )}
                {(latest.waterCost ?? 0) > 0 && (
                  <li>
                    <span>{isVn ? `Nước (${latest.waterUsage} m³)` : `Water (${latest.waterUsage} m³)`}</span>
                    <span>{fmtCurrency(latest.waterCost ?? 0)}</span>
                  </li>
                )}
                {latest.serviceCharges && Object.entries(latest.serviceCharges).map(([k, v]) => (
                  <li key={k}><span>{k}</span><span>{fmtCurrency(v)}</span></li>
                ))}
              </ul>
              <div className="charges-footer">
                <span>{isVn ? 'Tổng cộng' : 'Total'}</span>
                <span className="charges-total">{fmtCurrency(latest.totalAmount)}</span>
              </div>
            </div>
          )}

          {totalUnpaid === 0 && (
            <div className="tp-all-paid">✅ {isVn ? 'Tất cả hóa đơn đã thanh toán' : 'All invoices paid'}</div>
          )}
        </div>

        <div className="tenant-card bills-history-card">
          <h2 className="section-title">{isVn ? 'Lịch sử hóa đơn' : 'Invoice History'}</h2>
          {invoices.length === 0 ? (
            <p className="tp-empty">{isVn ? 'Chưa có hóa đơn nào.' : 'No invoices yet.'}</p>
          ) : (
            <table className="bills-table">
              <thead>
                <tr>
                  <th>{isVn ? 'Kỳ' : 'Period'}</th>
                  <th>{isVn ? 'Số tiền' : 'Amount'}</th>
                  <th>{isVn ? 'Hạn cuối' : 'Due date'}</th>
                  <th>{isVn ? 'Trạng thái' : 'Status'}</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.id}>
                    <td>{inv.billingMonth}</td>
                    <td>{fmtCurrency(inv.totalAmount)}</td>
                    <td>{fmtDate(inv.dueDate, isVn)}</td>
                    <td>
                      <span className={`status-pill ${statusColor(inv.status)}`}>
                        {statusLabel(inv.status, isVn)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   BÁO CÁO SỰ CỐ
══════════════════════════════════════════════════════ */
interface MaintProps { isVn: boolean; user: AuthUser | null; }

const TenantMaintenance: React.FC<MaintProps> = ({ isVn, user }) => {
  const [list, setList] = useState<MaintenanceItem[]>([]);
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [cs, ms] = await Promise.all([
          getContracts({ status: 'ACTIVE', page: 1, limit: 1 }),
          getMaintenanceList(),
        ]);
        setContract(cs[0] ?? null);
        setList(ms);
      } catch { setError(isVn ? 'Không thể tải dữ liệu' : 'Failed to load data'); }
      finally { setLoading(false); }
    };
    void load();
  }, [isVn]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!contract) {
      setError(isVn ? 'Bạn chưa có hợp đồng. Cần thuê phòng trước.' : 'No active contract. Please rent a room first.');
      return;
    }
    const fd = new FormData(e.currentTarget);
    const title = String(fd.get('title') ?? '').trim();
    const desc  = String(fd.get('description') ?? '').trim();
    const type    = String(fd.get('type') ?? 'OTHER') as any;
    const urgency = String(fd.get('urgency') ?? 'LOW') as any;

    if (!title || !desc) {
      setError(isVn ? 'Vui lòng nhập đủ tiêu đề và mô tả.' : 'Please fill in title and description.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const propertyId = contract.propertyId || contract.property?.id;
      if (!propertyId) {
        throw new Error(isVn ? 'Không xác định được khu trọ từ hợp đồng hiện tại.' : 'Cannot resolve property from the active contract.');
      }
      const item = await createMaintenance({
        roomId: contract.roomId,
        propertyId,
        title,
        description: desc,
        type,
        urgency,
        reportedById: user?.id,
      });
      setList(prev => [item, ...prev]);
      setMsg(isVn ? '✅ Gửi yêu cầu thành công!' : '✅ Request submitted!');
      (e.target as HTMLFormElement).reset();
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="tenant-maint">
      {error && <div className="tp-error">{error}</div>}
      {msg && <div className="tp-success">{msg}</div>}
      <div className="tenant-grid maint-grid">
        <div className="tenant-card maint-form-card">
          <h2 className="section-title">{isVn ? 'Tạo yêu cầu sự cố mới' : 'Report a New Issue'}</h2>
          {!contract && (
            <p className="tp-warn">{isVn ? '⚠ Bạn cần có hợp đồng thuê phòng để gửi yêu cầu.' : '⚠ You need an active contract to submit a request.'}</p>
          )}
          <form onSubmit={(e) => { void handleSubmit(e); }}>
            <label className="login-field">
              <span className="login-label">{isVn ? 'Tiêu đề sự cố' : 'Issue Title'}</span>
              <input name="title" type="text" placeholder={isVn ? 'Ví dụ: Bóng đèn phòng ngủ bị hỏng' : 'e.g. Bedroom light broken'} required />
            </label>
            <div className="maint-form-grid">
              <label className="login-field">
                <span className="login-label">{isVn ? 'Danh mục' : 'Category'}</span>
                <select name="type" defaultValue="OTHER">
                  <option value="PLUMBING">{isVn ? 'Nước / Ống nước' : 'Plumbing'}</option>
                  <option value="ELECTRICAL">{isVn ? 'Điện' : 'Electrical'}</option>
                  <option value="FURNITURE">{isVn ? 'Nội thất' : 'Furniture'}</option>
                  <option value="OTHER">{isVn ? 'Khác' : 'Other'}</option>
                </select>
              </label>
              <label className="login-field">
                <span className="login-label">{isVn ? 'Mức độ ưu tiên' : 'Urgency'}</span>
                <select name="urgency" defaultValue="LOW">
                  <option value="LOW">{isVn ? 'Thấp' : 'Low'}</option>
                  <option value="MEDIUM">{isVn ? 'Trung bình' : 'Medium'}</option>
                  <option value="HIGH">{isVn ? 'Cao / Khẩn cấp' : 'High / Urgent'}</option>
                </select>
              </label>
            </div>
            <label className="login-field">
              <span className="login-label">{isVn ? 'Mô tả chi tiết' : 'Description'}</span>
              <textarea name="description" placeholder={isVn ? 'Mô tả chi tiết sự cố...' : 'Describe the issue in detail...'} rows={4} required />
            </label>
            <button type="submit" className="qa-primary wide" disabled={submitting || !contract}>
              {submitting ? (isVn ? 'Đang gửi...' : 'Submitting...') : (isVn ? 'Gửi yêu cầu' : 'Submit Request')}
            </button>
          </form>
        </div>

        <div className="tenant-card maint-side-card">
          <h2 className="section-title">{isVn ? 'Lịch sử yêu cầu của tôi' : 'My Requests'}</h2>
          {list.length === 0 ? (
            <p className="tp-empty">{isVn ? 'Chưa có yêu cầu nào.' : 'No requests yet.'}</p>
          ) : (
            <ul className="maint-list">
              {list.map(m => (
                <li key={m.id} className="maint-item">
                  <div className="maint-code">#{m.id.slice(-6).toUpperCase()}</div>
                  <div className="maint-main">{m.title}</div>
                  <div className="maint-sub">{fmtDate(m.reportedDate ?? m.createdAt, isVn)}</div>
                  <span className={`status-pill ${statusColor(m.status)} small`}>{statusLabel(m.status, isVn)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   HỒ SƠ + HỢP ĐỒNG
══════════════════════════════════════════════════════ */
interface ProfileProps { isVn: boolean; user: AuthUser | null; onUserUpdate: (u: AuthUser) => void; }

const TenantProfile: React.FC<ProfileProps> = ({ isVn, user, onUserUpdate }) => {
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [contractHtml, setContractHtml] = useState<string | null>(null);
  const [showContract, setShowContract] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getContracts({ status: 'ACTIVE', page: 1, limit: 1 })
      .then(cs => setContract(cs[0] ?? null))
      .catch(() => { /* ignore */ })
      .finally(() => setLoading(false));
  }, []);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarLoading(true);
    setError('');
    try {
      const form = new FormData();
      form.append('file', file);
      const result = await apiRequest<{ avatarUrl: string }>('/files/upload-avatar', {
        method: 'POST',
        body: form,
      });
      const updated: AuthUser = { ...user!, avatar: result.avatarUrl };
      onUserUpdate(updated);
      localStorage.setItem('currentUser', JSON.stringify(updated));
      setMsg(isVn ? '✅ Cập nhật avatar thành công!' : '✅ Avatar updated!');
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setAvatarLoading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleViewContract = async () => {
    if (!contract) return;
    try {
      const res = await getPrintableContract(contract.id);
      setContractHtml(res.html);
      setShowContract(true);
    } catch {
      setError(isVn ? 'Không thể tải hợp đồng.' : 'Failed to load contract.');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="tenant-profile">
      {error && <div className="tp-error">{error}</div>}
      {msg && <div className="tp-success">{msg}</div>}

      {showContract && contractHtml && (
        <div className="tp-modal-overlay" onClick={() => setShowContract(false)}>
          <div className="tp-modal-box" onClick={e => e.stopPropagation()}>
            <div className="tp-modal-header">
              <span>{isVn ? 'Hợp đồng thuê phòng' : 'Rental Contract'}</span>
              <button type="button" onClick={() => setShowContract(false)}>✕</button>
            </div>
            <div className="tp-modal-body" dangerouslySetInnerHTML={{ __html: contractHtml }} />
          </div>
        </div>
      )}

      <div className="tenant-card profile-card">
        <section className="profile-section">
          <div className="profile-header">
            <div className="tp-avatar-upload-wrap">
              <Avatar user={user} size={72} className="tp-avatar-lg" />
              <button
                type="button"
                className="tp-avatar-edit-btn"
                onClick={() => fileRef.current?.click()}
                disabled={avatarLoading}
                title={isVn ? 'Thay đổi ảnh đại diện' : 'Change avatar'}
              >
                {avatarLoading ? '⏳' : '📷'}
              </button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { void handleAvatarChange(e); }} />
            </div>
            <div>
              <h2 className="profile-name">{user?.fullName ?? '—'}</h2>
              <div className="profile-id">{user?.email ?? '—'}</div>
              <div className="profile-badges">
                <span className="badge-positive">{isVn ? 'Đang thuê' : 'Active tenant'}</span>
              </div>
            </div>
            {contract && (
              <button type="button" className="qa-primary profile-contract-btn" onClick={() => { void handleViewContract(); }}>
                {isVn ? '📄 Xem hợp đồng đầy đủ' : '📄 Full Contract'}
              </button>
            )}
          </div>
        </section>

        <section className="profile-section grid-two">
          <div>
            <h3 className="profile-section-title">{isVn ? 'Thông tin cá nhân' : 'Personal Information'}</h3>
            <div className="profile-field-grid">
              <div className="profile-field">
                <span className="profile-label">{isVn ? 'Họ và tên' : 'Full name'}</span>
                <span className="profile-value">{user?.fullName ?? '—'}</span>
              </div>
              <div className="profile-field">
                <span className="profile-label">{isVn ? 'Email' : 'Email'}</span>
                <span className="profile-value">{user?.email ?? '—'}</span>
              </div>
              <div className="profile-field">
                <span className="profile-label">{isVn ? 'Số điện thoại' : 'Phone'}</span>
                <span className="profile-value">{user?.phone ?? '—'}</span>
              </div>
              <div className="profile-field">
                <span className="profile-label">{isVn ? 'Vai trò' : 'Role'}</span>
                <span className="profile-value">
                  {user?.role === 'TENANT' ? (isVn ? 'Khách thuê' : 'Tenant') : user?.role ?? '—'}
                </span>
              </div>
            </div>
          </div>

          {contract && (
            <div>
              <h3 className="profile-section-title">{isVn ? 'Thông tin phòng' : 'Room Details'}</h3>
              <div className="profile-field-grid">
                <div className="profile-field">
                  <span className="profile-label">{isVn ? 'Số phòng' : 'Room'}</span>
                  <span className="profile-value">{contract.room?.roomNumber ?? '—'}</span>
                </div>
                <div className="profile-field">
                  <span className="profile-label">{isVn ? 'Tầng' : 'Floor'}</span>
                  <span className="profile-value">{contract.room?.floor ?? '—'}</span>
                </div>
                <div className="profile-field">
                  <span className="profile-label">{isVn ? 'Loại phòng' : 'Type'}</span>
                  <span className="profile-value">{contract.room?.type ?? '—'}</span>
                </div>
              </div>
            </div>
          )}
        </section>

        {contract ? (
          <section className="profile-section">
            <h3 className="profile-section-title">{isVn ? 'Tóm tắt hợp đồng' : 'Contract Summary'}</h3>
            <div className="profile-field-grid contract-grid">
              <div className="profile-field">
                <span className="profile-label">{isVn ? 'Ngày bắt đầu' : 'Start date'}</span>
                <span className="profile-value">{fmtDate(contract.startDate, isVn)}</span>
              </div>
              <div className="profile-field">
                <span className="profile-label">{isVn ? 'Ngày kết thúc' : 'End date'}</span>
                <span className="profile-value">{fmtDate(contract.endDate, isVn)}</span>
              </div>
              <div className="profile-field">
                <span className="profile-label">{isVn ? 'Tiền cọc' : 'Deposit'}</span>
                <span className="profile-value">{fmtCurrency(contract.deposit)}</span>
              </div>
              <div className="profile-field">
                <span className="profile-label">{isVn ? 'Tiền thuê/tháng' : 'Monthly rent'}</span>
                <span className="profile-value">{fmtCurrency(contract.monthlyRent)}</span>
              </div>
              <div className="profile-field">
                <span className="profile-label">{isVn ? 'Giá điện(/kWh)' : 'Electricity rate'}</span>
                <span className="profile-value">{fmtCurrency(contract.electricityPrice)}</span>
              </div>
              <div className="profile-field">
                <span className="profile-label">{isVn ? 'Giá nước(/m³)' : 'Water rate'}</span>
                <span className="profile-value">{fmtCurrency(contract.waterPrice)}</span>
              </div>
              <div className="profile-field">
                <span className="profile-label">{isVn ? 'Trạng thái' : 'Status'}</span>
                <span className={`status-pill ${statusColor(contract.status)}`}>{statusLabel(contract.status, isVn)}</span>
              </div>
            </div>

            <div className="terms-block">
              <div className="terms-title">{isVn ? 'Điều khoản quan trọng' : 'Key Terms'}</div>
              <ul className="terms-list">
                <li>{isVn ? 'Tiền phòng thanh toán trước ngày 05 hàng tháng.' : 'Rent is due by the 5th of each month.'}</li>
                <li>{isVn ? 'Báo sự cố qua mục "Báo cáo sự cố" trong portal này.' : 'Report issues via the Maintenance page in this portal.'}</li>
                <li>{isVn ? 'Điện, nước tính theo chỉ số thực tế.' : 'Electricity and water billed per usage meter.'}</li>
                <li>{isVn ? 'Thông báo trả phòng trước tối thiểu 30 ngày.' : '30 days written notice required before vacating.'}</li>
              </ul>
            </div>
          </section>
        ) : (
          <section className="profile-section">
            <p className="tp-warn">{isVn ? '⚠ Bạn chưa có hợp đồng thuê phòng nào đang active.' : '⚠ No active rental contract found.'}</p>
          </section>
        )}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   PHÒNG TRỐNG + YÊU CẦU THUÊ
══════════════════════════════════════════════════════ */
interface RoomsProps { isVn: boolean; user: AuthUser | null; }

const TenantRooms: React.FC<RoomsProps> = ({ isVn, user }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [sentRoom, setSentRoom] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getRooms({ status: 'VACANT' })
      .then(setRooms)
      .catch(() => setError(isVn ? 'Không thể tải danh sách phòng' : 'Failed to load rooms'))
      .finally(() => setLoading(false));
  }, [isVn]);

  const handleRequest = useCallback((room: Room) => {
    if (sentRoom === room.id) return;
    const text = `[YÊU CẦU THUÊ PHÒNG] Xin chào admin! Tôi là ${user?.fullName ?? 'Khách'} (email: ${user?.email ?? ''}, SĐT: ${user?.phone ?? 'chưa cập nhật'}). Tôi muốn thuê phòng số ${room.roomNumber}, Tầng ${room.floor}, Loại: ${room.type}, Giá: ${fmtCurrency(room.price)}/tháng. Vui lòng liên hệ lại để hoàn tất thủ tục.`;
    try {
      const ws = new WebSocket(CHAT_WS_URL);
      ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'auth', userId: user?.id ?? 'guest', userName: user?.fullName ?? 'Khách', role: 'TENANT' }));
        setTimeout(() => {
          ws.send(JSON.stringify({ type: 'message', conversationId: null, text, clientMessageId: `rent-${room.id}-${Date.now()}` }));
          setTimeout(() => ws.close(), 500);
        }, 600);
      };
      ws.onerror = () => {
        setError(isVn ? 'Chat server chưa bật. Vui lòng liên hệ admin trực tiếp.' : 'Chat server offline. Please contact admin directly.');
      };
    } catch {
      setError(isVn ? 'Không thể gửi yêu cầu.' : 'Could not send request.');
      return;
    }
    setSentRoom(room.id);
    setMsg(isVn
      ? `✅ Đã gửi yêu cầu thuê phòng ${room.roomNumber} tới admin! Admin sẽ liên hệ bạn sớm.`
      : `✅ Rental request for room ${room.roomNumber} sent! Admin will contact you soon.`);
    setTimeout(() => setMsg(''), 7000);
  }, [user, sentRoom, isVn]);

  if (loading) return <Spinner />;

  const typeLabel = (t: string) =>
    ({ SINGLE: isVn ? 'Phòng đơn' : 'Single', DOUBLE: isVn ? 'Phòng đôi' : 'Double', VIP: 'VIP', STUDIO: 'Studio' }[t] ?? t);

  return (
    <div className="tp-rooms-page">
      {error && <div className="tp-error">{error}</div>}
      {msg && <div className="tp-success">{msg}</div>}
      <div className="tenant-card tp-rooms-info-card">
        <p>
          {isVn
            ? '📌 Khi bạn ấn "Yêu cầu thuê", tin nhắn sẽ tự động gửi tới admin qua hệ thống chat. Admin sẽ liên hệ để hoàn tất hợp đồng.'
            : '📌 When you click "Request to Rent", a message is sent to admin via chat. Admin will contact you to finalize the contract.'}
        </p>
      </div>

      {rooms.length === 0 ? (
        <div className="tenant-card tp-no-contract">
          <div className="tp-no-contract-icon">🏢</div>
          <p>{isVn ? 'Hiện không có phòng trống nào.' : 'No vacant rooms available.'}</p>
        </div>
      ) : (
        <div className="tp-rooms-grid">
          {rooms.map(room => (
            <div key={room.id} className="tenant-card tp-room-card">
              <div className="tp-room-header">
                <span className="tp-room-number">{isVn ? 'Phòng' : 'Room'} {room.roomNumber}</span>
                <span className="tp-room-type">{typeLabel(room.type)}</span>
              </div>
              <div className="tp-room-details">
                <div><span>{isVn ? 'Tầng' : 'Floor'}</span><strong>{room.floor}</strong></div>
                {room.area != null && <div><span>{isVn ? 'Diện tích' : 'Area'}</span><strong>{room.area} m²</strong></div>}
                <div><span>{isVn ? 'Tiền thuê/tháng' : 'Monthly rent'}</span><strong className="tp-room-price">{fmtCurrency(room.price)}</strong></div>
                <div><span>{isVn ? 'Tiền cọc' : 'Deposit'}</span><strong>{fmtCurrency(room.deposit)}</strong></div>
              </div>
              {room.description && <p className="tp-room-desc">{room.description}</p>}
              <button
                type="button"
                className={sentRoom === room.id ? 'qa-secondary wide' : 'qa-primary wide'}
                onClick={() => handleRequest(room)}
                disabled={sentRoom === room.id}
              >
                {sentRoom === room.id
                  ? (isVn ? '✅ Đã gửi yêu cầu' : '✅ Request Sent')
                  : (isVn ? '🏠 Yêu cầu thuê phòng này' : '🏠 Request to Rent')}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TenantPortal;
