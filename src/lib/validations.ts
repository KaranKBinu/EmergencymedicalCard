import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const medicalRecordSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  dob: z.string().min(1, 'Date of birth is required'),
  bloodGroup: z.string().min(1, 'Blood group is required'),
  height: z.string().optional().or(z.literal('')),
  weight: z.string().optional().or(z.literal('')),
  medicalConditions: z.string().optional().or(z.literal('')),
  medicineAllergies: z.string().optional().or(z.literal('')),
  commonAllergies: z.string().optional().or(z.literal('')),
  emergencyContact: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  medicalNotes: z.string().optional().or(z.literal('')),
  optionalFields: z.string().optional().or(z.literal('')),
  history: z.array(z.object({
    date: z.string(),
    description: z.string(),
    notes: z.string().optional(),
  })).optional()
});
