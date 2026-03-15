import { useState, useEffect, useCallback } from 'react';
import {
  Box, Button, Chip, Card, CardContent, CardActions, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, FormHelperText, IconButton, InputLabel, MenuItem, Paper, Select,
  TextField, Tooltip, Typography, Alert, Divider, Skeleton, Tabs, Tab, useTheme,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLayerGroup, faPlus, faPenToSquare, faPlay, faFlagCheckered,
  faTrash, faSave, faTimes, faSpinner, faEye, faExclamationCircle,
} from '@fortawesome/free-solid-svg-icons';

const API_URL = import.meta.env.VITE_API_URL;
const EMPTY = { IdTipoPrenda: '', IdTipoCorte: '', IdProveedor: '', CantidadPiezas: '' };

const fmt = (v) => Number(v).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

export default function Cortes() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const primaryMain = theme.palette.primary.main || '#1565c0';
  const primaryDark = theme.palette.primary.dark || '#0F3460';
  const muted = theme.palette.text.secondary;
  const bg = theme.palette.background.default;
  const surface = theme.palette.background.paper;
  const errorColor = theme.palette.error.main;
  const cardBg = isDark ? '#0B1724' : surface;
  const cardBorderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15, 52, 96, 0.1)';
  const dividerColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15, 52, 96, 0.08)';

  const statusConfig = {
    Registrado: { bg: isDark ? 'rgba(21,101,192,0.15)' : 'rgba(21,101,192,0.08)', color: isDark ? '#42a5f5' : '#1565c0', border: isDark ? 'rgba(21,101,192,0.4)' : 'rgba(21,101,192,0.25)', accent: '#1565c0' },
    Comenzado:  { bg: isDark ? 'rgba(180,83,9,0.15)' : 'rgba(180,83,9,0.08)',     color: isDark ? '#fbbf24' : '#b45309',   border: isDark ? 'rgba(180,83,9,0.4)' : 'rgba(180,83,9,0.25)',   accent: '#b45309' },
    Finalizado: { bg: isDark ? 'rgba(46,125,50,0.15)' : 'rgba(46,125,50,0.08)',   color: isDark ? '#4ade80' : '#2e7d32',   border: isDark ? 'rgba(46,125,50,0.4)' : 'rgba(46,125,50,0.25)', accent: '#2e7d32' },
  };

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
  const [precios, setPrecios]     = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [idProveedor, setIdProveedor] = useState('');
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [saving, setSaving]       = useState(false);
  const [tab, setTab]             = useState(0);
  const [desde, setDesde]         = useState('');
  const [hasta, setHasta]         = useState('');
  const [dateErr, setDateErr]     = useState('');
  const [open, setOpen]           = useState(false);
  const [isNew, setIsNew]         = useState(false);
  const [editId, setEditId]       = useState(null);
  const [form, setForm]           = useState(EMPTY);
  const [formErr, setFormErr]     = useState({});
  const [dlgMsg, setDlgMsg]       = useState('');
  const [detail, setDetail]       = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const user = JSON.parse(localStorage.getItem('maquila_user') || '{}');
  const tabStatus = ['', 'Registrado', 'Comenzado', 'Finalizado'];

  const loadData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams();
      if (tabStatus[tab]) params.set('status', tabStatus[tab]);
      if (desde)       params.set('desde', desde);
      if (hasta)       params.set('hasta', hasta);
      if (idProveedor) params.set('idProveedor', idProveedor);
      const [rRows, rCats, rPrecios] = await Promise.all([
        fetch(`${API_URL}/api/cortes?${params}`),
        fetch(`${API_URL}/api/cortes/catalogos`),
        fetch(`${API_URL}/api/precios`),
      ]);
      const [jRows, jCats, jPrecios] = await Promise.all([rRows.json(), rCats.json(), rPrecios.json()]);
      if (jRows.success) setRows(jRows.data);
      else setError('No se pudieron cargar los cortes.');
      if (jCats.success) {
        setPrendas(jCats.prendas || []);
        setCortes(jCats.cortes || []);
        setProveedores(jCats.proveedores || []);
      }
      if (jPrecios.success) setPrecios((jPrecios.data || []).filter(p => p.Status === 'Activo'));
    } catch { setError('Error de conexión.'); }
    setLoading(false);
  }, [tab, desde, hasta, idProveedor]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleHastaChange = (val) => {
    if (val && !desde) { setDateErr('Primero selecciona la fecha inicial.'); return; }
    if (val && desde && val < desde) { setDateErr('La fecha final no puede ser anterior a la inicial.'); return; }
    setDateErr('');
    setHasta(val);
  };

  const openNew = () => { setIsNew(true); setEditId(null); setForm(EMPTY); setFormErr({}); setDlgMsg(''); setOpen(true); };
  const openEdit = (r) => {
    if (r.Status === 'Finalizado') return;
    setIsNew(false); setEditId(r.Id);
    setForm({ IdTipoPrenda: r.IdTipoPrenda, IdTipoCorte: r.IdTipoCorte, IdProveedor: r.IdProveedor || '', CantidadPiezas: r.CantidadPiezas });
    setFormErr({}); setDlgMsg(''); setOpen(true);
  };

  // Only show cortes that have a configured price for the selected prenda
  const filteredCortes = form.IdTipoPrenda
    ? cortes.filter(c => precios.some(p => String(p.IdTipoPrenda) === String(form.IdTipoPrenda) && String(p.IdTipoCorte) === String(c.Id)))
    : [];

  const sinPrecio = !!(form.IdTipoPrenda && form.IdTipoCorte &&
    !precios.some(p => p.IdTipoPrenda == form.IdTipoPrenda && p.IdTipoCorte == form.IdTipoCorte));

  const validate = () => {
    const e = {};
    if (!form.IdTipoPrenda) e.IdTipoPrenda = 'Selecciona un tipo de prenda.';
    if (!form.IdTipoCorte)  e.IdTipoCorte  = 'Selecciona un tipo de corte.';
    if (!form.CantidadPiezas || Number(form.CantidadPiezas) <= 0) e.CantidadPiezas = 'Ingresa una cantidad mayor a 0.';
    if (sinPrecio) e.combo = 'No existe precio configurado para esta combinación. Configúralo en Precios Maquila.';
    setFormErr(e);
    return !Object.keys(e).length;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true); setDlgMsg('');
    try {
      const body = { ...form, IdUsuarioRegistro: user.id };
      const url    = isNew ? `${API_URL}/api/cortes` : `${API_URL}/api/cortes/${editId}`;
      const method = isNew ? 'POST' : 'PUT';
      const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const j = await r.json();
      if (j.success) { setOpen(false); loadData(); }
      else setDlgMsg(j.errors ? Object.values(j.errors).join(' ') : j.message || 'Error al guardar.');
    } catch { setDlgMsg('Error de conexión.'); }
    setSaving(false);
  };

  const handleAction = async () => {
    if (!confirmId || !confirmAction) return;
    try {
      if (confirmAction === 'delete') {
        await fetch(`${API_URL}/api/cortes/${confirmId}`, { method: 'DELETE' });
      } else if (confirmAction === 'comenzar') {
        await fetch(`${API_URL}/api/cortes/${confirmId}/comenzar`, { method: 'PATCH' });
      } else if (confirmAction === 'finalizar') {
        await fetch(`${API_URL}/api/cortes/${confirmId}/finalizar`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ IdUsuario: user.id }),
        });
      }
    } catch { /* ignore */ }
    setConfirmId(null); setConfirmAction(null); loadData();
  };

  const openDetail = async (id) => {
    try {
      const r = await fetch(`${API_URL}/api/cortes/${id}`);
      const j = await r.json();
      if (j.success) { setDetail(j.data); setDetailOpen(true); }
    } catch { /* ignore */ }
  };

  const confirmLabels = {
    delete:    { title: '¿Eliminar corte?',       color: '#c62828', btn: 'Eliminar',  msg: 'Esta acción no se puede deshacer.' },
    comenzar:  { title: '¿Comenzar producción?',  color: '#b45309', btn: 'Comenzar',  msg: 'El corte pasará a estado "En Producción".' },
    finalizar: { title: '¿Finalizar corte?',       color: '#2e7d32', btn: 'Finalizar', msg: 'Se calcularán las piezas producidas y el monto total.' },
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, backgroundColor: bg, minHeight: '100vh' }}>
      {/* Header premium */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', mb: 4, gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Box sx={{ width: 56, height: 56, borderRadius: '14px', background: `linear-gradient(135deg, ${primaryDark} 0%, ${primaryMain} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(15, 52, 96, 0.25)' }}>
              <FontAwesomeIcon icon={faLayerGroup} style={{ color: '#fff', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, background: `linear-gradient(135deg, ${primaryDark} 0%, ${primaryMain} 100%)`, backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Cortes
              </Typography>
              <Typography variant="body2" sx={{ color: muted, fontWeight: 500 }}>
                {rows.length} corte{rows.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<FontAwesomeIcon icon={faPlus} />} onClick={openNew}
          sx={{ background: `linear-gradient(135deg, ${primaryDark} 0%, ${primaryMain} 100%)`, borderRadius: '12px', fontWeight: 700, px: 3, py: 1.5, fontSize: '0.95rem', textTransform: 'capitalize', boxShadow: '0 8px 20px rgba(15, 52, 96, 0.3)', transition: 'all 0.3s ease', '&:hover': { background: `linear-gradient(135deg, #0a1f33 0%, ${primaryDark} 100%)`, transform: 'translateY(-2px)', boxShadow: '0 12px 28px rgba(15, 52, 96, 0.4)' }, '&:active': { transform: 'translateY(0)' } }}>
          + Nuevo Corte
        </Button>
      </Box>

      {/* Filters */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: dividerColor, borderRadius: '14px', mb: 3, p: 2, backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(15, 52, 96, 0.02)' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 1.5 }} TabIndicatorProps={{ sx: { bgcolor: primaryMain, height: 3, borderRadius: '3px' } }}>
          {['Todos', 'Registrados', 'En Producción', 'Finalizados'].map((l, i) => (
            <Tab key={i} label={l} sx={{ fontWeight: 700, textTransform: 'none', color: muted, '&.Mui-selected': { color: primaryDark } }} />
          ))}
        </Tabs>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField label="Desde" type="date" size="small" value={desde}
            onChange={e => { setDesde(e.target.value); setDateErr(''); if (hasta && e.target.value > hasta) setHasta(''); }}
            InputLabelProps={{ shrink: true }} sx={{ width: 170, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
          <TextField label="Hasta" type="date" size="small" value={hasta}
            onChange={e => handleHastaChange(e.target.value)}
            InputLabelProps={{ shrink: true }} sx={{ width: 170, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
            inputProps={{ min: desde || undefined }} />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Proveedor</InputLabel>
            <Select label="Proveedor" value={idProveedor} onChange={e => setIdProveedor(e.target.value)} sx={{ borderRadius: '10px' }}>
              <MenuItem value="">Todos</MenuItem>
              {proveedores.map(p => <MenuItem key={p.Id} value={p.Id}>{p.Nombre}</MenuItem>)}
            </Select>
          </FormControl>
          {(desde || hasta || idProveedor) && (
            <Button size="small" onClick={() => { setDesde(''); setHasta(''); setIdProveedor(''); setDateErr(''); }} sx={{ fontWeight: 700, color: primaryDark, borderRadius: '8px' }}>
              Limpiar
            </Button>
          )}
        </Box>
        {dateErr && <Alert severity="warning" sx={{ mt: 1.5, borderRadius: '10px', py: 0.5 }}>{dateErr}</Alert>}
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px', border: '1px solid', borderColor: 'rgba(244, 67, 54, 0.18)', backgroundColor: 'rgba(244, 67, 54, 0.06)', '& .MuiAlert-icon': { color: errorColor } }} onClose={() => setError('')}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><FontAwesomeIcon icon={faExclamationCircle} />{error}</Box>
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', md: 'repeat(3,1fr)', xl: 'repeat(4,1fr)' }, gap: 3 }}>
          {[...Array(6)].map((_, i) => <Box key={i}><Skeleton variant="rounded" height={320} sx={{ borderRadius: '16px' }} /></Box>)}
        </Box>
      ) : rows.length === 0 ? (
        <Paper elevation={0} sx={{ textAlign: 'center', py: 10, backgroundColor: 'rgba(15, 52, 96, 0.04)', borderRadius: '16px', border: '2px dashed rgba(15, 52, 96, 0.1)' }}>
          <Box sx={{ color: '#94a3b8', mb: 2 }}><FontAwesomeIcon icon={faLayerGroup} style={{ fontSize: 56, opacity: 0.3 }} /></Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: primaryDark, mb: 1 }}>Sin cortes en este estado</Typography>
          <Typography variant="body2" sx={{ color: muted }}>No se encontraron cortes con los filtros aplicados.</Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', md: 'repeat(3,1fr)', xl: 'repeat(4,1fr)' }, gap: 3 }}>
          {rows.map((r) => {
            const sc = statusConfig[r.Status] || statusConfig.Registrado;
            return (
              <Card key={r.Id} elevation={0} sx={{
                borderRadius: '16px', border: '1px solid', borderColor: cardBorderColor,
                backgroundColor: cardBg, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', overflow: 'hidden', position: 'relative',
                '&:hover': { transform: 'translateY(-8px)', boxShadow: isDark ? '0 16px 48px rgba(0,0,0,0.6)' : '0 16px 48px rgba(15, 52, 96, 0.12)' },
              }}>
                {/* Header gradient */}
                <Box sx={{ height: 96, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', background: cardGradient(r.Folio || r.NombrePrenda || '') }}>
                  <Box sx={{ position: 'absolute', right: -8, bottom: -8, opacity: 0.14, color: '#fff' }}>
                    <FontAwesomeIcon icon={faLayerGroup} style={{ fontSize: 82 }} />
                  </Box>
                  <Box sx={{ width: 54, height: 54, borderRadius: '14px', bgcolor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', border: '1.5px solid rgba(255,255,255,0.35)', zIndex: 1 }}>
                    <FontAwesomeIcon icon={faLayerGroup} style={{ color: '#fff', fontSize: 26 }} />
                  </Box>
                </Box>

                <CardContent sx={{ pb: 1, pt: 2 }}>
                  {/* Folio + Status */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Typography fontWeight={800} fontFamily="monospace" fontSize="0.85rem" sx={{ color: sc.color, bgcolor: sc.bg, px: 1.2, py: 0.4, borderRadius: '8px', border: `1px solid ${sc.border}` }}>
                      {r.Folio || '—'}
                    </Typography>
                    <Chip label={r.Status} size="small" icon={<Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: sc.color, display: 'inline-block', mr: 0.5 }} />}
                      sx={{ fontWeight: 700, fontSize: '0.72rem', bgcolor: sc.bg, color: sc.color, border: `1.5px solid ${sc.border}` }} />
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 700, background: cardGradient(r.Folio || r.NombrePrenda || ''), backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.3, mb: 0.3, fontSize: '1rem' }}>
                    {r.NombrePrenda || '—'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: muted, fontWeight: 500, fontSize: '0.85rem', mb: r.NombreProveedor ? 0.2 : 1.2 }}>
                    {r.NombreCorte || '—'}
                  </Typography>
                  {r.NombreProveedor && (
                    <Typography variant="caption" sx={{ color: muted, display: 'block', mb: 1.2, opacity: 0.7 }}>{r.NombreProveedor}</Typography>
                  )}

                  {/* Stats */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 1.5 }}>
                    <Box sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15, 52, 96, 0.04)', borderRadius: '10px', p: 1.2 }}>
                      <Typography variant="caption" color="text.secondary" display="block" mb={0.2}>Piezas</Typography>
                      <Typography fontWeight={800} fontSize="1.15rem" lineHeight={1}>{r.CantidadPiezas}</Typography>
                    </Box>
                    <Box sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15, 52, 96, 0.04)', borderRadius: '10px', p: 1.2 }}>
                      <Typography variant="caption" color="text.secondary" display="block" mb={0.2}>Precio unit.</Typography>
                      <Typography fontWeight={800} fontSize="0.88rem" sx={{ color: primaryMain }} lineHeight={1.2}>{fmt(r.PrecioUnitario)}</Typography>
                    </Box>
                  </Box>

                  {/* Total */}
                  <Box sx={{ bgcolor: isDark ? `${sc.accent}12` : `${sc.accent}09`, border: `1px solid ${sc.border}`, borderRadius: '10px', px: 1.5, py: 1, mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>Total estimado</Typography>
                    <Typography fontWeight={800} fontSize="0.9rem" sx={{ color: sc.color }}>
                      {fmt(Number(r.CantidadPiezas) * Number(r.PrecioUnitario))}
                    </Typography>
                  </Box>

                  <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                    {r.CreatedAt ? new Date(r.CreatedAt).toLocaleDateString('es-MX') : '—'}
                  </Typography>
                </CardContent>

                <Divider sx={{ borderColor: dividerColor }} />

                <CardActions sx={{ justifyContent: 'center', gap: 0.5, py: 1.5, px: 1, flexWrap: 'wrap' }}>
                  <Tooltip title="Ver detalle">
                    <Button size="small" onClick={() => openDetail(r.Id)} startIcon={<FontAwesomeIcon icon={faEye} style={{ fontSize: 11 }} />}
                      sx={{ color: primaryDark, bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15, 52, 96, 0.08)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'capitalize', borderRadius: '8px', flex: 1, minWidth: 'auto', transition: 'all 0.2s', '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(15, 52, 96, 0.16)', transform: 'translateY(-2px)' } }}>
                      Detalle
                    </Button>
                  </Tooltip>
                  {r.Status === 'Registrado' && (<>
                    <Tooltip title="Editar">
                      <Button size="small" onClick={() => openEdit(r)} startIcon={<FontAwesomeIcon icon={faPenToSquare} style={{ fontSize: 11 }} />}
                        sx={{ color: primaryDark, bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15, 52, 96, 0.08)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'capitalize', borderRadius: '8px', flex: 1, minWidth: 'auto', transition: 'all 0.2s', '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(15, 52, 96, 0.16)', transform: 'translateY(-2px)' } }}>
                        Editar
                      </Button>
                    </Tooltip>
                    <Tooltip title="Comenzar producción">
                      <Button size="small" onClick={() => { setConfirmId(r.Id); setConfirmAction('comenzar'); }} startIcon={<FontAwesomeIcon icon={faPlay} style={{ fontSize: 10 }} />}
                        sx={{ color: '#b45309', bgcolor: 'rgba(180,83,9,0.08)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'capitalize', borderRadius: '8px', flex: 1, minWidth: 'auto', transition: 'all 0.2s', '&:hover': { bgcolor: 'rgba(180,83,9,0.16)', transform: 'translateY(-2px)' } }}>
                        Iniciar
                      </Button>
                    </Tooltip>
                  </>)}
                  {r.Status === 'Comenzado' && (
                    <Tooltip title="Finalizar corte">
                      <Button size="small" onClick={() => { setConfirmId(r.Id); setConfirmAction('finalizar'); }} startIcon={<FontAwesomeIcon icon={faFlagCheckered} style={{ fontSize: 11 }} />}
                        sx={{ color: '#2e7d32', bgcolor: 'rgba(46,125,50,0.08)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'capitalize', borderRadius: '8px', flex: 1, minWidth: 'auto', transition: 'all 0.2s', '&:hover': { bgcolor: 'rgba(46,125,50,0.16)', transform: 'translateY(-2px)' } }}>
                        Finalizar
                      </Button>
                    </Tooltip>
                  )}
                  {r.Status !== 'Finalizado' && (
                    <Tooltip title="Eliminar">
                      <Button size="small" onClick={() => { setConfirmId(r.Id); setConfirmAction('delete'); }} startIcon={<FontAwesomeIcon icon={faTrash} style={{ fontSize: 11 }} />}
                        sx={{ color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.08)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'capitalize', borderRadius: '8px', flex: 1, minWidth: 'auto', transition: 'all 0.2s', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.16)', transform: 'translateY(-2px)' } }}>
                        Eliminar
                      </Button>
                    </Tooltip>
                  )}
                </CardActions>
              </Card>
            );
          })}
        </Box>
      )}

      {/* Dialog Nuevo/Editar */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '16px', overflow: 'visible' } }}>
        <DialogTitle sx={{ background: 'linear-gradient(135deg, #1565c0, #42a5f5)', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <FontAwesomeIcon icon={isNew ? faPlus : faPenToSquare} />
          {isNew ? 'Nuevo Corte' : 'Editar Corte'}
          <IconButton onClick={() => setOpen(false)} size="small" sx={{ ml: 'auto', color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#fff' } }}>
            <FontAwesomeIcon icon={faTimes} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 1, overflow: 'visible' }}>
          {dlgMsg && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{dlgMsg}</Alert>}
          <FormControl fullWidth sx={{ mb: 2, mt: 2 }} error={!!formErr.IdTipoPrenda}>
            <InputLabel>Tipo de Prenda</InputLabel>
            <Select label="Tipo de Prenda" value={form.IdTipoPrenda} onChange={e => { setForm(p => ({ ...p, IdTipoPrenda: e.target.value, IdTipoCorte: '' })); setFormErr(p => ({ ...p, IdTipoPrenda: '', combo: '' })); }}>
              {prendas.map(p => <MenuItem key={p.Id} value={p.Id}>{p.Nombre}</MenuItem>)}
            </Select>
            {formErr.IdTipoPrenda && <FormHelperText>{formErr.IdTipoPrenda}</FormHelperText>}
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }} error={!!formErr.IdTipoCorte} disabled={!form.IdTipoPrenda || filteredCortes.length === 0}>
            <InputLabel>Tipo de Corte</InputLabel>
            <Select label="Tipo de Corte" value={form.IdTipoCorte} onChange={e => { setForm(p => ({ ...p, IdTipoCorte: e.target.value })); setFormErr(p => ({ ...p, IdTipoCorte: '', combo: '' })); }}>
              {filteredCortes.map(c => <MenuItem key={c.Id} value={c.Id}>{c.Nombre}</MenuItem>)}
            </Select>
            {formErr.IdTipoCorte && <FormHelperText>{formErr.IdTipoCorte}</FormHelperText>}
            {form.IdTipoPrenda && filteredCortes.length === 0 && (
              <FormHelperText sx={{ color: 'warning.main' }}>Sin precios configurados para esta prenda. Ve a Precios Maquila.</FormHelperText>
            )}
          </FormControl>
          {formErr.combo && <Alert severity="error" sx={{ mb: 2 }}>{formErr.combo}</Alert>}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Proveedor (opcional)</InputLabel>
            <Select label="Proveedor (opcional)" value={form.IdProveedor} onChange={e => setForm(p => ({ ...p, IdProveedor: e.target.value }))}>
              <MenuItem value=""><em>Sin proveedor</em></MenuItem>
              {proveedores.map(p => <MenuItem key={p.Id} value={p.Id}>{p.Nombre}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField fullWidth label="Cantidad de Piezas" type="number" value={form.CantidadPiezas} inputProps={{ min: 1 }}
            onChange={e => { setForm(p => ({ ...p, CantidadPiezas: e.target.value })); setFormErr(p => ({ ...p, CantidadPiezas: '' })); }}
            error={!!formErr.CantidadPiezas} helperText={formErr.CantidadPiezas} sx={{ mb: 1 }} />
          <Typography variant="caption" color="text.secondary">El precio unitario se asigna automáticamente según la combinación prenda/corte.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setOpen(false)} variant="outlined" sx={{ borderRadius: '8px', fontWeight: 600 }}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}
            startIcon={<FontAwesomeIcon icon={saving ? faSpinner : faSave} spin={saving} />}
            sx={{ background: 'linear-gradient(135deg, #1565c0, #42a5f5)', borderRadius: '8px', fontWeight: 600, '&:hover': { background: 'linear-gradient(135deg, #0d47a1, #1565c0)' } }}>
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Detalle */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
        {detail && (<>
          <DialogTitle sx={{ background: 'linear-gradient(135deg, #1565c0, #42a5f5)', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <FontAwesomeIcon icon={faEye} /> Corte {detail.Folio}
            <IconButton onClick={() => setDetailOpen(false)} size="small" sx={{ ml: 'auto', color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#fff' } }}>
              <FontAwesomeIcon icon={faTimes} />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
              <Box><Typography variant="caption" color="text.secondary">Prenda</Typography><Typography fontWeight={600}>{detail.NombrePrenda}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Corte</Typography><Typography fontWeight={600}>{detail.NombreCorte}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Piezas Solicitadas</Typography><Typography fontWeight={600}>{detail.CantidadPiezas}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Precio Unitario</Typography><Typography fontWeight={600}>{fmt(detail.PrecioUnitario)}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Estado</Typography>
                <Chip label={detail.Status} size="small" sx={{ fontWeight: 600, bgcolor: (statusConfig[detail.Status]||statusConfig.Registrado).bg, color: (statusConfig[detail.Status]||statusConfig.Registrado).color }} />
              </Box>
              <Box><Typography variant="caption" color="text.secondary">Proveedor</Typography><Typography fontWeight={600}>{detail.NombreProveedor || '—'}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Registrado por</Typography><Typography fontWeight={600}>{detail.NombreUsuario||'—'}</Typography></Box>
              {detail.Status === 'Finalizado' && (<>
                <Box><Typography variant="caption" color="text.secondary">Piezas Producidas</Typography><Typography fontWeight={700} color="#2e7d32">{detail.PiezasProducidas}</Typography></Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Monto Total</Typography>
                  {Number(detail.MontoTotal) < Number(detail.CantidadPiezas) * Number(detail.PrecioUnitario) ? (
                    <Box>
                      <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                        {fmt(Number(detail.CantidadPiezas) * Number(detail.PrecioUnitario))}
                      </Typography>
                      <Typography fontWeight={700} color="#2e7d32">{fmt(detail.MontoTotal)}</Typography>
                    </Box>
                  ) : (
                    <Typography fontWeight={700} color="#2e7d32">{fmt(detail.MontoTotal)}</Typography>
                  )}
                </Box>
              </>)}
              <Box><Typography variant="caption" color="text.secondary">Piezas Faltantes</Typography><Typography fontWeight={600} color={detail.totalFaltantes>0?'#c62828':'text.primary'}>{detail.totalFaltantes}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Piezas Procesadas</Typography><Typography fontWeight={600}>{detail.totalProcesadas}</Typography></Box>
            </Box>
            {detail.detalles?.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} color="primary.main" mb={1}>Avances registrados</Typography>
                {detail.detalles.map(d => (
                  <Paper key={d.Id} sx={{ p: 1.5, mb: 1, borderRadius: '8px', border: '1px solid rgba(0,0,0,0.08)' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" fontWeight={600}>{d.PiezasProcesadas} piezas</Typography>
                      <Typography variant="caption" color="text.secondary">{d.NombreUsuario} · {new Date(d.CreatedAt).toLocaleDateString('es-MX')}</Typography>
                    </Box>
                    {d.Observaciones && <Typography variant="body2" color="text.secondary" mt={0.5}>{d.Observaciones}</Typography>}
                  </Paper>
                ))}
              </Box>
            )}
            {detail.faltantes?.length > 0 && (
              <Box>
                <Typography variant="subtitle2" fontWeight={700} color="#c62828" mb={1}>Piezas faltantes</Typography>
                {detail.faltantes.map(f => (
                  <Paper key={f.Id} sx={{ p: 1.5, mb: 1, borderRadius: '8px', border: '1px solid rgba(198,40,40,0.15)', bgcolor: 'rgba(198,40,40,0.02)' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" fontWeight={600} color="#c62828">{f.CantidadFaltante} piezas</Typography>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Chip label={f.AplicaDescuento == 1 ? 'Con descuento' : 'Sin descuento'} size="small"
                          sx={{ fontSize: '0.68rem', fontWeight: 600,
                            bgcolor: f.AplicaDescuento == 1 ? 'rgba(198,40,40,0.1)' : 'rgba(71,85,105,0.1)',
                            color:   f.AplicaDescuento == 1 ? '#c62828' : '#475569' }} />
                        <Typography variant="caption" color="text.secondary">{f.NombreUsuario} · {new Date(f.CreatedAt).toLocaleDateString('es-MX')}</Typography>
                      </Box>
                    </Box>
                    {f.Motivo && <Typography variant="body2" color="text.secondary" mt={0.5}>{f.Motivo}</Typography>}
                  </Paper>
                ))}
              </Box>
            )}
          </DialogContent>
        </>)}
      </Dialog>

      {/* Dialog Confirmar */}
      <Dialog open={!!confirmId} onClose={() => { setConfirmId(null); setConfirmAction(null); }} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '14px' } }}>
        <DialogTitle sx={{ fontWeight: 700, color: confirmAction ? confirmLabels[confirmAction]?.color : '#333' }}>
          {confirmAction ? confirmLabels[confirmAction]?.title : ''}
        </DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            {confirmAction ? confirmLabels[confirmAction]?.msg : ''}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => { setConfirmId(null); setConfirmAction(null); }} variant="outlined" sx={{ borderRadius: '8px', fontWeight: 600 }}>Cancelar</Button>
          <Button onClick={handleAction} variant="contained"
            sx={{ borderRadius: '8px', fontWeight: 600, bgcolor: confirmAction ? confirmLabels[confirmAction]?.color : '#333', '&:hover': { bgcolor: confirmAction ? confirmLabels[confirmAction]?.color : '#333', filter: 'brightness(0.9)' } }}>
            {confirmAction ? confirmLabels[confirmAction]?.btn : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
