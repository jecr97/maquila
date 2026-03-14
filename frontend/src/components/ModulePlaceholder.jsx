import { Box, Typography, Paper } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function ModulePlaceholder({ icon, title, description }) {
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
          <FontAwesomeIcon icon={icon} style={{ fontSize: 22, color: '#fff' }} />
        </Box>
        <Box>
          <Typography
            variant="h4"
            fontWeight={800}
            color="primary.main"
            lineHeight={1.1}
          >
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.3}>
            {description}
          </Typography>
        </Box>
      </Box>

      {/* Placeholder card */}
      <Paper
        sx={{
          borderRadius: '16px',
          p: { xs: 5, md: 10 },
          textAlign: 'center',
          boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
          border: '2px dashed rgba(21,101,192,0.14)',
          bgcolor: 'rgba(21,101,192,0.015)',
          '&:hover': { transform: 'none', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' },
        }}
      >
        <Box
          sx={{
            width: 108,
            height: 108,
            borderRadius: '24px',
            background:
              'linear-gradient(135deg, rgba(21,101,192,0.07) 0%, rgba(26,104,166,0.07) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3.5,
          }}
        >
          <FontAwesomeIcon
            icon={icon}
            style={{ fontSize: 48, color: 'primary.main', opacity: 0.4 }}
          />
        </Box>
        <Typography
          variant="h5"
          fontWeight={700}
          color="primary.main"
          mb={1.2}
        >
          {title}
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          maxWidth={440}
          mx="auto"
          lineHeight={1.6}
        >
          {description}
        </Typography>
        <Box
          sx={{
            mt: 3,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: 'rgba(21,101,192,0.06)',
            borderRadius: '8px',
            px: 2,
            py: 0.8,
          }}
        >
          <Typography variant="caption" color="text.disabled" fontWeight={600}>
            Módulo en desarrollo · Próximamente disponible
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
