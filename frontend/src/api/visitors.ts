import client from './client';
import { Visitor } from '../types';

export interface CreateVisitorParams {
  name: string;
  phone: string;
  purpose: string;
  hostFlat: string;
  hostName?: string;
  vehicleNumber?: string;
}

export const visitorsApi = {
  getVisitors: async (): Promise<Visitor[]> => {
    const response = await client.get('/visitors');
    return response.data.data.visitors || response.data.data;
  },

  createVisitor: async (params: CreateVisitorParams): Promise<Visitor> => {
    const response = await client.post('/visitors', params);
    return response.data.data.visitor || response.data.data;
  },

  checkIn: async (id: string): Promise<Visitor> => {
    const response = await client.post(`/visitors/${id}/check-in`);
    return response.data.data.visitor || response.data.data;
  },

  checkOut: async (id: string): Promise<Visitor> => {
    const response = await client.post(`/visitors/${id}/check-out`);
    return response.data.data.visitor || response.data.data;
  }
};
