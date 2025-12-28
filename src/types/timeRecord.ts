export type TimeRecord = {
  id: number;
  date: string;
  hours: number;
  userId: number;
  description: string;
};

export type CreateTimeRecordDTO = {
  date: string;
  hours: number;
  description: string;
};

export type UpdateTimeRecordDTO = {
  date?: string;
  hours?: number;
  userId?: number;
  description?: string;
};

export type TimeRecordByDate = {
  [date: string]: TimeRecord;
};

