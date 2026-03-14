import { useState, useEffect, useCallback } from 'react';
import {
  Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Tooltip, Typography, Alert, CircularProgress,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShirt, faPlus, faPenToSquare, faToggleOn, faToggleOff, faTrash,
} from '@fortawesome/free-solid-svg-icons';
import CreateEditDialog from '../components/CreateEditDialog';

const API_URL = import.meta.env.VITE_API_URL;
const EMPTY = { Nombre: '', Descripcion: '' };
const FIELDS = [
  { name: 'Nombre', label: 'Nombre' },
  { name: 'Descripcion', label: 'Descripción (opcional)', multiline: true, rows: 2 },
];

export default function TiposPrenda() {
  const [rows, setRows]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [saving, setSaving]     = useState(false);
  const [open, setOpen]         = useState(false);
  const [isNew, setIsNew]       = useState(false);
  const [editId, setEditId]     = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [formErr, setFormErr]   = useState({});
  const [dlgMsg, setDlgMsg]     = useState('');
  const [confirmId, setConfirmId] = useState(null);

  const fetch_ = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const r = await fetch(`${API_URL}/api/tipos-prenda`);
      const j = await r.json();
      if (j.success) setRows(j.data.filter(d => d.Status !== 'Eliminado'));
      else setError('No se pudo cargar el catálogo.');
    } catch { setError('Error de conexión.'); }
    setLoading(false);
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const openNew = () => { setIsNew(true); setEditId(null); setForm(EMPTY); setFormErr({}); setDlgMsg(''); setOpen(true); };
  const openEdit = (r) => { setIsNew(false); setEditId(r.Id); setForm({ Nombre: r.Nombre, Descripcion: r.Descripcion || '' }); setFormErr({}); setDlgMsg(''); setOpen(true); };

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
      const url    = isNew ? `${API_URL}/api/tipos-prenda` : `${API_URL}/api/tipos-prenda/${editId}`;
      const method = isNew ? 'POST' : 'PUT';
      const r  = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const j  = await r.json();
      if (j.success) { setOpen(false); fetch_(); }
      else setDlgMsg(j.errors ? Object.values(j.errors).join(' ') : j.message || 'Error al guardar.');
    } catch { setDlgMsg('Error de conexión.'); }
    setSaving(false);
  };

  const handleToggle = async (id) => {
    await fetch(`${API_URL}/api/tipos-prenda/${id}/status`, { method: 'PATCH' });
    fetch_();
  };

  const handleDelete = async (id) => {
    await fetch(`${API_URL}/api/tipos-prenda/${id}`, { method: 'DELETE' });
    setConfirmId(null); fetch_();
  };

  const activos = rows.filter(r => r.Status === 'Activo').length;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 48, height: 48, borderRadius: '12px', background: 'linear-gradient(135deg, #1565c0, #42a5f5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FontAwesomeIcon icon={faShirt} style={{ color: '#fff', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700} color="primary.main">Tipos de Prenda</Typography>
            <Typography variant="body2" color="text.secondary">{activos} activo{activos !== 1 ? 's' : ''} · {rows.length} total</Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<FontAwesomeIcon icon={faPlus} />} onClick={openNew}
          sx={{ background: 'linear-gradient(135deg, #1565c0, #42a5f5)', borderRadius: '10px', fontWeight: 600, px: 3, '&:hover': { background: 'linear-gradient(135deg, #0d47a1, #1565c0)' } }}>
          Nuevo
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress sx={{ color: 'primary.main' }} /></Box>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '14px', overflowX: 'auto' }}>
          <Table sx={{ minWidth: 600 }}>
            <TableHead>
              <TableRow sx={{ background: 'linear-gradient(135deg, #1565c0, #42a5f5)' }}>
                {['#', 'Nombre', 'Descripción', 'Estado', 'Acciones'].map(h => (
                  <TableCell key={h} sx={{ color: '#fff', fontWeight: 700, fontSize: '0.82rem', py: 1.8 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>Sin registros. Agrega el primero.</TableCell></TableRow>
              ) : rows.map((r, i) => (
                <TableRow key={r.Id} sx={{ '&:hover': { bgcolor: 'rgba(21,101,192,0.03)' }, opacity: r.Status === 'Inactivo' ? 0.6 : 1 }}>
                  <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>{i + 1}</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>{r.Nombre}</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>{r.Descripcion || '—'}</TableCell>
                  <TableCell>
                    <Chip label={r.Status} size="small"
                      sx={{ fontWeight: 600, fontSize: '0.72rem',
                        bgcolor: r.Status === 'Activo' ? 'rgba(46,125,50,0.1)' : 'rgba(0,0,0,0.06)',
                        color: r.Status === 'Activo' ? '#2e7d32' : '#757575',
                        border: `1px solid ${r.Status === 'Activo' ? 'rgba(46,125,50,0.3)' : 'rgba(0,0,0,0.12)'}` }} />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.8 }}>
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => openEdit(r)} sx={{ color: 'primary.main', bgcolor: 'rgba(21,101,192,0.06)', borderRadius: '7px', '&:hover': { bgcolor: 'rgba(21,101,192,0.14)' } }}>
                          <FontAwesomeIcon icon={faPenToSquare} style={{ fontSize: 13 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={r.Status === 'Activo' ? 'Desactivar' : 'Activar'}>
                        <IconButton size="small" onClick={() => handleToggle(r.Id)}
                          sx={{ color: r.Status === 'Activo' ? '#e65100' : '#2e7d32', bgcolor: r.Status === 'Activo' ? 'rgba(230,81,0,0.07)' : 'rgba(46,125,50,0.07)', borderRadius: '7px', '&:hover': { bgcolor: r.Status === 'Activo' ? 'rgba(230,81,0,0.15)' : 'rgba(46,125,50,0.15)' } }}>
                          <FontAwesomeIcon icon={r.Status === 'Activo' ? faToggleOff : faToggleOn} style={{ fontSize: 13 }} />
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

      {/* Dialog crear/editar */}
      <CreateEditDialog
        open={open}
        onClose={() => setOpen(false)}
        isNew={isNew}
        form={form}
        setForm={setForm}
        formErr={formErr}
        onSave={handleSave}
        saving={saving}
        dlgMsg={dlgMsg}
        title="Prenda"
        fields={FIELDS}
      />

      {/* Dialog confirmar eliminación */}
      <Dialog open={!!confirmId} onClose={() => setConfirmId(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '14px' } }}>
        <DialogTitle sx={{ fontWeight: 700, color: '#c62828' }}>¿Eliminar tipo de prenda?</DialogTitle>
        <DialogContent><Typography color="text.secondary">Esta acción no se puede deshacer.</Typography></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setConfirmId(null)} variant="outlined" sx={{ borderRadius: '8px', fontWeight: 600 }}>Cancelar</Button>
          <Button onClick={() => handleDelete(confirmId)} variant="contained" color="error" sx={{ borderRadius: '8px', fontWeight: 600 }}>Eliminar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

