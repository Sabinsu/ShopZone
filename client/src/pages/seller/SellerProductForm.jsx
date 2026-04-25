// client/src/pages/seller/SellerProductForm.jsx  ← NEW FILE
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FiUpload, FiX, FiSave } from 'react-icons/fi'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const CATEGORIES = [
  'Electronics','Computers','Footwear','Clothing','Home & Kitchen',
  'Sports','Books','Accessories','Health & Beauty','Food & Grocery',
  'Automotive','Other',
]

export default function SellerProductForm() {
  const { id }     = useParams()     // if id exists → edit mode
  const navigate   = useNavigate()
  const isEdit     = Boolean(id)

  const [form, setForm] = useState({
    name: '', description: '', price: '', comparePrice: '',
    category: '', subCategory: '', brand: '', stock: '',
    tags: '', isFeatured: false, isActive: true,
  })
  const [images,    setImages]  = useState([])   // File objects
  const [previews,  setPreviews]= useState([])   // URL strings (existing)
  const [loading,   setLoading] = useState(false)
  const [fetching,  setFetching]= useState(isEdit)

  useEffect(() => {
    if (!isEdit) return
    api.get(`/products/${id}`)
      .then(({ data }) => {
        setForm({
          name:         data.name,
          description:  data.description,
          price:        data.price,
          comparePrice: data.comparePrice || '',
          category:     data.category,
          subCategory:  data.subCategory || '',
          brand:        data.brand || '',
          stock:        data.stock,
          tags:         data.tags?.join(', ') || '',
          isFeatured:   data.isFeatured,
          isActive:     data.isActive,
        })
        setPreviews(data.images || [])
      })
      .catch(() => toast.error('Failed to load product'))
      .finally(() => setFetching(false))
  }, [id, isEdit])

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleFiles = e => {
    const files = Array.from(e.target.files).slice(0, 5 - previews.length)
    setImages(prev => [...prev, ...files])
  }

  const removeNewImage = idx => setImages(prev => prev.filter((_, i) => i !== idx))
  const removeExistingImage = idx => setPreviews(prev => prev.filter((_, i) => i !== idx))

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.name || !form.description || !form.price || !form.category)
      return toast.error('Name, description, price, and category are required')

    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      // send remaining existing image URLs as JSON
      fd.append('existingImages', JSON.stringify(previews))
      fd.append('tags', JSON.stringify(form.tags.split(',').map(t => t.trim()).filter(Boolean)))
      images.forEach(f => fd.append('images', f))

      if (isEdit) {
        await api.put(`/products/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Product updated!')
      } else {
        await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Product created!')
      }
      navigate('/seller')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <div className="min-h-screen flex items-center justify-center"><div className="spinner" /></div>

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {isEdit ? 'Edit Product' : 'Add New Product'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-2xl shadow p-6 border border-gray-100 space-y-4">
            <h2 className="font-semibold text-gray-700">Basic Information</h2>
            <div>
              <label className="label">Product Name *</label>
              <input name="name" value={form.name} onChange={handleChange}
                className="input" placeholder="e.g. Nike Air Max 270" required />
            </div>
            <div>
              <label className="label">Description *</label>
              <textarea name="description" value={form.description} onChange={handleChange}
                className="input min-h-[100px]" placeholder="Describe your product..." required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Price ($) *</label>
                <input name="price" type="number" step="0.01" min="0" value={form.price}
                  onChange={handleChange} className="input" placeholder="29.99" required />
              </div>
              <div>
                <label className="label">Compare Price ($)</label>
                <input name="comparePrice" type="number" step="0.01" min="0" value={form.comparePrice}
                  onChange={handleChange} className="input" placeholder="39.99" />
              </div>
            </div>
          </div>

          {/* Category & Details */}
          <div className="bg-white rounded-2xl shadow p-6 border border-gray-100 space-y-4">
            <h2 className="font-semibold text-gray-700">Category & Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Category *</label>
                <select name="category" value={form.category} onChange={handleChange} className="input" required>
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Stock *</label>
                <input name="stock" type="number" min="0" value={form.stock}
                  onChange={handleChange} className="input" placeholder="100" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Brand</label>
                <input name="brand" value={form.brand} onChange={handleChange}
                  className="input" placeholder="Nike, Apple, etc." />
              </div>
              <div>
                <label className="label">Sub-Category</label>
                <input name="subCategory" value={form.subCategory} onChange={handleChange}
                  className="input" placeholder="Sneakers, Laptops, etc." />
              </div>
            </div>
            <div>
              <label className="label">Tags (comma separated)</label>
              <input name="tags" value={form.tags} onChange={handleChange}
                className="input" placeholder="sale, trending, summer" />
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="w-4 h-4 accent-orange-500" />
                <span className="text-sm text-gray-700">Active (visible to buyers)</span>
              </label>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
            <h2 className="font-semibold text-gray-700 mb-4">Product Images</h2>
            <div className="flex flex-wrap gap-3 mb-4">
              {previews.map((url, i) => (
                <div key={i} className="relative w-20 h-20">
                  <img src={url} alt="" className="w-full h-full object-cover rounded-xl border" />
                  <button type="button" onClick={() => removeExistingImage(i)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    <FiX />
                  </button>
                </div>
              ))}
              {images.map((f, i) => (
                <div key={`new-${i}`} className="relative w-20 h-20">
                  <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover rounded-xl border border-blue-300" />
                  <button type="button" onClick={() => removeNewImage(i)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    <FiX />
                  </button>
                </div>
              ))}
              {(previews.length + images.length) < 5 && (
                <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 transition">
                  <FiUpload className="text-gray-400 text-xl" />
                  <span className="text-gray-400 text-xs mt-1">Upload</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
                </label>
              )}
            </div>
            <p className="text-xs text-gray-400">Max 5 images, 5MB each. Uploaded to Cloudinary.</p>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition">
            {loading ? 'Saving...' : <><FiSave />{isEdit ? 'Update Product' : 'Create Product'}</>}
          </button>
        </form>
      </div>
    </div>
  )
}
