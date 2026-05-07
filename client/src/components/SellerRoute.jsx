// client/src/components/SellerRoute.jsx
import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FiClock, FiShoppingBag } from 'react-icons/fi'

export default function SellerRoute({ children }) {
  const { user, loading, isSeller, isAdmin } = useAuth()

  if (loading) {
    return (
      <div style={{ minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div className="spinner" style={{ width:32, height:32, borderTopColor:'var(--gold)' }}/>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  // Approved seller or admin — all good
  if (isSeller || isAdmin) return children

  // Has applied but pending
  const status = user?.sellerInfo?.status
  if (status === 'pending') {
    return (
      <div style={{ maxWidth:520, margin:'5rem auto', padding:'2rem 1.25rem', textAlign:'center' }}>
        <div style={{ width:72, height:72, borderRadius:'50%', background:'rgba(212,175,55,0.12)', border:'2px solid rgba(212,175,55,0.3)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.5rem' }}>
          <FiClock size={32} style={{ color:'var(--gold)' }}/>
        </div>
        <h1 style={{ fontFamily:'"Playfair Display",serif', fontSize:'1.75rem', fontWeight:800, color:'var(--text-1)', marginBottom:12 }}>Pending Approval</h1>
        <p style={{ color:'var(--text-2)', lineHeight:1.7, marginBottom:'2rem' }}>
          Your seller application for <strong style={{ color:'var(--gold)' }}>{user.sellerInfo?.storeName}</strong> is under review.
          You'll be notified once an admin approves your request.
        </p>
        <Link to="/" className="btn-primary">Back to Home</Link>
      </div>
    )
  }

  if (status === 'rejected') {
    return (
      <div style={{ maxWidth:520, margin:'5rem auto', padding:'2rem 1.25rem', textAlign:'center' }}>
        <div style={{ width:72, height:72, borderRadius:'50%', background:'rgba(239,68,68,0.1)', border:'2px solid rgba(239,68,68,0.25)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.5rem', fontSize:'2rem' }}>❌</div>
        <h1 style={{ fontFamily:'"Playfair Display",serif', fontSize:'1.75rem', fontWeight:800, color:'var(--text-1)', marginBottom:12 }}>Application Rejected</h1>
        {user.sellerInfo?.rejectReason && (
          <div style={{ background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:12, padding:'1rem', marginBottom:'1.5rem' }}>
            <p style={{ fontSize:'0.85rem', color:'#f87171' }}><strong>Reason:</strong> {user.sellerInfo.rejectReason}</p>
          </div>
        )}
        <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
          <Link to="/become-seller" className="btn-primary"><FiShoppingBag size={15}/> Reapply</Link>
          <Link to="/" className="btn-outline">Home</Link>
        </div>
      </div>
    )
  }

  // Not a seller at all
  return (
    <div style={{ maxWidth:520, margin:'5rem auto', padding:'2rem 1.25rem', textAlign:'center' }}>
      <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>🏪</div>
      <h1 style={{ fontFamily:'"Playfair Display",serif', fontSize:'1.75rem', fontWeight:800, color:'var(--text-1)', marginBottom:12 }}>Seller Access Required</h1>
      <p style={{ color:'var(--text-2)', marginBottom:'2rem' }}>This area is for approved sellers only. Apply to become a seller!</p>
      <Link to="/become-seller" className="btn-primary" style={{ padding:'13px 28px' }}>
        <FiShoppingBag size={16}/> Become a Seller
      </Link>
    </div>
  )
}
