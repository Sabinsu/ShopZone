import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import api from '../api/axios';

const STATUS_COLORS = {
  pending:    'bg-yellow-100 text-yellow-700',
  confirmed:  'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped:    'bg-indigo-100 text-indigo-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
  refunded:   'bg-gray-100 text-gray-700',
};

export default function OrderHistoryPage() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const [pages,   setPages]   = useState(1);

  useEffect(() => {
    setLoading(true);
    api.get(`/orders/my?page=${page}`)
      .then(r => { setOrders(r.data.orders || []); setPages(r.data.pages || 1); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">
      {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse"/>)}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <FiPackage size={56} className="mx-auto mb-4 opacity-30"/>
          <p className="text-lg font-medium text-gray-600">No orders yet</p>
          <p className="text-sm mt-1">Start shopping to see your orders here</p>
          <Link to="/products" className="mt-5 inline-block bg-orange-500 text-white font-semibold px-5 py-2.5 rounded-full hover:bg-orange-600 transition-colors text-sm">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const first = order.items?.[0];
            const extra = (order.items?.length || 1) - 1;
            return (
              <Link
                key={order._id}
                to={`/orders/${order._id}`}
                className="block bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs text-gray-400">Order</p>
                    <p className="font-mono text-sm font-semibold text-gray-700">#{order._id.slice(-8).toUpperCase()}</p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                    {order.status}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  {first?.image && <img src={first.image} alt={first.name} className="w-12 h-12 rounded-xl object-cover bg-gray-50"/>}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{first?.name}</p>
                    {extra > 0 && <p className="text-xs text-gray-400">+{extra} more item{extra > 1 ? 's' : ''}</p>}
                  </div>
                  <FiChevronRight className="text-gray-400 shrink-0"/>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  <span className="font-bold text-gray-800 text-sm">${order.totalPrice?.toFixed(2)}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button onClick={() => setPage(p => p - 1)} disabled={page <= 1} className="p-2 border border-gray-300 rounded-lg disabled:opacity-40 hover:border-orange-400">
            <FiChevronLeft size={16}/>
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">Page {page} of {pages}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= pages} className="p-2 border border-gray-300 rounded-lg disabled:opacity-40 hover:border-orange-400">
            <FiChevronRight size={16}/>
          </button>
        </div>
      )}
    </div>
  );
}
