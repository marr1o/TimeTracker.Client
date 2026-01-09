import type { User } from './auth';

export type { User };

export type UserStatistics = {
  userId: number;
  email: string;
  totalHours: number;
  expectedHours?: number;
};

export type UpdateUserDTO = {
  id: number;
  email?: string;
  password?: string;
  role?: User['role'];
};

