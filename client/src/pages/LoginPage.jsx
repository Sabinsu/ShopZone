import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { FiMail, FiLock, FiLogIn, FiEye, FiEyeOff } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = location.state?.from?.pathname || '/'
  const [form,    setForm]    = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPw,  setShowPw]  = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password')
    } finally { setLoading(false) }
  }

  const handleGoogle = async (credentialResponse) => {
    try {
      await loginWithGoogle(credentialResponse.credential)
      toast.success('Logged in with Google!')
      navigate(from, { replace: true })
    } catch { toast.error('Google login failed. Please try again.') }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-extrabold text-orange-500">Shop<span className="text-gray-900">Zone</span></Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-3">Welcome back</h1>
          <p className="text-gray-500 mt-1">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-100">
          {/* Google Login */}
          <div className="mb-5">
            <GoogleLogin
              onSuccess={handleGoogle}
              onError={() => toast.error('Google login failed')}
              width="100%"
              text="signin_with"
              shape="rectangular"
              theme="outline"
            />
          </div>

          {/* Divider */}
          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"/></div>
            <div className="relative flex justify-center"><span className="bg-white px-3 text-gray-400 text-sm">or sign in with email</span></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                <input type="email" required value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="input pl-9" placeholder="you@example.com"/>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="label mb-0">Password</label>
                <Link to="/forgot-password" className="text-xs text-orange-500 hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                <input type={showPw ? 'text' : 'password'} required value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="input pl-9 pr-10" placeholder="••••••••"/>
                <button type="button" onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <FiEyeOff size={16}/> : <FiEye size={16}/>}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              {loading ? <span className="spinner-sm"/> : <><FiLogIn size={16}/> Sign In</>}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Don't have an account?{' '}
            <Link to="/register" className="text-orange-500 font-semibold hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
