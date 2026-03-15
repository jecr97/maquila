import { useState, useCallback, useEffect } from 'react';
import {
  Box, Button, Card, CardContent, Paper, Skeleton, Typography, Alert,
  FormControl, InputLabel, MenuItem, Select, useTheme, Divider, Chip, TextField
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartBar, faDownload, faLayerGroup, faGear, faCircleCheck,
  faTriangleExclamation, faDollarSign, faCubes, faExclamationCircle,
  faListCheck, faAddressCard, faScissors
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

  const today = new Date().toISOString().split('T')[0];

  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [desde, setDesde]         = useState(today);
  const [hasta, setHasta]         = useState(today);
  const [dateErr, setDateErr]     = useState('');
  const [proveedores, setProveedores] = useState([]);
  const [idProveedor, setIdProveedor] = useState('');

  const loadData = useCallback(async () => {
    // Solo consultar si hay 'desde' y 'hasta'
    if (!desde || !hasta) {
      // No hay rango completo: no hacemos la petición y desactivamos el loader
      setLoading(false);
      return;
    }

    setLoading(true); setError('');
    try {
      const params = new URLSearchParams();
      params.set('desde', desde);
      params.set('hasta', hasta);
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

  useEffect(() => {
    // Carga inicial de proveedores siempre necesaria
    fetch(`${API_URL}/api/proveedores`)
      .then(r => r.json())
      .then(j => { if (j.success) setProveedores(j.data.filter(p => p.Status === 'Activo')); })
      .catch(() => {});
  }, []);

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
      ) : !desde || !hasta ? (
        <Paper elevation={0} sx={{ textAlign: 'center', py: 10, bgcolor: 'rgba(15, 52, 96, 0.04)', borderRadius: '16px', border: '2px dashed rgba(15, 52, 96, 0.1)' }}>
          <FontAwesomeIcon icon={faChartBar} style={{ fontSize: 48, color: '#94a3b8', marginBottom: 16, opacity: 0.5 }} />
          <Typography variant="h6" fontWeight={700} color="primary.main">Selecciona un rango de fechas</Typography>
          <Typography variant="body2" color="text.secondary">Ingresa la fecha inicial y final para generar los informes correspondientes.</Typography>
        </Paper>
      ) : data && (<>
        {/* Stat cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,1fr)', sm: 'repeat(3,1fr)', md: 'repeat(6,1fr)' }, gap: 2.5, mb: 3 }}>
          {statCards.map(({ key, label, icon, gradient, shadow }) => (
            <Card key={key} elevation={0} sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid', borderColor: dividerColor, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', '&:hover': { transform: 'translateY(-6px)', boxShadow: `0 12px 32px ${shadow}` } }}>
              <Box sx={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', background: gradient }}>
                <Box sx={{ position: 'absolute', right: -4, bottom: -4, opacity: 0.15, color: '#fff' }}>
                  <FontAwesomeIcon icon={icon} style={{ fontSize: 40 }} />
                </Box>
                <FontAwesomeIcon icon={icon} style={{ color: '#fff', fontSize: 18, zIndex: 1 }} />
              </Box>
              <CardContent sx={{ py: 2, px: 2, textAlign: 'center' }}>
                <Typography variant="h5" fontWeight={900} sx={{ color: primaryDark, lineHeight: 1 }}>{data[key]}</Typography>
                <Typography variant="caption" sx={{ color: muted, fontWeight: 700, mt: 0.5, display: 'block', textTransform: 'uppercase', fontSize: '0.6rem' }}>{label}</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Monto total destacado */}
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'rgba(4,120,87,0.2)', borderRadius: '16px', p: 2.5, mb: 4, background: isDark ? 'linear-gradient(135deg, rgba(4,120,87,0.1) 0%, rgba(16,185,129,0.05) 100%)' : 'rgba(4,120,87,0.03)', display: 'flex', alignItems: 'center', gap: 2.5 }}>
          <Box sx={{ width: 50, height: 50, borderRadius: '14px', background: 'linear-gradient(135deg, #047857, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(4, 120, 87, 0.2)' }}>
            <FontAwesomeIcon icon={faDollarSign} style={{ color: '#fff', fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: isDark ? '#10b981' : '#047857', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>Total Estimado General</Typography>
            <Typography variant="h4" fontWeight={900} sx={{ color: '#2e7d32', lineHeight: 1.1 }}>{fmt(data.montoTotal)}</Typography>
          </Box>
        </Paper>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
          {/* Box 1: Tipos de Corte */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', border: '1px solid', borderColor: dividerColor, boxShadow: '0 10px 30px rgba(0,0,0,0.04)', bgcolor: 'background.paper' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Box sx={{ width: 42, height: 42, borderRadius: '11px', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <FontAwesomeIcon icon={faScissors} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={800} color="primary.main">Desglose por Corte</Typography>
                <Typography variant="caption" color="text.secondary">Distribución de tipos de corte realizados</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {(data.cortesPorTipo || []).map((t, idx) => (
                <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderRadius: '12px', bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(15, 52, 96, 0.02)', border: '1px solid transparent', '&:hover': { borderColor: 'primary.light', bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15, 52, 96, 0.04)' } }}>
                  <Typography variant="body2" fontWeight={700} color="text.primary">{t.NombreCorte}</Typography>
                  <Chip label={`${t.TotalPiezas} pzas`} size="small" sx={{ fontWeight: 800, bgcolor: 'primary.main', color: '#fff' }} />
                </Box>
              ))}
              {(!data.cortesPorTipo || data.cortesPorTipo.length === 0) && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', fontStyle: 'italic', py: 2 }}>No hay datos descriptivos para mostrar.</Typography>
              )}
            </Box>
          </Paper>

          {/* Box 2: Faltantes */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', border: '1px solid', borderColor: 'rgba(198,40,40,0.1)', boxShadow: '0 10px 30px rgba(198,40,40,0.04)', bgcolor: 'background.paper' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Box sx={{ width: 42, height: 42, borderRadius: '11px', bgcolor: '#c62828', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <FontAwesomeIcon icon={faTriangleExclamation} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={800} color="#c62828">Piezas Faltantes</Typography>
                <Typography variant="caption" color="text.secondary">Incidencias y faltantes reportados</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {(data.faltantesDetalle || []).map((f, idx) => (
                <Box key={idx} sx={{ p: 2, borderRadius: '12px', bgcolor: 'rgba(198,40,40,0.02)', border: '1px solid rgba(198,40,40,0.1)' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" fontWeight={800} color="#c62828">{f.NombreCorte}</Typography>
                    <Typography variant="body2" fontWeight={900} sx={{ color: '#c62828' }}>{f.TotalFaltante} pzas</Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: muted, fontWeight: 600 }}>{f.NombrePrenda} · Folio: {f.Folio}</Typography>
                </Box>
              ))}
              {(!data.faltantesDetalle || data.faltantesDetalle.length === 0) && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', fontStyle: 'italic', py: 2 }}>Sin faltantes registrados en este periodo.</Typography>
              )}
            </Box>
          </Paper>

          {/* Box 3: Proveedores */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', border: '1px solid', borderColor: dividerColor, boxShadow: '0 10px 30px rgba(0,0,0,0.04)', bgcolor: 'background.paper', gridColumn: { md: '1 / span 2' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Box sx={{ width: 42, height: 42, borderRadius: '11px', bgcolor: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <FontAwesomeIcon icon={faAddressCard} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={800} color="#b45309">Producción por Proveedor</Typography>
                <Typography variant="caption" color="text.secondary">Cortes asignados y piezas procesadas</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 2 }}>
              {(data.cortesPorProveedor || []).map((p, idx) => (
                <Box key={idx} sx={{ p: 2, borderRadius: '16px', border: '1px solid', borderColor: dividerColor, bgcolor: isDark ? 'rgba(255,255,255,0.01)' : '#fff' }}>
                  <Typography variant="subtitle2" fontWeight={800} color="text.primary" sx={{ mb: 1.5, borderBottom: '1px solid', borderColor: dividerColor, pb: 1 }}>{p.NombreProveedor}</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" fontWeight={600} color="text.secondary">Número de Cortes</Typography>
                    <Typography variant="body2" fontWeight={800}>{p.TotalCortes}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" fontWeight={600} color="text.secondary">Total Piezas</Typography>
                    <Typography variant="body2" fontWeight={800} color="primary.main">{p.TotalPiezas}</Typography>
                  </Box>
                </Box>
              ))}
              {(!data.cortesPorProveedor || data.cortesPorProveedor.length === 0) && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', fontStyle: 'italic', py: 2, gridColumn: '1 / -1' }}>No se encontraron cortes para los criterios seleccionados.</Typography>
              )}
            </Box>
          </Paper>
        </Box>
      </>)}
    </Box>
  );
}
 