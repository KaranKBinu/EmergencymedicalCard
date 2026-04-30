'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Stack,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import {
  LocalHospital as HospitalIcon,
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  AccountCircle as UserIcon,
} from '@mui/icons-material';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/session');
        setIsLoggedIn(res.ok);
      } catch (error) {
        setIsLoggedIn(false);
      }
    };
    checkSession();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setIsLoggedIn(false);
    handleClose();
    router.push('/');
    router.refresh();
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="fixed" sx={{ bgcolor: 'rgba(10, 10, 12, 0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.05)', boxShadow: 'none' }}>
      <Container maxWidth="lg">
        <Toolbar sx={{ justifyContent: 'space-between', height: 80 }}>
          <Box component={Link} href="/" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, textDecoration: 'none', color: 'inherit' }}>
            <HospitalIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h5" sx={{ fontWeight: 900, background: 'linear-gradient(45deg, #ff416c 0%, #ff4b2b 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: -1 }}>
              MediCard
            </Typography>
          </Box>

          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            {!mounted || isLoggedIn === null ? (
              <CircularProgress size={24} thickness={5} />
            ) : isLoggedIn ? (
              <>
                <Button component={Link} href="/dashboard" startIcon={<DashboardIcon />} sx={{ display: { xs: 'none', sm: 'flex' } }}>
                  Dashboard
                </Button>
                <IconButton onClick={handleMenu} sx={{ p: 0.5, border: '2px solid rgba(255, 75, 43, 0.3)' }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                    <UserIcon />
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  slotProps={{
                    paper: {
                      sx: {
                        mt: 1.5,
                        bgcolor: '#121216',
                        border: '1px solid rgba(255,255,255,0.05)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                      }
                    }
                  }}
                >
                  <MenuItem onClick={() => { handleClose(); router.push('/dashboard'); }}>Dashboard</MenuItem>
                  <MenuItem onClick={() => { handleClose(); router.push('/dashboard/edit'); }}>Edit Profile</MenuItem>
                  <MenuItem onClick={handleLogout} sx={{ color: '#ff3b30' }}>
                    <LogoutIcon sx={{ mr: 1, fontSize: 20 }} /> Sign Out
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button component={Link} href="/login" sx={{ fontWeight: 700 }}>
                  Sign In
                </Button>
                <Button component={Link} href="/register" variant="contained" sx={{ borderRadius: '20px', px: 3 }}>
                  Create Profile
                </Button>
              </>
            )}
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
