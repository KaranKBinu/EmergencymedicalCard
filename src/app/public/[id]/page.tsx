'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Box,
  Typography,
  Container,
  Paper,
  Stack,
  Divider,
  CircularProgress,
  Chip,
  Grid,
} from '@mui/material';
import {
  LocalHospital as HospitalIcon,
  Straighten as HeightIcon,
  Scale as WeightIcon,
  Event as DateIcon,
  Warning as WarningIcon,
  History as HistoryIcon,
  WaterDrop as DropIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

export default function PublicRecordPage() {
  const { id } = useParams();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const res = await fetch(`/api/records/public/${id}`);
        if (res.ok) {
          const data = await res.json();
          setRecord(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecord();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: '#050505' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!record) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#050505' }}>
        <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
          <Typography variant="h4" color="error" sx={{ fontWeight: 900, mb: 2 }}>ACCESS DENIED</Typography>
          <Typography color="text.secondary">The medical record requested is unavailable or the link is invalid.</Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', py: { xs: 4, md: 8 }, bgcolor: '#050505', backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(255, 75, 43, 0.05) 0%, transparent 50%)' }}>
      <Container maxWidth="md">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 6 },
            borderRadius: 6,
            bgcolor: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Decorative hospital logo watermark */}
          <HospitalIcon sx={{ position: 'absolute', top: -20, right: -20, fontSize: 150, opacity: 0.02, color: '#fff' }} />

          <Stack direction={{ xs: 'column', md: 'row' }} sx={{ mb: 6, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 3 }}>
            <Box>
              <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 900, letterSpacing: 2, display: 'block', mb: 1 }}>
                EMERGENCY MEDICAL PROFILE
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: -1, fontSize: { xs: '2.5rem', md: '3.5rem' }, mb: 1 }}>
                {record.name}
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'rgba(255, 75, 43, 0.1)', border: '1px solid rgba(255, 75, 43, 0.2)', borderRadius: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: 'primary.light' }}>
                  EMERGENCY CONTACT:{record.emergencyContact || 'NOT PROVIDED'}
                </Typography>
              </Paper>
            </Box>
            <Chip
              icon={<DropIcon sx={{ color: '#fff !important' }} />}
              label={record.bloodGroup}
              sx={{
                bgcolor: '#ff4b2b',
                color: '#fff',
                fontWeight: 900,
                fontSize: '1.5rem',
                px: 3,
                py: 4,
                borderRadius: 4,
                boxShadow: '0 8px 32px rgba(255, 75, 43, 0.3)'
              }}
            />
          </Stack>

          <Grid container spacing={2} sx={{ mb: 6 }}>
            {[
              { icon: <DateIcon />, label: 'DATE OF BIRTH', value: format(new Date(record.dob), 'PPPP') },
              { icon: <HeightIcon />, label: 'HEIGHT', value: record.height || '---' },
              { icon: <WeightIcon />, label: 'WEIGHT', value: record.weight || '---' },
            ].map((stat, i) => (
              <Grid key={i} size={{ xs: 12, sm: 4 }}>
                <Box sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <Stack direction="row" spacing={1} sx={{ mb: 1, alignItems: 'center' }}>
                    {React.cloneElement(stat.icon as React.ReactElement<any>, { sx: { fontSize: 18, color: 'primary.main' } })}
                    <Typography variant="caption" sx={{ fontWeight: 900, letterSpacing: 1, color: 'text.secondary' }}>{stat.label}</Typography>
                  </Stack>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>{stat.value}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Stack spacing={4}>
            {record.medicalNotes && (
              <Box sx={{ p: 3, borderRadius: 4, bgcolor: 'rgba(255, 75, 43, 0.08)', border: '1px solid rgba(255, 75, 43, 0.2)', borderLeft: '8px solid', borderLeftColor: 'primary.main' }}>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
                  <HospitalIcon color="primary" />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 900, color: 'primary.main', letterSpacing: 1.5, mb: 0.5 }}>
                      CRITICAL EMERGENCY NOTES
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.4 }}>
                      {record.medicalNotes}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            )}
            <Box>
              <Stack direction="row" spacing={1.5} sx={{ mb: 2, alignItems: 'center' }}>
                <Box sx={{ p: 1, bgcolor: 'rgba(255, 59, 48, 0.1)', borderRadius: 2 }}>
                  <WarningIcon sx={{ color: '#ff3b30' }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: 0.5 }}>MEDICINE ALLERGIES</Typography>
              </Stack>
              <Paper sx={{ p: 4, borderRadius: 4, bgcolor: 'rgba(255, 59, 48, 0.05)', border: '1px solid rgba(255, 59, 48, 0.1)', borderLeft: '8px solid #ff3b30' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.5, color: '#ff8a80', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                  {record.medicineAllergies || 'NO KNOWN MEDICINE ALLERGIES REPORTED'}
                </Typography>
              </Paper>
            </Box>

            <Box>
              <Stack direction="row" spacing={1.5} sx={{ mb: 2, alignItems: 'center' }}>
                <Box sx={{ p: 1, bgcolor: 'rgba(255, 152, 0, 0.1)', borderRadius: 2 }}>
                  <WarningIcon sx={{ color: '#ff9800' }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: 0.5 }}>COMMON ALLERGIES</Typography>
              </Stack>
              <Paper sx={{ p: 4, borderRadius: 4, bgcolor: 'rgba(255, 152, 0, 0.05)', border: '1px solid rgba(255, 152, 0, 0.1)', borderLeft: '8px solid #ff9800' }}>
                <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.6, fontWeight: 500, wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                  {record.commonAllergies || 'NO COMMON ALLERGIES REPORTED'}
                </Typography>
              </Paper>
            </Box>

            <Box>
              <Stack direction="row" spacing={1.5} sx={{ mb: 2, alignItems: 'center' }}>
                <Box sx={{ p: 1, bgcolor: 'rgba(43, 175, 255, 0.1)', borderRadius: 2 }}>
                  <HospitalIcon sx={{ color: '#2bafff' }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: 0.5 }}>MEDICAL CONDITIONS</Typography>
              </Stack>
              <Paper sx={{ p: 4, borderRadius: 4, bgcolor: 'rgba(43, 175, 255, 0.05)', border: '1px solid rgba(43, 175, 255, 0.1)', borderLeft: '8px solid #2bafff' }}>
                <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.6, fontWeight: 500, wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                  {record.medicalConditions || 'NO CHRONIC MEDICAL CONDITIONS REPORTED'}
                </Typography>
              </Paper>
            </Box>

            <Box>
              <Stack direction="row" spacing={1.5} sx={{ mb: 2, alignItems: 'center' }}>
                <Box sx={{ p: 1, bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: 2 }}>
                  <HistoryIcon sx={{ color: 'text.secondary' }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: 0.5 }}>RESIDENTIAL ADDRESS</Typography>
              </Stack>
              <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  {record.address || 'ADDRESS NOT PROVIDED'}
                </Typography>
              </Paper>
            </Box>

            <Box>
              <Stack direction="row" spacing={1.5} sx={{ mb: 2, alignItems: 'center' }}>
                <Box sx={{ p: 1, bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: 2 }}>
                  <HistoryIcon sx={{ color: 'text.secondary' }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: 0.5 }}>CLINICAL HISTORY</Typography>
              </Stack>
              <Stack spacing={2}>
                {record.history && record.history.length > 0 ? (
                  <Stack spacing={2}>
                    {record.history.map((item: any, index: number) => (
                      <Paper key={index} sx={{ p: 3, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderLeft: '4px solid', borderLeftColor: 'primary.main' }}>
                        <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 900, display: 'block', mb: 0.5 }}>
                          {item.date}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, fontSize: '1.1rem' }}>
                          {item.description}
                        </Typography>
                        {item.notes && (
                          <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic', bgcolor: 'rgba(255,255,255,0.03)', p: 1.5, borderRadius: 1.5 }}>
                            Notes: {item.notes}
                          </Typography>
                        )}
                      </Paper>
                    ))}
                  </Stack>
                ) : (
                  <Typography sx={{ color: 'text.disabled', fontStyle: 'italic', textAlign: 'center', py: 4 }}>
                    No historical clinical records available for this patient.
                  </Typography>
                )}
              </Stack>
            </Box>
          </Stack>

          <Box sx={{ mt: 8, pt: 4, borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: 'text.disabled', letterSpacing: 1, fontWeight: 700 }}>
              VERIFIED MEDICARD SECURE RECORD • {new Date().getFullYear()}
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
