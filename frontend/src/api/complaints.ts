import client from './client';
import { Complaint } from '../types';

export interface CreateComplaintParams {
  title: string;
  description: string;
  category: 'plumbing' | 'electrical' | 'carpentry' | 'security' | 'cleanliness' | 'noise' | 'other';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface UpdateComplaintStatusParams {
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
}

export const complaintsApi = {
  getComplaints: async (): Promise<Complaint[]> => {
    const response = await client.get('/complaints');
    return response.data.data.complaints || response.data.data;
  },

  getById: async (id: string): Promise<Complaint> => {
    const response = await client.get(`/complaints/${id}`);
    return response.data.data.complaint || response.data.data;
  },

  create: async (params: CreateComplaintParams): Promise<Complaint> => {
    const response = await client.post('/complaints', params);
    return response.data.data.complaint || response.data.data;
  },

  updateStatus: async (id: string, params: UpdateComplaintStatusParams): Promise<Complaint> => {
    const response = await client.patch(`/complaints/${id}`, params);
    return response.data.data.complaint || response.data.data;
  },

  addComment: async (id: string, text: string): Promise<Complaint> => {
    const response = await client.post(`/complaints/${id}/comments`, { text });
    return response.data.data.complaint || response.data.data;
  }
};
