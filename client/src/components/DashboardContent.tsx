import { useEffect, useMemo, useState } from 'react';
import './DashboardContent.css';
import type { Language } from '../translations';
import { getDashboardActivities, getDashboardAlerts, getDashboardKpis } from '../api/dashboard';
import { getProperties } from '../api/properties';

interface DashboardContentProps {
  lang?: Language;
  onNavigate?: (page: string) => void;
}

const DashboardContent = ({ lang = 'vn', onNavigate }: DashboardContentProps) => {
  const isVn = lang === 'vn';
  const [propertyId, setPropertyId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kpis, setKpis] = useState<any>(null);
  const [alertsPayload, setAlertsPayload] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const properties = await getProperties();
        const primaryPropertyId = properties[0]?.id;
        setPropertyId(primaryPropertyId);

        const [kpiData, alertsData, recentActivities] = await Promise.all([
          getDashboardKpis(primaryPropertyId),
          getDashboardAlerts(primaryPropertyId),
          getDashboardActivities(primaryPropertyId, 8),
        ]);

        setKpis(kpiData);
        setAlertsPayload(alertsData);
        setActivities(recentActivities);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load dashboard data';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const kpiCards = useMemo(
    () => [
    {
      title: isVn ? 'Doanh thu thang' : 'Monthly Revenue',
      value: `VND ${(Number(kpis?.invoices?.totalUnpaid || 0) * -1).toLocaleString()}`,
      delta: '+0%',
      tone: 'positive',
      note: isVn ? 'Doanh thu chua co endpoint theo thang' : 'Monthly revenue endpoint unavailable',
    },
    {
      title: isVn ? 'Ty le lap day' : 'Occupancy Rate',
      value: `${Number(kpis?.rooms?.occupancyRate || 0)}%`,
      delta: '+0%',
      tone: 'positive',
      note: `${Number(kpis?.rooms?.occupied || 0)}/${Number(kpis?.rooms?.total || 0)} ${isVn ? 'phong dang co khach' : 'rooms occupied'}`,
    },
    {
      title: isVn ? 'Dien nang tieu thu' : 'Electricity Usage',
      value: '--',
      delta: '--',
      tone: 'negative',
      note: isVn ? 'Backend chua co KPI dien nang' : 'No electricity KPI endpoint in backend',
    },
    {
      title: isVn ? 'Cong no can thu' : 'Outstanding Dues',
      value: `VND ${Number(kpis?.invoices?.totalUnpaid || 0).toLocaleString()}`,
      delta: `${Number(kpis?.invoices?.overdue || 0)}`,
      tone: 'positive',
      note: isVn ? 'Hoa don qua han' : 'Overdue invoices',
    },
    ],
    [isVn, kpis],
  );

  const alerts = useMemo(() => {
    const overdue = (alertsPayload?.overdueInvoices || []).map((item: any) => ({
      title: `${isVn ? 'Hoa don tre han' : 'Overdue invoice'} - ${item.room}`,
      meta: `${item.tenant} · ${item.daysOverdue} ${isVn ? 'ngay' : 'days'}`,
      level: isVn ? 'Khan cap' : 'Critical',
      tone: 'critical',
    }));

    const urgent = (alertsPayload?.urgentMaintenance || []).map((item: any) => ({
      title: `${item.title} - ${item.room}`,
      meta: `${item.type}`,
      level: isVn ? 'Cao' : 'High',
      tone: 'high',
    }));

    return [...overdue, ...urgent].slice(0, 6);
  }, [alertsPayload, isVn]);

  const activityItems = useMemo(() => {
    return activities.map((item) => ({
      tenant: item.user?.fullName || (isVn ? 'He thong' : 'System'),
      room: item.entityType || 'N/A',
      desc: item.action || (isVn ? 'Cap nhat' : 'Updated'),
      amount: item.metadata?.amount ? `+VND ${Number(item.metadata.amount).toLocaleString()}` : '--',
      status: isVn ? 'Moi' : 'New',
      at: new Date(item.createdAt).toLocaleTimeString(lang === 'vn' ? 'vi-VN' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }));
  }, [activities, isVn, lang]);

  const floorOccupancy = [
    { label: isVn ? 'Tang 1' : 'Floor 1', occupied: 18, total: 20 },
    { label: isVn ? 'Tang 2' : 'Floor 2', occupied: 17, total: 20 },
    { label: isVn ? 'Tang 3' : 'Floor 3', occupied: 18, total: 20 },
  ];

  const roomStatus = [
    { label: isVn ? 'Da cho thue' : 'Occupied', value: 53, tone: 'occupied' },
    { label: isVn ? 'Con trong' : 'Vacant', value: 5, tone: 'vacant' },
    { label: isVn ? 'Bao tri' : 'Maintenance', value: 2, tone: 'maintenance' },
  ];

  return (
    <section className="dashboard-admin">
      <div className="dashboard-hero">
        <div>
          <p className="dashboard-hero-kicker">{isVn ? 'Tong quan he thong' : 'Operations Overview'}</p>
          <h2>{isVn ? 'Dashboard quan tri' : 'Admin Dashboard'}</h2>
          <p className="dashboard-hero-sub">
            {isVn
              ? 'Theo doi tien do van hanh, cong no va cac su co uu tien trong mot man hinh.'
              : 'Track operations, dues and critical incidents in one unified view.'}
          </p>
        </div>
        <div className="dashboard-hero-actions">
          <button type="button" className="btn-secondary" onClick={() => onNavigate?.('reports')}>
            {isVn ? 'Xem bao cao' : 'Open Reports'}
          </button>
          <button type="button" className="btn-primary" onClick={() => onNavigate?.('maintenance')}>
            {isVn ? 'Xu ly su co' : 'Handle Incidents'}
          </button>
        </div>
      </div>

      {loading && <p>{isVn ? 'Dang tai du lieu dashboard...' : 'Loading dashboard data...'}</p>}
      {error && <p>{error}</p>}

      <div className="dashboard-kpi-row">
        {kpiCards.map((item) => (
          <article key={item.title} className="dashboard-kpi-card">
            <header>
              <span className="kpi-title">{item.title}</span>
              <span className={`kpi-delta ${item.tone}`}>{item.delta}</span>
            </header>
            <strong>{item.value}</strong>
            <small>{item.note}</small>
          </article>
        ))}
      </div>

      <div className="dashboard-main-grid">
        <section className="dashboard-panel">
          <div className="panel-header">
            <h3>{isVn ? 'Canh bao uu tien' : 'Priority Alerts'}</h3>
            <button type="button" className="panel-link" onClick={() => onNavigate?.('maintenance')}>
              {isVn ? 'Xem tat ca' : 'View all'}
            </button>
          </div>
          <div className="alert-list">
            {alerts.length === 0 && <p>{isVn ? 'Chua co canh bao' : 'No alerts'}</p>}
            {alerts.map((item) => (
              <article key={item.title} className={`alert-item ${item.tone}`}>
                <div className="alert-dot" />
                <div className="alert-body">
                  <p className="alert-title">{item.title}</p>
                  <p className="alert-meta">{item.meta}</p>
                </div>
                <span className="alert-level">{item.level}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="dashboard-panel">
          <div className="panel-header">
            <h3>{isVn ? 'Hoat dong gan day' : 'Recent Activities'}</h3>
            <button type="button" className="panel-link" onClick={() => onNavigate?.('invoices')}>
              {isVn ? 'Mo hoa don' : 'Open invoices'}
            </button>
          </div>
          <div className="payment-list">
            {activityItems.length === 0 && <p>{isVn ? 'Chua co du lieu hoat dong' : 'No activity data'}</p>}
            {activityItems.map((item) => (
              <article key={`${item.tenant}-${item.room}`} className="payment-item">
                <div>
                  <p className="payment-tenant">{item.tenant}</p>
                  <p className="payment-meta">
                    {isVn ? 'Phong' : 'Room'} {item.room} - {item.desc}
                  </p>
                </div>
                <div className="payment-right">
                  <strong>{item.amount}</strong>
                  <small>{item.status}</small>
                  <span>{item.at}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <div className="dashboard-bottom-grid">
        <section className="dashboard-panel">
          <div className="panel-header">
            <h3>{isVn ? 'Ty le lap day theo tang' : 'Occupancy By Floor'}</h3>
          </div>
          {!propertyId && <p>{isVn ? 'Khong tim thay property de thong ke' : 'No property found for analytics'}</p>}
          <div className="floor-bars">
            {floorOccupancy.map((item) => {
              const percent = Math.round((item.occupied / item.total) * 100);
              return (
                <div key={item.label} className="floor-row">
                  <div className="floor-meta">
                    <span>{item.label}</span>
                    <span>
                      {item.occupied}/{item.total}
                    </span>
                  </div>
                  <div className="floor-track">
                    <div className="floor-fill" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="dashboard-panel">
          <div className="panel-header">
            <h3>{isVn ? 'Tinh trang phong hien tai' : 'Current Room Status'}</h3>
          </div>
          <div className="status-chips">
            {roomStatus.map((item) => (
              <article key={item.label} className={`status-chip ${item.tone}`}>
                <p>{item.label}</p>
                <strong>{item.value}</strong>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
};

export default DashboardContent;
