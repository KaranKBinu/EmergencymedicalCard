'use client';

import { createTheme, ThemeProvider, ThemeOptions } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const themeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#ff4b2b', // Crimson
      light: '#ff6b52',
      dark: '#d43a1e',
    },
    secondary: {
      main: '#2bafff', // Sky Blue for contrast
    },
    background: {
      default: '#0a0a0c',
      paper: '#121216',
    },
    text: {
      primary: '#ffffff',
      secondary: '#a1a1aa',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 800 },
    h2: { fontSize: '2rem', fontWeight: 700 },
    h3: { fontSize: '1.5rem', fontWeight: 700 },
    h4: { fontSize: '1.25rem', fontWeight: 600 },
    body1: { fontSize: '1rem', lineHeight: 1.6 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: '10px 24px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 20px rgba(255, 75, 43, 0.3)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #ff416c 0%, #ff4b2b 100%)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#121216',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#0a0a0c',
          borderRight: '1px solid rgba(255, 255, 255, 0.05)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
            },
          },
        },
      },
    },
  },
};

const theme = createTheme(themeOptions);

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
