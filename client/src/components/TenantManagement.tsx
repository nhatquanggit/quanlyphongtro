import React, { useEffect, useMemo, useState } from 'react';
import './TenantManagement.css';
import { translations } from '../translations';
import type { Language } from '../translations';
import { Users, CheckCircle, FileCheck, Wallet, SlidersHorizontal, Download } from 'lucide-react';
import { getProperties } from '../api/properties';
import { getTenants, type Tenant } from '../api/tenants';

interface TenantProps {
  lang: Language;
}

const TenantManagement: React.FC<TenantProps> = ({ lang }) => {
  const t = translations[lang].sidebar;
  const [activeTab, setActiveTab] = useState<'active' | 'expiring' | 'past'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 8;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const properties = await getProperties();
        const propertyId = properties[0]?.id;
        const tenantData = await getTenants(propertyId);
        setTenants(tenantData);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load tenants';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const allTenants = useMemo(() => {
    const colors = ['orange', 'teal', 'blue', 'purple', 'green'];
    return tenants.map((tenant, i) => {
      let status: 'active' | 'expiring' | 'past' = 'active';
      if (tenant.status === 'ENDING_SOON') status = 'expiring';
      if (tenant.status === 'PAST') status = 'past';

      return {
        id: tenant.id,
        name: tenant.fullName,
        email: tenant.email || '-',
        room: tenant.idCard || '-',
        phone: tenant.phone || '-',
        period: tenant.dateOfBirth || '-',
        deposit: '-',
        status,
        avatarColor: colors[i % colors.length]
      };
    });
  }, [tenants]);

  // Filter logic
  const filteredTenants = allTenants.filter(tenant => {
    const matchesTab = activeTab === 'active' 
      ? (tenant.status === 'active' || tenant.status === 'expiring') 
      : tenant.status === activeTab;
    
    // If "Ending Soon" tab is selected, only show expiring
    const finalMatchesTab = activeTab === 'expiring' ? tenant.status === 'expiring' : matchesTab;

    const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tenant.room.includes(searchTerm);
    
    return finalMatchesTab && matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredTenants.length / itemsPerPage);
  const paginatedTenants = filteredTenants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="tenant-mgmt">
      {/* KPI Cards */}
      <div className="tenant-kpi-row">
        <div className="card kpi-card">
          <div className="kpi-content">
            <div className="kpi-info">
              <div className="kpi-label">{t.tenants}</div>
              <div className="kpi-value">{allTenants.length}</div>
            </div>
            <div className="kpi-icon-circle blue"><Users size={20} strokeWidth={2} /></div>
          </div>
        </div>
        <div className="card kpi-card">
          <div className="kpi-content">
            <div className="kpi-info">
              <div className="kpi-label">{lang === 'vn' ? 'HĐ CÒN HẠN' : 'ACTIVE LEASES'}</div>
              <div className="kpi-value">{allTenants.filter(t => t.status !== 'past').length}</div>
            </div>
            <div className="kpi-icon-circle green"><CheckCircle size={20} strokeWidth={2} /></div>
          </div>
        </div>
        <div className="card kpi-card">
          <div className="kpi-content">
            <div className="kpi-info">
              <div className="kpi-label">{lang === 'vn' ? 'SẮP HẾT HẠN' : 'ENDING SOON'}</div>
              <div className="kpi-value">{allTenants.filter(t => t.status === 'expiring').length}</div>
            </div>
            <div className="kpi-icon-circle orange"><FileCheck size={20} strokeWidth={2} /></div>
          </div>
        </div>
        <div className="card kpi-card">
          <div className="kpi-content">
            <div className="kpi-info">
              <div className="kpi-label">{lang === 'vn' ? 'TỔNG TIỀN CỌC' : 'TOTAL DEPOSIT'}</div>
              <div className="kpi-value">--</div>
            </div>
            <div className="kpi-icon-circle purple"><Wallet size={20} strokeWidth={2} /></div>
          </div>
        </div>
      </div>

      {/* Search and Tabs */}
      <div className="search-and-tabs card">
        <div className="tenant-tabs">
          <button 
            className={`tab ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => { setActiveTab('active'); setCurrentPage(1); }}
          >
            {lang === 'vn' ? 'Đang hoạt động' : 'Active'}
          </button>
          <button 
            className={`tab ${activeTab === 'expiring' ? 'active' : ''}`}
            onClick={() => { setActiveTab('expiring'); setCurrentPage(1); }}
          >
            {lang === 'vn' ? 'Sắp hết hạn' : 'Ending Soon'}
          </button>
          <button 
            className={`tab ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => { setActiveTab('past'); setCurrentPage(1); }}
          >
            {lang === 'vn' ? 'Đã kết thúc' : 'Past'}
          </button>
        </div>
        <div className="tenant-actions-row">
           <div className="search-box-tenant">
             <input 
              type="text" 
              placeholder={lang === 'vn' ? 'Tìm khách hoặc số phòng...' : 'Search tenant or room...'} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
            <button type="button" className="btn-secondary"><SlidersHorizontal size={16} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 6 }} />{lang === 'vn' ? 'Bộ lọc' : 'More Filters'}</button>
            <button type="button" className="btn-secondary"><Download size={16} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 6 }} />{lang === 'vn' ? 'Xuất CSV' : 'Export CSV'}</button>
        </div>
      </div>

      {/* Tenant Table */}
      <div className="tenant-table-card card">
        {loading && <div className="showing-text" style={{ padding: 16 }}>{lang === 'vn' ? 'Đang tải khách thuê...' : 'Loading tenants...'}</div>}
        {error && <div className="showing-text" style={{ padding: 16 }}>{error}</div>}
        <table className="tenant-table">
          <thead>
            <tr>
              <th>{lang === 'vn' ? 'TÊN KHÁCH THUÊ' : 'TENANT NAME'}</th>
              <th>{lang === 'vn' ? 'SỐ PHÒNG' : 'ROOM NO.'}</th>
              <th>{lang === 'vn' ? 'SỐ ĐIỆN THOẠI' : 'PHONE NUMBER'}</th>
              <th>{lang === 'vn' ? 'THỜI HẠN HỢP ĐỒNG' : 'CONTRACT PERIOD'}</th>
              <th>{lang === 'vn' ? 'TIỀN CỌC' : 'DEPOSIT'}</th>
              <th>{lang === 'vn' ? 'THAO TÁC' : 'ACTIONS'}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTenants.map((tenant) => (
              <tr key={tenant.id}>
                <td>
                  <div className="tenant-info-cell">
                    <div className={`avatar avatar-${tenant.avatarColor}`} />
                    <div>
                      <div className="tenant-name">
                        {tenant.name} 
                        {tenant.status === 'expiring' && <span className="expiring-dot" />}
                      </div>
                      <div className="tenant-email">{tenant.email}</div>
                    </div>
                  </div>
                </td>
                <td className="room-cell">{tenant.room}</td>
                <td className="phone-cell">{tenant.phone}</td>
                <td>
                  <div className="period-cell">
                    <div className={`period-text ${tenant.status}`}>{tenant.period}</div>
                    <div className={`period-bar bar-${tenant.status}`} />
                  </div>
                </td>
                <td className="deposit-cell">{tenant.deposit}</td>
                <td>
                  <div className="action-cell">
                    <button className="btn-action">{lang === 'vn' ? 'Xem HĐ' : 'View Contract'}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Pagination */}
        <div className="table-footer">
          <div className="showing-text">
            Showing {(currentPage-1)*itemsPerPage + 1} to {Math.min(currentPage*itemsPerPage, filteredTenants.length)} of {filteredTenants.length} tenants
          </div>
          <div className="pagination">
            <button 
              className="page-arrow" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
              <button 
                key={num} 
                className={`page-num ${currentPage === num ? 'active' : ''}`}
                onClick={() => setCurrentPage(num)}
              >
                {num}
              </button>
            ))}
            <button 
              className="page-arrow" 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantManagement;
