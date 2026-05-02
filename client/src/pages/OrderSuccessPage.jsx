// client/src/pages/OrderSuccessPage.jsx
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiCheckCircle, FiPackage, FiArrowRight } from 'react-icons/fi'
import api from '../api/axios'

export default function OrderSuccessPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    api.get(`/orders/${id}`).then(r => setOrder(r.data)).catch(() => {})
  }, [id])

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="text-center max-w-md w-full animate-fade-in">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <FiCheckCircle className="text-green-500" size={40} />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Order Placed! 🎉</h1>
        <p className="text-gray-500 mb-6">Your order has been successfully placed. We'll notify you when it ships.</p>

        {order && (
          <div className="card text-left mb-6">
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm font-semibold text-gray-700">Order ID</p>
              <p className="text-sm text-orange-600 font-mono">#{order._id?.slice(-8).toUpperCase()}</p>
            </div>
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm font-semibold text-gray-700">Total</p>
              <p className="text-sm font-bold">Rs {order.totalPrice?.toLocaleString()}</p>
            </div>
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm font-semibold text-gray-700">Payment</p>
              <span className="badge-orange">Cash on Delivery</span>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm font-semibold text-gray-700">Status</p>
              <span className="badge-blue">Pending</span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to={`/orders/${id}`} className="btn-outline flex items-center gap-2 justify-center">
            <FiPackage size={16}/> Track Order
          </Link>
          <Link to="/products" className="btn-primary flex items-center gap-2 justify-center">
            Continue Shopping <FiArrowRight size={16}/>
          </Link>
        </div>
      </div>
    </div>
  )
}
