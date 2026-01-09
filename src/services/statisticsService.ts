import api from './api';
import type { UserStatistics } from '../types/user';

export const statisticsService = {
  async getUserStatistics(year: number, month: number): Promise<UserStatistics[]> {
    const response = await api.get<UserStatistics[]>('/time-records/statistics', {
      params: { year, month: month + 1 }, // month + 1 потому что на бэкенде месяц 1-12
    });
    return response.data;
  },

  async getExpectedHours(year: number, month: number): Promise<number> {
    const response = await api.get<{ expectedHours: number }>('/schedule/expected', {
      params: { year, month },
    });
    return response.data.expectedHours;
  },
};

