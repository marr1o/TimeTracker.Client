import { ReactNode } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import { Notifications } from './Notifications';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { user, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {isAuthenticated && (
        <AppBar position="static">
          <Toolbar>
            <Typography
              variant="h6"
              component="div"
              sx={{ flexGrow: 1, cursor: 'pointer' }}
              onClick={() => navigate('/')}
            >
              Time Tracking
            </Typography>
            {user && (
              <Typography variant="body2" sx={{ mr: 2 }}>
                {user.email || `User #${user.id}`} ({user.role})
              </Typography>
            )}
            <Notifications />
            <IconButton
              color="inherit"
              onClick={() => navigate('/profile')}
              sx={{ mr: 1 }}
              title="Профиль"
            >
              <AccountCircleIcon />
            </IconButton>
            <Button color="inherit" onClick={handleLogout}>
              Выйти
            </Button>
          </Toolbar>
        </AppBar>
      )}
      <Box component="main" sx={{ p: 0, minHeight: 'calc(100vh - 64px)' }}>
        {children}
      </Box>
    </Box>
  );
};

