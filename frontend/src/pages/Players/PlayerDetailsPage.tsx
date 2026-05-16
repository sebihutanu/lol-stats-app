import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api/api';

interface TrackedPlayer {
  id: string;
  gameName: string;
  tagLine: string;
  region: string;
  summonerLevel: number | null;
  profileIconId: number | null;
  rankedTier: string | null;
  rankedRank: string | null;
  rankedLp: number | null;
  lastSyncedAt: string | null;
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

const TIER_COLORS: Record<string, string> = {
  IRON: '#7a7a7a', BRONZE: '#8c4a2f', SILVER: '#9ba5b4', GOLD: '#c89b3c',
  PLATINUM: '#4a9e87', EMERALD: '#2ecc71', DIAMOND: '#468dc1',
  MASTER: '#9b59b6', GRANDMASTER: '#e74c3c', CHALLENGER: '#f1c40f',
};

export const PlayerDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [player, setPlayer] = useState<TrackedPlayer | null>(null);
  const [playerLoading, setPlayerLoading] = useState(true);
  const [playerError, setPlayerError] = useState<string | null>(null);

  const [matches, setMatches] = useState<PageResponse | null>(null);
  const [matchPage, setMatchPage] = useState(0);
  const [matchPageSize, setMatchPageSize] = useState(10);
  const [matchLoading, setMatchLoading] = useState(false);

  const [syncing, setSyncing] = useState(false);

  const fetchPlayer = async () => {
    setPlayerLoading(true);
    setPlayerError(null);
    try {
      const res = await api.get(`/players/${id}`);
      if (!res.ok) throw new Error('Player not found');
      setPlayer(await res.json());
    } catch (e: any) {
      setPlayerError(e.message);
    } finally {
      setPlayerLoading(false);
    }
  };

  const fetchMatches = async () => {
    if (!id) return;
    setMatchLoading(true);
    try {
      const params = new URLSearchParams({ page: String(matchPage), size: String(matchPageSize) });
      const res = await api.get(`/players/${id}/matches?${params}`);
      if (res.ok) setMatches(await res.json());
    } finally {
      setMatchLoading(false);
    }
  };

