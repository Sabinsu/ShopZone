// client/src/pages/admin/AdminAnalytics.jsx  ← NEW FILE
// Add to AdminLayout: <Route path="/admin/analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
import { useState, useEffect } from 'react'
import { FiUsers, FiPackage, FiShoppingCart, FiDollarSign, FiTrendingUp, FiClock } from 'react-icons/fi'
import api from '../../api/axios'
import toast from 'react-hot-toast'

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="text-white text-lg" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-gray-500 text-sm mt-1">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

function SimpleBar({ data }) {
  const max = Math.max(...data.map(d => d.revenue), 1)
  return (
    <div className="flex items-end gap-3 h-40">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-xs text-gray-500">${d.revenue.toFixed(0)}</span>
          <div
            className="w-full bg-orange-400 rounded-t-lg transition-all"
            style={{ height: `${Math.max((d.revenue / max) * 120, 4)}px` }}
          />
          <span className="text-xs text-gray-500">{d.month}</span>
        </div>
      ))}
    </div>
  )
}

export default function AdminAnalytics() {
  const [data,    setData]    = useState(null)
  const [sellers, setSellers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/admin/analytics'),
      api.get('/admin/sellers'),
    ]).then(([a, s]) => {
      setData(a.data)
      setSellers(s.data)
    }).catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false))
  }, [])

  const approveSeller = async (id) => {
    try {
      await api.put(`/admin/sellers/${id}/approve`)
      setSellers(prev => prev.map(s => s._id === id ? { ...s, sellerInfo: { ...s.sellerInfo, approved: true } } : s))
      toast.success('Seller approved!')
    } catch { toast.error('Failed to approve') }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="spinner" /></div>
  if (!data)   return null

  const pendingSellers = sellers.filter(s => !s.sellerInfo?.approved)

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Admin Analytics</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatCard icon={FiUsers}       label="Total Users"    value={data.totalUsers}      color="bg-blue-500" />
          <StatCard icon={FiPackage}     label="Products"       value={data.totalProducts}   color="bg-purple-500" />
          <StatCard icon={FiShoppingCart}label="Orders"         value={data.totalOrders}     color="bg-green-500" />
          <StatCard icon={FiDollarSign}  label="Revenue"        value={`$${data.totalRevenue?.toFixed(0)}`} color="bg-orange-500" />
          <StatCard icon={FiClock}       label="Pending Orders" value={data.pendingOrders}   color="bg-red-500" />
          <StatCard icon={FiTrendingUp}  label="New Users"      value={data.newUsersThisMonth} sub="this month" color="bg-teal-500" />
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-6">Monthly Revenue (last 6 months)</h2>
            <SimpleBar data={data.monthlyRevenue || []} />
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-4">Top Selling Products</h2>
            <div className="space-y-3">
              {(data.topProducts || []).map((p, i) => (
                <div key={p._id} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-400 w-5">#{i + 1}</span>
                  <img src={p.images?.[0] || 'https://via.placeholder.com/40'} alt={p.name}
                    className="w-10 h-10 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.sold} sold • ${p.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pending Seller Approvals */}
        {pendingSellers.length > 0 && (
          <div className="bg-white rounded-2xl shadow p-6 border border-orange-200">
            <h2 className="font-semibold text-gray-900 mb-4">
              Pending Seller Approvals
              <span className="ml-2 bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">{pendingSellers.length}</span>
            </h2>
            <div className="space-y-3">
              {pendingSellers.map(s => (
                <div key={s._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-sm text-gray-900">{s.name} — <span className="text-orange-600">{s.sellerInfo?.storeName}</span></p>
                    <p className="text-xs text-gray-500">{s.email} • Applied {new Date(s.createdAt).toLocaleDateString()}</p>
                    {s.sellerInfo?.description && <p className="text-xs text-gray-500 mt-1 italic">"{s.sellerInfo.description}"</p>}
                  </div>
                  <button onClick={() => approveSeller(s._id)}
                    className="bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-1.5 rounded-lg font-medium transition ml-4 shrink-0">
                    Approve
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
