export type ActualVsRequiredDataPoint = {
  date: string; // DD.MM.YYYY
  actualHours: number;
  requiredHours: number;
};

export type CumulativeHoursDataPoint = {
  date: string; // DD.MM.YYYY
  cumulativeHours: number;
};

export type CumulativeHoursByUser = {
  userId: number;
  email: string;
  data: CumulativeHoursDataPoint[];
};

export type ActualVsPlannedDataPoint = {
  userId: number;
  email: string;
  actualHours: number;
  plannedHours: number;
};

