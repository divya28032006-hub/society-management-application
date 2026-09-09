import client from './client';
import { EmergencyContact } from '../types';

export const emergencyApi = {
  getContacts: async (): Promise<EmergencyContact[]> => {
    const response = await client.get('/emergency');
    return response.data.data.emergencyContacts || response.data.data.contacts || response.data.data;
  }
};
