import { Box, Typography, Paper, Stack } from '@mui/material';

export const AdminPage = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Admin Panel
      </Typography>
      <Stack spacing={2}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">User Management</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage registered users (coming soon).
          </Typography>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">All Feedback</Typography>
          <Typography variant="body2" color="text.secondary">
            View and moderate user feedback (coming soon).
          </Typography>
        </Paper>
      </Stack>
    </Box>
  );
};

