import { create } from 'zustand';
import type { User, AuthState, LoginDTO, RegisterDTO } from '../types/auth';
import { authService } from '../services/authService';

interface AuthStore extends AuthState {
  login: (credentials: LoginDTO) => Promise<void>;
  register: (data: RegisterDTO) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (credentials: LoginDTO) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login(credentials);
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || 'Ошибка при входе. Проверьте данные.';
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  register: async (data: RegisterDTO) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.register(data);
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || 'Ошибка при регистрации.';
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const userData = await authService.getCurrentUser();
      // Получаем полные данные пользователя из credentials cookie или используем полученные данные
      const credentialsCookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith('credentials='));
      
      if (credentialsCookie) {
        try {
          const credentials = JSON.parse(
            decodeURIComponent(credentialsCookie.split('=')[1])
          );
          set({
            user: {
              id: credentials.userId,
              email: '', // Email не хранится в credentials cookie
              role: credentials.role,
            },
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch {
          // Если не удалось распарсить cookie, используем данные из API
          set({
            user: {
              id: userData.userId,
              email: '',
              role: userData.role,
            },
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        }
      } else {
        set({
          user: {
            id: userData.userId,
            email: '',
            role: userData.role,
          },
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  setUser: (user: User) => {
    set({ user, isAuthenticated: true });
  },
}));

