import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiEdit2, FiEye } from 'react-icons/fi';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['pending','confirmed','processing','shipped','delivered','cancelled','refunded'];
const STATUS_COLORS  = {
  pending:'bg-yellow-100 text-yellow-700', confirmed:'bg-blue-100 text-blue-700',
  processing:'bg-purple-100 text-purple-700', shipped:'bg-indigo-100 text-indigo-700',
  delivered:'bg-green-100 text-green-700', cancelled:'bg-red-100 text-red-700', refunded:'bg-gray-100 text-gray-600',
};

export default function AdminOrders() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState('');
  const [page,    setPage]    = useState(1);
  const [pages,   setPages]   = useState(1);
  const [editing, setEditing] = useState(null); // order being status-edited

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
      const { data } = await api.put(`/orders/${orderId}/status`, { status });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: data.status } : o));
      toast.success(`Order marked as ${status}`);
      setEditing(null);
    } catch { toast.error('Status update failed'); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Orders</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14}/>
          <input
            type="text" placeholder="Search by order ID or user..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="pl-8 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-orange-400 w-56"
          />
        </div>
        <select
          value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-orange-400"
        >
          <option value="">All Status</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(8)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse"/>)}</div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Order ID','Customer','Items','Total','Status','Date','Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400">No orders found</td></tr>
              ) : orders.map(order => (
                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">#{order._id.slice(-8).toUpperCase()}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800 text-xs">{order.user?.name || '—'}</p>
                    <p className="text-gray-400 text-xs">{order.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}</td>
                  <td className="px-4 py-3 font-bold text-gray-900">${order.totalPrice?.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    {editing === order._id ? (
                      <select
                        defaultValue={order.status}
                        onChange={e => handleStatusUpdate(order._id, e.target.value)}
                        className="border border-orange-400 rounded-lg px-2 py-1 text-xs focus:outline-none"
                        autoFocus
                        onBlur={() => setEditing(null)}
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    ) : (
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                        {order.status}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link to={`/orders/${order._id}`} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" title="View"><FiEye size={14}/></Link>
                      <button onClick={() => setEditing(editing === order._id ? null : order._id)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit status"><FiEdit2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {[...Array(pages)].map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              className={`w-9 h-9 rounded-lg text-sm font-medium border transition-colors ${page === i + 1 ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-300 hover:border-orange-400'}`}
            >{i + 1}</button>
          ))}
        </div>
      )}
    </div>
  );
}
