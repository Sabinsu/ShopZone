import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiPackage, FiTruck, FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';
import api from '../api/axios';
import toast from 'react-hot-toast';

const STATUS_STEPS = ['pending','confirmed','processing','shipped','delivered'];
const ICONS = { pending: FiClock, confirmed: FiCheckCircle, processing: FiPackage, shipped: FiTruck, delivered: FiCheckCircle };

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(r => setOrder(r.data))
      .catch(() => navigate('/orders'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleCancel = async () => {
    if (!confirm('Cancel this order?')) return;
    setCancelling(true);
    try {
      const { data } = await api.put(`/orders/${id}/cancel`);
      setOrder(data);
      toast.success('Order cancelled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot cancel this order');
    } finally { setCancelling(false); }
  };

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="h-8 bg-gray-100 rounded w-48 animate-pulse mb-8"/>
      <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse"/>)}</div>
    </div>
  );
  if (!order) return null;

  const statusIdx  = STATUS_STEPS.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';
  const canCancel   = ['pending','confirmed'].includes(order.status);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button onClick={() => navigate('/orders')} className="flex items-center gap-1 text-gray-500 hover:text-orange-500 mb-6 text-sm transition-colors">
        <FiChevronLeft/> My Orders
      </button>

      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Order Detail</h1>
          <p className="text-sm text-gray-500 font-mono mt-0.5">#{order._id.slice(-8).toUpperCase()}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full capitalize ${isCancelled ? 'bg-red-100 text-red-600' : order.status === 'delivered' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
            {order.status}
          </span>
          {canCancel && (
            <button onClick={handleCancel} disabled={cancelling} className="text-xs text-red-500 border border-red-300 px-3 py-1.5 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50">
              {cancelling ? 'Cancelling…' : 'Cancel Order'}
            </button>
          )}
        </div>
      </div>

      {/* Progress tracker */}
      {!isCancelled && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm mb-5">
          <h2 className="font-semibold text-gray-800 mb-4 text-sm">Order Progress</h2>
          <div className="flex items-center">
            {STATUS_STEPS.map((step, i) => {
              const Icon    = ICONS[step] || FiPackage;
              const done    = i <= statusIdx;
              const current = i === statusIdx;
              return (
                <div key={step} className="flex-1 flex flex-col items-center relative">
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`absolute left-1/2 top-4 w-full h-0.5 ${i < statusIdx ? 'bg-orange-400' : 'bg-gray-200'}`}/>
                  )}
                  <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${done ? 'bg-orange-500' : 'bg-gray-200'} ${current ? 'ring-4 ring-orange-100' : ''}`}>
                    <Icon size={15} className={done ? 'text-white' : 'text-gray-400'}/>
                  </div>
                  <span className={`mt-2 text-xs font-medium capitalize ${done ? 'text-orange-500' : 'text-gray-400'}`}>{step}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm mb-5">
        <h2 className="font-semibold text-gray-800 mb-4">Items Ordered</h2>
        <div className="space-y-4">
          {order.items?.map(item => (
            <div key={item._id} className="flex items-center gap-4">
              {item.image && <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover bg-gray-50 shrink-0"/>}
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.product?._id || item.product}`} className="text-sm font-medium text-gray-800 hover:text-orange-500 transition-colors line-clamp-1">{item.name}</Link>
                <p className="text-xs text-gray-400 mt-0.5">Qty: {item.quantity} · ${item.price?.toFixed(2)} each</p>
              </div>
              <span className="font-bold text-gray-900 text-sm shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 mt-4 pt-4 space-y-1.5 text-sm">
          <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>${order.itemsPrice?.toFixed(2)}</span></div>
          <div className="flex justify-between text-gray-500"><span>Shipping</span><span>{order.shippingPrice === 0 ? 'FREE' : `$${order.shippingPrice?.toFixed(2)}`}</span></div>
          <div className="flex justify-between text-gray-500"><span>Tax</span><span>${order.taxPrice?.toFixed(2)}</span></div>
          <div className="flex justify-between font-bold text-gray-900 text-base pt-1 border-t border-gray-100"><span>Total</span><span>${order.totalPrice?.toFixed(2)}</span></div>
        </div>
      </div>

      {/* Shipping address */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-3 text-sm">Shipping Address</h2>
          <p className="text-sm text-gray-700 font-medium">{order.shippingAddress?.fullName}</p>
          <p className="text-sm text-gray-500 mt-1">{order.shippingAddress?.address}</p>
          <p className="text-sm text-gray-500">{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zip}</p>
          <p className="text-sm text-gray-500">{order.shippingAddress?.country}</p>
          {order.shippingAddress?.phone && <p className="text-sm text-gray-500 mt-1">{order.shippingAddress.phone}</p>}
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-3 text-sm">Payment Info</h2>
          <p className="text-sm text-gray-700 font-medium capitalize">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}</p>
          <span className={`mt-2 inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {order.isPaid ? `Paid · ${new Date(order.paidAt).toLocaleDateString()}` : 'Not paid yet'}
          </span>
          {order.trackingNumber && (
            <div className="mt-3">
              <p className="text-xs text-gray-400">Tracking Number</p>
              <p className="text-sm font-mono font-medium text-gray-800">{order.trackingNumber}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
