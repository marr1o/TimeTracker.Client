import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  IconButton,
  Paper,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { scheduleService } from '../services/scheduleService';
import { formatDateToBackend } from '../utils/dateUtils';
import type { Schedule } from '../types/schedule';

const DAYS_OF_WEEK = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const MONTHS = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];

export const Schedule = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [scheduleData, setScheduleData] = useState<{ [date: string]: number }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    setScheduleData({});
    setError(null);
    setSuccess(null);
    fetchSchedule();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

  const fetchSchedule = async () => {
    setIsLoadingData(true);
    setError(null);
    try {
      const schedules = await scheduleService.getScheduleByMonth(year, month);
      const data: { [date: string]: number } = {};
      schedules.forEach((schedule) => {
        data[schedule.date] = schedule.requiredHours;
      });
      setScheduleData(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка при загрузке графика');
    } finally {
      setIsLoadingData(false);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Понедельник = 0

    const days: (number | null)[] = [];

    // Пустые ячейки до первого дня месяца
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Дни месяца
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const getDateString = (day: number): string => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = new Date(year, month, day);
    return formatDateToBackend(date);
  };

  const isWeekend = (day: number): boolean => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Воскресенье или суббота
  };

  const handleHoursChange = (day: number, value: string) => {
    const dateString = getDateString(day);
    if (value === '') {
      setScheduleData((prev) => {
        const newData = { ...prev };
        delete newData[dateString];
        return newData;
      });
      return;
    }
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 24) {
      setScheduleData((prev) => ({
        ...prev,
        [dateString]: numValue,
      }));
    }
  };

  const fillWeekdays = () => {
    setError(null);
    setSuccess(null);
    const days = getDaysInMonth(currentDate);
    const newData = { ...scheduleData };
    days.forEach((day) => {
      if (day !== null) {
        const dateString = getDateString(day);
        if (isWeekend(day)) {
          newData[dateString] = 0;
        } else {
          newData[dateString] = 8;
        }
      }
    });
    setScheduleData(newData);
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const days = getDaysInMonth(currentDate);
      const schedules: Array<{ date: string; requiredHours: number }> = [];

      // Проверяем, что все поля заполнены
      for (const day of days) {
        if (day !== null) {
          const dateString = getDateString(day);
          const hours = scheduleData[dateString];
          if (hours === undefined || hours === null || hours === '') {
            setError('Все поля должны быть заполнены');
            setIsLoading(false);
            return;
          }
          const hoursNum = typeof hours === 'number' ? hours : parseFloat(String(hours));
          if (isNaN(hoursNum)) {
            setError(`Неверное значение часов для даты ${dateString}`);
            setIsLoading(false);
            return;
          }
          schedules.push({
            date: dateString,
            requiredHours: hoursNum,
          });
        }
      }

      await scheduleService.updateSchedule({ schedules });
      setSuccess('График успешно сохранен');
      await fetchSchedule();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка при сохранении графика');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить график для этого месяца?')) {
      return;
    }

    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      await scheduleService.removeSchedule(year, month);
      setSuccess('График успешно удален');
      setScheduleData({});
      // Перезагружаем данные, чтобы убедиться, что все очищено
      await fetchSchedule();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка при удалении графика');
    } finally {
      setIsLoading(false);
    }
  };

  const monthName = MONTHS[currentDate.getMonth()];
  const days = getDaysInMonth(currentDate);

  return (
    <Box>
      <Paper elevation={2} sx={{ p: 3 }}>
        {/* Заголовок с навигацией */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <IconButton onClick={goToPreviousMonth} disabled={isLoading || isLoadingData}>
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant="h5" component="h2">
            {monthName} {year}
          </Typography>
          <IconButton onClick={goToNextMonth} disabled={isLoading || isLoadingData}>
            <ChevronRightIcon />
          </IconButton>
        </Box>

        {/* Кнопки управления */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            onClick={fillWeekdays}
            disabled={isLoading || isLoadingData}
          >
            Заполнить автоматически
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={isLoading || isLoadingData}
          >
            Сохранить
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={handleDelete}
            disabled={isLoading || isLoadingData}
          >
            Удалить расписание
          </Button>
        </Box>

        {/* Сообщения */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {isLoadingData ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: 1,
            }}
          >
            {/* Заголовки дней недели */}
            {DAYS_OF_WEEK.map((day) => (
              <Box
                key={day}
                sx={{
                  p: 1,
                  textAlign: 'center',
                  fontWeight: 'bold',
                  color: 'text.secondary',
                }}
              >
                {day}
              </Box>
            ))}

            {/* Дни месяца с полями ввода */}
            {days.map((day, index) => {
              if (day === null) {
                return <Box key={`empty-${index}`} />;
              }

              const dateString = getDateString(day);
              const hours = scheduleData[dateString] !== undefined ? scheduleData[dateString] : '';

              return (
                <Box
                  key={day}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 0.5,
                    p: 0.5,
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {day}
                  </Typography>
                  <TextField
                    type="number"
                    size="small"
                    value={hours}
                    onChange={(e) => handleHoursChange(day, e.target.value)}
                    disabled={isLoading || isLoadingData}
                    inputProps={{
                      min: 0,
                      max: 24,
                      step: 0.5,
                      style: { textAlign: 'center', padding: '8px' },
                    }}
                    sx={{
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        height: '40px',
                      },
                    }}
                  />
                </Box>
              );
            })}
          </Box>
        )}
      </Paper>
    </Box>
  );
};
