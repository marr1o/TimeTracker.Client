import api from './api';
import type { TimeRecord, CreateTimeRecordDTO, UpdateTimeRecordDTO } from '../types/timeRecord';

export const timeRecordService = {
  async getTimeRecordsByUserId(
    from?: string,
    to?: string,
    userId?: number
  ): Promise<TimeRecord[]> {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    if (userId !== undefined) params.append('userId', userId.toString());

    const queryString = params.toString();
    const url = `/time-records${queryString ? `?${queryString}` : ''}`;
    const response = await api.get<TimeRecord[]>(url);
    return response.data;
  },

  async createTimeRecord(data: CreateTimeRecordDTO): Promise<TimeRecord> {
    const response = await api.post<TimeRecord>('/time-records', data);
    return response.data;
  },

  async updateTimeRecord(timeRecordId: number, data: UpdateTimeRecordDTO): Promise<TimeRecord> {
    const response = await api.put<TimeRecord>(`/time-records/${timeRecordId}`, data);
    return response.data;
  },

  async deleteTimeRecord(timeRecordId: number): Promise<void> {
    await api.delete(`/time-records/${timeRecordId}`);
  },
};

