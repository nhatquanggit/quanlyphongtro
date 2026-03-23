import { apiRequest, buildQueryString, extractArray } from './client';

export interface NotificationItem {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export const getNotifications = async (limit = 10) => {
  const payload = await apiRequest<unknown>(`/notifications${buildQueryString({ limit })}`);
  return extractArray<NotificationItem>(payload);
};

export const getUnreadCount = () => apiRequest<{ unread: number }>('/notifications/unread-count');

export const markNotificationAsRead = (id: string) =>
  apiRequest<NotificationItem>(`/notifications/${id}/read`, {
    method: 'PATCH',
  });

export const markAllNotificationsAsRead = () =>
  apiRequest<{ updated: number }>('/notifications/read-all', {
    method: 'PATCH',
  });
