import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../hooks/useAuth';

export default function AdminRoute({ children }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  
  if (user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return children;
}
