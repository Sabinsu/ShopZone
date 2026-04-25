// client/src/components/SellerRoute.jsx  ← NEW FILE
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function SellerRoute({ children }) {
  const { user, isAdmin, isSeller } = useAuth()
  if (!user)     return <Navigate to="/login" replace />
  if (isAdmin)   return children   // admins can access seller pages too
  if (isSeller)  return children
  // Logged in but not an approved seller
  return <Navigate to="/become-seller" replace />
}
