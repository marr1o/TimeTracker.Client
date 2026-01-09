import { useState, FormEvent } from 'react';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { userService } from '../services/userService';

export const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccess(false);
    setIsLoading(true);

    if (!email || !password || !confirmPassword) {
      setLocalError('Пожалуйста, заполните все поля');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Пароли не совпадают');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setLocalError('Пароль должен содержать минимум 6 символов');
      setIsLoading(false);
      return;
    }

    try {
      await userService.createUser({ email, password });
      setSuccess(true);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Ошибка при регистрации пользователя';
      setLocalError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Регистрация нового сотрудника
          </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Пользователь успешно зарегистрирован
            </Alert>
          )}
          {localError && (
              <Alert severity="error" sx={{ mb: 2 }}>
              {localError}
              </Alert>
            )}
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Пароль"
              type="password"
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            helperText="Минимум 6 символов"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Подтвердите пароль"
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
            sx={{ mt: 3 }}
              disabled={isLoading}
            >
            {isLoading ? 'Регистрация...' : 'Зарегистрировать сотрудника'}
            </Button>
          </Box>
        </Paper>
      </Box>
  );
};

