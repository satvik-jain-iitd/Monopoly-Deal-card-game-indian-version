import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#E65100',
      light: '#FF8A50',
      dark: '#BF360C',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#1565C0',
      light: '#4A90D9',
      dark: '#003C8F',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FFF8F0',
      paper: '#FFFFFF',
    },
    success: { main: '#2E7D32', contrastText: '#fff' },
    error:   { main: '#C62828', contrastText: '#fff' },
    text: {
      primary: '#1A1A1A',
      secondary: '#5C5C5C',
    },
  },
  typography: {
    fontFamily: '"DM Sans", "Roboto", "Helvetica Neue", Arial, sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-1px' },
    h2: { fontWeight: 700, letterSpacing: '-0.5px' },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 600, fontSize: '1rem' },
    body1: { fontSize: '0.95rem', lineHeight: 1.5 },
    body2: { fontSize: '0.85rem', lineHeight: 1.4 },
    caption: { fontSize: '0.72rem', lineHeight: 1.3 },
    button: { fontWeight: 700, textTransform: 'none', letterSpacing: '0.01em' },
  },
  shape: {
    borderRadius: 16,
  },
  spacing: 8,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          padding: '12px 28px',
          minHeight: 44,
          fontSize: '1rem',
          fontWeight: 700,
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': { boxShadow: '0 2px 8px rgba(230,81,0,0.25)' },
        },
        sizeSmall: {
          padding: '8px 16px',
          minHeight: 36,
          fontSize: '0.85rem',
        },
        contained: {
          '&:hover': { boxShadow: '0 4px 12px rgba(230,81,0,0.3)' },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          minWidth: 44,
          minHeight: 44,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.78rem',
          height: 28,
        },
        sizeSmall: { height: 22, fontSize: '0.68rem' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 16 },
        elevation1: { boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
        elevation2: { boxShadow: '0 4px 16px rgba(0,0,0,0.10)' },
        elevation4: { boxShadow: '0 8px 24px rgba(0,0,0,0.12)' },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': { borderRadius: 12 },
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderRadius: '24px !important',
          padding: '8px 20px',
          minHeight: 40,
          fontWeight: 700,
          textTransform: 'none',
          border: '1.5px solid rgba(0,0,0,0.12)',
          '&.Mui-selected': {
            backgroundColor: '#E65100',
            color: '#fff',
            borderColor: '#E65100',
            '&:hover': { backgroundColor: '#BF360C' },
          },
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          gap: 8,
          '& .MuiToggleButtonGroup-grouped': {
            border: '1.5px solid rgba(0,0,0,0.12) !important',
            borderRadius: '24px !important',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          paddingTop: 'env(safe-area-inset-top, 0px)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          margin: 16,
          maxHeight: '90dvh',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: '20px 20px 0 0',
          maxHeight: '88dvh',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: { paddingTop: 6, paddingBottom: 6 },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 4, height: 6 },
      },
    },
  },
})

export default theme
