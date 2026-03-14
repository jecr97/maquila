import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faLock,
  faEye,
  faEyeSlash,
  faScissors,
  faIndustry,
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

export default function Login() {
  const [form, setForm] = useState({ usuario: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = { usuario: form.usuario, password: form.password };
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch (err) {
        console.error('Login: server returned non-JSON response', text);
        setError('Respuesta inválida del servidor. Revisa la consola para más detalles.');
        setLoading(false);
        return;
      }
      if (json.success) {
        login(json.user);
        navigate('/');
      } else {
        setError(json.message || 'Credenciales inválidas.');
      }
    } catch (e) {
      console.error('Login request failed');
      setError('No se pudo conectar con el servidor.');
    }
    setLoading(false);
  };

  const primary = theme.palette.primary.main;
  const primaryDark = theme.palette.primary.dark;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, #020617 0%, ${primaryDark} 45%, ${primary} 75%, #0f172a 100%)`,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 48px, rgba(255,255,255,0.02) 48px, rgba(255,255,255,0.02) 49px),
            repeating-linear-gradient(90deg, transparent, transparent 48px, rgba(255,255,255,0.02) 48px, rgba(255,255,255,0.02) 49px)
          `,
          pointerEvents: 'none',
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute', top: -120, left: -120, width: 400, height: 400,
          borderRadius: '50%', pointerEvents: 'none',
          background: `radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)`,
        }}
      />
      <Box
        sx={{
          position: 'absolute', bottom: -160, right: -100, width: 500, height: 500,
          borderRadius: '50%', pointerEvents: 'none',
          background: `radial-gradient(circle, rgba(29,78,216,0.18) 0%, transparent 70%)`,
        }}
      />

      <Card
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: '100%', maxWidth: 440, mx: 2, borderRadius: '18px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06)',
          overflow: 'visible', position: 'relative', zIndex: 1,
          background: isDark ? '#1e293b' : '#ffffff',
          '&:hover': { transform: 'none', boxShadow: '0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06)' },
        }}
      >
        <Box
          sx={{
            height: 4,
            background: `linear-gradient(90deg, ${primaryDark} 0%, ${primary} 50%, #3b82f6 100%)`,
            borderRadius: '18px 18px 0 0',
          }}
        />

        <CardContent sx={{ p: { xs: 3, sm: 4 }, pt: { xs: 3, sm: 3.5 } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3.5 }}>
            <Box
              sx={{
                width: 72, height: 72, borderRadius: '16px', mb: 2,
                background: `linear-gradient(135deg, ${primary}, #3b82f6)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 10px 28px rgba(59,130,246,0.35)`,
              }}
            >
              <FontAwesomeIcon icon={faScissors} style={{ fontSize: 30, color: '#ffffff' }} />
            </Box>
            <Typography variant="h5" fontWeight={800} color="primary.main" letterSpacing={-0.5} lineHeight={1}>
              Sistema de Maquila
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.6}>
              Panel Administrativo
            </Typography>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2.5, borderRadius: 2, fontWeight: 500 }}
            >
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Usuario"
            name="usuario"
            type="text"
            value={form.usuario}
            onChange={handleChange}
            required
            autoFocus
            autoComplete="username"
            size="medium"
            sx={{ mb: 2.5 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FontAwesomeIcon
                    icon={faUser}
                    style={{ color: primary, opacity: 0.6, fontSize: 14 }}
                  />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Contraseña"
            name="password"
            type={showPass ? 'text' : 'password'}
            value={form.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
            size="medium"
            sx={{ mb: 3.5 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FontAwesomeIcon
                    icon={faLock}
                    style={{ color: primary, opacity: 0.6, fontSize: 14 }}
                  />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPass((v) => !v)}
                    edge="end"
                    size="small"
                  >
                    <FontAwesomeIcon
                      icon={showPass ? faEyeSlash : faEye}
                    style={{ fontSize: 14, color: primary, opacity: 0.5 }}
                    />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={loading}
            sx={{
              py: 1.7,
              fontSize: '1rem',
              fontWeight: 700,
              letterSpacing: 0.4,
              borderRadius: '12px',
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: '#fff' }} />
            ) : (
              'Iniciar Sesión'
            )}
          </Button>

          <Box
            sx={{
              mt: 3.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              opacity: 0.5,
            }}
          >
            <FontAwesomeIcon
              icon={faIndustry}
              style={{ color: primary, fontSize: 12 }}
            />
            <Typography variant="caption" color="text.disabled" fontWeight={500}>
              Industria Textil · Gestión de Maquila
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
