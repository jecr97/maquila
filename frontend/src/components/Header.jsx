import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Chip,
  Tooltip,
  useTheme,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars,
  faRightFromBracket,
  faUser,
  faIndustry,
  faMoon,
  faSun,
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeContext';
import { DRAWER_WIDTH } from './Sidebar';

export default function Header({ onMenuOpen }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const { mode, toggleTheme } = useThemeMode();
  const isDark = mode === 'dark';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
        ml: { md: `${DRAWER_WIDTH}px` },
        bgcolor: isDark ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${theme.palette.divider}`,
        color: 'text.primary',
        transition: 'background-color 0.3s ease',
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: 56, sm: 64 },
          px: { xs: 1.5, sm: 3 },
          gap: 0.5,
        }}
      >
        <IconButton
          edge="start"
          onClick={onMenuOpen}
          sx={{
            mr: 0.5,
            display: { md: 'none' },
            color: 'text.primary',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <FontAwesomeIcon icon={faBars} style={{ fontSize: 17 }} />
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              width: 30, height: 30, borderRadius: '8px',
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              display: { xs: 'flex', md: 'none' },
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            <FontAwesomeIcon icon={faIndustry} style={{ fontSize: 13, color: '#fff' }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" fontWeight={800} color="primary.main" lineHeight={1} noWrap
              sx={{ display: { xs: 'none', sm: 'block' }, fontSize: '1.05rem' }}>
              Sistema de Maquila
            </Typography>
            <Typography variant="caption" color="text.secondary"
              sx={{ display: { xs: 'none', sm: 'block' } }}>
              Gestión Textil Industrial
            </Typography>
          </Box>
        </Box>

        <Chip
          icon={
            <Box sx={{ ml: 0.8, display: 'flex', alignItems: 'center' }}>
              <FontAwesomeIcon icon={faUser} style={{ fontSize: 10, color: theme.palette.primary.main }} />
            </Box>
          }
          label="admin"
          variant="outlined"
          size="small"
          sx={{
            borderColor: 'divider', color: 'primary.main', fontWeight: 600,
            display: { xs: 'none', sm: 'flex' },
            '& .MuiChip-label': { px: 1 },
          }}
        />

        <Tooltip title={isDark ? 'Modo claro' : 'Modo oscuro'} placement="bottom">
          <IconButton
            onClick={toggleTheme}
            sx={{
              color: 'text.secondary', width: 36, height: 36, borderRadius: '10px',
              bgcolor: 'action.hover',
              transition: 'all 0.25s ease',
              '&:hover': { bgcolor: 'action.selected', color: 'primary.main' },
            }}
          >
            <FontAwesomeIcon icon={isDark ? faSun : faMoon} style={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Cerrar sesión" placement="bottom">
          <IconButton
            onClick={handleLogout}
            sx={{
              color: 'text.secondary', bgcolor: 'action.hover', borderRadius: '10px',
              width: 36, height: 36, transition: 'all 0.25s ease',
              '&:hover': { bgcolor: 'primary.main', color: '#ffffff' },
            }}
          >
            <FontAwesomeIcon icon={faRightFromBracket} style={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}
