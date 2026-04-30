'use client';

import React, { useEffect, useState } from 'react';
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
  BadgeOutlined as BadgeIcon,
  EditNote as EditIcon,
  AdminPanelSettings as AdminIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  LocalHospital as HospitalIcon,
} from '@mui/icons-material';

const drawerWidth = 260;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    };
    fetchSession();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const menuItems = [
    { text: 'My Card', icon: <BadgeIcon />, path: '/dashboard' },
    { text: 'Edit Info', icon: <EditIcon />, path: '/dashboard/edit' },
    ...(user?.role === 'ADMIN'
      ? [{ text: 'Admin Panel', icon: <AdminIcon />, path: '/admin' }]
      : []),
    { text: 'Settings', icon: <SettingsIcon />, path: '/dashboard/settings' },
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
          <HospitalIcon color="primary" sx={{ fontSize: 32 }} />
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
            MediCard
          </Typography>
        </Box>

        <Divider sx={{ mx: 2, mb: 2, opacity: 0.1 }} />

        <List sx={{ px: 2, flexGrow: 1 }}>
          {menuItems.map((item) => {
            const isActive = pathname === item.path || (item.path === '/admin' && pathname.startsWith('/admin'));
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
