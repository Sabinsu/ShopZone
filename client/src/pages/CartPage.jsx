import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CartPage() {
  const { cart, cartSubtotal, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const shipping = cartSubtotal >= 50 ? 0 : 5.99;
  const tax      = +(cartSubtotal * 0.08).toFixed(2);
  const total    = +(cartSubtotal + shipping + tax).toFixed(2);

  if (cart.length === 0) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <FiShoppingBag size={64} className="mx-auto text-gray-200 mb-4"/>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
      <p className="text-gray-500 mb-6">Add products from the store to get started</p>
      <Link to="/products" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-full inline-flex items-center gap-2 transition-colors">
        Browse Products <FiArrowRight/>
      </Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Shopping Cart <span className="text-gray-400 font-normal text-lg">({cart.length} items)</span></h1>
        <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors">
          <FiTrash2 size={14}/> Clear all
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map(item => {
            const img = item.images?.[0] || 'https://via.placeholder.com/100x100?text=No+Image';
            return (
              <div key={item._id} className="bg-white border border-gray-100 rounded-2xl p-4 flex gap-4 shadow-sm">
                <img
                  src={img} alt={item.name}
                  className="w-20 h-20 object-cover rounded-xl bg-gray-50 shrink-0 cursor-pointer"
                  onClick={() => navigate(`/products/${item._id}`)}
                />
                <div className="flex-1 min-w-0">
                  <h3
                    className="font-semibold text-gray-800 text-sm line-clamp-2 cursor-pointer hover:text-orange-500 transition-colors"
                    onClick={() => navigate(`/products/${item._id}`)}
                  >{item.name}</h3>
                  <p className="text-xs text-gray-400 capitalize mt-0.5">{item.category}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="px-2.5 py-1.5 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                      ><FiMinus size={13}/></button>
                      <span className="px-3 py-1.5 text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        disabled={item.quantity >= (item.stock || 99)}
                        className="px-2.5 py-1.5 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                      ><FiPlus size={13}/></button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                      <button onClick={() => removeFromCart(item._id)} className="text-gray-400 hover:text-red-500 transition-colors">
                        <FiTrash2 size={16}/>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order summary */}
        <div>
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm sticky top-24">
            <h2 className="font-bold text-gray-900 text-lg mb-5">Order Summary</h2>
            <div className="space-y-3 text-sm mb-5">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>${cartSubtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>{shipping === 0 ? 'FREE' : `$${shipping}`}</span>
              </div>
              <div className="flex justify-between text-gray-600"><span>Tax (8%)</span><span>${tax}</span></div>
              {cartSubtotal < 50 && cartSubtotal > 0 && (
                <p className="text-xs text-orange-500 bg-orange-50 rounded-lg px-3 py-2">
                  Add ${(50 - cartSubtotal).toFixed(2)} more for free shipping!
                </p>
              )}
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900 text-base">
                <span>Total</span><span>${total}</span>
              </div>
            </div>
            {user ? (
              <Link
                to="/checkout"
                className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Proceed to Checkout
              </Link>
            ) : (
              <Link
                to="/login"
                state={{ from: '/checkout' }}
                className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Login to Checkout
              </Link>
            )}
            <Link to="/products" className="block text-center text-sm text-gray-500 hover:text-orange-500 mt-3 transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
