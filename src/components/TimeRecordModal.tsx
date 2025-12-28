import { useState, FormEvent, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useCalendarStore } from '../stores/calendarStore';
import { formatDateForDisplay } from '../utils/dateUtils';

export const TimeRecordModal = () => {
  const {
    isModalOpen,
    selectedDate,
    selectedRecord,
    closeModal,
    createTimeRecord,
    updateTimeRecord,
    deleteTimeRecord,
    isLoading,
    error,
  } = useCalendarStore();

  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedRecord) {
      setHours(selectedRecord.hours.toString());
      setDescription(selectedRecord.description);
    } else {
      setHours('');
      setDescription('');
    }
    setLocalError(null);
  }, [selectedRecord, isModalOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!selectedDate) return;

    const hoursNum = parseFloat(hours);
    if (isNaN(hoursNum) || hoursNum <= 0 || hoursNum > 24) {
      setLocalError('Часы должны быть числом от 0 до 24');
      return;
    }

    if (!description.trim()) {
      setLocalError('Описание обязательно для заполнения');
      return;
    }

    try {
      if (selectedRecord) {
        await updateTimeRecord(selectedRecord.id, {
          hours: hoursNum,
          description: description.trim(),
        });
      } else {
        await createTimeRecord({
          date: selectedDate,
          hours: hoursNum,
          description: description.trim(),
        });
      }
    } catch (err) {
      // Ошибка уже обработана в store
    }
  };

  const handleDelete = async () => {
    if (!selectedRecord) return;

    if (window.confirm('Вы уверены, что хотите удалить эту запись?')) {
      try {
        await deleteTimeRecord(selectedRecord.id);
      } catch (err) {
        // Ошибка уже обработана в store
      }
    }
  };

  const formatDate = (dateString: string) => {
    return formatDateForDisplay(dateString);
  };

  return (
    <Dialog open={isModalOpen} onClose={closeModal} maxWidth="sm" fullWidth>
      <DialogTitle>
        {selectedRecord ? 'Редактировать запись' : 'Добавить запись'}
        {selectedDate && (
          <Box component="span" sx={{ ml: 1, fontSize: '0.9em', color: 'text.secondary' }}>
            ({formatDate(selectedDate)})
          </Box>
        )}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {(error || localError) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error || localError}
            </Alert>
          )}
          <TextField
            fullWidth
            label="Часы"
            type="number"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            margin="normal"
            required
            inputProps={{ min: 0, max: 24, step: 0.5 }}
            disabled={isLoading}
            helperText="Введите количество часов (0-24)"
          />
          <TextField
            fullWidth
            label="Описание"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
            required
            multiline
            rows={4}
            disabled={isLoading}
          />
        </DialogContent>
        <DialogActions>
          {selectedRecord && (
            <IconButton
              color="error"
              onClick={handleDelete}
              disabled={isLoading}
              sx={{ mr: 'auto' }}
            >
              <DeleteIcon />
            </IconButton>
          )}
          <Button onClick={closeModal} disabled={isLoading}>
            Отмена
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {isLoading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

