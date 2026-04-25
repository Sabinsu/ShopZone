// client/src/pages/LoginPage.jsx  ← REPLACE existing file
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = location.state?.from?.pathname || '/'

  const [form,    setForm]    = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally { setLoading(false) }
  }

  const handleGoogle = async (credentialResponse) => {
    try {
      await loginWithGoogle(credentialResponse.credential)
      toast.success('Logged in with Google!')
      navigate(from, { replace: true })
    } catch { toast.error('Google login failed') }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 mt-2">Sign in to your ShopZone account</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-8 border border-gray-100">
          {/* Google Login */}
          <div className="mb-6">
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
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
            <div className="relative flex justify-center"><span className="bg-white px-3 text-gray-400 text-sm">or sign in with email</span></div>
          </div>

          {/* Email form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email" required
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="input pl-10"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="label mb-0">Password</label>
                <Link to="/forgot-password" className="text-xs text-orange-500 hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password" required
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="input pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition">
              {loading ? 'Signing in...' : <><FiLogIn /> Sign In</>}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-orange-500 font-medium hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
