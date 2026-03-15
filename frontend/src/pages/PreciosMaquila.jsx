import { useState, useEffect, useCallback } from 'react';
import {
  Box, Button, Chip, Card, CardContent, CardActions, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, Paper, Tooltip, Typography, Alert, Divider, Skeleton, useTheme,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTags, faPlus, faPenToSquare, faToggleOn, faToggleOff, faDollarSign,
  faExclamationCircle,
} from '@fortawesome/free-solid-svg-icons';
import { faUserSlash, faUserCheck } from '@fortawesome/free-solid-svg-icons';
import CreateEditPrecioDialog from '../components/CreateEditPrecioDialog';

const API_URL = import.meta.env.VITE_API_URL;
const EMPTY = { IdTipoPrenda: '', IdTipoCorte: '', Precio: '' };

const fmt = (v) => Number(v).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

export default function PreciosMaquila() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const primaryMain = theme.palette.primary.main || '#1565c0';
  const primaryDark = theme.palette.primary.dark || '#0F3460';
  const muted = theme.palette.text.secondary;
  const bg = theme.palette.background.default;
  const surface = theme.palette.background.paper;
  const errorColor = theme.palette.error.main;
  const cardBgActive = isDark ? '#0B1724' : surface;
  const cardBgInactive = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(248, 250, 251, 0.7)';
  const cardBorderActive = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15, 52, 96, 0.1)';
  const cardBorderInactive = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(148, 163, 184, 0.2)';
  const dividerColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15, 52, 96, 0.08)';

  const CARD_GRADIENTS = [
    ['#1565c0', '#42a5f5'],
    ['#b45309', '#f59e0b'],
    ['#2e7d32', '#4ade80'],
    ['#6b21a8', '#9333ea'],
    ['#0f172a', '#0ea5e9'],
    ['#134e4a', '#14b8a6'],
  ];

  function cardGradient(seed = '') {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    const [from, to] = CARD_GRADIENTS[Math.abs(hash) % CARD_GRADIENTS.length];
    return `linear-gradient(135deg, ${from} 0%, ${to} 100%)`;
  }

  const [rows, setRows]           = useState([]);
  const [prendas, setPrendas]     = useState([]);
  const [cortes, setCortes]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [saving, setSaving]       = useState(false);
  const [open, setOpen]           = useState(false);
  const [isNew, setIsNew]         = useState(false);
  const [editId, setEditId]       = useState(null);
  const [form, setForm]           = useState(EMPTY);
  const [formErr, setFormErr]     = useState({});
  const [dlgMsg, setDlgMsg]       = useState('');

  const loadData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [rRows, rCats] = await Promise.all([
        fetch(`${API_URL}/api/precios`),
        fetch(`${API_URL}/api/precios/catalogos`),
      ]);
      const [jRows, jCats] = await Promise.all([rRows.json(), rCats.json()]);
      if (jRows.success) setRows(jRows.data.filter(d => d.Status !== 'Eliminado'));
      else setError('No se pudo cargar la lista de precios.');
      if (jCats.success) { setPrendas(jCats.prendas || []); setCortes(jCats.cortes || []); }
    } catch(error) { setError('Error de conexión.'); console.error(error); }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const openNew  = () => { setIsNew(true);  setEditId(null); setForm(EMPTY); setFormErr({}); setDlgMsg(''); setOpen(true); };
  const openEdit = (r) => { setIsNew(false); setEditId(r.Id); setForm({ IdTipoPrenda: r.IdTipoPrenda, IdTipoCorte: r.IdTipoCorte, Precio: r.Precio }); setFormErr({}); setDlgMsg(''); setOpen(true); };

  const validate = () => {
    const e = {};
    if (!form.IdTipoPrenda) e.IdTipoPrenda = 'Selecciona un tipo de prenda.';
    if (!form.IdTipoCorte)  e.IdTipoCorte  = 'Selecciona un tipo de corte.';
    if (!form.Precio || isNaN(form.Precio) || Number(form.Precio) <= 0) e.Precio = 'Ingresa un precio mayor a 0.';
    setFormErr(e);
    return !Object.keys(e).length;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true); setDlgMsg('');
    try {
      const url    = isNew ? `${API_URL}/api/precios` : `${API_URL}/api/precios/${editId}`;
      const method = isNew ? 'POST' : 'PUT';
      const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const j = await r.json();
      if (j.success) { setOpen(false); loadData(); }
      else setDlgMsg(j.errors ? Object.values(j.errors).join(' ') : j.message || 'Error al guardar.');
    } catch { setDlgMsg('Error de conexión.'); }
    setSaving(false);
  };

  const handleToggle = async (id) => {
    await fetch(`${API_URL}/api/precios/${id}/status`, { method: 'PATCH' });
    loadData();
  };

  const activos = rows.filter(r => r.Status === 'Activo').length;

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, backgroundColor: bg, minHeight: '100vh' }}>
      {/* Header premium */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', mb: 4, gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Box sx={{ width: 56, height: 56, borderRadius: '14px', background: `linear-gradient(135deg, ${primaryDark} 0%, ${primaryMain} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(15, 52, 96, 0.25)' }}>
              <FontAwesomeIcon icon={faTags} style={{ color: '#fff', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, background: `linear-gradient(135deg, ${primaryDark} 0%, ${primaryMain} 100%)`, backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Precios de Maquila
              </Typography>
              <Typography variant="body2" sx={{ color: muted, fontWeight: 500 }}>
                {activos} activo{activos !== 1 ? 's' : ''} · {rows.length} total
              </Typography>
            </Box>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<FontAwesomeIcon icon={faPlus} />} onClick={openNew}
          sx={{ background: `linear-gradient(135deg, ${primaryDark} 0%, ${primaryMain} 100%)`, borderRadius: '12px', fontWeight: 700, px: 3, py: 1.5, fontSize: '0.95rem', textTransform: 'capitalize', boxShadow: '0 8px 20px rgba(15, 52, 96, 0.3)', transition: 'all 0.3s ease', '&:hover': { background: `linear-gradient(135deg, #0a1f33 0%, ${primaryDark} 100%)`, transform: 'translateY(-2px)', boxShadow: '0 12px 28px rgba(15, 52, 96, 0.4)' }, '&:active': { transform: 'translateY(0)' } }}>
          + Nuevo Precio
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px', border: '1px solid', borderColor: 'rgba(244, 67, 54, 0.18)', backgroundColor: 'rgba(244, 67, 54, 0.06)', '& .MuiAlert-icon': { color: errorColor } }} onClose={() => setError('')}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><FontAwesomeIcon icon={faExclamationCircle} />{error}</Box>
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', md: 'repeat(3,1fr)', xl: 'repeat(4,1fr)' }, gap: 3 }}>
          {[...Array(6)].map((_, i) => <Box key={i}><Skeleton variant="rounded" height={280} sx={{ borderRadius: '16px' }} /></Box>)}
        </Box>
      ) : rows.length === 0 ? (
        <Paper elevation={0} sx={{ textAlign: 'center', py: 10, backgroundColor: 'rgba(15, 52, 96, 0.04)', borderRadius: '16px', border: '2px dashed rgba(15, 52, 96, 0.1)' }}>
          <Box sx={{ color: '#94a3b8', mb: 2 }}><FontAwesomeIcon icon={faTags} style={{ fontSize: 56, opacity: 0.3 }} /></Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: primaryDark, mb: 1 }}>Sin precios configurados</Typography>
          <Typography variant="body2" sx={{ color: muted, mb: 3 }}>Agrega combinaciones de prenda + corte con su precio.</Typography>
          <Button variant="contained" startIcon={<FontAwesomeIcon icon={faPlus} />} onClick={openNew}
            sx={{ background: `linear-gradient(135deg, ${primaryDark} 0%, ${primaryMain} 100%)`, borderRadius: '10px', fontWeight: 700, textTransform: 'capitalize' }}>
            Agregar Primero
          </Button>
        </Paper>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', md: 'repeat(3,1fr)', xl: 'repeat(4,1fr)' }, gap: 3 }}>
          {rows.map((r) => {
            const isActive = r.Status === 'Activo';
            const gradient = cardGradient(r.NombrePrenda || r.NombreCorte || '');
            return (
              <Card key={r.Id} elevation={0} sx={{
                borderRadius: '16px', border: '1px solid', borderColor: isActive ? cardBorderActive : cardBorderInactive,
                backgroundColor: isActive ? cardBgActive : cardBgInactive,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', overflow: 'hidden', position: 'relative',
                opacity: isActive ? 1 : 0.78,
                '&:hover': { transform: isActive ? 'translateY(-8px)' : 'none', boxShadow: isActive ? (isDark ? '0 16px 48px rgba(0,0,0,0.6)' : '0 16px 48px rgba(15, 52, 96, 0.12)') : 'none' },
              }}>
                <Box sx={{ height: 96, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', background: gradient }}>
                  <Box sx={{ position: 'absolute', right: -8, bottom: -8, opacity: 0.14, color: '#fff' }}>
                    <FontAwesomeIcon icon={faDollarSign} style={{ fontSize: 82 }} />
                  </Box>
                  <Box sx={{ width: 54, height: 54, borderRadius: '14px', bgcolor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', border: '1.5px solid rgba(255,255,255,0.35)', zIndex: 1 }}>
                    <FontAwesomeIcon icon={faDollarSign} style={{ color: '#fff', fontSize: 20 }} />
                  </Box>
                </Box>
                <CardContent sx={{ pb: 1, pt: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, background: gradient, backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textAlign: 'center', lineHeight: 1.3, mb: 0.5 }}>
                    {r.NombrePrenda || '—'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: muted, textAlign: 'center', fontWeight: 500, fontSize: '0.85rem', mb: 1.2 }}>
                    {r.NombreCorte || '—'}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, textAlign: 'center', lineHeight: 1, mb: 1.5, color: isActive ? primaryMain : (isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)') }}>
                    {fmt(r.Precio)}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, width: '100%', justifyContent: 'center' }}>
                    <Chip label={r.Status} size="small" icon={<Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: isActive ? '#10b981' : '#94a3b8', display: 'inline-block', mr: 0.5 }} />}
                      sx={{ fontWeight: 700, fontSize: '0.75rem', bgcolor: isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(148, 163, 184, 0.1)', color: isActive ? '#10b981' : '#94a3b8', border: `1.5px solid ${isActive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(148, 163, 184, 0.25)'}` }} />
                  </Box>
                </CardContent>
                <Divider sx={{ borderColor: dividerColor }} />
                <CardActions sx={{ justifyContent: 'center', gap: 1, py: 1.5, px: 1 }}>
                  <Tooltip title="Editar precio">
                    <Button size="small" onClick={() => openEdit(r)} startIcon={<FontAwesomeIcon icon={faPenToSquare} style={{ fontSize: 12 }} />}
                      sx={{ color: isActive ? primaryDark : muted, bgcolor: isActive ? (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15, 52, 96, 0.08)') : 'transparent', fontWeight: 700, fontSize: '0.8rem', textTransform: 'capitalize', borderRadius: '8px', flex: 1, transition: 'all 0.2s', '&:hover': isActive ? { bgcolor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(15, 52, 96, 0.16)', transform: 'translateY(-2px)' } : {} }}>
                      Editar
                    </Button>
                  </Tooltip>
                  <Tooltip title={isActive ? 'Desactivar' : 'Activar'}>
                    <Button size="small" onClick={() => handleToggle(r.Id)} startIcon={<FontAwesomeIcon icon={isActive ? faToggleOff : faToggleOn} style={{ fontSize: 12 }} />}
                      sx={{ color: isActive ? '#ef4444' : '#10b981', bgcolor: isActive ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'capitalize', borderRadius: '8px', flex: 1, transition: 'all 0.2s', '&:hover': { bgcolor: isActive ? 'rgba(239, 68, 68, 0.16)' : 'rgba(16, 185, 129, 0.16)', transform: 'translateY(-2px)' } }}>
                      {isActive ? 'Desactivar' : 'Activar'}
                    </Button>
                  </Tooltip>
                </CardActions>
              </Card>
            );
          })}
        </Box>
      )}

      {/* Dialog crear/editar */}
      <CreateEditPrecioDialog
        open={open}
        onClose={() => setOpen(false)}
        isNew={isNew}
        form={form}
        setForm={setForm}
        formErr={formErr}
        onSave={handleSave}
        saving={saving}
        dlgMsg={dlgMsg}
        prendas={prendas}
        cortes={cortes}
      />

    </Box>
  );
}

