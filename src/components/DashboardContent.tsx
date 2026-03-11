
const DashboardContent = () => {
  return (
    <div className="dashboard-root">
      <div className="dashboard-sidebar">{/* Sidebar content here */}</div>
      <div className="dashboard-content">
        <div className="dashboard-grid">
          {/* Header */}
          <div className="dashboard-header-grid">
            <div className="dashboard-title-col">
              <h2 className="dashboard-title">Admin Dashboard</h2>
            </div>
            <div className="dashboard-search-col">
              <input type="text" placeholder="Search data..." className="dashboard-search" />
            </div>
            <div className="dashboard-date-col">
              <div className="dashboard-date">Oct 12, 2023</div>
            </div>
            <div className="dashboard-action-col">
              <button className="dashboard-action">+ Quick Action</button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="dashboard-kpi-row">
            <div className="kpi-card kpi-1">
              <div className="kpi-title">Total Revenue</div>
              <div className="kpi-value">$12,450.00</div>
              <div className="kpi-trend kpi-positive">+12%</div>
            </div>
            <div className="kpi-card kpi-2">
              <div className="kpi-title">Occupancy Rate</div>
              <div className="kpi-value">88.5%</div>
              <div className="kpi-trend kpi-positive">+2%</div>
            </div>
            <div className="kpi-card kpi-3">
              <div className="kpi-title">Electricity Used</div>
              <div className="kpi-value">4,280 kWh</div>
              <div className="kpi-desc">This Month</div>
            </div>
            <div className="kpi-card kpi-4">
              <div className="kpi-title">Water Used</div>
              <div className="kpi-value">120.5 m³</div>
              <div className="kpi-desc">This Month</div>
            </div>
          </div>

          {/* Main Content: Alerts & Payments */}
          <div className="dashboard-main-row">
            <div className="dashboard-alerts-col">
              <div className="alerts-header-row">
                <span className="alerts-title">Urgent Maintenance Alerts</span>
                <a href="#" className="alerts-link">View All Tickets</a>
              </div>
              <div className="alert-card alert-critical">
                <div className="alert-title">Burst Pipe - Room 302</div>
                <div className="alert-meta">Reported by Jane Smith • 15 mins ago</div>
                <div className="alert-status">CRITICAL</div>
              </div>
              <div className="alert-card alert-high">
                <div className="alert-title">Power Outage - Floor 2 East Wing</div>
                <div className="alert-meta">Reported by System • 1 hour ago</div>
                <div className="alert-status">HIGH</div>
              </div>
              <div className="alert-card alert-medium">
                <div className="alert-title">Broken Smart Lock - Entrance B</div>
                <div className="alert-meta">Reported by Security • 3 hours ago</div>
                <div className="alert-status">MEDIUM</div>
              </div>
            </div>
            <div className="dashboard-payments-col">
              <div className="payments-header-row">Recent Payments</div>
              <div className="payment-card">
                <div className="payment-title">Michael Brown</div>
                <div className="payment-meta">Room 105 • Rent + Utilities</div>
                <div className="payment-date">Oct 12, 10:45 AM</div>
                <div className="payment-amount payment-positive">+$1,250</div>
                <div className="payment-status payment-completed">Completed</div>
              </div>
              <div className="payment-card">
                <div className="payment-title">Sarah Jenkins</div>
                <div className="payment-meta">Room 104 • Monthly Rent</div>
                <div className="payment-date">Oct 11, 04:20 PM</div>
                <div className="payment-amount payment-positive">+$850</div>
                <div className="payment-status payment-completed">Completed</div>
              </div>
              <div className="payment-card">
                <div className="payment-title">David Wilson</div>
                <div className="payment-meta">Room 202 • Deposit</div>
                <div className="payment-date">Oct 11, 08:15 AM</div>
                <div className="payment-amount payment-negative">+$2,400</div>
                <div className="payment-status payment-pending">Pending</div>
              </div>
              <div className="payment-card">
                <div className="payment-title">Alice Wong</div>
                <div className="payment-meta">Room 312 • Electricity</div>
                <div className="payment-date">Oct 10, 02:00 PM</div>
                <div className="payment-amount payment-positive">+$45</div>
                <div className="payment-status payment-completed">Completed</div>
              </div>
              <a href="#" className="download-report-link">Download Report</a>
            </div>
          </div>

          {/* Status Map */}
          <div className="dashboard-status-row">
            <div className="status-map-header-row">Property Status Map</div>
            <div className="status-legend-row">
              <span className="legend legend-occupied">Occupied</span>
              <span className="legend legend-vacant">Vacant</span>
              <span className="legend legend-maint">Maint.</span>
            </div>
            <div className="status-rooms-row">
              <span className="room room-occupied">101</span>
              <span className="room room-vacant">102</span>
              <span className="room room-vacant">103</span>
              <span className="room room-maint">104</span>
              <span className="room room-maint">105</span>
              <span className="room room-occupied">106</span>
              <span className="room room-occupied">107</span>
              <span className="room room-occupied">108</span>
              <span className="room room-occupied">109</span>
              <span className="room room-occupied">110</span>
              <span className="room room-vacant">201</span>
              <span className="room room-vacant">202</span>
              <span className="room room-occupied">203</span>
              <span className="room room-occupied">204</span>
              <span className="room room-occupied">205</span>
              <span className="room room-occupied">206</span>
              <span className="room room-occupied">207</span>
              <span className="room room-occupied">208</span>
              <span className="room room-occupied">209</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;