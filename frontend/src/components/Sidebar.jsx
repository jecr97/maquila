import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGauge,
  faUsers,
  faBuilding,
  faShirt,
  faScissors,
  faTags,
  faLayerGroup,
  faIndustry,
  faTriangleExclamation,
  faChartBar,
} from '@fortawesome/free-solid-svg-icons';

export const DRAWER_WIDTH = 270;

const allMenuItems = [
  { label: 'Dashboard', icon: faGauge, path: '/' },
  { label: 'Usuarios', icon: faUsers, path: '/usuarios' },
  { label: 'Proveedores', icon: faBuilding, path: '/proveedores' },
  { label: 'Tipos de Prenda', icon: faShirt, path: '/tipos-prenda' },
  { label: 'Tipos de Corte', icon: faScissors, path: '/tipos-corte' },
  { label: 'Precios de Maquila', icon: faTags, path: '/precios-maquila' },
  { label: 'Cortes', icon: faLayerGroup, path: '/cortes' },
  { label: 'Producción', icon: faIndustry, path: '/produccion' },
  { label: 'Piezas Faltantes', icon: faTriangleExclamation, path: '/piezas-faltantes' },
  { label: 'Reportes', icon: faChartBar, path: '/reportes' },
];

function SidebarContent({ onItemClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { tieneAcceso } = useAuth();

  const menuItems = allMenuItems.filter(({ path }) => tieneAcceso(path));

  const handleNav = (path) => {
    navigate(path);
    if (onItemClick) onItemClick();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: '#0f172a',
        overflowY: 'auto',
        overflowX: 'hidden',
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-track': { background: 'transparent' },
        '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.12)', borderRadius: 4 },
      }}
    >
      {/* Logo */}
      <Box sx={{ px: 2.5, pt: 2.5, pb: 2, display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
        <Box
          sx={{
            width: 42, height: 42, borderRadius: '11px',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, boxShadow: '0 4px 14px rgba(59,130,246,0.4)',
          }}
        >
          <FontAwesomeIcon icon={faScissors} style={{ color: '#fff', fontSize: 18 }} />
        </Box>
        <Box sx={{ overflow: 'hidden' }}>
          <Typography variant="subtitle1" fontWeight={800} color="#ffffff" lineHeight={1.15} noWrap>
            Maquila
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 500 }} noWrap>
            Sistema de Gestión
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mx: 2 }} />

      <Typography
        variant="overline"
        sx={{ px: 3, pt: 2, pb: 0.6, color: 'rgba(255,255,255,0.25)', fontSize: '0.62rem', letterSpacing: 2.5, fontWeight: 700, display: 'block' }}
      >
        Módulos
      </Typography>

      <List sx={{ flex: 1, px: 1.5, py: 0, pb: 2 }}>
        {menuItems.map(({ label, icon, path }) => {
          const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

          return (
            <ListItemButton
              key={path}
              onClick={() => handleNav(path)}
              sx={{
                borderRadius: '10px', mb: 0.4, px: 1.5, py: 1, position: 'relative',
                color: isActive ? '#ffffff' : 'rgba(255,255,255,0.5)',
                bgcolor: isActive ? 'rgba(59,130,246,0.2)' : 'transparent',
                transition: 'all 0.2s ease',
                '&::before': isActive ? {
                  content: '""', position: 'absolute', left: 0, top: '20%', height: '60%',
                  width: 3, borderRadius: '0 3px 3px 0', bgcolor: '#60a5fa',
                } : {},
                '&:hover': {
                  bgcolor: isActive ? 'rgba(59,130,246,0.28)' : 'rgba(255,255,255,0.06)',
                  color: '#ffffff',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                <Box
                  sx={{
                    width: 34, height: 34, borderRadius: '9px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: isActive ? 'rgba(96,165,250,0.2)' : 'rgba(255,255,255,0.05)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <FontAwesomeIcon icon={icon} style={{ fontSize: 14 }} />
                </Box>
              </ListItemIcon>
              <ListItemText
                primary={label}
                primaryTypographyProps={{
                  fontWeight: isActive ? 700 : 500, fontSize: '0.88rem',
                  letterSpacing: isActive ? 0.1 : 0, lineHeight: 1.3,
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mx: 2 }} />
      <Box sx={{ px: 3, py: 1.5, flexShrink: 0 }}>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.15)', display: 'block', textAlign: 'center' }}>
          v1.0 · Maquila
        </Typography>
      </Box>
    </Box>
  );
}

export default function Sidebar({ open, onClose }) {
  const sharedPaperProps = {
    width: DRAWER_WIDTH,
    boxSizing: 'border-box',
    border: 'none',
    boxShadow: '4px 0 20px rgba(0,0,0,0.3)',
  };

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH, flexShrink: 0,
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': sharedPaperProps,
        }}
      >
        <SidebarContent />
      </Drawer>

      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': sharedPaperProps,
        }}
      >
        <SidebarContent onItemClick={onClose} />
      </Drawer>
    </>
  );
}
