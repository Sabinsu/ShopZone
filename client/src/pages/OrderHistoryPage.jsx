// client/src/pages/OrderHistoryPage.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiPackage, FiArrowRight } from 'react-icons/fi'
import api from '../api/axios'
import { SkeletonTable } from '../components/ui/Skeleton'

const STATUS_BADGE = {
  pending:   'status-pending',
  confirmed: 'status-confirmed',
  shipped:   'status-shipped',
  delivered: 'status-delivered',
  cancelled: 'status-cancelled',
}

export default function OrderHistoryPage() {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/orders/my-orders')
      .then(r => setOrders(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="section"><SkeletonTable rows={6}/></div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <FiPackage size={48} className="text-gray-300 mx-auto mb-4"/>
          <p className="text-gray-500 font-medium mb-4">No orders yet</p>
          <Link to="/products" className="btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order._id} className="card hover:shadow-md transition-shadow">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Order #{order._id.slice(-8).toUpperCase()}</p>
                  <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-NP', { dateStyle: 'medium' })}</p>
                </div>
                <span className={STATUS_BADGE[order.status] || 'badge-gray'}>
                  {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                </span>
              </div>

              <div className="flex gap-3 mt-4 overflow-x-auto scrollbar-hide pb-1">
                {order.items?.slice(0, 4).map((item, i) => (
                  <div key={i} className="flex-shrink-0 flex items-center gap-2">
                    <img src={item.image || '/placeholder.png'} alt={item.name}
                      className="w-12 h-12 object-cover rounded-lg bg-gray-50"/>
                    {i === 3 && order.items.length > 4 && (
                      <span className="text-xs text-gray-400">+{order.items.length - 4} more</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <div>
                  <span className="text-xs text-gray-400">{order.items?.length} item{order.items?.length !== 1 ? 's' : ''} · COD</span>
                  <p className="font-bold text-gray-900">Rs {order.totalPrice?.toLocaleString()}</p>
                </div>
                <Link to={`/orders/${order._id}`} className="btn-ghost text-sm py-2">
                  View Details <FiArrowRight size={14}/>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
