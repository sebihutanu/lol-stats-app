import { getToken } from '../hooks/useAuth';

const BASE_URL = 'http://localhost:8080/api';

const getHeaders = (): HeadersInit => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  get: (path: string) =>
    fetch(`${BASE_URL}${path}`, { method: 'GET', headers: getHeaders() }),

  post: (path: string, body: unknown) =>
    fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    }),

  put: (path: string, body: unknown) =>
    fetch(`${BASE_URL}${path}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    }),

  delete: (path: string) =>
    fetch(`${BASE_URL}${path}`, { method: 'DELETE', headers: getHeaders() }),
};

