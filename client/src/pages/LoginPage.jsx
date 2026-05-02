// client/src/pages/LoginPage.jsx
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = location.state?.from?.pathname || '/'
  const [form,    setForm]    = useState({ email: '', password: '' })
  const [showPw,  setShowPw]  = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleChange = (e) => { setError(''); setForm(f => ({ ...f, [e.target.name]: e.target.value })) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { setError('All fields required'); return }
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back! ✨')
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials')
    } finally { setLoading(false) }
  }

  const handleGoogle = async (cr) => {
    try {
      await loginWithGoogle(cr.credential)
      toast.success('Logged in with Google!')
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google login failed')
    }
  }

  return (
    <div style={{ minHeight:'calc(100vh - 68px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'3rem 1rem', background:'var(--dark)', position:'relative', overflow:'hidden' }}>
      {/* BG orbs */}
      <div style={{ position:'absolute', top:'20%', left:'10%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)', pointerEvents:'none' }}/>
      <div style={{ position:'absolute', bottom:'10%', right:'10%', width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle, rgba(0,212,170,0.04) 0%, transparent 70%)', pointerEvents:'none' }}/>

      <div style={{ width:'100%', maxWidth:420, position:'relative', zIndex:1 }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{ width:56, height:56, background:'linear-gradient(135deg,#F0D060,#D4AF37)', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'"Playfair Display",serif', fontSize:'1.6rem', fontWeight:900, color:'#0A0A0F', margin:'0 auto 1rem', boxShadow:'0 8px 32px rgba(212,175,55,0.4)' }}>S</div>
          <h1 style={{ fontFamily:'"Playfair Display",serif', fontSize:'1.8rem', fontWeight:800, color:'var(--text-1)', marginBottom:6 }}>Welcome Back</h1>
          <p style={{ color:'var(--text-3)', fontSize:'0.875rem' }}>Sign in to your ShopZone account</p>
        </div>

        <div className="card-glow">
          {/* Google */}
          <div style={{ display:'flex', justifyContent:'center', marginBottom:'1.5rem' }}>
            <GoogleLogin onSuccess={handleGoogle} onError={() => toast.error('Google login failed')} useOneTap shape="rectangular" size="large" text="signin_with" width="100%"/>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1.5rem' }}>
            <div style={{ flex:1, height:1, background:'var(--dark-5)' }}/>
            <span style={{ fontSize:'0.7rem', color:'var(--text-3)', fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase' }}>or with email</span>
            <div style={{ flex:1, height:1, background:'var(--dark-5)' }}/>
          </div>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            {error && (
              <div style={{ background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.25)', borderRadius:10, padding:'10px 14px', fontSize:'0.85rem', color:'#f87171' }}>{error}</div>
            )}
            <div>
              <label className="label">Email Address</label>
              <div style={{ position:'relative' }}>
                <FiMail style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-3)', pointerEvents:'none' }} size={15}/>
                <input name="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={handleChange} className="input" style={{ paddingLeft:42 }} required/>
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div style={{ position:'relative' }}>
                <FiLock style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-3)', pointerEvents:'none' }} size={15}/>
                <input name="password" type={showPw?'text':'password'} autoComplete="current-password" placeholder="••••••••" value={form.password} onChange={handleChange} className="input" style={{ paddingLeft:42, paddingRight:44 }} required/>
                <button type="button" onClick={()=>setShowPw(!showPw)} style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-3)', background:'none', border:'none', cursor:'pointer', padding:2 }}>
                  {showPw ? <FiEyeOff size={15}/> : <FiEye size={15}/>}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary" style={{ width:'100%', padding:'13px', fontSize:'0.95rem', marginTop:4 }}>
              {loading ? <span className="spinner" style={{ width:20, height:20 }}/> : 'Sign In'}
            </button>
          </form>
        </div>

        <p style={{ textAlign:'center', fontSize:'0.875rem', color:'var(--text-3)', marginTop:'1.5rem' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color:'var(--gold)', fontWeight:700, textDecoration:'none' }}>Create one free</Link>
        </p>
      </div>
    </div>
  )
}
