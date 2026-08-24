import axiosClient from './axiosClient';
import { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth';

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },
  
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  getMe: async (): Promise<AuthResponse['user']> => {
    const response = await axiosClient.get<AuthResponse['user']>('/auth/me');
    return response.data;
  },

  updateProfile: async (data: { name: string; bio?: string }): Promise<AuthResponse['user']> => {
    const response = await axiosClient.put<AuthResponse['user']>('/auth/me', data);
    return response.data;
  }
};
