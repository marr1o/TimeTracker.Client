import api from './api';
import type {
  ActualVsRequiredDataPoint,
  CumulativeHoursByUser,
  ActualVsPlannedDataPoint,
} from '../types/charts';

export const chartService = {
  async getActualVsRequiredByDays(year: number, month: number): Promise<ActualVsRequiredDataPoint[]> {
    const response = await api.get<ActualVsRequiredDataPoint[]>('/charts/actual-vs-required', {
      params: { year, month },
    });
    return response.data;
  },

  async getCumulativeHoursByUsers(year: number, month: number): Promise<CumulativeHoursByUser[]> {
    const response = await api.get<CumulativeHoursByUser[]>('/charts/cumulative-by-users', {
      params: { year, month },
    });
    return response.data;
  },

  async getActualVsPlannedByUsers(year: number, month: number): Promise<ActualVsPlannedDataPoint[]> {
    const response = await api.get<ActualVsPlannedDataPoint[]>('/charts/actual-vs-planned', {
      params: { year, month },
    });
    return response.data;
  },
};

