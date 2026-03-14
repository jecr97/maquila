import { createTheme, alpha } from '@mui/material/styles';

export function getTheme(mode) {
  const isLight = mode === 'light';

  const primary = {
    main: '#1565c0',
    light: '#42a5f5',
    dark: '#0d47a1',
    contrastText: '#ffffff',
  };

  const bgDefault = isLight ? '#f1f5f9' : '#0f172a';
  const bgPaper   = isLight ? '#ffffff' : '#1e293b';

  return createTheme({
    palette: {
      mode,
      primary,
      secondary: { main: '#f59e0b', dark: '#d97706', contrastText: '#ffffff' },
      background: { default: bgDefault, paper: bgPaper },
      error:   { main: '#ef4444' },
      success: { main: '#10b981' },
      warning: { main: '#f59e0b' },
      info:    { main: '#3b82f6' },
      divider: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)',
    },
    typography: {
      fontFamily: '"Inter", "system-ui", -apple-system, sans-serif',
      h1: { fontWeight: 800 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 700 },
      h4: { fontWeight: 700 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: { transition: 'background-color 0.3s ease, color 0.3s ease' },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            textTransform: 'none',
            fontWeight: 600,
            padding: '8px 20px',
          },
          containedPrimary: {
            background: `linear-gradient(135deg, ${primary.dark}, ${primary.light})`,
            '&:hover': {
              background: `linear-gradient(135deg, ${primary.dark}, ${primary.main})`,
              boxShadow: `0 6px 20px ${alpha(primary.main, 0.35)}`,
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: { '& .MuiOutlinedInput-root': { borderRadius: 10 } },
        },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: { borderRadius: 14, backgroundImage: 'none' },
        },
      },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            borderRadius: 14,
            backgroundImage: 'none',
            transition: 'all 0.25s ease',
            '&:hover': { transform: 'translateY(-2px)' },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: 16, backgroundImage: 'none' },
        },
      },
      MuiChip: {
        styleOverrides: { root: { fontWeight: 600 } },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)',
          },
        },
      },
    },
  });
}

const theme = getTheme('light');
export default theme;
