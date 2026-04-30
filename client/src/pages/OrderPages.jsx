// OrderSuccessPage.jsx
// ──────────────────────────────────────────────
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FiCheckCircle, FiPackage } from 'react-icons/fi'
import api from '../api/axios'

export function OrderSuccessPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  useEffect(() => { api.get(`/orders/${id}`).then(r => setOrder(r.data)) }, [id])

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="text-green-500 flex justify-center mb-4"><FiCheckCircle size={64} /></div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Placed!</h1>
      <p className="text-gray-500 mb-6">Thank you for your purchase. We'll send a confirmation soon.</p>
      {order && (
        <div className="card p-4 text-left mb-6 text-sm">
          <p><span className="text-gray-500">Order ID:</span> <span className="font-mono font-medium">#{order._id.slice(-8).toUpperCase()}</span></p>
          <p><span className="text-gray-500">Total:</span> <span className="font-bold">${order.totalPrice.toFixed(2)}</span></p>
          <p><span className="text-gray-500">Status:</span> <span className="capitalize text-orange-600 font-medium">{order.status}</span></p>
        </div>
      )}
      <div className="flex gap-3 justify-center">
        <Link to="/orders" className="btn-primary flex items-center gap-2"><FiPackage /> My Orders</Link>
        <Link to="/products" className="btn-outline">Continue Shopping</Link>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
// OrderHistoryPage.jsx
// ──────────────────────────────────────────────
import { Link } from 'react-router-dom'

export function OrderHistoryPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { api.get('/orders/myorders').then(r => setOrders(r.data)).finally(() => setLoading(false)) }, [])

  const statusColor = {
    pending:    'bg-yellow-100 text-yellow-700',
    confirmed:  'bg-blue-100 text-blue-700',
    processing: 'bg-purple-100 text-purple-700',
    shipped:    'bg-indigo-100 text-indigo-700',
    delivered:  'bg-green-100 text-green-700',
    cancelled:  'bg-red-100 text-red-700',
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Orders</h1>
      {loading ? <div className="text-center py-10 text-gray-400">Loading...</div>
        : orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📦</div>
            <p className="text-gray-500 mb-4">No orders yet</p>
            <Link to="/products" className="btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <Link key={order._id} to={`/orders/${order._id}`} className="card p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition-shadow">
                <div className="flex-1">
                  <p className="font-mono text-sm font-medium text-gray-800">#{order._id.slice(-8).toUpperCase()}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-500 mt-1">{order.items.length} item(s)</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`badge ${statusColor[order.status] || 'bg-gray-100 text-gray-600'} capitalize`}>{order.status}</span>
                  <span className="font-bold text-gray-900">${order.totalPrice.toFixed(2)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
    </div>
  )
}

// ──────────────────────────────────────────────
// OrderDetailPage.jsx
// ──────────────────────────────────────────────
export function OrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  useEffect(() => { api.get(`/orders/${id}`).then(r => setOrder(r.data)) }, [id])
  if (!order) return <div className="text-center py-10">Loading...</div>

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/orders" className="text-sm text-gray-500 hover:text-orange-500 mb-4 inline-block">← Back to Orders</Link>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Order #{order._id.slice(-8).toUpperCase()}</h1>
          <p className="text-sm text-gray-400">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <span className={`badge text-sm capitalize px-3 py-1 ${
          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
          order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
          {order.status}
        </span>
      </div>

      <div className="card p-4 mb-4">
        <h3 className="font-medium mb-3 text-sm text-gray-500 uppercase tracking-wide">Items Ordered</h3>
        <div className="divide-y">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 py-3">
              <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg bg-gray-100" />
              <div className="flex-1"><p className="text-sm font-medium">{item.name}</p><p className="text-xs text-gray-400">Qty: {item.quantity}</p></div>
              <span className="text-sm font-bold">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="card p-4">
          <h3 className="font-medium mb-2 text-sm text-gray-500 uppercase tracking-wide">Shipping Address</h3>
          <p className="text-sm text-gray-700">{order.shippingAddress.fullName}</p>
          <p className="text-sm text-gray-500">{order.shippingAddress.street}</p>
          <p className="text-sm text-gray-500">{order.shippingAddress.city}, {order.shippingAddress.state}</p>
          <p className="text-sm text-gray-500">{order.shippingAddress.country} {order.shippingAddress.zip}</p>
        </div>
        <div className="card p-4">
          <h3 className="font-medium mb-2 text-sm text-gray-500 uppercase tracking-wide">Payment Summary</h3>
          <div className="text-sm space-y-1 text-gray-600">
            <div className="flex justify-between"><span>Method</span><span className="capitalize">{order.paymentMethod}</span></div>
            <div className="flex justify-between"><span>Items</span><span>${order.itemsPrice.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>${order.shippingPrice.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Tax</span><span>${order.taxPrice.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-gray-900 border-t pt-1 mt-1"><span>Total</span><span>${order.totalPrice.toFixed(2)}</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
