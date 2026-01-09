import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { chartService } from '../services/chartService';
import type {
  ActualVsRequiredDataPoint,
  CumulativeHoursByUser,
  ActualVsPlannedDataPoint,
} from '../types/charts';

interface ChartsProps {
  year: number;
  month: number;
  onClose?: () => void;
}

export const Charts = ({ year, month, onClose }: ChartsProps) => {
  const [actualVsRequired, setActualVsRequired] = useState<ActualVsRequiredDataPoint[]>([]);
  const [cumulativeData, setCumulativeData] = useState<CumulativeHoursByUser[]>([]);
  const [actualVsPlanned, setActualVsPlanned] = useState<ActualVsPlannedDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChartData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

  const fetchChartData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [actualVsRequiredData, cumulativeDataResult, actualVsPlannedData] = await Promise.all([
        chartService.getActualVsRequiredByDays(year, month),
        chartService.getCumulativeHoursByUsers(year, month),
        chartService.getActualVsPlannedByUsers(year, month),
      ]);

      setActualVsRequired(actualVsRequiredData);
      setCumulativeData(cumulativeDataResult);
      setActualVsPlanned(actualVsPlannedData);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка при загрузке данных графиков');
    } finally {
      setIsLoading(false);
    }
  };

  // Подготовка данных для графика накопленных часов (нужно преобразовать в формат для Recharts)
  const prepareCumulativeChartData = () => {
    if (cumulativeData.length === 0) {
      return [];
    }

    // Получаем все уникальные даты из всех пользователей
    const dates = new Set<string>();
    cumulativeData.forEach((user) => {
      user.data.forEach((point) => dates.add(point.date));
    });

    const sortedDates = Array.from(dates).sort((a, b) => {
      const partsA = a.split('.');
      const partsB = b.split('.');
      const dateA = new Date(parseInt(partsA[2]), parseInt(partsA[1]) - 1, parseInt(partsA[0]));
      const dateB = new Date(parseInt(partsB[2]), parseInt(partsB[1]) - 1, parseInt(partsB[0]));
      return dateA.getTime() - dateB.getTime();
    });

    const result: Array<{ date: string; [key: string]: string | number }> = [];

    sortedDates.forEach((date) => {
      const dataPoint: { date: string; [key: string]: string | number } = { date };
      cumulativeData.forEach((user) => {
        const point = user.data.find((d) => d.date === date);
        // Используем накопленное значение из данных, если есть, иначе 0
        dataPoint[user.email] = point ? point.cumulativeHours : 0;
      });
      result.push(dataPoint);
    });

    return result;
  };

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

  const monthName = MONTHS[month];

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  const cumulativeChartData = prepareCumulativeChartData();

  // Генерация цветов для графиков накопленных часов
  const colors = [
    '#1976d2',
    '#dc004e',
    '#ed6c02',
    '#2e7d32',
    '#9c27b0',
    '#0288d1',
    '#c62828',
    '#558b2f',
  ];

  return (
    <Box>
      {onClose && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">Графики аналитики - {monthName} {year}</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      )}
      {!onClose && (
        <Typography variant="h5" sx={{ mb: 3 }}>
          Графики аналитики - {monthName} {year}
        </Typography>
      )}

      {/* График 1: Сравнение фактических и требуемых часов по дням месяца */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Сравнение средних фактических и требуемых часов по дням месяца
        </Typography>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={actualVsRequired}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="actualHours"
              stroke="#1976d2"
              strokeWidth={2}
              name="Средние фактические часы"
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="requiredHours"
              stroke="#dc004e"
              strokeWidth={2}
              name="Требуемые часы"
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Paper>

      {/* График 4: Динамика накопленных часов по сотрудникам */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Динамика накопленных часов по сотрудникам
        </Typography>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={cumulativeChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            {cumulativeData.map((user, index) => (
              <Line
                key={user.userId}
                type="monotone"
                dataKey={user.email}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                name={user.email}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Paper>

      {/* График 7: Сравнение фактических и плановых часов по сотрудникам */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Сравнение фактических и плановых часов по сотрудникам
        </Typography>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={actualVsPlanned}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="email"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="actualHours" fill="#1976d2" name="Фактические часы" />
            <Bar dataKey="plannedHours" fill="#dc004e" name="Плановые часы" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
};

