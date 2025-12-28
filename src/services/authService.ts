import api from './api';
import type { LoginDTO, RegisterDTO, AuthResponseDTO } from '../types/auth';

export const authService = {
  async login(credentials: LoginDTO): Promise<AuthResponseDTO> {
    const response = await api.post<AuthResponseDTO>('/auth/login', credentials);
    return response.data;
  },

  async register(data: RegisterDTO): Promise<AuthResponseDTO> {
    const response = await api.post<AuthResponseDTO>('/auth/register', data);
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async getCurrentUser(): Promise<{ userId: number; role: 'admin' | 'employee' }> {
    const response = await api.get<{ userId: number; role: 'admin' | 'employee' }>('/auth/me');
    return response.data;
  },

  async updateProfile(data: {
    currentPassword: string;
    email?: string;
    newPassword?: string;
  }): Promise<AuthResponseDTO> {
    const response = await api.put<AuthResponseDTO>('/auth/profile', data);
    return response.data;
  },
};

