// client/src/pages/admin/AdminDashboard.jsx  ← REPLACE
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiShoppingBag, FiUsers, FiPackage, FiDollarSign, FiTrendingUp, FiAlertCircle } from 'react-icons/fi'
import api from '../../api/axios'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { SkeletonTable } from '../../components/ui/Skeleton'

export default function AdminDashboard() {
  const [stats,   setStats]   = useState(null)
  const [recent,  setRecent]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/orders?limit=5&sort=-createdAt'),
    ])
      .then(([s, o]) => {
        setStats(s.data)
        setRecent(o.data.orders || o.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const cards = stats ? [
    { icon: FiDollarSign, label: 'Total Revenue',  value: `Rs ${stats.totalRevenue?.toLocaleString()}`,  color: 'bg-green-500',  change: '+12%' },
    { icon: FiPackage,    label: 'Total Orders',   value: stats.totalOrders?.toLocaleString(),           color: 'bg-blue-500',   change: '+8%' },
    { icon: FiShoppingBag,label: 'Total Products', value: stats.totalProducts?.toLocaleString(),         color: 'bg-orange-500', change: '+3%' },
    { icon: FiUsers,      label: 'Total Users',    value: stats.totalUsers?.toLocaleString(),            color: 'bg-purple-500', change: '+5%' },
  ] : []

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">Welcome back, Admin 👋</p>
          </div>
          <span className="text-sm text-gray-400">{new Date().toLocaleDateString('en-NP', { dateStyle: 'long' })}</span>
        </div>

        {/* Stat cards */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {Array(4).fill(0).map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse"/>)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {cards.map(({ icon: Icon, label, value, color, change }) => (
              <div key={label} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">{label}</p>
                    <p className="text-2xl font-extrabold text-gray-900 mt-1">{value}</p>
                    <p className="text-xs text-green-600 font-medium mt-1">{change} this month</p>
                  </div>
                  <div className={`${color} w-10 h-10 rounded-xl flex items-center justify-center text-white`}>
                    <Icon size={18}/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick actions */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {[
            { to: '/admin/products', label: 'Manage Products', icon: FiShoppingBag, color: 'text-orange-500' },
            { to: '/admin/orders',   label: 'View Orders',     icon: FiPackage,     color: 'text-blue-500' },
            { to: '/admin/users',    label: 'Manage Users',    icon: FiUsers,       color: 'text-purple-500' },
          ].map(({ to, label, icon: Icon, color }) => (
            <Link key={to} to={to} className="card flex items-center gap-3 hover:shadow-md transition-shadow group">
              <div className={`${color} w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-orange-50`}>
                <Icon size={18}/>
              </div>
              <span className="font-semibold text-gray-800 text-sm">{label}</span>
            </Link>
          ))}
        </div>

        {/* Recent orders */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm text-orange-500 hover:text-orange-600">View all →</Link>
          </div>
          {loading ? <SkeletonTable rows={5}/> : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map(order => (
                    <tr key={order._id}>
                      <td>
                        <Link to={`/orders/${order._id}`} className="text-orange-500 font-mono text-xs hover:underline">
                          #{order._id.slice(-8).toUpperCase()}
                        </Link>
                      </td>
                      <td className="font-medium">{order.user?.name || 'Guest'}</td>
                      <td>{order.items?.length}</td>
                      <td className="font-bold">Rs {order.totalPrice?.toLocaleString()}</td>
                      <td><span className={`status-${order.status}`}>{order.status}</span></td>
                      <td className="text-gray-400 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
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
