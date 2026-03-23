import { apiRequest, buildQueryString, extractArray } from './client';

export type MaintenanceStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type MaintenanceUrgency = 'LOW' | 'MEDIUM' | 'HIGH';
export type MaintenanceType = 'PLUMBING' | 'ELECTRICAL' | 'FURNITURE' | 'OTHER';

export interface MaintenanceItem {
  id: string;
  roomId: string;
  propertyId: string;
  reportedById?: string;
  assignedToId?: string;
  title: string;
  description: string;
  type: MaintenanceType;
  urgency: MaintenanceUrgency;
  status: MaintenanceStatus;
  cost?: number;
  notes?: string;
  images?: string[];
  reportedDate?: string;
  completedDate?: string;
  room?: {
    roomNumber?: string;
    floor?: number;
  };
  assignedTo?: {
    fullName?: string;
    phone?: string;
  };
  reportedBy?: {
    fullName?: string;
  };
  createdAt?: string;
}

export interface MaintenanceStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  highUrgency: number;
  totalCost: number;
  byType: Array<{
    type: MaintenanceType;
    count: number;
  }>;
}

export interface CreateMaintenancePayload {
  roomId: string;
  propertyId: string;
  title: string;
  description: string;
  type: MaintenanceType;
  urgency: MaintenanceUrgency;
  reportedById?: string;
  images?: string[];
}

export const getMaintenanceList = async (propertyId?: string, status?: MaintenanceStatus, urgency?: MaintenanceUrgency) => {
  const payload = await apiRequest<unknown>(`/maintenance${buildQueryString({ propertyId, status, urgency, page: 1, limit: 100 })}`);
  return extractArray<MaintenanceItem>(payload);
};

export const createMaintenance = (body: CreateMaintenancePayload) =>
  apiRequest<MaintenanceItem>('/maintenance', {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const getMaintenanceStats = (propertyId?: string) =>
  apiRequest<MaintenanceStats>(`/maintenance/stats${buildQueryString({ propertyId })}`);

export const assignMaintenance = (id: string, assignedToId: string, scheduledDate?: string) =>
  apiRequest<MaintenanceItem>(`/maintenance/${id}/assign`, {
    method: 'PATCH',
    body: JSON.stringify({ assignedToId, scheduledDate }),
  });

export const completeMaintenance = (id: string, cost = 0, notes?: string) =>
  apiRequest<MaintenanceItem>(`/maintenance/${id}/complete`, {
    method: 'PATCH',
    body: JSON.stringify({ cost, notes }),
  });
