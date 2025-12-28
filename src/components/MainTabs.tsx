import { useState } from 'react';
import { Box, Tabs, Tab, Paper } from '@mui/material';
import { Calendar } from './Calendar';
import { Statistics } from './Statistics';
import { UserManagement } from './UserManagement';
import { useAuthStore } from '../stores/authStore';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`main-tabpanel-${index}`}
      aria-labelledby={`main-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

export const MainTabs = () => {
  const [value, setValue] = useState(0);
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
      <Paper
        sx={{
          width: 200,
          minWidth: 200,
          borderRight: 1,
          borderColor: 'divider',
          borderRadius: 0,
        }}
        elevation={0}
      >
        <Tabs
          orientation="vertical"
          value={value}
          onChange={handleChange}
          sx={{ borderRight: 1, borderColor: 'divider', minHeight: '100%' }}
        >
          <Tab label="Календарь" />
          {isAdmin && <Tab label="Статистика" />}
          {isAdmin && <Tab label="Пользователи" />}
        </Tabs>
      </Paper>
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <TabPanel value={value} index={0}>
          <Calendar />
        </TabPanel>
        {isAdmin && (
          <TabPanel value={value} index={1}>
            <Statistics />
          </TabPanel>
        )}
        {isAdmin && (
          <TabPanel value={value} index={2}>
            <UserManagement />
          </TabPanel>
        )}
      </Box>
    </Box>
  );
};

