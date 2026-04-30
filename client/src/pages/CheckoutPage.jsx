import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FiShoppingBag, FiMapPin, FiCreditCard, FiTruck, FiCheck, FiArrowLeft, FiLock } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useTracker } from '../hooks/useTracker'
import api  from '../api/axios'
import toast from 'react-hot-toast'

const STEPS = ['Cart Review', 'Shipping', 'Payment', 'Confirmation']

export default function CheckoutPage() {
  const { cartItems, clearCart, cartTotal } = useCart()
  const { user } = useAuth()
  const { track } = useTracker()
  const navigate   = useNavigate()

  const [step,     setStep]     = useState(0)
  const [loading,  setLoading]  = useState(false)
  const [orderId,  setOrderId]  = useState(null)

  const [shipping, setShipping] = useState({
    name:    user?.name    || '',
    email:   user?.email   || '',
    phone:   user?.phone   || '',
    address: user?.address?.street  || '',
    city:    user?.address?.city    || '',
    state:   user?.address?.state   || '',
    country: user?.address?.country || 'Nepal',
    zip:     user?.address?.zip     || '',
  })

  const [payment, setPayment] = useState({
    method: 'cod',   // 'cod' | 'stripe'
  })

  const shippingFee = cartTotal > 50 ? 0 : 5
  const tax         = +(cartTotal * 0.13).toFixed(2)   // 13% VAT (Nepal)
  const grandTotal  = +(cartTotal + shippingFee + tax).toFixed(2)

  if (cartItems.length === 0 && !orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <FiShoppingBag size={56} className="mx-auto text-gray-300 mb-4"/>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
          <Link to="/products" className="text-orange-500 underline">Continue shopping</Link>
        </div>
      </div>
    )
  }

  // ── Step validators ───────────────────────────────────────────────────────
  const validateShipping = () => {
    const { name, email, phone, address, city, country } = shipping
    if (!name || !email || !phone || !address || !city || !country) {
      toast.error('Please fill all required fields')
      return false
    }
    return true
  }

  // ── Place order ───────────────────────────────────────────────────────────
  const placeOrder = async () => {
    setLoading(true)
    try {
      const orderData = {
        items: cartItems.map(item => ({
          product:  item._id,
          name:     item.name,
          price:    item.price,
          image:    item.images?.[0] || '',
          qty:      item.qty,
          category: item.category || '',
        })),
        shippingAddress: shipping,
        paymentMethod:   payment.method,
        itemsPrice:      cartTotal,
        shippingPrice:   shippingFee,
        taxPrice:        tax,
        totalPrice:      grandTotal,
      }

      const { data } = await api.post('/orders', orderData)
      setOrderId(data._id)

      // Track purchase activity for every item
      for (const item of cartItems) {
        track('purchase', { productId: item._id, category: item.category || '' })
      }

      clearCart()
      setStep(3)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  // ── Step 0: Cart Review ───────────────────────────────────────────────────
  const CartReview = () => (
    <div className="space-y-4">
      <h2 className="font-semibold text-gray-900 mb-4">Review Your Cart ({cartItems.length} items)</h2>
      {cartItems.map(item => (
        <div key={item._id} className="flex gap-4 py-3 border-b border-gray-50 last:border-0">
          <img src={item.images?.[0] || 'https://via.placeholder.com/80'} alt={item.name}
            className="w-16 h-16 rounded-xl object-cover border border-gray-100"/>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-800 text-sm line-clamp-2">{item.name}</p>
            <p className="text-xs text-gray-400 capitalize mt-0.5">{item.category}</p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-500">Qty: {item.qty}</span>
              <span className="font-bold text-gray-900">${(item.price * item.qty).toFixed(2)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  // ── Step 1: Shipping ──────────────────────────────────────────────────────
  const ShippingForm = () => (
    <div>
      <h2 className="font-semibold text-gray-900 mb-5">Shipping Address</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { key:'name',    label:'Full Name *',    type:'text',  placeholder:'Sabin Subedi' },
          { key:'email',   label:'Email *',        type:'email', placeholder:'you@email.com' },
          { key:'phone',   label:'Phone *',        type:'tel',   placeholder:'+977 9800000000' },
          { key:'address', label:'Street Address *',type:'text', placeholder:'123 Durbar Marg', span: true },
          { key:'city',    label:'City *',         type:'text',  placeholder:'Kathmandu' },
          { key:'state',   label:'State / Province',type:'text', placeholder:'Bagmati' },
          { key:'country', label:'Country *',      type:'text',  placeholder:'Nepal' },
          { key:'zip',     label:'ZIP / Post Code', type:'text', placeholder:'44600' },
        ].map(({ key, label, type, placeholder, span }) => (
          <div key={key} className={span ? 'sm:col-span-2' : ''}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
              type={type}
              value={shipping[key]}
              onChange={e => setShipping(s => ({ ...s, [key]: e.target.value }))}
              placeholder={placeholder}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
            />
          </div>
        ))}
      </div>
    </div>
  )

  // ── Step 2: Payment ───────────────────────────────────────────────────────
  const PaymentStep = () => (
    <div>
      <h2 className="font-semibold text-gray-900 mb-5">Payment Method</h2>
      <div className="space-y-3 mb-6">
        {/* COD */}
        <label className={`flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-colors ${
          payment.method === 'cod' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
        }`}>
          <input type="radio" name="payment" value="cod" checked={payment.method === 'cod'}
            onChange={() => setPayment({ method: 'cod' })} className="accent-orange-500"/>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-xl">💵</div>
            <div>
              <p className="font-semibold text-gray-900">Cash on Delivery</p>
              <p className="text-xs text-gray-500">Pay when your order arrives</p>
            </div>
            <span className="ml-auto text-xs bg-green-100 text-green-700 font-medium px-2 py-0.5 rounded-full">FREE</span>
          </div>
        </label>

        {/* Card (Stripe — disabled in demo, easy to enable) */}
        <label className={`flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-colors opacity-50`}>
          <input type="radio" name="payment" disabled className="accent-orange-500"/>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl">💳</div>
            <div>
              <p className="font-semibold text-gray-900">Credit / Debit Card</p>
              <p className="text-xs text-gray-500">Visa, Mastercard — Coming soon</p>
            </div>
          </div>
        </label>

        {/* eSewa / Khalti (Nepal-specific, placeholder) */}
        <label className={`flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-colors opacity-50`}>
          <input type="radio" name="payment" disabled className="accent-orange-500"/>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-xl">📱</div>
            <div>
              <p className="font-semibold text-gray-900">eSewa / Khalti</p>
              <p className="text-xs text-gray-500">Digital wallets — Coming soon</p>
            </div>
          </div>
        </label>
      </div>

      {/* Order summary */}
      <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-sm">
        <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
        <div className="flex justify-between text-gray-600"><span>Subtotal ({cartItems.length} items)</span><span>${cartTotal.toFixed(2)}</span></div>
        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          <span className={shippingFee === 0 ? 'text-green-600 font-medium' : ''}>{shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}</span>
        </div>
        <div className="flex justify-between text-gray-600"><span>Tax (13% VAT)</span><span>${tax}</span></div>
        <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-200">
          <span>Total</span><span className="text-orange-600">${grandTotal}</span>
        </div>
      </div>
    </div>
  )

  // ── Step 3: Confirmation ──────────────────────────────────────────────────
  const Confirmation = () => (
    <div className="text-center py-8">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <FiCheck size={40} className="text-green-500"/>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
      <p className="text-gray-500 mb-2">Thank you for your order, {shipping.name.split(' ')[0]}!</p>
      <p className="text-sm text-gray-400 mb-1">Order ID: <span className="font-mono font-semibold text-gray-700">#{orderId?.slice(-8).toUpperCase()}</span></p>
      <p className="text-sm text-gray-400 mb-6">
        {payment.method === 'cod'
          ? '💵 Cash on Delivery — pay when your order arrives'
          : '💳 Payment confirmed'}
      </p>
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-6 text-left max-w-sm mx-auto">
        <p className="text-sm font-semibold text-gray-800 mb-1">Delivering to:</p>
        <p className="text-sm text-gray-600">{shipping.address}, {shipping.city}</p>
        <p className="text-sm text-gray-600">{shipping.country} {shipping.zip}</p>
        <p className="text-sm text-gray-500 mt-1">{shipping.phone}</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/orders" className="bg-orange-500 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-orange-600 transition-colors inline-flex items-center justify-center gap-2">
          <FiTruck size={16}/> Track Order
        </Link>
        <Link to="/products" className="border-2 border-gray-200 text-gray-700 font-semibold px-6 py-2.5 rounded-xl hover:border-gray-300 transition-colors inline-flex items-center justify-center gap-2">
          Continue Shopping
        </Link>
      </div>
    </div>
  )

  const stepContent = [<CartReview/>, <ShippingForm/>, <PaymentStep/>, <Confirmation/>]

  const handleNext = () => {
    if (step === 0) { setStep(1); return }
    if (step === 1) { if (validateShipping()) setStep(2); return }
    if (step === 2) { placeOrder(); return }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress steps */}
        {step < 3 && (
          <div className="flex items-center justify-center mb-8 gap-2">
            {STEPS.slice(0,3).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  i < step ? 'bg-green-500 text-white' : i === step ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {i < step ? <FiCheck size={14}/> : i + 1}
                </div>
                <span className={`text-sm hidden sm:inline ${i === step ? 'font-semibold text-gray-900' : 'text-gray-400'}`}>{s}</span>
                {i < 2 && <div className={`w-8 h-0.5 ${i < step ? 'bg-green-500' : 'bg-gray-200'}`}/>}
              </div>
            ))}
          </div>
        )}

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
          {stepContent[step]}
        </div>

        {/* Navigation */}
        {step < 3 && (
          <div className="flex items-center justify-between">
            <button
              onClick={() => step > 0 ? setStep(s => s-1) : null}
              disabled={step === 0}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-0 transition-colors"
            >
              <FiArrowLeft size={14}/> Back
            </button>
            <button
              onClick={handleNext}
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-xl flex items-center gap-2 disabled:opacity-50 transition-colors shadow-lg shadow-orange-200"
            >
              {loading ? 'Placing order...' :
               step === 2 ? <><FiLock size={14}/> Place Order — ${grandTotal}</> :
               'Continue →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
