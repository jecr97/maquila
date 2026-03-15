import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Avatar,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Tooltip,
  Divider,
  Skeleton,
  Paper,
  LinearProgress,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTheme } from '@mui/material/styles';
import {
  faUsers,
  faUserEdit,
  faUserCheck,
  faUserSlash,
  faUserPlus,
  faKey,
  faUser,
  faTimes,
  faSave,
  faSpinner,
  faCheckCircle,
  faExclamationCircle,
  faCubes,
} from '@fortawesome/free-solid-svg-icons';

const API_URL = import.meta.env.VITE_API_URL;

const EMPTY_FORM = { Nombre: '', Usuario: '', Password: '', confirmPassword: '', Rol: 'Operador' };

function getInitials(name = '') {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function avatarColor(name = '') {
  const colors = [
    '#0F3460', // Azul oscuro profesional
    '#1565c0', // Azul moderno
    '#00897b', // Verde azulado
    '#00695c', // Verde oscuro
    '#455a64', // Gris azulado
    '#1a237e', // Azul profundo
    '#37474f', // Gris profesional
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

// ---------------------------------------------------------------

export default function Usuarios() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const primaryMain = theme.palette.primary.main || '#1565c0';
  const primaryDark = theme.palette.primary.dark || '#0F3460';
  const primaryContrast = theme.palette.getContrastText(primaryMain);
  const muted = theme.palette.text.secondary;
  const bg = theme.palette.background.default;
  const surface = theme.palette.background.paper;
  const successColor = theme.palette.success.main;
  const errorColor = theme.palette.error.main;
  // Card colors tuned for dark/light modes
  const cardBgActive = isDark ? '#0B1724' : surface;
  const cardBgInactive = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(248, 250, 251, 0.7)';
  const cardBorderActive = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15, 52, 96, 0.1)';
  const cardBorderInactive = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(148, 163, 184, 0.2)';
  const dividerColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15, 52, 96, 0.08)';
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Dialog estado
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [dialogMsg, setDialogMsg] = useState('');
  const [toggleLoading, setToggleLoading] = useState(null);

  // --- Módulos ---
  const [modulosDialogOpen, setModulosDialogOpen] = useState(false);
  const [modulosUser, setModulosUser] = useState(null);
  const [allModulos, setAllModulos] = useState([]);
  const [userModuloIds, setUserModuloIds] = useState([]);
  const [savingModulos, setSavingModulos] = useState(false);

  // ---- Fetch ----
  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/usuarios`);
      const json = await res.json();
      if (json.success) setUsuarios(json.data.filter((u) => u.Status !== 'Eliminado'));
      else setError('No se pudieron cargar los usuarios.');
    } catch {
      setError('Error de conexión con el servidor.');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  // ---- Abrir dialogo nuevo ----
  const openNew = () => {
    setIsNew(true);
    setEditId(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setDialogMsg('');
    setDialogOpen(true);
  };

  // ---- Abrir dialogo editar ----
  const openEdit = (u) => {
    setIsNew(false);
    setEditId(u.Id);
    setForm({ Nombre: u.Nombre, Usuario: u.Usuario, Password: '', confirmPassword: '', Rol: u.Rol || 'Operador' });
    setFormErrors({});
    setDialogMsg('');
    setDialogOpen(true);
  };

  const closeDialog = () => setDialogOpen(false);

  // ---- Validar ----
  const validate = () => {
    const errs = {};
    if (!form.Nombre.trim()) errs.Nombre = 'El nombre es requerido.';
    if (!form.Usuario.trim()) errs.Usuario = 'El usuario es requerido.';
    else if (form.Usuario.length < 3) errs.Usuario = 'Mínimo 3 caracteres.';
    if (isNew && !form.Password) errs.Password = 'La contraseña es requerida.';
    if (form.Password && form.Password.length < 6) errs.Password = 'Mínimo 6 caracteres.';
    if (form.Password && form.Password !== form.confirmPassword)
      errs.confirmPassword = 'Las contraseñas no coinciden.';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ---- Guardar ----
  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setSaveSuccess(false);
    setDialogMsg('');
    try {
      const body = { Nombre: form.Nombre, Usuario: form.Usuario, Rol: form.Rol };
      if (form.Password) body.Password = form.Password;

      const url = isNew ? `${API_URL}/api/usuarios` : `${API_URL}/api/usuarios/${editId}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success) {
        setSaveSuccess(true);
        setTimeout(() => {
          closeDialog();
          fetchUsuarios();
          setSaveSuccess(false);
        }, 1200);
      } else {
        const msg = json.errors
          ? Object.values(json.errors).join(' ')
          : json.message || 'Error al guardar.';
        setDialogMsg(msg);
      }
    } catch {
      setDialogMsg('Error de conexión.');
    }
    setSaving(false);
  };

  // ---- Toggle status ----
  const handleToggleStatus = async (u) => {
    setToggleLoading(u.Id);
    try {
      const res = await fetch(`${API_URL}/api/usuarios/${u.Id}/status`, { method: 'PATCH' });
      const json = await res.json();
      if (json.success) {
        setTimeout(() => {
          fetchUsuarios();
          setToggleLoading(null);
        }, 600);
      } else {
        setError('No se pudo cambiar el estado.');
        setToggleLoading(null);
      }
    } catch {
      setError('No se pudo cambiar el estado.');
      setToggleLoading(null);
    }
  };

  // ---- Módulos: abrir dialog ----
  const openModulosDialog = async (u) => {
    setModulosUser(u);
    setModulosDialogOpen(true);
    setSavingModulos(false);
    try {
      const [rAll, rUser] = await Promise.all([
        fetch(`${API_URL}/api/modulos`).then(r => r.json()),
        fetch(`${API_URL}/api/usuarios/${u.Id}/modulos`).then(r => r.json()),
      ]);
      if (rAll.success) setAllModulos(rAll.data);
      if (rUser.success) setUserModuloIds(rUser.data.map(m => Number(m.Id)));
    } catch { setError('Error cargando módulos.'); }
  };

  const toggleModulo = (id) => {
    setUserModuloIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSaveModulos = async () => {
    if (!modulosUser) return;
    setSavingModulos(true);
    try {
      const res = await fetch(`${API_URL}/api/usuarios/${modulosUser.Id}/modulos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modulos: userModuloIds }),
      });
      const json = await res.json();
      if (json.success) {
        setTimeout(() => setModulosDialogOpen(false), 600);
      } else { setError(json.message || 'Error al guardar módulos.'); }
    } catch { setError('Error de conexión.'); }
    setSavingModulos(false);
  };

  // ---------------------------------------------------------------
  // RENDER LOADING
  // ---------------------------------------------------------------
  if (loading) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        {/* Header skeleton */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Skeleton variant="rounded" width={56} height={56} />
            <Box>
              <Skeleton variant="text" width={200} height={32} />
              <Skeleton variant="text" width={150} height={20} sx={{ mt: 1 }} />
            </Box>
          </Box>
          <Skeleton variant="rounded" width={140} height={44} />
        </Box>

        {/* Cards skeleton */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', md: 'repeat(3,1fr)', xl: 'repeat(4,1fr)' }, gap: 3 }}>
          {[...Array(6)].map((_, i) => (
            <Box key={i}><Skeleton variant="rounded" height={400} /></Box>
          ))}
        </Box>
      </Box>
    );
  }

  // ---------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------

  const activos = usuarios.filter((u) => u.Status === 'Activo').length;

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, backgroundColor: bg, minHeight: '100vh' }}>
      {/* Header premium */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          mb: 4,
          gap: 2,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '14px',
                background: `linear-gradient(135deg, ${primaryDark} 0%, ${primaryMain} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(15, 52, 96, 0.25)',
              }}
            >
              <FontAwesomeIcon icon={faUsers} style={{ color: '#fff', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  background: `linear-gradient(135deg, ${primaryDark} 0%, ${primaryMain} 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Usuarios
              </Typography>
              <Typography variant="body2" sx={{ color: muted, fontWeight: 500 }}>
                {activos} activo{activos !== 1 ? 's' : ''} · {usuarios.length} total
              </Typography>
            </Box>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<FontAwesomeIcon icon={faUserPlus} />}
          onClick={openNew}
          sx={{
            background: `linear-gradient(135deg, ${primaryDark} 0%, ${primaryMain} 100%)`,
            borderRadius: '12px',
            fontWeight: 700,
            px: 3,
            py: 1.5,
            fontSize: '0.95rem',
            textTransform: 'capitalize',
            boxShadow: '0 8px 20px rgba(15, 52, 96, 0.3)',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: 'linear-gradient(135deg, #0a1f33 0%, #0F3460 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 28px rgba(15, 52, 96, 0.4)',
            },
            '&:active': { transform: 'translateY(0)' },
          }}
        >
          + Nuevo Usuario
        </Button>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: '12px',
            border: '1px solid',
            borderColor: 'rgba(244, 67, 54, 0.2)',
            backgroundColor: 'rgba(244, 67, 54, 0.08)',
            '& .MuiAlert-icon': { color: errorColor },
          }}
          onClose={() => setError('')}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FontAwesomeIcon icon={faExclamationCircle} />
            {error}
          </Box>
        </Alert>
      )}

      {/* Cards grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', md: 'repeat(3,1fr)', xl: 'repeat(4,1fr)' }, gap: 3 }}>
        {usuarios.map((u) => (
            <Card
              elevation={0}
              sx={{
                borderRadius: '16px',
                border: '1px solid',
                borderColor: u.Status === 'Activo' ? cardBorderActive : cardBorderInactive,
                backgroundColor: u.Status === 'Activo' ? cardBgActive : cardBgInactive,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: toggleLoading === u.Id ? 0.6 : u.Status === 'Inactivo' ? 0.7 : 1,
                overflow: 'hidden',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: u.Status === 'Activo' 
                    ? `linear-gradient(90deg, ${primaryDark}, ${primaryMain})` 
                    : 'rgba(148, 163, 184, 0.3)',
                },
                '&:hover': {
                  transform: u.Status === 'Activo' ? 'translateY(-8px)' : 'none',
                  boxShadow: u.Status === 'Activo' ? (isDark ? '0 16px 48px rgba(0,0,0,0.6)' : '0 16px 48px rgba(15, 52, 96, 0.12)') : 'none',
                  borderColor: u.Status === 'Activo' ? cardBorderActive : cardBorderInactive,
                },
              }}
            >
              {toggleLoading === u.Id && (
                <LinearProgress
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: `linear-gradient(90deg, ${primaryDark}, ${primaryMain})`,
                    zIndex: 10,
                  }}
                />
              )}

              <CardContent sx={{ pb: 2, pt: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ position: 'relative', mb: 1.5 }}>
                    <Avatar
                      sx={{
                        width: 72,
                        height: 72,
                        fontSize: 28,
                        fontWeight: 700,
                        bgcolor: avatarColor(u.Nombre),
                        boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.55)' : '0 8px 24px rgba(15, 52, 96, 0.25)',
                        border: '3px solid #fff',
                      }}
                    >
                      {getInitials(u.Nombre)}
                    </Avatar>
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        backgroundColor: u.Status === 'Activo' ? '#10b981' : '#94a3b8',
                        border: '2px solid #fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: '#fff',
                        }}
                      />
                    </Box>
                  </Box>

                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: primaryDark,
                      textAlign: 'center',
                      lineHeight: 1.3,
                      mb: 0.5,
                    }}
                  >
                    {u.Nombre}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: muted,
                      textAlign: 'center',
                      fontWeight: 500,
                      fontSize: '0.85rem',
                      marginBottom: 1,
                    }}
                  >
                    @{u.Usuario}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Chip
                      label={u.Rol || 'Operador'}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        bgcolor: u.Rol === 'Admin' ? primaryMain : 'rgba(100, 116, 139, 0.08)',
                        color: u.Rol === 'Admin' ? primaryContrast : muted,
                        border: `1.5px solid ${u.Rol === 'Admin' ? primaryDark : 'rgba(100, 116, 139, 0.2)'}`,
                      }}
                    />
                    <Chip
                      label={u.Status}
                      size="small"
                      icon={
                        <Box
                          component="span"
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            backgroundColor: u.Status === 'Activo' ? '#10b981' : '#94a3b8',
                            display: 'inline-block',
                            mr: 0.5,
                          }}
                        />
                      }
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        bgcolor: u.Status === 'Activo' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                        color: u.Status === 'Activo' ? '#10b981' : '#94a3b8',
                        border: `1.5px solid ${u.Status === 'Activo' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(148, 163, 184, 0.25)'}`,
                      }}
                    />
                  </Box>
                </Box>
              </CardContent>

              <Divider sx={{ borderColor: dividerColor }} />

              <CardActions sx={{ justifyContent: 'center', gap: 1, py: 1.5, px: 1 }}>
                <Tooltip title="Editar usuario">
                  <Button
                    size="small"
                    onClick={() => openEdit(u)}
                    startIcon={<FontAwesomeIcon icon={faUserEdit} style={{ fontSize: 12 }} />}
                    sx={{
                      color: primaryDark,
                      bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15, 52, 96, 0.08)',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      textTransform: 'capitalize',
                      borderRadius: '8px',
                      flex: 1,
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(15, 52, 96, 0.16)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    Editar
                  </Button>
                </Tooltip>

                <Tooltip title="Módulos">
                  <Button
                    size="small"
                    onClick={() => openModulosDialog(u)}
                    startIcon={<FontAwesomeIcon icon={faCubes} style={{ fontSize: 12 }} />}
                    sx={{
                      color: '#7c3aed',
                      bgcolor: 'rgba(124, 58, 237, 0.08)',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      textTransform: 'capitalize',
                      borderRadius: '8px',
                      flex: 1,
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: 'rgba(124, 58, 237, 0.16)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    Módulos
                  </Button>
                </Tooltip>

                <Tooltip title={u.Status === 'Activo' ? 'Desactivar' : 'Activar'}>
                  <Button
                    size="small"
                    onClick={() => handleToggleStatus(u)}
                    startIcon={
                      toggleLoading === u.Id ? (
                        <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: 12 }} />
                      ) : (
                        <FontAwesomeIcon
                          icon={u.Status === 'Activo' ? faUserSlash : faUserCheck}
                          style={{ fontSize: 12 }}
                        />
                      )
                    }
                    disabled={toggleLoading === u.Id}
                    sx={{
                      color: u.Status === 'Activo' ? '#ef4444' : '#10b981',
                      bgcolor: u.Status === 'Activo' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      textTransform: 'capitalize',
                      borderRadius: '8px',
                      flex: 1,
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: u.Status === 'Activo' ? 'rgba(239, 68, 68, 0.16)' : 'rgba(16, 185, 129, 0.16)',
                        transform: 'translateY(-2px)',
                      },
                      '&:disabled': {
                        opacity: 0.7,
                        cursor: 'not-allowed',
                      },
                    }}
                  >
                    {u.Status === 'Activo' ? 'Desactivar' : 'Activar'}
                  </Button>
                </Tooltip>
              </CardActions>
            </Card>
        ))}

        {usuarios.length === 0 && !loading && (
          <Box sx={{ gridColumn: '1 / -1' }}>
            <Paper
              elevation={0}
              sx={{
                textAlign: 'center',
                py: 10,
                backgroundColor: 'rgba(15, 52, 96, 0.04)',
                borderRadius: '16px',
                border: '2px dashed rgba(15, 52, 96, 0.1)',
              }}
            >
              <Box sx={{ color: '#94a3b8', mb: 2 }}>
                <FontAwesomeIcon icon={faUsers} style={{ fontSize: 56, opacity: 0.3 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: primaryDark, mb: 1 }}>
                No hay usuarios registrados
              </Typography>
              <Typography variant="body2" sx={{ color: muted, mb: 3 }}>
                Crea el primer usuario con el botón de arriba.
              </Typography>
                <Button
                variant="contained"
                startIcon={<FontAwesomeIcon icon={faUserPlus} />}
                onClick={openNew}
                sx={{
                  background: `linear-gradient(135deg, ${primaryDark} 0%, ${primaryMain} 100%)`,
                  borderRadius: '10px',
                  fontWeight: 700,
                  textTransform: 'capitalize',
                }}
              >
                Crear Usuario
              </Button>
            </Paper>
          </Box>
        )}
      </Box>

      {/* ---- Dialog crear/editar ---- */}
      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
          },
        }}
        TransitionProps={{
          timeout: { enter: 300, exit: 200 },
        }}
      >
        <DialogTitle
          sx={{
            position: 'relative',
            zIndex: 2,
            background: `linear-gradient(135deg, ${primaryDark} 0%, ${primaryMain} 100%)`,
            color: '#fff',
            fontWeight: 800,
            fontSize: '1.3rem',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            pb: 3,
            pt: 3,
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FontAwesomeIcon icon={isNew ? faUserPlus : faUserEdit} style={{ fontSize: 18 }} />
          </Box>
          {isNew ? 'Nuevo Usuario' : 'Editar Usuario'}
          <IconButton
            onClick={closeDialog}
            disabled={saving}
            sx={{
              ml: 'auto',
              color: 'rgba(255,255,255,0.8)',
              '&:hover': { color: '#fff', backgroundColor: 'rgba(255,255,255,0.15)' },
            }}
          >
            <FontAwesomeIcon icon={faTimes} />
          </IconButton>
        </DialogTitle>

        {saving && (
          <LinearProgress
            sx={{
              height: '3px',
              background: `linear-gradient(90deg, ${primaryDark}, ${primaryMain})`,
            }}
          />
        )}

        <DialogContent sx={{ pt: 10, pb: 2, overflow: 'visible' }}>
          <Box component="form" autoComplete="off">
          {saveSuccess && (
            <Alert
              severity="success"
              icon={<FontAwesomeIcon icon={faCheckCircle} />}
              sx={{
                mb: 2,
                borderRadius: '12px',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                color: '#10b981',
                fontWeight: 600,
              }}
            >
              {isNew ? 'Usuario creado exitosamente' : 'Usuario actualizado exitosamente'}
            </Alert>
          )}

          {dialogMsg && (
            <Alert
              severity="error"
              icon={<FontAwesomeIcon icon={faExclamationCircle} />}
              sx={{
                mb: 2,
                borderRadius: '12px',
                backgroundColor: 'rgba(244, 67, 54, 0.08)',
                border: '1px solid rgba(244, 67, 54, 0.2)',
                color: '#f44336',
                fontWeight: 600,
              }}
            >
              {dialogMsg}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Nombre completo"
            name="Nombre"
            autoComplete="off"
            inputProps={{ autoComplete: 'off' }}
            value={form.Nombre}
            onChange={(e) => {
              setForm((p) => ({ ...p, Nombre: e.target.value }));
              setFormErrors((p) => ({ ...p, Nombre: '' }));
            }}
            error={!!formErrors.Nombre}
            helperText={formErrors.Nombre}
            disabled={saving}
            sx={{
              mt: 2,
              mb: 2.5,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '&.Mui-focused fieldset': {
                  borderColor: primaryDark,
                  borderWidth: '2px',
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <Box sx={{ mr: 1.5, color: primaryDark, opacity: 0.6 }}>
                  <FontAwesomeIcon icon={faUser} />
                </Box>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Usuario (login)"
            name="Usuario"
            autoComplete="off"
            inputProps={{ autoComplete: 'off' }}
            value={form.Usuario}
            onChange={(e) => {
              setForm((p) => ({ ...p, Usuario: e.target.value }));
              setFormErrors((p) => ({ ...p, Usuario: '' }));
            }}
            error={!!formErrors.Usuario}
            helperText={formErrors.Usuario}
            disabled={saving}
            sx={{
              mb: 2.5,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '&.Mui-focused fieldset': {
                  borderColor: primaryDark,
                  borderWidth: '2px',
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <Box sx={{ mr: 1.5, color: primaryDark, opacity: 0.6 }}>
                  <FontAwesomeIcon icon={faUser} />
                </Box>
              ),
            }}
          />

          <TextField
            fullWidth
            select
            label="Rol"
            name="Rol"
            value={form.Rol}
            onChange={(e) => setForm((p) => ({ ...p, Rol: e.target.value }))}
            disabled={saving}
            sx={{
              mb: 2.5,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '&.Mui-focused fieldset': {
                  borderColor: primaryDark,
                  borderWidth: '2px',
                },
              },
            }}
          >
            <MenuItem value="Admin">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                👑 Admin
              </Box>
            </MenuItem>
            <MenuItem value="Operador">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                👤 Operador
              </Box>
            </MenuItem>
          </TextField>

          <TextField
            fullWidth
            label={isNew ? 'Contraseña' : 'Nueva contraseña (opcional)'}
            name="Password"
            type="password"
            autoComplete="new-password"
            inputProps={{ autoComplete: 'new-password' }}
            value={form.Password}
            onChange={(e) => {
              setForm((p) => ({ ...p, Password: e.target.value }));
              setFormErrors((p) => ({ ...p, Password: '' }));
            }}
            error={!!formErrors.Password}
            helperText={formErrors.Password || (isNew ? '' : 'Déjala vacía para no cambiarla.')}
            disabled={saving}
            sx={{
              mb: 2.5,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '&.Mui-focused fieldset': {
                  borderColor: primaryDark,
                  borderWidth: '2px',
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <Box sx={{ mr: 1.5, color: primaryDark, opacity: 0.6 }}>
                  <FontAwesomeIcon icon={faKey} />
                </Box>
              ),
            }}
          />

          {form.Password && (
            <TextField
              fullWidth
              label="Confirmar contraseña"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              inputProps={{ autoComplete: 'new-password' }}
              value={form.confirmPassword}
              onChange={(e) => {
                setForm((p) => ({ ...p, confirmPassword: e.target.value }));
                setFormErrors((p) => ({ ...p, confirmPassword: '' }));
              }}
              error={!!formErrors.confirmPassword}
              helperText={formErrors.confirmPassword}
              disabled={saving}
              sx={{
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  '&.Mui-focused fieldset': {
                    borderColor: '#0F3460',
                    borderWidth: '2px',
                  },
                },
              }}
              InputProps={{
                  startAdornment: (
                    <Box sx={{ mr: 1.5, color: primaryDark, opacity: 0.6 }}>
                      <FontAwesomeIcon icon={faKey} />
                    </Box>
                  ),
              }}
            />
          )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
          <Button
            onClick={closeDialog}
            disabled={saving}
            variant="outlined"
            sx={{
              borderRadius: '10px',
              fontWeight: 700,
              textTransform: 'capitalize',
              borderColor: '#e2e8f0',
              color: '#64748b',
              '&:hover': {
                borderColor: '#cbd5e1',
                backgroundColor: 'rgba(100, 116, 139, 0.04)',
              },
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving || saveSuccess}
            startIcon={
              saving ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : saveSuccess ? (
                <FontAwesomeIcon icon={faCheckCircle} />
              ) : (
                <FontAwesomeIcon icon={faSave} />
              )
            }
            sx={{
              background: `linear-gradient(135deg, ${primaryDark} 0%, ${primaryMain} 100%)`,
              borderRadius: '10px',
              fontWeight: 700,
              textTransform: 'capitalize',
              px: 3,
              transition: 'all 0.3s',
              '&:hover:not(:disabled)': {
                background: 'linear-gradient(135deg, #0a1f33 0%, #0F3460 100%)',
                transform: 'translateY(-1px)',
              },
              '&:disabled': {
                opacity: 0.9,
              },
            }}
          >
            {saving ? 'Guardando...' : saveSuccess ? 'Guardado' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ---- Dialog asignar módulos ---- */}
      <Dialog
        open={modulosDialogOpen}
        onClose={() => setModulosDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px', boxShadow: '0 25px 50px rgba(0,0,0,0.15)' } }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #5b21b6, #7c3aed)',
            color: '#fff', fontWeight: 800, fontSize: '1.3rem',
            display: 'flex', alignItems: 'center', gap: 1.5, pb: 3, pt: 3,
          }}
        >
          <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FontAwesomeIcon icon={faCubes} style={{ fontSize: 18 }} />
          </Box>
          Módulos — {modulosUser?.Nombre}
          <IconButton onClick={() => setModulosDialogOpen(false)} sx={{ ml: 'auto', color: 'rgba(255,255,255,0.8)', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.15)' } }}>
            <FontAwesomeIcon icon={faTimes} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          {modulosUser?.Rol === 'Admin' && (
            <Alert severity="info" sx={{ mb: 2, borderRadius: '12px' }}>
              Los usuarios Admin tienen acceso total a todos los módulos automáticamente.
            </Alert>
          )}
          <Typography variant="body2" sx={{ mb: 2, color: muted }}>Selecciona los módulos a los que tendrá acceso este usuario:</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
            {allModulos.map(m => {
              const checked = userModuloIds.includes(Number(m.Id));
              return (
                <Box
                  key={m.Id}
                  onClick={() => toggleModulo(Number(m.Id))}
                  sx={{
                    p: 1.5, borderRadius: '12px', cursor: 'pointer',
                    border: '2px solid', transition: 'all 0.2s',
                    borderColor: checked ? '#7c3aed' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'),
                    bgcolor: checked ? 'rgba(124,58,237,0.08)' : 'transparent',
                    '&:hover': { borderColor: '#7c3aed', bgcolor: 'rgba(124,58,237,0.04)' },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                      width: 32, height: 32, borderRadius: '8px',
                      bgcolor: checked ? '#7c3aed' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: checked ? '#fff' : muted, transition: 'all 0.2s',
                    }}>
                      {checked ? <FontAwesomeIcon icon={faCheckCircle} style={{ fontSize: 14 }} /> : <FontAwesomeIcon icon={faCubes} style={{ fontSize: 12 }} />}
                    </Box>
                    <Box>
                      <Typography variant="body2" fontWeight={700} color="text.primary">{m.Nombre}</Typography>
                      <Typography variant="caption" color="text.secondary">{m.Ruta}</Typography>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
          <Button onClick={() => setModulosDialogOpen(false)} variant="outlined" sx={{ borderRadius: '10px', fontWeight: 700, textTransform: 'capitalize', borderColor: '#e2e8f0', color: '#64748b' }}>
            Cancelar
          </Button>
          <Button
            onClick={handleSaveModulos}
            variant="contained"
            disabled={savingModulos}
            startIcon={savingModulos ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
            sx={{
              background: 'linear-gradient(135deg, #5b21b6, #7c3aed)', borderRadius: '10px',
              fontWeight: 700, textTransform: 'capitalize', px: 3,
              '&:hover': { background: 'linear-gradient(135deg, #4c1d95, #5b21b6)' },
            }}
          >
            {savingModulos ? 'Guardando...' : 'Guardar Módulos'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

