import { useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { FiCheck, FiPackage, FiArrowRight } from 'react-icons/fi'
import confetti from 'canvas-confetti'

export default function OrderSuccessPage() {
  const { id }   = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    // Simple confetti without package dependency — pure CSS celebration
    const timer = setTimeout(() => {}, 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiCheck size={48} className="text-green-500"/>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Order Placed! 🎉</h1>
        <p className="text-gray-500 mb-1">Thank you for your order.</p>
        {id && (
          <p className="text-sm text-gray-400 mb-6">
            Order ID: <span className="font-mono font-semibold text-gray-700">#{id.slice(-8).toUpperCase()}</span>
          </p>
        )}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6 text-left space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
              <FiPackage className="text-orange-500" size={16}/>
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">What happens next?</p>
              <p className="text-xs text-gray-500 mt-1">Our team will confirm your order within 1-2 hours. You'll receive a notification when it's shipped.</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to={`/orders/${id}`}
            className="btn-primary flex items-center justify-center gap-2 py-3">
            <FiPackage size={16}/> Track Order
          </Link>
          <Link to="/products"
            className="btn-outline flex items-center justify-center gap-2 py-3">
            Continue Shopping <FiArrowRight size={16}/>
          </Link>
        </div>
      </div>
    </div>
  )
}
