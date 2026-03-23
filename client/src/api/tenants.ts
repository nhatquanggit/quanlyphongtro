import { apiRequest, buildQueryString, extractArray } from './client';

export type TenantStatus = 'ACTIVE' | 'ENDING_SOON' | 'PAST';

export interface Tenant {
  id: string;
  propertyId: string;
  fullName: string;
  phone: string;
  email?: string;
  idCard?: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: Record<string, unknown>;
  status?: TenantStatus;
}

export interface CreateTenantPayload {
  propertyId: string;
  fullName: string;
  phone: string;
  email?: string;
  idCard?: string;
  address?: string;
}

export const getTenants = async (propertyId?: string) => {
  const payload = await apiRequest<unknown>(`/tenants${buildQueryString({ propertyId })}`);
  return extractArray<Tenant>(payload);
};

export const createTenant = (body: CreateTenantPayload) =>
  apiRequest<Tenant>('/tenants', {
    method: 'POST',
    body: JSON.stringify(body),
  });
