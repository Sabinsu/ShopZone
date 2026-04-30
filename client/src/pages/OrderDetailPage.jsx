import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiPackage, FiTruck, FiCheck, FiX, FiMapPin, FiPhone, FiMail } from 'react-icons/fi'
import api  from '../api/axios'
import toast from 'react-hot-toast'

const STATUS_STEPS = ['pending','confirmed','processing','shipped','delivered']
const STATUS_COLORS = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing:'bg-purple-100 text-purple-700',
  shipped:   'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded:  'bg-gray-100 text-gray-600',
}

export default function OrderDetailPage() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const [order,    setOrder]    = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(r => setOrder(r.data))
      .catch(() => { toast.error('Order not found'); navigate('/orders') })
      .finally(() => setLoading(false))
  }, [id])

  const handleCancel = async () => {
    if (!confirm('Cancel this order?')) return
    setCancelling(true)
    try {
      const { data } = await api.put(`/orders/${id}/cancel`)
      setOrder(data.order)
      toast.success('Order cancelled')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot cancel')
    } finally { setCancelling(false) }
  }

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-4 animate-pulse">
      {[...Array(4)].map((_,i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl"/>)}
    </div>
  )
  if (!order) return null

  const currentStep  = STATUS_STEPS.indexOf(order.status)
  const isCancelled  = ['cancelled','refunded'].includes(order.status)
  const canCancel    = ['pending','confirmed'].includes(order.status)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/orders')} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <FiArrowLeft size={18}/>
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Order #{order._id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-sm text-gray-500">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { day:'numeric', month:'long', year:'numeric' })}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full capitalize ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
            {order.status}
          </span>
          {canCancel && (
            <button onClick={handleCancel} disabled={cancelling}
              className="text-xs text-red-500 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
        </div>
      </div>

      {/* Progress tracker */}
      {!isCancelled && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
          <h2 className="font-semibold text-gray-900 mb-5">Order Progress</h2>
          <div className="flex items-center">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    i < currentStep  ? 'bg-green-500 text-white' :
                    i === currentStep? 'bg-orange-500 text-white' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {i < currentStep ? <FiCheck size={16}/> : i + 1}
                  </div>
                  <span className={`text-xs mt-2 capitalize whitespace-nowrap font-medium ${
                    i <= currentStep ? 'text-gray-800' : 'text-gray-400'
                  }`}>{step}</span>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 mb-5 transition-colors ${i < currentStep ? 'bg-green-500' : 'bg-gray-200'}`}/>
                )}
              </div>
            ))}
          </div>
          {order.trackingNumber && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
              <FiTruck className="text-indigo-500" size={16}/>
              <span className="text-sm text-gray-700">Tracking: <strong className="font-mono">{order.trackingNumber}</strong></span>
            </div>
          )}
        </div>
      )}

      {/* Items */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
        <h2 className="font-semibold text-gray-900 mb-4">Items ({order.items?.length})</h2>
        <div className="space-y-4">
          {order.items?.map((item, i) => (
            <div key={i} className="flex gap-4">
              <img src={item.image || 'https://via.placeholder.com/64'} alt={item.name}
                className="w-16 h-16 rounded-xl object-cover border border-gray-100 shrink-0"/>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 line-clamp-2">{item.name}</p>
                <p className="text-sm text-gray-500 mt-0.5">Qty: {item.qty} × ${item.price?.toFixed(2)}</p>
              </div>
              <p className="font-bold text-gray-900 shrink-0">${(item.price * item.qty).toFixed(2)}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 mt-4 pt-4 space-y-2 text-sm">
          <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>${order.itemsPrice?.toFixed(2)}</span></div>
          <div className="flex justify-between text-gray-500">
            <span>Shipping</span>
            <span className={order.shippingPrice === 0 ? 'text-green-600 font-medium' : ''}>
              {order.shippingPrice === 0 ? 'FREE' : `$${order.shippingPrice?.toFixed(2)}`}
            </span>
          </div>
          <div className="flex justify-between text-gray-500"><span>Tax (13%)</span><span>${order.taxPrice?.toFixed(2)}</span></div>
          <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
            <span>Total</span><span className="text-orange-600">${order.totalPrice?.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        {/* Shipping address */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FiMapPin className="text-orange-500" size={15}/> Shipping Address
          </h2>
          <div className="text-sm text-gray-600 space-y-1">
            <p className="font-semibold text-gray-800">{order.shippingAddress?.name}</p>
            <p>{order.shippingAddress?.address}</p>
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
            <p>{order.shippingAddress?.country} {order.shippingAddress?.zip}</p>
            <p className="flex items-center gap-1 mt-2"><FiPhone size={12} className="text-gray-400"/>{order.shippingAddress?.phone}</p>
            <p className="flex items-center gap-1"><FiMail size={12} className="text-gray-400"/>{order.shippingAddress?.email}</p>
          </div>
        </div>

        {/* Payment info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Payment</h2>
          <div className="text-sm space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Method:</span>
              <span className="font-semibold uppercase bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md text-xs">
                {order.paymentMethod}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Status:</span>
              <span className={`font-semibold text-xs px-2 py-0.5 rounded-full ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {order.isPaid ? `Paid on ${new Date(order.paidAt).toLocaleDateString()}` : 'Not paid yet'}
              </span>
            </div>
            {order.paymentMethod === 'cod' && !order.isPaid && (
              <p className="text-xs text-gray-400 mt-2 bg-orange-50 border border-orange-100 rounded-lg p-2">
                💵 Payment will be collected when delivered
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Status history */}
      {order.statusHistory?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Status History</h2>
          <div className="space-y-3">
            {[...order.statusHistory].reverse().map((h, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-white text-xs ${
                  h.status === 'delivered' ? 'bg-green-500' :
                  h.status === 'cancelled' ? 'bg-red-500' :
                  h.status === 'shipped'   ? 'bg-indigo-500' : 'bg-orange-400'
                }`}>
                  {h.status === 'delivered' ? <FiCheck size={11}/> :
                   h.status === 'cancelled' ? <FiX size={11}/> :
                   h.status === 'shipped'   ? <FiTruck size={11}/> :
                   <FiPackage size={11}/>}
                </div>
                <div className="flex-1">
                  <span className="font-semibold capitalize text-gray-800">{h.status}</span>
                  {h.note && <p className="text-gray-500 text-xs mt-0.5">{h.note}</p>}
                </div>
                <span className="text-xs text-gray-400 shrink-0">
                  {new Date(h.createdAt).toLocaleDateString('en-US', { day:'numeric', month:'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
