import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { saveAuth } from '../../hooks/useAuth';

type LoginForm = {
  email: string;
  password: string;
};

export const LoginPage = () => {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm<LoginForm>();

  const onSubmit = (data: LoginForm) => {
    saveAuth({ token: 'demo-token', email: data.email, name: 'Demo User', role: 'USER' });
    navigate('/players');
  };

  return (
    <Box sx={{ maxWidth: 420 }}>
      <Typography variant="h4" gutterBottom>
        Login
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <TextField label="Email" type="email" {...register('email', { required: true })} />
          <TextField label="Password" type="password" {...register('password', { required: true })} />
          <Button type="submit" variant="contained">
            Sign in
          </Button>
        </Stack>
      </form>
    </Box>
  );
};
