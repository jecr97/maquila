import { useState, useEffect, useCallback } from 'react';
import {
  Box, Button, Chip, Card, CardContent, CardActions, Dialog, DialogActions, DialogContent,
  DialogTitle, IconButton, Paper, TextField, Tooltip, Typography, Alert,
  Divider, Skeleton, Tabs, Tab, useTheme,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faIndustry, faPlay, faFlagCheckered, faEye, faTimes, faPlus, faSpinner,
  faExclamationCircle,
} from '@fortawesome/free-solid-svg-icons';

const API_URL = import.meta.env.VITE_API_URL;
const statusColor = {
  Registrado: { bg: 'rgba(21,101,192,0.08)', color: 'primary.main', border: 'rgba(21,101,192,0.25)' },
  Comenzado:  { bg: 'rgba(180,83,9,0.08)', color: '#b45309', border: 'rgba(180,83,9,0.25)' },
  Finalizado: { bg: 'rgba(46,125,50,0.08)', color: '#2e7d32', border: 'rgba(46,125,50,0.25)' },
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

const fmt = (v) => Number(v).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

export default function Produccion() {
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

  const statusColor = {
    Registrado: { bg: isDark ? 'rgba(21,101,192,0.15)' : 'rgba(21,101,192,0.08)', color: isDark ? '#42a5f5' : '#1565c0', border: isDark ? 'rgba(21,101,192,0.4)' : 'rgba(21,101,192,0.25)', accent: '#1565c0' },
    Comenzado:  { bg: isDark ? 'rgba(180,83,9,0.15)' : 'rgba(180,83,9,0.08)',     color: isDark ? '#fbbf24' : '#b45309',   border: isDark ? 'rgba(180,83,9,0.4)' : 'rgba(180,83,9,0.25)',   accent: '#b45309' },
    Finalizado: { bg: isDark ? 'rgba(46,125,50,0.15)' : 'rgba(46,125,50,0.08)',   color: isDark ? '#4ade80' : '#2e7d32',   border: isDark ? 'rgba(46,125,50,0.4)' : 'rgba(46,125,50,0.25)', accent: '#2e7d32' },
  };

  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [tab, setTab]         = useState(0); // default: Todos
  const [desde, setDesde]     = useState('');
  const [hasta, setHasta]     = useState('');
  const [dateErr, setDateErr] = useState('');
  const [detail, setDetail]   = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [avanceOpen, setAvanceOpen] = useState(false);
  const [avanceCorte, setAvanceCorte] = useState(null);
  const [avanceForm, setAvanceForm] = useState({ PiezasProcesadas: '', Observaciones: '' });
  const [savingAvance, setSavingAvance] = useState(false);
  const [avanceErr, setAvanceErr] = useState('');

  const user = JSON.parse(localStorage.getItem('maquila_user') || '{}');
  const tabStatus = ['', 'Registrado', 'Comenzado', 'Finalizado'];

  const loadData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams();
      if (tabStatus[tab]) params.set('status', tabStatus[tab]);
      if (desde) params.set('desde', desde);
      if (hasta) params.set('hasta', hasta);
      const r = await fetch(`${API_URL}/api/cortes?${params}`);
      const j = await r.json();
      if (j.success) setRows(j.data);
      else setError('No se pudieron cargar los cortes.');
    } catch { setError('Error de conexión.'); }
    setLoading(false);
  }, [tab, desde, hasta]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleHastaChange = (val) => {
    if (val && !desde) { setDateErr('Primero selecciona la fecha inicial.'); return; }
    if (val && desde && val < desde) { setDateErr('La fecha final no puede ser anterior a la inicial.'); return; }
    setDateErr('');
    setHasta(val);
  };

  const openDetail = async (id) => {
    try {
      const r = await fetch(`${API_URL}/api/cortes/${id}`);
      const j = await r.json();
      if (j.success) { setDetail(j.data); setDetailOpen(true); }
    } catch { /* ignore */ }
  };

  const openAvance = (r) => {
    setAvanceCorte(r);
    setAvanceForm({ PiezasProcesadas: '', Observaciones: '' });
    setAvanceErr('');
    setAvanceOpen(true);
  };

  const handleSaveAvance = async () => {
    if (!avanceForm.PiezasProcesadas || Number(avanceForm.PiezasProcesadas) <= 0) {
      setAvanceErr('Ingresa una cantidad mayor a 0.'); return;
    }
    setSavingAvance(true); setAvanceErr('');
    try {
      const r = await fetch(`${API_URL}/api/cortes/${avanceCorte.Id}/detalles`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...avanceForm, IdUsuario: user.id }),
      });
      const j = await r.json();
      if (j.success) { setAvanceOpen(false); loadData(); }
      else setAvanceErr(j.message || 'Error al guardar.');
    } catch { setAvanceErr('Error de conexión.'); }
    setSavingAvance(false);
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, backgroundColor: bg, minHeight: '100vh' }}>
      {/* Header premium */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', mb: 4, gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Box sx={{ width: 56, height: 56, borderRadius: '14px', background: `linear-gradient(135deg, ${primaryDark} 0%, ${primaryMain} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(15, 52, 96, 0.25)' }}>
              <FontAwesomeIcon icon={faIndustry} style={{ color: '#fff', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, background: `linear-gradient(135deg, ${primaryDark} 0%, ${primaryMain} 100%)`, backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Producción
              </Typography>
              <Typography variant="body2" sx={{ color: muted, fontWeight: 500 }}>
                Seguimiento del proceso productivo
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Filters */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: dividerColor, borderRadius: '14px', mb: 3, p: 2, backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(15, 52, 96, 0.02)' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 1.5 }} TabIndicatorProps={{ sx: { bgcolor: primaryMain, height: 3, borderRadius: '3px' } }}>
          <Tab label="Todos" sx={{ fontWeight: 700, textTransform: 'none', color: muted, '&.Mui-selected': { color: primaryDark } }} />
          <Tab label="Registrados" sx={{ fontWeight: 700, textTransform: 'none', color: muted, '&.Mui-selected': { color: primaryDark } }} />
          <Tab label="En Producción" sx={{ fontWeight: 700, textTransform: 'none', color: muted, '&.Mui-selected': { color: primaryDark } }} />
          <Tab label="Finalizados" sx={{ fontWeight: 700, textTransform: 'none', color: muted, '&.Mui-selected': { color: primaryDark } }} />
        </Tabs>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField label="Desde" type="date" size="small" value={desde}
            onChange={e => { setDesde(e.target.value); setDateErr(''); if (hasta && e.target.value > hasta) setHasta(''); }}
            InputLabelProps={{ shrink: true }} sx={{ width: 170, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
          <TextField label="Hasta" type="date" size="small" value={hasta}
            onChange={e => handleHastaChange(e.target.value)}
            InputLabelProps={{ shrink: true }} sx={{ width: 170, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
            inputProps={{ min: desde || undefined }} />
          {(desde || hasta) && <Button size="small" onClick={() => { setDesde(''); setHasta(''); setDateErr(''); }} sx={{ fontWeight: 700, color: primaryDark, borderRadius: '8px' }}>Limpiar</Button>}
        </Box>
        {dateErr && <Alert severity="warning" sx={{ mt: 1.5, borderRadius: '10px', py: 0.5 }}>{dateErr}</Alert>}
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px', border: '1px solid', borderColor: 'rgba(244, 67, 54, 0.18)', backgroundColor: 'rgba(244, 67, 54, 0.06)', '& .MuiAlert-icon': { color: errorColor } }} onClose={() => setError('')}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><FontAwesomeIcon icon={faExclamationCircle} />{error}</Box>
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', md: 'repeat(3,1fr)' }, gap: 3 }}>
          {[...Array(6)].map((_, i) => <Box key={i}><Skeleton variant="rounded" height={300} sx={{ borderRadius: '16px' }} /></Box>)}
        </Box>
      ) : rows.length === 0 ? (
        <Paper elevation={0} sx={{ textAlign: 'center', py: 10, backgroundColor: 'rgba(15, 52, 96, 0.04)', borderRadius: '16px', border: '2px dashed rgba(15, 52, 96, 0.1)' }}>
          <Box sx={{ color: '#94a3b8', mb: 2 }}><FontAwesomeIcon icon={faIndustry} style={{ fontSize: 56, opacity: 0.3 }} /></Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: primaryDark, mb: 1 }}>Sin cortes en este estado</Typography>
          <Typography variant="body2" sx={{ color: muted }}>No se encontraron cortes con los filtros aplicados.</Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', md: 'repeat(3,1fr)' }, gap: 3 }}>
          {rows.map(r => {
            const sc = statusColor[r.Status] || statusColor.Registrado;
            return (
              <Card key={r.Id} elevation={0} sx={{
                borderRadius: '16px', border: '1px solid', borderColor: cardBorderColor,
                backgroundColor: cardBg, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', overflow: 'hidden', position: 'relative',
                '&:hover': { transform: 'translateY(-8px)', boxShadow: isDark ? '0 16px 48px rgba(0,0,0,0.6)' : '0 16px 48px rgba(15, 52, 96, 0.12)' },
              }}>
                <Box sx={{ height: 96, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', background: cardGradient(r.Folio || r.NombrePrenda || '') }}>
                  <Box sx={{ position: 'absolute', right: -8, bottom: -8, opacity: 0.14, color: '#fff' }}>
                    <FontAwesomeIcon icon={faIndustry} style={{ fontSize: 82 }} />
                  </Box>
                  <Box sx={{ width: 54, height: 54, borderRadius: '14px', bgcolor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', border: '1.5px solid rgba(255,255,255,0.35)', zIndex: 1 }}>
                    <FontAwesomeIcon icon={faIndustry} style={{ color: '#fff', fontSize: 26 }} />
                  </Box>
                </Box>

                <CardContent sx={{ pb: 1, pt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Typography fontWeight={800} fontFamily="monospace" fontSize="0.85rem" sx={{ color: sc.color, bgcolor: sc.bg, px: 1.2, py: 0.4, borderRadius: '8px', border: `1px solid ${sc.border}` }}>
                      {r.Folio}
                    </Typography>
                    <Chip label={r.Status} size="small" icon={<Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: sc.color, display: 'inline-block', mr: 0.5 }} />}
                      sx={{ fontWeight: 700, fontSize: '0.72rem', bgcolor: sc.bg, color: sc.color, border: `1.5px solid ${sc.border}` }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, background: cardGradient(r.Folio || r.NombrePrenda || ''), backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.3, mb: 0.3, fontSize: '1rem' }}>{r.NombrePrenda || '—'}</Typography>
                  <Typography variant="body2" sx={{ color: muted, fontWeight: 500, fontSize: '0.85rem', mb: 1.2 }}>{r.NombreCorte || '—'}</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 1.5 }}>
                    <Box sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15, 52, 96, 0.04)', borderRadius: '10px', p: 1.2 }}>
                      <Typography variant="caption" color="text.secondary" display="block" mb={0.2}>Piezas</Typography>
                      <Typography fontWeight={800} fontSize="1.15rem" lineHeight={1}>{r.CantidadPiezas}</Typography>
                    </Box>
                    <Box sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15, 52, 96, 0.04)', borderRadius: '10px', p: 1.2 }}>
                      <Typography variant="caption" color="text.secondary" display="block" mb={0.2}>P. Unit.</Typography>
                      <Typography fontWeight={800} fontSize="0.88rem" sx={{ color: primaryMain }} lineHeight={1.2}>{fmt(r.PrecioUnitario)}</Typography>
                    </Box>
                  </Box>
                </CardContent>
                <Divider sx={{ borderColor: dividerColor }} />
                <CardActions sx={{ justifyContent: 'center', gap: 1, py: 1.5, px: 1 }}>
                  <Tooltip title="Ver detalle">
                    <Button size="small" onClick={() => openDetail(r.Id)} startIcon={<FontAwesomeIcon icon={faEye} style={{ fontSize: 11 }} />}
                      sx={{ color: primaryDark, bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15, 52, 96, 0.08)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'capitalize', borderRadius: '8px', flex: 1, transition: 'all 0.2s', '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(15, 52, 96, 0.16)', transform: 'translateY(-2px)' } }}>
                      Detalle
                    </Button>
                  </Tooltip>
                  {r.Status === 'Comenzado' && (
                    <Tooltip title="Registrar avance">
                      <Button size="small" onClick={() => openAvance(r)} startIcon={<FontAwesomeIcon icon={faPlus} style={{ fontSize: 11 }} />}
                        sx={{ color: '#b45309', bgcolor: 'rgba(180,83,9,0.08)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'capitalize', borderRadius: '8px', flex: 1, transition: 'all 0.2s', '&:hover': { bgcolor: 'rgba(180,83,9,0.16)', transform: 'translateY(-2px)' } }}>
                        Avance
                      </Button>
                    </Tooltip>
                  )}
                </CardActions>
              </Card>
            );
          })}
        </Box>
      )}

      {/* Dialog Detalle */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
        {detail && (<>
          <DialogTitle sx={{ background: 'linear-gradient(135deg, #1565c0, #42a5f5)', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <FontAwesomeIcon icon={faEye} /> Corte {detail.Folio}
            <IconButton onClick={() => setDetailOpen(false)} size="small" sx={{ ml: 'auto', color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#fff' } }}>
              <FontAwesomeIcon icon={faTimes} />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ pt: 0 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
              <Box><Typography variant="caption" color="text.secondary">Prenda</Typography><Typography fontWeight={600}>{detail.NombrePrenda}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Corte</Typography><Typography fontWeight={600}>{detail.NombreCorte}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Piezas Solicitadas</Typography><Typography fontWeight={600}>{detail.CantidadPiezas}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Precio Unitario</Typography><Typography fontWeight={600}>{fmt(detail.PrecioUnitario)}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Estado</Typography>
                <Chip label={detail.Status} size="small" sx={{ fontWeight: 600, bgcolor: (statusColor[detail.Status]||statusColor.Registrado).bg, color: (statusColor[detail.Status]||statusColor.Registrado).color }} />
              </Box>
              <Box><Typography variant="caption" color="text.secondary">Procesadas</Typography><Typography fontWeight={600}>{detail.totalProcesadas}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Faltantes</Typography><Typography fontWeight={600} color={detail.totalFaltantes>0?'#c62828':'text.primary'}>{detail.totalFaltantes}</Typography></Box>
              {detail.Status === 'Finalizado' && (
                <Box><Typography variant="caption" color="text.secondary">Monto Total</Typography><Typography fontWeight={700} color="#2e7d32">{fmt(detail.MontoTotal)}</Typography></Box>
              )}
            </Box>
            {detail.detalles?.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} color="primary.main" mb={1}>Avances</Typography>
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
                <Typography variant="subtitle2" fontWeight={700} color="#c62828" mb={1}>Piezas Faltantes</Typography>
                {detail.faltantes.map(f => (
                  <Paper key={f.Id} sx={{ p: 1.5, mb: 1, borderRadius: '8px', border: '1px solid rgba(198,40,40,0.15)', bgcolor: 'rgba(198,40,40,0.02)' }}>
                    <Typography variant="body2" fontWeight={600} color="#c62828">{f.CantidadFaltante} piezas {f.Motivo && `— ${f.Motivo}`}</Typography>
                  </Paper>
                ))}
              </Box>
            )}
          </DialogContent>
        </>)}
      </Dialog>

      {/* Dialog Avance */}
      <Dialog open={avanceOpen} onClose={() => setAvanceOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '16px', overflow: 'visible' } }}>
        <DialogTitle sx={{ background: 'linear-gradient(135deg, #1565c0, #42a5f5)', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <FontAwesomeIcon icon={faPlus} /> Registrar Avance
          <IconButton onClick={() => setAvanceOpen(false)} size="small" sx={{ ml: 'auto', color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#fff' } }}>
            <FontAwesomeIcon icon={faTimes} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 1, overflow: 'visible' }}>
          {avanceErr && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{avanceErr}</Alert>}
          <TextField fullWidth label="Piezas Procesadas" type="number" value={avanceForm.PiezasProcesadas} inputProps={{ min: 1 }}
            onChange={e => setAvanceForm(p => ({ ...p, PiezasProcesadas: e.target.value }))} sx={{ mb: 2, mt: 2 }} />
          <TextField fullWidth label="Observaciones" multiline rows={3} value={avanceForm.Observaciones}
            onChange={e => setAvanceForm(p => ({ ...p, Observaciones: e.target.value }))} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setAvanceOpen(false)} variant="outlined" sx={{ borderRadius: '8px', fontWeight: 600 }}>Cancelar</Button>
          <Button onClick={handleSaveAvance} variant="contained" disabled={savingAvance}
            startIcon={<FontAwesomeIcon icon={savingAvance ? faSpinner : faPlay} spin={savingAvance} />}
            sx={{ background: 'linear-gradient(135deg, #1565c0, #42a5f5)', borderRadius: '8px', fontWeight: 600, '&:hover': { background: 'linear-gradient(135deg, #0d47a1, #1565c0)' } }}>
            {savingAvance ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
