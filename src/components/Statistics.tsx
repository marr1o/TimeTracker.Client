import { useState, useEffect, Fragment } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  CircularProgress,
  Alert,
  Collapse,
  Button,
  Dialog,
  DialogContent,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import BarChartIcon from '@mui/icons-material/BarChart';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { statisticsService } from '../services/statisticsService';
import { timeRecordService } from '../services/timeRecordService';
import { formatDateToBackend } from '../utils/dateUtils';
import { Charts } from './Charts';
import api from '../services/api';
import { notificationService } from '../services/notificationService';
import { useAuthStore } from '../stores/authStore';
import type { UserStatistics } from '../types/user';
import type { TimeRecord } from '../types/timeRecord';

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

export const Statistics = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const [currentDate, setCurrentDate] = useState(new Date());
  const [statistics, setStatistics] = useState<UserStatistics[]>([]);
  const [expectedHours, setExpectedHours] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [userDetails, setUserDetails] = useState<Map<number, TimeRecord[]>>(new Map());
  const [loadingDetails, setLoadingDetails] = useState<Set<number>>(new Set());
  const [chartsOpen, setChartsOpen] = useState(false);
  const [sendingNotifications, setSendingNotifications] = useState(false);
  const [notificationSuccess, setNotificationSuccess] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    fetchStatistics();
    // Очищаем развернутые строки и детали при смене месяца/года
    setExpandedRows(new Set());
    setUserDetails(new Map());
    setNotificationSuccess(null);
    setError(null);
  }, [year, month]);

  const fetchStatistics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [data, expected] = await Promise.all([
        statisticsService.getUserStatistics(year, month),
        statisticsService.getExpectedHours(year, month),
      ]);
      setStatistics(data);
      setExpectedHours(expected);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка при загрузке статистики');
    } finally {
      setIsLoading(false);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleYearChange = (newYear: number) => {
    setCurrentDate(new Date(newYear, month, 1));
  };

  const handleMonthChange = (newMonth: number) => {
    setCurrentDate(new Date(year, newMonth, 1));
  };

  const totalHours = statistics.reduce((sum, stat) => sum + stat.totalHours, 0);

  const handleRowClick = async (userId: number) => {
    const isExpanded = expandedRows.has(userId);
    
    if (isExpanded) {
      // Сворачиваем строку
      const newExpanded = new Set(expandedRows);
      newExpanded.delete(userId);
      setExpandedRows(newExpanded);
    } else {
      // Разворачиваем строку
      const newExpanded = new Set(expandedRows);
      newExpanded.add(userId);
      setExpandedRows(newExpanded);
      
      // Загружаем детали, если их еще нет
      if (!userDetails.has(userId)) {
        setLoadingDetails((prev) => new Set(prev).add(userId));
        try {
          // Вычисляем первый и последний день месяца
          const from = formatDateToBackend(new Date(year, month, 1));
          const to = formatDateToBackend(new Date(year, month + 1, 0));
          
          const records = await timeRecordService.getTimeRecordsByUserId(from, to, userId);
          
          // Сортируем по дате (от новых к старым)
          const sortedRecords = [...records].sort((a, b) => {
            const dateA = new Date(a.date.split('.').reverse().join('-'));
            const dateB = new Date(b.date.split('.').reverse().join('-'));
            return dateB.getTime() - dateA.getTime();
          });
          
          setUserDetails((prev) => {
            const newDetails = new Map(prev);
            newDetails.set(userId, sortedRecords);
            return newDetails;
          });
        } catch (err: any) {
          console.error('Error fetching user details:', err);
          setError(err.response?.data?.error || 'Ошибка при загрузке детальной информации');
        } finally {
          setLoadingDetails((prev) => {
            const newLoading = new Set(prev);
            newLoading.delete(userId);
            return newLoading;
          });
        }
      }
    }
  };

  const handleDownloadReport = async () => {
    try {
      const response = await api.get('/charts/management-report', {
        params: { year, month },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'text/plain; charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${year}_${month + 1}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error('Error downloading report:', err);
      setError(err.response?.data?.error || 'Ошибка при скачивании отчета');
    }
  };

  const handleSendNotifications = async () => {
    setSendingNotifications(true);
    setError(null);
    setNotificationSuccess(null);
    try {
      await notificationService.checkAndCreateNotifications();
      setNotificationSuccess('Уведомления успешно разосланы всем сотрудникам');
      // Автоматически скрываем сообщение через 3 секунды
      setTimeout(() => {
        setNotificationSuccess(null);
      }, 3000);
    } catch (err: any) {
      console.error('Error sending notifications:', err);
      setError(err.response?.data?.error || 'Ошибка при рассылке уведомлений');
    } finally {
      setSendingNotifications(false);
    }
  };

  return (
    <Box>
      <Paper elevation={2} sx={{ p: 3 }}>
        {notificationSuccess && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setNotificationSuccess(null)}>
            {notificationSuccess}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">Статистика по пользователям</Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<BarChartIcon />}
              onClick={() => setChartsOpen(true)}
              disabled={isLoading}
            >
              Посмотреть график
            </Button>
            {isAdmin && (
              <>
                <Button
                  variant="outlined"
                  startIcon={<NotificationsIcon />}
                  onClick={handleSendNotifications}
                  disabled={isLoading || sendingNotifications}
                  color="primary"
                >
                  {sendingNotifications ? 'Отправка...' : 'Разослать уведомления'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<FileDownloadIcon />}
                  onClick={handleDownloadReport}
                  disabled={isLoading}
                  color="secondary"
                >
                  Отчет руководству
                </Button>
              </>
            )}
            <IconButton onClick={goToPreviousMonth} disabled={isLoading}>
              <ChevronLeftIcon />
            </IconButton>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Месяц</InputLabel>
              <Select value={month} label="Месяц" onChange={(e) => handleMonthChange(Number(e.target.value))}>
                {MONTHS.map((monthName, index) => (
                  <MenuItem key={index} value={index}>
                    {monthName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>Год</InputLabel>
              <Select value={year} label="Год" onChange={(e) => handleYearChange(Number(e.target.value))}>
                {Array.from({ length: 5 }, (_, i) => year - 2 + i).map((y) => (
                  <MenuItem key={y} value={y}>
                    {y}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <IconButton onClick={goToNextMonth} disabled={isLoading}>
              <ChevronRightIcon />
            </IconButton>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Email</TableCell>
                  <TableCell align="right">Ожидается</TableCell>
                  <TableCell align="right">Часов за месяц</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {statistics.map((stat) => {
                  const isExpanded = expandedRows.has(stat.userId);
                  const details = userDetails.get(stat.userId) || [];
                  const isLoadingDetails = loadingDetails.has(stat.userId);
                  
                  return (
                    <Fragment key={stat.userId}>
                      <TableRow
                        onClick={() => handleRowClick(stat.userId)}
                        sx={{
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          },
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            {stat.email}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          {expectedHours > 0 ? expectedHours.toFixed(2) : '-'}
                        </TableCell>
                        <TableCell 
                          align="right"
                          sx={{
                            color: expectedHours > 0 
                              ? (stat.totalHours >= expectedHours ? 'success.main' : 'error.main')
                              : 'inherit',
                            fontWeight: expectedHours > 0 ? 'bold' : 'normal',
                          }}
                        >
                          {stat.totalHours.toFixed(2)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={3}>
                          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 2 }}>
                              {isLoadingDetails ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                  <CircularProgress size={24} />
                                </Box>
                              ) : details.length === 0 ? (
                                <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                                  Нет записей за этот период
                                </Typography>
                              ) : (
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Дата</TableCell>
                                      <TableCell>Описание</TableCell>
                                      <TableCell align="right">Потраченное время (ч)</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {details.map((record) => (
                                      <TableRow key={record.id}>
                                        <TableCell>{record.date}</TableCell>
                                        <TableCell>{record.description}</TableCell>
                                        <TableCell align="right">{record.hours.toFixed(2)}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              )}
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </Fragment>
                  );
                })}
                <TableRow>
                  <TableCell>
                    <strong>Итого</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>{expectedHours > 0 ? expectedHours.toFixed(2) : '-'}</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>{totalHours.toFixed(2)}</strong>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Диалог с графиками */}
      <Dialog
        open={chartsOpen}
        onClose={() => setChartsOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { height: '90vh', maxHeight: '90vh' },
        }}
      >
        <DialogContent sx={{ overflow: 'auto', maxHeight: 'calc(90vh - 64px)' }}>
          <Charts year={year} month={month} onClose={() => setChartsOpen(false)} />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

