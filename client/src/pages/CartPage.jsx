// client/src/pages/CartPage.jsx  ← REPLACE
import { Link, useNavigate } from 'react-router-dom'
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function CartPage() {
  const { cart, removeFromCart, updateQty, clearCart, cartTotal, cartCount } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  if (cart.length === 0) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center text-center px-4">
        <span className="text-8xl mb-4">🛒</span>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add items to your cart to see them here</p>
        <Link to="/products" className="btn-primary">Start Shopping</Link>
      </div>
    )
  }

  const shipping = cartTotal >= 2000 ? 0 : 150
  const total    = cartTotal + shipping

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Shopping Cart <span className="text-orange-500">({cartCount})</span></h1>
        <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1">
          <FiTrash2 size={14}/> Clear All
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-3">
          {cart.map(item => (
            <div key={item._id} className="card flex items-center gap-4 py-4">
              <Link to={`/products/${item._id}`} className="flex-shrink-0">
                <img src={item.images?.[0] || '/placeholder.png'} alt={item.name}
                  className="w-20 h-20 object-cover rounded-xl bg-gray-50" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item._id}`}>
                  <h3 className="font-semibold text-gray-800 line-clamp-2 hover:text-orange-500 transition-colors text-sm">{item.name}</h3>
                </Link>
                <p className="text-xs text-gray-400 mt-0.5">{item.category}</p>
                <p className="text-orange-600 font-bold mt-1">Rs {item.price.toLocaleString()}</p>
              </div>
              <div className="flex flex-col items-end gap-3">
                {/* Qty controls */}
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button onClick={() => updateQty(item._id, item.qty - 1)}
                    className="px-2.5 py-1.5 hover:bg-gray-50 transition-colors">
                    <FiMinus size={12}/>
                  </button>
                  <span className="px-3 text-sm font-semibold">{item.qty}</span>
                  <button onClick={() => updateQty(item._id, item.qty + 1)}
                    className="px-2.5 py-1.5 hover:bg-gray-50 transition-colors">
                    <FiPlus size={12}/>
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-800">
                    Rs {(item.price * item.qty).toLocaleString()}
                  </span>
                  <button onClick={() => removeFromCart(item._id)}
                    className="text-red-400 hover:text-red-500 transition-colors">
                    <FiTrash2 size={15}/>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div>
          <div className="card sticky top-20">
            <h2 className="font-bold text-gray-900 mb-4 text-lg">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cartCount} items)</span>
                <span>Rs {cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                {shipping === 0
                  ? <span className="text-green-600 font-semibold">FREE</span>
                  : <span>Rs {shipping}</span>
                }
              </div>
              {shipping > 0 && (
                <p className="text-xs text-gray-400 bg-orange-50 px-3 py-2 rounded-lg">
                  Add Rs {(2000 - cartTotal).toLocaleString()} more for free shipping!
                </p>
              )}
              <hr className="border-gray-100" />
              <div className="flex justify-between font-bold text-gray-900 text-base">
                <span>Total</span>
                <span>Rs {total.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => user ? navigate('/checkout') : navigate('/login', { state: { from: { pathname: '/checkout' } } })}
              className="btn-primary w-full mt-5 py-3.5">
              {user ? 'Proceed to Checkout' : 'Login to Checkout'} <FiArrowRight size={16}/>
            </button>

            <Link to="/products" className="btn-ghost w-full mt-2 py-2.5 text-sm justify-center">
              <FiShoppingBag size={14}/> Continue Shopping
            </Link>

            {/* Trust */}
            <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400 text-center">
              🔒 Secure checkout · COD available
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
