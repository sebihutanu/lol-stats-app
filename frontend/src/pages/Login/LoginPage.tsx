import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Box, Button, CircularProgress, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import { api } from '../../api/api';
import { saveAuth } from '../../hooks/useAuth';
import { usePageTitle } from '../../hooks/usePageTitle';

type LoginForm = {
  email: string;
  password: string;
};

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

export const LoginPage = () => {
  usePageTitle('Login');
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: LoginForm) => {
    setApiError(null);
    setLoading(true);
    try {
      const res = await api.post('/auth/login', data);
      if (!res.ok) {
        const err = await res.json();
        setApiError(err.message ?? 'Login failed');
        return;
      }
      const body = await res.json();
      saveAuth({ token: body.token, email: body.email, name: body.name, role: body.role });
      navigate('/home');
    } catch {
      setApiError('Cannot connect to server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 420, mx: 'auto', mt: 8 }}>
      <Typography variant="h4" gutterBottom>Login</Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Don't have an account? <Link to="/register">Register here</Link>
      </Typography>

      {apiError && <Alert severity="error" sx={{ mb: 2 }}>{apiError}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <TextField
            label="Email"
            type="email"
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          <TextField
            label="Password"
            type="password"
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={22} /> : 'Sign in'}
          </Button>
        </Stack>
      </form>
    </Box>
  );
};
