import { AppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { clearAuth, getAuth, isLoggedIn } from '../../hooks/useAuth';

export const AppLayout = () => {
  const navigate = useNavigate();
  const user = getAuth();
  const isAdmin = user?.role === 'ADMIN';

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 0, mr: 3 }}>
            LeagueTracker
          </Typography>
          <Button color="inherit" component={Link} to="/home">
            Home
          </Button>
          <Button color="inherit" component={Link} to="/players">
            Players
          </Button>
          <Button color="inherit" component={Link} to="/watchlist">
            Watchlist
          </Button>
          <Button color="inherit" component={Link} to="/feedback">
            Feedback
          </Button>
          {isAdmin && (
            <Button color="inherit" component={Link} to="/admin">
              Admin
            </Button>
          )}
          <Box sx={{ flexGrow: 1 }} />
          {isLoggedIn() ? (
            <Button color="inherit" onClick={handleLogout}>
              Logout ({user?.name})
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
