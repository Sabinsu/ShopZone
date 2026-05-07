// client/src/pages/seller/BecomeSeller.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiShoppingBag, FiCheck, FiClock } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function BecomeSeller() {
  const { user, becomeSeller } = useAuth()
  const navigate = useNavigate()
  const [storeName,    setStoreName]    = useState('')
  const [description,  setDescription]  = useState('')
  const [loading,      setLoading]      = useState(false)
  const [submitted,    setSubmitted]    = useState(false)

  // Already applied
  const status = user?.sellerInfo?.status

  if (status === 'pending' || submitted) {
    return (
      <div style={{ maxWidth:520, margin:'6rem auto', padding:'2rem 1.25rem', textAlign:'center' }}>
        <div style={{ width:72, height:72, borderRadius:'50%', background:'rgba(212,175,55,0.12)', border:'2px solid rgba(212,175,55,0.3)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.5rem' }}>
          <FiClock size={32} style={{ color:'var(--gold)' }}/>
        </div>
        <h1 style={{ fontFamily:'"Playfair Display",serif', fontSize:'1.75rem', fontWeight:800, color:'var(--text-1)', marginBottom:12 }}>Application Under Review</h1>
        <p style={{ color:'var(--text-2)', lineHeight:1.7, marginBottom:'2rem' }}>
          Your seller application for <strong style={{ color:'var(--gold)' }}>{user?.sellerInfo?.storeName || storeName}</strong> has been submitted.
          Our team will review it and notify you via your account notifications.
        </p>
        <div style={{ background:'var(--dark-3)', border:'1px solid var(--dark-5)', borderRadius:16, padding:'1.25rem', marginBottom:'2rem' }}>
          {[
            'Admin reviews your application',
            'You receive an approval notification',
            'Start listing products immediately',
          ].map((step, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom: i < 2 ? '1px solid var(--dark-5)' : 'none' }}>
              <div style={{ width:24, height:24, borderRadius:'50%', background:'rgba(212,175,55,0.15)', border:'1px solid rgba(212,175,55,0.3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:'0.7rem', fontWeight:800, color:'var(--gold)' }}>{i+1}</div>
              <span style={{ fontSize:'0.875rem', color:'var(--text-2)' }}>{step}</span>
            </div>
          ))}
        </div>
        <button onClick={() => navigate('/')} className="btn-primary">Back to Home</button>
      </div>
    )
  }

  if (status === 'approved' || (user?.role === 'seller' && user?.sellerInfo?.approved)) {
    navigate('/seller'); return null
  }

  if (status === 'rejected') {
    return (
      <div style={{ maxWidth:520, margin:'6rem auto', padding:'2rem 1.25rem', textAlign:'center' }}>
        <div style={{ width:72, height:72, borderRadius:'50%', background:'rgba(239,68,68,0.1)', border:'2px solid rgba(239,68,68,0.3)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.5rem' }}>
          <span style={{ fontSize:32 }}>❌</span>
        </div>
        <h1 style={{ fontFamily:'"Playfair Display",serif', fontSize:'1.75rem', fontWeight:800, color:'var(--text-1)', marginBottom:12 }}>Application Not Approved</h1>
        {user?.sellerInfo?.rejectReason && (
          <div style={{ background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:12, padding:'1rem', marginBottom:'1.5rem' }}>
            <p style={{ fontSize:'0.85rem', color:'#f87171' }}><strong>Reason:</strong> {user.sellerInfo.rejectReason}</p>
          </div>
        )}
        <p style={{ color:'var(--text-2)', marginBottom:'2rem' }}>You may reapply with a different store name or updated information.</p>
        {/* Allow reapplication — show form */}
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!storeName.trim()) return toast.error('Store name is required')
    setLoading(true)
    try {
      await becomeSeller(storeName.trim(), description.trim())
      toast.success('Application submitted! Awaiting admin approval.')
      setSubmitted(true)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ maxWidth:560, margin:'4rem auto', padding:'2rem 1.25rem' }}>
      {/* Header */}
      <div style={{ textAlign:'center', marginBottom:'2.5rem' }}>
        <div style={{ width:68, height:68, borderRadius:'50%', background:'linear-gradient(135deg,var(--gold-light),var(--gold))', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.25rem', boxShadow:'0 8px 32px rgba(212,175,55,0.4)' }}>
          <FiShoppingBag size={28} style={{ color:'#0A0A0F' }}/>
        </div>
        <h1 style={{ fontFamily:'"Playfair Display",serif', fontSize:'2rem', fontWeight:800, color:'var(--text-1)', marginBottom:8 }}>Become a Seller</h1>
        <p style={{ color:'var(--text-2)', maxWidth:400, margin:'0 auto', lineHeight:1.6 }}>
          Join thousands of sellers on ShopZone. Your application will be reviewed within 24-48 hours.
        </p>
      </div>

      {/* Benefits */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:'2rem' }}>
        {['0% Setup Fee', '24/7 Support', 'Instant Payouts'].map((b, i) => (
          <div key={i} style={{ background:'var(--dark-3)', border:'1px solid var(--dark-5)', borderRadius:14, padding:'12px 10px', textAlign:'center' }}>
            <FiCheck size={16} style={{ color:'var(--gold)', marginBottom:6 }}/>
            <p style={{ fontSize:'0.75rem', fontWeight:600, color:'var(--text-2)' }}>{b}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
        <div>
          <label className="label">Store Name *</label>
          <input value={storeName} onChange={e => setStoreName(e.target.value)}
            className="input" required placeholder="e.g. Sabin Tech Store" maxLength={60}/>
        </div>
        <div>
          <label className="label">Store Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)}
            rows={4} className="input" style={{ resize:'none' }}
            placeholder="Tell us about your store — what you sell, your experience, why customers should buy from you..."/>
        </div>
        <div style={{ background:'rgba(212,175,55,0.06)', border:'1px solid rgba(212,175,55,0.15)', borderRadius:12, padding:'12px 16px' }}>
          <p style={{ fontSize:'0.8rem', color:'var(--text-2)', lineHeight:1.6 }}>
            By applying, you agree to ShopZone's seller terms. Your application is reviewed manually and you'll be notified via your account notifications.
          </p>
        </div>
        <button type="submit" disabled={loading} className="btn-primary" style={{ padding:'14px', width:'100%' }}>
          {loading ? <><span className="spinner" style={{ borderTopColor:'#0A0A0F' }}/> Submitting...</> : '🚀 Submit Application'}
        </button>
      </form>
    </div>
  )
}
