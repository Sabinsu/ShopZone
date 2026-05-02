// client/src/pages/seller/BecomeSeller.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiShoppingBag, FiCheckCircle } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function BecomeSeller() {
  const { user, becomeSeller } = useAuth()
  const navigate = useNavigate()
  const [form, setForm]       = useState({ storeName: '', description: '' })
  const [loading, setLoading] = useState(false)

  if (user?.role === 'seller') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-center px-4">
        <div>
          <FiCheckCircle size={48} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">You're a Seller!</h2>
          <p className="text-gray-500 mb-4">Your seller account is{user?.sellerInfo?.approved ? ' active' : ' pending approval'}.</p>
          <button onClick={() => navigate('/seller')} className="btn-primary">Go to Seller Panel</button>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.storeName.trim()) { toast.error('Store name is required'); return }
    setLoading(true)
    try {
      await becomeSeller(form.storeName, form.description)
      toast.success('Seller application submitted!')
      navigate('/seller')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Application failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <span className="text-6xl">🏪</span>
        <h1 className="text-3xl font-extrabold text-gray-900 mt-4 mb-2">Start Selling on ShopZone</h1>
        <p className="text-gray-500">Join thousands of sellers and grow your business</p>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { emoji: '📦', title: 'Easy Listing', desc: 'Add products in minutes' },
          { emoji: '💰', title: 'Great Revenue', desc: 'Competitive commission' },
          { emoji: '📊', title: 'Analytics', desc: 'Track your performance' },
        ].map(b => (
          <div key={b.title} className="card-sm text-center">
            <p className="text-3xl mb-2">{b.emoji}</p>
            <p className="font-semibold text-sm text-gray-800">{b.title}</p>
            <p className="text-xs text-gray-400 mt-1">{b.desc}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
          <FiShoppingBag className="text-orange-500" /> Seller Application
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Store Name *</label>
            <input
              value={form.storeName}
              onChange={e => setForm(f => ({ ...f, storeName: e.target.value }))}
              placeholder="e.g. TechMart Nepal"
              className="input" required
            />
          </div>
          <div>
            <label className="label">Store Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Tell customers about your store and what you sell..."
              rows={4} className="input resize-none"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
            {loading ? <span className="spinner w-5 h-5" /> : '🚀 Submit Application'}
          </button>
          <p className="text-xs text-gray-400 text-center">Applications are reviewed within 24 hours</p>
        </form>
      </div>
    </div>
  )
}
