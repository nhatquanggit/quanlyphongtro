import { apiRequest, extractArray } from './client';

export interface Property {
  id: string;
  name: string;
  address: string;
  totalFloors: number;
  totalRooms: number;
  currency?: string;
  timezone?: string;
  ownerId?: string;
  settings?: Record<string, unknown>;
}

export const getProperties = async () => {
  const payload = await apiRequest<unknown>('/properties');
  return extractArray<Property>(payload);
};

export const updateProperty = async (id: string, body: Partial<Property>) =>
  apiRequest<Property>(`/properties/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
