import { useState, useEffect } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave } from 'react-icons/fi'
import api from '../../api/axios'
import AdminLayout from './AdminLayout'
import toast from 'react-hot-toast'

const EMPTY = {
  name: '', description: '', price: '', comparePrice: '', category: '',
  brand: '', stock: '', images: '', isFeatured: false, isActive: true,
}

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(false)
  const [form, setForm]         = useState(EMPTY)
  const [editId, setEditId]     = useState(null)
  const [saving, setSaving]     = useState(false)
  const [search, setSearch]     = useState('')

  const load = () => {
    setLoading(true)
    api.get('/admin/products').then(r => setProducts(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openAdd  = () => { setForm(EMPTY); setEditId(null); setModal(true) }
  const openEdit = (p) => {
    setForm({ ...p, images: p.images?.join(', ') || '', price: String(p.price), comparePrice: String(p.comparePrice || ''), stock: String(p.stock) })
    setEditId(p._id)
    setModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        price:        Number(form.price),
        comparePrice: Number(form.comparePrice) || 0,
        stock:        Number(form.stock),
        images:       form.images.split(',').map(s => s.trim()).filter(Boolean),
      }
      if (editId) await api.put(`/admin/products/${editId}`, payload)
      else        await api.post('/admin/products', payload)
      toast.success(editId ? 'Product updated!' : 'Product created!')
      setModal(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return
    try {
      await api.delete(`/admin/products/${id}`)
      toast.success('Product deleted')
      load()
    } catch { toast.error('Delete failed') }
  }

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.type === 'checkbox' ? e.target.checked : e.target.value }))

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminLayout title="Manage Products">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search products..."
          className="input-field flex-1"
        />
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 whitespace-nowrap">
          <FiPlus size={16} /> Add Product
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Product</th>
                <th className="px-4 py-3 text-left font-medium">Category</th>
                <th className="px-4 py-3 text-left font-medium">Price</th>
                <th className="px-4 py-3 text-left font-medium">Stock</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">No products found</td></tr>
              ) : filtered.map(p => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.images?.[0] || 'https://placehold.co/40x40?text=?'} alt={p.name}
                        className="w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0" />
                      <span className="font-medium text-gray-800 max-w-[180px] truncate">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.category}</td>
                  <td className="px-4 py-3 font-medium">${p.price.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors">
                        <FiEdit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(p._id, p.name)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors">
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b sticky top-0 bg-white">
              <h3 className="font-semibold text-gray-800 text-lg">{editId ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Product Name *</label>
                  <input className="input-field" required value={form.name} onChange={set('name')} placeholder="iPhone 15 Pro Max" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Description *</label>
                  <textarea className="input-field resize-none" rows={3} required value={form.description} onChange={set('description')} />
                </div>
                {[
                  ['price',        'Price ($) *',      'number', '0'],
                  ['comparePrice', 'Compare Price ($)', 'number', '0'],
                  ['category',     'Category *',       'text',   'Electronics'],
                  ['brand',        'Brand',            'text',   'Apple'],
                  ['stock',        'Stock Quantity *', 'number', '0'],
                ].map(([key, label, type, placeholder]) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                    <input className="input-field" type={type} placeholder={placeholder}
                      value={form[key]} onChange={set(key)} required={label.endsWith('*')} />
                  </div>
                ))}
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Image URLs (comma-separated)</label>
                  <input className="input-field" value={form.images} onChange={set('images')}
                    placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="featured" checked={form.isFeatured} onChange={set('isFeatured')} className="accent-orange-500" />
                  <label htmlFor="featured" className="text-sm text-gray-700">Featured Product</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="active" checked={form.isActive} onChange={set('isActive')} className="accent-orange-500" />
                  <label htmlFor="active" className="text-sm text-gray-700">Active (visible)</label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="btn-outline flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <FiSave size={14} /> {saving ? 'Saving...' : editId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
