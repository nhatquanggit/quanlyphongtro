import React, { useEffect, useMemo, useState } from 'react';
import './RoomManagement.css';
import { translations } from '../translations';
import type { Language } from '../translations';
import { Search, Pencil, FileText, MessageCircle } from 'lucide-react';
import { getProperties } from '../api/properties';
import { getRooms, getRoomStats, type Room, type RoomStatus, type RoomType } from '../api/rooms';

interface RoomProps {
  lang: Language;
}

const RoomManagement: React.FC<RoomProps> = ({ lang }) => {
  const t = translations[lang].sidebar;
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [stats, setStats] = useState<{ total: number; occupied: number; vacant: number } | null>(null);
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

        const [roomData, roomStats] = await Promise.all([
          getRooms({ propertyId: currentPropertyId, page: 1, limit: 200 }),
          getRoomStats(currentPropertyId),
        ]);

        setRooms(roomData);
        setStats({
          total: roomStats.total,
          occupied: roomStats.occupied,
          vacant: roomStats.vacant,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load rooms';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filteredRooms = rooms.filter((room) => {
    const normalizedRoomNumber = room.roomNumber || '';
    const matchesSearch =
      normalizedRoomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.contracts?.[0]?.tenant?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());

    const statusMap: Record<string, RoomStatus> = {
      occupied: 'OCCUPIED',
      vacant: 'VACANT',
      maint: 'MAINTENANCE',
    };
    const matchesStatus = filterStatus === 'all' || room.status === statusMap[filterStatus];

    const typeMap: Record<string, RoomType> = {
      Single: 'SINGLE',
      Double: 'DOUBLE',
      VIP: 'VIP',
      Studio: 'STUDIO',
    };
    const matchesType = filterType === 'all' || room.type === typeMap[filterType];

    return matchesSearch && matchesStatus && matchesType;
  });

  const floorGroups = useMemo(() => {
    const grouped = new Map<number, Room[]>();
    filteredRooms.forEach((room) => {
      const floor = Number(room.floor || 0);
      const floorRooms = grouped.get(floor) || [];
      floorRooms.push(room);
      grouped.set(floor, floorRooms);
    });

    const groups = Array.from(grouped.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([floor, floorRooms]) => ({ floor, rooms: floorRooms }));

    return groups;
  }, [filteredRooms]);

  return (
    <div className="room-mgmt-grid">
      {/* Search and Filters Bar */}
      <div className="room-filters-bar card">
        <div className="room-search-box">
          <Search className="search-icon" size={18} strokeWidth={2} />
          <input 
            type="text" 
            placeholder={lang === 'vn' ? 'Tìm theo số phòng...' : 'Search room number...'} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="room-filter-group">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">{lang === 'vn' ? 'Tất cả trạng thái' : 'All Status'}</option>
            <option value="occupied">Occupied</option>
            <option value="vacant">Vacant</option>
            <option value="maint">Maintenance</option>
          </select>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">{lang === 'vn' ? 'Tất cả loại phòng' : 'All Types'}</option>
            <option value="Single">Single</option>
            <option value="Double">Double</option>
            <option value="VIP">VIP</option>
            <option value="Studio">Studio</option>
          </select>
        </div>
      </div>

      {/* KPIs Summary */}
      <div className="room-kpi-row">
        <div className="card kpi-card">
          <div className="kpi-label">{t.rooms}</div>
          <div className="kpi-main-value">{stats?.total ?? 0}</div>
        </div>
        <div className="card kpi-card occupied-kpi">
          <div className="kpi-label">Occupied</div>
          <div className="kpi-main-value">{stats?.occupied ?? 0}</div>
        </div>
        <div className="card kpi-card vacant-kpi">
          <div className="kpi-label">Vacant</div>
          <div className="kpi-main-value">{stats?.vacant ?? 0}</div>
        </div>
      </div>

      {loading && <div className="card no-results">{lang === 'vn' ? 'Đang tải dữ liệu phòng...' : 'Loading rooms...'}</div>}
      {error && <div className="card no-results">{error}</div>}
      {!propertyId && !loading && <div className="card no-results">{lang === 'vn' ? 'Không tìm thấy property để tải phòng' : 'No property found to load rooms'}</div>}

      {/* Dynamic Floor Rendering */}
      {floorGroups.map(group => (
        <div key={group.floor} className="floor-section">
          <div className="floor-divider">
            <span>{lang === 'vn' ? `Tầng ${group.floor}` : `Floor ${group.floor}`}</span>
            <span className="room-count">{group.rooms.length} {lang === 'vn' ? 'PHÒNG' : 'ROOMS'}</span>
          </div>
          <div className="rooms-container">
            {group.rooms.map(room => (
              <div key={room.id} className="card room-card">
                <div className="room-card-header">
                  <span className="room-number">{room.roomNumber}</span>
                  <span className={`status-badge badge-${room.status === 'MAINTENANCE' ? 'maint' : room.status.toLowerCase()}`}>
                    {room.status}
                  </span>
                </div>
                <div className="room-card-body">
                  {room.status === 'OCCUPIED' ? (
                    <>
                      <div className="detail-label">TENANT</div>
                      <div className="detail-value">{room.contracts?.[0]?.tenant?.fullName || '-'}</div>
                    </>
                  ) : room.status === 'VACANT' ? (
                    <>
                      <div className="detail-label">STATUS</div>
                      <div className="detail-value status-text-green">Available</div>
                    </>
                  ) : (
                    <>
                      <div className="detail-label">ISSUE</div>
                      <div className="detail-value">{lang === 'vn' ? 'Đang bảo trì' : 'Under maintenance'}</div>
                    </>
                  )}
                  <div className="room-type">
                    <span className="type-icon">🛌</span>
                    {room.type} • {Number(room.price || 0).toLocaleString()}đ
                  </div>
                </div>
                <div className="room-card-footer">
                  <button type="button" className="icon-btn" title="Edit" aria-label="Edit"><Pencil size={16} strokeWidth={2} /></button>
                  <button type="button" className="icon-btn" title="History" aria-label="History"><FileText size={16} strokeWidth={2} /></button>
                  <button type="button" className="icon-btn" title="Chat" aria-label="Chat"><MessageCircle size={16} strokeWidth={2} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {floorGroups.length === 0 && (
        <div className="no-results card">
          {lang === 'vn' ? 'Không tìm thấy phòng phù hợp' : 'No rooms match your filters'}
        </div>
      )}
    </div>
  );
};

export default RoomManagement;
