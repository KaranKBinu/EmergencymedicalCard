'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
  Stack,
  IconButton,
  CircularProgress,
  Chip,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Person as PersonIcon,
  History as HistoryIcon,
  MedicalServices as MedicalIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { parseISO, format } from 'date-fns';

export default function EditProfilePage() {
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    bloodGroup: '',
    height: '',
    weight: '',
    medicalConditions: '',
    medicineAllergies: '',
    commonAllergies: '',
    emergencyContact: '',
    address: '',
    medicalNotes: '',
    optionalFields: '',
  });

  const [heightUnit, setHeightUnit] = useState('cm');
  const [weightUnit, setWeightUnit] = useState('kg');
  
  const [history, setHistory] = useState([{ date: '', description: '', notes: '' }]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const res = await fetch('/api/records/me');
        if (res.ok) {
          const data = await res.json();
          if (data) {
            let h = data.height || '';
            let w = data.weight || '';
            
            if (h.includes('ft')) setHeightUnit('ft');
            if (w.includes('lbs')) setWeightUnit('lbs');

            setFormData({
              name: data.name || '',
              dob: data.dob || '',
              bloodGroup: data.bloodGroup || '',
              height: h.replace(/[^\d.]/g, ''),
              weight: w.replace(/[^\d.]/g, ''),
              medicalConditions: data.medicalConditions || '',
              medicineAllergies: data.medicineAllergies || '',
              commonAllergies: data.commonAllergies || '',
              emergencyContact: data.emergencyContact || '',
              address: data.address || '',
              medicalNotes: data.medicalNotes || '',
              optionalFields: data.optionalFields || '',
            });
            
            if (data.history && data.history.length > 0) {
              setHistory(data.history.map((h: any) => ({ 
                date: h.date, 
                description: h.description,
                notes: h.notes || ''
              })));
            }
          }
        }
      } catch (err) {
        console.error('Error fetching record:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecord();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFormData(prev => ({ ...prev, dob: format(date, 'yyyy-MM-dd') }));
    }
  };

  const handleHistoryChange = (index: number, field: string, value: string) => {
    const newHistory = [...history];
    newHistory[index] = { ...newHistory[index], [field]: value };
    setHistory(newHistory);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const submissionData = {
      ...formData,
      height: formData.height ? `${formData.height} ${heightUnit}` : '',
      weight: formData.weight ? `${formData.weight} ${weightUnit}` : '',
      history
    };

    try {
      const res = await fetch('/api/records/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      if (res.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        alert('Failed to save changes');
      }
    } catch (err) {
      console.error('Error saving record:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box component="form" onSubmit={handleSubmit} sx={{ pb: 8 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
            Update Medical Profile
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your information is stored securely and used only for emergency purposes.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' }, alignItems: 'stretch' }}>
          {/* Section 1: Identity */}
          <Box sx={{ flex: 1.4 }}>
            <Paper sx={{ p: 4, mb: 4, borderRadius: '16px' }}>
              <Stack direction="row" spacing={1} sx={{ mb: 3, alignItems: 'center' }}>
                <PersonIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Personal Identity
                </Typography>
              </Stack>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3 }}>
                <Box sx={{ gridColumn: 'span 12' }}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Legal name as it appears on ID"
                    required
                  />
                </Box>
                <Box sx={{ gridColumn: 'span 12' }}>
                  <TextField
                    fullWidth
                    label="Emergency Contact"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    placeholder="e.g. Spouse: +1 (555) 000-0000"
                    required
                  />
                </Box>
                <Box sx={{ gridColumn: 'span 12' }}>
                  <TextField
                    fullWidth
                    label="Home Address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    multiline
                    rows={2}
                    placeholder="Current residential address"
                  />
                </Box>
                <Box sx={{ gridColumn: 'span 12' }}>
                  <TextField
                    fullWidth
                    label="General Medical Notes (Optional)"
                    name="medicalNotes"
                    value={formData.medicalNotes}
                    onChange={handleInputChange}
                    multiline
                    rows={2}
                    placeholder="Any other critical information for emergency responders..."
                  />
                </Box>
                <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                  <DatePicker
                    label="Date of Birth"
                    value={formData.dob ? parseISO(formData.dob) : null}
                    onChange={handleDateChange}
                    slotProps={{ textField: { fullWidth: true, required: true } }}
                  />
                </Box>
                <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                   <Typography variant="caption" sx={{ display: 'block', mb: 1, fontWeight: 700, color: 'text.secondary' }}>
                      BLOOD GROUP
                   </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
                       {bloodGroups.map(bg => (
                         <Button
                           key={bg}
                           variant={formData.bloodGroup === bg ? 'contained' : 'outlined'}
                           onClick={() => setFormData(p => ({ ...p, bloodGroup: bg }))}
                           sx={{ 
                             minWidth: 0, 
                             py: 1, 
                             fontWeight: 800,
                             borderRadius: 2,
                             bgcolor: formData.bloodGroup === bg ? '#ff4b2b' : 'transparent',
                             borderColor: formData.bloodGroup === bg ? '#ff4b2b' : 'rgba(255,255,255,0.1)',
                             color: formData.bloodGroup === bg ? '#fff' : 'text.secondary',
                             '&:hover': {
                               bgcolor: formData.bloodGroup === bg ? '#d43a1f' : 'rgba(255,255,255,0.05)',
                               borderColor: formData.bloodGroup === bg ? '#d43a1f' : 'rgba(255,255,255,0.2)',
                             }
                           }}
                         >
                           {bg}
                         </Button>
                       ))}
                    </Box>
                </Box>
              </Box>
            </Paper>

            <Paper sx={{ p: 4, borderRadius: '16px' }}>
              <Stack direction="row" spacing={1} sx={{ mb: 3, alignItems: 'center' }}>
                <MedicalIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Medical Vitals & Background
                </Typography>
              </Stack>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3 }}>
                <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        fullWidth
                        label="Height"
                        name="height"
                        type="number"
                        value={formData.height}
                        onChange={handleInputChange}
                        placeholder="0"
                      />
                      <ToggleButtonGroup
                        value={heightUnit}
                        exclusive
                        onChange={(_, v) => v && setHeightUnit(v)}
                        size="small"
                        sx={{ 
                          height: 56, // Match TextField height
                          bgcolor: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 2,
                          '& .MuiToggleButton-root': { 
                            px: 2, 
                            border: 'none',
                            fontWeight: 900,
                            color: 'text.secondary',
                            '&.Mui-selected': {
                              bgcolor: 'primary.main',
                              color: '#fff',
                              '&:hover': { bgcolor: 'primary.dark' }
                            }
                          } 
                        }}
                      >
                        <ToggleButton value="cm">CM</ToggleButton>
                        <ToggleButton value="ft">FT</ToggleButton>
                      </ToggleButtonGroup>
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        fullWidth
                        label="Weight"
                        name="weight"
                        type="number"
                        value={formData.weight}
                        onChange={handleInputChange}
                        placeholder="0"
                      />
                      <ToggleButtonGroup
                        value={weightUnit}
                        exclusive
                        onChange={(_, v) => v && setWeightUnit(v)}
                        size="small"
                        sx={{ 
                          height: 56, // Match TextField height
                          bgcolor: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 2,
                          '& .MuiToggleButton-root': { 
                            px: 2, 
                            border: 'none',
                            fontWeight: 900,
                            color: 'text.secondary',
                            '&.Mui-selected': {
                              bgcolor: 'primary.main',
                              color: '#fff',
                              '&:hover': { bgcolor: 'primary.dark' }
                            }
                          } 
                        }}
                      >
                        <ToggleButton value="kg">KG</ToggleButton>
                        <ToggleButton value="lbs">LBS</ToggleButton>
                      </ToggleButtonGroup>
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ gridColumn: 'span 12' }}>
                  <TextField
                    fullWidth
                    label="Medicine Allergies"
                    name="medicineAllergies"
                    value={formData.medicineAllergies}
                    onChange={handleInputChange}
                    multiline
                    rows={2}
                    placeholder="List specific medications (e.g. Penicillin, Aspirin)"
                    sx={{ mb: 3 }}
                  />
                  <TextField
                    fullWidth
                    label="Common Allergies"
                    name="commonAllergies"
                    value={formData.commonAllergies}
                    onChange={handleInputChange}
                    multiline
                    rows={2}
                    placeholder="List common allergies (e.g. Peanuts, Latex, Bees)"
                    sx={{ mb: 3 }}
                  />
                  <TextField
                    fullWidth
                    label="Active Medical Conditions"
                    name="medicalConditions"
                    value={formData.medicalConditions}
                    onChange={handleInputChange}
                    multiline
                    rows={3}
                    placeholder="List chronic diseases or permanent disabilities"
                  />
                </Box>
              </Box>
            </Paper>
          </Box>

          {/* Section 2: History */}
          <Box sx={{ flex: 1 }}>
            <Paper sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '16px' }}>
              <Stack direction="row" spacing={1} sx={{ mb: 3, alignItems: 'center' }}>
                <HistoryIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Clinical History
                </Typography>
              </Stack>
              
              <Box sx={{ flexGrow: 1 }}>
                {history.map((item, index) => (
                  <Box key={index} sx={{ mb: 3, p: 2, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                      <TextField
                        size="small"
                        label="Date/Year"
                        value={item.date}
                        onChange={(e) => handleHistoryChange(index, 'date', e.target.value)}
                        sx={{ width: 120 }}
                      />
                      <Box sx={{ flexGrow: 1 }} />
                      <IconButton color="error" onClick={() => setHistory(h => h.filter((_, i) => i !== index))}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                    <TextField
                      fullWidth
                      size="small"
                      label="Diagnosis/Event"
                      value={item.description}
                      onChange={(e) => handleHistoryChange(index, 'description', e.target.value)}
                      multiline
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Detailed Notes (Optional)"
                      value={item.notes || ''}
                      onChange={(e) => handleHistoryChange(index, 'notes', e.target.value)}
                      placeholder="Add clinical notes, medication details, or surgical outcomes..."
                      multiline
                      rows={2}
                    />
                  </Box>
                ))}
                
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setHistory([...history, { date: '', description: '', notes: '' }])}
                >
                  Add History Entry
                </Button>
              </Box>

              <Divider sx={{ my: 4, opacity: 0.1 }} />

              <Button
                fullWidth
                variant="contained"
                size="large"
                type="submit"
                startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                disabled={isSaving}
                sx={{ py: 2 }}
              >
                {isSaving ? 'Saving Changes...' : 'Finalize & Save Information'}
              </Button>
            </Paper>
          </Box>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}
