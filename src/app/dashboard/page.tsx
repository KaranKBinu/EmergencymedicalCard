'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Stack, CircularProgress, Alert } from '@mui/material';
import { Edit as EditIcon, Info as InfoIcon } from '@mui/icons-material';
import MedicalCard from '@/components/MedicalCard';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [record, setRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const res = await fetch('/api/records/me');
        if (res.ok) {
          const data = await res.json();
          setRecord(data);
        }
      } catch (err) {
        console.error('Error fetching record:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecord();
  }, []);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 800 }}>
            My Medical Card
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your digital emergency profile is ready and secure.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={() => router.push('/dashboard/edit')}
          sx={{ mb: 1 }}
        >
          Update Details
        </Button>
      </Box>

      {record ? (
        <MedicalCard data={record} />
      ) : (
        <Alert
          severity="info"
          icon={<InfoIcon />}
          sx={{
            borderRadius: 3,
            p: 3,
            bgcolor: 'rgba(43, 175, 255, 0.05)',
            border: '1px solid rgba(43, 175, 255, 0.1)',
          }}
          action={
            <Button color="inherit" size="small" onClick={() => router.push('/dashboard/edit')}>
              Create Profile
            </Button>
          }
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            No Medical Record Found
          </Typography>
          Please complete your medical profile to generate your emergency card.
        </Alert>
      )}
    </Box>
  );
}
