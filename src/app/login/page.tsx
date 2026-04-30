'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Stack,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  LocalHospital as HospitalIcon,
  Login as LoginIcon,
} from '@mui/icons-material';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ height: '100vh', display: 'flex', alignItems: 'center' }}>
      <Paper elevation={24} sx={{ p: 5, width: '100%', borderRadius: 4, bgcolor: '#121216', border: '1px solid rgba(255,255,255,0.05)' }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <HospitalIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>
            Welcome Back
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Access your secure digital medical profile.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }
              }}
            />
            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
              disabled={isLoading}
              sx={{ py: 1.5 }}
            >
              {isLoading ? 'Logging in...' : 'Sign In'}
            </Button>
          </Stack>
        </Box>

        <Typography variant="body2" sx={{ mt: 4, textAlign: 'center', color: 'text.secondary' }}>
          Don&apos;t have an account?{' '}
          <Link href="/register" style={{ color: '#ff4b2b', fontWeight: 700, textDecoration: 'none' }}>
            Create Account
          </Link>
        </Typography>
      </Paper>
    </Container>
  );
}
