import client from './client';
import { User } from '../types';

export interface LoginParams {
  email: string;
  password: string;
}

export interface RegisterParams {
  name: string;
  email: string;
  phone: string;
  password: string;
  societyId: string;
  role?: string;
  flatNumber?: string;
  wing?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  login: async (credentials: LoginParams): Promise<AuthResponse> => {
    const response = await client.post('/auth/login', credentials);
    return response.data.data;
  },

  register: async (data: RegisterParams): Promise<AuthResponse> => {
    const response = await client.post('/auth/register', data);
    return response.data.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await client.get('/auth/me');
    return response.data.data.user;
  },

  logout: async (): Promise<void> => {
    await client.post('/auth/logout');
  }
};
