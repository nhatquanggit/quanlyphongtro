import { apiRequest, buildQueryString, extractArray } from './client';

export type ContractStatus = 'ACTIVE' | 'EXPIRED' | 'TERMINATED';

export interface Contract {
  id: string;
  roomId: string;
  tenantId: string;
  propertyId: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  deposit: number;
  electricityPrice: number;
  waterPrice: number;
  services?: Record<string, unknown>;
  status: ContractStatus;
  signedDate?: string;
  notes?: string;
  createdAt?: string;
  room?: {
    id: string;
    roomNumber: string;
    floor?: number;
    type?: string;
  };
  tenant?: {
    id: string;
    fullName: string;
    phone?: string;
    email?: string;
  };
  property?: {
    id: string;
    name: string;
  };
}

export interface ContractStats {
  total: number;
  active: number;
  expired: number;
  terminated: number;
  endingSoon: number;
}

export interface ContractQuery {
  propertyId?: string;
  status?: ContractStatus;
  tenantId?: string;
  roomId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateContractPayload {
  roomId: string;
  tenantId: string;
  propertyId: string;
  startDate: string;
  termMonths: number;
  monthlyRent?: number;
  deposit?: number;
  electricityPrice?: number;
  waterPrice?: number;
  services?: Record<string, unknown>;
  signedDate?: string;
  notes?: string;
}

export interface UpdateContractPayload {
  status?: ContractStatus;
  monthlyRent?: number;
  deposit?: number;
  electricityPrice?: number;
  waterPrice?: number;
  services?: Record<string, unknown>;
  signedDate?: string;
  notes?: string;
}

export const getContracts = async (params: ContractQuery = {}) => {
  const payload = await apiRequest<unknown>(`/contracts${buildQueryString(params as Record<string, unknown>)}`);
  return extractArray<Contract>(payload);
};

export const getContractStats = (propertyId?: string) =>
  apiRequest<ContractStats>(`/contracts/stats${buildQueryString({ propertyId })}`);

export const createContract = (body: CreateContractPayload) =>
  apiRequest<Contract>('/contracts', {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const updateContract = (id: string, body: UpdateContractPayload) =>
  apiRequest<Contract>(`/contracts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });

export const getPrintableContract = (id: string) =>
  apiRequest<{ contract: Contract; html: string }>(`/contracts/${id}/printable`);
