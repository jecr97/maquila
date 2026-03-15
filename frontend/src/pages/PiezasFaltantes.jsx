import { useState, useEffect, useCallback } from 'react';
import {
    Box, Button, Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
    FormControl, FormControlLabel, Grid, IconButton, InputLabel, MenuItem, Paper, Select,
    TextField, Tooltip, Typography, Alert, CircularProgress, useTheme,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTriangleExclamation, faPlus, faTrash, faTimes, faSave, faSpinner,
} from '@fortawesome/free-solid-svg-icons';

const API_URL = import.meta.env.VITE_API_URL;

export default function PiezasFaltantes() {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const surface = theme.palette.background.paper;
    const cardBg = isDark ? '#0B1724' : surface;
    const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

    const [rows, setRows] = useState([]);
    const [cortesActivos, setCortesActivos] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [idProveedor, setIdProveedor] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [desde, setDesde] = useState('');
    const [hasta, setHasta] = useState('');
    const [dateErr, setDateErr] = useState('');
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

    const handleHastaChange = (val) => {
        if (val && !desde) { setDateErr('Primero selecciona la fecha inicial.'); return; }
        if (val && desde && val < desde) { setDateErr('La fecha final no puede ser anterior a la inicial.'); return; }
        setDateErr('');
        setHasta(val);
    };

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
                    <TextField label="Desde" type="date" size="small" value={desde}
                        onChange={e => { setDesde(e.target.value); setDateErr(''); if (hasta && e.target.value > hasta) setHasta(''); }}
                        InputLabelProps={{ shrink: true }} sx={{ width: 170 }} />
                    <TextField label="Hasta" type="date" size="small" value={hasta}
                        onChange={e => handleHastaChange(e.target.value)}
                        InputLabelProps={{ shrink: true }} sx={{ width: 170 }}
                        inputProps={{ min: desde || undefined }} />
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Proveedor</InputLabel>
                        <Select label="Proveedor" value={idProveedor} onChange={e => setIdProveedor(e.target.value)}>
                            <MenuItem value="">Todos</MenuItem>
                            {proveedores.map(p => <MenuItem key={p.Id} value={p.Id}>{p.Nombre}</MenuItem>)}
                        </Select>
                    </FormControl>
                    {(desde || hasta || idProveedor) && <Button size="small" onClick={() => { setDesde(''); setHasta(''); setIdProveedor(''); setDateErr(''); }} sx={{ fontWeight: 600 }}>Limpiar</Button>}
                </Box>
                {dateErr && <Alert severity="warning" sx={{ mt: 1.5, borderRadius: 2, py: 0.5 }}>{dateErr}</Alert>}
            </Paper>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress sx={{ color: 'primary.main' }} /></Box>
            ) : rows.length === 0 ? (
                <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '16px', p: 6, textAlign: 'center' }}>
                    <Box sx={{ width: 60, height: 60, borderRadius: '14px', background: 'linear-gradient(135deg, #b91c1c, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                        <FontAwesomeIcon icon={faTriangleExclamation} style={{ color: '#fff', fontSize: 24 }} />
                    </Box>
                    <Typography fontWeight={700} mb={0.5}>Sin piezas faltantes</Typography>
                    <Typography variant="body2" color="text.secondary">No se han registrado faltantes en el periodo seleccionado.</Typography>
                </Paper>
            ) : (
                <Grid container spacing={2.5}>
                    {rows.map((r) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={r.Id}>
                            <Paper elevation={0} sx={{
                                borderRadius: '16px',
                                background: cardBg,
                                border: `1px solid ${cardBorder}`,
                                borderTop: '4px solid #c62828',
                                transition: 'all 0.25s ease',
                                '&:hover': { transform: 'translateY(-4px)', boxShadow: isDark ? '0 12px 32px rgba(0,0,0,0.45)' : '0 12px 32px rgba(198,40,40,0.1)' },
                                overflow: 'hidden',
                            }}>
                                <Box sx={{ p: 2.5 }}>
                                    {/* Folio + Descuento chip */}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                        <Typography fontWeight={700} fontFamily="monospace" fontSize="0.82rem"
                                            sx={{ color: '#c62828', bgcolor: isDark ? 'rgba(198,40,40,0.15)' : 'rgba(198,40,40,0.08)', px: 1.2, py: 0.4, borderRadius: '6px', border: '1px solid rgba(198,40,40,0.3)' }}>
                                            {r.Folio || '—'}
                                        </Typography>
                                        <Chip label={r.AplicaDescuento == 1 ? 'Con desc.' : 'Sin desc.'} size="small"
                                            sx={{ fontWeight: 600, fontSize: '0.68rem', height: 22,
                                                bgcolor: r.AplicaDescuento == 1 ? (isDark ? 'rgba(21,101,192,0.2)' : 'rgba(21,101,192,0.1)') : (isDark ? 'rgba(100,100,100,0.2)' : 'rgba(0,0,0,0.05)'),
                                                color: r.AplicaDescuento == 1 ? (isDark ? '#42a5f5' : '#1565c0') : (isDark ? 'rgba(255,255,255,0.5)' : '#757575'),
                                                border: `1px solid ${r.AplicaDescuento == 1 ? 'rgba(21,101,192,0.3)' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)')}` }} />
                                    </Box>

                                    {/* Prenda + Corte */}
                                    <Typography fontWeight={700} fontSize="0.95rem" sx={{ lineHeight: 1.3, mb: 0.3 }}>{r.NombrePrenda || '—'}</Typography>
                                    <Typography variant="body2" color="text.secondary" mb={r.NombreProveedor ? 0.4 : 0.8}>{r.NombreCorte || '—'}</Typography>
                                    {r.NombreProveedor && (
                                        <Typography variant="caption" color="text.secondary" display="block" mb={0.8} sx={{ opacity: 0.7 }}>{r.NombreProveedor}</Typography>
                                    )}

                                    {/* Cantidad faltante (destacada) */}
                                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.8, mb: 1 }}>
                                        <Typography variant="h4" fontWeight={800} sx={{ color: '#c62828', lineHeight: 1 }}>{r.CantidadFaltante}</Typography>
                                        <Typography variant="body2" color="text.secondary" fontWeight={500}>piezas faltantes</Typography>
                                    </Box>

                                    {/* Motivo */}
                                    {r.Motivo && (
                                        <Typography variant="caption" color="text.secondary" display="block" mb={1}
                                            sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                                            {r.Motivo}
                                        </Typography>
                                    )}

                                    {/* Fecha */}
                                    <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
                                        {r.CreatedAt ? new Date(r.CreatedAt).toLocaleDateString('es-MX') : '—'}
                                    </Typography>

                                    <Box sx={{ height: '1px', bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', mb: 1.5 }} />

                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <Tooltip title="Eliminar">
                                            <IconButton size="small" onClick={() => { setConfirmId(r.Id); setConfirmCorteId(r.IdCorte); }}
                                                sx={{ color: '#c62828', bgcolor: 'rgba(198,40,40,0.06)', borderRadius: '8px', '&:hover': { bgcolor: 'rgba(198,40,40,0.14)' } }}>
                                                <FontAwesomeIcon icon={faTrash} style={{ fontSize: 13 }} />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
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
