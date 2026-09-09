import client from './client';
import { EventItem } from '../types';

export interface RsvpParams {
  status: 'going' | 'maybe' | 'not_going';
}

export interface CreateEventParams {
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  maxAttendees?: number;
  isVirtual?: boolean;
  meetingLink?: string;
}

export const eventsApi = {
  getEvents: async (): Promise<EventItem[]> => {
    const response = await client.get('/events');
    return response.data.data.events || response.data.data;
  },

  getById: async (id: string): Promise<EventItem> => {
    const response = await client.get(`/events/${id}`);
    return response.data.data.event || response.data.data;
  },

  create: async (params: CreateEventParams): Promise<EventItem> => {
    const response = await client.post('/events', params);
    return response.data.data.event || response.data.data;
  },

  rsvp: async (id: string, status: RsvpParams['status']): Promise<EventItem> => {
    const response = await client.post(`/events/${id}/rsvp`, { status });
    return response.data.data.event || response.data.data;
  }
};
