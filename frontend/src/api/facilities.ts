import client from './client';
import { Facility, Booking } from '../types';

export interface CreateBookingParams {
  facilityId: string;
  date: string;
  startTime: string;
  endTime: string;
  notes: string;
}

export const facilitiesApi = {
  getFacilities: async (): Promise<Facility[]> => {
    const response = await client.get('/facilities/facilities');
    return response.data.data.facilities || response.data.data;
  },

  getBookings: async (): Promise<Booking[]> => {
    const response = await client.get('/facilities/bookings');
    return response.data.data.bookings || response.data.data;
  },

  createBooking: async (params: CreateBookingParams): Promise<Booking> => {
    const response = await client.post('/facilities/bookings', params);
    return response.data.data.booking || response.data.data;
  },

  cancelBooking: async (id: string): Promise<Booking> => {
    const response = await client.patch(`/facilities/bookings/${id}/cancel`);
    return response.data.data.booking || response.data.data;
  }
};
