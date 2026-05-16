import { Navigate, Outlet } from 'react-router-dom';
import { getAuth } from '../../hooks/useAuth';

export const AdminRoute = () => {
  const user = getAuth();
  return user?.role === 'ADMIN' ? <Outlet /> : <Navigate to="/home" replace />;
};

