import { useState } from 'react';
import './TenantPortal.css';
import type { Language } from '../translations';

type TenantPageKey = 'dashboard' | 'bills' | 'maintenance' | 'profile';

interface TenantPortalProps {
  lang: Language;
  onLogout: () => void;
}

const TenantPortal: React.FC<TenantPortalProps> = ({ lang, onLogout }) => {
  const [page, setPage] = useState<TenantPageKey>('dashboard');
  const isVn = lang === 'vn';

  const renderContent = () => {
    switch (page) {
      case 'dashboard':
        return <TenantDashboard />;
      case 'bills':
        return <TenantBills />;
      case 'maintenance':
        return <TenantMaintenance />;
      case 'profile':
        return <TenantProfile />;
      default:
        return <TenantDashboard />;
    }
  };

  return (
    <div className="tenant-shell">
      <aside className="tenant-sidebar">
        <div className="tenant-sidebar-top">
          <div className="tenant-logo-row">
            <div className="tenant-logo-mark">SK</div>
            <div className="tenant-logo-text">
              <span className="tenant-logo-title">Skyline Apts</span>
              <span className="tenant-logo-sub">Tenant Portal</span>
            </div>
          </div>

          <nav className="tenant-nav">
            <button
              type="button"
              className={page === 'dashboard' ? 'nav-item active' : 'nav-item'}
              onClick={() => setPage('dashboard')}
            >
              <span className="nav-icon">🏠</span>
              <span>{isVn ? 'Trang chủ' : 'Dashboard'}</span>
            </button>
            <button
              type="button"
              className={page === 'bills' ? 'nav-item active' : 'nav-item'}
              onClick={() => setPage('bills')}
            >
              <span className="nav-icon">💳</span>
              <span>{isVn ? 'Hóa đơn' : 'My Bills'}</span>
            </button>
            <button
              type="button"
              className={page === 'maintenance' ? 'nav-item active' : 'nav-item'}
              onClick={() => setPage('maintenance')}
            >
              <span className="nav-icon">🛠</span>
              <span>{isVn ? 'Bảo trì' : 'Maintenance'}</span>
            </button>
            <button
              type="button"
              className={page === 'profile' ? 'nav-item active' : 'nav-item'}
              onClick={() => setPage('profile')}
            >
              <span className="nav-icon">👤</span>
              <span>{isVn ? 'Hồ sơ' : 'My Profile'}</span>
            </button>
          </nav>
        </div>

        <div className="tenant-sidebar-bottom">
          <div className="tenant-mini-card">
            <div className="tenant-tenant-name">Alex Johnson</div>
            <div className="tenant-tenant-unit">{isVn ? 'Phòng 402-B' : 'Unit 402-B'}</div>
          </div>
          <button type="button" className="tenant-help-btn">
            {isVn ? 'Trung tâm hỗ trợ' : 'Help Center'}
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
              {page === 'dashboard' && (isVn ? 'Chào mừng trở lại, Alex!' : 'Welcome back, Alex!')}
              {page === 'bills' && (isVn ? 'Hóa đơn & Thanh toán' : 'My Bills & Payments')}
              {page === 'maintenance' && (isVn ? 'Yêu cầu bảo trì' : 'Maintenance Requests')}
              {page === 'profile' && (isVn ? 'Hồ sơ & Hợp đồng' : 'Profile & Contract')}
            </h1>
            <p className="tenant-page-sub">
              {page === 'dashboard' &&
                (isVn ? 'Đây là tình hình phòng của bạn hôm nay.' : "Here's what's happening with your home today.")}
              {page === 'bills' &&
                (isVn ? 'Xem các khoản phí hiện tại và lịch sử thanh toán.' : 'Review your current charges and recent payment history.')}
              {page === 'maintenance' &&
                (isVn ? 'Báo cáo sự cố mới hoặc theo dõi yêu cầu bảo trì của bạn.' : 'Report new issues or track your existing maintenance tickets.')}
              {page === 'profile' &&
                (isVn ? 'Cập nhật thông tin cá nhân và chi tiết hợp đồng.' : 'Keep your personal information and contract details up to date.')}
            </p>
          </div>
          <div className="tenant-header-right">
            <button type="button" className="tenant-icon-btn" aria-label={isVn ? 'Thông báo' : 'Notifications'}>
              🔔
            </button>
            <button type="button" className="tenant-avatar-chip">
              <span className="tenant-avatar-circle">AJ</span>
              <span className="tenant-avatar-meta">
                <span className="tenant-avatar-name">Alex Johnson</span>
                <span className="tenant-avatar-sub">{isVn ? 'Phòng 402-B' : 'Unit 402-B'}</span>
              </span>
            </button>
          </div>
        </header>

        <div className="tenant-content">{renderContent()}</div>
      </main>
    </div>
  );
};

