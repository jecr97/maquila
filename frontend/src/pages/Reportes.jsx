import { useState, useCallback, useEffect } from 'react';
import {
  Box, Button, Card, CardContent, Grid, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, Typography, Alert,
  CircularProgress, FormControl, InputLabel, MenuItem, Select,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartBar, faDownload, faLayerGroup, faGear, faCircleCheck,
  faTriangleExclamation, faDollarSign, faCubes,
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
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [desde, setDesde]         = useState('');
  const [hasta, setHasta]         = useState('');
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
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 48, height: 48, borderRadius: '12px', background: 'linear-gradient(135deg, #1565c0, #42a5f5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FontAwesomeIcon icon={faChartBar} style={{ color: '#fff', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700} color="primary.main">Reportes</Typography>
            <Typography variant="body2" color="text.secondary">Estadísticas de producción</Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<FontAwesomeIcon icon={faDownload} />} onClick={handleDownload} disabled={!data}
          sx={{ background: 'linear-gradient(135deg, #1565c0, #42a5f5)', borderRadius: '10px', fontWeight: 600, px: 3, '&:hover': { background: 'linear-gradient(135deg, #0d47a1, #1565c0)' } }}>
          Descargar Informe
        </Button>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px', mb: 3, p: 2 }}>
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
      ) : data && (<>
        {/* Stat cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {statCards.map(({ key, label, icon, gradient, shadow }) => (
            <Grid item xs={6} sm={4} md={2} key={key}>
              <Card elevation={0} sx={{ borderRadius: '14px', overflow: 'hidden', boxShadow: `0 4px 16px ${shadow}`, transition: '0.3s', '&:hover': { transform: 'translateY(-3px)', boxShadow: `0 8px 28px ${shadow}` } }}>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ background: gradient, p: 2, textAlign: 'center' }}>
                    <FontAwesomeIcon icon={icon} style={{ color: '#fff', fontSize: 22, marginBottom: 6 }} />
                    <Typography variant="h4" fontWeight={800} color="#fff" lineHeight={1}>{data[key]}</Typography>
                    <Typography variant="caption" color="rgba(255,255,255,0.8)" fontWeight={500}>{label}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Monto total */}
        <Paper elevation={0} sx={{ border: '1px solid rgba(46,125,50,0.2)', borderRadius: '14px', p: 3, mb: 3, background: 'rgba(46,125,50,0.03)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 52, height: 52, borderRadius: '12px', background: 'linear-gradient(135deg, #047857, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FontAwesomeIcon icon={faDollarSign} style={{ color: '#fff', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={500}>Monto Total Ganado</Typography>
              <Typography variant="h4" fontWeight={800} color="#2e7d32">{fmt(data.montoTotal)}</Typography>
            </Box>
          </Box>
        </Paper>

        {/* Tabla faltantes detalle */}
        {data.faltantesDetalle?.length > 0 && (
          <Box>
            <Typography variant="h6" fontWeight={700} color="primary.main" mb={1.5}>Detalle de Piezas Faltantes</Typography>
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '14px', overflowX: 'auto' }}>
              <Table sx={{ minWidth: 500 }}>
                <TableHead>
                  <TableRow sx={{ background: 'linear-gradient(135deg, #1565c0, #42a5f5)' }}>
                    {['Folio', 'Prenda', 'Corte', 'Total Faltantes'].map(h => (
                      <TableCell key={h} sx={{ color: '#fff', fontWeight: 700, fontSize: '0.82rem', py: 1.8 }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.faltantesDetalle.map((f, i) => (
                    <TableRow key={i} sx={{ '&:hover': { bgcolor: 'rgba(21,101,192,0.03)' } }}>
                      <TableCell sx={{ fontWeight: 700, color: 'primary.main', fontFamily: 'monospace' }}>{f.Folio}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{f.NombrePrenda || '—'}</TableCell>
                      <TableCell>{f.NombreCorte || '—'}</TableCell>
                      <TableCell>
                        <Typography fontWeight={700} color="#c62828">{f.TotalFaltante}</Typography>
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
