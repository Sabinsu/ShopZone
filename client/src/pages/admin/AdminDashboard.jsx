import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiShoppingBag, FiPackage, FiDollarSign, FiTrendingUp, FiAlertCircle, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../api/axios';

const STATUS_COLORS = {
  pending:'bg-yellow-100 text-yellow-700', confirmed:'bg-blue-100 text-blue-700',
  processing:'bg-purple-100 text-purple-700', shipped:'bg-indigo-100 text-indigo-700',
  delivered:'bg-green-100 text-green-700', cancelled:'bg-red-100 text-red-600',
};

export default function AdminDashboard() {
  const [stats,   setStats]   = useState(null);
  const [period,  setPeriod]  = useState('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/admin/analytics?period=${period}`)
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [period]);

  const cards = stats ? [
    { label: 'Total Revenue', value: `$${(stats.totalRevenue||0).toFixed(2)}`, icon: FiDollarSign, bg: 'bg-green-500',  change: null },
    { label: 'Orders',        value: stats.totalOrders   || 0,                 icon: FiPackage,    bg: 'bg-blue-500',   change: null },
    { label: 'Users',         value: stats.totalUsers    || 0,                 icon: FiUsers,      bg: 'bg-purple-500', change: null },
    { label: 'Products',      value: stats.totalProducts || 0,                 icon: FiShoppingBag,bg: 'bg-orange-500', change: null },
  ] : [];

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Welcome back! Here's what's happening.</p>
        </div>
        <div className="flex gap-2">
          {[['7d','7D'],['30d','30D'],['90d','90D'],['1y','1Y']].map(([v,l]) => (
            <button key={v} onClick={() => setPeriod(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${period===v ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300'}`}
            >{l}</button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_,i) => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse"/>)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {cards.map(({ label, value, icon: Icon, bg }) => (
            <div key={label} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mb-4`}>
                <Icon size={22} className="text-white"/>
              </div>
              <p className="text-2xl font-extrabold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Revenue chart (simple bar) + top products */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue bars */}
        {stats?.dailyRevenue?.length > 0 && (
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Daily Revenue</h2>
            <div className="flex items-end gap-1 h-36">
              {stats.dailyRevenue.map((d, i) => {
                const max = Math.max(...stats.dailyRevenue.map(x => x.revenue), 1);
                const h   = Math.max(4, (d.revenue / max) * 100);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      title={`$${d.revenue.toFixed(2)}`}
                      style={{ height: `${h}%` }}
                      className="w-full bg-orange-400 hover:bg-orange-500 rounded-t cursor-pointer transition-colors min-h-[4px]"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Orders by status */}
        {stats?.ordersByStatus && (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Order Status</h2>
            <div className="space-y-2">
              {Object.entries(stats.ordersByStatus).map(([status, count]) => {
                const total = Object.values(stats.ordersByStatus).reduce((a,b) => a+b, 0);
                const pct   = total ? Math.round((count/total)*100) : 0;
                return (
                  <div key={status}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="capitalize text-gray-600">{status}</span>
                      <span className="font-semibold text-gray-800">{count}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-400 rounded-full" style={{ width: `${pct}%` }}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Recent orders */}
      {stats?.recentOrders?.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Recent Orders</h2>
            <Link to="/admin/orders" className="text-orange-500 text-sm hover:text-orange-600 font-medium">View all →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Order','Customer','Total','Status','Date'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.recentOrders.map(order => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-gray-600">#{order._id.slice(-6).toUpperCase()}</td>
                    <td className="px-5 py-3 text-xs text-gray-700">{order.user?.name || '—'}</td>
                    <td className="px-5 py-3 font-bold text-gray-900">${order.totalPrice?.toFixed(2)}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${STATUS_COLORS[order.status]||'bg-gray-100 text-gray-600'}`}>{order.status}</span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pending sellers alert */}
      {stats?.pendingSellers > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4">
          <FiAlertCircle size={20} className="text-amber-600 shrink-0"/>
          <p className="text-sm font-medium text-amber-800 flex-1">
            {stats.pendingSellers} seller application{stats.pendingSellers > 1 ? 's' : ''} awaiting approval
          </p>
          <Link to="/admin/users" className="text-xs bg-amber-500 text-white px-3 py-1.5 rounded-lg hover:bg-amber-600 transition-colors font-medium">
            Review Now
          </Link>
        </div>
      )}
    </AdminLayout>
  );
}
