// client/src/pages/seller/SellerDashboard.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiPlus, FiShoppingBag, FiDollarSign, FiPackage } from 'react-icons/fi'
import api from '../../api/axios'
import { SkeletonCard } from '../../components/ui/Skeleton'

export default function SellerDashboard() {
  const [products, setProducts] = useState([])
  const [stats,    setStats]    = useState(null)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/seller/products'),
      api.get('/seller/stats'),
    ])
      .then(([p, s]) => { setProducts(p.data); setStats(s.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage your store and products</p>
        </div>
        <Link to="/seller/products/new" className="btn-primary">
          <FiPlus size={16} /> Add Product
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { icon: FiShoppingBag, label: 'My Products', value: stats?.totalProducts ?? '—', color: 'bg-orange-500' },
          { icon: FiPackage,     label: 'Total Orders', value: stats?.totalOrders ?? '—',  color: 'bg-blue-500' },
          { icon: FiDollarSign,  label: 'Revenue',      value: stats?.revenue ? `Rs ${stats.revenue.toLocaleString()}` : '—', color: 'bg-green-500' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card">
            <div className="flex items-center gap-3">
              <div className={`${color} w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0`}>
                <Icon size={18} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-xl font-extrabold text-gray-900">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Products */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800">My Products</h2>
          <Link to="/seller/products/new" className="text-sm text-orange-500 hover:text-orange-600">+ Add New</Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No products yet</p>
            <Link to="/seller/products/new" className="btn-primary">Add Your First Product</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map(p => (
              <div key={p._id} className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                <img src={p.images?.[0] || '/placeholder.png'} alt={p.name}
                  className="w-full aspect-square object-cover bg-gray-50" />
                <div className="p-3">
                  <p className="text-sm font-semibold text-gray-800 line-clamp-1">{p.name}</p>
                  <p className="text-orange-600 font-bold text-sm mt-1">Rs {p.price?.toLocaleString()}</p>
                  <div className="flex gap-2 mt-2">
                    <Link to={`/seller/products/edit/${p._id}`}
                      className="text-xs text-blue-500 hover:underline">Edit</Link>
                    <span className={`text-xs ${p.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {p.stock > 0 ? `Stock: ${p.stock}` : 'Out of stock'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
