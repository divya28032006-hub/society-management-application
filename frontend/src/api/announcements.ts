import client from './client';
import { Announcement } from '../types';

export interface CreateAnnouncementParams {
  title: string;
  content: string;
  category?: 'general' | 'maintenance' | 'emergency' | 'event' | 'admin';
  pinned?: boolean;
}

export const announcementsApi = {
  getAnnouncements: async (): Promise<Announcement[]> => {
    const response = await client.get('/announcements');
    return response.data.data.announcements || response.data.data;
  },

  getById: async (id: string): Promise<Announcement> => {
    const response = await client.get(`/announcements/${id}`);
    return response.data.data.announcement || response.data.data;
  },

  create: async (params: CreateAnnouncementParams): Promise<Announcement> => {
    const response = await client.post('/announcements', params);
    return response.data.data.announcement || response.data.data;
  },

  markAsRead: async (id: string): Promise<void> => {
    await client.post(`/announcements/${id}/read`);
  }
};
