import { Box, Typography, Grid, Paper } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGauge,
  faIndustry,
  faScissors,
  faClipboardList,
} from '@fortawesome/free-solid-svg-icons';
import DashboardCards from '../components/DashboardCards';

const quickLinks = [
  {
    icon: faScissors,
    label: 'Cortes',
    desc: 'Gestionar órdenes de corte',
    color: 'primary.main',
  },
  {
    icon: faIndustry,
    label: 'Producción',
    desc: 'Seguimiento de producción',
    color: '#b45309',
  },
  {
    icon: faClipboardList,
    label: 'Reportes',
    desc: 'Reportes y estadísticas',
    color: '#047857',
  },
];

export default function Dashboard() {
  return (
    <Box>
      {/* Page header */}
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: '13px',
            background: 'linear-gradient(135deg, #1565c0 0%, #42a5f5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 20px rgba(21,101,192,0.3)',
            flexShrink: 0,
          }}
        >
          <FontAwesomeIcon icon={faGauge} style={{ fontSize: 22, color: '#fff' }} />
        </Box>
        <Box>
          <Typography
            variant="h4"
            fontWeight={800}
            color="primary.main"
            lineHeight={1.1}
          >
            Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.3}>
            Resumen general del sistema
          </Typography>
        </Box>
      </Box>

      {/* Summary cards */}
      <DashboardCards />

      {/* Quick access section */}
      <Box sx={{ mt: 5, mb: 2.5 }}>
        <Typography variant="h6" fontWeight={700} color="primary.main">
          Acceso Rápido
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Módulos más utilizados
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {quickLinks.map(({ icon, label, desc, color }) => (
          <Grid item xs={12} sm={4} key={label}>
            <Paper
              sx={{
                borderRadius: '16px',
                p: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                cursor: 'pointer',
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.25s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 10px 32px rgba(21,101,192,0.12)',
                  borderColor: color,
                },
              }}
            >
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: '12px',
                  bgcolor: `${color}18`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <FontAwesomeIcon icon={icon} style={{ fontSize: 22, color }} />
              </Box>
              <Box>
                <Typography fontWeight={700} color="text.primary" lineHeight={1.2}>
                  {label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {desc}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
