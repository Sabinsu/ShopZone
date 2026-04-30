import { Link, useNavigate } from 'react-router-dom'
import { FiTrash2, FiArrowLeft, FiShoppingBag } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function CartPage() {
  const { cart, removeFromCart, updateQty, cartTotal, shippingFee, tax, orderTotal, cartCount } = useCart()
  const { user }    = useAuth()
  const navigate    = useNavigate()

  const handleCheckout = () => {
    if (!user) { toast('Please sign in to checkout'); return navigate('/login', { state: { from: { pathname: '/checkout' } } }) }
    navigate('/checkout')
  }

  if (cart.length === 0) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="text-6xl mb-6">🛒</div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
      <p className="text-gray-400 mb-8">Looks like you haven't added anything yet.</p>
      <Link to="/products" className="btn-primary inline-flex items-center gap-2">
        <FiShoppingBag /> Start Shopping
      </Link>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/products" className="text-gray-500 hover:text-orange-500"><FiArrowLeft /></Link>
        <h1 className="text-2xl font-bold text-gray-800">Shopping Cart <span className="text-gray-400 text-base font-normal">({cartCount} items)</span></h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map(item => (
            <div key={item._id} className="card flex gap-4 p-4">
              <img
                src={item.images?.[0] || 'https://placehold.co/100x100?text=?'}
                alt={item.name}
                className="w-24 h-24 object-contain rounded-lg bg-gray-50 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item._id}`} className="font-medium text-gray-800 hover:text-orange-500 line-clamp-2 text-sm">{item.name}</Link>
                <p className="text-xs text-gray-400 mt-0.5">{item.category}</p>
                <div className="flex items-center justify-between mt-3">
                  {/* Qty controls */}
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button onClick={() => item.quantity > 1 ? updateQty(item._id, item.quantity - 1) : removeFromCart(item._id)}
                      className="px-2.5 py-1 hover:bg-gray-100 text-gray-600 font-bold">−</button>
                    <span className="px-3 py-1 text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => item.quantity < item.stock && updateQty(item._id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="px-2.5 py-1 hover:bg-gray-100 text-gray-600 font-bold disabled:opacity-30">+</button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                    <button onClick={() => removeFromCart(item._id)} className="text-red-400 hover:text-red-600">
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <div className="card p-5 sticky top-24">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cartCount} items)</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{shippingFee === 0 ? <span className="text-green-600 font-medium">FREE</span> : `$${shippingFee.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              {shippingFee > 0 && (
                <p className="text-xs text-orange-500 bg-orange-50 rounded-lg px-3 py-2">
                  Add ${(100 - cartTotal).toFixed(2)} more for free shipping!
                </p>
              )}
            </div>
            <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between font-bold text-gray-900">
              <span>Total</span>
              <span>${orderTotal.toFixed(2)}</span>
            </div>
            <button onClick={handleCheckout} className="btn-primary w-full mt-4">
              Proceed to Checkout
            </button>
            <Link to="/products" className="block text-center text-sm text-gray-500 hover:text-orange-500 mt-3">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
