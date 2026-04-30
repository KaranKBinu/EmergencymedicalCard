'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Button,
  Divider,
  Container,
} from '@mui/material';
import {
  PeopleAlt as UsersIcon,
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';

const drawerWidth = 260;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const menuItems = [
    { text: 'Users Overview', icon: <UsersIcon />, path: '/admin' },
    { text: 'User Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AdminIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              letterSpacing: -0.5,
              background: 'linear-gradient(45deg, #ff416c 0%, #ff4b2b 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            MediAdmin
          </Typography>
        </Box>

        <Divider sx={{ mx: 2, mb: 2, opacity: 0.1 }} />

        <List sx={{ px: 2, flexGrow: 1 }}>
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => router.push(item.path)}
                  sx={{
                    borderRadius: 2,
                    color: isActive ? 'primary.main' : 'text.secondary',
                    bgcolor: isActive ? 'rgba(255, 75, 43, 0.1)' : 'transparent',
                    '&:hover': {
                      bgcolor: isActive ? 'rgba(255, 75, 43, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography sx={{ fontWeight: isActive ? 700 : 500, fontSize: '0.95rem', color: 'inherit' }}>
                        {item.text}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        <Box sx={{ p: 2 }}>
          <Button
            fullWidth
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              justifyContent: 'flex-start',
              color: '#ff3b30',
              '&:hover': { bgcolor: 'rgba(255, 59, 48, 0.1)' },
              px: 2,
            }}
          >
            Logout
          </Button>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 4, bgcolor: 'background.default' }}>
        <Container maxWidth="lg" sx={{ mt: 2 }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
}
