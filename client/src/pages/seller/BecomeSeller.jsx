// client/src/pages/seller/BecomeSeller.jsx  ← NEW FILE
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiShoppingBag, FiCheckCircle } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const BENEFITS = [
  '✅ List unlimited products',
  '✅ Your own store dashboard',
  '✅ Real-time sales analytics',
  '✅ AI-powered product recommendations',
  '✅ Secure payouts',
  '✅ 24/7 seller support',
]

export default function BecomeSeller() {
  const { user, becomeSeller, isSeller } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ storeName: '', description: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  if (isSeller) {
    navigate('/seller')
    return null
  }

  if (user?.role === 'seller' && !user?.sellerInfo?.approved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow p-10 text-center max-w-md">
          <FiCheckCircle className="text-yellow-500 text-5xl mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
          <p className="text-gray-500">Your seller application is pending admin review. You'll receive an email once approved.</p>
        </div>
      </div>
    )
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.storeName.trim()) return toast.error('Store name required')
    setLoading(true)
    try {
      await becomeSeller(form.storeName, form.description)
      setDone(true)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (done) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow p-10 text-center max-w-md">
        <FiCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
        <p className="text-gray-500">Our team will review your application and email you within 24 hours.</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 grid md:grid-cols-2 gap-10 items-start">
        {/* Left: Benefits */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
              <FiShoppingBag className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Become a Seller</h1>
              <p className="text-gray-500 text-sm">Join thousands of sellers on ShopZone</p>
            </div>
          </div>
          <div className="space-y-3">
            {BENEFITS.map(b => (
              <p key={b} className="text-gray-700">{b}</p>
            ))}
          </div>
          <div className="mt-8 bg-orange-50 border border-orange-200 rounded-2xl p-5">
            <p className="text-sm text-orange-700 font-medium">🎉 Zero commission on first 50 sales!</p>
            <p className="text-xs text-orange-600 mt-1">Start selling today — our team reviews applications within 24 hours.</p>
          </div>
        </div>

        {/* Right: Form */}
        <div className="bg-white rounded-2xl shadow p-8 border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-5">Store Information</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Store Name *</label>
              <input
                value={form.storeName}
                onChange={e => setForm(f => ({ ...f, storeName: e.target.value }))}
                className="input" placeholder="e.g. Himalayan Crafts" required
              />
            </div>
            <div>
              <label className="label">Store Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="input min-h-[100px]"
                placeholder="Tell buyers what you sell..."
              />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl disabled:opacity-50 transition">
              {loading ? 'Submitting...' : 'Apply to Become a Seller'}
            </button>
            <p className="text-xs text-gray-400 text-center">
              By applying you agree to our <a href="#" className="underline">Seller Terms</a>.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