  const handleResync = async () => {
    if (!player) return;
    setSyncing(true);
    try {
      await api.post(
        `/players/search?gameName=${encodeURIComponent(player.gameName)}&tagLine=${encodeURIComponent(player.tagLine)}&region=${player.region}`,
        {}
      );
      await fetchPlayer();
      await fetchMatches();
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => { fetchPlayer(); }, [id]); // eslint-disable-line
  useEffect(() => { fetchMatches(); }, [id, matchPage, matchPageSize]); // eslint-disable-line

  // Group matches by champion for stats
  const championStats = matches?.content.reduce((acc, m) => {
    if (!acc[m.championName]) acc[m.championName] = { games: 0, wins: 0, kills: 0, deaths: 0, assists: 0 };
    acc[m.championName].games++;
    if (m.win) acc[m.championName].wins++;
    acc[m.championName].kills += m.kills;
    acc[m.championName].deaths += m.deaths;
    acc[m.championName].assists += m.assists;
    return acc;
  }, {} as Record<string, { games: number; wins: number; kills: number; deaths: number; assists: number }>);

  if (playerLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>;
  if (playerError) return <Alert severity="error">{playerError}</Alert>;
  if (!player) return null;

  const tierColor = player.rankedTier ? (TIER_COLORS[player.rankedTier] ?? '#888') : '#888';

  return (
    <Box>
      {/* Back button */}
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/players')} sx={{ mb: 2 }}>
        Back to Players
      </Button>

      {/* Profile card */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" spacing={3} sx={{ alignItems: 'center' }}>
          <Avatar
            src={player.profileIconId
              ? `${DDRAGON}/img/profileicon/${player.profileIconId}.png`
              : undefined}
            sx={{ width: 80, height: 80, border: `3px solid ${tierColor}` }}
          >
            {player.gameName[0]}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4">
              {player.gameName}
              <Typography component="span" variant="h6" color="text.secondary"> #{player.tagLine}</Typography>
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1, alignItems: 'center' }}>
              <Chip label={player.region.toUpperCase()} size="small" />
              <Typography variant="body2">Level <strong>{player.summonerLevel ?? '—'}</strong></Typography>
              {player.rankedTier ? (
                <Chip
                  label={`${player.rankedTier} ${player.rankedRank} — ${player.rankedLp} LP`}
                  size="small"
                  sx={{ bgcolor: tierColor, color: '#fff', fontWeight: 'bold' }}
                />
              ) : (
                <Chip label="Unranked" size="small" />
              )}
            </Stack>
            {player.lastSyncedAt && (
              <Typography variant="caption" color="text.secondary">
                Last synced: {new Date(player.lastSyncedAt).toLocaleString()}
              </Typography>
            )}
          </Box>
          <Button
            variant="outlined"
            startIcon={syncing ? <CircularProgress size={16} /> : <RefreshIcon />}
            onClick={handleResync}
            disabled={syncing}
          >
            Re-sync
          </Button>
        </Stack>
      </Paper>

      {/* Champion stats */}
      {championStats && Object.keys(championStats).length > 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Champion Stats (recent matches)</Typography>
          <Divider sx={{ mb: 1 }} />
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Champion</strong></TableCell>
                  <TableCell><strong>Games</strong></TableCell>
                  <TableCell><strong>Win Rate</strong></TableCell>
                  <TableCell><strong>Avg KDA</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(championStats)
                  .sort((a, b) => b[1].games - a[1].games)
                  .map(([champ, stats]) => {
                    const winRate = Math.round((stats.wins / stats.games) * 100);
                    const kda = ((stats.kills + stats.assists) / Math.max(stats.deaths, 1)).toFixed(2);
                    return (
                      <TableRow key={champ} hover>
                        <TableCell>
                          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                            <Avatar
                              src={`${DDRAGON}/img/champion/${champ}.png`}
                              sx={{ width: 28, height: 28 }}
                            />
                            <Typography variant="body2">{champ}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>{stats.games}</TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{ color: winRate >= 50 ? 'success.main' : 'error.main', fontWeight: 'bold' }}
                          >
                            {winRate}%
                          </Typography>
                        </TableCell>
                        <TableCell>{kda}</TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Match history */}
      <Paper>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6">Recent Matches</Typography>
        </Box>
        <Divider />
        {matchLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Result</strong></TableCell>
                  <TableCell><strong>Champion</strong></TableCell>
                  <TableCell><strong>KDA</strong></TableCell>
                  <TableCell><strong>Queue</strong></TableCell>
                  <TableCell><strong>Date</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {matches?.content.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">No matches recorded yet.</TableCell>
                  </TableRow>
                )}
                {matches?.content.map((m) => (
                  <TableRow key={m.id} hover sx={{ borderLeft: `4px solid ${m.win ? '#2ecc71' : '#e74c3c'}` }}>
                    <TableCell>
                      <Chip
                        label={m.win ? 'WIN' : 'LOSS'}
                        size="small"
                        sx={{ bgcolor: m.win ? 'success.main' : 'error.main', color: '#fff', fontWeight: 'bold' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <Avatar src={`${DDRAGON}/img/champion/${m.championName}.png`} sx={{ width: 28, height: 28 }} />
                        <Typography variant="body2">{m.championName}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {m.kills}/{m.deaths}/{m.assists}
                      </Typography>
                    </TableCell>
                    <TableCell><Chip label={m.queueType.replace('_', ' ')} size="small" variant="outlined" /></TableCell>
                    <TableCell>{new Date(m.playedAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <TablePagination
          component="div"
          count={matches?.totalElements ?? 0}
          page={matchPage}
          onPageChange={(_, v) => setMatchPage(v)}
          rowsPerPage={matchPageSize}
          onRowsPerPageChange={(e) => { setMatchPageSize(parseInt(e.target.value)); setMatchPage(0); }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>
    </Box>
  );
};





