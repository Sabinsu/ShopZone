import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiChevronRight } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const INITIAL_ADDR = { fullName: '', address: '', city: '', state: '', country: '', zip: '', phone: '' };

export default function CheckoutPage() {
  const { cart, cartSubtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step,    setStep]    = useState(1); // 1=shipping 2=payment
  const [addr,    setAddr]    = useState({ ...INITIAL_ADDR, fullName: user?.name || '' });
  const [method,  setMethod]  = useState('cod');
  const [loading, setLoading] = useState(false);

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
        paymentMethod:   method,
        itemsPrice:      +cartSubtotal.toFixed(2),
        taxPrice:        tax,
        shippingPrice:   +shipping.toFixed(2),
        totalPrice:      total,
      });

      if (method === 'cod') {
        clearCart();
        navigate(`/order-success/${order._id}`);
      } else {
        // Stripe flow
        const { data: { clientSecret } } = await api.post('/payment/create-intent', { amount: total });
        if (clientSecret.startsWith('mock_')) {
          // Dev mode — skip Stripe UI
          await api.put(`/orders/${order._id}/pay`, { paymentResult: { status: 'mock_paid' } });
          clearCart();
          navigate(`/order-success/${order._id}`);
        } else {
          // In production, open Stripe Elements here
          toast('Stripe payment UI — integrate Stripe Elements here.');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed. Try again.');
    } finally { setLoading(false); }
  };

  if (cart.length === 0) { navigate('/cart'); return null; }

  const inputCls = "w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100";
  const labelCls = "block text-xs font-semibold text-gray-600 mb-1";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-8">
        {['Shipping', 'Payment'].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step > i ? 'bg-orange-500 text-white' : step === i + 1 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
              {step > i + 1 ? '✓' : i + 1}
            </div>
            <span className={`text-sm font-medium ${step === i + 1 ? 'text-orange-500' : 'text-gray-400'}`}>{label}</span>
            {i < 1 && <FiChevronRight className="text-gray-300"/>}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Step 1: Shipping */}
          {step === 1 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold text-gray-900 text-lg mb-5">Shipping Address</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={labelCls}>Full Name *</label>
                  <input name="fullName" value={addr.fullName} onChange={handleAddrChange} required className={inputCls} placeholder="Jane Doe"/>
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Street Address *</label>
                  <input name="address" value={addr.address} onChange={handleAddrChange} required className={inputCls} placeholder="123 Main St, Apt 4B"/>
                </div>
                <div>
                  <label className={labelCls}>City *</label>
                  <input name="city" value={addr.city} onChange={handleAddrChange} required className={inputCls} placeholder="Kathmandu"/>
                </div>
                <div>
                  <label className={labelCls}>State / Province</label>
                  <input name="state" value={addr.state} onChange={handleAddrChange} className={inputCls} placeholder="Bagmati"/>
                </div>
                <div>
                  <label className={labelCls}>Country *</label>
                  <input name="country" value={addr.country} onChange={handleAddrChange} required className={inputCls} placeholder="Nepal"/>
                </div>
                <div>
                  <label className={labelCls}>ZIP / Postal Code *</label>
                  <input name="zip" value={addr.zip} onChange={handleAddrChange} required className={inputCls} placeholder="44600"/>
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Phone Number</label>
                  <input name="phone" value={addr.phone} onChange={handleAddrChange} className={inputCls} placeholder="+977 9800000000"/>
                </div>
              </div>
              <button
                onClick={() => {
                  if (!addr.fullName || !addr.address || !addr.city || !addr.country || !addr.zip)
                    return toast.error('Please fill all required fields');
                  setStep(2);
                }}
                className="mt-6 w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Continue to Payment
              </button>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold text-gray-900 text-lg mb-5">Payment Method</h2>
              <div className="space-y-3 mb-6">
                {[
                  { value: 'cod',    label: 'Cash on Delivery', desc: 'Pay when your order arrives', icon: '💵' },
                  { value: 'stripe', label: 'Credit / Debit Card', desc: 'Secure payment via Stripe', icon: '💳' },
                ].map(({ value, label, desc, icon }) => (
                  <label key={value} className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-colors ${method === value ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="payment" value={value} checked={method === value} onChange={() => setMethod(value)} className="accent-orange-500"/>
                    <span className="text-2xl">{icon}</span>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{label}</p>
                      <p className="text-xs text-gray-500">{desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500 mb-6 bg-gray-50 rounded-xl px-4 py-3">
                <FiLock size={14} className="text-green-500 shrink-0"/>
                Your payment info is encrypted and secure. We never store card details.
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm">
                  ← Back
                </button>
                <button
                  onClick={handleOrder}
                  disabled={loading}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
                >
                  {loading ? 'Placing Order…' : `Place Order · $${total}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div>
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm sticky top-24">
            <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-3 mb-4 max-h-56 overflow-y-auto">
              {cart.map(item => (
                <div key={item._id} className="flex gap-3 items-center">
                  <img src={item.images?.[0] || 'https://via.placeholder.com/50'} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-gray-50 shrink-0"/>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-400">×{item.quantity}</p>
                  </div>
                  <span className="text-xs font-semibold text-gray-800">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>${cartSubtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-500"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : `$${shipping}`}</span></div>
              <div className="flex justify-between text-gray-500"><span>Tax</span><span>${tax}</span></div>
              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100"><span>Total</span><span>${total}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
