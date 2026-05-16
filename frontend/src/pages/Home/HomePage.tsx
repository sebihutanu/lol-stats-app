import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { getAuth } from '../../hooks/useAuth';

export const HomePage = () => {
  const user = getAuth();

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
          Logged in as <strong>{user.name}</strong> ({user.role})
        </Typography>
      )}

      <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
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
          <Typography variant="h6">💬 Feedback</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Share your thoughts about the app.
          </Typography>
          <Button variant="outlined" component={Link} to="/feedback">
            Give Feedback
          </Button>
        </Paper>
      </Stack>
    </Box>
  );
};


