import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SellerRoute({ children }) {
  const { user, isAdmin, isSeller } = useAuth();
  if (!user)              return <Navigate to="/login"        replace />;
  if (isAdmin || isSeller) return children;
  return <Navigate to="/become-seller" replace />;
}
