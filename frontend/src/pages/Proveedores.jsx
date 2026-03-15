import { useState, useEffect, useCallback } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, Paper, TextField, Tooltip, Typography, Alert,
  CircularProgress, Chip, Card, CardContent, CardActions, Divider,
  Skeleton, LinearProgress,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTheme } from '@mui/material/styles';
import {
  faBuilding, faPlus, faPenToSquare, faTrash, faSave, faTimes,
  faSpinner, faRotateLeft, faTriangleExclamation, faCheckCircle, faExclamationCircle,
} from '@fortawesome/free-solid-svg-icons';
import { faUserSlash, faUserCheck } from '@fortawesome/free-solid-svg-icons';

const API_URL = import.meta.env.VITE_API_URL;
const EMPTY = { Nombre: '', Correo: '', Telefono: '' };

export default function Proveedores() {
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
  const cardBgActive = isDark ? '#0B1724' : surface;
  const cardBgInactive = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(248, 250, 251, 0.7)';
  const cardBorderActive = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15, 52, 96, 0.1)';
  const cardBorderInactive = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(148, 163, 184, 0.2)';
  const dividerColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15, 52, 96, 0.08)';

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [formErr, setFormErr] = useState({});
  const [dlgMsg, setDlgMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [reiniciarOpen, setReiniciarOpen] = useState(false);
  const [reiniciando, setReiniciando] = useState(false);
  const [reiniciarMsg, setReiniciarMsg] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const r = await fetch(`${API_URL}/api/proveedores`);
      const j = await r.json();
      if (j.success) setRows(j.data);
      else setError('No se pudieron cargar los proveedores.');
    } catch { setError('Error de conexión.'); }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const openNew = () => {
    setIsNew(true); setEditId(null); setForm(EMPTY); setFormErr({}); setDlgMsg(''); setOpen(true);
  };
  const openEdit = (r) => {
    setIsNew(false); setEditId(r.Id);
    setForm({ Nombre: r.Nombre, Correo: r.Correo || '', Telefono: r.Telefono || '' });
    setFormErr({}); setDlgMsg(''); setOpen(true);
  };

  const validate = () => {
    const e = {};
    if (!form.Nombre.trim()) e.Nombre = 'El nombre es requerido.';
    setFormErr(e);
    return !Object.keys(e).length;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true); setSaveSuccess(false); setDlgMsg('');
    try {
      const url = isNew ? `${API_URL}/api/proveedores` : `${API_URL}/api/proveedores/${editId}`;
      const method = isNew ? 'POST' : 'PUT';
      const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const j = await r.json();
      if (j.success) {
        setSaveSuccess(true);
        setTimeout(() => {
          setOpen(false);
          loadData();
          setSaveSuccess(false);
        }, 1200);
      }
      else setDlgMsg(j.errors ? Object.values(j.errors).join(' ') : j.message || 'Error al guardar.');
    } catch { setDlgMsg('Error de conexión.'); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirmId) return;
    try {
      await fetch(`${API_URL}/api/proveedores/${confirmId}`, { method: 'DELETE' });
    } catch { /* ignore */ }
    setConfirmId(null); loadData();
  };

  const handleToggleStatus = async (r) => {
    setToggleLoading(r.Id);
    try {
      const res = await fetch(`${API_URL}/api/proveedores/${r.Id}/status`, { method: 'PATCH' });
      const j = await res.json();
      if (j.success) {
        setTimeout(() => { loadData(); setToggleLoading(null); }, 600);
      } else {
        setError('No se pudo cambiar el estado.');
        setToggleLoading(null);
      }
    } catch (e) {
      setError('No se pudo cambiar el estado.');
      setToggleLoading(null);
    }
  };

  const handleReiniciar = async () => {
    setReiniciando(true); setReiniciarMsg('');
    try {
      const r = await fetch(`${API_URL}/api/proveedores/reiniciar`, { method: 'POST' });
      const j = await r.json();
      if (j.success) {
        setReiniciarOpen(false);
        setError('');
        setReiniciarMsg('');
      } else {
        setReiniciarMsg(j.message || 'Error al reiniciar.');
      }
    } catch { setReiniciarMsg('Error de conexión.'); }
    setReiniciando(false);
  };

  const f = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

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
              <FontAwesomeIcon icon={faBuilding} style={{ color: '#fff', fontSize: 24 }} />
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
                Proveedores
              </Typography>
              <Typography variant="body2" sx={{ color: muted, fontWeight: 500 }}>
                {rows.length} proveedor{rows.length !== 1 ? 'es' : ''}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<FontAwesomeIcon icon={faPlus} />}
          onClick={() => openNew()}
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
              background: `linear-gradient(135deg, ${isDark ? '#0a1f33' : '#0a1f33'} 0%, ${primaryDark} 100%)`,
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 28px rgba(15, 52, 96, 0.4)',
            },
            '&:active': { transform: 'translateY(0)' },
          }}
        >
          + Nuevo Proveedor
        </Button>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: '12px',
            border: '1px solid',
            borderColor: `rgba(244, 67, 54, 0.18)`,
            backgroundColor: `rgba(244, 67, 54, 0.06)`,
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

      {/* Loading skeleton */}
      {loading ? (
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', md: 'repeat(3,1fr)', xl: 'repeat(4,1fr)' }, gap: 3 }}>
            {[...Array(6)].map((_, i) => (
              <Box key={i}><Skeleton variant="rounded" height={320} /></Box>
            ))}
          </Box>
        </Box>
      ) : (
        <>
          {/* Cards grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', md: 'repeat(3,1fr)', xl: 'repeat(4,1fr)' }, gap: 3, mb: 4 }}>
            {rows.length === 0 ? (
              <Box>
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
                    <FontAwesomeIcon icon={faBuilding} style={{ fontSize: 56, opacity: 0.3 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: primaryDark, mb: 1 }}>
                    No hay proveedores registrados
                  </Typography>
                  <Typography variant="body2" sx={{ color: muted, mb: 3 }}>
                    Crea el primer proveedor con el botón de arriba.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<FontAwesomeIcon icon={faPlus} />}
                    onClick={() => openNew()}
                    sx={{
                      background: `linear-gradient(135deg, ${primaryDark} 0%, ${primaryMain} 100%)`,
                      borderRadius: '10px',
                      fontWeight: 700,
                      textTransform: 'capitalize',
                    }}
                  >
                    Crear Proveedor
                  </Button>
                </Paper>
              </Box>
            ) : (
              rows.map((r) => (
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: '16px',
                    border: '1px solid',
                    borderColor: r.Status === 'Activo' ? cardBorderActive : cardBorderInactive,
                    backgroundColor: r.Status === 'Activo' ? cardBgActive : cardBgInactive,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    overflow: 'hidden',
                    position: 'relative',
                    opacity: toggleLoading === r.Id ? 0.6 : r.Status === 'Activo' ? 1 : 0.78,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: r.Status === 'Activo' ? `linear-gradient(90deg, ${primaryDark}, ${primaryMain})` : 'rgba(148, 163, 184, 0.3)',
                    },
                    '&:hover': {
                      transform: r.Status === 'Activo' ? 'translateY(-8px)' : 'none',
                      boxShadow: r.Status === 'Activo' ? (isDark ? '0 16px 48px rgba(0,0,0,0.6)' : '0 16px 48px rgba(15, 52, 96, 0.12)') : 'none',
                      borderColor: r.Status === 'Activo' ? cardBorderActive : cardBorderInactive,
                    },
                  }}
                >
                  <CardContent sx={{ pb: 1, pt: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: r.Status === 'Activo' ? primaryDark : muted,
                        textAlign: 'center',
                        lineHeight: 1.3,
                        mb: 1.5,
                      }}
                    >
                      {r.Nombre}
                    </Typography>

                    {r.Correo && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: muted,
                          textAlign: 'center',
                          fontWeight: 500,
                          fontSize: '0.85rem',
                          mb: 0.8,
                          wordBreak: 'break-word',
                        }}
                      >
                        {r.Correo}
                      </Typography>
                    )}

                    {r.Telefono && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: muted,
                          textAlign: 'center',
                          fontWeight: 500,
                          fontSize: '0.85rem',
                          mb: 1.2,
                        }}
                      >
                        {r.Telefono}
                      </Typography>
                    )}

                    <Box sx={{ display: 'flex', gap: 1, width: '100%', justifyContent: 'center' }}>
                      <Chip
                        label={r.Status}
                        size="small"
                        icon={
                          <Box
                            component="span"
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              backgroundColor: r.Status === 'Activo' ? '#10b981' : '#94a3b8',
                              display: 'inline-block',
                              mr: 0.5,
                            }}
                          />
                        }
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          bgcolor: r.Status === 'Activo' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                          color: r.Status === 'Activo' ? '#10b981' : '#94a3b8',
                          border: `1.5px solid ${r.Status === 'Activo' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(148, 163, 184, 0.25)'}`,
                        }}
                      />
                    </Box>
                  </CardContent>

                  <Divider sx={{ borderColor: dividerColor }} />

                  <CardActions sx={{ justifyContent: 'center', gap: 1, py: 1.5, px: 1 }}>
                    <Tooltip title="Editar proveedor">
                      <Button
                        size="small"
                        onClick={() => openEdit(r)}
                        startIcon={<FontAwesomeIcon icon={faPenToSquare} style={{ fontSize: 12 }} />}
                        sx={{
                          color: r.Status === 'Activo' ? primaryDark : muted,
                          bgcolor: r.Status === 'Activo' ? (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15, 52, 96, 0.08)') : 'transparent',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          textTransform: 'capitalize',
                          borderRadius: '8px',
                          flex: 1,
                          transition: 'all 0.2s',
                          '&:hover': r.Status === 'Activo' ? { bgcolor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(15, 52, 96, 0.16)', transform: 'translateY(-2px)' } : {},
                        }}
                      >
                        Editar
                      </Button>
                    </Tooltip>

                    <Tooltip title={r.Status === 'Activo' ? 'Desactivar' : 'Activar'}>
                      <Button
                        size="small"
                        onClick={() => handleToggleStatus(r)}
                        startIcon={
                          toggleLoading === r.Id ? (
                            <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: 12 }} />
                          ) : r.Status === 'Activo' ? (
                            <FontAwesomeIcon icon={faUserSlash} style={{ fontSize: 12 }} />
                          ) : (
                            <FontAwesomeIcon icon={faUserCheck} style={{ fontSize: 12 }} />
                          )
                        }
                        disabled={toggleLoading === r.Id}
                        sx={{
                          color: r.Status === 'Activo' ? '#ef4444' : '#10b981',
                          bgcolor: r.Status === 'Activo' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          textTransform: 'capitalize',
                          borderRadius: '8px',
                          flex: 1,
                          transition: 'all 0.2s',
                          '&:hover': {
                            bgcolor: r.Status === 'Activo' ? 'rgba(239, 68, 68, 0.16)' : 'rgba(16, 185, 129, 0.16)',
                            transform: 'translateY(-2px)',
                          },
                          '&:disabled': {
                            opacity: 0.7,
                            cursor: 'not-allowed',
                          },
                        }}
                      >
                        {r.Status === 'Activo' ? 'Desactivar' : 'Activar'}
                      </Button>
                    </Tooltip>
                  </CardActions>
                </Card>
              ))
            )}
          </Box>


          {/* Zona de peligro */}
          <Paper
            elevation={0}
            sx={{
              border: '2px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '14px',
              p: 3,
              bgcolor: 'rgba(239, 68, 68, 0.02)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <FontAwesomeIcon icon={faTriangleExclamation} style={{ color: '#ef4444', fontSize: 18 }} />
              <Typography fontWeight={700} color="#ef4444">
                Zona de peligro
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Esta acción eliminará <strong>todos</strong> los registros de Cortes, Producción y Piezas Faltantes. Los catálogos (tipos de prenda, tipos de corte, precios, proveedores) no se verán afectados.
            </Typography>
            <Button
              variant="outlined"
              color="error"
              startIcon={<FontAwesomeIcon icon={faRotateLeft} />}
              onClick={() => setReiniciarOpen(true)}
              sx={{
                fontWeight: 600,
                borderRadius: '8px',
                borderColor: '#ef4444',
                color: '#ef4444',
                '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.06)' },
              }}
            >
              Reiniciar datos de producción
            </Button>
          </Paper>

          {/* Dialog Crear/Editar */}
          <Dialog
            open={open}
            onClose={() => setOpen(false)}
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
                <FontAwesomeIcon icon={isNew ? faPlus : faPenToSquare} style={{ fontSize: 18 }} />
              </Box>
              {isNew ? 'Nuevo Proveedor' : 'Editar Proveedor'}
              <IconButton
                onClick={() => setOpen(false)}
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
                    {isNew ? 'Proveedor creado exitosamente' : 'Proveedor actualizado exitosamente'}
                  </Alert>
                )}

                {dlgMsg && (
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
                    {dlgMsg}
                  </Alert>
                )}

                <TextField
                  fullWidth
                  label="Nombre *"
                  name="Nombre"
                  value={form.Nombre}
                  onChange={(e) => { setForm(p => ({ ...p, Nombre: e.target.value })); setFormErr(p => ({ ...p, Nombre: '' })); }}
                  error={!!formErr.Nombre}
                  helperText={formErr.Nombre}
                  disabled={saving}
                  autoComplete="off"
                  inputProps={{ autoComplete: 'off' }}
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
                />

                <TextField
                  fullWidth
                  label="Correo electrónico"
                  name="Correo"
                  type="email"
                  value={form.Correo}
                  onChange={(e) => setForm(p => ({ ...p, Correo: e.target.value }))}
                  disabled={saving}
                  autoComplete="off"
                  inputProps={{ autoComplete: 'off' }}
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
                />

                <TextField
                  fullWidth
                  label="Teléfono"
                  name="Telefono"
                  value={form.Telefono}
                  onChange={(e) => setForm(p => ({ ...p, Telefono: e.target.value }))}
                  disabled={saving}
                  autoComplete="off"
                  inputProps={{ autoComplete: 'off' }}
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
                />
              </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
              <Button
                onClick={() => setOpen(false)}
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
                    background: `linear-gradient(135deg, #0a1f33 0%, ${primaryDark} 100%)`,
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

          {/* Dialog Confirmar Eliminar */}
          <Dialog open={!!confirmId} onClose={() => setConfirmId(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '14px' } }}>
            <DialogTitle sx={{ fontWeight: 700, color: '#ef4444' }}>¿Desactivar proveedor?</DialogTitle>
            <DialogContent>
              <Typography color="text.secondary">Esta acción marcará al proveedor como <strong>Eliminado</strong> y quedará inactivo en el sistema.</Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
              <Button onClick={() => setConfirmId(null)} variant="outlined" sx={{ borderRadius: '8px', fontWeight: 600 }}>Cancelar</Button>
              <Button onClick={handleDelete} variant="contained" sx={{ borderRadius: '8px', fontWeight: 600, bgcolor: '#ef4444', '&:hover': { bgcolor: '#d32f2f' } }}>Desactivar</Button>
            </DialogActions>
          </Dialog>

          {/* Dialog Reiniciar */}
          <Dialog open={reiniciarOpen} onClose={() => { if (!reiniciando) { setReiniciarOpen(false); setReiniciarMsg(''); } }} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '14px' } }}>
            <DialogTitle sx={{ fontWeight: 700, color: '#c62828', display: 'flex', alignItems: 'center', gap: 1 }}>
              <FontAwesomeIcon icon={faTriangleExclamation} /> ¡Advertencia!
            </DialogTitle>
            <DialogContent>
              <Typography color="text.secondary" mb={1}>
                Esta acción es <strong>irreversible</strong>. Se eliminarán permanentemente:
              </Typography>
              <Box component="ul" sx={{ color: 'text.secondary', pl: 2, mt: 0, mb: 1 }}>
                <li>Todos los cortes registrados</li>
                <li>Todos los avances de producción</li>
                <li>Todos los registros de piezas faltantes</li>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Los catálogos (proveedores, tipos de prenda/corte, precios) no se borrarán.
              </Typography>
              {reiniciarMsg && <Alert severity="error" sx={{ mt: 2 }}>{reiniciarMsg}</Alert>}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
              <Button onClick={() => { setReiniciarOpen(false); setReiniciarMsg(''); }} variant="outlined" disabled={reiniciando} sx={{ borderRadius: '8px', fontWeight: 600 }}>Cancelar</Button>
              <Button onClick={handleReiniciar} variant="contained" disabled={reiniciando}
                startIcon={<FontAwesomeIcon icon={reiniciando ? faSpinner : faRotateLeft} spin={reiniciando} />}
                sx={{ borderRadius: '8px', fontWeight: 600, bgcolor: '#c62828', '&:hover': { bgcolor: '#b71c1c' } }}>
                {reiniciando ? 'Reiniciando...' : 'Confirmar reinicio'}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
}