const TenantDashboard: React.FC = () => (
  <div className="tenant-dashboard">
    <section className="tenant-grid top-grid">
      <div className="tenant-card status-card">
        <div className="status-label-row">
          <span className="status-label">Rent Status</span>
          <span className="status-pill positive">Current</span>
        </div>
        <div className="status-value">Paid</div>
        <div className="status-sub">August 2023</div>
      </div>
      <div className="tenant-card status-card">
        <div className="status-label-row">
          <span className="status-label">Upcoming due date</span>
        </div>
        <div className="status-value">Sept 1st, 2023</div>
        <div className="status-sub">In 12 days</div>
      </div>
      <div className="tenant-card status-card">
        <div className="status-label-row">
          <span className="status-label">Maintenance requests</span>
          <span className="status-pill warning">2 active</span>
        </div>
        <div className="status-value">In progress</div>
        <div className="status-sub">Last updated: Today</div>
      </div>
    </section>

    <section className="tenant-grid middle-grid">
      <div className="tenant-card residence-card">
        <h2 className="section-title">My Residence</h2>
        <div className="residence-main">
          <div className="residence-image" />
          <div className="residence-meta">
            <div className="residence-unit-label">Unit number</div>
            <div className="residence-unit">402-B, South Tower</div>
            <div className="residence-row">
              <div>
                <div className="residence-foot-label">Lease start</div>
                <div className="residence-foot-value">Jan 12, 2023</div>
              </div>
              <div>
                <div className="residence-foot-label">Monthly rent</div>
                <div className="residence-foot-value">$2,450.00</div>
              </div>
              <div>
                <div className="residence-foot-label">Term</div>
                <div className="residence-foot-value">12 Months</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="tenant-card quick-actions-card">
        <h2 className="section-title">Quick Actions</h2>
        <button type="button" className="qa-primary">
          <span>Pay Now</span>
          <span className="qa-sub">Next: $2,450.00</span>
        </button>
        <button type="button" className="qa-secondary">
          Report an Issue
        </button>
        <button type="button" className="qa-secondary">
          View Contract
        </button>
        <div className="qa-help">
          <div className="qa-help-title">Need help?</div>
          <div className="qa-help-sub">
            Our concierge is available 24/7 for urgent assistance.
          </div>
          <button type="button" className="qa-help-btn">
            Contact Concierge
          </button>
        </div>
      </div>
    </section>

    <section className="tenant-card announcements-card">
      <div className="ann-header">
        <h2 className="section-title">Latest Announcements</h2>
        <button type="button" className="ann-link">
          View All
        </button>
      </div>
      <div className="ann-list">
        <article className="ann-item">
          <div className="ann-tag">Maintenance</div>
          <h3>Scheduled Water Maintenance</h3>
          <p>
            Water supply will be temporarily suspended for Unit B wing on Thursday from 10 AM to 2 PM for routine
            inspections.
          </p>
          <span className="ann-meta">2 hours ago</span>
        </article>
        <article className="ann-item">
          <div className="ann-tag">Community</div>
          <h3>Rooftop Summer Social</h3>
          <p>
            Join us this Saturday for our annual summer BBQ on the rooftop garden. Drinks and snacks provided by
            management.
          </p>
          <span className="ann-meta">Yesterday</span>
        </article>
      </div>
    </section>
  </div>
);

