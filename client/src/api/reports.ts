import { apiRequest, buildQueryString, extractArray } from './client';

export type ReportType = 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export interface Report {
  id: string;
  propertyId: string;
  reportType: ReportType;
  period: string;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  unpaidDues: number;
  occupancyRate: number;
  data?: Record<string, unknown>;
  createdAt?: string;
}

export const getReports = async (propertyId?: string) => {
  const payload = await apiRequest<unknown>(`/reports${buildQueryString({ propertyId, page: 1, limit: 100 })}`);
  return extractArray<Report>(payload);
};

export const generateReport = (propertyId: string, reportType: ReportType, period: string) =>
  apiRequest<Report>('/reports/generate', {
    method: 'POST',
    body: JSON.stringify({ propertyId, reportType, period }),
  });
