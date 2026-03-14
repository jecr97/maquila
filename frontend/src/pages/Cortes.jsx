import { useState, useEffect, useCallback } from 'react';
import {
  Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, FormHelperText, IconButton, InputLabel, MenuItem, Paper, Select,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField,
  Tooltip, Typography, Alert, CircularProgress, Tabs, Tab,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLayerGroup, faPlus, faPenToSquare, faPlay, faFlagCheckered,
  faTrash, faSave, faTimes, faSpinner, faEye,
} from '@fortawesome/free-solid-svg-icons';

const API_URL = import.meta.env.VITE_API_URL;
const EMPTY = { IdTipoPrenda: '', IdTipoCorte: '', IdProveedor: '', CantidadPiezas: '' };

const statusColor = {
  Registrado: { bg: 'rgba(21,101,192,0.1)', color: 'primary.main', border: 'rgba(21,101,192,0.3)' },
  Comenzado:  { bg: 'rgba(180,83,9,0.1)', color: '#b45309', border: 'rgba(180,83,9,0.3)' },
  Finalizado: { bg: 'rgba(46,125,50,0.1)', color: '#2e7d32', border: 'rgba(46,125,50,0.3)' },
};

const fmt = (v) => Number(v).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

export default function Cortes() {
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

  const openNew = () => { setIsNew(true); setEditId(null); setForm(EMPTY); setFormErr({}); setDlgMsg(''); setOpen(true); };
  const openEdit = (r) => {
    if (r.Status === 'Finalizado') return;
    setIsNew(false); setEditId(r.Id);
    setForm({ IdTipoPrenda: r.IdTipoPrenda, IdTipoCorte: r.IdTipoCorte, IdProveedor: r.IdProveedor || '', CantidadPiezas: r.CantidadPiezas });
    setFormErr({}); setDlgMsg(''); setOpen(true);
  };

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
    delete: { title: '¿Eliminar corte?', color: '#c62828', btn: 'Eliminar' },
    comenzar: { title: '¿Comenzar producción?', color: '#b45309', btn: 'Comenzar' },
    finalizar: { title: '¿Finalizar corte?', color: '#2e7d32', btn: 'Finalizar' },
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 48, height: 48, borderRadius: '12px', background: 'linear-gradient(135deg, #1565c0, #42a5f5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FontAwesomeIcon icon={faLayerGroup} style={{ color: '#fff', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700} color="primary.main">Cortes</Typography>
            <Typography variant="body2" color="text.secondary">{rows.length} corte{rows.length !== 1 ? 's' : ''}</Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<FontAwesomeIcon icon={faPlus} />} onClick={openNew}
          sx={{ background: 'linear-gradient(135deg, #1565c0, #42a5f5)', borderRadius: '10px', fontWeight: 600, px: 3, '&:hover': { background: 'linear-gradient(135deg, #0d47a1, #1565c0)' } }}>
          Nuevo Corte
        </Button>
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
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Proveedor</InputLabel>
            <Select label="Proveedor" value={idProveedor} onChange={e => setIdProveedor(e.target.value)}>
              <MenuItem value="">Todos</MenuItem>
              {proveedores.map(p => <MenuItem key={p.Id} value={p.Id}>{p.Nombre}</MenuItem>)}
            </Select>
          </FormControl>
          {(desde || hasta || idProveedor) && <Button size="small" onClick={() => { setDesde(''); setHasta(''); setIdProveedor(''); }} sx={{ fontWeight: 600 }}>Limpiar</Button>}
        </Box>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress sx={{ color: 'primary.main' }} /></Box>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '14px', overflowX: 'auto' }}>
          <Table sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow sx={{ background: 'linear-gradient(135deg, #1565c0, #42a5f5)' }}>
                {['Folio', 'Prenda', 'Corte', 'Proveedor', 'Piezas', 'P. Unit.', 'Estado', 'Fecha', 'Acciones'].map(h => (
                  <TableCell key={h} sx={{ color: '#fff', fontWeight: 700, fontSize: '0.82rem', py: 1.8 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow><TableCell colSpan={9} align="center" sx={{ py: 6, color: 'text.secondary' }}>Sin cortes registrados.</TableCell></TableRow>
              ) : rows.map((r) => {
                const sc = statusColor[r.Status] || statusColor.Registrado;
                return (
                  <TableRow key={r.Id} sx={{ '&:hover': { bgcolor: 'rgba(21,101,192,0.03)' } }}>
                    <TableCell sx={{ fontWeight: 700, color: 'primary.main', fontFamily: 'monospace' }}>{r.Folio || '—'}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{r.NombrePrenda || '—'}</TableCell>
                    <TableCell>{r.NombreCorte || '—'}</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.82rem' }}>{r.NombreProveedor || '—'}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{r.CantidadPiezas}</TableCell>
                    <TableCell>{fmt(r.PrecioUnitario)}</TableCell>
                    <TableCell>
                      <Chip label={r.Status} size="small" sx={{ fontWeight: 600, fontSize: '0.72rem', bgcolor: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }} />
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.82rem' }}>{r.CreatedAt ? new Date(r.CreatedAt).toLocaleDateString('es-MX') : '—'}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.6 }}>
                        <Tooltip title="Ver detalle">
                          <IconButton size="small" onClick={() => openDetail(r.Id)} sx={{ color: 'primary.main', bgcolor: 'rgba(21,101,192,0.06)', borderRadius: '7px', '&:hover': { bgcolor: 'rgba(21,101,192,0.14)' } }}>
                            <FontAwesomeIcon icon={faEye} style={{ fontSize: 13 }} />
                          </IconButton>
                        </Tooltip>
                        {r.Status === 'Registrado' && (<>
                          <Tooltip title="Editar">
                            <IconButton size="small" onClick={() => openEdit(r)} sx={{ color: 'primary.main', bgcolor: 'rgba(21,101,192,0.06)', borderRadius: '7px', '&:hover': { bgcolor: 'rgba(21,101,192,0.14)' } }}>
                              <FontAwesomeIcon icon={faPenToSquare} style={{ fontSize: 13 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Comenzar producción">
                            <IconButton size="small" onClick={() => { setConfirmId(r.Id); setConfirmAction('comenzar'); }} sx={{ color: '#b45309', bgcolor: 'rgba(180,83,9,0.07)', borderRadius: '7px', '&:hover': { bgcolor: 'rgba(180,83,9,0.15)' } }}>
                              <FontAwesomeIcon icon={faPlay} style={{ fontSize: 12 }} />
                            </IconButton>
                          </Tooltip>
                        </>)}
                        {r.Status === 'Comenzado' && (
                          <Tooltip title="Finalizar">
                            <IconButton size="small" onClick={() => { setConfirmId(r.Id); setConfirmAction('finalizar'); }} sx={{ color: '#2e7d32', bgcolor: 'rgba(46,125,50,0.07)', borderRadius: '7px', '&:hover': { bgcolor: 'rgba(46,125,50,0.15)' } }}>
                              <FontAwesomeIcon icon={faFlagCheckered} style={{ fontSize: 13 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                        {r.Status !== 'Finalizado' && (
                          <Tooltip title="Eliminar">
                            <IconButton size="small" onClick={() => { setConfirmId(r.Id); setConfirmAction('delete'); }} sx={{ color: '#c62828', bgcolor: 'rgba(198,40,40,0.06)', borderRadius: '7px', '&:hover': { bgcolor: 'rgba(198,40,40,0.14)' } }}>
                              <FontAwesomeIcon icon={faTrash} style={{ fontSize: 13 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
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
            <Select label="Tipo de Prenda" value={form.IdTipoPrenda} onChange={e => { setForm(p => ({ ...p, IdTipoPrenda: e.target.value })); setFormErr(p => ({ ...p, IdTipoPrenda: '', combo: '' })); }}>
              {prendas.map(p => <MenuItem key={p.Id} value={p.Id}>{p.Nombre}</MenuItem>)}
            </Select>
            {formErr.IdTipoPrenda && <FormHelperText>{formErr.IdTipoPrenda}</FormHelperText>}
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }} error={!!formErr.IdTipoCorte}>
            <InputLabel>Tipo de Corte</InputLabel>
            <Select label="Tipo de Corte" value={form.IdTipoCorte} onChange={e => { setForm(p => ({ ...p, IdTipoCorte: e.target.value })); setFormErr(p => ({ ...p, IdTipoCorte: '', combo: '' })); }}>
              {cortes.map(c => <MenuItem key={c.Id} value={c.Id}>{c.Nombre}</MenuItem>)}
            </Select>
            {formErr.IdTipoCorte && <FormHelperText>{formErr.IdTipoCorte}</FormHelperText>}
          </FormControl>
          {sinPrecio && (
            <Alert severity="warning" sx={{ mb: 2 }}>Esta combinación no tiene precio configurado en Precios Maquila. Configúralo antes de guardar.</Alert>
          )}
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
                <Chip label={detail.Status} size="small" sx={{ fontWeight: 600, bgcolor: (statusColor[detail.Status]||statusColor.Registrado).bg, color: (statusColor[detail.Status]||statusColor.Registrado).color }} />
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
            {confirmAction === 'delete' && 'Esta acción no se puede deshacer.'}
            {confirmAction === 'comenzar' && 'El corte pasará a estado "En Producción".'}
            {confirmAction === 'finalizar' && 'Se calcularán las piezas producidas y monto total. Las piezas faltantes se descontarán.'}
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
