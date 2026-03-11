import React, { useState, useMemo } from 'react';
import './RoomManagement.css';
import { translations } from '../translations';
import type { Language } from '../translations';
import { Search, Pencil, FileText, MessageCircle } from 'lucide-react';

interface RoomProps {
  lang: Language;
}

interface RoomData {
  id: string;
  status: 'occupied' | 'vacant' | 'maint';
  tenant?: string;
  type: 'Single' | 'Double' | 'VIP' | 'Studio';
  price: string;
  issue?: string;
}

const RoomManagement: React.FC<RoomProps> = ({ lang }) => {
  const t = translations[lang].sidebar;
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // Generate 200 mock rooms
  const allRooms: RoomData[] = useMemo(() => {
    return Array.from({ length: 200 }, (_, i) => {
      const id = (i + 1).toString();
      const typeOptions: RoomData['type'][] = ['Single', 'Double', 'VIP', 'Studio'];
      
      const type = typeOptions[i % 4];
      const status = i % 10 === 0 ? 'vacant' : i % 15 === 0 ? 'maint' : 'occupied';
      
      return {
        id,
        status,
        type,
        price: i % 4 === 0 ? '5,000,000' : '3,500,000',
        tenant: status === 'occupied' ? `Tenant ${id}` : undefined,
        issue: status === 'maint' ? 'Air conditioner issue' : undefined
      };
    });
  }, []);

  const filteredRooms = allRooms.filter(room => {
    const matchesSearch = room.id.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || room.status === filterStatus;
    const matchesType = filterType === 'all' || room.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Group rooms by floors (20 per floor)
  const floorGroups = useMemo(() => {
    const groups: { floor: number; rooms: RoomData[] }[] = [];
    for (let i = 0; i < 200; i += 20) {
      const floorRooms = filteredRooms.filter(r => {
        const idNum = parseInt(r.id);
        return idNum > i && idNum <= i + 20;
      });
      if (floorRooms.length > 0) {
        groups.push({ floor: i / 20 + 1, rooms: floorRooms });
      }
    }
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
          <div className="kpi-main-value">200</div>
        </div>
        <div className="card kpi-card occupied-kpi">
          <div className="kpi-label">Occupied</div>
          <div className="kpi-main-value">{allRooms.filter(r => r.status === 'occupied').length}</div>
        </div>
        <div className="card kpi-card vacant-kpi">
          <div className="kpi-label">Vacant</div>
          <div className="kpi-main-value">{allRooms.filter(r => r.status === 'vacant').length}</div>
        </div>
      </div>

      {/* Dynamic Floor Rendering */}
      {floorGroups.map(group => (
        <div key={group.floor} className="floor-section">
          <div className="floor-divider">
            <span>{lang === 'vn' ? `Tầng ${group.floor} (Phòng ${(group.floor - 1) * 20 + 1}-${group.floor * 20})` : `Floor ${group.floor}`}</span>
            <span className="room-count">{group.rooms.length} {lang === 'vn' ? 'PHÒNG' : 'ROOMS'}</span>
          </div>
          <div className="rooms-container">
            {group.rooms.map(room => (
              <div key={room.id} className="card room-card">
                <div className="room-card-header">
                  <span className="room-number">{room.id}</span>
                  <span className={`status-badge badge-${room.status}`}>
                    {room.status.toUpperCase()}
                  </span>
                </div>
                <div className="room-card-body">
                  {room.status === 'occupied' ? (
                    <>
                      <div className="detail-label">TENANT</div>
                      <div className="detail-value">{room.tenant}</div>
                    </>
                  ) : room.status === 'vacant' ? (
                    <>
                      <div className="detail-label">STATUS</div>
                      <div className="detail-value status-text-green">Available</div>
                    </>
                  ) : (
                    <>
                      <div className="detail-label">ISSUE</div>
                      <div className="detail-value">{room.issue}</div>
                    </>
                  )}
                  <div className="room-type">
                    <span className="type-icon">🛌</span>
                    {room.type} • {room.price}đ
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
