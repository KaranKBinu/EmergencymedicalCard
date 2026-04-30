'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Divider,
  Paper,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Download as DownloadIcon,
  LocalHospital as HospitalIcon,
  Bloodtype as BloodIcon,
  WaterDrop as DropIcon,
  Straighten as HeightIcon,
  Scale as WeightIcon,
  Event as DateIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

interface HistoryItem {
  date: string;
  description: string;
  notes?: string;
}

interface MedicalCardProps {
  data: {
    id: string;
    name: string;
    dob: string;
    bloodGroup: string;
    height?: string;
    weight?: string;
    medicalConditions?: string;
    medicineAllergies?: string;
    commonAllergies?: string;
    emergencyContact?: string;
    address?: string;
    medicalNotes?: string;
    optionalFields?: string;
    history: HistoryItem[];
  };
}

export default function MedicalCard({ data }: MedicalCardProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [origin, setOrigin] = useState('');
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const publicUrl = `${origin}/public/${data.id}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(publicUrl)}&bgcolor=ffffff&color=000000`;

  const handleDownloadPDF = async () => {
    if (!exportRef.current) return;
    try {
      setIsGenerating(true);
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      const originalDisplay = exportRef.current.style.display;
      exportRef.current.style.display = 'flex';
      const canvas = await html2canvas(exportRef.current, {
        scale: 4,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      exportRef.current.style.display = originalDisplay;
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      pdf.addImage(imgData, 'JPEG', 10, 20, 190, (canvas.height * 190) / canvas.width);
      pdf.save(`${data.name.replace(/\s+/g, '_')}_MediCard.pdf`);
      setIsGenerating(false);
    } catch (err) {
      console.error(err);
      setIsGenerating(false);
    }
  };

  const VitalsBox = ({ icon, label, value, forExport = false }: any) => (
    <Box sx={{
      p: 0.8,
      px: 1.2,
      borderRadius: 1.5,
      bgcolor: forExport ? '#f5f5f5' : 'rgba(255,255,255,0.03)',
      border: `1px solid ${forExport ? '#eee' : 'rgba(255,255,255,0.05)'}`,
      display: 'flex',
      flexDirection: 'column',
      minWidth: 'fit-content'
    }}>
      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
        {React.cloneElement(icon, { sx: { fontSize: 12, color: 'primary.main' } })}
        <Typography variant="caption" sx={{ fontSize: '0.55rem', fontWeight: 800, color: 'text.secondary', opacity: 0.8 }}>
          {label}
        </Typography>
      </Stack>
      <Typography variant="body2" sx={{ fontWeight: 900, fontSize: '0.75rem', pl: 0.2 }}>
        {value || '---'}
      </Typography>
    </Box>
  );

  const CardFront = ({ forExport = false }: { forExport?: boolean }) => (
    <Paper
      elevation={forExport ? 0 : 12}
      sx={{
        width: 400,
        height: 250,
        borderRadius: '16px',
        overflow: 'hidden',
        background: forExport ? '#ffffff' : '#0a0a0c',
        border: `1px solid ${forExport ? '#000' : 'rgba(255,255,255,0.08)'}`,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        color: forExport ? '#000' : '#fff'
      }}
    >
      {!forExport && (
        <Box sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 150,
          height: 150,
          bgcolor: 'primary.main',
          filter: 'blur(80px)',
          opacity: 0.15,
          zIndex: 0
        }} />
      )}

      <Box sx={{
        px: 1.5,
        py: 0.8,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: forExport ? '#f8f8f8' : 'linear-gradient(to right, rgba(255, 75, 43, 0.15), transparent)',
        borderBottom: `1px solid ${forExport ? '#eee' : 'rgba(255,255,255,0.05)'}`
      }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <HospitalIcon sx={{ color: 'primary.main', fontSize: 20 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 900, letterSpacing: 2, fontSize: '0.7rem' }}>
            EMERGENCY MEDICAL CARD
          </Typography>
        </Stack>
        <Chip
          icon={<DropIcon sx={{ fontSize: '0.8rem !important', color: '#fff !important' }} />}
          label={data.bloodGroup || '---'}
          size="small"
          sx={{
            bgcolor: '#ff4b2b',
            color: '#fff',
            fontWeight: 900,
            fontSize: '0.75rem',
            height: 22,
            '& .MuiChip-label': { px: 1 }
          }}
        />
      </Box>

      <Box sx={{ p: 1, px: 1.5, flexGrow: 1, zIndex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Box>
          <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 900, letterSpacing: 1, fontSize: '0.55rem', mb: 0.2, display: 'block' }}>
            PATIENT NAME
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: -0.5, fontSize: '1.2rem', lineHeight: 1.1 }}>
            {data.name || 'UNREGISTERED'}
          </Typography>
        </Box>

        <Stack direction="row" spacing={0.8} sx={{ mb: 0.2 }}>
          <VitalsBox icon={<DateIcon />} label="DOB" value={data.dob ? format(new Date(data.dob), 'dd MMM yyyy') : null} forExport={forExport} />
          <VitalsBox icon={<HeightIcon />} label="HT" value={data.height} forExport={forExport} />
          <VitalsBox icon={<WeightIcon />} label="WT" value={data.weight} forExport={forExport} />
        </Stack>

        {/* High-Priority Alerts - Stacked for Maximum Width */}
        <Stack spacing={0.5} sx={{ mt: 'auto' }}>
          <Box sx={{
            p: 0.8,
            px: 1,
            borderRadius: 1,
            bgcolor: forExport ? '#fff5f5' : 'rgba(255, 59, 48, 0.08)',
            border: `1px solid ${forExport ? '#ffccd5' : 'rgba(255, 59, 48, 0.15)'}`,
            borderLeft: '3px solid #ff3b30'
          }}>
            <Typography sx={{ fontSize: '0.4rem', fontWeight: 900, color: '#ff3b30', mb: 0, letterSpacing: 0.8 }}>MEDICINE ALLERGIES</Typography>
            <Typography sx={{
              fontSize: '0.65rem',
              fontWeight: 800,
              lineHeight: 1.1,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {data.medicineAllergies || 'NONE REPORTED'}
            </Typography>
          </Box>
          <Box sx={{
            p: 0.8,
            px: 1,
            borderRadius: 1,
            bgcolor: forExport ? '#f0f7ff' : 'rgba(43, 175, 255, 0.08)',
            border: `1px solid ${forExport ? '#cce5ff' : 'rgba(43, 175, 255, 0.15)'}`,
            borderLeft: '3px solid #2bafff'
          }}>
            <Typography sx={{ fontSize: '0.4rem', fontWeight: 900, color: '#2bafff', mb: 0, letterSpacing: 0.8 }}>MEDICAL CONDITIONS</Typography>
            <Typography sx={{
              fontSize: '0.65rem',
              fontWeight: 700,
              lineHeight: 1.1,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {data.medicalConditions || 'NONE REPORTED'}
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Paper>
  );

  const CardBack = ({ forExport = false }: { forExport?: boolean }) => (
    <Paper
      elevation={forExport ? 0 : 12}
      sx={{
        width: 400,
        height: 250,
        borderRadius: '16px',
        overflow: 'hidden',
        background: forExport ? '#ffffff' : '#0a0a0c',
        border: `1px solid ${forExport ? '#000000' : 'rgba(255,255,255,0.12)'}`,
        position: 'relative',
        display: 'flex',
        flexDirection: 'row',
        boxSizing: 'border-box',
        color: forExport ? '#000000' : '#ffffff'
      }}
    >
      {/* Left side: History */}
      <Box sx={{ flex: 1.2, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{
          px: 1.5,
          py: 0.8,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: forExport ? '#f8f8f8' : 'linear-gradient(to right, rgba(255, 75, 43, 0.15), transparent)',
          borderBottom: `1px solid ${forExport ? '#dddddd' : 'rgba(255,255,255,0.1)'}`
        }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <HistoryIcon sx={{ color: 'primary.main', fontSize: 18 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 900, letterSpacing: 2, fontSize: '0.65rem' }}>
              MEDICAL HISTORY
            </Typography>
          </Stack>
        </Box>

        <Box sx={{ p: 1.5, flexGrow: 1, overflow: 'hidden' }}>
          {data.medicalNotes && (
            <Box sx={{ 
              mb: 1, 
              p: 0.8, 
              borderRadius: '6px', 
              bgcolor: forExport ? '#fff9f9' : 'rgba(255, 75, 43, 0.08)',
              border: `1px solid ${forExport ? '#ffe5e5' : 'rgba(255, 75, 43, 0.15)'}`,
              borderLeft: '4px solid',
              borderLeftColor: 'primary.main'
            }}>
              <Typography sx={{ fontSize: '0.4rem', fontWeight: 900, color: 'primary.main', mb: 0.2, letterSpacing: 0.5 }}>GLOBAL NOTE</Typography>
              <Typography sx={{ fontSize: '0.55rem', fontWeight: 700, color: forExport ? '#000' : '#fff', lineHeight: 1.2, wordBreak: 'break-word' }}>
                {data.medicalNotes}
              </Typography>
            </Box>
          )}

          <Stack spacing={0.8}>
            {data.history && data.history.length > 0 ? (
              data.history.slice(0, data.medicalNotes ? 3 : 4).map((item, index) => (
                <Box key={index} sx={{ position: 'relative', pl: 1.2 }}>
                  <Box sx={{ position: 'absolute', left: 0, top: 4, bottom: 4, width: 2, bgcolor: 'primary.main', borderRadius: 1 }} />
                  <Typography variant="caption" sx={{ fontWeight: 900, color: 'primary.main', fontSize: '0.5rem', display: 'block' }}>
                    {item.date}
                  </Typography>
                  <Typography sx={{ fontSize: '0.6rem', fontWeight: 500, lineHeight: 1.2, color: forExport ? '#000' : 'text.secondary' }}>
                    {item.description}
                  </Typography>
                  {item.notes && (
                    <Typography sx={{ fontSize: '0.45rem', color: 'text.secondary', fontStyle: 'italic', mt: 0.1 }}>
                      Note: {item.notes}
                    </Typography>
                  )}
                </Box>
              ))
            ) : (
              <Box sx={{ textAlign: 'center', py: 4, opacity: 0.2 }}>
                <Typography variant="caption">No active history items.</Typography>
              </Box>
            )}
          </Stack>
        </Box>
      </Box>

      <Box sx={{
        width: 135,
        bgcolor: forExport ? '#fafafa' : 'rgba(0,0,0,0.15)',
        borderLeft: `1px solid ${forExport ? '#dddddd' : 'rgba(255,255,255,0.1)'}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        {/* QR Section */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 1.5 }}>
          <Box sx={{
            p: 0.8,
            bgcolor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            mb: 1
          }}>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=85x85&data=${publicUrl}&color=000&bgcolor=fff&margin=0&qzone=1`}
              alt="Emergency QR"
              style={{ width: 85, height: 85, display: 'block' }}
            />
          </Box>
          <Typography sx={{ fontSize: '0.4rem', fontWeight: 900, color: 'primary.main', letterSpacing: 0.5 }}>SCAN FOR PROFILE</Typography>
        </Box>

        <Box sx={{
          width: '100%',
          p: 1.5,
          bgcolor: forExport ? '#fff5f5' : 'rgba(255, 75, 43, 0.12)',
          borderTop: `1px solid ${forExport ? '#ffccd5' : 'rgba(255, 75, 43, 0.2)'}`,
          textAlign: 'center'
        }}>
          <Typography sx={{ fontSize: '0.35rem', fontWeight: 900, color: '#ff3b30', mb: 0.2, letterSpacing: 0.5 }}>EMERGENCY CONTACT</Typography>
          <Typography sx={{ fontSize: '0.65rem', fontWeight: 900, color: forExport ? '#000' : '#fff' }}>{data.emergencyContact || 'NOT PROVIDED'}</Typography>
        </Box>
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        spacing={4}
        sx={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}
      >
        <CardFront />
        <CardBack />
      </Stack>

      <Button
        variant="contained"
        size="large"
        startIcon={isGenerating ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
        onClick={handleDownloadPDF}
        disabled={isGenerating}
        sx={{ px: 6, py: 2, borderRadius: 4, fontWeight: 900, fontSize: '1.1rem', boxShadow: '0 8px 32px rgba(255, 75, 43, 0.3)' }}
      >
        {isGenerating ? 'Generating Secure PDF...' : 'Download Medical Card PDF'}
      </Button>

      <Box ref={exportRef} sx={{ display: 'none', flexDirection: 'column', gap: 4, p: 6, bgcolor: '#fff', width: '500px' }}>
        <CardFront forExport />
        <CardBack forExport />
      </Box>
    </Box>
  );
}