const TenantBills: React.FC = () => (
  <div className="tenant-bills">
    <section className="tenant-grid bills-grid">
      <div className="tenant-card bills-summary-card">
        <div className="bills-summary-label">Total outstanding</div>
        <div className="bills-summary-amount">$1,250.00</div>
        <div className="bills-summary-sub">Due in 3 days</div>
        <button type="button" className="qa-primary wide">
          Pay Now
        </button>

        <div className="charges">
          <div className="charges-header">
            <div>Current Charges</div>
            <div className="charges-period">May 2024</div>
          </div>
          <ul className="charges-list">
            <li>
              <span>Monthly Rent</span>
              <span>$1,000.00</span>
            </li>
            <li>
              <span>Electricity</span>
              <span>$120.00</span>
            </li>
            <li>
              <span>Water Utility</span>
              <span>$45.00</span>
            </li>
            <li>
              <span>High-speed Internet</span>
              <span>$85.00</span>
            </li>
          </ul>
          <div className="charges-footer">
            <span>Total Amount</span>
            <span className="charges-total">$1,250.00</span>
          </div>
        </div>

        <div className="accepted-methods">
          <div className="accepted-label">Accepted payment methods</div>
          <div className="accepted-icons">
            <span>💳</span>
            <span>🏦</span>
            <span>🏛</span>
          </div>
        </div>
      </div>

      <div className="tenant-card bills-history-card">
        <div className="bills-history-header">
          <h2 className="section-title">Payment History</h2>
          <button type="button" className="ann-link">
            View All History
          </button>
        </div>
        <table className="bills-table">
          <thead>
            <tr>
              <th>Billing Period</th>
              <th>Total Amount</th>
              <th>Date Paid</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>April 2024</td>
              <td>$1,245.50</td>
              <td>April 02, 2024</td>
              <td><span className="status-pill positive">Paid</span></td>
              <td><button type="button" className="link-btn">Receipt</button></td>
            </tr>
            <tr>
              <td>March 2024</td>
              <td>$1,230.00</td>
              <td>March 05, 2024</td>
              <td><span className="status-pill positive">Paid</span></td>
              <td><button type="button" className="link-btn">Receipt</button></td>
            </tr>
            <tr>
              <td>January 2024</td>
              <td>$1,250.00</td>
              <td>January 08, 2024</td>
              <td><span className="status-pill danger">Overdue</span></td>
              <td><button type="button" className="link-btn">Receipt</button></td>
            </tr>
          </tbody>
        </table>

        <div className="bills-support-card">
          <div>
            <div className="bills-support-title">Need help with your bill?</div>
            <div className="bills-support-sub">
              Our support team is available 24/7 to help you with any payment discrepancies or technical issues.
            </div>
          </div>
          <div className="bills-support-actions">
            <button type="button" className="qa-primary">
              Contact Support
            </button>
            <button type="button" className="qa-secondary">
              Browse FAQs
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
);

const TenantMaintenance: React.FC = () => (
  <div className="tenant-maint">
    <div className="tenant-grid maint-grid">
      <div className="tenant-card maint-form-card">
        <h2 className="section-title">Report a New Issue</h2>
        <div className="maint-form-grid">
          <label className="login-field">
            <span className="login-label">Category</span>
            <select defaultValue="">
              <option value="" disabled>
                Select category
              </option>
              <option>Plumbing</option>
              <option>Electrical</option>
              <option>Appliances</option>
              <option>Other</option>
            </select>
          </label>
          <label className="login-field">
            <span className="login-label">Urgency level</span>
            <select defaultValue="low">
              <option value="low">Low (Routine maintenance)</option>
              <option value="medium">Medium</option>
              <option value="high">High (Urgent)</option>
            </select>
          </label>
        </div>
        <label className="login-field">
          <span className="login-label">Description</span>
          <textarea placeholder="Please describe the problem in detail..." rows={4} />
        </label>
        <div className="upload-area">
          <div className="upload-icon">⬆</div>
          <div className="upload-title">Click to upload or drag and drop</div>
          <div className="upload-sub">PNG, JPG up to 10MB</div>
        </div>
        <button type="button" className="qa-primary wide">
          Submit Request
        </button>
      </div>

      <div className="tenant-card maint-side-card">
        <section className="maint-history">
          <h2 className="section-title">Request History</h2>
          <ul className="maint-list">
            <li className="maint-item">
              <div className="maint-code">#REQ-4821</div>
              <div className="maint-main">Kitchen Sink Leak</div>
              <div className="maint-sub">Oct 24, 2023</div>
              <span className="status-pill warning small">In progress</span>
            </li>
            <li className="maint-item">
              <div className="maint-code">#REQ-4755</div>
              <div className="maint-main">Broken Window Lock</div>
              <div className="maint-sub">Oct 13, 2023</div>
              <span className="status-pill positive small">Resolved</span>
            </li>
            <li className="maint-item">
              <div className="maint-code">#REQ-4610</div>
              <div className="maint-main">AC Filter Change</div>
              <div className="maint-sub">Sep 28, 2023</div>
              <span className="status-pill neutral small">Pending</span>
            </li>
          </ul>
          <button type="button" className="ann-link">
            View All History
          </button>
        </section>

        <section className="maint-tracking">
          <h2 className="section-title">Live Tracking</h2>
          <ol className="tracking-steps">
            <li className="tracking-step active">
              <div className="step-dot" />
              <div>
                <div className="step-title">Request received</div>
                <div className="step-sub">Oct 24, 9:05 AM</div>
              </div>
            </li>
            <li className="tracking-step active">
              <div className="step-dot" />
              <div>
                <div className="step-title">Technician assigned</div>
                <div className="step-sub">Oct 24, 11:30 AM · Marco S. is on the way</div>
              </div>
            </li>
            <li className="tracking-step">
              <div className="step-dot pending" />
              <div>
                <div className="step-title">Work completed</div>
                <div className="step-sub">Pending</div>
              </div>
            </li>
          </ol>
        </section>
      </div>
    </div>
  </div>
);

