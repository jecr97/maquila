import {
  Alert, Button, CircularProgress, Dialog, DialogActions, DialogContent,
  DialogTitle, FormControl, FormHelperText, IconButton, InputLabel, MenuItem,
  Select, TextField,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPenToSquare, faTimes, faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';

/**
 * Dialog para crear/editar precios con Selects para Prenda y Corte
 * @param {boolean} open
 * @param {function} onClose
 * @param {boolean} isNew
 * @param {object} form
 * @param {function} setForm
 * @param {object} formErr
 * @param {function} onSave
 * @param {boolean} saving
 * @param {string} dlgMsg
 * @param {array} prendas - Array de {Id, Nombre}
 * @param {array} cortes - Array de {Id, Nombre}
 */
export default function CreateEditPrecioDialog({
  open, onClose, isNew, form, setForm, formErr, onSave, saving, dlgMsg, prendas, cortes,
}) {
  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '16px', overflow: 'visible' } }}>
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #1565c0, #42a5f5)',
          color: '#fff',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          mb: 4,
        }}
      >
        <FontAwesomeIcon icon={isNew ? faPlus : faPenToSquare} />
        {isNew ? 'Nuevo Precio' : 'Editar Precio'}
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ ml: 'auto', color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#fff' } }}
        >
          <FontAwesomeIcon icon={faTimes} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 0, pb: 1 }}>
        {dlgMsg && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{dlgMsg}</Alert>}

        <FormControl fullWidth sx={{ mb: 2 }} error={!!formErr.IdTipoPrenda}>
          <InputLabel>Tipo de Prenda</InputLabel>
          <Select
            label="Tipo de Prenda"
            value={form.IdTipoPrenda}
            onChange={handleChange('IdTipoPrenda')}
          >
            {prendas.map(p => (
              <MenuItem key={p.Id} value={p.Id}>{p.Nombre}</MenuItem>
            ))}
          </Select>
          {formErr.IdTipoPrenda && <FormHelperText>{formErr.IdTipoPrenda}</FormHelperText>}
        </FormControl>

        <FormControl fullWidth sx={{ mb: 2 }} error={!!formErr.IdTipoCorte}>
          <InputLabel>Tipo de Corte</InputLabel>
          <Select
            label="Tipo de Corte"
            value={form.IdTipoCorte}
            onChange={handleChange('IdTipoCorte')}
          >
            {cortes.map(c => (
              <MenuItem key={c.Id} value={c.Id}>{c.Nombre}</MenuItem>
            ))}
          </Select>
          {formErr.IdTipoCorte && <FormHelperText>{formErr.IdTipoCorte}</FormHelperText>}
        </FormControl>

        <TextField
          fullWidth
          label="Precio (MXN)"
          type="number"
          value={form.Precio}
          onChange={handleChange('Precio')}
          inputProps={{ min: 0, step: '0.01' }}
          error={!!formErr.Precio}
          helperText={formErr.Precio}
          sx={{ mb: 1 }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ borderRadius: '8px', fontWeight: 600 }}
        >
          Cancelar
        </Button>
        <Button
          onClick={onSave}
          variant="contained"
          disabled={saving}
          startIcon={<FontAwesomeIcon icon={saving ? faSpinner : faSave} spin={saving} />}
          sx={{
            background: 'linear-gradient(135deg, #1565c0, #42a5f5)',
            borderRadius: '8px',
            fontWeight: 600,
            '&:hover': { background: 'linear-gradient(135deg, #0d47a1, #1565c0)' },
          }}
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
