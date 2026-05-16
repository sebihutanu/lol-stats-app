import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/api';
import { ConfirmDeleteDialog } from '../../components/ConfirmDeleteDialog';
import { AddToWatchlistDialog } from './AddToWatchlistDialog';
import { EditNoteDialog } from './EditNoteDialog';

interface TrackedPlayer {
  id: string;
  gameName: string;
  tagLine: string;
  region: string;
  summonerLevel: number | null;
  rankedTier: string | null;
  rankedRank: string | null;
  rankedLp: number | null;
}

interface WatchlistEntry {
  id: string;
  customNote: string;
  createdAt: string;
  trackedPlayer: TrackedPlayer;
}

interface PageResponse {
  content: WatchlistEntry[];
  totalElements: number;
  number: number;
  size: number;
}

export const WatchlistPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<PageResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [addOpen, setAddOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<WatchlistEntry | null>(null);
  const [deleteEntry, setDeleteEntry] = useState<WatchlistEntry | null>(null);

  const fetchWatchlist = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        size: String(pageSize),
      });
      if (search) params.append('search', search);
      const res = await api.get(`/watchlist?${params}`);
      if (!res.ok) throw new Error('Failed to load watchlist');
      const json: PageResponse = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message ?? 'Error loading watchlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, search]);

  const handleSearch = () => {
    setPage(0);
    setSearch(searchInput);
  };

  const handleDelete = async () => {
    if (!deleteEntry) return;
    await api.delete(`/watchlist/${deleteEntry.id}`);
    setDeleteEntry(null);
    fetchWatchlist();
  };

  const getRankLabel = (p: TrackedPlayer) => {
    if (!p.rankedTier) return '—';
    return `${p.rankedTier} ${p.rankedRank} (${p.rankedLp} LP)`;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">My Watchlist</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddOpen(true)}>
          Add Player
        </Button>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
        <TextField
          size="small"
          placeholder="Search by player name..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ width: 300 }}
        />
        <Button variant="outlined" onClick={handleSearch}>Search</Button>
        {search && (
          <Button onClick={() => { setSearch(''); setSearchInput(''); setPage(0); }}>
            Clear
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Player</strong></TableCell>
                  <TableCell><strong>Region</strong></TableCell>
                  <TableCell><strong>Level</strong></TableCell>
                  <TableCell><strong>Rank</strong></TableCell>
                  <TableCell><strong>Note</strong></TableCell>
                  <TableCell align="right"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.content.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No players in your watchlist yet.
                    </TableCell>
                  </TableRow>
                )}
                {data?.content.map((entry) => (
                  <TableRow key={entry.id} hover>
                    <TableCell
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/players/${entry.trackedPlayer.id}`)}
                    >
                      <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold', '&:hover': { textDecoration: 'underline' } }}>
                        {entry.trackedPlayer.gameName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        #{entry.trackedPlayer.tagLine}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={entry.trackedPlayer.region.toUpperCase()} size="small" />
                    </TableCell>
                    <TableCell>{entry.trackedPlayer.summonerLevel ?? '—'}</TableCell>
                    <TableCell>{getRankLabel(entry.trackedPlayer)}</TableCell>
                    <TableCell>{entry.customNote || <em style={{ color: '#aaa' }}>No note</em>}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit note">
                        <IconButton size="small" onClick={() => setEditEntry(entry)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Remove from watchlist">
                        <IconButton size="small" color="error" onClick={() => setDeleteEntry(entry)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={data?.totalElements ?? 0}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={pageSize}
            onRowsPerPageChange={(e) => { setPageSize(parseInt(e.target.value)); setPage(0); }}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Paper>
      )}

      {/* Dialogs */}
      <AddToWatchlistDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdded={fetchWatchlist}
      />
      {editEntry && (
        <EditNoteDialog
          open={!!editEntry}
          entryId={editEntry.id}
          currentNote={editEntry.customNote}
          onClose={() => setEditEntry(null)}
          onSaved={fetchWatchlist}
        />
      )}
      <ConfirmDeleteDialog
        open={!!deleteEntry}
        message={`Remove ${deleteEntry?.trackedPlayer.gameName}#${deleteEntry?.trackedPlayer.tagLine} from your watchlist?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteEntry(null)}
      />
    </Box>
  );
};
