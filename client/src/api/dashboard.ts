import { apiRequest, buildQueryString, extractArray } from './client';

export interface DashboardKpis {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  occupancyRate: number;
  collectionRate: number;
}

export interface DashboardActivity {
  id?: string;
  title?: string;
  description?: string;
  createdAt?: string;
  amount?: number;
  type?: string;
  [key: string]: unknown;
}

export interface DashboardAlert {
  id?: string;
  title?: string;
  description?: string;
  severity?: string;
  createdAt?: string;
  [key: string]: unknown;
}

export const getDashboardKpis = (propertyId?: string) =>
  apiRequest<DashboardKpis>(`/dashboard/kpis${buildQueryString({ propertyId })}`);

export const getDashboardActivities = async (propertyId?: string, limit = 10) => {
  const payload = await apiRequest<unknown>(`/dashboard/activities${buildQueryString({ propertyId, limit })}`);
  return extractArray<DashboardActivity>(payload);
};

export const getDashboardAlerts = async (propertyId?: string) => {
  const payload = await apiRequest<unknown>(`/dashboard/alerts${buildQueryString({ propertyId })}`);
  return extractArray<DashboardAlert>(payload);
};

export const getRevenueChart = (propertyId?: string, months = 6) =>
  apiRequest<Record<string, unknown>>(`/dashboard/revenue-chart${buildQueryString({ propertyId, months })}`);

export const getOccupancyTrend = (propertyId?: string, months = 6) =>
  apiRequest<Record<string, unknown>>(`/dashboard/occupancy-trend${buildQueryString({ propertyId, months })}`);
