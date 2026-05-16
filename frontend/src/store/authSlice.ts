import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  email: string | null;
  name: string | null;
  role: string | null;
  isLoggedIn: boolean;
}

const getInitialState = (): AuthState => {
  const token = localStorage.getItem('token');
  const email = localStorage.getItem('email');
  const name = localStorage.getItem('name');
  const role = localStorage.getItem('role');
  return {
    token,
    email,
    name,
    role,
    isLoggedIn: token !== null,
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    setCredentials: (
      _,
      action: PayloadAction<{ token: string; email: string; name: string; role: string }>
    ) => {
      const { token, email, name, role } = action.payload;
      localStorage.setItem('token', token);
      localStorage.setItem('email', email);
      localStorage.setItem('name', name);
      localStorage.setItem('role', role);
      return { token, email, name, role, isLoggedIn: true };
    },
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      localStorage.removeItem('name');
      localStorage.removeItem('role');
      return { token: null, email: null, name: null, role: null, isLoggedIn: false };
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export const authReducer = authSlice.reducer;

