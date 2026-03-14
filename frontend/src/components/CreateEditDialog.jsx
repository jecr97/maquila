import {
  Alert, Button, CircularProgress, Dialog, DialogActions, DialogContent,
  DialogTitle, IconButton, TextField, Typography,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPenToSquare, faTimes, faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';

/**
 * Dialog reutilizable para crear/editar registros simples
 * @param {boolean} open - Abre/cierra el dialog
 * @param {function} onClose - Callback cuando se cierra
 * @param {boolean} isNew - true para crear, false para editar
 * @param {object} form - Objeto con los datos del formulario
 * @param {function} setForm - Setter del form
 * @param {object} formErr - Errores de validación {campo: mensaje}
 * @param {function} onSave - Callback para guardar (valida y envía)
 * @param {boolean} saving - true mientras se envía
 * @param {string} dlgMsg - Mensaje de error en el dialog
 * @param {string} title - Título del dialog (ej: "Tipo de Prenda")
 * @param {array} fields - Array de campos [{name, label, multiline?, type?}, ...]
 * @param {object} sx - Estilos adicionales para DialogContent (opcional)
 */
export default function CreateEditDialog({
  open, onClose, isNew, form, setForm, formErr, onSave, saving, dlgMsg, title, fields, sx = {},
}) {
  const handleChange = (fieldName) => (e) => {
    setForm(prev => ({ ...prev, [fieldName]: e.target.value }));
    // Limpiar error al editar
    if (formErr[fieldName]) {
      // Aquí el padre debería limpiar el error, pero dejamos que el padre lo maneje
    }
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
        {isNew ? `Nuevo ${title}` : `Editar ${title}`}
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ ml: 'auto', color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#fff' } }}
        >
          <FontAwesomeIcon icon={faTimes} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 0, pb: 1, ...sx }}>
        {dlgMsg && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{dlgMsg}</Alert>}

        {fields.map(field => (
          <TextField
            key={field.name}
            fullWidth
            label={field.label}
            type={field.type || 'text'}
            value={form[field.name] || ''}
            onChange={handleChange(field.name)}
            error={!!formErr[field.name]}
            helperText={formErr[field.name]}
            multiline={field.multiline}
            rows={field.multiline ? field.rows || 2 : undefined}
            inputProps={field.inputProps}
            sx={{ mb: 2 }}
          />
        ))}
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
