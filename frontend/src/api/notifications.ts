import client from './client';
import { NotificationItem } from '../types';

export const notificationsApi = {
  getNotifications: async (): Promise<NotificationItem[]> => {
    const response = await client.get('/notifications');
    return response.data.data.notifications || response.data.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await client.get('/notifications/unread-count');
    return response.data.data.count || response.data.data.unreadCount || 0;
  },

  markAsRead: async (id: string): Promise<void> => {
    await client.post(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await client.post('/notifications/mark-all-read');
  }
};
