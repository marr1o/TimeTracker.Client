import api from './api';
import type { Notification } from '../types/notification';

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    const response = await api.get<Notification[]>('/notifications');
    return response.data;
  },

  async getUnreadCount(): Promise<number> {
    const response = await api.get<{ count: number }>('/notifications/unread/count');
    return response.data.count;
  },

  async markAsRead(notificationId: number): Promise<Notification> {
    const response = await api.post<Notification>(`/notifications/${notificationId}/read`);
    return response.data;
  },

  async markAllAsRead(): Promise<number> {
    const response = await api.post<{ count: number }>('/notifications/read-all');
    return response.data.count;
  },

  async checkAndCreateNotifications(): Promise<void> {
    await api.post('/notifications/check');
  },
};
