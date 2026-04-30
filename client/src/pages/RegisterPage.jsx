import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate     = useNavigate()

  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) return toast.error('Passwords do not match')
    if (form.password.length < 6)       return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      toast.success('Account created! Welcome!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center mb-6">
            <Link to="/" className="text-2xl font-bold text-orange-500">Shop<span className="text-gray-800">Zone</span></Link>
            <h1 className="text-xl font-semibold text-gray-800 mt-3">Create your account</h1>
            <p className="text-sm text-gray-500 mt-1">Join thousands of happy shoppers!</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              ['name',     'Full Name',        'text',     'John Doe'],
              ['email',    'Email Address',    'email',    'you@example.com'],
              ['password', 'Password',         'password', '••••••••'],
              ['confirm',  'Confirm Password', 'password', '••••••••'],
            ].map(([key, label, type, placeholder]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  type={type} required
                  value={form[key]}
                  onChange={set(key)}
                  placeholder={placeholder}
                  className="input-field"
                />
              </div>
            ))}

            <p className="text-xs text-gray-400">
              By registering you agree to our{' '}
              <a href="#" className="text-orange-500 hover:underline">Terms of Service</a> and{' '}
              <a href="#" className="text-orange-500 hover:underline">Privacy Policy</a>.
            </p>

            <button type="submit" disabled={loading} className="btn-primary w-full text-base py-3">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-orange-500 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
