// client/src/pages/admin/AdminProducts.jsx
import { useEffect, useState } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi'
import api from '../../api/axios'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { SkeletonTable } from '../../components/ui/Skeleton'
import toast from 'react-hot-toast'

const BLANK = {
  name: '', category: 'Electronics', price: '', comparePrice: '',
  stock: '', description: '', images: [], isFeatured: false,
}
const CATEGORIES = ['Electronics','Fashion','Home & Garden','Sports','Books','Beauty','Toys','Grocery','Other']

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form,     setForm]     = useState(BLANK)
  const [editing,  setEditing]  = useState(null)
  const [saving,   setSaving]   = useState(false)

  const load = () => {
    setLoading(true)
    api.get(`/admin/products?search=${search}`)
      .then(r => setProducts(r.data.products || r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }
  useEffect(load, [search])

  const openNew  = () => { setForm(BLANK); setEditing(null); setShowForm(true) }
  const openEdit = (p) => { setForm({ ...p, images: p.images || [] }); setEditing(p._id); setShowForm(true) }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        await api.put(`/admin/products/${editing}`, form)
        toast.success('Product updated')
      } else {
        await api.post('/admin/products', form)
        toast.success('Product created')
      }
      setShowForm(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return
    try {
      await api.delete(`/admin/products/${id}`)
      toast.success('Product deleted')
      setProducts(p => p.filter(x => x._id !== id))
    } catch { toast.error('Delete failed') }
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <button onClick={openNew} className="btn-primary py-2 px-4 text-sm">
            <FiPlus size={15}/> Add Product
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-5 max-w-sm">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15}/>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search products..." className="input pl-9 py-2 text-sm" />
        </div>

        {/* Table */}
        <div className="card p-0 overflow-hidden">
          {loading ? <div className="p-6"><SkeletonTable/></div> : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Featured</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p._id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <img src={p.images?.[0] || '/placeholder.png'} alt=""
                            className="w-10 h-10 object-cover rounded-lg bg-gray-50 flex-shrink-0"/>
                          <span className="font-medium text-sm line-clamp-1 max-w-[180px]">{p.name}</span>
                        </div>
                      </td>
                      <td><span className="badge-gray text-xs">{p.category}</span></td>
                      <td className="font-semibold">Rs {p.price?.toLocaleString()}</td>
                      <td>
                        <span className={p.stock > 0 ? 'badge-green' : 'badge-red'}>
                          {p.stock > 0 ? p.stock : 'Out'}
                        </span>
                      </td>
                      <td>{p.isFeatured ? '⭐' : '—'}</td>
                      <td>
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(p)} className="btn-ghost p-2 text-blue-500 hover:bg-blue-50">
                            <FiEdit2 size={14}/>
                          </button>
                          <button onClick={() => handleDelete(p._id, p.name)} className="btn-ghost p-2 text-red-500 hover:bg-red-50">
                            <FiTrash2 size={14}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Product form modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-xl animate-fade-in">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="font-bold text-gray-900">{editing ? 'Edit Product' : 'New Product'}</h2>
                <button onClick={() => setShowForm(false)} className="btn-ghost p-2">✕</button>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div>
                  <label className="label">Product Name *</label>
                  <input value={form.name} onChange={e => setForm(f=>({...f, name: e.target.value}))}
                    className="input" required placeholder="e.g. iPhone 15 Pro"/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Category *</label>
                    <select value={form.category} onChange={e => setForm(f=>({...f, category: e.target.value}))} className="input">
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Stock *</label>
                    <input type="number" value={form.stock} onChange={e => setForm(f=>({...f, stock: e.target.value}))}
                      className="input" required placeholder="0"/>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Price (Rs) *</label>
                    <input type="number" value={form.price} onChange={e => setForm(f=>({...f, price: e.target.value}))}
                      className="input" required placeholder="999"/>
                  </div>
                  <div>
                    <label className="label">Compare Price</label>
                    <input type="number" value={form.comparePrice} onChange={e => setForm(f=>({...f, comparePrice: e.target.value}))}
                      className="input" placeholder="1299"/>
                  </div>
                </div>
                <div>
                  <label className="label">Description</label>
                  <textarea value={form.description} onChange={e => setForm(f=>({...f, description: e.target.value}))}
                    rows={3} className="input resize-none" placeholder="Product description..."/>
                </div>
                <div>
                  <label className="label">Image URLs (one per line)</label>
                  <textarea
                    value={form.images?.join('\n')}
                    onChange={e => setForm(f => ({ ...f, images: e.target.value.split('\n').filter(Boolean) }))}
                    rows={3} className="input resize-none font-mono text-xs"
                    placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"/>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="featured" checked={form.isFeatured}
                    onChange={e => setForm(f=>({...f, isFeatured: e.target.checked}))}
                    className="w-4 h-4 accent-orange-500"/>
                  <label htmlFor="featured" className="text-sm font-medium text-gray-700 cursor-pointer">Mark as Featured</label>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="btn-ghost flex-1">Cancel</button>
                  <button type="submit" disabled={saving} className="btn-primary flex-1">
                    {saving ? <span className="spinner w-4 h-4"/> : editing ? 'Update Product' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
