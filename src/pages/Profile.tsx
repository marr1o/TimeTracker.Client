import { useState, FormEvent, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuthStore } from '../stores/authStore';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';

export const Profile = () => {
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
    }
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!user) {
      setError('Пользователь не найден');
      return;
    }

    if (!currentPassword) {
      setError('Текущий пароль обязателен для заполнения');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError('Новые пароли не совпадают');
      return;
    }

    if (newPassword && newPassword.length < 8) {
      setError('Новый пароль должен содержать минимум 8 символов');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.updateProfile({
        currentPassword,
        ...(email.trim() !== user.email && { email: email.trim() }),
        ...(newPassword && { newPassword }),
      });
      setSuccess('Данные успешно обновлены');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      // Обновляем данные пользователя в store
      if (response.user) {
        setUser(response.user);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка при обновлении данных');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={() => navigate('/')} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5">
            Профиль пользователя
          </Typography>
        </Box>

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

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
            disabled={isLoading}
            type="email"
          />

          <TextField
            fullWidth
            label="Текущий пароль"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            margin="normal"
            required
            disabled={isLoading}
            helperText="Обязателен для подтверждения изменений"
          />

          <TextField
            fullWidth
            label="Новый пароль"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            margin="normal"
            disabled={isLoading}
            helperText="Оставьте пустым, чтобы не менять пароль. Минимум 8 символов"
          />

          {newPassword && (
            <TextField
              fullWidth
              label="Подтвердите новый пароль"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              margin="normal"
              disabled={isLoading}
            />
          )}

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              sx={{ flexGrow: 1 }}
            >
              {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
            </Button>
          </Box>
        </form>

        <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary">
            ID: {user.id}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Роль: {user.role === 'admin' ? 'Администратор' : 'Сотрудник'}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

