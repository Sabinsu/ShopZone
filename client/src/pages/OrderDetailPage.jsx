// client/src/pages/OrderDetailPage.jsx
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiPackage, FiCheckCircle, FiTruck, FiHome } from 'react-icons/fi'
import api from '../api/axios'

const STEPS = [
  { key: 'pending',   icon: FiPackage,      label: 'Order Placed',   desc: 'Your order has been received' },
  { key: 'confirmed', icon: FiCheckCircle,  label: 'Confirmed',      desc: 'Order confirmed by seller' },
  { key: 'shipped',   icon: FiTruck,        label: 'Shipped',        desc: 'Your package is on its way' },
  { key: 'delivered', icon: FiHome,         label: 'Delivered',      desc: 'Package delivered successfully' },
]
const STEP_IDX = { pending: 0, confirmed: 1, shipped: 2, delivered: 3 }

export default function OrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(r => setOrder(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="section flex justify-center"><div className="spinner"/></div>
  if (!order)  return <div className="text-center py-20 text-gray-500">Order not found</div>

  const currentStep = STEP_IDX[order.status] ?? 0

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/orders" className="text-sm text-orange-500 hover:text-orange-600 mb-6 inline-flex items-center gap-1">
        ← Back to Orders
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
          <p className="text-sm text-gray-400 mt-0.5">#{order._id.slice(-8).toUpperCase()}</p>
        </div>
        <span className={`status-${order.status} text-sm px-3 py-1.5`}>
          {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
        </span>
      </div>

      {/* Tracking timeline */}
      {order.status !== 'cancelled' && (
        <div className="card mb-6">
          <h2 className="font-semibold text-gray-800 mb-6">Order Tracking</h2>
          <div className="relative">
            {/* Progress line */}
            <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-200">
              <div className="bg-orange-500 w-full transition-all duration-700"
                style={{ height: `${(currentStep / (STEPS.length - 1)) * 100}%` }} />
            </div>
            <div className="space-y-6">
              {STEPS.map((step, i) => {
                const done    = i <= currentStep
                const active  = i === currentStep
                const Icon    = step.icon
                return (
                  <div key={step.key} className="flex items-start gap-4 relative z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                      done ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'
                    } ${active ? 'ring-4 ring-orange-200' : ''}`}>
                      <Icon size={18}/>
                    </div>
                    <div className="pt-2">
                      <p className={`font-semibold text-sm ${done ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                      <p className={`text-xs mt-0.5 ${done ? 'text-gray-500' : 'text-gray-300'}`}>{step.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Items */}
      <div className="card mb-6">
        <h2 className="font-semibold text-gray-800 mb-4">Items Ordered</h2>
        <div className="space-y-3">
          {order.items?.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <img src={item.image || '/placeholder.png'} alt={item.name}
                className="w-14 h-14 object-cover rounded-xl bg-gray-50 flex-shrink-0"/>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{item.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">Qty: {item.quantity} × Rs {item.price?.toLocaleString()}</p>
              </div>
              <p className="font-bold text-sm text-gray-800">Rs {(item.price * item.quantity).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Address + Payment */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="card-sm">
          <h3 className="font-semibold text-gray-800 mb-3 text-sm">Delivery Address</h3>
          <p className="text-sm text-gray-700 font-medium">{order.shippingAddress?.fullName}</p>
          <p className="text-sm text-gray-500">{order.shippingAddress?.phone}</p>
          <p className="text-sm text-gray-500 mt-1">{order.shippingAddress?.address}</p>
          <p className="text-sm text-gray-500">{order.shippingAddress?.city}{order.shippingAddress?.area ? `, ${order.shippingAddress.area}` : ''}</p>
        </div>
        <div className="card-sm">
          <h3 className="font-semibold text-gray-800 mb-3 text-sm">Payment Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>Rs {order.itemsPrice?.toLocaleString()}</span></div>
            <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{order.shippingPrice === 0 ? 'FREE' : `Rs ${order.shippingPrice}`}</span></div>
            <hr className="border-gray-100"/>
            <div className="flex justify-between font-bold text-gray-900"><span>Total</span><span>Rs {order.totalPrice?.toLocaleString()}</span></div>
            <div className="flex justify-between text-gray-500"><span>Method</span><span className="badge-orange">COD</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
