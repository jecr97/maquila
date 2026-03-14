import { useState, useEffect, useCallback } from 'react';
import {
    Box, Button, Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
    FormControl, FormControlLabel, IconButton, InputLabel, MenuItem, Paper, Select, Table,
    TableBody, TableCell, TableContainer, TableHead, TableRow, TextField,
    Tooltip, Typography, Alert, CircularProgress,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTriangleExclamation, faPlus, faTrash, faTimes, faSave, faSpinner,
} from '@fortawesome/free-solid-svg-icons';

const API_URL = import.meta.env.VITE_API_URL;

export default function PiezasFaltantes() {
    const [rows, setRows] = useState([]);
    const [cortesActivos, setCortesActivos] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [idProveedor, setIdProveedor] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [desde, setDesde] = useState('');
    const [hasta, setHasta] = useState('');
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ IdCorte: '', CantidadFaltante: '', Motivo: '', AplicaDescuento: true });
    const [formErr, setFormErr] = useState({});
    const [dlgMsg, setDlgMsg] = useState('');
    const [confirmId, setConfirmId] = useState(null);
    const [confirmCorteId, setConfirmCorteId] = useState(null);

    const user = JSON.parse(localStorage.getItem('maquila_user') || '{}');

    const loadData = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const params = new URLSearchParams();
            if (desde)       params.set('desde', desde);
            if (hasta)       params.set('hasta', hasta);
            if (idProveedor) params.set('idProveedor', idProveedor);
            const [rRows, rProv] = await Promise.all([
                fetch(`${API_URL}/api/piezas-faltantes?${params}`),
                fetch(`${API_URL}/api/proveedores`),
            ]);
            const [jRows, jProv] = await Promise.all([rRows.json(), rProv.json()]);
            if (jRows.success) setRows(jRows.data);
            else setError('No se pudieron cargar los registros.');
            if (jProv.success) setProveedores(jProv.data.filter(p => p.Status === 'Activo'));
        } catch (e) {
            setError('Error de conexión.');
            console.error(e);
        }
        setLoading(false);
    }, [desde, hasta, idProveedor]);

    useEffect(() => { loadData(); }, [loadData]);

    const loadCortes = async () => {
        try {
            const r = await fetch(`${API_URL}/api/cortes?status=Comenzado`);
            const j = await r.json();
            console.log('Cortes activos:', j);
            if (j.success) setCortesActivos(j.data);
        } catch (e) { console.error(e); }
    };

    const openNew = () => {
        loadCortes();
        setForm({ IdCorte: '', CantidadFaltante: '', Motivo: '', AplicaDescuento: true });
        setFormErr({}); setDlgMsg(''); setOpen(true);
    };

    const validate = () => {
        const e = {};
        if (!form.IdCorte) e.IdCorte = 'Selecciona un corte.';
        if (!form.CantidadFaltante || Number(form.CantidadFaltante) <= 0) e.CantidadFaltante = 'Ingresa una cantidad mayor a 0.';
        setFormErr(e);
        return !Object.keys(e).length;
    };

    const handleSave = async () => {
        if (!validate()) return;
        setSaving(true); setDlgMsg('');
        try {
            const r = await fetch(`${API_URL}/api/cortes/${form.IdCorte}/faltantes`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ CantidadFaltante: form.CantidadFaltante, Motivo: form.Motivo, AplicaDescuento: form.AplicaDescuento ? 1 : 0, IdUsuarioRegistro: user.id }),
            });
            const j = await r.json();
            if (j.success) { setOpen(false); loadData(); }
            else setDlgMsg(j.errors ? Object.values(j.errors).join(' ') : j.message || 'Error al guardar.');
        } catch { setDlgMsg('Error de conexión.'); }
        setSaving(false);
    };

    const handleDelete = async () => {
        if (!confirmId || !confirmCorteId) return;
        try {
            await fetch(`${API_URL}/api/cortes/${confirmCorteId}/faltantes/${confirmId}`, { method: 'DELETE' });
        } catch { /* ignore */ }
        setConfirmId(null); setConfirmCorteId(null); loadData();
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ width: 48, height: 48, borderRadius: '12px', background: 'linear-gradient(135deg, #b91c1c, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FontAwesomeIcon icon={faTriangleExclamation} style={{ color: '#fff', fontSize: 20 }} />
                    </Box>
                    <Box>
                        <Typography variant="h5" fontWeight={700} color="primary.main">Piezas Faltantes</Typography>
                        <Typography variant="body2" color="text.secondary">{rows.length} registro{rows.length !== 1 ? 's' : ''}</Typography>
                    </Box>
                </Box>
                <Button variant="contained" startIcon={<FontAwesomeIcon icon={faPlus} />} onClick={openNew}
                    sx={{ background: 'linear-gradient(135deg, #1565c0, #42a5f5)', borderRadius: '10px', fontWeight: 600, px: 3, '&:hover': { background: 'linear-gradient(135deg, #0d47a1, #1565c0)' } }}>
                    Registrar Faltantes
                </Button>
            </Box>

            <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px', mb: 2, p: 2 }}>
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
                                {['Folio Corte', 'Prenda', 'Corte', 'Proveedor', 'Cant. Faltante', 'Descuento', 'Motivo', 'Fecha', 'Acciones'].map(h => (
                                    <TableCell key={h} sx={{ color: '#fff', fontWeight: 700, fontSize: '0.82rem', py: 1.8 }}>{h}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.length === 0 ? (
                                <TableRow><TableCell colSpan={9} align="center" sx={{ py: 6, color: 'text.secondary' }}>Sin piezas faltantes registradas.</TableCell></TableRow>
                            ) : rows.map((r) => (
                                <TableRow key={r.Id} sx={{ '&:hover': { bgcolor: 'rgba(21,101,192,0.03)' } }}>
                                    <TableCell sx={{ fontWeight: 700, color: 'primary.main', fontFamily: 'monospace' }}>{r.Folio || '—'}</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>{r.NombrePrenda || '—'}</TableCell>
                                    <TableCell>{r.NombreCorte || '—'}</TableCell>
                                    <TableCell>{r.NombreProveedor || '—'}</TableCell>
                                    <TableCell>
                                        <Chip label={r.CantidadFaltante} size="small" sx={{ fontWeight: 700, bgcolor: 'rgba(198,40,40,0.1)', color: '#c62828', border: '1px solid rgba(198,40,40,0.25)' }} />
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={r.AplicaDescuento == 1 ? 'Con desc.' : 'Sin desc.'} size="small"
                                            sx={{ fontWeight: 600, bgcolor: r.AplicaDescuento == 1 ? 'rgba(21,101,192,0.1)' : 'rgba(100,100,100,0.1)', color: r.AplicaDescuento == 1 ? '#1565c0' : '#616161', border: `1px solid ${r.AplicaDescuento == 1 ? 'rgba(21,101,192,0.3)' : 'rgba(100,100,100,0.25)'}` }} />
                                    </TableCell>
                                    <TableCell sx={{ color: 'text.secondary', maxWidth: 200 }}>{r.Motivo || '—'}</TableCell>
                                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.82rem' }}>{r.CreatedAt ? new Date(r.CreatedAt).toLocaleDateString('es-MX') : '—'}</TableCell>
                                    <TableCell>
                                        <Tooltip title="Eliminar">
                                            <IconButton size="small" onClick={() => { setConfirmId(r.Id); setConfirmCorteId(r.IdCorte); }}
                                                sx={{ color: '#c62828', bgcolor: 'rgba(198,40,40,0.06)', borderRadius: '7px', '&:hover': { bgcolor: 'rgba(198,40,40,0.14)' } }}>
                                                <FontAwesomeIcon icon={faTrash} style={{ fontSize: 13 }} />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Dialog Registrar */}
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '16px', overflow: 'visible' } }}>
                <DialogTitle sx={{ background: 'linear-gradient(135deg, #1565c0, #42a5f5)', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <FontAwesomeIcon icon={faTriangleExclamation} /> Registrar Faltantes
                    <IconButton onClick={() => setOpen(false)} size="small" sx={{ ml: 'auto', color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#fff' } }}>
                        <FontAwesomeIcon icon={faTimes} />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ pt: 3, pb: 1, overflow: 'visible' }}>
                    {dlgMsg && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{dlgMsg}</Alert>}
                    <FormControl fullWidth sx={{ mb: 2, mt: 2 }} error={!!formErr.IdCorte}>
                        <InputLabel>Corte</InputLabel>
                        <Select label="Corte" value={form.IdCorte} onChange={e => { setForm(p => ({ ...p, IdCorte: e.target.value })); setFormErr(p => ({ ...p, IdCorte: '' })); }}>
                            {cortesActivos.map(c => <MenuItem key={c.Id} value={c.Id}>{c.Folio} — {c.NombrePrenda} / {c.NombreCorte}</MenuItem>)}
                        </Select>
                        {formErr.IdCorte && <Typography variant="caption" color="error" ml={1.5}>{formErr.IdCorte}</Typography>}
                    </FormControl>
                    <TextField fullWidth label="Cantidad Faltante" type="number" value={form.CantidadFaltante} inputProps={{ min: 1 }}
                        onChange={e => { setForm(p => ({ ...p, CantidadFaltante: e.target.value })); setFormErr(p => ({ ...p, CantidadFaltante: '' })); }}
                        error={!!formErr.CantidadFaltante} helperText={formErr.CantidadFaltante} sx={{ mb: 2 }} />
                    <TextField fullWidth label="Motivo" multiline rows={2} value={form.Motivo}
                        onChange={e => setForm(p => ({ ...p, Motivo: e.target.value }))} />
                    <FormControlLabel sx={{ mt: 1 }}
                        control={<Checkbox checked={form.AplicaDescuento} onChange={e => setForm(p => ({ ...p, AplicaDescuento: e.target.checked }))}
                            sx={{ color: 'primary.main', '&.Mui-checked': { color: 'primary.main' } }} />}
                        label="Aplicar descuento sobre estas piezas" />
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
            <Dialog open={!!confirmId} onClose={() => { setConfirmId(null); setConfirmCorteId(null); }} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '14px' } }}>
                <DialogTitle sx={{ fontWeight: 700, color: '#c62828' }}>¿Eliminar registro?</DialogTitle>
                <DialogContent><Typography color="text.secondary">Esta acción no se puede deshacer.</Typography></DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                    <Button onClick={() => { setConfirmId(null); setConfirmCorteId(null); }} variant="outlined" sx={{ borderRadius: '8px', fontWeight: 600 }}>Cancelar</Button>
                    <Button onClick={handleDelete} variant="contained" sx={{ borderRadius: '8px', fontWeight: 600, bgcolor: '#c62828', '&:hover': { bgcolor: '#b71c1c' } }}>Eliminar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
