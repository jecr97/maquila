import { Box, Typography, Grid, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGauge,
  faIndustry,
  faScissors,
  faClipboardList,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import DashboardCards from '../components/DashboardCards';

const quickLinks = [
  {
    icon: faScissors,
    label: 'Cortes',
    desc: 'Gestionar órdenes de corte',
    color: '#1565c0',
    path: '/cortes',
    gradient: 'linear-gradient(135deg, #1e3a8a 0%, #1565c0 100%)',
  },
  {
    icon: faIndustry,
    label: 'Producción',
    desc: 'Seguimiento de producción',
    color: '#b45309',
    path: '/produccion',
    gradient: 'linear-gradient(135deg, #78350f 0%, #b45309 100%)',
  },
  {
    icon: faClipboardList,
    label: 'Reportes',
    desc: 'Reportes y estadísticas',
    color: '#047857',
    path: '/reportes',
    gradient: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)',
  },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: { xs: 0, sm: 1 } }}>
      {/* Page header */}
      <Box
        sx={{
          mb: 5,
          display: 'flex',
          alignItems: 'center',
          gap: 2.5,
          flexWrap: 'wrap',
        }}
      >
        <Box
          sx={{
            width: 60,
            height: 60,
            borderRadius: '18px',
            background: 'linear-gradient(135deg, #0F3460 0%, #1565c0 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(15, 52, 96, 0.25)',
            flexShrink: 0,
          }}
        >
          <FontAwesomeIcon icon={faGauge} style={{ fontSize: 26, color: '#fff' }} />
        </Box>
        <Box>
          <Typography
            variant="h3"
            fontWeight={900}
            sx={{
              background: 'linear-gradient(135deg, #0F3460 0%, #1565c0 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '2rem', sm: '2.5rem' },
            }}
          >
            Panel Principal
          </Typography>
          <Typography variant="body1" color="text.secondary" fontWeight={500}>
            Bienvenido al sistema de control de maquila
          </Typography>
        </Box>
      </Box>

      {/* Summary cards: Full width on mobile via Grid items in component */}
      <Box sx={{ mb: 6 }}>
        <DashboardCards />
      </Box>

      {/* Quick access section */}
      <Box sx={{ mb: 3.5, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h5" fontWeight={800} color="primary.main" sx={{ mb: 0.5 }}>
            Accesos Directos
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            Navega rápidamente a los módulos operativos
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {quickLinks.map(({ icon, label, desc, color, path, gradient }) => (
          <Grid item xs={12} sm={4} key={label}>
            <Paper
              onClick={() => navigate(path)}
              elevation={0}
              sx={{
                borderRadius: '24px',
                p: 0,
                overflow: 'hidden',
                cursor: 'pointer',
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-6px)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                  borderColor: color,
                  '& .link-icon-box': {
                    transform: 'scale(1.1) rotate(-5deg)',
                    background: gradient,
                  },
                  '& .link-arrow': {
                    transform: 'translateX(5px)',
                    color: color,
                  }
                },
              }}
            >
              <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
                <Box
                  className="link-icon-box"
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '18px',
                    bgcolor: `${color}10`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.3s ease',
                  }}
                >
                  <FontAwesomeIcon icon={icon} style={{ fontSize: 26, color }} className="link-icon" />
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" fontWeight={800} color="text.primary" lineHeight={1.2}>
                    {label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mt: 0.5 }}>
                    {desc}
                  </Typography>
                </Box>
                <Box className="link-arrow" sx={{ transition: 'all 0.3s ease', color: 'text.disabled' }}>
                  <FontAwesomeIcon icon={faChevronRight} />
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