const TenantProfile: React.FC = () => (
  <div className="tenant-profile">
    <div className="tenant-card profile-card">
      <section className="profile-section">
        <div className="profile-header">
          <div className="profile-avatar-lg">AJ</div>
          <div>
            <h2 className="profile-name">Alex Johnson</h2>
            <div className="profile-id">Tenant ID: #TR-9921</div>
            <div className="profile-badges">
              <span className="badge-positive">Active tenant</span>
              <span className="badge-outline">Verified identity</span>
            </div>
          </div>
          <button type="button" className="qa-primary profile-contract-btn">
            Full Contract
          </button>
        </div>
      </section>

      <section className="profile-section grid-two">
        <div>
          <h3 className="profile-section-title">Personal information</h3>
          <div className="profile-field-grid">
            <div className="profile-field">
              <span className="profile-label">Full legal name</span>
              <span className="profile-value">Alex Michael Johnson</span>
            </div>
            <div className="profile-field">
              <span className="profile-label">Phone number</span>
              <span className="profile-value">+84 901 234 567</span>
            </div>
            <div className="profile-field">
              <span className="profile-label">ID / CCCD Number</span>
              <span className="profile-value">012345678901</span>
            </div>
            <div className="profile-field">
              <span className="profile-label">Email address</span>
              <span className="profile-value">alex.j@example.com</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="profile-section-title">Room details</h3>
          <div className="profile-field-grid">
            <div className="profile-field">
              <span className="profile-label">Room number</span>
              <span className="profile-value">Suite 402-B</span>
            </div>
            <div className="profile-field">
              <span className="profile-label">Floor</span>
              <span className="profile-value">4th Floor (West Wing)</span>
            </div>
            <div className="profile-field">
              <span className="profile-label">Address</span>
              <span className="profile-value">
                123 Skyline Tower, Ward 2, District 1, HCMC
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="profile-section">
        <h3 className="profile-section-title">Contract overview</h3>
        <div className="profile-field-grid contract-grid">
          <div className="profile-field">
            <span className="profile-label">Start date</span>
            <span className="profile-value">Jan 01, 2024</span>
          </div>
          <div className="profile-field">
            <span className="profile-label">End date</span>
            <span className="profile-value">Dec 31, 2024</span>
          </div>
          <div className="profile-field">
            <span className="profile-label">Security deposit</span>
            <span className="profile-value">$1,200.00</span>
          </div>
        </div>

        <div className="terms-block">
          <div className="terms-title">Terms & Conditions Summary</div>
          <ul className="terms-list">
            <li>Monthly rent due on the 5th of every month.</li>
            <li>Maintenance requests must be submitted via the portal 48h in advance.</li>
            <li>Electricity and water bills are calculated based on actual consumption.</li>
            <li>Cancellation requires written notice 30 days prior to departure.</li>
          </ul>
        </div>

        <div className="digital-contract">
          <div>
            <div className="digital-label">Digital contract signed</div>
            <div className="digital-hash">Hash: 8f2a...9c11</div>
          </div>
          <div className="digital-actions">
            <button type="button" className="qa-secondary">
              View viewer
            </button>
            <button type="button" className="qa-primary">
              PDF
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
);

export default TenantPortal;

