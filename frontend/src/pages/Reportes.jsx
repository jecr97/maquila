import { useState, useCallback, useEffect } from 'react';
import {
  Box, Button, Card, CardContent, Paper, Skeleton, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, Typography, Alert,
  FormControl, InputLabel, MenuItem, Select, useTheme,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartBar, faDownload, faLayerGroup, faGear, faCircleCheck,
  faTriangleExclamation, faDollarSign, faCubes, faExclamationCircle,
} from '@fortawesome/free-solid-svg-icons';

const API_URL = import.meta.env.VITE_API_URL;
const fmt = (v) => Number(v).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

const statCards = [
  { key: 'totalCortes', label: 'Total Cortes', icon: faLayerGroup, gradient: 'linear-gradient(135deg, #1565c0, #42a5f5)', shadow: 'rgba(21,101,192,0.25)' },
  { key: 'totalRegistrados', label: 'Registrados', icon: faLayerGroup, gradient: 'linear-gradient(135deg, #475569, #64748b)', shadow: 'rgba(71,85,105,0.25)' },
  { key: 'totalComenzados', label: 'En Producción', icon: faGear, gradient: 'linear-gradient(135deg, #b45309, #d97706)', shadow: 'rgba(180,83,9,0.25)' },
  { key: 'totalFinalizados', label: 'Finalizados', icon: faCircleCheck, gradient: 'linear-gradient(135deg, #047857, #10b981)', shadow: 'rgba(4,120,87,0.25)' },
  { key: 'piezasProducidas', label: 'Piezas Producidas', icon: faCubes, gradient: 'linear-gradient(135deg, #4338ca, #6366f1)', shadow: 'rgba(67,56,202,0.25)' },
  { key: 'totalFaltantes', label: 'Piezas Faltantes', icon: faTriangleExclamation, gradient: 'linear-gradient(135deg, #b91c1c, #ef4444)', shadow: 'rgba(185,28,28,0.25)' },
];

