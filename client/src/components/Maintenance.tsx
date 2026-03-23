import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './Maintenance.css';
import { translations } from '../translations';
import type { Language } from '../translations';
import { Droplets, Zap, DoorOpen, Snowflake, Plus, Eye } from 'lucide-react';
import {
  completeMaintenance,
  getMaintenanceList,
  getMaintenanceStats,
  type MaintenanceItem,
  type MaintenanceStatus,
} from '../api/maintenance';
import { getProperties } from '../api/properties';

interface MaintProps {
  lang: Language;
}

const Maintenance: React.FC<MaintProps> = ({ lang }) => {
  const t = translations[lang].sidebar;
  const [selectedIssue, setSelectedIssue] = useState<MaintenanceItem | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [sortBy, setSortBy] = useState<'urgency' | 'newest'>('urgency');
  const [propertyId, setPropertyId] = useState<string | undefined>(undefined);
  const [requests, setRequests] = useState<MaintenanceItem[]>([]);
  const [stats, setStats] = useState<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMaintenance = useCallback(async (currentPropertyId?: string) => {
    const [list, summary] = await Promise.all([
      getMaintenanceList(currentPropertyId),
      getMaintenanceStats(currentPropertyId),
    ]);

    setRequests(list);
    setStats({
      total: summary.total,
      pending: summary.pending,
      inProgress: summary.inProgress,
      completed: summary.completed,
    });
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const properties = await getProperties();
        const currentPropertyId = properties[0]?.id;
        setPropertyId(currentPropertyId);
        await loadMaintenance(currentPropertyId);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load maintenance';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [loadMaintenance]);

  useEffect(() => {
    const syncViewMode = () => {
      if (window.innerWidth <= 768) {
        setViewMode('card');
      }
    };

    syncViewMode();
    window.addEventListener('resize', syncViewMode);
    return () => window.removeEventListener('resize', syncViewMode);
  }, []);

  const onMarkDone = async (id: string) => {
    try {
      await completeMaintenance(id, 0);
      await loadMaintenance(propertyId);
      if (selectedIssue?.id === id) {
        setSelectedIssue((prev) => (prev ? { ...prev, status: 'COMPLETED' as MaintenanceStatus } : prev));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to complete maintenance';
      alert(message);
    }
  };

  const getUrgencyColor = (urgency: MaintenanceItem['urgency']) => {
    if (urgency === 'HIGH') return 'red';
    if (urgency === 'MEDIUM') return 'blue';
    return 'gray';
  };

  const getUrgencyLabel = (urgency: MaintenanceItem['urgency']) => {
    if (urgency === 'HIGH') return lang === 'vn' ? 'KHẨN CẤP' : 'HIGH URGENCY';
    if (urgency === 'MEDIUM') return lang === 'vn' ? 'TRUNG BÌNH' : 'MEDIUM';
    return lang === 'vn' ? 'THẤP' : 'LOW';
  };

  const getTypeLabel = (type: MaintenanceItem['type']) => {
    if (lang !== 'vn') return type;
    if (type === 'PLUMBING') return 'Hệ thống nước';
    if (type === 'ELECTRICAL') return 'Điện';
    if (type === 'FURNITURE') return 'Nội thất';
    return 'Khác';
  };

  const getTypeIcon = (type: MaintenanceItem['type']) => {
    if (type === 'PLUMBING') return <Droplets size={20} strokeWidth={2} />;
    if (type === 'ELECTRICAL') return <Zap size={20} strokeWidth={2} />;
    if (type === 'FURNITURE') return <DoorOpen size={20} strokeWidth={2} />;
    return <Snowflake size={20} strokeWidth={2} />;
  };

  const formatRelativeTime = (value?: string) => {
    if (!value) return lang === 'vn' ? 'Không rõ' : 'Unknown';

    const diff = Date.now() - new Date(value).getTime();
    const hours = Math.max(1, Math.floor(diff / (1000 * 60 * 60)));
    if (hours < 24) return lang === 'vn' ? `${hours} GIỜ TRƯỚC` : `${hours} HRS AGO`;

    const days = Math.floor(hours / 24);
    return lang === 'vn' ? `${days} NGÀY TRƯỚC` : `${days} DAYS AGO`;
  };

  const sortedRequests = useMemo(() => {
    const urgencyRank: Record<MaintenanceItem['urgency'], number> = {
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1,
    };

    return [...requests].sort((a, b) => {
      if (sortBy === 'urgency') {
        return urgencyRank[b.urgency] - urgencyRank[a.urgency];
      }

      return new Date(b.reportedDate || b.createdAt || 0).getTime() - new Date(a.reportedDate || a.createdAt || 0).getTime();
    });
  }, [requests, sortBy]);

  return (
    <div className="maint-container">
      <div className="maint-summary">
        <div className="card summary-card">
          <div className="summary-label">{t.maintenance}</div>
          <div className="summary-val">{stats?.total ?? 0}</div>
        </div>
        <div className="card summary-card line-red">
          <div className="summary-label">{lang === 'vn' ? 'KHẨN CẤP' : 'HIGH URGENCY'}</div>
          <div className="summary-val red-text">{requests.filter((r) => r.urgency === 'HIGH' && r.status !== 'COMPLETED').length}</div>
        </div>
        <div className="card summary-card line-blue">
          <div className="summary-label">{lang === 'vn' ? 'ĐANG XỬ LÝ' : 'IN PROGRESS'}</div>
          <div className="summary-val blue-text">{stats?.inProgress ?? 0}</div>
        </div>
        <div className="card summary-card line-green">
          <div className="summary-label">{lang === 'vn' ? 'HOÀN THÀNH' : 'COMPLETED'}</div>
          <div className="summary-val green-text">{stats?.completed ?? 0}</div>
        </div>
      </div>

      <div className="maint-controls">
        <div className="ctrl-group">
          <div className="ctrl-title">{lang === 'vn' ? 'Theo dõi bảo trì' : 'Active Requests'}</div>
          <div className="view-toggle">
            <button className={`toggle-btn ${viewMode === 'card' ? 'active' : ''}`} onClick={() => setViewMode('card')}>
              {lang === 'vn' ? 'Dạng thẻ' : 'Card View'}
            </button>
            <button className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>
              {lang === 'vn' ? 'Dạng danh sách' : 'List View'}
            </button>
          </div>
        </div>
        <div className="sort-group">
          <span className="sort-label">{lang === 'vn' ? 'Sắp xếp:' : 'Sort by:'}</span>
          <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value as 'urgency' | 'newest')}>
            <option value="urgency">{lang === 'vn' ? 'Mức độ (Cao đến Thấp)' : 'Urgency (High to Low)'}</option>
            <option value="newest">{lang === 'vn' ? 'Mới nhất' : 'Newest first'}</option>
          </select>
        </div>
      </div>

      {loading && <div className="card no-results">{lang === 'vn' ? 'Đang tải yêu cầu bảo trì...' : 'Loading maintenance requests...'}</div>}
      {error && <div className="card no-results">{error}</div>}
      {!propertyId && !loading && <div className="card no-results">{lang === 'vn' ? 'Không tìm thấy property' : 'No property found'}</div>}

      {viewMode === 'card' && !loading && !error && (
        <div className="maint-grid">
          {sortedRequests.map((req) => {
            const color = getUrgencyColor(req.urgency);
            return (
              <div key={req.id} className="card req-card" onClick={() => setSelectedIssue(req)} style={{ cursor: 'pointer' }}>
                <div className={`req-header header-${color}`}>
                  <span className="req-room">{lang === 'vn' ? `Phòng ${req.room?.roomNumber || req.roomId}` : `Room ${req.room?.roomNumber || req.roomId}`}</span>
                  <span className={`urgency-tag tag-${color}`}>{getUrgencyLabel(req.urgency)}</span>
                  <span className="req-time">{formatRelativeTime(req.reportedDate || req.createdAt)}</span>
                </div>
                <div className="req-body">
                  <div className="issue-type">
                    <div className="issue-label">{lang === 'vn' ? 'LOẠI SỰ CỐ' : 'ISSUE TYPE'}</div>
                    <div className="type-val">
                      <span className="type-icon">{getTypeIcon(req.type)}</span>
                      <strong>{getTypeLabel(req.type)}</strong>
                    </div>
                  </div>
                  <div className="issue-desc">
                    <div className="issue-label">{lang === 'vn' ? 'MÔ TẢ' : 'DESCRIPTION'}</div>
                    <p>{req.description.substring(0, 80)}...</p>
                  </div>
                  <div className="req-meta">
                    <span className={`status-badge badge-${req.status.toLowerCase().replace('_', '-')}`}>{req.status}</span>
                    <span className="meta-info">
                      {req.status === 'IN_PROGRESS'
                        ? (lang === 'vn' ? `Giao cho ${req.assignedTo?.fullName || '-'}` : `Assigned to ${req.assignedTo?.fullName || '-'}`)
                        : (lang === 'vn' ? `Báo cáo bởi ${req.reportedBy?.fullName || '-'}` : `Submitted by ${req.reportedBy?.fullName || '-'}`)}
                    </span>
                  </div>
                </div>
                <div className="req-footer">
                  {req.status === 'COMPLETED' ? (
                    <button className="btn-secondary full" onClick={(e) => { e.stopPropagation(); setSelectedIssue(req); }}>
                      {lang === 'vn' ? 'Xem chi tiết' : 'View Details'}
                    </button>
                  ) : req.status === 'IN_PROGRESS' ? (
                    <>
                      <button className="btn-secondary" type="button" onClick={(e) => e.stopPropagation()} disabled>
                        {lang === 'vn' ? 'Giao lại' : 'Reassign'}
                      </button>
                      <button
                        className="btn-primary"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          void onMarkDone(req.id);
                        }}
                      >
                        {lang === 'vn' ? 'Hoàn thành' : 'Mark Done'}
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="btn-primary" type="button" onClick={(e) => e.stopPropagation()} disabled>
                        {lang === 'vn' ? 'Giao thợ' : 'Assign Worker'}
                      </button>
                      <button
                        className="btn-secondary"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          void onMarkDone(req.id);
                        }}
                      >
                        {lang === 'vn' ? 'Hoàn thành' : 'Mark Done'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}

          <div className="card log-new-card">
            <div className="new-icon-box"><Plus size={24} strokeWidth={2} /></div>
            <div className="new-label">{lang === 'vn' ? 'Báo cáo sự cố mới' : 'Log New Issue'}</div>
          </div>
        </div>
      )}

      {viewMode === 'list' && !loading && !error && (
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
              {sortedRequests.map((req) => {
                const color = getUrgencyColor(req.urgency);
                return (
                  <tr key={req.id} onClick={() => setSelectedIssue(req)} style={{ cursor: 'pointer' }}>
                    <td className="list-room-cell">
                      <strong className={`room-text-${color}`}>{lang === 'vn' ? `Phòng ${req.room?.roomNumber || req.roomId}` : `Room ${req.room?.roomNumber || req.roomId}`}</strong>
                    </td>
                    <td className="list-type-cell">
                      <span className="type-icon">{getTypeIcon(req.type)}</span>
                      <span>{getTypeLabel(req.type)}</span>
                    </td>
                    <td className="list-desc-cell">{req.description.substring(0, 60)}...</td>
                    <td className="list-urgency-cell">
                      <span className={`urgency-tag tag-${color}`}>{getUrgencyLabel(req.urgency)}</span>
                    </td>
                    <td className="list-status-cell">
                      <span className={`status-badge badge-${req.status.toLowerCase().replace('_', '-')}`}>{req.status}</span>
                    </td>
                    <td className="list-time-cell">{formatRelativeTime(req.reportedDate || req.createdAt)}</td>
                    <td className="list-actions-cell">
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedIssue(req);
                        }}
                        title={lang === 'vn' ? 'Xem chi tiết' : 'View Details'}
                        aria-label={lang === 'vn' ? 'Xem chi tiết' : 'View Details'}
                      >
                        <Eye size={18} strokeWidth={2} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

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
                  <span className="detail-value">{lang === 'vn' ? `Phòng ${selectedIssue.room?.roomNumber || selectedIssue.roomId}` : `Room ${selectedIssue.room?.roomNumber || selectedIssue.roomId}`}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{lang === 'vn' ? 'Mức độ:' : 'Urgency:'}</span>
                  <span className={`urgency-tag tag-${getUrgencyColor(selectedIssue.urgency)}`}>{getUrgencyLabel(selectedIssue.urgency)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{lang === 'vn' ? 'Thời gian:' : 'Reported:'}</span>
                  <span className="detail-value">{formatRelativeTime(selectedIssue.reportedDate || selectedIssue.createdAt)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{lang === 'vn' ? 'Loại sự cố:' : 'Issue Type:'}</span>
                  <span className="detail-value"><strong>{getTypeLabel(selectedIssue.type)}</strong></span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{lang === 'vn' ? 'Trạng thái:' : 'Status:'}</span>
                  <span className={`status-badge badge-${selectedIssue.status.toLowerCase().replace('_', '-')}`}>{selectedIssue.status}</span>
                </div>
                {selectedIssue.assignedTo?.fullName && (
                  <div className="detail-row">
                    <span className="detail-label">{lang === 'vn' ? 'Người xử lý:' : 'Assigned to:'}</span>
                    <span className="detail-value">{selectedIssue.assignedTo.fullName}</span>
                  </div>
                )}
                {selectedIssue.reportedBy?.fullName && (
                  <div className="detail-row">
                    <span className="detail-label">{lang === 'vn' ? 'Người báo cáo:' : 'Reported by:'}</span>
                    <span className="detail-value">{selectedIssue.reportedBy.fullName}</span>
                  </div>
                )}
              </div>
              <div className="detail-section">
                <h4>{lang === 'vn' ? 'Mô tả chi tiết' : 'Full Description'}</h4>
                <p className="full-description">{selectedIssue.description}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setSelectedIssue(null)}>
                {lang === 'vn' ? 'Đóng' : 'Close'}
              </button>
              {selectedIssue.status !== 'COMPLETED' && (
                <button
                  className="btn-primary"
                  onClick={() => {
                    void onMarkDone(selectedIssue.id);
                  }}
                >
                  {lang === 'vn' ? 'Hoàn thành' : 'Mark Done'}
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
