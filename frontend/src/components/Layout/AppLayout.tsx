import { AppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { clearAuth, isLoggedIn } from '../../hooks/useAuth';

export const AppLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            LeagueTracker
          </Typography>
          <Button color="inherit" component={Link} to="/players">
            Players
          </Button>
          <Button color="inherit" component={Link} to="/watchlist">
            Watchlist
          </Button>
          <Button color="inherit" component={Link} to="/feedback">
            Feedback
          </Button>
          {isLoggedIn() ? (
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <Button color="inherit" component={Link} to="/login">
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 3 }}>
        <Outlet />
      </Container>
    </Box>
  );
};
