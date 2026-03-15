import { useState, useEffect, useCallback } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, Paper, TextField, Tooltip, Typography, Alert,
  Chip, Card, CardContent, CardActions, Divider,
  Skeleton, LinearProgress,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTheme } from '@mui/material/styles';
import {
  faShirt, faPlus, faPenToSquare, faTrash, faSave, faTimes,
  faSpinner, faCheckCircle, faExclamationCircle, faUserSlash, faUserCheck,
} from '@fortawesome/free-solid-svg-icons';

const CARD_GRADIENTS = [
  ['#0F3460', '#1565c0'],
  ['#00695c', '#00897b'],
  ['#6a1b9a', '#8e24aa'],
  ['#bf360c', '#f4511e'],
  ['#1a237e', '#3949ab'],
  ['#004d40', '#00897b'],
  ['#880e4f', '#c2185b'],
  ['#1b5e20', '#388e3c'],
];

function cardGradient(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const [from, to] = CARD_GRADIENTS[Math.abs(hash) % CARD_GRADIENTS.length];
  return `linear-gradient(135deg, ${from} 0%, ${to} 100%)`;
}

const API_URL = import.meta.env.VITE_API_URL;
const EMPTY = { Nombre: '', Descripcion: '' };

export default function TiposPrenda() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const primaryMain = theme.palette.primary.main || '#1565c0';
  const primaryDark = theme.palette.primary.dark || '#0F3460';
  const muted = theme.palette.text.secondary;
  const bg = theme.palette.background.default;
  const surface = theme.palette.background.paper;
  const cardBgActive = isDark ? '#0B1724' : surface;
  const cardBgInactive = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(248, 250, 251, 0.7)';
  const cardBorderActive = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15, 52, 96, 0.1)';
  const cardBorderInactive = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(148, 163, 184, 0.2)';
  const dividerColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15, 52, 96, 0.08)';

  const [rows, setRows]                   = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [open, setOpen]                   = useState(false);
  const [isNew, setIsNew]                 = useState(true);
  const [editId, setEditId]               = useState(null);
  const [form, setForm]                   = useState(EMPTY);
  const [formErr, setFormErr]             = useState({});
  const [dlgMsg, setDlgMsg]               = useState('');
  const [saving, setSaving]               = useState(false);
  const [saveSuccess, setSaveSuccess]     = useState(false);
  const [toggleLoading, setToggleLoading] = useState(null);
  const [confirmId, setConfirmId]         = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const r = await fetch(`${API_URL}/api/tipos-prenda`);
      const j = await r.json();
      if (j.success) setRows(j.data.filter(d => d.Status !== 'Eliminado'));
      else setError('No se pudo cargar el catálogo.');
    } catch { setError('Error de conexión.'); }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const openNew  = () => { setIsNew(true);  setEditId(null); setForm(EMPTY); setFormErr({}); setDlgMsg(''); setSaveSuccess(false); setOpen(true); };
  const openEdit = (r) => { setIsNew(false); setEditId(r.Id); setForm({ Nombre: r.Nombre, Descripcion: r.Descripcion || '' }); setFormErr({}); setDlgMsg(''); setSaveSuccess(false); setOpen(true); };

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
      const url    = isNew ? `${API_URL}/api/tipos-prenda` : `${API_URL}/api/tipos-prenda/${editId}`;
      const method = isNew ? 'POST' : 'PUT';
      const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const j = await r.json();
      if (j.success) {
        setSaveSuccess(true);
        setTimeout(() => { setOpen(false); loadData(); setSaveSuccess(false); }, 1200);
      } else setDlgMsg(j.errors ? Object.values(j.errors).join(' ') : j.message || 'Error al guardar.');
    } catch { setDlgMsg('Error de conexión.'); }
    setSaving(false);
  };

  const handleToggle = async (r) => {
    setToggleLoading(r.Id);
    try {
      const res = await fetch(`${API_URL}/api/tipos-prenda/${r.Id}/status`, { method: 'PATCH' });
      const j   = await res.json();
      if (j.success) setTimeout(() => { loadData(); setToggleLoading(null); }, 600);
      else { setError('No se pudo cambiar el estado.'); setToggleLoading(null); }
    } catch { setError('No se pudo cambiar el estado.'); setToggleLoading(null); }
  };

  const handleDelete = async () => {
    if (!confirmId) return;
    try { await fetch(`${API_URL}/api/tipos-prenda/${confirmId}`, { method: 'DELETE' }); } catch { }
    setConfirmId(null); loadData();
  };

  const activos = rows.filter(r => r.Status === 'Activo').length;

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, backgroundColor: bg, minHeight: '100vh' }}>

      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', mb: 4, gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 56, height: 56, borderRadius: '14px', background: `linear-gradient(135deg, ${primaryDark} 0%, ${primaryMain} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(15,52,96,0.25)' }}>
            <FontAwesomeIcon icon={faShirt} style={{ color: '#fff', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, background: `linear-gradient(135deg, ${primaryDark} 0%, ${primaryMain} 100%)`, backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Tipos de Prenda
            </Typography>
            <Typography variant="body2" sx={{ color: muted, fontWeight: 500 }}>
              {activos} activo{activos !== 1 ? 's' : ''} · {rows.length} total
            </Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<FontAwesomeIcon icon={faPlus} />} onClick={openNew}
          sx={{ background: `linear-gradient(135deg, ${primaryDark} 0%, ${primaryMain} 100%)`, borderRadius: '12px', fontWeight: 700, px: 3, py: 1.5, fontSize: '0.95rem', textTransform: 'capitalize', boxShadow: '0 8px 20px rgba(15,52,96,0.3)', transition: 'all 0.3s ease',
            '&:hover': { background: `linear-gradient(135deg, #0a1f33 0%, ${primaryDark} 100%)`, transform: 'translateY(-2px)', boxShadow: '0 12px 28px rgba(15,52,96,0.4)' }, '&:active': { transform: 'translateY(0)' } }}>
          + Nueva Prenda
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setError('')}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><FontAwesomeIcon icon={faExclamationCircle} /> {error}</Box>
        </Alert>
      )}

      {/* Skeletons */}
      {loading ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', md: 'repeat(3,1fr)', xl: 'repeat(4,1fr)' }, gap: 3 }}>
          {[...Array(6)].map((_, i) => <Box key={i}><Skeleton variant="rounded" height={270} /></Box>)}
        </Box>
      ) : (
        <Box sx={{ mb: 4 }}>
          {rows.length === 0 ? (
            <Box>
              <Paper elevation={0} sx={{ textAlign: 'center', py: 10, backgroundColor: 'rgba(15,52,96,0.04)', borderRadius: '16px', border: '2px dashed rgba(15,52,96,0.1)' }}>
                <Box sx={{ color: '#94a3b8', mb: 2 }}><FontAwesomeIcon icon={faShirt} style={{ fontSize: 56, opacity: 0.3 }} /></Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: primaryDark, mb: 1 }}>No hay tipos de prenda</Typography>
                <Typography variant="body2" sx={{ color: muted, mb: 3 }}>Registra el primero con el botón de arriba.</Typography>
                <Button variant="contained" startIcon={<FontAwesomeIcon icon={faPlus} />} onClick={openNew}
                  sx={{ background: `linear-gradient(135deg, ${primaryDark} 0%, ${primaryMain} 100%)`, borderRadius: '10px', fontWeight: 700, textTransform: 'capitalize' }}>
                  Crear Prenda
                </Button>
              </Paper>
            </Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', md: 'repeat(3,1fr)', xl: 'repeat(4,1fr)' }, gap: 3 }}>
              {rows.map((r) => (
              <Card elevation={0} sx={{
                borderRadius: '16px', border: '1px solid',
                borderColor: r.Status === 'Activo' ? cardBorderActive : cardBorderInactive,
                backgroundColor: r.Status === 'Activo' ? cardBgActive : cardBgInactive,
                opacity: toggleLoading === r.Id ? 0.6 : r.Status === 'Activo' ? 1 : 0.78,
                transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)', overflow: 'hidden', position: 'relative',
                '&:hover': {
                  transform: r.Status === 'Activo' ? 'translateY(-8px)' : 'none',
                  boxShadow: r.Status === 'Activo' ? (isDark ? '0 16px 48px rgba(0,0,0,0.6)' : '0 16px 48px rgba(15,52,96,0.12)') : 'none',
                },
              }}>
                {toggleLoading === r.Id && <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', zIndex: 10 }} />}

                {/* Gradient card header */}
                <Box sx={{ height: 96, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden',
                  background: r.Status === 'Activo' ? cardGradient(r.Nombre) : 'linear-gradient(135deg, #455a64, #607d8b)' }}>
                  <Box sx={{ position: 'absolute', right: -8, bottom: -8, opacity: 0.12, color: '#fff' }}>
                    <FontAwesomeIcon icon={faShirt} style={{ fontSize: 82 }} />
                  </Box>
                  <Box sx={{ width: 54, height: 54, borderRadius: '14px', bgcolor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', border: '1.5px solid rgba(255,255,255,0.35)', zIndex: 1 }}>
                    <FontAwesomeIcon icon={faShirt} style={{ color: '#fff', fontSize: 26 }} />
                  </Box>
                </Box>

                <CardContent sx={{ pb: 1, pt: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: r.Status === 'Activo' ? primaryDark : muted, textAlign: 'center', lineHeight: 1.3, mb: 0.8 }}>
                    {r.Nombre}
                  </Typography>
                  {r.Descripcion && (
                    <Typography variant="body2" sx={{ color: muted, textAlign: 'center', fontSize: '0.82rem', mb: 1, wordBreak: 'break-word', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {r.Descripcion}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                    <Chip label={r.Status} size="small"
                      icon={<Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: r.Status === 'Activo' ? '#10b981' : '#94a3b8', display: 'inline-block', mr: 0.5 }} />}
                      sx={{ fontWeight: 700, fontSize: '0.75rem', bgcolor: r.Status === 'Activo' ? 'rgba(16,185,129,0.1)' : 'rgba(148,163,184,0.1)', color: r.Status === 'Activo' ? '#10b981' : '#94a3b8', border: `1.5px solid ${r.Status === 'Activo' ? 'rgba(16,185,129,0.3)' : 'rgba(148,163,184,0.25)'}` }} />
                  </Box>
                </CardContent>

                <Divider sx={{ borderColor: dividerColor }} />

                <CardActions sx={{ justifyContent: 'center', gap: 1, py: 1.5, px: 1 }}>
                  <Tooltip title="Editar">
                    <Button size="small" onClick={() => openEdit(r)} startIcon={<FontAwesomeIcon icon={faPenToSquare} style={{ fontSize: 12 }} />}
                      sx={{ color: r.Status === 'Activo' ? primaryDark : muted, bgcolor: r.Status === 'Activo' ? (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,52,96,0.08)') : 'transparent', fontWeight: 700, fontSize: '0.8rem', textTransform: 'capitalize', borderRadius: '8px', flex: 1, transition: 'all 0.2s',
                        '&:hover': r.Status === 'Activo' ? { bgcolor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(15,52,96,0.16)', transform: 'translateY(-2px)' } : {} }}>
                      Editar
                    </Button>
                  </Tooltip>
                  <Tooltip title={r.Status === 'Activo' ? 'Desactivar' : 'Activar'}>
                    <Button size="small" onClick={() => handleToggle(r)} disabled={toggleLoading === r.Id}
                      startIcon={toggleLoading === r.Id ? <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: 12 }} /> : r.Status === 'Activo' ? <FontAwesomeIcon icon={faUserSlash} style={{ fontSize: 12 }} /> : <FontAwesomeIcon icon={faUserCheck} style={{ fontSize: 12 }} />}
                      sx={{ color: r.Status === 'Activo' ? '#ef4444' : '#10b981', bgcolor: r.Status === 'Activo' ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'capitalize', borderRadius: '8px', flex: 1, transition: 'all 0.2s',
                        '&:hover': { bgcolor: r.Status === 'Activo' ? 'rgba(239,68,68,0.16)' : 'rgba(16,185,129,0.16)', transform: 'translateY(-2px)' }, '&:disabled': { opacity: 0.7 } }}>
                      {r.Status === 'Activo' ? 'Desactivar' : 'Activar'}
                    </Button>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton size="small" onClick={() => setConfirmId(r.Id)}
                      sx={{ color: '#ef4444', bgcolor: 'rgba(239,68,68,0.08)', borderRadius: '8px', transition: 'all 0.2s', '&:hover': { bgcolor: 'rgba(239,68,68,0.16)', transform: 'translateY(-2px)' } }}>
                      <FontAwesomeIcon icon={faTrash} style={{ fontSize: 12 }} />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* Dialog Crear/Editar */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: '20px', boxShadow: '0 25px 50px rgba(0,0,0,0.15)' } }}
        TransitionProps={{ timeout: { enter: 300, exit: 200 } }}>
        <DialogTitle sx={{ position: 'relative', zIndex: 2, background: `linear-gradient(135deg, ${primaryDark} 0%, ${primaryMain} 100%)`, color: '#fff', fontWeight: 800, fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: 1.5, pb: 3, pt: 3 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FontAwesomeIcon icon={isNew ? faPlus : faPenToSquare} style={{ fontSize: 18 }} />
          </Box>
          {isNew ? 'Nueva Prenda' : 'Editar Prenda'}
          <IconButton onClick={() => setOpen(false)} disabled={saving} sx={{ ml: 'auto', color: 'rgba(255,255,255,0.8)', '&:hover': { color: '#fff', backgroundColor: 'rgba(255,255,255,0.15)' } }}>
            <FontAwesomeIcon icon={faTimes} />
          </IconButton>
        </DialogTitle>
        {saving && <LinearProgress sx={{ height: '3px' }} />}
        <DialogContent sx={{ pt: 10, pb: 2, overflow: 'visible' }}>
          <Box component="form" autoComplete="off">
            {saveSuccess && (
              <Alert severity="success" icon={<FontAwesomeIcon icon={faCheckCircle} />} sx={{ mb: 2, borderRadius: '12px', backgroundColor: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981', fontWeight: 600 }}>
                {isNew ? 'Prenda creada exitosamente' : 'Prenda actualizada exitosamente'}
              </Alert>
            )}
            {dlgMsg && (
              <Alert severity="error" icon={<FontAwesomeIcon icon={faExclamationCircle} />} sx={{ mb: 2, borderRadius: '12px', backgroundColor: 'rgba(244,67,54,0.08)', border: '1px solid rgba(244,67,54,0.2)', color: '#f44336', fontWeight: 600 }}>
                {dlgMsg}
              </Alert>
            )}
            <TextField fullWidth label="Nombre *" name="Nombre" value={form.Nombre} autoComplete="off" inputProps={{ autoComplete: 'off' }}
              onChange={(e) => { setForm(p => ({ ...p, Nombre: e.target.value })); setFormErr(p => ({ ...p, Nombre: '' })); }}
              error={!!formErr.Nombre} helperText={formErr.Nombre} disabled={saving}
              sx={{ mt: 2, mb: 2.5, '& .MuiOutlinedInput-root': { borderRadius: '12px', '&.Mui-focused fieldset': { borderColor: primaryDark, borderWidth: '2px' } } }} />
            <TextField fullWidth label="Descripción (opcional)" name="Descripcion" value={form.Descripcion} autoComplete="off" inputProps={{ autoComplete: 'off' }}
              onChange={(e) => setForm(p => ({ ...p, Descripcion: e.target.value }))}
              multiline rows={3} disabled={saving}
              sx={{ mb: 2.5, '& .MuiOutlinedInput-root': { borderRadius: '12px', '&.Mui-focused fieldset': { borderColor: primaryDark, borderWidth: '2px' } } }} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
          <Button onClick={() => setOpen(false)} disabled={saving} variant="outlined"
            sx={{ borderRadius: '10px', fontWeight: 700, textTransform: 'capitalize', borderColor: '#e2e8f0', color: '#64748b', '&:hover': { borderColor: '#cbd5e1', backgroundColor: 'rgba(100,116,139,0.04)' } }}>
            Cancelar
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={saving || saveSuccess}
            startIcon={saving ? <FontAwesomeIcon icon={faSpinner} spin /> : saveSuccess ? <FontAwesomeIcon icon={faCheckCircle} /> : <FontAwesomeIcon icon={faSave} />}
            sx={{ background: `linear-gradient(135deg, ${primaryDark} 0%, ${primaryMain} 100%)`, borderRadius: '10px', fontWeight: 700, textTransform: 'capitalize', px: 3,
              '&:hover:not(:disabled)': { background: `linear-gradient(135deg, #0a1f33 0%, ${primaryDark} 100%)`, transform: 'translateY(-1px)' }, '&:disabled': { opacity: 0.9 } }}>
            {saving ? 'Guardando...' : saveSuccess ? 'Guardado' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Confirmar Eliminar */}
      <Dialog open={!!confirmId} onClose={() => setConfirmId(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '14px' } }}>
        <DialogTitle sx={{ fontWeight: 700, color: '#ef4444' }}>¿Eliminar tipo de prenda?</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">Esta acción es <strong>irreversible</strong>. ¿Deseas continuar?</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setConfirmId(null)} variant="outlined" sx={{ borderRadius: '8px', fontWeight: 600 }}>Cancelar</Button>
          <Button onClick={handleDelete} variant="contained" sx={{ borderRadius: '8px', fontWeight: 600, bgcolor: '#ef4444', '&:hover': { bgcolor: '#d32f2f' } }}>Eliminar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

