import { useState, useEffect, useCallback } from 'react';
import {
  Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  Grid, IconButton, Paper, Tooltip, Typography, Alert, CircularProgress, useTheme,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTags, faPlus, faPenToSquare, faToggleOn, faToggleOff, faTrash, faDollarSign,
} from '@fortawesome/free-solid-svg-icons';
import CreateEditPrecioDialog from '../components/CreateEditPrecioDialog';

const API_URL = import.meta.env.VITE_API_URL;
const EMPTY = { IdTipoPrenda: '', IdTipoCorte: '', Precio: '' };

const fmt = (v) => Number(v).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

export default function PreciosMaquila() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const surface = theme.palette.background.paper;
  const cardBgActive   = isDark ? '#0B1724' : surface;
  const cardBgInactive = isDark ? 'rgba(30,30,40,0.5)' : 'rgba(240,240,245,0.7)';
  const cardBorderActive   = isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)';
  const cardBorderInactive = isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.05)';

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
  const [confirmId, setConfirmId] = useState(null);

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

  const handleDelete = async (id) => {
    await fetch(`${API_URL}/api/precios/${id}`, { method: 'DELETE' });
    setConfirmId(null); loadData();
  };

  const activos = rows.filter(r => r.Status === 'Activo').length;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 48, height: 48, borderRadius: '12px', background: 'linear-gradient(135deg, #1565c0, #42a5f5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FontAwesomeIcon icon={faTags} style={{ color: '#fff', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700} color="primary.main">Precios de Maquila</Typography>
            <Typography variant="body2" color="text.secondary">{activos} activo{activos !== 1 ? 's' : ''} · {rows.length} total</Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<FontAwesomeIcon icon={faPlus} />} onClick={openNew}
          sx={{ background: 'linear-gradient(135deg, #1565c0, #42a5f5)', borderRadius: '10px', fontWeight: 600, px: 3, '&:hover': { background: 'linear-gradient(135deg, #0d47a1, #1565c0)' } }}>
          Nuevo Precio
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress sx={{ color: 'primary.main' }} /></Box>
      ) : rows.length === 0 ? (
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '16px', p: 6, textAlign: 'center' }}>
          <Box sx={{ width: 64, height: 64, borderRadius: '16px', background: 'linear-gradient(135deg, #1565c0, #42a5f5)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
            <FontAwesomeIcon icon={faTags} style={{ color: '#fff', fontSize: 28 }} />
          </Box>
          <Typography fontWeight={700} mb={0.5}>Sin precios configurados</Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>Agrega combinaciones de prenda + corte con su precio.</Typography>
          <Button variant="contained" startIcon={<FontAwesomeIcon icon={faPlus} />} onClick={openNew}
            sx={{ background: 'linear-gradient(135deg, #1565c0, #42a5f5)', borderRadius: '8px', fontWeight: 600 }}>
            Agregar primero
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={2.5}>
          {rows.map((r) => {
            const isActive = r.Status === 'Activo';
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={r.Id}>
                <Paper elevation={0} sx={{
                  borderRadius: '16px',
                  background: isActive ? cardBgActive : cardBgInactive,
                  border: isActive ? cardBorderActive : cardBorderInactive,
                  borderTop: `4px solid ${isActive ? '#1565c0' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)')}`,
                  opacity: isActive ? 1 : 0.68,
                  transition: 'all 0.25s ease',
                  '&:hover': isActive ? { transform: 'translateY(-5px)', boxShadow: isDark ? '0 16px 40px rgba(0,0,0,0.45)' : '0 16px 40px rgba(21,101,192,0.13)' } : {},
                  overflow: 'hidden',
                }}>
                  <Box sx={{ p: 2.5 }}>
                    {/* Icon + Status */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ width: 44, height: 44, borderRadius: '11px', background: isActive ? 'linear-gradient(135deg, #1565c0, #42a5f5)' : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FontAwesomeIcon icon={faDollarSign} style={{ color: isActive ? '#fff' : (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)'), fontSize: 18 }} />
                      </Box>
                      <Chip label={r.Status} size="small" sx={{
                        fontWeight: 600, fontSize: '0.68rem', height: 22,
                        bgcolor: isActive ? (isDark ? 'rgba(46,125,50,0.2)' : 'rgba(46,125,50,0.1)') : (isDark ? 'rgba(100,100,100,0.15)' : 'rgba(0,0,0,0.05)'),
                        color: isActive ? (isDark ? '#4ade80' : '#2e7d32') : (isDark ? 'rgba(255,255,255,0.45)' : '#9e9e9e'),
                        border: `1px solid ${isActive ? (isDark ? 'rgba(74,222,128,0.25)' : 'rgba(46,125,50,0.25)') : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)')}`,
                      }} />
                    </Box>

                    {/* Nombres */}
                    <Typography fontWeight={700} fontSize="0.97rem" sx={{ color: isActive ? 'text.primary' : (isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.38)'), lineHeight: 1.3, mb: 0.4 }}>
                      {r.NombrePrenda || '—'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: isActive ? 'text.secondary' : (isDark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.28)'), mb: 2 }}>
                      {r.NombreCorte || '—'}
                    </Typography>

                    {/* Precio grande */}
                    <Typography variant="h5" fontWeight={800} sx={{ color: isActive ? '#1565c0' : (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)'), mb: 2 }}>
                      {fmt(r.Precio)}
                    </Typography>

                    <Box sx={{ height: '1px', bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', mb: 1.5 }} />

                    {/* Actions */}
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => openEdit(r)} sx={{ color: '#1565c0', bgcolor: 'rgba(21,101,192,0.07)', borderRadius: '8px', '&:hover': { bgcolor: 'rgba(21,101,192,0.15)' } }}>
                          <FontAwesomeIcon icon={faPenToSquare} style={{ fontSize: 13 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={isActive ? 'Desactivar' : 'Activar'}>
                        <IconButton size="small" onClick={() => handleToggle(r.Id)}
                          sx={{ color: isActive ? '#e65100' : '#2e7d32', bgcolor: isActive ? 'rgba(230,81,0,0.07)' : 'rgba(46,125,50,0.07)', borderRadius: '8px', '&:hover': { bgcolor: isActive ? 'rgba(230,81,0,0.15)' : 'rgba(46,125,50,0.15)' } }}>
                          <FontAwesomeIcon icon={isActive ? faToggleOff : faToggleOn} style={{ fontSize: 13 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton size="small" onClick={() => setConfirmId(r.Id)} sx={{ color: '#c62828', bgcolor: 'rgba(198,40,40,0.06)', borderRadius: '8px', '&:hover': { bgcolor: 'rgba(198,40,40,0.14)' } }}>
                          <FontAwesomeIcon icon={faTrash} style={{ fontSize: 13 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
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

      {/* Dialog confirmar eliminación */}
      <Dialog open={!!confirmId} onClose={() => setConfirmId(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '14px' } }}>
        <DialogTitle sx={{ fontWeight: 700, color: '#c62828' }}>¿Eliminar precio?</DialogTitle>
        <DialogContent><Typography color="text.secondary">Esta acción no se puede deshacer.</Typography></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setConfirmId(null)} variant="outlined" sx={{ borderRadius: '8px', fontWeight: 600 }}>Cancelar</Button>
          <Button onClick={() => handleDelete(confirmId)} variant="contained" color="error" sx={{ borderRadius: '8px', fontWeight: 600 }}>Eliminar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

