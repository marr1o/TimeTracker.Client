import axios, { AxiosError } from 'axios';
import type { AxiosRequestConfig } from 'axios';
import API_BASE_URL from '../config/api';

// Создаем экземпляр axios
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Важно для работы с cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Флаг для отслеживания процесса обновления токена
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Interceptor для запросов
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor для ответов
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as (AxiosRequestConfig & {
      _retry?: boolean;
    }) | undefined;

    // Если получили 401 и это не запрос на refresh/login/register и еще не пытались обновить токен
    // Не делаем refresh для login/register, так как там 401 означает неправильные данные
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/login') || 
                          originalRequest?.url?.includes('/auth/register');
    
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !isAuthEndpoint
    ) {
      if (isRefreshing) {
        // Если уже идет процесс обновления, добавляем запрос в очередь
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Пытаемся обновить токен
        await api.post('/auth/refresh');
        processQueue(null, null);
        isRefreshing = false;

        // Повторяем оригинальный запрос
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
        isRefreshing = false;

        // Если refresh не удался, перенаправляем на страницу логина
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

