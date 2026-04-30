import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiPackage, FiChevronRight, FiClock } from 'react-icons/fi'
import api from '../api/axios'
import toast from 'react-hot-toast'

const STATUS_CONFIG = {
  pending:    { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: '⏳', label: 'Pending' },
  confirmed:  { color: 'bg-blue-100   text-blue-700   border-blue-200',   icon: '✅', label: 'Confirmed' },
  processing: { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: '⚙️', label: 'Processing' },
  shipped:    { color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: '🚚', label: 'Shipped' },
  delivered:  { color: 'bg-green-100  text-green-700  border-green-200',  icon: '📦', label: 'Delivered' },
  cancelled:  { color: 'bg-red-100    text-red-700    border-red-200',    icon: '❌', label: 'Cancelled' },
  refunded:   { color: 'bg-gray-100   text-gray-600   border-gray-200',   icon: '💸', label: 'Refunded' },
}

// Visual order lifecycle progress bar
const LIFECYCLE = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']

function OrderStatusBar({ status }) {
  if (['cancelled', 'refunded'].includes(status)) return null
  const currentIdx = LIFECYCLE.indexOf(status)
  return (
    <div className="flex items-center gap-1 mt-3">
      {LIFECYCLE.map((s, i) => (
        <div key={s} className="flex items-center gap-1 flex-1">
          <div className={`h-2 w-full rounded-full transition-all ${i <= currentIdx ? 'bg-orange-500' : 'bg-gray-200'}`}/>
          {i < LIFECYCLE.length - 1 && null}
        </div>
      ))}
    </div>
  )
}

export default function OrderHistoryPage() {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [page,    setPage]    = useState(1)
  const [pages,   setPages]   = useState(1)
  const [cancelling, setCancelling] = useState(null)

  useEffect(() => {
    setLoading(true)
    api.get(`/orders/my?page=${page}`)
      .then(r => { setOrders(r.data.orders || []); setPages(r.data.pages || 1) })
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false))
  }, [page])

  const handleCancel = async (orderId) => {
    if (!confirm('Are you sure you want to cancel this order?')) return
    setCancelling(orderId)
    try {
      await api.put(`/orders/${orderId}/cancel`)
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: 'cancelled' } : o))
      toast.success('Order cancelled')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed')
    } finally { setCancelling(null) }
  }

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
      {[...Array(4)].map((_, i) => <div key={i} className="bg-gray-100 h-32 rounded-2xl animate-pulse"/>)}
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <FiPackage className="text-orange-500" size={24}/>
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        {orders.length > 0 && (
          <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full font-medium">{orders.length}</span>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <FiPackage size={56} className="mx-auto text-gray-300 mb-4"/>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No orders yet</h2>
          <p className="text-gray-400 mb-6">Looks like you haven't placed any orders.</p>
          <Link to="/products" className="bg-orange-500 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-orange-600 transition-colors">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
            const canCancel = ['pending', 'confirmed'].includes(order.status)
            return (
              <div key={order._id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Order ID</p>
                      <p className="font-mono text-sm font-semibold text-gray-800">
                        #{order._id.slice(-8).toUpperCase()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.color}`}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <OrderStatusBar status={order.status}/>

                  {/* Items preview */}
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {order.items?.slice(0, 3).map((item, i) => (
                      <img key={i} src={item.image || 'https://via.placeholder.com/50'}
                        alt={item.name} className="w-12 h-12 rounded-xl object-cover border border-gray-100"/>
                    ))}
                    {order.items?.length > 3 && (
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-medium">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <FiClock size={13}/>
                      <span>{new Date(order.createdAt).toLocaleDateString('en-US', { day:'numeric', month:'short', year:'numeric' })}</span>
                      <span className="text-gray-300">|</span>
                      <span className="font-bold text-gray-900">${order.totalPrice?.toFixed(2)}</span>
                      <span className="capitalize text-xs text-gray-400">{order.paymentMethod?.toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {canCancel && (
                        <button
                          onClick={() => handleCancel(order._id)}
                          disabled={cancelling === order._id}
                          className="text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-3 py-1 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {cancelling === order._id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                      {order.trackingNumber && (
                        <span className="text-xs text-indigo-600 font-medium">🚚 {order.trackingNumber}</span>
                      )}
                      <Link to={`/orders/${order._id}`}
                        className="flex items-center gap-1 text-orange-500 hover:text-orange-600 text-sm font-medium">
                        Details <FiChevronRight size={14}/>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {[...Array(pages)].map((_, i) => (
            <button key={i} onClick={() => setPage(i+1)}
              className={`w-9 h-9 rounded-lg text-sm font-medium border transition-colors ${
                page===i+1 ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-300 hover:border-orange-400'
              }`}>{i+1}</button>
          ))}
        </div>
      )}
    </div>
  )
}
