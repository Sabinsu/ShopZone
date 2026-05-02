// client/src/pages/seller/SellerProductForm.jsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const CATEGORIES = ['Electronics','Fashion','Home & Garden','Sports','Books','Beauty','Toys','Grocery','Other']
const BLANK = { name: '', category: 'Electronics', price: '', comparePrice: '', stock: '', description: '', images: [] }

export default function SellerProductForm() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const isEdit   = !!id

  const [form,    setForm]    = useState(BLANK)
  const [loading, setLoading] = useState(isEdit)
  const [saving,  setSaving]  = useState(false)

  useEffect(() => {
    if (isEdit) {
      api.get(`/products/${id}`)
        .then(r => setForm({ ...r.data, images: r.data.images || [] }))
        .catch(() => toast.error('Failed to load product'))
        .finally(() => setLoading(false))
    }
  }, [id, isEdit])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (isEdit) {
        await api.put(`/seller/products/${id}`, form)
        toast.success('Product updated!')
      } else {
        await api.post('/seller/products', form)
        toast.success('Product created!')
      }
      navigate('/seller')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally { setSaving(false) }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="spinner" /></div>

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/seller')} className="btn-ghost p-2">←</button>
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div>
          <label className="label">Product Name *</label>
          <input value={form.name} onChange={e => set('name', e.target.value)}
            className="input" placeholder="e.g. Wireless Headphones" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Category *</label>
            <select value={form.category} onChange={e => set('category', e.target.value)} className="input">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Stock Quantity *</label>
            <input type="number" min="0" value={form.stock} onChange={e => set('stock', e.target.value)}
              className="input" placeholder="0" required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Selling Price (Rs) *</label>
            <input type="number" min="1" value={form.price} onChange={e => set('price', e.target.value)}
              className="input" placeholder="999" required />
          </div>
          <div>
            <label className="label">Original Price (Rs)</label>
            <input type="number" value={form.comparePrice} onChange={e => set('comparePrice', e.target.value)}
              className="input" placeholder="1299 (for discount badge)" />
          </div>
        </div>

        <div>
          <label className="label">Description</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)}
            rows={4} className="input resize-none"
            placeholder="Describe your product in detail — features, specs, what's in the box..." />
        </div>

        <div>
          <label className="label">Image URLs <span className="text-gray-400 font-normal">(one per line, first is main image)</span></label>
          <textarea
            value={form.images?.join('\n')}
            onChange={e => set('images', e.target.value.split('\n').filter(Boolean))}
            rows={4} className="input resize-none font-mono text-xs"
            placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
          />
          {form.images?.[0] && (
            <div className="mt-2 flex gap-2 overflow-x-auto">
              {form.images.filter(Boolean).map((img, i) => (
                <img key={i} src={img} alt=""
                  className="w-16 h-16 object-cover rounded-lg bg-gray-50 flex-shrink-0 border border-gray-200"
                  onError={e => e.target.style.display='none'}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="feat" checked={!!form.isFeatured}
            onChange={e => set('isFeatured', e.target.checked)}
            className="w-4 h-4 accent-orange-500" />
          <label htmlFor="feat" className="text-sm font-medium text-gray-700 cursor-pointer">Mark as Featured Product</label>
        </div>

        <div className="flex gap-3 pt-2 border-t border-gray-100">
          <button type="button" onClick={() => navigate('/seller')} className="btn-ghost flex-1">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1 py-3">
            {saving ? <span className="spinner w-5 h-5" /> : isEdit ? '✅ Update Product' : '🚀 Create Product'}
          </button>
        </div>
      </form>
    </div>
  )
}
