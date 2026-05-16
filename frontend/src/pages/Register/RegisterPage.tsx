import { Box, Button, Stack, TextField, Typography } from '@mui/material';

export const RegisterPage = () => {
  return (
    <Box sx={{ maxWidth: 500 }}>
      <Typography variant="h4" gutterBottom>
        Register
      </Typography>
      <Stack spacing={2}>
        <TextField label="Name" />
        <TextField label="Email" />
        <TextField label="Password" type="password" />
        <Button variant="contained">Create account</Button>
      </Stack>
    </Box>
  );
};
