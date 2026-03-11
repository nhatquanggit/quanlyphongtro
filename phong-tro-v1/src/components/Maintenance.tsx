import React, { useState } from 'react';
import './Maintenance.css';
import { translations } from '../translations';
import type { Language } from '../translations';
import { Droplets, Zap, DoorOpen, Snowflake, Plus, Eye } from 'lucide-react';

interface MaintProps {
  lang: Language;
}

interface MaintenanceRequest {
  room: string;
  urgency: string;
  time: string;
  type: string;
  desc: string;
  status: string;
  reporter?: string;
  assigned?: string;
  color: string;
}

const Maintenance: React.FC<MaintProps> = ({ lang }) => {
  const t = translations[lang].sidebar;
  const [selectedIssue, setSelectedIssue] = useState<MaintenanceRequest | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

  const requests: MaintenanceRequest[] = [
    { 
      room: lang === 'vn' ? 'Phòng 104' : 'Room 104', 
      urgency: lang === 'vn' ? 'KHẨN CẤP' : 'HIGH URGENCY', 
      time: lang === 'vn' ? '2 GIỜ TRƯỚC' : '2 HRS AGO', 
      type: lang === 'vn' ? 'Rò rỉ đường ống' : 'Plumbing Leak', 
      desc: lang === 'vn' ? 'Ống nước bồn rửa bếp bị rò rỉ nghiêm trọng, nước đọng trên sàn và lan ra phòng khách. Cần xử lý ngay lập tức để tránh hư hỏng sàn gỗ.' : 'The kitchen sink pipe has a major leak, water is pooling on the floor and spreading to the living room. Immediate attention needed to prevent wood floor damage.', 
      status: 'PENDING', 
      reporter: 'Sarah J.', 
      color: 'red' 
    },
    { 
      room: lang === 'vn' ? 'Phòng 205' : 'Room 205', 
      urgency: lang === 'vn' ? 'TRUNG BÌNH' : 'MEDIUM', 
      time: lang === 'vn' ? '5 GIỜ TRƯỚC' : '5 HRS AGO', 
      type: lang === 'vn' ? 'Đèn nhấp nháy' : 'Light Flicker', 
      desc: lang === 'vn' ? 'Đèn chính trong phòng ngủ cứ nhấp nháy khi bật. Có thể là vấn đề về công tắc hoặc bóng đèn. Khách thuê yêu cầu kiểm tra và thay thế nếu cần.' : 'The main light in the bedroom keeps flickering when turned on. Might be a switch or bulb issue. Tenant requests inspection and replacement if needed.', 
      status: 'IN PROGRESS', 
      assigned: 'Eric W.', 
      color: 'blue' 
    },
    { 
      room: lang === 'vn' ? 'Phòng 302' : 'Room 302', 
      urgency: lang === 'vn' ? 'THẤP' : 'LOW', 
      time: lang === 'vn' ? '1 NGÀY TRƯỚC' : '1 DAY AGO', 
      type: lang === 'vn' ? 'Cửa kêu cót két' : 'Door Squeak', 
      desc: lang === 'vn' ? 'Bản lề cửa phòng tắm kêu cót két rất to. Cần tra dầu hoặc thay bản lề mới. Không ảnh hưởng đến chức năng nhưng gây khó chịu.' : 'Bathroom door hinges are very squeaky. Needs oiling or replacement. Not affecting functionality but causing annoyance.', 
      status: 'COMPLETED', 
      reporter: 'Admin', 
      color: 'gray' 
    },
    { 
      room: lang === 'vn' ? 'Phòng 112' : 'Room 112', 
      urgency: lang === 'vn' ? 'KHẨN CẤP' : 'HIGH URGENCY', 
      time: lang === 'vn' ? '8 GIỜ TRƯỚC' : '8 HRS AGO', 
      type: lang === 'vn' ? 'Điều hòa không lạnh' : 'AC Not Cooling', 
      desc: lang === 'vn' ? 'Máy điều hòa thổi gió ấm ngay cả khi đặt nhiệt độ thấp nhất. Có thể thiếu gas hoặc hỏng máy nén. Thời tiết nóng, cần sửa gấp.' : 'AC unit is blowing warm air even at the lowest temperature setting. Possibly low on refrigerant or compressor issue. Hot weather, urgent repair needed.', 
      status: 'PENDING', 
      reporter: 'John D.', 
      color: 'red' 
    },
  ];

  return (
    <div className="maint-container">
      {/* Summary Metrics */}
      <div className="maint-summary">
        <div className="card summary-card">
          <div className="summary-label">{t.maintenance}</div>
          <div className="summary-val">24</div>
        </div>
        <div className="card summary-card line-red">
          <div className="summary-label">{lang === 'vn' ? 'KHẨN CẤP' : 'HIGH URGENCY'}</div>
          <div className="summary-val red-text">06</div>
        </div>
        <div className="card summary-card line-blue">
          <div className="summary-label">{lang === 'vn' ? 'ĐANG XỬ LÝ' : 'IN PROGRESS'}</div>
          <div className="summary-val blue-text">12</div>
        </div>
        <div className="card summary-card line-green">
          <div className="summary-label">{lang === 'vn' ? 'HOÀN THÀNH (24H)' : 'COMPLETED (24H)'}</div>
          <div className="summary-val green-text">08</div>
        </div>
      </div>

      {/* Grid Controls */}
      <div className="maint-controls">
         <div className="ctrl-group">
            <div className="ctrl-title">{lang === 'vn' ? 'Theo dõi bảo trì' : 'Active Requests'}</div>
            <div className="view-toggle">
               <button 
                 className={`toggle-btn ${viewMode === 'card' ? 'active' : ''}`}
                 onClick={() => setViewMode('card')}
               >
                 {lang === 'vn' ? 'Dạng thẻ' : 'Card View'}
               </button>
               <button 
                 className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                 onClick={() => setViewMode('list')}
               >
                 {lang === 'vn' ? 'Dạng danh sách' : 'List View'}
               </button>
            </div>
         </div>
         <div className="sort-group">
            <span className="sort-label">{lang === 'vn' ? 'Sắp xếp:' : 'Sort by:'}</span>
            <select className="sort-select">
               <option>{lang === 'vn' ? 'Mức độ (Cao đến Thấp)' : 'Urgency (High to Low)'}</option>
            </select>
         </div>
      </div>

      {/* Card View */}
      {viewMode === 'card' && (
        <div className="maint-grid">
           {requests.map((req, idx) => (
             <div key={idx} className="card req-card" onClick={() => setSelectedIssue(req)} style={{ cursor: 'pointer' }}>
                <div className={`req-header header-${req.color}`}>
                   <span className="req-room">{req.room}</span>
                   <span className={`urgency-tag tag-${req.color}`}>{req.urgency}</span>
                   <span className="req-time">{req.time}</span>
                </div>
                <div className="req-body">
                   <div className="issue-type">
                      <div className="issue-label">{lang === 'vn' ? 'LOẠI SỰ CỐ' : 'ISSUE TYPE'}</div>
                      <div className="type-val">
                         <span className="type-icon">
                         {idx === 0 ? <Droplets size={20} strokeWidth={2} /> : idx === 1 ? <Zap size={20} strokeWidth={2} /> : idx === 2 ? <DoorOpen size={20} strokeWidth={2} /> : <Snowflake size={20} strokeWidth={2} />}
                         </span>
                         <strong>{req.type}</strong>
                      </div>
                   </div>
                   <div className="issue-desc">
                      <div className="issue-label">{lang === 'vn' ? 'MÔ TẢ' : 'DESCRIPTION'}</div>
                      <p>{req.desc.substring(0, 80)}...</p>
                   </div>
                   <div className="req-meta">
                      <span className={`status-badge badge-${req.status.toLowerCase().replace(' ', '-')}`}>
                         {req.status}
                      </span>
                      <span className="meta-info">
                         {req.status === 'IN PROGRESS' 
                           ? (lang === 'vn' ? `Giao cho ${req.assigned}` : `Assigned to ${req.assigned}`) 
                           : (lang === 'vn' ? `Báo cáo bởi ${req.reporter || 'Sarah J.'}` : `Submitted by ${req.reporter || 'Sarah J.'}`)}
                      </span>
                   </div>
                </div>
                <div className="req-footer">
                   {req.status === 'COMPLETED' ? (
                     <button className="btn-secondary full" onClick={(e) => { e.stopPropagation(); setSelectedIssue(req); }}>{lang === 'vn' ? 'Xem chi tiết' : 'View Details'}</button>
                   ) : req.status === 'IN PROGRESS' ? (
                     <>
                       <button className="btn-secondary" onClick={(e) => e.stopPropagation()}>{lang === 'vn' ? 'Giao lại' : 'Reassign'}</button>
                       <button className="btn-primary" onClick={(e) => e.stopPropagation()}>{lang === 'vn' ? 'Hoàn thành' : 'Mark Done'}</button>
                     </>
                   ) : (
                     <>
                       <button className="btn-primary" onClick={(e) => e.stopPropagation()}>{lang === 'vn' ? 'Giao thợ' : 'Assign Worker'}</button>
                       <button className="btn-secondary" onClick={(e) => e.stopPropagation()}>{lang === 'vn' ? 'Hoàn thành' : 'Mark Done'}</button>
                     </>
                   )}
                </div>
             </div>
           ))}
           
           {/* New Request Placeholder */}
           <div className="card log-new-card">
              <div className="new-icon-box"><Plus size={24} strokeWidth={2} /></div>
              <div className="new-label">{lang === 'vn' ? 'Báo cáo sự cố mới' : 'Log New Issue'}</div>
           </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="maint-list-container card">
          <table className="maint-list-table">
            <thead>
              <tr>
                <th>{lang === 'vn' ? 'PHÒNG' : 'ROOM'}</th>
                <th>{lang === 'vn' ? 'LOẠI SỰ CỐ' : 'ISSUE TYPE'}</th>
                <th>{lang === 'vn' ? 'MÔ TẢ' : 'DESCRIPTION'}</th>
                <th>{lang === 'vn' ? 'MỨC ĐỘ' : 'URGENCY'}</th>
                <th>{lang === 'vn' ? 'TRẠNG THÁI' : 'STATUS'}</th>
                <th>{lang === 'vn' ? 'THỜI GIAN' : 'TIME'}</th>
                <th>{lang === 'vn' ? 'THAO TÁC' : 'ACTIONS'}</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req, idx) => (
                <tr key={idx} onClick={() => setSelectedIssue(req)} style={{ cursor: 'pointer' }}>
                  <td className="list-room-cell">
                    <strong className={`room-text-${req.color}`}>{req.room}</strong>
                  </td>
                  <td className="list-type-cell">
                    <span className="type-icon">
                      {idx === 0 ? <Droplets size={18} strokeWidth={2} /> : idx === 1 ? <Zap size={18} strokeWidth={2} /> : idx === 2 ? <DoorOpen size={18} strokeWidth={2} /> : <Snowflake size={18} strokeWidth={2} />}
                    </span>
                    <span>{req.type}</span>
                  </td>
                  <td className="list-desc-cell">{req.desc.substring(0, 60)}...</td>
                  <td className="list-urgency-cell">
                    <span className={`urgency-tag tag-${req.color}`}>{req.urgency}</span>
                  </td>
                  <td className="list-status-cell">
                    <span className={`status-badge badge-${req.status.toLowerCase().replace(' ', '-')}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="list-time-cell">{req.time}</td>
                  <td className="list-actions-cell">
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={(e) => { e.stopPropagation(); setSelectedIssue(req); }}
                      title={lang === 'vn' ? 'Xem chi tiết' : 'View Details'}
                      aria-label={lang === 'vn' ? 'Xem chi tiết' : 'View Details'}
                    >
                      <Eye size={18} strokeWidth={2} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Issue Detail Modal */}
      {selectedIssue && (
        <div className="modal-overlay" onClick={() => setSelectedIssue(null)}>
          <div className="modal-container issue-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{lang === 'vn' ? 'Chi tiết sự cố' : 'Issue Details'}</h3>
              <button className="close-btn" onClick={() => setSelectedIssue(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <div className="detail-row">
                  <span className="detail-label">{lang === 'vn' ? 'Phòng:' : 'Room:'}</span>
                  <span className="detail-value">{selectedIssue.room}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{lang === 'vn' ? 'Mức độ:' : 'Urgency:'}</span>
                  <span className={`urgency-tag tag-${selectedIssue.color}`}>{selectedIssue.urgency}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{lang === 'vn' ? 'Thời gian:' : 'Reported:'}</span>
                  <span className="detail-value">{selectedIssue.time}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{lang === 'vn' ? 'Loại sự cố:' : 'Issue Type:'}</span>
                  <span className="detail-value"><strong>{selectedIssue.type}</strong></span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{lang === 'vn' ? 'Trạng thái:' : 'Status:'}</span>
                  <span className={`status-badge badge-${selectedIssue.status.toLowerCase().replace(' ', '-')}`}>
                    {selectedIssue.status}
                  </span>
                </div>
                {selectedIssue.assigned && (
                  <div className="detail-row">
                    <span className="detail-label">{lang === 'vn' ? 'Người xử lý:' : 'Assigned to:'}</span>
                    <span className="detail-value">{selectedIssue.assigned}</span>
                  </div>
                )}
                {selectedIssue.reporter && (
                  <div className="detail-row">
                    <span className="detail-label">{lang === 'vn' ? 'Người báo cáo:' : 'Reported by:'}</span>
                    <span className="detail-value">{selectedIssue.reporter}</span>
                  </div>
                )}
              </div>
              <div className="detail-section">
                <h4>{lang === 'vn' ? 'Mô tả chi tiết' : 'Full Description'}</h4>
                <p className="full-description">{selectedIssue.desc}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setSelectedIssue(null)}>
                {lang === 'vn' ? 'Đóng' : 'Close'}
              </button>
              {selectedIssue.status !== 'COMPLETED' && (
                <button className="btn-primary">
                  {selectedIssue.status === 'IN PROGRESS' 
                    ? (lang === 'vn' ? 'Hoàn thành' : 'Mark Done')
                    : (lang === 'vn' ? 'Giao thợ' : 'Assign Worker')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;
