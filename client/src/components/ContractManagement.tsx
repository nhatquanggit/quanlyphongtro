import React, { useEffect, useMemo, useState } from 'react';
import './ContractManagement.css';
import type { Language } from '../translations';
import { getProperties } from '../api/properties';
import { getRooms } from '../api/rooms';
import { getTenants } from '../api/tenants';
import {
  createContract,
  getContracts,
  getContractStats,
  getPrintableContract,
  updateContract,
  type Contract,
  type ContractStatus,
} from '../api/contracts';

interface ContractManagementProps {
  lang: Language;
}

const ContractManagement: React.FC<ContractManagementProps> = ({ lang }) => {
  const [propertyId, setPropertyId] = useState<string | undefined>(undefined);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [rooms, setRooms] = useState<Array<{ id: string; roomNumber: string; status: string; type?: string }>>([]);
  const [tenants, setTenants] = useState<Array<{ id: string; fullName: string; phone?: string }>>([]);
  const [stats, setStats] = useState<{ total: number; active: number; endingSoon: number; expired: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | ContractStatus>('all');
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState({
    roomId: '',
    tenantId: '',
    startDate: new Date().toISOString().slice(0, 10),
    termMonths: 6,
    monthlyRent: '',
    deposit: '',
    electricityPrice: '3500',
    waterPrice: '18000',
    notes: '',
  });

  const loadData = async (currentPropertyId?: string) => {
    if (!currentPropertyId) {
      setContracts([]);
      setRooms([]);
      setTenants([]);
      setStats(null);
      return;
    }

    const [contractData, statsData, roomData, tenantData] = await Promise.all([
      getContracts({ propertyId: currentPropertyId, page: 1, limit: 500 }),
      getContractStats(currentPropertyId),
      getRooms({ propertyId: currentPropertyId, page: 1, limit: 500 }),
      getTenants(currentPropertyId),
    ]);

    setContracts(contractData);
    setStats({
      total: statsData.total,
      active: statsData.active,
      endingSoon: statsData.endingSoon,
      expired: statsData.expired + statsData.terminated,
    });
    setRooms(
      roomData.map((room) => ({
        id: room.id,
        roomNumber: room.roomNumber,
        status: room.status,
        type: room.type,
      })),
    );
    setTenants(
      tenantData.map((tenant) => ({
        id: tenant.id,
        fullName: tenant.fullName,
        phone: tenant.phone,
      })),
    );
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        setError(null);
        const properties = await getProperties();
        const currentPropertyId = properties[0]?.id;
        setPropertyId(currentPropertyId);
        await loadData(currentPropertyId);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load contracts';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void initialize();
  }, []);

  const availableRooms = useMemo(
    () => rooms.filter((room) => room.status !== 'OCCUPIED' || room.id === formData.roomId),
    [rooms, formData.roomId],
  );

  const filteredContracts = useMemo(() => {
    return contracts.filter((contract) => {
      const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
      const keyword = search.trim().toLowerCase();
      const matchesSearch =
        keyword.length === 0 ||
        contract.room?.roomNumber?.toLowerCase().includes(keyword) ||
        contract.tenant?.fullName?.toLowerCase().includes(keyword) ||
        contract.notes?.toLowerCase().includes(keyword);

      return matchesStatus && matchesSearch;
    });
  }, [contracts, search, statusFilter]);

  const durationText = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const months = Math.max(1, (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth()));
    return lang === 'vn' ? `${months} tháng` : `${months} months`;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyId) return;

    try {
      setSubmitting(true);
      setError(null);

      await createContract({
        propertyId,
        roomId: formData.roomId,
        tenantId: formData.tenantId,
        startDate: formData.startDate,
        termMonths: Number(formData.termMonths),
        monthlyRent: formData.monthlyRent ? Number(formData.monthlyRent) : undefined,
        deposit: formData.deposit ? Number(formData.deposit) : undefined,
        electricityPrice: formData.electricityPrice ? Number(formData.electricityPrice) : undefined,
        waterPrice: formData.waterPrice ? Number(formData.waterPrice) : undefined,
        notes: formData.notes.trim() || undefined,
      });

      await loadData(propertyId);
      setFormData((prev) => ({
        ...prev,
        roomId: '',
        tenantId: '',
        notes: '',
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create contract';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const onTerminate = async (id: string) => {
    try {
      await updateContract(id, { status: 'TERMINATED' });
      await loadData(propertyId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update contract';
      setError(message);
    }
  };

  const onPrint = async (id: string) => {
    try {
      const result = await getPrintableContract(id);
      const printWindow = window.open('', '_blank', 'width=900,height=700');
      if (!printWindow) {
        alert(lang === 'vn' ? 'Trình duyệt chặn cửa sổ in.' : 'Popup is blocked by browser.');
        return;
      }

      printWindow.document.open();
      printWindow.document.write(result.html);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to print contract';
      setError(message);
    }
  };

  return (
    <div className="contracts-page">
      <div className="contracts-kpi-row">
        <div className="card contracts-kpi">
          <div className="kpi-label">{lang === 'vn' ? 'TỔNG HỢP ĐỒNG' : 'TOTAL CONTRACTS'}</div>
          <div className="kpi-value">{stats?.total ?? 0}</div>
        </div>
        <div className="card contracts-kpi active">
          <div className="kpi-label">{lang === 'vn' ? 'ĐANG HIỆU LỰC' : 'ACTIVE'}</div>
          <div className="kpi-value">{stats?.active ?? 0}</div>
        </div>
        <div className="card contracts-kpi warning">
          <div className="kpi-label">{lang === 'vn' ? 'SẮP HẾT HẠN (30 NGÀY)' : 'ENDING SOON (30 DAYS)'}</div>
          <div className="kpi-value">{stats?.endingSoon ?? 0}</div>
        </div>
        <div className="card contracts-kpi expired">
          <div className="kpi-label">{lang === 'vn' ? 'ĐÃ KẾT THÚC' : 'ENDED'}</div>
          <div className="kpi-value">{stats?.expired ?? 0}</div>
        </div>
      </div>

      <div className="contracts-main-grid">
        <div className="card contract-form-card">
          <div className="section-title">{lang === 'vn' ? 'Lập hợp đồng mới' : 'Create New Contract'}</div>
          <form className="contract-form" onSubmit={onSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>{lang === 'vn' ? 'Phòng' : 'Room'}</label>
                <select
                  value={formData.roomId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, roomId: e.target.value }))}
                  required
                >
                  <option value="">{lang === 'vn' ? '-- Chọn phòng --' : '-- Select room --'}</option>
                  {availableRooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.roomNumber} ({room.type || '-'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>{lang === 'vn' ? 'Khách thuê' : 'Tenant'}</label>
                <select
                  value={formData.tenantId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tenantId: e.target.value }))}
                  required
                >
                  <option value="">{lang === 'vn' ? '-- Chọn khách thuê --' : '-- Select tenant --'}</option>
                  {tenants.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.fullName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>{lang === 'vn' ? 'Ngày bắt đầu' : 'Start date'}</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>{lang === 'vn' ? 'Thời hạn hợp đồng' : 'Term'}</label>
                <select
                  value={String(formData.termMonths)}
                  onChange={(e) => setFormData((prev) => ({ ...prev, termMonths: Number(e.target.value) }))}
                  required
                >
                  <option value="3">3 {lang === 'vn' ? 'tháng' : 'months'}</option>
                  <option value="6">6 {lang === 'vn' ? 'tháng' : 'months'}</option>
                  <option value="9">9 {lang === 'vn' ? 'tháng' : 'months'}</option>
                  <option value="12">12 {lang === 'vn' ? 'tháng' : 'months'}</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>{lang === 'vn' ? 'Tiền phòng / tháng' : 'Monthly rent'}</label>
                <input
                  type="number"
                  placeholder="4500000"
                  value={formData.monthlyRent}
                  onChange={(e) => setFormData((prev) => ({ ...prev, monthlyRent: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>{lang === 'vn' ? 'Tiền cọc' : 'Deposit'}</label>
                <input
                  type="number"
                  placeholder="4500000"
                  value={formData.deposit}
                  onChange={(e) => setFormData((prev) => ({ ...prev, deposit: e.target.value }))}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>{lang === 'vn' ? 'Điện (VND/kWh)' : 'Electricity (VND/kWh)'}</label>
                <input
                  type="number"
                  value={formData.electricityPrice}
                  onChange={(e) => setFormData((prev) => ({ ...prev, electricityPrice: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>{lang === 'vn' ? 'Nước (VND/m3)' : 'Water (VND/m3)'}</label>
                <input
                  type="number"
                  value={formData.waterPrice}
                  onChange={(e) => setFormData((prev) => ({ ...prev, waterPrice: e.target.value }))}
                />
              </div>
            </div>

            <div className="form-group">
              <label>{lang === 'vn' ? 'Ghi chú' : 'Notes'}</label>
              <textarea
                rows={3}
                placeholder={lang === 'vn' ? 'Điều khoản bổ sung...' : 'Additional terms...'}
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </div>

            <button className="btn-submit-contract" type="submit" disabled={submitting || !propertyId}>
              {submitting ? (lang === 'vn' ? 'Đang tạo...' : 'Creating...') : (lang === 'vn' ? 'Tạo hợp đồng' : 'Create Contract')}
            </button>
          </form>
        </div>

        <div className="card contract-list-card">
          <div className="contract-list-head">
            <div className="section-title">{lang === 'vn' ? 'Quản lý hợp đồng' : 'Contract Management'}</div>
            <div className="contract-filters">
              <input
                type="text"
                className="contract-search"
                placeholder={lang === 'vn' ? 'Tìm theo phòng/khách...' : 'Search room/tenant...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | ContractStatus)}>
                <option value="all">{lang === 'vn' ? 'Tất cả trạng thái' : 'All status'}</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="EXPIRED">EXPIRED</option>
                <option value="TERMINATED">TERMINATED</option>
              </select>
            </div>
          </div>

          {loading && <div className="contracts-empty">{lang === 'vn' ? 'Đang tải hợp đồng...' : 'Loading contracts...'}</div>}
          {error && <div className="contracts-empty contracts-error">{error}</div>}
          {!propertyId && !loading && <div className="contracts-empty">{lang === 'vn' ? 'Không tìm thấy property' : 'No property found'}</div>}

          <div className="contracts-table-wrap">
            <table className="contracts-table">
              <thead>
                <tr>
                  <th>{lang === 'vn' ? 'PHÒNG' : 'ROOM'}</th>
                  <th>{lang === 'vn' ? 'KHÁCH THUÊ' : 'TENANT'}</th>
                  <th>{lang === 'vn' ? 'KỲ HẠN' : 'TERM'}</th>
                  <th>{lang === 'vn' ? 'TIỀN THÁNG' : 'MONTHLY RENT'}</th>
                  <th>{lang === 'vn' ? 'TRẠNG THÁI' : 'STATUS'}</th>
                  <th>{lang === 'vn' ? 'THAO TÁC' : 'ACTIONS'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredContracts.map((contract) => (
                  <tr key={contract.id}>
                    <td data-label={lang === 'vn' ? 'Phòng' : 'Room'}>{contract.room?.roomNumber || '-'}</td>
                    <td data-label={lang === 'vn' ? 'Khách thuê' : 'Tenant'}>
                      <div className="tenant-line">{contract.tenant?.fullName || '-'}</div>
                      <div className="sub-line">{contract.tenant?.phone || '-'}</div>
                    </td>
                    <td data-label={lang === 'vn' ? 'Kỳ hạn' : 'Term'}>
                      <div>{durationText(contract.startDate, contract.endDate)}</div>
                      <div className="sub-line">
                        {new Date(contract.startDate).toLocaleDateString()} - {new Date(contract.endDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td data-label={lang === 'vn' ? 'Tiền tháng' : 'Monthly rent'}>{Number(contract.monthlyRent || 0).toLocaleString()} VND</td>
                    <td data-label={lang === 'vn' ? 'Trạng thái' : 'Status'}>
                      <span className={`contract-status status-${contract.status.toLowerCase()}`}>{contract.status}</span>
                    </td>
                    <td data-label={lang === 'vn' ? 'Thao tác' : 'Actions'}>
                      <div className="table-actions">
                        <button type="button" onClick={() => void onPrint(contract.id)}>
                          {lang === 'vn' ? 'In' : 'Print'}
                        </button>
                        {contract.status === 'ACTIVE' && (
                          <button type="button" className="danger" onClick={() => void onTerminate(contract.id)}>
                            {lang === 'vn' ? 'Kết thúc' : 'Terminate'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!loading && !error && filteredContracts.length === 0 && (
            <div className="contracts-empty">{lang === 'vn' ? 'Không có hợp đồng phù hợp' : 'No matching contracts'}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContractManagement;
