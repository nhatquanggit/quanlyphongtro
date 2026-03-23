import React, { useEffect, useMemo, useState } from 'react';
import './InvoiceManagement.css';
import { translations } from '../translations';
import type { Language } from '../translations';
import { Calendar, Download, Info, Bell, Pencil } from 'lucide-react';
import { getProperties } from '../api/properties';
import { getInvoices, getInvoiceStats, markInvoicePaid, type Invoice } from '../api/invoices';

interface InvoiceProps {
  lang: Language;
}

const InvoiceManagement: React.FC<InvoiceProps> = ({ lang }) => {
  const t = translations[lang].sidebar;
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [propertyId, setPropertyId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const properties = await getProperties();
        const currentPropertyId = properties[0]?.id;
        setPropertyId(currentPropertyId);

        const [invoiceData, statsData] = await Promise.all([
          getInvoices(currentPropertyId),
          getInvoiceStats(currentPropertyId),
        ]);
        setInvoices(invoiceData);
        setStats(statsData);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load invoices';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const tableRows = useMemo(
    () =>
      invoices.map((inv) => ({
        id: inv.id,
        room: inv.room?.roomNumber || inv.roomId,
        tenant: inv.tenant?.fullName || inv.tenantId,
        month: inv.billingMonth,
        total: `VND ${Number(inv.totalAmount || 0).toLocaleString()}`,
        status:
          inv.status === 'PAID'
            ? 'paid'
            : inv.status === 'PARTIALLY_PAID'
              ? 'partial'
              : 'unpaid',
      })),
    [invoices],
  );

  const onMarkPaid = async (invoiceId: string) => {
    try {
      const paidAmount = invoices.find((it) => it.id === invoiceId)?.remainingAmount || 0;
      await markInvoicePaid(invoiceId, paidAmount, new Date().toISOString());
      if (!propertyId) return;
      const [invoiceData, statsData] = await Promise.all([getInvoices(propertyId), getInvoiceStats(propertyId)]);
      setInvoices(invoiceData);
      setStats(statsData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Cannot update invoice';
      setError(message);
    }
  };

  return (
    <div className="invoice-mgmt">
      {/* KPI Cards */}
      <div className="invoice-kpi-row">
        <div className="card invoice-kpi">
          <div className="kpi-label">{t.invoices}</div>
          <div className="kpi-val-group">
             <div className="kpi-value blue-text">{stats?.totalInvoices ?? 0}</div>
             <div className="kpi-subtext">{stats?.totalInvoices ?? 0} invoices</div>
          </div>
        </div>
        <div className="card invoice-kpi">
          <div className="kpi-label">{lang === 'vn' ? 'Thực thu' : lang === 'zh' ? '实际收款' : 'Actually Collected'}</div>
          <div className="kpi-val-group">
             <div className="kpi-value green-text">VND {Number(stats?.totalRevenue || 0).toLocaleString()}</div>
             <div className="kpi-pill collected">{Number(stats?.collectionRate || 0)}% {lang === 'vn' ? 'Đã thu' : 'Collected'}</div>
          </div>
        </div>
        <div className="card invoice-kpi">
          <div className="kpi-label">{lang === 'vn' ? 'Số tiền quá hạn' : lang === 'zh' ? '逾期金额' : 'Overdue Amount'}</div>
          <div className="kpi-val-group">
             <div className="kpi-value red-text">VND {Number(stats?.totalUnpaid || 0).toLocaleString()}</div>
             <div className="kpi-pill pending">{stats?.overdueInvoices ?? 0} {lang === 'vn' ? 'quá hạn' : 'overdue'}</div>
          </div>
        </div>
      </div>

      {/* Table Header and Controls */}
      <div className="invoice-controls">
        <div className="ctrl-title">{lang === 'vn' ? 'Tổng quan thanh toán' : 'Billing Overview'}</div>
        <div className="ctrl-actions">
           <button type="button" className="btn-outline"><Calendar size={16} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 6 }} />{lang === 'vn' ? 'Tháng 11, 2023' : 'November 2023'}</button>
           <button type="button" className="btn-outline"><Download size={16} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 6 }} />{lang === 'vn' ? 'Xuất dữ liệu' : 'Export'}</button>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="invoice-table-card">
        {loading && <div className="showing-text" style={{ padding: 16 }}>{lang === 'vn' ? 'Đang tải hoá đơn...' : 'Loading invoices...'}</div>}
        {error && <div className="showing-text" style={{ padding: 16 }}>{error}</div>}
        <table className="invoice-table">
          <thead>
            <tr>
              <th>{lang === 'vn' ? 'SỐ PHÒNG' : 'ROOM NO.'}</th>
              <th>{lang === 'vn' ? 'KHÁCH THUÊ' : 'TENANT'}</th>
              <th>{lang === 'vn' ? 'THÁNG' : 'BILLING MONTH'}</th>
              <th>{lang === 'vn' ? 'TỔNG TIỀN' : 'TOTAL AMOUNT'}</th>
              <th>{lang === 'vn' ? 'TRẠNG THÁI' : 'STATUS'}</th>
              <th>{lang === 'vn' ? 'THAO TÁC' : 'ACTIONS'}</th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map((inv) => (
              <tr key={inv.id}>
               <td className="room-cell" data-label={lang === 'vn' ? 'Số phòng' : 'Room'}>{inv.room}</td>
               <td className="tenant-cell" data-label={lang === 'vn' ? 'Khách thuê' : 'Tenant'}>{inv.tenant}</td>
               <td className="month-cell" data-label={lang === 'vn' ? 'Tháng' : 'Billing month'}>{inv.month}</td>
               <td className="amount-cell" data-label={lang === 'vn' ? 'Tổng tiền' : 'Total'}>
                   {inv.total} <span className="info-icon" title={lang === 'vn' ? 'Chi tiết' : 'Details'}><Info size={14} strokeWidth={2} /></span>
                </td>
               <td className="status-cell" data-label={lang === 'vn' ? 'Trạng thái' : 'Status'}>
                   <div className={`status-tag tag-${inv.status}`}>
                      {inv.status === 'partial' 
                        ? (lang === 'vn' ? 'THANH TOÁN MỘT PHẦN' : 'PARTIALLY PAID')
                        : inv.status === 'paid'
                        ? (lang === 'vn' ? 'ĐÃ THANH TOÁN' : 'PAID')
                        : (lang === 'vn' ? 'CHƯA THANH TOÁN' : 'UNPAID')}
                   </div>
                </td>
               <td data-label={lang === 'vn' ? 'Thao tác' : 'Actions'}>
                   <div className="actions-cell">
                      {(inv.status === 'unpaid' || inv.status === 'partial') && (
                        <button type="button" className="btn-reminder" onClick={() => onMarkPaid(inv.id)}><Bell size={14} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 6 }} />{lang === 'vn' ? 'Đánh dấu đã thu' : 'Mark Paid'}</button>
                      )}
                      <button type="button" className="icon-btn" title={lang === 'vn' ? 'Sửa' : 'Edit'} aria-label="Edit"><Pencil size={16} strokeWidth={2} /></button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="table-footer">
          <div className="showing-text">{lang === 'vn' ? `Hiển thị ${tableRows.length} hoá đơn` : `Showing ${tableRows.length} invoices`}</div>
          <div className="pagination">
            <button className="page-btn">{lang === 'vn' ? 'Trước' : 'Previous'}</button>
            <button className="page-num active">1</button>
            <button className="page-num">2</button>
            <button className="page-num">3</button>
            <button className="page-btn">{lang === 'vn' ? 'Sau' : 'Next'}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceManagement;
