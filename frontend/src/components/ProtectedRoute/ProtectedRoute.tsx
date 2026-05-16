import { Navigate, Outlet } from 'react-router-dom';
import { isLoggedIn } from '../../hooks/useAuth';

export const ProtectedRoute = () => {
  return isLoggedIn() ? <Outlet /> : <Navigate to="/login" replace />;
};
