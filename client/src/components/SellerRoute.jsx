// client/src/components/SellerRoute.jsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function SellerRoute({ children }) {
  const { user, loading, isSeller, isAdmin } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    )
  }

  if (!user || (!isSeller && !isAdmin)) {
    return <Navigate to="/" replace />
  }

  return children
}
