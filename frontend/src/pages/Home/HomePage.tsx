import { Box, Button, CircularProgress, Divider, Paper, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/api';
import { usePageTitle } from '../../hooks/usePageTitle';
import { getAuth } from '../../hooks/useAuth';

export const HomePage = () => {
  usePageTitle('Home');
  const user = getAuth();

  const [watchlistCount, setWatchlistCount] = useState<number | null>(null);
  const [playersCount, setPlayersCount] = useState<number | null>(null);

  useEffect(() => {
    api.get('/watchlist?size=1').then(r => r.json()).then(d => setWatchlistCount(d.totalElements ?? 0)).catch(() => {});
    api.get('/players?size=1').then(r => r.json()).then(d => setPlayersCount(d.totalElements ?? 0)).catch(() => {});
  }, []);

  return (
    <Box>
      <Typography variant="h3" gutterBottom>
        Welcome to LeagueTracker 🎮
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Track your favourite League of Legends players, monitor their ranked stats and match history.
      </Typography>

      {user && (
        <Typography variant="body1" sx={{ mb: 3 }}>
          Logged in as <strong>{user.name}</strong>
          <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            ({user.role})
          </Typography>
        </Typography>
      )}

      {/* Quick stats */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <Paper sx={{ p: 2, minWidth: 160, textAlign: 'center' }} variant="outlined">
          <Typography variant="h4" color="primary">
            {playersCount === null ? <CircularProgress size={28} /> : playersCount}
          </Typography>
          <Typography variant="body2" color="text.secondary">Tracked Players</Typography>
        </Paper>
        <Paper sx={{ p: 2, minWidth: 160, textAlign: 'center' }} variant="outlined">
          <Typography variant="h4" color="secondary">
            {watchlistCount === null ? <CircularProgress size={28} /> : watchlistCount}
          </Typography>
          <Typography variant="body2" color="text.secondary">My Watchlist</Typography>
        </Paper>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Feature cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 2 }}>
        <Paper sx={{ p: 3, minWidth: 200 }}>
          <Typography variant="h6">🔍 Search Players</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Look up any LoL player by name and region.
          </Typography>
          <Button variant="contained" component={Link} to="/players">
            Go to Players
          </Button>
        </Paper>

        <Paper sx={{ p: 3, minWidth: 200 }}>
          <Typography variant="h6">📋 My Watchlist</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Keep track of players you follow closely.
          </Typography>
          <Button variant="outlined" component={Link} to="/watchlist">
            Go to Watchlist
          </Button>
        </Paper>

        <Paper sx={{ p: 3, minWidth: 200 }}>
          <Typography variant="h6">⚔️ Match History</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Browse recent matches for your watchlist players.
          </Typography>
          <Button variant="outlined" component={Link} to="/matches">
            View Matches
          </Button>
        </Paper>

        <Paper sx={{ p: 3, minWidth: 200 }}>
          <Typography variant="h6">💬 Feedback</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Share your thoughts about the app.
          </Typography>
          <Button variant="outlined" component={Link} to="/feedback">
            Give Feedback
          </Button>
        </Paper>
      </Box>
    </Box>
  );
};


