import { yupResolver } from '@hookform/resolvers/yup';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { api } from '../../api/api';

interface Props {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
}

type AddForm = {
  gameName: string;
  tagLine: string;
  region: string;
  customNote: string;
};

const schema = yup.object({
  gameName: yup.string().required('Game name is required'),
  tagLine: yup.string().required('Tag line is required'),
  region: yup.string().required('Region is required'),
  customNote: yup.string().default(''),
});

const REGIONS = ['euw1', 'eun1', 'na1', 'kr', 'br1', 'la1', 'la2', 'oc1', 'tr1', 'ru', 'jp1'];

export const AddToWatchlistDialog = ({ open, onClose, onAdded }: Props) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AddForm>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: AddForm) => {
    setError(null);
    setLoading(true);
    try {
      // Step 1: search/sync player via Riot API
      const searchRes = await api.post(
        `/players/search?gameName=${encodeURIComponent(data.gameName)}&tagLine=${encodeURIComponent(data.tagLine)}&region=${data.region}`,
        {}
      );
      if (!searchRes.ok) {
        const err = await searchRes.json();
        setError(err.message ?? 'Player not found');
        return;
      }
      const player = await searchRes.json();

      // Step 2: add to watchlist
      const watchlistRes = await api.post('/watchlist', {
        trackedPlayerId: player.id,
        customNote: data.customNote,
      });
      if (!watchlistRes.ok) {
        const err = await watchlistRes.json();
        setError(err.message ?? 'Failed to add to watchlist');
        return;
      }

      reset();
      onAdded();
      onClose();
    } catch {
      setError('Cannot connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Player to Watchlist</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Game Name"
              placeholder="e.g. Faker"
              {...register('gameName')}
              error={!!errors.gameName}
              helperText={errors.gameName?.message}
            />
            <TextField
              label="Tag Line"
              placeholder="e.g. KR1"
              {...register('tagLine')}
              error={!!errors.tagLine}
              helperText={errors.tagLine?.message}
            />
            <TextField
              select
              label="Region"
              defaultValue=""
              {...register('region')}
              error={!!errors.region}
              helperText={errors.region?.message}
            >
              {REGIONS.map((r) => (
                <MenuItem key={r} value={r}>{r.toUpperCase()}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Note (optional)"
              placeholder="e.g. My main account"
              {...register('customNote')}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Add'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};


