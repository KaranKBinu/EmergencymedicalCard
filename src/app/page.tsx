'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  Container,
  Stack,
  Paper,
  Grid,
  CircularProgress,
} from '@mui/material';
import {
  LocalHospital as HospitalIcon,
  ShieldOutlined as ShieldIcon,
  SmartphoneOutlined as PhoneIcon,
  PrintOutlined as PrintIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import Navbar from '@/components/Navbar';

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
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

  const features = [
    { icon: <ShieldIcon color="primary" />, title: 'Secure Data', desc: 'Your medical history is encrypted and stored securely.' },
    { icon: <PhoneIcon color="primary" />, title: 'Always Available', desc: 'Access your medical ID from any device, anywhere.' },
    { icon: <PrintIcon color="primary" />, title: 'Ready to Print', desc: 'Generate ATM-sized cards for your physical wallet.' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="md" sx={{ pt: 20, pb: 8, textAlign: 'center', flexGrow: 1 }}>
        <Box sx={{ mb: 4, display: 'inline-flex', p: 1.5, borderRadius: '24px', bgcolor: 'rgba(255, 75, 43, 0.1)', border: '1px solid rgba(255, 75, 43, 0.2)' }}>
          <HospitalIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: 1.5, color: 'primary.light', textTransform: 'uppercase' }}>
            Trusted by First Responders
          </Typography>
        </Box>
        
        <Typography variant="h1" sx={{ fontSize: { xs: '3.5rem', md: '5rem' }, mb: 2, background: 'linear-gradient(45deg, #ff416c 0%, #ff4b2b 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: -2 }}>
          MediCard
        </Typography>
        
        <Typography variant="h4" color="text.secondary" sx={{ mb: 6, maxWidth: '600px', mx: 'auto', fontWeight: 500, lineHeight: 1.4 }}>
          Your digital emergency medical ID, designed for high-stakes situations.
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mb: 10, justifyContent: 'center', minHeight: '64px' }}>
          {!mounted || isLoggedIn === null ? (
            <CircularProgress color="primary" size={32} />
          ) : isLoggedIn ? (
            <>
              <Button
                component={Link}
                href="/dashboard"
                variant="contained"
                size="large"
                startIcon={<DashboardIcon />}
                sx={{ px: 6, py: 2, fontSize: '1.1rem' }}
              >
                Go to Dashboard
              </Button>
            </>
          ) : (
            <>
              <Button
                component={Link}
                href="/register"
                variant="contained"
                size="large"
                sx={{ px: 6, py: 2, fontSize: '1.1rem' }}
              >
                Create My Profile
              </Button>
              <Button
                component={Link}
                href="/login"
                variant="outlined"
                size="large"
                sx={{ px: 6, py: 2, fontSize: '1.1rem' }}
              >
                Sign In
              </Button>
            </>
          )}
        </Stack>

        <Grid container spacing={4}>
          {features.map((f, i) => (
            <Grid key={i} size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 4, height: '100%', textAlign: 'left', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-8px)', border: '1px solid rgba(255, 75, 43, 0.3)' } }}>
                <Box sx={{ mb: 2 }}>{f.icon}</Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>{f.title}</Typography>
                <Typography variant="body2" color="text.secondary">{f.desc}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Box component="footer" sx={{ py: 4, textAlign: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <Typography variant="caption" color="text.disabled">
          © {new Date().getFullYear()} MediCard Security. Your health, our priority.
        </Typography>
      </Box>
    </Box>
  );
}
