import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiCheckCircle, FiPackage, FiArrowRight } from 'react-icons/fi';
import api from '../api/axios';

export default function OrderSuccessPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (id) api.get(`/orders/${id}`).then(r => setOrder(r.data)).catch(() => {});
  }, [id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <FiCheckCircle size={40} className="text-green-500"/>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Order Placed! 🎉</h1>
        <p className="text-gray-500 mb-2">Thank you for shopping with ShopZone.</p>
        {id && <p className="text-sm font-mono bg-gray-100 rounded-lg px-3 py-2 inline-block text-gray-700 mb-6">
          Order #{id.slice(-8).toUpperCase()}
        </p>}

        {order && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm mb-6 text-left">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><FiPackage size={16} className="text-orange-500"/> Order Details</h3>
            <div className="space-y-2">
              {order.items?.map(item => (
                <div key={item._id} className="flex justify-between text-sm">
                  <span className="text-gray-600 truncate mr-3">{item.name} ×{item.quantity}</span>
                  <span className="font-medium text-gray-800 shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between text-sm font-bold">
                <span>Total</span>
                <span>${order.totalPrice?.toFixed(2)}</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">Delivering to</p>
              <p className="text-sm font-medium text-gray-800 mt-0.5">
                {order.shippingAddress?.fullName}, {order.shippingAddress?.city}, {order.shippingAddress?.country}
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/orders" className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-full transition-colors">
            View My Orders <FiArrowRight size={15}/>
          </Link>
          <Link to="/products" className="flex items-center justify-center gap-2 border-2 border-orange-500 text-orange-500 hover:bg-orange-50 font-semibold px-6 py-3 rounded-full transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
