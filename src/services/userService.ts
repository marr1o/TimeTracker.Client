import api from './api';
import type { User, UpdateUserDTO } from '../types/user';

export const userService = {
  async getUsers(): Promise<User[]> {
    const response = await api.get<User[]>('/users');
    return response.data;
  },

  async getUserById(userId: number): Promise<User> {
    const response = await api.get<User>(`/users/${userId}`);
    return response.data;
  },

  async updateUser(data: UpdateUserDTO): Promise<User> {
    const response = await api.put<User>('/users/update', data);
    return response.data;
  },

  async deleteUser(id: number): Promise<void> {
    await api.delete('/users/delete', { data: { id } });
  },
};

