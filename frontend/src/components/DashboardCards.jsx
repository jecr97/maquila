import { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLayerGroup,
  faGear,
  faCircleCheck,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';

const API_URL = import.meta.env.VITE_API_URL;

const cardDefs = [
  {
    key: 'registrados',
    label: 'Cortes Registrados',
    icon: faLayerGroup,
    gradient: 'linear-gradient(135deg, #1565c0 0%, #42a5f5 100%)',
    shadow: 'rgba(21,101,192,0.35)',
  },
  {
    key: 'enProduccion',
    label: 'En Producción',
    icon: faGear,
    gradient: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)',
    shadow: 'rgba(180,83,9,0.35)',
  },
  {
    key: 'finalizados',
    label: 'Cortes Finalizados',
    icon: faCircleCheck,
    gradient: 'linear-gradient(135deg, #047857 0%, #10b981 100%)',
    shadow: 'rgba(4,120,87,0.35)',
  },
  {
    key: 'faltantes',
    label: 'Piezas Faltantes',
    icon: faTriangleExclamation,
    gradient: 'linear-gradient(135deg, #b91c1c 0%, #ef4444 100%)',
    shadow: 'rgba(185,28,28,0.35)',
  },
];

export default function DashboardCards() {
  const [stats, setStats] = useState({ registrados: 0, enProduccion: 0, finalizados: 0, faltantes: 0 });

  useEffect(() => {
    fetch(`${API_URL}/api/dashboard/stats`)
      .then(r => r.json())
      .then(j => { if (j.success) setStats(j.data); })
      .catch(() => {});
  }, []);

  const cards = cardDefs.map(c => ({ ...c, value: stats[c.key] ?? 0 }));

  return (
    <Grid container spacing={3}>
      {cards.map(({ label, value, icon, gradient, shadow }) => (
        <Grid item xs={12} sm={6} xl={3} key={label}>
          <Card
            sx={{
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: `0 6px 24px ${shadow}`,
              transition: 'all 0.3s ease',
              cursor: 'default',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: `0 16px 40px ${shadow}`,
              },
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ background: gradient, p: 3, pb: 2.5 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <Box>
                    <Typography
                      variant="h2"
                      fontWeight={800}
                      color="#fff"
                      lineHeight={1}
                      sx={{ fontSize: { xs: '2.5rem', sm: '3rem' } }}
                    >
                      {value}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="rgba(255,255,255,0.82)"
                      mt={0.8}
                      fontWeight={500}
                      lineHeight={1.3}
                    >
                      {label}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 58,
                      height: 58,
                      borderRadius: '14px',
                      bgcolor: 'rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    <FontAwesomeIcon
                      icon={icon}
                      style={{ fontSize: 26, color: '#ffffff' }}
                    />
                  </Box>
                </Box>
              </Box>
              <Box
                sx={{
                  px: 3,
                  py: 1.4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  bgcolor: 'rgba(0,0,0,0.025)',
                }}
              >
                <Typography variant="caption" color="text.disabled" fontWeight={500}>
                  Actualizado
                </Typography>
                <Typography
                  variant="caption"
                  color="text.disabled"
                  fontWeight={400}
                >
                  Hoy
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
