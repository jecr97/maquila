import { useState, useEffect, useCallback } from 'react';
import {
  Box, Button, Chip, Card, CardContent, Dialog, DialogActions, DialogContent,
  DialogTitle, IconButton, Paper, TextField, Tooltip, Typography, Alert,
  CircularProgress, Tabs, Tab,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faIndustry, faPlay, faFlagCheckered, faEye, faTimes, faPlus, faSpinner,
} from '@fortawesome/free-solid-svg-icons';

const API_URL = import.meta.env.VITE_API_URL;
const statusColor = {
  Registrado: { bg: 'rgba(21,101,192,0.08)', color: 'primary.main', border: 'rgba(21,101,192,0.25)' },
  Comenzado:  { bg: 'rgba(180,83,9,0.08)', color: '#b45309', border: 'rgba(180,83,9,0.25)' },
  Finalizado: { bg: 'rgba(46,125,50,0.08)', color: '#2e7d32', border: 'rgba(46,125,50,0.25)' },
};
const fmt = (v) => Number(v).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

export default function Produccion() {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [tab, setTab]         = useState(2); // default: Comenzado
  const [desde, setDesde]     = useState('');
  const [hasta, setHasta]     = useState('');
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
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Box sx={{ width: 48, height: 48, borderRadius: '12px', background: 'linear-gradient(135deg, #1565c0, #42a5f5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FontAwesomeIcon icon={faIndustry} style={{ color: '#fff', fontSize: 20 }} />
        </Box>
        <Box>
          <Typography variant="h5" fontWeight={700} color="primary.main">Producción</Typography>
          <Typography variant="body2" color="text.secondary">Seguimiento del proceso productivo</Typography>
        </Box>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px', mb: 2, p: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 1.5 }} TabIndicatorProps={{ sx: { bgcolor: 'primary.main' } }}>
          <Tab label="Todos" sx={{ fontWeight: 600, textTransform: 'none' }} />
          <Tab label="Registrados" sx={{ fontWeight: 600, textTransform: 'none' }} />
          <Tab label="En Producción" sx={{ fontWeight: 600, textTransform: 'none' }} />
          <Tab label="Finalizados" sx={{ fontWeight: 600, textTransform: 'none' }} />
        </Tabs>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField label="Desde" type="date" size="small" value={desde} onChange={e => setDesde(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ width: 170 }} />
          <TextField label="Hasta" type="date" size="small" value={hasta} onChange={e => setHasta(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ width: 170 }} />
          {(desde || hasta) && <Button size="small" onClick={() => { setDesde(''); setHasta(''); }} sx={{ fontWeight: 600 }}>Limpiar</Button>}
        </Box>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress sx={{ color: 'primary.main' }} /></Box>
      ) : rows.length === 0 ? (
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '14px', p: 6, textAlign: 'center' }}>
          <Typography color="text.secondary">Sin cortes en este estado.</Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 2 }}>
          {rows.map(r => {
            const sc = statusColor[r.Status] || statusColor.Registrado;
            return (
              <Card key={r.Id} elevation={0} sx={{ borderRadius: '14px', border: `1px solid ${sc.border}`, '&:hover': { boxShadow: `0 4px 20px ${sc.border}` }, transition: '0.2s' }}>
                <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Typography fontWeight={700} fontFamily="monospace" color="primary.main">{r.Folio}</Typography>
                    <Chip label={r.Status} size="small" sx={{ fontWeight: 600, fontSize: '0.7rem', bgcolor: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }} />
                  </Box>
                  <Typography fontWeight={600} mb={0.5}>{r.NombrePrenda || '—'}</Typography>
                  <Typography variant="body2" color="text.secondary" mb={1}>{r.NombreCorte || '—'}</Typography>
                  <Box sx={{ display: 'flex', gap: 3, mb: 1.5 }}>
                    <Box><Typography variant="caption" color="text.secondary">Piezas</Typography><Typography fontWeight={600}>{r.CantidadPiezas}</Typography></Box>
                    <Box><Typography variant="caption" color="text.secondary">P. Unit.</Typography><Typography fontWeight={600}>{fmt(r.PrecioUnitario)}</Typography></Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.8, justifyContent: 'flex-end' }}>
                    <Tooltip title="Ver detalle">
                      <IconButton size="small" onClick={() => openDetail(r.Id)} sx={{ color: 'primary.main', bgcolor: 'rgba(21,101,192,0.06)', borderRadius: '7px' }}>
                        <FontAwesomeIcon icon={faEye} style={{ fontSize: 13 }} />
                      </IconButton>
                    </Tooltip>
                    {r.Status === 'Comenzado' && (
                      <Tooltip title="Registrar avance">
                        <IconButton size="small" onClick={() => openAvance(r)} sx={{ color: '#b45309', bgcolor: 'rgba(180,83,9,0.07)', borderRadius: '7px' }}>
                          <FontAwesomeIcon icon={faPlus} style={{ fontSize: 12 }} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </CardContent>
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
