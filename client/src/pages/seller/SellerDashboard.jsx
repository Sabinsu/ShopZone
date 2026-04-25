// client/src/pages/seller/SellerDashboard.jsx  ← NEW FILE
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiPackage, FiDollarSign, FiEye, FiTrendingUp, FiPlus, FiEdit } from 'react-icons/fi'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6 flex items-center gap-4 border border-gray-100">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
        <Icon className="text-white text-xl" />
      </div>
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  )
}

export default function SellerDashboard() {
  const { user } = useAuth()
  const [stats,    setStats]    = useState(null)
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/seller/stats'),
      api.get('/seller/products'),
    ]).then(([s, p]) => {
      setStats(s.data)
      setProducts(p.data)
    }).catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return
    try {
      await api.delete(`/products/${id}`)
      setProducts(p => p.filter(x => x._id !== id))
      toast.success('Product deleted')
    } catch { toast.error('Delete failed') }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="spinner" /></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
            <p className="text-gray-500 mt-1">
              {user?.sellerInfo?.storeName || user?.name}'s Store
              {!user?.sellerInfo?.approved && (
                <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Pending Approval</span>
              )}
            </p>
          </div>
          <Link to="/seller/products/new"
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-medium transition">
            <FiPlus /> Add Product
          </Link>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard icon={FiPackage}    label="Products"     value={stats.totalProducts} color="bg-blue-500" />
            <StatCard icon={FiDollarSign} label="Revenue"      value={`$${stats.totalRevenue?.toFixed(0)}`} color="bg-green-500" />
            <StatCard icon={FiTrendingUp} label="Units Sold"   value={stats.totalSold}     color="bg-purple-500" />
            <StatCard icon={FiEye}        label="Total Views"  value={stats.totalViews}    color="bg-orange-500" />
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">My Products ({products.length})</h2>
          </div>
          {products.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <FiPackage className="text-5xl mx-auto mb-4 opacity-30" />
              <p>No products yet.</p>
              <Link to="/seller/products/new" className="text-orange-500 font-medium mt-2 inline-block">Add your first product →</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-6 py-3 text-left">Product</th>
                    <th className="px-6 py-3 text-left">Price</th>
                    <th className="px-6 py-3 text-left">Stock</th>
                    <th className="px-6 py-3 text-left">Sold</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map(p => (
                    <tr key={p._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={p.images?.[0] || 'https://via.placeholder.com/40'} alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover" />
                          <div>
                            <p className="font-medium text-gray-900 max-w-xs truncate">{p.name}</p>
                            <p className="text-gray-400 text-xs">{p.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium">${p.price}</td>
                      <td className="px-6 py-4">
                        <span className={`font-medium ${p.stock < 5 ? 'text-red-500' : 'text-gray-700'}`}>{p.stock}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{p.sold}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          p.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>{p.isActive ? 'Active' : 'Inactive'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Link to={`/seller/products/edit/${p._id}`}
                            className="text-blue-600 hover:text-blue-800 p-1">
                            <FiEdit size={15} />
                          </Link>
                          <button onClick={() => deleteProduct(p._id)}
                            className="text-red-500 hover:text-red-700 p-1 text-xs font-medium">
                            Delete
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
      </div>
    </div>
  )
}
