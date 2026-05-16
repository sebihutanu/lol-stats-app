import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { api } from '../../api/api';
import { usePageTitle } from '../../hooks/usePageTitle';

const CATEGORIES = ['Bug', 'Feature Request', 'General'];

const RATINGS = [
  { value: 1, label: '1 - Very Bad' },
  { value: 2, label: '2 - Bad' },
  { value: 3, label: '3 - Neutral' },
  { value: 4, label: '4 - Good' },
  { value: 5, label: '5 - Excellent' },
];

interface FormState {
  category: string;
  rating: string;
  allowContact: boolean;
  message: string;
}

interface FormErrors {
  category?: string;
  rating?: string;
  message?: string;
}

const defaultForm: FormState = {
  category: '',
  rating: '',
  allowContact: false,
  message: '',
};

export const FeedbackPage = () => {
  usePageTitle('Feedback');
  const [form, setForm] = useState<FormState>(defaultForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.category) newErrors.category = 'Please select a category.';
    if (!form.rating) newErrors.rating = 'Please select a rating.';
    if (!form.message.trim()) newErrors.message = 'Message cannot be empty.';
    else if (form.message.trim().length < 10) newErrors.message = 'Message must be at least 10 characters.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await api.post('/feedback', {
        category: form.category,
        rating: parseInt(form.rating),
        allowContact: form.allowContact,
        message: form.message.trim(),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? 'Failed to submit feedback.');
      }

      setForm(defaultForm);
      setErrors({});
      setSuccessOpen(true);
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Send Feedback
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        We'd love to hear what you think. Fill out the form below and we'll take note.
      </Typography>

      <Paper sx={{ p: 4 }}>
        <Box component="form" onSubmit={handleSubmit} noValidate>

          {/* Category - Select */}
          <FormControl fullWidth error={!!errors.category} sx={{ mb: 3 }}>
            <InputLabel id="category-label">Feedback Category *</InputLabel>
            <Select
              labelId="category-label"
              label="Feedback Category *"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
            {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
          </FormControl>

          <Divider sx={{ mb: 3 }} />

          {/* Rating - Radio */}
          <FormControl error={!!errors.rating} sx={{ mb: 3 }} component="fieldset">
            <FormLabel component="legend" sx={{ fontWeight: 'bold', mb: 1 }}>
              Rating *
            </FormLabel>
            <RadioGroup
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: e.target.value })}
            >
              {RATINGS.map((r) => (
                <FormControlLabel
                  key={r.value}
                  value={String(r.value)}
                  control={<Radio />}
                  label={r.label}
                />
              ))}
            </RadioGroup>
            {errors.rating && <FormHelperText>{errors.rating}</FormHelperText>}
          </FormControl>

          <Divider sx={{ mb: 3 }} />

          {/* Message - Textarea */}
          <TextField
            fullWidth
            multiline
            rows={5}
            label="Message *"
            placeholder="Describe your feedback in detail..."
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            error={!!errors.message}
            helperText={errors.message ?? `${form.message.length} characters`}
            sx={{ mb: 3 }}
          />

          {/* Allow contact - Checkbox */}
          <FormControlLabel
            control={
              <Checkbox
                checked={form.allowContact}
                onChange={(e) => setForm({ ...form, allowContact: e.target.checked })}
              />
            }
            label="I allow the team to contact me regarding this feedback"
            sx={{ mb: 3, display: 'block' }}
          />

          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={18} /> : <CheckCircleOutlineIcon />}
          >
            {submitting ? 'Submitting…' : 'Submit Feedback'}
          </Button>
        </Box>
      </Paper>

      {/* Success notification */}
      <Snackbar
        open={successOpen}
        autoHideDuration={4000}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccessOpen(false)} severity="success" sx={{ width: '100%' }}>
          Feedback submitted successfully! Thank you 🎉
        </Alert>
      </Snackbar>
    </Box>
  );
};
