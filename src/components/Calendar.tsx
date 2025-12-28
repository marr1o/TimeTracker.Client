import { useEffect } from 'react';
import { Box, Button, Typography, IconButton, Paper } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useCalendarStore } from '../stores/calendarStore';
import { useAuthStore } from '../stores/authStore';
import { TimeRecordModal } from './TimeRecordModal';

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

export const Calendar = () => {
  const {
    currentDate,
    timeRecords,
    isLoading,
    goToPreviousMonth,
    goToNextMonth,
    fetchTimeRecords,
    openModal,
  } = useCalendarStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      fetchTimeRecords();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, user?.id]);

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

  const getDateString = (day: number) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = new Date(year, month, day);
    // Форматируем дату напрямую без toISOString, чтобы избежать проблем с часовыми поясами
    const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    return dateStr;
  };

  const hasTimeRecord = (day: number) => {
    if (day === null) return false;
    const dateString = getDateString(day);
    return !!timeRecords[dateString];
  };

  const getTimeRecord = (day: number) => {
    if (day === null) return null;
    const dateString = getDateString(day);
    return timeRecords[dateString] || null;
  };

  const handleDayClick = (day: number) => {
    if (day === null) return;
    const dateString = getDateString(day);
    const record = getTimeRecord(day);
    openModal(dateString, record || undefined);
  };

  const monthName = MONTHS[currentDate.getMonth()];
  const year = currentDate.getFullYear();
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
          <IconButton onClick={goToPreviousMonth} disabled={isLoading}>
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant="h5" component="h2">
            {monthName} {year}
          </Typography>
          <IconButton onClick={goToNextMonth} disabled={isLoading}>
            <ChevronRightIcon />
          </IconButton>
        </Box>

        {/* Календарь */}
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

          {/* Дни месяца */}
          {days.map((day, index) => {
            if (day === null) {
              return <Box key={`empty-${index}`} />;
            }

            const hasRecord = hasTimeRecord(day);
            const record = getTimeRecord(day);

            return (
              <Button
                key={day}
                variant={hasRecord ? 'contained' : 'outlined'}
                color={hasRecord ? 'primary' : 'inherit'}
                onClick={() => handleDayClick(day)}
                disabled={isLoading}
                sx={{
                  minHeight: '60px',
                  aspectRatio: '1',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <Typography variant="body1" component="span">
                  {day}
                </Typography>
                {hasRecord && record && (
                  <Typography
                    variant="caption"
                    component="span"
                    sx={{
                      fontSize: '0.7rem',
                      mt: 0.5,
                      opacity: 0.9,
                    }}
                  >
                    {record.hours}ч
                  </Typography>
                )}
              </Button>
            );
          })}
        </Box>
      </Paper>

      <TimeRecordModal />
    </Box>
  );
};

