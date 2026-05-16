import SearchIcon from '@mui/icons-material/Search';
import {
  Alert,
  Avatar,
  Box,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { api } from '../../api/api';

interface WatchlistPlayer {
  id: string;
  trackedPlayerId: string;
  playerName: string;
  region: string;
}

interface MatchSnapshot {
  id: string;
  riotMatchId: string;
  championName: string;
  kills: number;
  deaths: number;
  assists: number;
  win: boolean;
  queueType: string;
  playedAt: string;
}

interface PageResponse {
  content: MatchSnapshot[];
  totalElements: number;
  number: number;
  size: number;
}

const DDRAGON = 'https://ddragon.leagueoflegends.com/cdn/14.24.1';

export const MatchesPage = () => {
  const [watchlist, setWatchlist] = useState<WatchlistPlayer[]>([]);
  const [watchlistLoading, setWatchlistLoading] = useState(true);

  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [resultFilter, setResultFilter] = useState<'ALL' | 'WIN' | 'LOSS'>('ALL');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [matches, setMatches] = useState<PageResponse | null>(null);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load watchlist to populate player selector
  useEffect(() => {
    const fetchWatchlist = async () => {
      setWatchlistLoading(true);
      try {
        const res = await api.get('/watchlist?size=100');
        if (res.ok) {
          const data = await res.json();
          const items: WatchlistPlayer[] = (data.content ?? []).map((w: any) => ({
            id: w.id,
            trackedPlayerId: w.trackedPlayer?.id ?? w.id,
            playerName: w.trackedPlayer?.gameName ?? 'Unknown',
            region: w.trackedPlayer?.region ?? '',
          }));
          setWatchlist(items);
          if (items.length > 0) {
            setSelectedPlayerId(items[0].trackedPlayerId);
          }
        }
      } finally {
        setWatchlistLoading(false);
      }
    };
    fetchWatchlist();
  }, []);

  // Fetch matches whenever filters change
  useEffect(() => {
    if (!selectedPlayerId) return;
    const fetchMatches = async () => {
      setMatchesLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: String(page),
          size: String(pageSize),
        });
        if (search) params.set('search', search);
        if (resultFilter !== 'ALL') params.set('result', resultFilter);

        const res = await api.get(`/players/${selectedPlayerId}/matches?${params}`);
        if (!res.ok) throw new Error('Failed to load matches');
        setMatches(await res.json());
      } catch (e: any) {
        setError(e.message);
      } finally {
        setMatchesLoading(false);
      }
    };
    fetchMatches();
  }, [selectedPlayerId, search, resultFilter, page, pageSize]);

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(0);
  };

  const handleResultChange = (value: 'ALL' | 'WIN' | 'LOSS') => {
    setResultFilter(value);
    setPage(0);
  };

  const handlePlayerChange = (playerId: string) => {
    setSelectedPlayerId(playerId);
    setSearch('');
    setSearchInput('');
    setResultFilter('ALL');
    setPage(0);
  };

  const currentPlayer = watchlist.find((w) => w.trackedPlayerId === selectedPlayerId);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Match History
      </Typography>

      {watchlistLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : watchlist.length === 0 ? (
        <Alert severity="info">
          Your watchlist is empty. Add players to your watchlist to view their match history.
        </Alert>
      ) : (
        <Paper sx={{ p: 2 }}>
          {/* Controls row */}
          <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            {/* Player selector */}
            <FormControl sx={{ minWidth: 220 }} size="small">
              <InputLabel>Player</InputLabel>
              <Select
                value={selectedPlayerId}
                label="Player"
                onChange={(e) => handlePlayerChange(e.target.value)}
              >
                {watchlist.map((w) => (
                  <MenuItem key={w.trackedPlayerId} value={w.trackedPlayerId}>
                    {w.playerName} <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>({w.region.toUpperCase()})</Typography>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Champion search */}
            <TextField
              size="small"
              label="Search by champion"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
              slotProps={{
                input: {
                  endAdornment: (
                    <SearchIcon
                      sx={{ cursor: 'pointer', color: 'text.secondary' }}
                      onClick={handleSearch}
                    />
                  ),
                },
              }}
              sx={{ minWidth: 200 }}
            />

            {/* Result filter */}
            <FormControl sx={{ minWidth: 130 }} size="small">
              <InputLabel>Result</InputLabel>
              <Select
                value={resultFilter}
                label="Result"
                onChange={(e) => handleResultChange(e.target.value as 'ALL' | 'WIN' | 'LOSS')}
              >
                <MenuItem value="ALL">All</MenuItem>
                <MenuItem value="WIN">Win</MenuItem>
                <MenuItem value="LOSS">Loss</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          {/* Player header */}
          {currentPlayer && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Showing matches for <strong>{currentPlayer.playerName}</strong> · {currentPlayer.region.toUpperCase()}
            </Typography>
          )}

          {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}

          {/* Table */}
          {matchesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell><strong>Champion</strong></TableCell>
                    <TableCell><strong>K/D/A</strong></TableCell>
                    <TableCell><strong>Result</strong></TableCell>
                    <TableCell><strong>Queue</strong></TableCell>
                    <TableCell><strong>Date</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {matches?.content.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No matches found.
                      </TableCell>
                    </TableRow>
                  )}
                  {matches?.content.map((m) => {
                    const kda = ((m.kills + m.assists) / Math.max(m.deaths, 1)).toFixed(2);
                    return (
                      <TableRow
                        key={m.id}
                        hover
                        sx={{ borderLeft: `4px solid ${m.win ? '#2ecc71' : '#e74c3c'}` }}
                      >
                        {/* Champion */}
                        <TableCell>
                          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                            <Avatar
                              src={`${DDRAGON}/img/champion/${m.championName}.png`}
                              sx={{ width: 32, height: 32 }}
                            />
                            <Typography variant="body2">{m.championName}</Typography>
                          </Stack>
                        </TableCell>

                        {/* K/D/A */}
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {m.kills}/{m.deaths}/{m.assists}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {kda} KDA
                          </Typography>
                        </TableCell>

                        {/* Result */}
                        <TableCell>
                          <Chip
                            label={m.win ? 'WIN' : 'LOSS'}
                            size="small"
                            sx={{
                              bgcolor: m.win ? 'success.main' : 'error.main',
                              color: '#fff',
                              fontWeight: 'bold',
                            }}
                          />
                        </TableCell>

                        {/* Queue */}
                        <TableCell>
                          <Chip
                            label={m.queueType.replace(/_/g, ' ')}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>

                        {/* Date */}
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(m.playedAt).toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(m.playedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <TablePagination
            component="div"
            count={matches?.totalElements ?? 0}
            page={page}
            onPageChange={(_, v) => setPage(v)}
            rowsPerPage={pageSize}
            onRowsPerPageChange={(e) => { setPageSize(parseInt(e.target.value)); setPage(0); }}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Paper>
      )}
    </Box>
  );
};
