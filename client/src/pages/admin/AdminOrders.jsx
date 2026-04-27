import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiEdit2, FiEye, FiRefreshCw } from 'react-icons/fi';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['pending','confirmed','processing','shipped','delivered','cancelled','refunded'];
const STATUS_COLORS  = {
  pending:'bg-yellow-100 text-yellow-700', confirmed:'bg-blue-100 text-blue-700',
  processing:'bg-purple-100 text-purple-700', shipped:'bg-indigo-100 text-indigo-700',
  delivered:'bg-green-100 text-green-700', cancelled:'bg-red-100 text-red-600', refunded:'bg-gray-100 text-gray-600',
};

export default function AdminOrders() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState('');
  const [page,    setPage]    = useState(1);
  const [pages,   setPages]   = useState(1);
  const [editing, setEditing] = useState(null);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    const q = new URLSearchParams({ page, limit: 15 });
    if (search) q.set('search', search);
    if (filter) q.set('status', filter);
    api.get(`/admin/orders?${q}`)
      .then(r => { setOrders(r.data.orders || []); setPages(r.data.pages || 1); })
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, [page, search, filter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
      toast.success(`Order marked as ${status}`);
      setEditing(null);
    } catch { toast.error('Update failed'); }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 text-sm">Manage and update all customer orders</p>
        </div>
        <button onClick={fetchOrders} className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 px-3 py-2 rounded-xl hover:border-orange-400 transition-colors">
          <FiRefreshCw size={14}/> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14}/>
          <input type="text" placeholder="Search order ID..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 w-52 bg-white"
          />
        </div>
        <select value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-orange-400">
          <option value="">All Status</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>

        {/* Status quick-filter pills */}
        <div className="flex gap-2 flex-wrap">
          {['pending','confirmed','shipped','delivered'].map(s => (
            <button key={s} onClick={() => { setFilter(filter === s ? '' : s); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors capitalize ${
                filter === s ? STATUS_COLORS[s] : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}>{s}</button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{[...Array(8)].map((_,i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse"/>)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[750px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Order','Customer','Items','Total','Payment','Status','Date','Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.length === 0
                  ? <tr><td colSpan={8} className="py-16 text-center text-gray-400">No orders found</td></tr>
                  : orders.map(order => (
                    <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gray-600 font-semibold">#{order._id.slice(-8).toUpperCase()}</td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium text-gray-800">{order.user?.name || '—'}</p>
                        <p className="text-xs text-gray-400">{order.user?.email}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">{order.items?.length || 0}</td>
                      <td className="px-4 py-3 font-bold text-gray-900">${order.totalPrice?.toFixed(2)}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 capitalize">{order.paymentMethod}</td>
                      <td className="px-4 py-3">
                        {editing === order._id ? (
                          <select defaultValue={order.status} autoFocus
                            onChange={e => handleStatusUpdate(order._id, e.target.value)}
                            onBlur={() => setEditing(null)}
                            className="border border-orange-400 rounded-lg px-2 py-1 text-xs focus:outline-none bg-white"
                          >
                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        ) : (
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize cursor-pointer ${STATUS_COLORS[order.status]||'bg-gray-100 text-gray-600'}`}
                            onClick={() => setEditing(order._id)}>
                            {order.status}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link to={`/orders/${order._id}`} className="p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-500 rounded-lg transition-colors"><FiEye size={14}/></Link>
                          <button onClick={() => setEditing(editing === order._id ? null : order._id)} className="p-1.5 text-gray-400 hover:bg-orange-50 hover:text-orange-500 rounded-lg transition-colors"><FiEdit2 size={14}/></button>
                        </div>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {[...Array(pages)].map((_,i) => (
            <button key={i} onClick={() => setPage(i+1)}
              className={`w-9 h-9 rounded-lg text-sm font-medium border transition-colors ${page===i+1 ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-200 bg-white hover:border-orange-400'}`}
            >{i+1}</button>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
