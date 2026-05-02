// client/src/pages/CheckoutPage.jsx  ← REPLACE
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiMapPin, FiPhone, FiUser, FiCheckCircle } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart()
  const { user } = useAuth()
  const navigate  = useNavigate()

  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    fullName:    user?.name || '',
    phone:       user?.phone || '',
    address:     '',
    city:        '',
    area:        '',
    postalCode:  '',
  })

  const shipping = cartTotal >= 2000 ? 0 : 150
  const total    = cartTotal + shipping

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    if (!form.fullName || !form.phone || !form.address || !form.city) {
      toast.error('Please fill all required fields')
      return
    }
    if (cart.length === 0) { toast.error('Your cart is empty'); return }

    setLoading(true)
    try {
      const orderData = {
        items: cart.map(item => ({
          product:   item._id,
          name:      item.name,
          image:     item.images?.[0] || '',
          price:     item.price,
          quantity:  item.qty,
        })),
        shippingAddress: {
          fullName:   form.fullName,
          phone:      form.phone,
          address:    form.address,
          city:       form.city,
          area:       form.area,
          postalCode: form.postalCode,
        },
        paymentMethod:   'COD',
        itemsPrice:      cartTotal,
        shippingPrice:   shipping,
        totalPrice:      total,
      }

      const { data } = await api.post('/orders', orderData)
      clearCart()
      toast.success('Order placed successfully! 🎉')
      navigate(`/order-success/${data._id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order')
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

      <form onSubmit={handlePlaceOrder}>
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Shipping form */}
          <div className="lg:col-span-2 space-y-5">
            <div className="card">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiMapPin className="text-orange-500" size={18}/> Delivery Address
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Full Name *</label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15}/>
                    <input name="fullName" value={form.fullName} onChange={handleChange}
                      placeholder="Your full name" className="input pl-9" required />
                  </div>
                </div>
                <div>
                  <label className="label">Phone Number *</label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15}/>
                    <input name="phone" value={form.phone} onChange={handleChange}
                      placeholder="03XX-XXXXXXX" className="input pl-9" required />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Street Address *</label>
                  <input name="address" value={form.address} onChange={handleChange}
                    placeholder="House No., Street, Area" className="input" required />
                </div>
                <div>
                  <label className="label">City *</label>
                  <input name="city" value={form.city} onChange={handleChange}
                    placeholder="e.g. Kathmandu" className="input" required />
                </div>
                <div>
                  <label className="label">Area / District</label>
                  <input name="area" value={form.area} onChange={handleChange}
                    placeholder="e.g. Thamel" className="input" />
                </div>
                <div>
                  <label className="label">Postal Code</label>
                  <input name="postalCode" value={form.postalCode} onChange={handleChange}
                    placeholder="44600" className="input" />
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div className="card">
              <h2 className="font-bold text-gray-900 mb-4">💳 Payment Method</h2>
              <div className="flex items-center gap-3 p-4 border-2 border-orange-500 bg-orange-50 rounded-xl cursor-pointer">
                <div className="w-5 h-5 rounded-full border-2 border-orange-500 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">Cash on Delivery (COD)</p>
                  <p className="text-xs text-gray-500">Pay when your order arrives</p>
                </div>
                <span className="ml-auto text-2xl">💵</span>
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div>
            <div className="card sticky top-20">
              <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                {cart.map(item => (
                  <div key={item._id} className="flex gap-3 items-center">
                    <img src={item.images?.[0] || '/placeholder.png'} alt=""
                      className="w-12 h-12 object-cover rounded-lg bg-gray-50 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700 line-clamp-2">{item.name}</p>
                      <p className="text-xs text-gray-400">Qty: {item.qty}</p>
                    </div>
                    <span className="text-xs font-bold text-gray-800 flex-shrink-0">
                      Rs {(item.price * item.qty).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              <hr className="border-gray-100 mb-3"/>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span><span>Rs {cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  {shipping === 0
                    ? <span className="text-green-600 font-semibold">FREE</span>
                    : <span>Rs {shipping}</span>}
                </div>
                <hr className="border-gray-100"/>
                <div className="flex justify-between font-bold text-gray-900">
                  <span>Total</span><span>Rs {total.toLocaleString()}</span>
                </div>
              </div>
              <button type="submit" disabled={loading || cart.length === 0}
                className="btn-primary w-full mt-5 py-3.5">
                {loading ? <span className="spinner w-5 h-5"/> : '📦 Place Order'}
              </button>
              <p className="text-xs text-gray-400 text-center mt-3">🔒 Your data is secure with us</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
