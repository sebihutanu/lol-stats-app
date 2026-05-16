import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
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
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/api';
import { usePageTitle } from '../../hooks/usePageTitle';

const REGIONS = ['euw1', 'eun1', 'na1', 'kr', 'br1', 'la1', 'la2', 'oc1', 'tr1', 'ru', 'jp1'];

interface TrackedPlayer {
  id: string;
  gameName: string;
  tagLine: string;
  region: string;
  summonerLevel: number | null;
  rankedTier: string | null;
  rankedRank: string | null;
  rankedLp: number | null;
  lastSyncedAt: string | null;
}

interface PageResponse {
  content: TrackedPlayer[];
  totalElements: number;
  number: number;
  size: number;
}

export const PlayersPage = () => {
  usePageTitle('Players');
  const navigate = useNavigate();
  const [data, setData] = useState<PageResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Search via Riot API dialog
  const [riotDialogOpen, setRiotDialogOpen] = useState(false);
  const [riotForm, setRiotForm] = useState({ gameName: '', tagLine: '', region: 'eun1' });
  const [riotLoading, setRiotLoading] = useState(false);
  const [riotError, setRiotError] = useState<string | null>(null);

  const fetchPlayers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), size: String(pageSize) });
      if (search) params.append('search', search);
      const res = await api.get(`/players?${params}`);
      if (!res.ok) throw new Error('Failed to load players');
      setData(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlayers(); }, [page, pageSize, search]); // eslint-disable-line

  const handleSearch = () => { setPage(0); setSearch(searchInput); };

  const handleRiotSearch = async () => {
    setRiotError(null);
    setRiotLoading(true);
    try {
      const res = await api.post(
        `/players/search?gameName=${encodeURIComponent(riotForm.gameName)}&tagLine=${encodeURIComponent(riotForm.tagLine)}&region=${riotForm.region}`,
        {}
      );
      if (!res.ok) {
        const err = await res.json();
        setRiotError(err.message ?? 'Player not found');
        return;
      }
      const player = await res.json();
      setRiotDialogOpen(false);
      setRiotForm({ gameName: '', tagLine: '', region: 'eun1' });
      fetchPlayers();
      navigate(`/players/${player.id}`);
    } catch {
      setRiotError('Cannot connect to server.');
    } finally {
      setRiotLoading(false);
    }
  };

  const getRankLabel = (p: TrackedPlayer) =>
    p.rankedTier ? `${p.rankedTier} ${p.rankedRank} (${p.rankedLp} LP)` : 'Unranked';

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Tracked Players</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setRiotDialogOpen(true)}>
          Search Player
        </Button>
      </Box>

      {/* Search bar */}
      <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
        <TextField
          size="small"
          placeholder="Filter by name..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
              ),
            },
          }}
          sx={{ width: 300 }}
        />
        <Button variant="outlined" onClick={handleSearch}>Search</Button>
        {search && <Button onClick={() => { setSearch(''); setSearchInput(''); setPage(0); }}>Clear</Button>}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
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
                  <TableCell><strong>Last Synced</strong></TableCell>
                  <TableCell align="right"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.content.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">No tracked players yet. Use "Search Player" to add one.</TableCell>
                  </TableRow>
                )}
                {data?.content.map((p) => (
                  <TableRow key={p.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/players/${p.id}`)}>
                    <TableCell>
                      <strong>{p.gameName}</strong>
                      <Typography variant="caption" color="text.secondary"> #{p.tagLine}</Typography>
                    </TableCell>
                    <TableCell><Chip label={p.region.toUpperCase()} size="small" /></TableCell>
                    <TableCell>{p.summonerLevel ?? '—'}</TableCell>
                    <TableCell>{getRankLabel(p)}</TableCell>
                    <TableCell>
                      {p.lastSyncedAt ? new Date(p.lastSyncedAt).toLocaleDateString() : '—'}
                    </TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <Tooltip title="View details">
                        <IconButton size="small" onClick={() => navigate(`/players/${p.id}`)}>
                          <VisibilityIcon fontSize="small" />
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
            onPageChange={(_, v) => setPage(v)}
            rowsPerPage={pageSize}
            onRowsPerPageChange={(e) => { setPageSize(parseInt(e.target.value)); setPage(0); }}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Paper>
      )}

      {/* Riot Search dialog */}
      <Dialog open={riotDialogOpen} onClose={() => setRiotDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Search Player via Riot API</DialogTitle>
        <DialogContent>
          {riotError && <Alert severity="error" sx={{ mb: 2 }}>{riotError}</Alert>}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Game Name" placeholder="e.g. Faker" value={riotForm.gameName}
              onChange={(e) => setRiotForm({ ...riotForm, gameName: e.target.value })} />
            <TextField label="Tag Line" placeholder="e.g. KR1" value={riotForm.tagLine}
              onChange={(e) => setRiotForm({ ...riotForm, tagLine: e.target.value })} />
            <TextField select label="Region" value={riotForm.region}
              onChange={(e) => setRiotForm({ ...riotForm, region: e.target.value })}>
              {REGIONS.map((r) => <MenuItem key={r} value={r}>{r.toUpperCase()}</MenuItem>)}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRiotDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleRiotSearch} disabled={riotLoading}>
            {riotLoading ? <CircularProgress size={20} /> : 'Search & Track'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
