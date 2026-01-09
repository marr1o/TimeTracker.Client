export type Schedule = {
  id: number;
  date: string; // DD.MM.YYYY
  requiredHours: number;
};

export type ScheduleItem = {
  date: string; // DD.MM.YYYY
  requiredHours: number;
};

export type UpdateScheduleBulkDTO = {
  schedules: ScheduleItem[];
};
