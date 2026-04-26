import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiX, FiPlus } from 'react-icons/fi';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const CATEGORIES = ['Electronics','Fashion','Home','Sports','Books','Beauty','Jewelry','Automotive','Toys','Other'];

const EMPTY = {
  name: '', description: '', price: '', comparePrice: '',
  category: '', subCategory: '', brand: '', stock: '',
  images: [''], tags: '', isFeatured: false, isActive: true,
};

export default function SellerProductForm() {
  const { id }    = useParams(); // edit mode if id present
  const navigate  = useNavigate();
  const isEdit    = !!id;

  const [form,    setForm]    = useState(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/products/${id}`)
      .then(r => {
        const p = r.data;
        setForm({
          name: p.name || '', description: p.description || '',
          price: p.price || '', comparePrice: p.comparePrice || '',
          category: p.category || '', subCategory: p.subCategory || '',
          brand: p.brand || '', stock: p.stock ?? '',
          images: p.images?.length ? p.images : [''],
          tags: p.tags?.join(', ') || '',
          isFeatured: p.isFeatured || false,
          isActive: p.isActive !== false,
        });
      })
      .catch(() => { toast.error('Product not found'); navigate('/seller/products'); })
      .finally(() => setLoading(false));
  }, [id, isEdit, navigate]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = (i, val) => {
    setForm(f => { const imgs = [...f.images]; imgs[i] = val; return { ...f, images: imgs }; });
  };
  const addImage    = () => setForm(f => ({ ...f, images: [...f.images, ''] }));
  const removeImage = (i) => setForm(f => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category || !form.stock)
      return toast.error('Name, price, category and stock are required');

    setSaving(true);
    try {
      const payload = {
        ...form,
        price:        +form.price,
        comparePrice: +form.comparePrice || 0,
        stock:        +form.stock,
        images:       form.images.filter(Boolean),
        tags:         form.tags.split(',').map(t => t.trim()).filter(Boolean),
      };

      if (isEdit) {
        await api.put(`/seller/products/${id}`, payload);
        toast.success('Product updated!');
      } else {
        await api.post('/seller/products', payload);
        toast.success('Product created!');
      }
      navigate('/seller');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const inputCls = "w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100";
  const labelCls = "block text-xs font-semibold text-gray-600 mb-1";

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">
      {[...Array(6)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse"/>)}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{isEdit ? 'Edit Product' : 'New Product'}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>Product Name *</label>
              <input name="name" value={form.name} onChange={handleChange} className={inputCls} placeholder="Wireless Headphones Pro" required/>
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Description *</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={4} className={`${inputCls} resize-none`} placeholder="Describe your product..." required/>
            </div>
            <div>
              <label className={labelCls}>Category *</label>
              <select name="category" value={form.category} onChange={handleChange} required className={inputCls}>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Sub-category</label>
              <input name="subCategory" value={form.subCategory} onChange={handleChange} className={inputCls} placeholder="e.g. Headphones"/>
            </div>
            <div>
              <label className={labelCls}>Brand</label>
              <input name="brand" value={form.brand} onChange={handleChange} className={inputCls} placeholder="Apple, Sony..."/>
            </div>
            <div>
              <label className={labelCls}>Tags (comma-separated)</label>
              <input name="tags" value={form.tags} onChange={handleChange} className={inputCls} placeholder="wireless, audio, premium"/>
            </div>
          </div>
        </div>

        {/* Pricing & stock */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Pricing & Stock</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Price ($) *</label>
              <input type="number" name="price" value={form.price} onChange={handleChange} min="0" step="0.01" className={inputCls} placeholder="29.99" required/>
            </div>
            <div>
              <label className={labelCls}>Compare Price ($)</label>
              <input type="number" name="comparePrice" value={form.comparePrice} onChange={handleChange} min="0" step="0.01" className={inputCls} placeholder="49.99"/>
            </div>
            <div>
              <label className={labelCls}>Stock Quantity *</label>
              <input type="number" name="stock" value={form.stock} onChange={handleChange} min="0" className={inputCls} placeholder="100" required/>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Product Images</h2>
          <p className="text-xs text-gray-500 mb-3">Enter image URLs (Cloudinary, Imgur, etc.)</p>
          <div className="space-y-3">
            {form.images.map((img, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  type="url" value={img}
                  onChange={e => handleImageChange(i, e.target.value)}
                  className={inputCls} placeholder={`https://example.com/image-${i + 1}.jpg`}
                />
                {img && <img src={img} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0" onError={e => e.target.style.display='none'}/>}
                {form.images.length > 1 && (
                  <button type="button" onClick={() => removeImage(i)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg shrink-0"><FiX size={14}/></button>
                )}
              </div>
            ))}
            <button type="button" onClick={addImage} className="flex items-center gap-2 text-orange-500 text-sm font-medium hover:text-orange-600">
              <FiPlus size={15}/> Add Image URL
            </button>
          </div>
        </div>

        {/* Flags */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Visibility</h2>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="accent-orange-500 w-4 h-4"/>
              <span className="text-sm font-medium text-gray-700">Active (visible to customers)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange} className="accent-orange-500 w-4 h-4"/>
              <span className="text-sm font-medium text-gray-700">Featured on homepage</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button" onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-5 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          ><FiX size={15}/> Cancel</button>
          <button
            type="submit" disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
          ><FiSave size={15}/> {saving ? 'Saving…' : isEdit ? 'Update Product' : 'Create Product'}</button>
        </div>
      </form>
    </div>
  );
}
