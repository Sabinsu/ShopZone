import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiLock, FiChevronRight, FiCheckCircle, FiTruck, FiPackage } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const INITIAL_ADDR = { fullName:'', address:'', city:'', state:'', country:'', zip:'', phone:'' };

const ORDER_FLOW = [
  { step:1, icon:FiPackage,  label:'Cart'     },
  { step:2, icon:FiTruck,    label:'Shipping'  },
  { step:3, icon:FiLock,     label:'Payment'   },
  { step:4, icon:FiCheckCircle, label:'Confirm' },
];

export default function CheckoutPage() {
  const { cart, cartSubtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step,    setStep]    = useState(1);
  const [addr,    setAddr]    = useState({ ...INITIAL_ADDR, fullName: user?.name || '' });
  const [method,  setMethod]  = useState('cod');
  const [loading, setLoading] = useState(false);
  const [placed,  setPlaced]  = useState(null); // placed order

  const shipping = cartSubtotal >= 50 ? 0 : 5.99;
  const tax      = +(cartSubtotal * 0.08).toFixed(2);
  const total    = +(cartSubtotal + shipping + tax).toFixed(2);

  const handleAddrChange = e => setAddr(a => ({ ...a, [e.target.name]: e.target.value }));

  const handleOrder = async () => {
    setLoading(true);
    try {
      const items = cart.map(i => ({
        product:  i._id,
        name:     i.name,
        image:    i.images?.[0] || '',
        price:    i.price,
        quantity: i.quantity,
      }));

      const { data: order } = await api.post('/orders', {
        items,
        shippingAddress: addr,
        paymentMethod:   method,   // 'cod'
        itemsPrice:      +cartSubtotal.toFixed(2),
        taxPrice:        tax,
        shippingPrice:   +shipping.toFixed(2),
        totalPrice:      total,
      });

      clearCart();
      setPlaced(order);
      setStep(4);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed. Please try again.');
    } finally { setLoading(false); }
  };

  if (cart.length === 0 && !placed) { navigate('/cart'); return null; }

  const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white transition-colors";
  const labelCls = "block text-xs font-semibold text-gray-600 mb-1.5";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      {/* Progress steps */}
      <div className="flex items-center mb-8 overflow-x-auto">
        {ORDER_FLOW.map(({ step: s, icon: Icon, label }, i) => (
          <div key={s} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                step > s ? 'bg-green-500 text-white' : step === s ? 'bg-orange-500 text-white ring-4 ring-orange-100' : 'bg-gray-100 text-gray-400'
              }`}>
                {step > s ? <FiCheckCircle size={16}/> : <Icon size={16}/>}
              </div>
              <span className={`text-xs mt-1 font-medium ${step>=s ? 'text-gray-700' : 'text-gray-400'}`}>{label}</span>
            </div>
            {i < ORDER_FLOW.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 rounded transition-colors ${step > s ? 'bg-green-400' : 'bg-gray-200'}`}/>
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">

          {/* STEP 1: Shipping */}
          {step === 1 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold text-gray-900 text-lg mb-5 flex items-center gap-2">
                <FiTruck className="text-orange-500" size={20}/> Shipping Address
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={labelCls}>Full Name *</label>
                  <input name="fullName" value={addr.fullName} onChange={handleAddrChange} className={inputCls} placeholder="Jane Doe" required/>
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Street Address *</label>
                  <input name="address" value={addr.address} onChange={handleAddrChange} className={inputCls} placeholder="123 Main St, Apt 4B" required/>
                </div>
                <div>
                  <label className={labelCls}>City *</label>
                  <input name="city" value={addr.city} onChange={handleAddrChange} className={inputCls} placeholder="Kathmandu" required/>
                </div>
                <div>
                  <label className={labelCls}>State / Province</label>
                  <input name="state" value={addr.state} onChange={handleAddrChange} className={inputCls} placeholder="Bagmati"/>
                </div>
                <div>
                  <label className={labelCls}>Country *</label>
                  <input name="country" value={addr.country} onChange={handleAddrChange} className={inputCls} placeholder="Nepal" required/>
                </div>
                <div>
                  <label className={labelCls}>ZIP / Postal Code *</label>
                  <input name="zip" value={addr.zip} onChange={handleAddrChange} className={inputCls} placeholder="44600" required/>
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Phone Number</label>
                  <input name="phone" value={addr.phone} onChange={handleAddrChange} className={inputCls} placeholder="+977 9800000000"/>
                </div>
              </div>
              <button
                onClick={() => {
                  if (!addr.fullName||!addr.address||!addr.city||!addr.country||!addr.zip)
                    return toast.error('Please fill all required fields');
                  setStep(2);
                }}
                className="mt-6 w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-orange-200"
              >
                Continue to Payment <FiChevronRight size={16}/>
              </button>
            </div>
          )}

          {/* STEP 2: Payment Method */}
          {step === 2 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold text-gray-900 text-lg mb-5 flex items-center gap-2">
                <FiLock className="text-orange-500" size={20}/> Payment Method
              </h2>

              <div className="space-y-3 mb-6">
                {/* COD Option - Main option */}
                <label className={`flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all ${method==='cod' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="payment" value="cod" checked={method==='cod'} onChange={() => setMethod('cod')} className="accent-orange-500"/>
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-xl shrink-0">💵</div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">Cash on Delivery</p>
                    <p className="text-xs text-gray-500 mt-0.5">Pay cash when your order arrives. No advance payment required.</p>
                  </div>
                  {method==='cod' && <FiCheckCircle size={20} className="text-orange-500 shrink-0"/>}
                </label>

                {/* Stripe — coming soon */}
                <div className="flex items-center gap-4 p-4 border-2 border-gray-100 rounded-2xl opacity-50 cursor-not-allowed">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl shrink-0">💳</div>
                  <div>
                    <p className="font-bold text-gray-800">Credit / Debit Card</p>
                    <p className="text-xs text-gray-400">Coming soon — Stripe integration</p>
                  </div>
                  <span className="ml-auto text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-medium">Soon</span>
                </div>
              </div>

              {/* COD info box */}
              {method === 'cod' && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-5 flex items-start gap-3">
                  <FiCheckCircle size={18} className="text-green-600 mt-0.5 shrink-0"/>
                  <div>
                    <p className="text-sm font-semibold text-green-800">Cash on Delivery Selected</p>
                    <p className="text-xs text-green-700 mt-0.5">Your order will be placed immediately. Pay the delivery agent when your package arrives.</p>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center gap-2 text-xs text-gray-500 mb-6">
                <FiLock size={13} className="text-gray-400 shrink-0"/>
                Your information is secure and encrypted. We never store sensitive payment data.
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm">
                  ← Back
                </button>
                <button onClick={() => setStep(3)}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-orange-200">
                  Review Order <FiChevronRight size={16}/>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Review + Confirm */}
          {step === 3 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold text-gray-900 text-lg mb-5">Review Your Order</h2>

              {/* Shipping summary */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Shipping To</p>
                  <button onClick={() => setStep(1)} className="text-xs text-orange-500 font-medium hover:text-orange-600">Edit</button>
                </div>
                <p className="text-sm font-semibold text-gray-800">{addr.fullName}</p>
                <p className="text-xs text-gray-500 mt-0.5">{addr.address}, {addr.city}, {addr.state} {addr.zip}, {addr.country}</p>
                {addr.phone && <p className="text-xs text-gray-500">{addr.phone}</p>}
              </div>

              {/* Payment summary */}
              <div className="bg-gray-50 rounded-xl p-4 mb-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Payment Method</p>
                  <button onClick={() => setStep(2)} className="text-xs text-orange-500 font-medium hover:text-orange-600">Edit</button>
                </div>
                <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  💵 Cash on Delivery
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Pay on arrival</span>
                </p>
              </div>

              {/* Items */}
              <div className="space-y-3 mb-5 max-h-56 overflow-y-auto">
                {cart.map(item => (
                  <div key={item._id} className="flex items-center gap-3">
                    <img src={item.images?.[0]||'https://via.placeholder.com/50'} alt={item.name}
                      className="w-12 h-12 rounded-xl object-cover bg-gray-100 shrink-0"/>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">{item.name}</p>
                      <p className="text-xs text-gray-400">×{item.quantity} · ${item.price?.toFixed(2)} each</p>
                    </div>
                    <span className="text-sm font-bold text-gray-800 shrink-0">${(item.price*item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm">
                  ← Back
                </button>
                <button onClick={handleOrder} disabled={loading}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-orange-200">
                  {loading ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Placing Order…</>
                  ) : `Confirm Order · $${total}`}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Success */}
          {step === 4 && placed && (
            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <FiCheckCircle size={40} className="text-green-500"/>
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Order Placed! 🎉</h2>
              <p className="text-gray-500 mb-2">Thank you for shopping with ShopZone!</p>
              <p className="font-mono text-sm bg-gray-100 rounded-lg px-3 py-2 inline-block text-gray-700 mb-6">
                Order #{placed._id?.slice(-8).toUpperCase()}
              </p>

              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-left">
                <p className="text-sm font-semibold text-green-800 flex items-center gap-2">
                  <FiTruck size={16}/> Cash on Delivery
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Your order is confirmed. Please keep <strong>${total}</strong> ready to pay the delivery agent when your package arrives.
                </p>
              </div>

              <div className="flex gap-3">
                <Link to={`/orders/${placed._id}`} className="flex-1 text-center bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
                  Track Order
                </Link>
                <Link to="/products" className="flex-1 text-center border-2 border-orange-500 text-orange-500 hover:bg-orange-50 font-semibold py-3 rounded-xl transition-colors text-sm">
                  Continue Shopping
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary sidebar */}
        {step < 4 && (
          <div>
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4 max-h-52 overflow-y-auto">
                {cart.map(item => (
                  <div key={item._id} className="flex gap-3 items-center">
                    <div className="relative shrink-0">
                      <img src={item.images?.[0]||'https://via.placeholder.com/40'} alt={item.name}
                        className="w-11 h-11 rounded-xl object-cover bg-gray-100"/>
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700 line-clamp-1">{item.name}</p>
                      <p className="text-xs text-gray-400">${item.price?.toFixed(2)}</p>
                    </div>
                    <span className="text-xs font-bold text-gray-800 shrink-0">${(item.price*item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>${cartSubtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-gray-500">
                  <span>Shipping</span>
                  <span className={shipping===0 ? 'text-green-600 font-medium' : ''}>{shipping===0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-gray-500"><span>Tax (8%)</span><span>${tax}</span></div>
                {cartSubtotal < 50 && cartSubtotal > 0 && (
                  <p className="text-xs text-orange-500 bg-orange-50 rounded-lg px-3 py-2">
                    Add ${(50-cartSubtotal).toFixed(2)} more for free shipping!
                  </p>
                )}
                <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-100 pt-2">
                  <span>Total</span><span>${total}</span>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                <FiLock size={12}/> Secure & encrypted checkout
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
