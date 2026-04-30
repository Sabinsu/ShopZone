import { useState, useEffect, useCallback } from 'react'
import { FiSearch, FiFilter, FiEdit2, FiEye, FiCheck, FiX } from 'react-icons/fi'
import api   from '../../api/axios'
import toast from 'react-hot-toast'

const STATUSES = ['all','pending','confirmed','processing','shipped','delivered','cancelled']

const STATUS_COLORS = {
  pending:    'bg-yellow-100 text-yellow-700',
  confirmed:  'bg-blue-100   text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped:    'bg-indigo-100 text-indigo-700',
  delivered:  'bg-green-100  text-green-700',
  cancelled:  'bg-red-100    text-red-700',
  refunded:   'bg-gray-100   text-gray-600',
}

function StatusModal({ order, onClose, onSave }) {
  const [status,   setStatus]   = useState(order.status)
  const [note,     setNote]     = useState('')
  const [tracking, setTracking] = useState(order.trackingNumber || '')
  const [saving,   setSaving]   = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(order._id, { status, note, trackingNumber: tracking })
      onClose()
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-900">Update Order Status</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FiX/></button>
        </div>
        <p className="text-xs text-gray-500 mb-4">Order #{order._id.slice(-8).toUpperCase()}</p>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">New Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
              {STATUSES.filter(s => s !== 'all').map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
          {status === 'shipped' && (
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Tracking Number</label>
              <input value={tracking} onChange={e => setTracking(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="e.g. NP123456789" />
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Note (optional)</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              placeholder="Add a note for the customer..." />
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50 transition-colors">
            {saving ? 'Saving...' : 'Update Status'}
          </button>
        </div>
      </div>
    </div>
  )
}

function OrderDetailModal({ order, onClose }) {
  if (!order) return null
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Order #{order._id.slice(-8).toUpperCase()}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FiX/></button>
        </div>

        {/* Customer */}
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <p className="text-xs text-gray-500 mb-1">Customer</p>
          <p className="font-semibold text-gray-800">{order.shippingAddress?.name}</p>
          <p className="text-sm text-gray-500">{order.shippingAddress?.email}</p>
          <p className="text-sm text-gray-500">{order.shippingAddress?.phone}</p>
          <p className="text-sm text-gray-500 mt-1">
            {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.country}
          </p>
        </div>

        {/* Items */}
        <div className="space-y-3 mb-4">
          {order.items?.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <img src={item.image || 'https://via.placeholder.com/48'} alt={item.name}
                className="w-12 h-12 rounded-xl object-cover"/>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.name}</p>
                <p className="text-xs text-gray-500">×{item.qty} @ ${item.price}</p>
              </div>
              <span className="font-semibold text-gray-900">${(item.price * item.qty).toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-t border-gray-100 pt-3 space-y-1 text-sm mb-4">
          <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>${order.itemsPrice?.toFixed(2)}</span></div>
          <div className="flex justify-between text-gray-500"><span>Shipping</span><span>${order.shippingPrice?.toFixed(2)}</span></div>
          <div className="flex justify-between text-gray-500"><span>Tax</span><span>${order.taxPrice?.toFixed(2)}</span></div>
          <div className="flex justify-between font-bold text-gray-900 text-base pt-1 border-t border-gray-100">
            <span>Total</span><span>${order.totalPrice?.toFixed(2)}</span>
          </div>
        </div>

        {/* Status history */}
        {order.statusHistory?.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Status History</p>
            <div className="space-y-2">
              {[...order.statusHistory].reverse().map((h, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className={`px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[h.status] || 'bg-gray-100 text-gray-600'}`}>
                    {h.status}
                  </span>
                  <span className="text-gray-500">{h.note}</span>
                  <span className="text-gray-400 ml-auto shrink-0">{new Date(h.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminOrders() {
  const [orders,     setOrders]     = useState([])
  const [loading,    setLoading]    = useState(true)
  const [page,       setPage]       = useState(1)
  const [pages,      setPages]      = useState(1)
  const [total,      setTotal]      = useState(0)
  const [filter,     setFilter]     = useState('all')
  const [search,     setSearch]     = useState('')
  const [editOrder,  setEditOrder]  = useState(null)
  const [viewOrder,  setViewOrder]  = useState(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page })
      if (filter !== 'all') params.set('status', filter)
      const { data } = await api.get(`/orders?${params}`)
      setOrders(data.orders || [])
      setPages(data.pages || 1)
      setTotal(data.total || 0)
    } catch { toast.error('Failed to load orders') }
    finally { setLoading(false) }
  }, [page, filter])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const handleStatusUpdate = async (orderId, payload) => {
    try {
      const { data } = await api.put(`/orders/${orderId}/status`, payload)
      setOrders(prev => prev.map(o => o._id === orderId ? data.order : o))
      toast.success('Order status updated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    }
  }

  // Client-side search filter
  const filtered = search.trim()
    ? orders.filter(o =>
        o._id.slice(-8).toLowerCase().includes(search.toLowerCase()) ||
        o.shippingAddress?.name?.toLowerCase().includes(search.toLowerCase()) ||
        o.shippingAddress?.email?.toLowerCase().includes(search.toLowerCase())
      )
    : orders

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
            <p className="text-sm text-gray-500 mt-1">{total} total orders</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by order ID, name, email..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            {/* Status filter */}
            <div className="flex gap-2 flex-wrap">
              {STATUSES.map(s => (
                <button key={s} onClick={() => { setFilter(s); setPage(1) }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-colors border ${
                    filter === s
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
                  }`}>
                  {s === 'all' ? 'All' : s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-14 bg-gray-100 rounded-xl mb-3 animate-pulse"/>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">No orders found</p>
              <p className="text-sm mt-1">Try changing the filter or search term</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Order ID','Customer','Items','Total','Method','Status','Date','Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(order => (
                    <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono font-semibold text-gray-800">
                          #{order._id.slice(-8).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800 whitespace-nowrap">{order.shippingAddress?.name}</p>
                        <p className="text-xs text-gray-400">{order.shippingAddress?.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex -space-x-2">
                          {order.items?.slice(0, 3).map((item, i) => (
                            <img key={i} src={item.image || 'https://via.placeholder.com/32'} alt=""
                              className="w-8 h-8 rounded-lg object-cover border-2 border-white"/>
                          ))}
                        </div>
                        <span className="text-xs text-gray-400 mt-1 block">{order.items?.length} items</span>
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-900 whitespace-nowrap">
                        ${order.totalPrice?.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium uppercase text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                          {order.paymentMethod}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize whitespace-nowrap ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                          {order.status}
                        </span>
                        {order.trackingNumber && (
                          <p className="text-xs text-indigo-600 mt-0.5">🚚 {order.trackingNumber}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString('en-US', { day:'numeric', month:'short', year:'2-digit' })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setViewOrder(order)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View details">
                            <FiEye size={15}/>
                          </button>
                          <button onClick={() => setEditOrder(order)}
                            className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Update status">
                            <FiEdit2 size={15}/>
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

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {[...Array(pages)].map((_, i) => (
              <button key={i} onClick={() => setPage(i+1)}
                className={`w-9 h-9 rounded-xl text-sm font-medium border transition-colors ${
                  page===i+1 ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-200 hover:border-orange-400 bg-white'
                }`}>{i+1}</button>
            ))}
          </div>
        )}
      </div>

      {editOrder && (
        <StatusModal order={editOrder} onClose={() => setEditOrder(null)} onSave={handleStatusUpdate}/>
      )}
      {viewOrder && (
        <OrderDetailModal order={viewOrder} onClose={() => setViewOrder(null)}/>
      )}
    </div>
  )
}
