import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Box, Button, CircularProgress, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import { api } from '../../api/api';
import { saveAuth } from '../../hooks/useAuth';
import { usePageTitle } from '../../hooks/usePageTitle';

type RegisterForm = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const schema = yup.object({
  name: yup.string().min(2, 'Name must be at least 2 characters').required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords do not match')
    .required('Please confirm your password'),
});

export const RegisterPage = () => {
  usePageTitle('Register');
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setApiError(null);
    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
      });
      if (!res.ok) {
        const err = await res.json();
        setApiError(err.message ?? 'Registration failed');
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
    <Box sx={{ maxWidth: 460, mx: 'auto', mt: 8 }}>
      <Typography variant="h4" gutterBottom>Create Account</Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Already have an account? <Link to="/login">Login here</Link>
      </Typography>

      {apiError && <Alert severity="error" sx={{ mb: 2 }}>{apiError}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <TextField
            label="Name"
            {...register('name')}
            error={!!errors.name}
            helperText={errors.name?.message}
          />
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
          <TextField
            label="Confirm Password"
            type="password"
            {...register('confirmPassword')}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
          />
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={22} /> : 'Register'}
          </Button>
        </Stack>
      </form>
    </Box>
  );
};
