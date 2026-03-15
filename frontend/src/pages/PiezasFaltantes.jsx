import { useState, useEffect, useCallback } from 'react';
import {
    Box, Button, Checkbox, Chip, Card, CardContent, CardActions, Dialog, DialogActions,
    DialogContent, DialogTitle, Divider, FormControl, FormControlLabel, IconButton,
    InputLabel, MenuItem, Paper, Select, Skeleton, TextField, Tooltip, Typography, Alert,
    useTheme,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTriangleExclamation, faPlus, faTrash, faTimes, faSave, faSpinner,
    faExclamationCircle,
} from '@fortawesome/free-solid-svg-icons';

const API_URL = import.meta.env.VITE_API_URL;

export default function PiezasFaltantes() {
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
    const dangerMain = '#c62828';
    const dangerDark = '#b71c1c';

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
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, backgroundColor: bg, minHeight: '100vh' }}>
            {/* Header premium */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', mb: 4, gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ width: 56, height: 56, borderRadius: '14px', background: `linear-gradient(135deg, ${dangerDark} 0%, #ef4444 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(198, 40, 40, 0.25)' }}>
                        <FontAwesomeIcon icon={faTriangleExclamation} style={{ color: '#fff', fontSize: 24 }} />
                    </Box>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 800, background: `linear-gradient(135deg, ${dangerDark} 0%, #ef4444 100%)`, backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Piezas Faltantes
                        </Typography>
                        <Typography variant="body2" sx={{ color: muted, fontWeight: 500 }}>
                            {rows.length} registro{rows.length !== 1 ? 's' : ''} encontrado{rows.length !== 1 ? 's' : ''}
                        </Typography>
                    </Box>
                </Box>
                <Button variant="contained" startIcon={<FontAwesomeIcon icon={faPlus} />} onClick={openNew}
                    sx={{ background: `linear-gradient(135deg, ${primaryDark}, ${primaryMain})`, borderRadius: '12px', fontWeight: 700, px: 3, py: 1.2, textTransform: 'none', boxShadow: '0 4px 14px rgba(15, 52, 96, 0.25)', '&:hover': { background: `linear-gradient(135deg, #0d47a1, ${primaryDark})`, boxShadow: '0 6px 20px rgba(15, 52, 96, 0.35)' } }}>
                    Registrar Faltantes
                </Button>
            </Box>

            {/* Filters */}
            <Paper elevation={0} sx={{ border: '1px solid', borderColor: dividerColor, borderRadius: '14px', mb: 3, p: 2, backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(15, 52, 96, 0.02)' }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    <TextField label="Desde" type="date" size="small" value={desde}
                        onChange={e => { setDesde(e.target.value); setDateErr(''); if (hasta && e.target.value > hasta) setHasta(''); }}
                        InputLabelProps={{ shrink: true }} sx={{ width: 170, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
                    <TextField label="Hasta" type="date" size="small" value={hasta}
                        onChange={e => handleHastaChange(e.target.value)}
                        InputLabelProps={{ shrink: true }} sx={{ width: 170, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                        inputProps={{ min: desde || undefined }} />
                    <FormControl size="small" sx={{ minWidth: 200, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}>
                        <InputLabel>Proveedor</InputLabel>
                        <Select label="Proveedor" value={idProveedor} onChange={e => setIdProveedor(e.target.value)}>
                            <MenuItem value="">Todos</MenuItem>
                            {proveedores.map(p => <MenuItem key={p.Id} value={p.Id}>{p.Nombre}</MenuItem>)}
                        </Select>
                    </FormControl>
                    {(desde || hasta || idProveedor) && <Button size="small" onClick={() => { setDesde(''); setHasta(''); setIdProveedor(''); setDateErr(''); }} sx={{ fontWeight: 700, color: primaryDark, borderRadius: '8px' }}>Limpiar</Button>}
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
                    {[...Array(8)].map((_, i) => <Box key={i}><Skeleton variant="rounded" height={280} sx={{ borderRadius: '16px' }} /></Box>)}
                </Box>
            ) : rows.length === 0 ? (
                <Paper elevation={0} sx={{ textAlign: 'center', py: 10, backgroundColor: 'rgba(198, 40, 40, 0.04)', borderRadius: '16px', border: '2px dashed rgba(198, 40, 40, 0.15)' }}>
                    <Box sx={{ color: '#ef9a9a', mb: 2 }}><FontAwesomeIcon icon={faTriangleExclamation} style={{ fontSize: 56, opacity: 0.3 }} /></Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: dangerMain, mb: 1 }}>Sin piezas faltantes</Typography>
                    <Typography variant="body2" sx={{ color: muted }}>No se han registrado faltantes en el periodo seleccionado.</Typography>
                </Paper>
            ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', md: 'repeat(3,1fr)', xl: 'repeat(4,1fr)' }, gap: 3 }}>
                    {rows.map((r) => (
                        <Card key={r.Id} elevation={0} sx={{
                            borderRadius: '16px', border: '1px solid', borderColor: cardBorderColor,
                            backgroundColor: cardBg, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', overflow: 'hidden', position: 'relative',
                            '&:hover': { transform: 'translateY(-8px)', boxShadow: isDark ? '0 16px 48px rgba(0,0,0,0.6)' : '0 16px 48px rgba(198, 40, 40, 0.12)' },
                        }}>
                            <Box sx={{ height: 96, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', background: cardGradient(r.Folio || r.NombrePrenda || '') }}>
                                <Box sx={{ position: 'absolute', right: -8, bottom: -8, opacity: 0.14, color: '#fff' }}>
                                    <FontAwesomeIcon icon={faTriangleExclamation} style={{ fontSize: 82 }} />
                                </Box>
                                <Box sx={{ width: 54, height: 54, borderRadius: '14px', bgcolor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', border: '1.5px solid rgba(255,255,255,0.35)', zIndex: 1 }}>
                                    <FontAwesomeIcon icon={faTriangleExclamation} style={{ color: '#fff', fontSize: 26 }} />
                                </Box>
                            </Box>

                            <CardContent sx={{ pb: 1, pt: 2 }}>
                                {/* Folio + Descuento chip */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                    <Typography fontWeight={800} fontFamily="monospace" fontSize="0.85rem"
                                        sx={{ color: dangerMain, bgcolor: isDark ? 'rgba(198,40,40,0.15)' : 'rgba(198,40,40,0.08)', px: 1.2, py: 0.4, borderRadius: '8px', border: '1px solid rgba(198,40,40,0.3)' }}>
                                        {r.Folio || '—'}
                                    </Typography>
                                    <Chip label={r.AplicaDescuento == 1 ? 'Con desc.' : 'Sin desc.'} size="small"
                                        icon={<Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: r.AplicaDescuento == 1 ? primaryMain : '#757575', display: 'inline-block', mr: 0.5 }} />}
                                        sx={{ fontWeight: 700, fontSize: '0.72rem',
                                            bgcolor: r.AplicaDescuento == 1 ? (isDark ? 'rgba(21,101,192,0.2)' : 'rgba(21,101,192,0.1)') : (isDark ? 'rgba(100,100,100,0.2)' : 'rgba(0,0,0,0.05)'),
                                            color: r.AplicaDescuento == 1 ? (isDark ? '#42a5f5' : primaryMain) : (isDark ? 'rgba(255,255,255,0.5)' : '#757575'),
                                            border: `1.5px solid ${r.AplicaDescuento == 1 ? 'rgba(21,101,192,0.3)' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)')}` }} />
                                </Box>

                                {/* Prenda + Corte */}
                                <Typography variant="h6" sx={{ fontWeight: 700, background: cardGradient(r.Folio || r.NombrePrenda || ''), backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.3, mb: 0.3, fontSize: '1rem' }}>{r.NombrePrenda || '—'}</Typography>
                                <Typography variant="body2" sx={{ color: muted, fontWeight: 500, fontSize: '0.85rem', mb: r.NombreProveedor ? 0.4 : 1 }}>{r.NombreCorte || '—'}</Typography>
                                {r.NombreProveedor && (
                                    <Typography variant="caption" sx={{ color: muted, display: 'block', mb: 1, opacity: 0.7 }}>{r.NombreProveedor}</Typography>
                                )}

                                {/* Cantidad faltante (destacada) */}
                                <Box sx={{ bgcolor: isDark ? 'rgba(198,40,40,0.08)' : 'rgba(198,40,40,0.04)', borderRadius: '10px', p: 1.2, mb: 1.2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.8 }}>
                                        <Typography variant="h4" fontWeight={800} sx={{ color: dangerMain, lineHeight: 1 }}>{r.CantidadFaltante}</Typography>
                                        <Typography variant="body2" sx={{ color: muted, fontWeight: 500 }}>piezas faltantes</Typography>
                                    </Box>
                                </Box>

                                {/* Motivo */}
                                {r.Motivo && (
                                    <Typography variant="caption" sx={{ color: muted, display: 'block', mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                                        {r.Motivo}
                                    </Typography>
                                )}

                                {/* Fecha */}
                                <Typography variant="caption" sx={{ color: muted, opacity: 0.7 }}>
                                    {r.CreatedAt ? new Date(r.CreatedAt).toLocaleDateString('es-MX') : '—'}
                                </Typography>
                            </CardContent>
                            <Divider sx={{ borderColor: dividerColor }} />
                            <CardActions sx={{ justifyContent: 'center', py: 1.5, px: 1 }}>
                                <Tooltip title="Eliminar registro">
                                    <Button size="small" onClick={() => { setConfirmId(r.Id); setConfirmCorteId(r.IdCorte); }}
                                        startIcon={<FontAwesomeIcon icon={faTrash} style={{ fontSize: 11 }} />}
                                        sx={{ color: dangerMain, bgcolor: 'rgba(198,40,40,0.06)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'capitalize', borderRadius: '8px', flex: 1, transition: 'all 0.2s', '&:hover': { bgcolor: 'rgba(198,40,40,0.14)', transform: 'translateY(-2px)' } }}>
                                        Eliminar
                                    </Button>
                                </Tooltip>
                            </CardActions>
                        </Card>
                    ))}
                </Box>
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
