import api, { setLoggingOut } from './api';
import type { LoginDTO, RegisterDTO, AuthResponseDTO } from '../types/auth';

// Флаг для предотвращения запросов во время logout
let isLoggingOutFlag = false;

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
    // Устанавливаем флаги, чтобы предотвратить попытки обновления токена и новые запросы
    isLoggingOutFlag = true;
    setLoggingOut(true);
    
    try {
    await api.post('/auth/logout');
    } catch (error) {
      // Игнорируем ошибки при logout (токены могут быть уже удалены)
      console.warn('Logout request failed (this is usually OK):', error);
    } finally {
      // Не сбрасываем флаг сразу, чтобы дать время для завершения всех операций
      setTimeout(() => {
        isLoggingOutFlag = false;
        setLoggingOut(false);
      }, 100);
    }
  },

  async getCurrentUser(): Promise<{ userId: number; role: 'admin' | 'employee' }> {
    // Не делаем запрос, если происходит logout
    if (isLoggingOutFlag) {
      throw new Error('Logging out');
    }
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

