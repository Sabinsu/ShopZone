// client/src/pages/RegisterPage.jsx  ← REPLACE
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const { register, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  const [form,    setForm]    = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPw,  setShowPw]  = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleChange = (e) => {
    setError('')
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) { setError('All fields required'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      toast.success('Account created! Welcome to ShopZone 🎉')
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  const handleGoogle = async (cr) => {
    try {
      await loginWithGoogle(cr.credential)
      toast.success('Registered with Google!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google signup failed')
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl">🎉</span>
          <h1 className="text-2xl font-extrabold text-gray-900 mt-3">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">Join millions of ShopZone shoppers</p>
        </div>

        <div className="card">
          <div className="flex justify-center mb-5">
            <GoogleLogin onSuccess={handleGoogle} onError={() => toast.error('Google signup failed')}
              shape="rectangular" size="large" text="signup_with" width="100%" />
          </div>

          <div className="flex items-center gap-3 mb-5">
            <hr className="flex-1 border-gray-200" />
            <span className="text-xs text-gray-400 font-medium">or sign up with email</span>
            <hr className="flex-1 border-gray-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
            )}

            {[
              { label: 'Full Name',        name: 'name',     type: 'text',     icon: FiUser,  placeholder: 'John Doe' },
              { label: 'Email address',    name: 'email',    type: 'email',    icon: FiMail,  placeholder: 'you@example.com' },
            ].map(({ label, name, type, icon: Icon, placeholder }) => (
              <div key={name}>
                <label className="label">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input name={name} type={type} placeholder={placeholder}
                    value={form[name]} onChange={handleChange} className="input pl-9" required />
                </div>
              </div>
            ))}

            {['password', 'confirm'].map((name) => (
              <div key={name}>
                <label className="label">{name === 'password' ? 'Password' : 'Confirm Password'}</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input name={name} type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form[name]} onChange={handleChange} className="input pl-9 pr-10" required />
                  {name === 'password' && (
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 mt-2">
              {loading ? <span className="spinner w-5 h-5" /> : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-orange-500 font-semibold hover:text-orange-600">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
