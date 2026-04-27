import AdminLayout from '../../components/admin/AdminLayout';
import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [page,     setPage]     = useState(1);
  const [pages,    setPages]    = useState(1);
  const [deleting, setDeleting] = useState(null);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const q = new URLSearchParams({ page, limit: 15 });
    if (search) q.set('search', search);
    api.get(`/admin/products?${q}`)
      .then(r => { setProducts(r.data.products || []); setPages(r.data.pages || 1); })
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await api.delete(`/admin/products/${id}`);
      toast.success('Product deleted');
      setProducts(prev => prev.filter(p => p._id !== id));
    } catch { toast.error('Delete failed'); }
    finally { setDeleting(null); }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Link to="/seller/products/new" className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm">
          <FiPlus size={16}/> Add Product
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15}/>
        <input
          type="text" placeholder="Search products..."
          value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-orange-400"
        />
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(8)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse"/>)}</div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Product', 'Category', 'Price', 'Stock', 'Sold', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400">No products found</td></tr>
              ) : products.map(p => (
                <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.images?.[0] || 'https://via.placeholder.com/40'}
                        alt={p.name}
                        className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0"
                      />
                      <div>
                        <p className="font-medium text-gray-800 line-clamp-1 max-w-[200px]">{p.name}</p>
                        <p className="text-xs text-gray-400">{p._id.slice(-6)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-600 capitalize">{p.category}</td>
                  <td className="px-5 py-3 font-semibold text-gray-800">${p.price?.toFixed(2)}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${p.stock > 10 ? 'bg-green-100 text-green-700' : p.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{p.sold || 0}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/seller/products/edit/${p._id}`)}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      ><FiEdit2 size={15}/></button>
                      <button
                        onClick={() => handleDelete(p._id, p.name)}
                        disabled={deleting === p._id}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                        title="Delete"
                      ><FiTrash2 size={15}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {[...Array(pages)].map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              className={`w-9 h-9 rounded-lg text-sm font-medium border transition-colors ${page === i + 1 ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-300 hover:border-orange-400'}`}
            >{i + 1}</button>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
