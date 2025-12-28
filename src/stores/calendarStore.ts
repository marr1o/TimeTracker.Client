import { create } from 'zustand';
import type { TimeRecord, TimeRecordByDate, CreateTimeRecordDTO, UpdateTimeRecordDTO } from '../types/timeRecord';
import { timeRecordService } from '../services/timeRecordService';
import { useAuthStore } from './authStore';
import { formatDateToBackend, parseDateFromBackend } from '../utils/dateUtils';

interface CalendarStore {
  currentDate: Date;
  timeRecords: TimeRecordByDate;
  isLoading: boolean;
  error: string | null;
  selectedDate: string | null;
  selectedRecord: TimeRecord | null;
  isModalOpen: boolean;

  // Actions
  setCurrentDate: (date: Date) => void;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  fetchTimeRecords: (userId: number) => Promise<void>;
  openModal: (date: string, record?: TimeRecord) => void;
  closeModal: () => void;
  createTimeRecord: (data: CreateTimeRecordDTO) => Promise<void>;
  updateTimeRecord: (timeRecordId: number, data: UpdateTimeRecordDTO) => Promise<void>;
  deleteTimeRecord: (timeRecordId: number) => Promise<void>;
}

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  currentDate: new Date(),
  timeRecords: {},
  isLoading: false,
  error: null,
  selectedDate: null,
  selectedRecord: null,
  isModalOpen: false,

  setCurrentDate: (date: Date) => {
    set({ currentDate: date });
    const { user } = useAuthStore.getState();
    if (user) {
      get().fetchTimeRecords();
    }
  },

  goToPreviousMonth: () => {
    const current = get().currentDate;
    const newDate = new Date(current.getFullYear(), current.getMonth() - 1, 1);
    get().setCurrentDate(newDate);
  },

  goToNextMonth: () => {
    const current = get().currentDate;
    const newDate = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    get().setCurrentDate(newDate);
  },

  fetchTimeRecords: async () => {
    set({ isLoading: true, error: null });
    try {
      const current = get().currentDate;
      const year = current.getFullYear();
      const month = current.getMonth();

      // Первый и последний день месяца в формате DD.MM.YYYY
      const from = formatDateToBackend(new Date(year, month, 1));
      const to = formatDateToBackend(new Date(year, month + 1, 0));

      const records = await timeRecordService.getTimeRecordsByUserId(from, to);

      // Преобразуем массив в объект по датам (конвертируем DD.MM.YYYY в YYYY-MM-DD для ключей)
      const recordsByDate: TimeRecordByDate = {};
      records.forEach((record) => {
        const dateKey = parseDateFromBackend(record.date);
        recordsByDate[dateKey] = record;
      });

      set({ timeRecords: recordsByDate, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Ошибка при загрузке записей';
      set({ error: errorMessage, isLoading: false });
    }
  },

  openModal: (date: string, record?: TimeRecord) => {
    set({
      selectedDate: date,
      selectedRecord: record || null,
      isModalOpen: true,
    });
  },

  closeModal: () => {
    set({
      selectedDate: null,
      selectedRecord: null,
      isModalOpen: false,
    });
  },

  createTimeRecord: async (data: CreateTimeRecordDTO) => {
    set({ isLoading: true, error: null });
    try {
      // Конвертируем дату в формат DD.MM.YYYY для бэкенда
      const backendData = {
        ...data,
        date: formatDateToBackend(data.date),
      };
      const record = await timeRecordService.createTimeRecord(backendData);
      const dateKey = parseDateFromBackend(record.date);
      
      set((state) => ({
        timeRecords: {
          ...state.timeRecords,
          [dateKey]: record,
        },
        isLoading: false,
        isModalOpen: false,
        selectedDate: null,
        selectedRecord: null,
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Ошибка при создании записи';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateTimeRecord: async (timeRecordId: number, data: UpdateTimeRecordDTO) => {
    set({ isLoading: true, error: null });
    try {
      // Конвертируем дату в формат DD.MM.YYYY для бэкенда, если она есть
      const backendData = {
        ...data,
        ...(data.date && { date: formatDateToBackend(data.date) }),
      };
      const record = await timeRecordService.updateTimeRecord(timeRecordId, backendData);
      const dateKey = parseDateFromBackend(record.date);
      
      set((state) => ({
        timeRecords: {
          ...state.timeRecords,
          [dateKey]: record,
        },
        isLoading: false,
        isModalOpen: false,
        selectedDate: null,
        selectedRecord: null,
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Ошибка при обновлении записи';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  deleteTimeRecord: async (timeRecordId: number) => {
    set({ isLoading: true, error: null });
    try {
      await timeRecordService.deleteTimeRecord(timeRecordId);
      
      set((state) => {
        const newRecords = { ...state.timeRecords };
        // Находим и удаляем запись по ID
        Object.keys(newRecords).forEach((date) => {
          if (newRecords[date].id === timeRecordId) {
            delete newRecords[date];
          }
        });

        return {
          timeRecords: newRecords,
          isLoading: false,
          isModalOpen: false,
          selectedDate: null,
          selectedRecord: null,
        };
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Ошибка при удалении записи';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },
}));

