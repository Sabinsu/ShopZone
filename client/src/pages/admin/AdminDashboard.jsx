import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiShoppingBag, FiPackage, FiDollarSign, FiTrendingUp, FiAlertCircle } from 'react-icons/fi';
import api from '../../api/axios';

export default function AdminDashboard() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/analytics')
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = stats ? [
    { label: 'Total Revenue', value: `$${(stats.totalRevenue || 0).toFixed(2)}`, icon: FiDollarSign, color: 'bg-green-100 text-green-600',  change: stats.revenueChange },
    { label: 'Total Orders',  value: stats.totalOrders || 0,                      icon: FiPackage,    color: 'bg-blue-100 text-blue-600',    change: stats.ordersChange  },
    { label: 'Total Users',   value: stats.totalUsers  || 0,                      icon: FiUsers,      color: 'bg-purple-100 text-purple-600',change: stats.usersChange   },
    { label: 'Products',      value: stats.totalProducts || 0,                    icon: FiShoppingBag,color: 'bg-orange-100 text-orange-600',change: null                },
  ] : [];

  const quickLinks = [
    { to: '/admin/products', label: 'Manage Products', icon: FiShoppingBag, color: 'bg-orange-50 hover:bg-orange-100 text-orange-600' },
    { to: '/admin/orders',   label: 'Manage Orders',   icon: FiPackage,     color: 'bg-blue-50 hover:bg-blue-100 text-blue-600'       },
    { to: '/admin/users',    label: 'Manage Users',    icon: FiUsers,       color: 'bg-purple-50 hover:bg-purple-100 text-purple-600' },
    { to: '/admin/analytics',label: 'Full Analytics',  icon: FiTrendingUp,  color: 'bg-green-50 hover:bg-green-100 text-green-600'    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-0.5">Welcome back, admin. Here's your store overview.</p>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse"/>)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {cards.map(({ label, value, icon: Icon, color, change }) => (
            <div key={label} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
                  <Icon size={20}/>
                </div>
                {change != null && (
                  <span className={`text-xs font-semibold ${change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {change >= 0 ? '+' : ''}{change}%
                  </span>
                )}
              </div>
              <p className="text-2xl font-extrabold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Quick Links */}
      <h2 className="font-bold text-gray-800 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {quickLinks.map(({ to, label, icon: Icon, color }) => (
          <Link key={to} to={to} className={`${color} rounded-2xl p-5 flex flex-col items-center gap-3 transition-colors text-center`}>
            <Icon size={26}/>
            <span className="text-sm font-semibold">{label}</span>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      {stats?.recentOrders?.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Recent Orders</h2>
            <Link to="/admin/orders" className="text-orange-500 text-sm hover:text-orange-600">View all</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.recentOrders.map(order => (
              <Link key={order._id} to={`/orders/${order._id}`} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-800">#{order._id.slice(-6).toUpperCase()}</p>
                  <p className="text-xs text-gray-400">{order.user?.name} · {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">${order.totalPrice?.toFixed(2)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : order.status === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                    {order.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Pending sellers */}
      {stats?.pendingSellers > 0 && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-2xl p-5 flex items-center gap-4">
          <FiAlertCircle size={22} className="text-yellow-600 shrink-0"/>
          <div className="flex-1">
            <p className="font-semibold text-yellow-800 text-sm">{stats.pendingSellers} seller application{stats.pendingSellers > 1 ? 's' : ''} pending review</p>
          </div>
          <Link to="/admin/users?role=seller&approved=false" className="text-xs bg-yellow-500 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-yellow-600 transition-colors">
            Review
          </Link>
        </div>
      )}
    </div>
  );
}
