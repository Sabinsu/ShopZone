// client/src/pages/admin/AdminProducts.jsx
import { useEffect, useState } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import api from '../../api/axios'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { SkeletonTable } from '../../components/ui/Skeleton'
import ImageUpload from '../../components/ui/ImageUpload'
import Pagination from '../../components/ui/Pagination'
import toast from 'react-hot-toast'

const BLANK = {
  name: '', category: 'Electronics', price: '', comparePrice: '',
  stock: '', description: '', images: [], isFeatured: false,
}
const CATEGORIES = ['Electronics','Fashion','Home & Garden','Sports','Books','Beauty','Toys','Grocery','Other']
const LIMIT = 20

export default function AdminProducts() {
  const [products,   setProducts]   = useState([])
  const [total,      setTotal]      = useState(0)
  const [page,       setPage]       = useState(1)
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [showForm,   setShowForm]   = useState(false)
  const [form,       setForm]       = useState(BLANK)
  const [editing,    setEditing]    = useState(null)
  const [saving,     setSaving]     = useState(false)

  const load = (p = page) => {
    setLoading(true)
    api.get(`/admin/products?search=${encodeURIComponent(search)}&page=${p}&limit=${LIMIT}`)
      .then(r => { setProducts(r.data.products || r.data); setTotal(r.data.total || 0) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { setPage(1); load(1) }, [search])
  useEffect(() => { load(page) }, [page])

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
      load(page)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return
    try {
      await api.delete(`/admin/products/${id}`)
      toast.success('Product deleted')
      load(page)
    } catch { toast.error('Delete failed') }
  }

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content p-6">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem' }}>
          <div>
            <h1 style={{ fontSize:'1.5rem', fontWeight:800, color:'var(--text-1)' }}>Products</h1>
            <p style={{ fontSize:'0.8rem', color:'var(--text-3)', marginTop:2 }}>{total.toLocaleString()} total products</p>
          </div>
          <button onClick={openNew} className="btn-primary" style={{ padding:'10px 18px', fontSize:'0.85rem' }}>
            <FiPlus size={15}/> Add Product
          </button>
        </div>

        {/* Search */}
        <div style={{ position:'relative', marginBottom:'1.25rem', maxWidth:340 }}>
          <FiSearch style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-3)' }} size={14}/>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search products..." className="input" style={{ paddingLeft:36, paddingTop:8, paddingBottom:8, fontSize:'0.85rem' }}/>
        </div>

        {/* Table */}
        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          {loading ? <div style={{ padding:'1.5rem' }}><SkeletonTable/></div> : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Featured</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign:'center', padding:'3rem', color:'var(--text-3)' }}>No products found</td></tr>
                  ) : products.map(p => (
                    <tr key={p._id}>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <img src={p.images?.[0] || 'https://placehold.co/40x40/1A1A24/7A7268?text=?'} alt=""
                            style={{ width:40, height:40, objectFit:'cover', borderRadius:8, flexShrink:0, background:'var(--dark-4)' }}/>
                          <span style={{ fontWeight:600, fontSize:'0.85rem', color:'var(--text-1)' }} className="line-clamp-1">{p.name}</span>
                        </div>
                      </td>
                      <td><span className="badge-gray">{p.category}</span></td>
                      <td style={{ fontWeight:700, color:'var(--gold)' }}>Rs {p.price?.toLocaleString()}</td>
                      <td>
                        <span className={p.stock > 0 ? 'badge-green' : 'badge-red'}>
                          {p.stock > 0 ? p.stock : 'Out'}
                        </span>
                      </td>
                      <td>{p.isFeatured ? '⭐' : <span style={{ color:'var(--text-3)' }}>—</span>}</td>
                      <td>
                        <div style={{ display:'flex', gap:4 }}>
                          <button onClick={() => openEdit(p)} style={{ padding:'7px', borderRadius:8, background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.2)', color:'#60a5fa', cursor:'pointer' }}>
                            <FiEdit2 size={13}/>
                          </button>
                          <button onClick={() => handleDelete(p._id, p.name)} style={{ padding:'7px', borderRadius:8, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', color:'#f87171', cursor:'pointer' }}>
                            <FiTrash2 size={13}/>
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

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} loading={loading}/>

        {/* Modal */}
        {showForm && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(4px)', zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
            <div className="animate-slide-up" style={{ background:'var(--dark-3)', border:'1px solid var(--dark-5)', borderRadius:24, width:'100%', maxWidth:580, maxHeight:'92vh', overflowY:'auto', boxShadow:'0 24px 80px rgba(0,0,0,0.7)' }}>
              <div style={{ padding:'1.25rem 1.5rem', borderBottom:'1px solid var(--dark-5)', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, background:'var(--dark-3)', zIndex:10 }}>
                <h2 style={{ fontWeight:800, color:'var(--text-1)', fontSize:'1.1rem' }}>{editing ? 'Edit Product' : 'New Product'}</h2>
                <button onClick={() => setShowForm(false)} className="btn-ghost" style={{ padding:8 }}>✕</button>
              </div>
              <form onSubmit={handleSave} style={{ padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1.25rem' }}>
                <div>
                  <label className="label">Product Name *</label>
                  <input value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))}
                    className="input" required placeholder="e.g. iPhone 15 Pro"/>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                  <div>
                    <label className="label">Category *</label>
                    <select value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))} className="input">
                      {CATEGORIES.map(c => <option key={c} style={{ background:'var(--dark-3)' }}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Stock *</label>
                    <input type="number" value={form.stock} onChange={e => setForm(f=>({...f,stock:e.target.value}))}
                      className="input" required placeholder="0"/>
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                  <div>
                    <label className="label">Price (Rs) *</label>
                    <input type="number" value={form.price} onChange={e => setForm(f=>({...f,price:e.target.value}))}
                      className="input" required placeholder="999"/>
                  </div>
                  <div>
                    <label className="label">Compare Price</label>
                    <input type="number" value={form.comparePrice} onChange={e => setForm(f=>({...f,comparePrice:e.target.value}))}
                      className="input" placeholder="1299"/>
                  </div>
                </div>
                <div>
                  <label className="label">Description</label>
                  <textarea value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))}
                    rows={3} className="input" style={{ resize:'none' }} placeholder="Product description..."/>
                </div>
                <div>
                  <label className="label">Product Images</label>
                  <ImageUpload
                    images={form.images || []}
                    onChange={imgs => setForm(f=>({...f, images: imgs}))}
                    uploadEndpoint="/upload"
                    maxImages={5}
                  />
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <input type="checkbox" id="featured" checked={form.isFeatured}
                    onChange={e => setForm(f=>({...f,isFeatured:e.target.checked}))}
                    style={{ width:16, height:16, accentColor:'var(--gold)', cursor:'pointer' }}/>
                  <label htmlFor="featured" style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--text-2)', cursor:'pointer' }}>Mark as Featured</label>
                </div>
                <div style={{ display:'flex', gap:10 }}>
                  <button type="button" onClick={() => setShowForm(false)} className="btn-ghost" style={{ flex:1, border:'1px solid var(--dark-5)' }}>Cancel</button>
                  <button type="submit" disabled={saving} className="btn-primary" style={{ flex:1 }}>
                    {saving ? <span className="spinner"/> : editing ? 'Update Product' : 'Create Product'}
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
