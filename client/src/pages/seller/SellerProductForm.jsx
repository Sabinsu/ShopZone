// client/src/pages/seller/SellerProductForm.jsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import ImageUpload from '../../components/ui/ImageUpload'

const CATEGORIES = ['Electronics','Fashion','Home & Garden','Sports','Books','Beauty','Toys','Grocery','Other']
const BLANK = { name: '', category: 'Electronics', price: '', comparePrice: '', stock: '', description: '', images: [], isFeatured: false }

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
    if (!form.name.trim()) return toast.error('Product name is required')
    if (!form.price || isNaN(form.price)) return toast.error('Valid price is required')
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

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'60vh' }}>
      <div className="spinner" style={{ width:32, height:32, borderTopColor:'var(--gold)' }}/>
    </div>
  )

  return (
    <div style={{ maxWidth:660, margin:'0 auto', padding:'2rem 1.25rem' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:'1.75rem' }}>
        <button onClick={() => navigate('/seller')} className="btn-ghost" style={{ padding:'8px 12px', border:'1px solid var(--dark-5)' }}>←</button>
        <div>
          <h1 style={{ fontSize:'1.5rem', fontWeight:800, color:'var(--text-1)' }}>{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
          <p style={{ fontSize:'0.8rem', color:'var(--text-3)', marginTop:2 }}>
            {isEdit ? 'Update your product details' : 'List a new product in your store'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
        {/* Name */}
        <div>
          <label className="label">Product Name *</label>
          <input value={form.name} onChange={e => set('name', e.target.value)}
            className="input" placeholder="e.g. Wireless Headphones Pro" required />
        </div>

        {/* Category + Stock */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          <div>
            <label className="label">Category *</label>
            <select value={form.category} onChange={e => set('category', e.target.value)} className="input"
              style={{ background:'var(--input-bg)' }}>
              {CATEGORIES.map(c => <option key={c} style={{ background:'var(--dark-3)' }}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Stock Quantity *</label>
            <input type="number" min="0" value={form.stock} onChange={e => set('stock', e.target.value)}
              className="input" placeholder="0" required />
          </div>
        </div>

        {/* Price */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          <div>
            <label className="label">Selling Price (Rs) *</label>
            <input type="number" min="1" value={form.price} onChange={e => set('price', e.target.value)}
              className="input" placeholder="999" required />
          </div>
          <div>
            <label className="label">Original Price (Rs)</label>
            <input type="number" value={form.comparePrice} onChange={e => set('comparePrice', e.target.value)}
              className="input" placeholder="1299 (shows discount)" />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="label">Description</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)}
            rows={4} className="input" style={{ resize:'none' }}
            placeholder="Describe your product — features, specs, what's included..." />
        </div>

        {/* Images */}
        <div>
          <label className="label">Product Images <span style={{ color:'var(--text-3)', fontWeight:400 }}>(up to 5, first = main)</span></label>
          <ImageUpload
            images={form.images || []}
            onChange={imgs => set('images', imgs)}
            uploadEndpoint="/upload"
            maxImages={5}
          />
        </div>

        {/* Featured */}
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <input type="checkbox" id="feat" checked={!!form.isFeatured}
            onChange={e => set('isFeatured', e.target.checked)}
            style={{ width:16, height:16, accentColor:'var(--gold)', cursor:'pointer' }} />
          <label htmlFor="feat" style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--text-2)', cursor:'pointer' }}>
            Mark as Featured Product
          </label>
        </div>

        {/* Actions */}
        <div style={{ display:'flex', gap:12, paddingTop:8, borderTop:'1px solid var(--dark-5)' }}>
          <button type="button" onClick={() => navigate('/seller')} className="btn-ghost" style={{ flex:1, border:'1px solid var(--dark-5)' }}>Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary" style={{ flex:2, padding:'13px' }}>
            {saving
              ? <><span className="spinner" style={{ borderTopColor:'#0A0A0F' }}/> Saving...</>
              : isEdit ? '✅ Update Product' : '🚀 Publish Product'
            }
          </button>
        </div>
      </form>
    </div>
  )
}
