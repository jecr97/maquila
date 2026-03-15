import { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLayerGroup,
  faGear,
  faCircleCheck,
  faTriangleExclamation,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';

const API_URL = import.meta.env.VITE_API_URL;

const cardDefs = [
  {
    key: 'registrados',
    label: 'Cortes Registrados',
    icon: faLayerGroup,
    gradient: 'linear-gradient(135deg, #1565c0 0%, #42a5f5 100%)',
    shadow: 'rgba(21,101,192,0.3)',
    path: '/cortes',
  },
  {
    key: 'enProduccion',
    label: 'En Producción',
    icon: faGear,
    gradient: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)',
    shadow: 'rgba(180,83,9,0.3)',
    path: '/cortes',
  },
  {
    key: 'finalizados',
    label: 'Cortes Finalizados',
    icon: faCircleCheck,
    gradient: 'linear-gradient(135deg, #047857 0%, #10b981 100%)',
    shadow: 'rgba(4,120,87,0.3)',
    path: '/cortes',
  },
  {
    key: 'faltantes',
    label: 'Piezas Faltantes',
    icon: faTriangleExclamation,
    gradient: 'linear-gradient(135deg, #b91c1c 0%, #ef4444 100%)',
    shadow: 'rgba(185,28,28,0.3)',
    path: '/cortes',
  },
];

export default function DashboardCards() {
  const navigate = useNavigate();
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
      {cards.map(({ label, value, icon, gradient, shadow, path }) => (
        <Grid item xs={12} sm={6} md={3} key={label}>
          <Card
            onClick={() => navigate(path)}
            sx={{
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: `0 8px 32px ${shadow}`,
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              border: '1px solid rgba(255,255,255,0.1)',
              position: 'relative',
              '&:hover': {
                transform: 'translateY(-8px) scale(1.02)',
                boxShadow: `0 20px 48px ${shadow}`,
                '& .card-arrow': { opacity: 1, transform: 'translateX(0)' }
              },
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ background: gradient, p: { xs: 3, sm: 4 }, pb: { xs: 2.5, sm: 3.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h2" fontWeight={900} color="#fff" lineHeight={1} sx={{ fontSize: { xs: '2.8rem', sm: '3.2rem' }, mb: 1 }}>
                      {value}
                    </Typography>
                    <Typography variant="body1" color="rgba(255,255,255,0.9)" fontWeight={700} sx={{ letterSpacing: 0.5 }}>
                      {label}
                    </Typography>
                  </Box>
                  <Box sx={{ width: 64, height: 64, borderRadius: '20px', bgcolor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                    <FontAwesomeIcon icon={icon} style={{ fontSize: 28, color: '#ffffff' }} />
                  </Box>
                </Box>
              </Box>
              <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'background.paper' }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                  Ver detalles
                </Typography>
                <Box className="card-arrow" sx={{ opacity: 0.5, transform: 'translateX(-10px)', transition: 'all 0.3s ease' }}>
                  <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 14, color: 'rgba(0,0,0,0.3)' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
