import { apiRequest, buildQueryString, extractArray } from './client';

export type RoomStatus = 'VACANT' | 'OCCUPIED' | 'MAINTENANCE';
export type RoomType = 'SINGLE' | 'DOUBLE' | 'VIP' | 'STUDIO';

export interface Room {
  id: string;
  propertyId: string;
  roomNumber: string;
  floor: number;
  type: RoomType;
  status: RoomStatus;
  price: number;
  deposit: number;
  area?: number;
  amenities?: Record<string, unknown>;
  description?: string;
  images?: string[];
  tenantName?: string;
  contracts?: Array<{
    id: string;
    tenant?: {
      fullName?: string;
      phone?: string;
    };
  }>;
}

export interface RoomStats {
  total: number;
  vacant: number;
  occupied: number;
  maintenance: number;
  occupancyRate: number;
}

export interface GetRoomsParams {
  propertyId?: string;
  status?: RoomStatus;
  type?: RoomType;
  floor?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateRoomPayload {
  propertyId: string;
  roomNumber: string;
  floor: number;
  type: RoomType;
  price: number;
  deposit: number;
  area?: number;
  description?: string;
}

export const getRooms = async (params: GetRoomsParams = {}) => {
  const payload = await apiRequest<unknown>(`/rooms${buildQueryString(params as Record<string, unknown>)}`);
  return extractArray<Room>(payload);
};

export const getRoomStats = (propertyId?: string) =>
  apiRequest<RoomStats>(`/rooms/stats${buildQueryString({ propertyId })}`);

export const createRoom = (body: CreateRoomPayload) =>
  apiRequest<Room>('/rooms', {
    method: 'POST',
    body: JSON.stringify(body),
  });
