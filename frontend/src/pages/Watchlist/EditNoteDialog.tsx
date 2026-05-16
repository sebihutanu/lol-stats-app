import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { api } from '../../api/api';

interface Props {
  open: boolean;
  entryId: string;
  currentNote: string;
  onClose: () => void;
  onSaved: () => void;
}

export const EditNoteDialog = ({ open, entryId, currentNote, onClose, onSaved }: Props) => {
  const [note, setNote] = useState(currentNote);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setNote(currentNote);
  }, [currentNote]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put(`/watchlist/${entryId}`, { customNote: note });
      onSaved();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Edit Note</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={20} /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

