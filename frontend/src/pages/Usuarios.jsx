import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
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
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
  const colors = ['#1565c0', '#1a68a6', '#2e7d32', '#c62828', '#6a1b9a', '#00695c', '#e65100'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

// ---------------------------------------------------------------

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Dialog estado
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [dialogMsg, setDialogMsg] = useState('');

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
        closeDialog();
        fetchUsuarios();
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
    try {
      const res = await fetch(`${API_URL}/api/usuarios/${u.id}/status`, { method: 'PATCH' });
      const json = await res.json();
      if (json.success) fetchUsuarios();
    } catch {
      setError('No se pudo cambiar el estado.');
    }
  };

  // ---------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress size={48} sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  const activos = usuarios.filter((u) => u.Status === 'Activo').length;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #1565c0, #42a5f5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FontAwesomeIcon icon={faUsers} style={{ color: '#fff', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700} color="primary.main">
              Usuarios
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {activos} activo{activos !== 1 ? 's' : ''} · {usuarios.length} total
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<FontAwesomeIcon icon={faUserPlus} />}
          onClick={openNew}
          sx={{
            background: 'linear-gradient(135deg, #1565c0, #42a5f5)',
            borderRadius: '10px',
            fontWeight: 600,
            px: 3,
            '&:hover': { background: 'linear-gradient(135deg, #0d47a1, #1565c0)' },
          }}
        >
          Nuevo Usuario
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Cards grid */}
      <Grid container spacing={3}>
        {usuarios.map((u) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={u.id}>
            <Card
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: u.Status === 'Activo' ? 'rgba(21,101,192,0.12)' : 'rgba(0,0,0,0.08)',
                borderRadius: '16px',
                transition: 'all 0.2s',
                opacity: u.Status === 'Inactivo' ? 0.65 : 1,
                '&:hover': { boxShadow: '0 8px 28px rgba(21,101,192,0.15)', transform: 'translateY(-2px)' },
              }}
            >
              <CardContent sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 1, pb: 1 }}>
                  <Avatar
                    sx={{
                      width: 68,
                      height: 68,
                      fontSize: 22,
                      fontWeight: 700,
                      bgcolor: avatarColor(u.Nombre),
                      mb: 1.5,
                      boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
                    }}
                  >
                    {getInitials(u.Nombre)}
                  </Avatar>
                  <Typography variant="subtitle1" fontWeight={700} color="primary.main" textAlign="center" lineHeight={1.2}>
                    {u.Nombre}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="center"
                    sx={{ mt: 0.4, fontSize: '0.78rem' }}
                  >
                    @{u.Usuario}
                  </Typography>
                  <Chip
                    label={u.Rol || 'Operador'}
                    size="small"
                    sx={{
                      mt: 0.6,
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      bgcolor: u.Rol === 'Admin' ? 'rgba(21,101,192,0.1)' : 'rgba(0,0,0,0.05)',
                      color: u.Rol === 'Admin' ? '#1565c0' : '#555',
                      border: `1px solid ${u.Rol === 'Admin' ? 'rgba(21,101,192,0.25)' : 'rgba(0,0,0,0.1)'}`,
                    }}
                  />
                  <Chip
                    label={u.Status}
                    size="small"
                    sx={{
                      mt: 0.8,
                      fontWeight: 600,
                      fontSize: '0.72rem',
                      bgcolor: u.Status === 'Activo' ? 'rgba(46,125,50,0.1)' : 'rgba(0,0,0,0.06)',
                      color: u.Status === 'Activo' ? '#2e7d32' : '#616161',
                      border: `1px solid ${u.Status === 'Activo' ? 'rgba(46,125,50,0.3)' : 'rgba(0,0,0,0.12)'}`,
                    }}
                  />
                </Box>
              </CardContent>
              <Divider sx={{ borderColor: 'rgba(0,0,0,0.06)' }} />
              <CardActions sx={{ justifyContent: 'center', gap: 0.5, py: 1.2 }}>
                <Tooltip title="Editar usuario">
                  <IconButton
                    size="small"
                    onClick={() => openEdit(u)}
                    sx={{
                      color: 'primary.main',
                      bgcolor: 'rgba(21,101,192,0.06)',
                      '&:hover': { bgcolor: 'rgba(21,101,192,0.14)' },
                      borderRadius: '8px',
                      px: 1.5,
                    }}
                  >
                    <FontAwesomeIcon icon={faUserEdit} style={{ fontSize: 14 }} />
                    <Typography variant="caption" sx={{ ml: 0.8, fontWeight: 600 }}>
                      Editar
                    </Typography>
                  </IconButton>
                </Tooltip>
                <Tooltip title={u.Status === 'Activo' ? 'Desactivar' : 'Activar'}>
                  <IconButton
                    size="small"
                    onClick={() => handleToggleStatus(u)}
                    sx={{
                      color: u.Status === 'Activo' ? '#c62828' : '#2e7d32',
                      bgcolor: u.Status === 'Activo' ? 'rgba(198,40,40,0.06)' : 'rgba(46,125,50,0.06)',
                      '&:hover': {
                        bgcolor: u.Status === 'Activo' ? 'rgba(198,40,40,0.14)' : 'rgba(46,125,50,0.14)',
                      },
                      borderRadius: '8px',
                      px: 1.5,
                    }}
                  >
                    <FontAwesomeIcon
                      icon={u.Status === 'Activo' ? faUserSlash : faUserCheck}
                      style={{ fontSize: 14 }}
                    />
                    <Typography variant="caption" sx={{ ml: 0.8, fontWeight: 600 }}>
                      {u.Status === 'Activo' ? 'Desactivar' : 'Activar'}
                    </Typography>
                  </IconButton>
                </Tooltip>
              </CardActions>
            </Card>
          </Grid>
        ))}

        {usuarios.length === 0 && (
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
              <FontAwesomeIcon icon={faUsers} style={{ fontSize: 48, opacity: 0.2 }} />
              <Typography variant="h6" mt={2} fontWeight={600}>
                No hay usuarios registrados
              </Typography>
              <Typography variant="body2" mt={0.5}>
                Crea el primer usuario con el botón de arriba.
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* ---- Dialog crear/editar ---- */}
      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #1565c0, #42a5f5)',
            color: '#fff',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            mb: 4,
          }}
        >
          <FontAwesomeIcon icon={isNew ? faUserPlus : faUserEdit} />
          {isNew ? 'Nuevo Usuario' : 'Editar Usuario'}  
          <IconButton
            onClick={closeDialog}
            sx={{ ml: 'auto', color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#fff' } }}
            size="small"
          >
            <FontAwesomeIcon icon={faTimes} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 4, pb: 1, overflow: 'visible' }}>
          {dialogMsg && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {dialogMsg}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Nombre completo"
            name="Nombre"
            value={form.Nombre}
            onChange={(e) => {
              setForm((p) => ({ ...p, Nombre: e.target.value }));
              setFormErrors((p) => ({ ...p, Nombre: '' }));
            }}
            error={!!formErrors.Nombre}
            helperText={formErrors.Nombre}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <Box sx={{ mr: 1, color: 'primary.main', opacity: 0.5 }}>
                  <FontAwesomeIcon icon={faUser} style={{ fontSize: 14 }} />
                </Box>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Usuario (login)"
            name="Usuario"
            value={form.Usuario}
            onChange={(e) => {
              setForm((p) => ({ ...p, Usuario: e.target.value }));
              setFormErrors((p) => ({ ...p, Usuario: '' }));
            }}
            error={!!formErrors.Usuario}
            helperText={formErrors.Usuario}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <Box sx={{ mr: 1, color: 'primary.main', opacity: 0.5 }}>
                  <FontAwesomeIcon icon={faUser} style={{ fontSize: 14 }} />
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
            sx={{ mb: 2 }}
          >
            <MenuItem value="Admin">Admin</MenuItem>
            <MenuItem value="Operador">Operador</MenuItem>
          </TextField>

          <TextField
            fullWidth
            label={isNew ? 'Contraseña' : 'Nueva contraseña (opcional)'}
            name="Password"
            type="password"
            value={form.Password}
            onChange={(e) => {
              setForm((p) => ({ ...p, Password: e.target.value }));
              setFormErrors((p) => ({ ...p, Password: '' }));
            }}
            error={!!formErrors.Password}
            helperText={formErrors.Password || (isNew ? '' : 'Déjala vacía para no cambiarla.')}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <Box sx={{ mr: 1, color: 'primary.main', opacity: 0.5 }}>
                  <FontAwesomeIcon icon={faKey} style={{ fontSize: 14 }} />
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
              value={form.confirmPassword}
              onChange={(e) => {
                setForm((p) => ({ ...p, confirmPassword: e.target.value }));
                setFormErrors((p) => ({ ...p, confirmPassword: '' }));
              }}
              error={!!formErrors.confirmPassword}
              helperText={formErrors.confirmPassword}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <Box sx={{ mr: 1, color: 'primary.main', opacity: 0.5 }}>
                    <FontAwesomeIcon icon={faKey} style={{ fontSize: 14 }} />
                  </Box>
                ),
              }}
            />
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={closeDialog} variant="outlined" sx={{ borderRadius: '8px', fontWeight: 600 }}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving}
            startIcon={
              saving ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                <FontAwesomeIcon icon={faSave} />
              )
            }
            sx={{
              background: 'linear-gradient(135deg, #1565c0, #42a5f5)',
              borderRadius: '8px',
              fontWeight: 600,
              '&:hover': { background: 'linear-gradient(135deg, #0d47a1, #1565c0)' },
            }}
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
