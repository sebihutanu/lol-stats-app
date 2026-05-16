// Simple auth helpers using localStorage — no Redux needed

export interface AuthUser {
  token: string;
  email: string;
  name: string;
  role: string;
}

export const saveAuth = (user: AuthUser): void => {
  localStorage.setItem('token', user.token);
  localStorage.setItem('email', user.email);
  localStorage.setItem('name', user.name);
  localStorage.setItem('role', user.role);
};

export const clearAuth = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('email');
  localStorage.removeItem('name');
  localStorage.removeItem('role');
};

export const getToken = (): string | null => localStorage.getItem('token');

export const getAuth = (): AuthUser | null => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  return {
    token,
    email: localStorage.getItem('email') ?? '',
    name: localStorage.getItem('name') ?? '',
    role: localStorage.getItem('role') ?? '',
  };
};

export const isLoggedIn = (): boolean => getToken() !== null;

