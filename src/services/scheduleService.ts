import api from './api';
import type { Schedule, UpdateScheduleBulkDTO } from '../types/schedule';

export const scheduleService = {
  async getScheduleByMonth(year: number, month: number): Promise<Schedule[]> {
    const response = await api.get<Schedule[]>('/schedule', {
      params: { year, month },
    });
    return response.data;
  },

  async updateSchedule(data: UpdateScheduleBulkDTO): Promise<Schedule[]> {
    const response = await api.post<Schedule[]>('/schedule', data);
    return response.data;
  },

  async removeSchedule(year: number, month: number): Promise<void> {
    await api.delete('/schedule', {
      params: { year, month },
    });
  },
};