export default function Reportes() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const primaryMain = theme.palette.primary.main || '#1565c0';
  const primaryDark = theme.palette.primary.dark || '#0F3460';
  const muted = theme.palette.text.secondary;
  const bg = theme.palette.background.default;
  const errorColor = theme.palette.error.main;
  const dividerColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15, 52, 96, 0.08)';

  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [desde, setDesde]         = useState('');
  const [hasta, setHasta]         = useState('');
  const [dateErr, setDateErr]     = useState('');
  const [proveedores, setProveedores] = useState([]);
  const [idProveedor, setIdProveedor] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams();
      if (desde) params.set('desde', desde);
      if (hasta) params.set('hasta', hasta);
      if (idProveedor) params.set('idProveedor', idProveedor);
      const [r, rProv] = await Promise.all([
        fetch(`${API_URL}/api/reportes/resumen?${params}`),
        fetch(`${API_URL}/api/proveedores`),
      ]);
      const j = await r.json();
      if (j.success) setData(j.data);
      else setError('No se pudieron cargar los reportes.');
      const jProv = await rProv.json();
      if (jProv.success) setProveedores(jProv.data.filter(p => p.Status === 'Activo'));
    } catch { setError('Error de conexión.'); }
    setLoading(false);
  }, [desde, hasta, idProveedor]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleHastaChange = (val) => {
    if (val && !desde) { setDateErr('Primero selecciona la fecha inicial.'); return; }
    if (val && desde && val < desde) { setDateErr('La fecha final no puede ser anterior a la inicial.'); return; }
    setDateErr('');
    setHasta(val);
  };

  const handleDownload = () => {
    if (!data) return;
    const lines = [
      'INFORME DE PRODUCCIÓN — Sistema de Maquila de Ropa',
      `Periodo: ${desde || 'Inicio'} — ${hasta || 'Actual'}`,
      `Generado: ${new Date().toLocaleString('es-MX')}`,
      '',
      '=== RESUMEN ===',
      `Total de Cortes: ${data.totalCortes}`,
      `  Registrados: ${data.totalRegistrados}`,
      `  En Producción: ${data.totalComenzados}`,
      `  Finalizados: ${data.totalFinalizados}`,
      '',
      `Monto Total Ganado: ${fmt(data.montoTotal)}`,
      `Piezas Producidas: ${data.piezasProducidas}`,
      `Piezas Faltantes: ${data.totalFaltantes}`,
      '',
    ];
    if (data.faltantesDetalle?.length > 0) {
      lines.push('=== DETALLE DE PIEZAS FALTANTES ===');
      lines.push('Folio\t\tPrenda\t\tCorte\t\tFaltantes');
      data.faltantesDetalle.forEach(f => {
        lines.push(`${f.Folio}\t\t${f.NombrePrenda}\t\t${f.NombreCorte}\t\t${f.TotalFaltante}`);
      });
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `informe_produccion_${desde || 'inicio'}_${hasta || 'actual'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, backgroundColor: bg, minHeight: '100vh' }}>
      {/* Header premium */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', mb: 4, gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 56, height: 56, borderRadius: '14px', background: `linear-gradient(135deg, ${primaryDark} 0%, ${primaryMain} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(15, 52, 96, 0.25)' }}>
            <FontAwesomeIcon icon={faChartBar} style={{ color: '#fff', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, background: `linear-gradient(135deg, ${primaryDark} 0%, ${primaryMain} 100%)`, backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Reportes
            </Typography>
            <Typography variant="body2" sx={{ color: muted, fontWeight: 500 }}>
              Estadísticas de producción
            </Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<FontAwesomeIcon icon={faDownload} />} onClick={handleDownload} disabled={!data}
          sx={{ background: `linear-gradient(135deg, ${primaryDark}, ${primaryMain})`, borderRadius: '12px', fontWeight: 700, px: 3, py: 1.2, textTransform: 'none', boxShadow: '0 4px 14px rgba(15, 52, 96, 0.25)', '&:hover': { background: `linear-gradient(135deg, #0d47a1, ${primaryDark})`, boxShadow: '0 6px 20px rgba(15, 52, 96, 0.35)' } }}>
          Descargar Informe
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
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,1fr)', sm: 'repeat(3,1fr)', md: 'repeat(6,1fr)' }, gap: 2.5, mb: 3 }}>
          {[...Array(6)].map((_, i) => <Box key={i}><Skeleton variant="rounded" height={120} sx={{ borderRadius: '16px' }} /></Box>)}
        </Box>
      ) : data && (<>
        {/* Stat cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,1fr)', sm: 'repeat(3,1fr)', md: 'repeat(6,1fr)' }, gap: 2.5, mb: 3 }}>
          {statCards.map(({ key, label, icon, gradient, shadow }) => (
              <Card key={key} elevation={0} sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid', borderColor: dividerColor, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', '&:hover': { transform: 'translateY(-6px)', boxShadow: `0 12px 32px ${shadow}` } }}>
                <Box sx={{ height: 96, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', background: gradient }}>
                  <Box sx={{ position: 'absolute', right: -8, bottom: -8, opacity: 0.14, color: '#fff' }}>
                    <FontAwesomeIcon icon={icon} style={{ fontSize: 82 }} />
                  </Box>
                  <Box sx={{ width: 54, height: 54, borderRadius: '14px', bgcolor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', border: '1.5px solid rgba(255,255,255,0.35)', zIndex: 1 }}>
                    <FontAwesomeIcon icon={icon} style={{ color: '#fff', fontSize: 22 }} />
                  </Box>
                </Box>
                <CardContent sx={{ py: 2.5, px: 2, textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight={800} sx={{ color: primaryDark, lineHeight: 1.1 }}>{data[key]}</Typography>
                  <Typography variant="caption" sx={{ color: muted, fontWeight: 600, mt: 0.5, display: 'block' }}>{label}</Typography>
                </CardContent>
              </Card>
            ))}
          </Box>

        {/* Monto total */}
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'rgba(4,120,87,0.2)', borderRadius: '16px', p: 3, mb: 3, background: isDark ? 'rgba(4,120,87,0.06)' : 'rgba(4,120,87,0.03)', position: 'relative', overflow: 'hidden', '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #047857, #10b981)' } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 56, height: 56, borderRadius: '14px', background: 'linear-gradient(135deg, #047857, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(4, 120, 87, 0.25)' }}>
              <FontAwesomeIcon icon={faDollarSign} style={{ color: '#fff', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Monto Total Ganado</Typography>
              <Typography variant="h4" fontWeight={800} sx={{ color: '#2e7d32', lineHeight: 1.2 }}>{fmt(data.montoTotal)}</Typography>
            </Box>
          </Box>
        </Paper>

        {/* Tabla faltantes detalle */}
        {data.faltantesDetalle?.length > 0 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: primaryDark, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <FontAwesomeIcon icon={faTriangleExclamation} style={{ color: '#c62828', fontSize: 18 }} />
              Detalle de Piezas Faltantes
            </Typography>
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: dividerColor, borderRadius: '16px', overflowX: 'auto', overflow: 'hidden' }}>
              <Table sx={{ minWidth: 500 }}>
                <TableHead>
                  <TableRow sx={{ background: `linear-gradient(135deg, ${primaryDark}, ${primaryMain})` }}>
                    {['Folio', 'Prenda', 'Corte', 'Total Faltantes'].map(h => (
                      <TableCell key={h} sx={{ color: '#fff', fontWeight: 700, fontSize: '0.82rem', py: 2, borderBottom: 'none' }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.faltantesDetalle.map((f, i) => (
                    <TableRow key={i} sx={{ '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(15, 52, 96, 0.03)' }, '&:last-child td': { borderBottom: 'none' } }}>
                      <TableCell sx={{ fontWeight: 700, color: primaryMain, fontFamily: 'monospace' }}>{f.Folio}</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: primaryDark }}>{f.NombrePrenda || '—'}</TableCell>
                      <TableCell sx={{ color: muted }}>{f.NombreCorte || '—'}</TableCell>
                      <TableCell>
                        <Typography fontWeight={800} sx={{ color: '#c62828', bgcolor: 'rgba(198,40,40,0.08)', display: 'inline-block', px: 1.5, py: 0.3, borderRadius: '6px', fontSize: '0.9rem' }}>{f.TotalFaltante}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </>)}
    </Box>
  );
}
