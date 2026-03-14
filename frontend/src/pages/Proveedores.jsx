import { useState, useEffect, useCallback } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Tooltip, Typography, Alert,
  CircularProgress, Chip,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBuilding, faPlus, faPenToSquare, faTrash, faSave, faTimes,
  faSpinner, faRotateLeft, faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';

const API_URL = import.meta.env.VITE_API_URL;
const EMPTY = { Nombre: '', Correo: '', Telefono: '' };

export default function Proveedores() {
  const [rows, setRows]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [open, setOpen]         = useState(false);
  const [isNew, setIsNew]       = useState(true);
  const [editId, setEditId]     = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [formErr, setFormErr]   = useState({});
  const [dlgMsg, setDlgMsg]     = useState('');
  const [saving, setSaving]     = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [reiniciarOpen, setReiniciarOpen] = useState(false);
  const [reiniciando, setReiniciando]     = useState(false);
  const [reiniciarMsg, setReiniciarMsg]   = useState('');

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
    setSaving(true); setDlgMsg('');
    try {
      const url    = isNew ? `${API_URL}/api/proveedores` : `${API_URL}/api/proveedores/${editId}`;
      const method = isNew ? 'POST' : 'PUT';
      const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const j = await r.json();
      if (j.success) { setOpen(false); loadData(); }
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
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 48, height: 48, borderRadius: '12px', background: 'linear-gradient(135deg, #1565c0, #42a5f5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FontAwesomeIcon icon={faBuilding} style={{ color: '#fff', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700} color="primary.main">Proveedores</Typography>
            <Typography variant="body2" color="text.secondary">{rows.length} proveedor{rows.length !== 1 ? 'es' : ''}</Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<FontAwesomeIcon icon={faPlus} />} onClick={openNew}
          sx={{ background: 'linear-gradient(135deg, #1565c0, #42a5f5)', borderRadius: '10px', fontWeight: 600, px: 3, '&:hover': { background: 'linear-gradient(135deg, #0d47a1, #1565c0)' } }}>
          Nuevo Proveedor
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress sx={{ color: 'primary.main' }} /></Box>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '14px', overflowX: 'auto', mb: 4 }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ background: 'linear-gradient(135deg, #1565c0, #42a5f5)' }}>
                {['Nombre', 'Correo', 'Teléfono', 'Estado', 'Acciones'].map(h => (
                  <TableCell key={h} sx={{ color: '#fff', fontWeight: 700, fontSize: '0.82rem', py: 1.8 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>Sin proveedores registrados.</TableCell></TableRow>
              ) : rows.map((r) => (
                <TableRow key={r.Id} sx={{ '&:hover': { bgcolor: 'rgba(21,101,192,0.03)' } }}>
                  <TableCell sx={{ fontWeight: 600 }}>{r.Nombre}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{r.Correo || '—'}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{r.Telefono || '—'}</TableCell>
                  <TableCell>
                    <Chip label={r.Status} size="small" sx={{ fontWeight: 600, fontSize: '0.72rem',
                      bgcolor: r.Status === 'Activo' ? 'rgba(46,125,50,0.1)' : 'rgba(71,85,105,0.1)',
                      color:   r.Status === 'Activo' ? '#2e7d32' : '#475569',
                    }} />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.6 }}>
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => openEdit(r)} sx={{ color: 'primary.main', bgcolor: 'rgba(21,101,192,0.06)', borderRadius: '7px', '&:hover': { bgcolor: 'rgba(21,101,192,0.14)' } }}>
                          <FontAwesomeIcon icon={faPenToSquare} style={{ fontSize: 13 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton size="small" onClick={() => setConfirmId(r.Id)} sx={{ color: '#c62828', bgcolor: 'rgba(198,40,40,0.06)', borderRadius: '7px', '&:hover': { bgcolor: 'rgba(198,40,40,0.14)' } }}>
                          <FontAwesomeIcon icon={faTrash} style={{ fontSize: 13 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Zona de peligro */}
      <Paper elevation={0} sx={{ border: '2px solid rgba(198,40,40,0.25)', borderRadius: '14px', p: 3, bgcolor: 'rgba(198,40,40,0.02)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <FontAwesomeIcon icon={faTriangleExclamation} style={{ color: '#c62828', fontSize: 18 }} />
          <Typography fontWeight={700} color="#c62828">Zona de peligro</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Esta acción eliminará <strong>todos</strong> los registros de Cortes, Producción y Piezas Faltantes. Los catálogos (tipos de prenda, tipos de corte, precios, proveedores) no se verán afectados.
        </Typography>
        <Button variant="outlined" color="error" startIcon={<FontAwesomeIcon icon={faRotateLeft} />}
          onClick={() => setReiniciarOpen(true)}
          sx={{ fontWeight: 600, borderRadius: '8px', borderColor: '#c62828', color: '#c62828', '&:hover': { bgcolor: 'rgba(198,40,40,0.06)' } }}>
          Reiniciar datos de producción
        </Button>
      </Paper>

      {/* Dialog Crear/Editar */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '16px', overflow: 'visible' } }}>
        <DialogTitle sx={{ background: 'linear-gradient(135deg, #1565c0, #42a5f5)', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <FontAwesomeIcon icon={isNew ? faPlus : faPenToSquare} />
          {isNew ? 'Nuevo Proveedor' : 'Editar Proveedor'}
          <IconButton onClick={() => setOpen(false)} size="small" sx={{ ml: 'auto', color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#fff' } }}>
            <FontAwesomeIcon icon={faTimes} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 1, overflow: 'visible' }}>
          {dlgMsg && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{dlgMsg}</Alert>}
          <TextField fullWidth label="Nombre *" value={form.Nombre} onChange={f('Nombre')}
            error={!!formErr.Nombre} helperText={formErr.Nombre} sx={{ mb: 2, mt: 2 }} />
          <TextField fullWidth label="Correo electrónico" type="email" value={form.Correo} onChange={f('Correo')} sx={{ mb: 2 }} />
          <TextField fullWidth label="Teléfono" value={form.Telefono} onChange={f('Telefono')} sx={{ mb: 1 }} />
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

      {/* Dialog Confirmar Eliminar */}
      <Dialog open={!!confirmId} onClose={() => setConfirmId(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '14px' } }}>
        <DialogTitle sx={{ fontWeight: 700, color: '#c62828' }}>¿Eliminar proveedor?</DialogTitle>
        <DialogContent><Typography color="text.secondary">Esta acción no se puede deshacer.</Typography></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setConfirmId(null)} variant="outlined" sx={{ borderRadius: '8px', fontWeight: 600 }}>Cancelar</Button>
          <Button onClick={handleDelete} variant="contained" sx={{ borderRadius: '8px', fontWeight: 600, bgcolor: '#c62828', '&:hover': { bgcolor: '#b71c1c' } }}>Eliminar</Button>
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
    </Box>
  );
}
