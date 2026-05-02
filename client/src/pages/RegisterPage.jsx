// client/src/pages/RegisterPage.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const { register, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [form,    setForm]    = useState({ name:'', email:'', password:'', confirm:'' })
  const [showPw,  setShowPw]  = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleChange = (e) => { setError(''); setForm(f => ({ ...f, [e.target.name]: e.target.value })) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) { setError('All fields required'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      toast.success('Welcome to ShopZone! 🎉')
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  const handleGoogle = async (cr) => {
    try { await loginWithGoogle(cr.credential); toast.success('Registered with Google!'); navigate('/') }
    catch (err) { toast.error(err.response?.data?.message || 'Google signup failed') }
  }

  const fields = [
    { label:'Full Name',      name:'name',     type:'text',     icon:FiUser,  placeholder:'Sabin Prasad Subedi' },
    { label:'Email Address',  name:'email',    type:'email',    icon:FiMail,  placeholder:'you@example.com' },
  ]

  return (
    <div style={{ minHeight:'calc(100vh - 68px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'3rem 1rem', background:'var(--dark)', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:'15%', right:'10%', width:350, height:350, borderRadius:'50%', background:'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)', pointerEvents:'none' }}/>
      <div style={{ width:'100%', maxWidth:440, position:'relative', zIndex:1 }}>
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{ width:56, height:56, background:'linear-gradient(135deg,#F0D060,#D4AF37)', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.8rem', margin:'0 auto 1rem', boxShadow:'0 8px 32px rgba(212,175,55,0.4)' }}>🎉</div>
          <h1 style={{ fontFamily:'"Playfair Display",serif', fontSize:'1.8rem', fontWeight:800, color:'var(--text-1)', marginBottom:6 }}>Create Account</h1>
          <p style={{ color:'var(--text-3)', fontSize:'0.875rem' }}>Join millions of ShopZone shoppers</p>
        </div>

        <div className="card-glow">
          <div style={{ display:'flex', justifyContent:'center', marginBottom:'1.5rem' }}>
            <GoogleLogin onSuccess={handleGoogle} onError={() => toast.error('Google signup failed')} shape="rectangular" size="large" text="signup_with" width="100%"/>
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
            {fields.map(({ label, name, type, icon: Icon, placeholder }) => (
              <div key={name}>
                <label className="label">{label}</label>
                <div style={{ position:'relative' }}>
                  <Icon style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-3)', pointerEvents:'none' }} size={15}/>
                  <input name={name} type={type} placeholder={placeholder} value={form[name]} onChange={handleChange} className="input" style={{ paddingLeft:42 }} required/>
                </div>
              </div>
            ))}
            {['password','confirm'].map(name => (
              <div key={name}>
                <label className="label">{name === 'password' ? 'Password' : 'Confirm Password'}</label>
                <div style={{ position:'relative' }}>
                  <FiLock style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-3)', pointerEvents:'none' }} size={15}/>
                  <input name={name} type={showPw?'text':'password'} placeholder="••••••••" value={form[name]} onChange={handleChange} className="input" style={{ paddingLeft:42, paddingRight:44 }} required/>
                  {name === 'password' && (
                    <button type="button" onClick={()=>setShowPw(!showPw)} style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-3)', background:'none', border:'none', cursor:'pointer' }}>
                      {showPw ? <FiEyeOff size={15}/> : <FiEye size={15}/>}
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-primary" style={{ width:'100%', padding:'13px', fontSize:'0.95rem', marginTop:4 }}>
              {loading ? <span className="spinner" style={{ width:20, height:20 }}/> : 'Create Account'}
            </button>
          </form>
        </div>

        <p style={{ textAlign:'center', fontSize:'0.875rem', color:'var(--text-3)', marginTop:'1.5rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color:'var(--gold)', fontWeight:700 }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
