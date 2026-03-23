import { apiRequest, buildQueryString, extractArray } from './client';

export type InvoiceStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE';

export interface Invoice {
  id: string;
  contractId: string;
  tenantId: string;
  roomId: string;
  propertyId: string;
  billingMonth: string;
  dueDate: string;
  rentAmount: number;
  electricityUsage?: number;
  electricityCost?: number;
  waterUsage?: number;
  waterCost?: number;
  serviceCharges?: Record<string, number>;
  totalAmount: number;
  paidAmount?: number;
  remainingAmount?: number;
  status: InvoiceStatus;
  paymentDate?: string;
  paymentMethod?: string;
  notes?: string;
  room?: {
    roomNumber?: string;
    floor?: number;
  };
  tenant?: {
    fullName?: string;
    phone?: string;
    email?: string;
  };
}

export interface InvoiceStats {
  totalInvoices: number;
  paidInvoices: number;
  unpaidInvoices: number;
  overdueInvoices: number;
  totalRevenue: number;
  totalUnpaid: number;
  collectionRate: number;
}

export const getInvoices = async (propertyId?: string, status?: InvoiceStatus) => {
  const payload = await apiRequest<unknown>(`/invoices${buildQueryString({ propertyId, status, page: 1, limit: 100 })}`);
  return extractArray<Invoice>(payload);
};

export const getInvoiceStats = (propertyId?: string) =>
  apiRequest<InvoiceStats>(`/invoices/stats${buildQueryString({ propertyId })}`);

export const generateInvoices = (propertyId: string, billingMonth: string, dueDate: string) =>
  apiRequest<Invoice[]>('/invoices/generate-all', {
    method: 'POST',
    body: JSON.stringify({ propertyId, billingMonth, dueDate }),
  });

export const markInvoicePaid = (id: string, paidAmount: number, paymentDate: string) =>
  apiRequest<Invoice>(`/invoices/${id}/mark-paid`, {
    method: 'PATCH',
    body: JSON.stringify({ paidAmount, paymentDate }),
  });
