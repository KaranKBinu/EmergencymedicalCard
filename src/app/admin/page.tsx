'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Button,
  Stack,
  Avatar,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  AdminPanelSettings as AdminIcon,
  Person as UserIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import MedicalCard from '@/components/MedicalCard';

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers(users.filter((u: any) => u.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete user');
      }
    } catch (err) {
      alert('Error deleting user');
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
          Administrative Center
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage system users and oversee medical documentation integrity.
        </Typography>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: 'rgba(255, 255, 255, 0.02)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>USER IDENTITY</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>ACCESS LEVEL</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>BLOOD GROUP</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>REGISTRATION DATE</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">ACTIONS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user: any) => (
              <TableRow key={user.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>
                  <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: 'primary.main' }}>
                      <UserIcon fontSize="small" />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {user.medicalRecord?.name || 'Incomplete Profile'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Chip
                    icon={user.role === 'ADMIN' ? <AdminIcon sx={{ fontSize: '1rem !important' }} /> : <UserIcon sx={{ fontSize: '1rem !important' }} />}
                    label={user.role}
                    size="small"
                    color={user.role === 'ADMIN' ? 'primary' : 'default'}
                    variant={user.role === 'ADMIN' ? 'filled' : 'outlined'}
                    sx={{ fontWeight: 700, px: 0.5 }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {user.medicalRecord?.bloodGroup || '---'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                    <Tooltip title="View Medical Card">
                      <IconButton size="small" onClick={() => setSelectedUser(user)} sx={{ color: 'primary.light' }}>
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete User">
                      <IconButton size="small" color="error" onClick={() => handleDeleteUser(user.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: { bgcolor: 'background.default', backgroundImage: 'none', borderRadius: 4 }
          }
        }}
      >
        <DialogTitle sx={{ m: 0, p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Medical Record Preview</Typography>
          <IconButton onClick={() => setSelectedUser(null)} color="inherit">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
          {selectedUser && (
            <Box sx={{ transform: { xs: 'scale(0.8)', sm: 'scale(1)', md: 'scale(1.2)' }, my: 4 }}>
              <MedicalCard data={{
                ...selectedUser.medicalRecord,
                history: selectedUser.medicalRecord?.history || []
              }} />
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
