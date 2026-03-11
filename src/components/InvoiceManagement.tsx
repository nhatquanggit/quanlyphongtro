import React from 'react';
import './InvoiceManagement.css';
import { translations } from '../translations';
import type { Language } from '../translations';
import { Calendar, Download, Info, Bell, Pencil } from 'lucide-react';

interface InvoiceProps {
  lang: Language;
}

const InvoiceManagement: React.FC<InvoiceProps> = ({ lang }) => {
  const t = translations[lang].sidebar;
  const invoices = [
    { room: '101', tenant: 'John Doe', month: 'Nov 2023', total: '$1,250.00', status: 'paid' },
    { room: '102', tenant: 'Sarah Jenkins', month: 'Nov 2023', total: '$1,420.00', status: 'unpaid' },
    { room: '103', tenant: 'Michael Brown', month: 'Nov 2023', total: '$1,850.00', status: 'partial' },
    { room: '104', tenant: 'David Wilson', month: 'Nov 2023', total: '$1,100.00', status: 'paid' },
    { room: '105', tenant: 'Emily Davis', month: 'Nov 2023', total: '$1,380.00', status: 'unpaid' },
  ];

  return (
    <div className="invoice-mgmt">
      {/* KPI Cards */}
      <div className="invoice-kpi-row">
        <div className="card invoice-kpi">
          <div className="kpi-label">{t.invoices}</div>
          <div className="kpi-val-group">
             <div className="kpi-value blue-text">$42,500.00</div>
             <div className="kpi-subtext">Nov 2023</div>
          </div>
        </div>
        <div className="card invoice-kpi">
          <div className="kpi-label">{lang === 'vn' ? 'Thực thu' : lang === 'zh' ? '实际收款' : 'Actually Collected'}</div>
          <div className="kpi-val-group">
             <div className="kpi-value green-text">$35,280.00</div>
             <div className="kpi-pill collected">83% {lang === 'vn' ? 'Đã thu' : lang === 'zh' ? '已收' : 'Collected'}</div>
          </div>
        </div>
        <div className="card invoice-kpi">
          <div className="kpi-label">{lang === 'vn' ? 'Số tiền quá hạn' : lang === 'zh' ? '逾期金额' : 'Overdue Amount'}</div>
          <div className="kpi-val-group">
             <div className="kpi-value red-text">$7,220.00</div>
             <div className="kpi-pill pending">17% {lang === 'vn' ? 'Chưa thu' : lang === 'zh' ? '待收' : 'Pending'}</div>
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
            {invoices.map((inv, idx) => (
              <tr key={idx}>
                <td className="room-cell">{inv.room}</td>
                <td className="tenant-cell">{inv.tenant}</td>
                <td className="month-cell">{inv.month}</td>
                <td className="amount-cell">
                   {inv.total} <span className="info-icon" title={lang === 'vn' ? 'Chi tiết' : 'Details'}><Info size={14} strokeWidth={2} /></span>
                </td>
                <td className="status-cell">
                   <div className={`status-tag tag-${inv.status}`}>
                      {inv.status === 'partial' 
                        ? (lang === 'vn' ? 'THANH TOÁN MỘT PHẦN' : 'PARTIALLY PAID')
                        : inv.status === 'paid'
                        ? (lang === 'vn' ? 'ĐÃ THANH TOÁN' : 'PAID')
                        : (lang === 'vn' ? 'CHƯA THANH TOÁN' : 'UNPAID')}
                   </div>
                </td>
                <td>
                   <div className="actions-cell">
                      {(inv.status === 'unpaid' || inv.status === 'partial') && (
                        <button type="button" className="btn-reminder"><Bell size={14} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 6 }} />{lang === 'vn' ? 'Nhắc nhở' : 'Reminder'}</button>
                      )}
                      <button type="button" className="icon-btn" title={lang === 'vn' ? 'Sửa' : 'Edit'} aria-label="Edit"><Pencil size={16} strokeWidth={2} /></button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="table-footer">
          <div className="showing-text">{lang === 'vn' ? 'Hiển thị 1 đến 5 trong 32 kết quả' : 'Showing 1 to 5 of 32 results'}</div>
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
