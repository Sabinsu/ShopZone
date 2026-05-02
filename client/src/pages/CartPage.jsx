// client/src/pages/CartPage.jsx
import { Link, useNavigate } from 'react-router-dom'
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight, FiTag } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function CartPage() {
  const { cart, removeFromCart, updateQty, clearCart, cartTotal, cartCount } = useCart()
  const { user } = useAuth()
  const navigate  = useNavigate()
  const shipping  = cartTotal >= 26600 ? 0 : 200   // ~Rs 200 (free above ~$200)
  const total     = cartTotal + shipping

  if (cart.length === 0) {
    return (
      <div style={{ minHeight:'calc(100vh - 68px)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'2rem', background:'var(--dark)' }}>
        <div style={{ fontSize:'6rem', marginBottom:'1.5rem', filter:'drop-shadow(0 0 40px rgba(212,175,55,0.2))' }}>🛒</div>
        <h2 style={{ fontFamily:'"Playfair Display",serif', fontSize:'2rem', color:'var(--text-1)', marginBottom:8 }}>Your cart is empty</h2>
        <p style={{ color:'var(--text-3)', marginBottom:'2rem' }}>Add some amazing products to get started</p>
        <Link to="/products" className="btn-primary" style={{ fontSize:'1rem', padding:'13px 28px' }}>Start Shopping</Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth:1100, margin:'0 auto', padding:'2.5rem 1.25rem', minHeight:'calc(100vh - 68px)' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'2rem' }}>
        <h1 style={{ fontFamily:'"Playfair Display",serif', fontSize:'2rem', color:'var(--text-1)', fontWeight:800 }}>
          Cart <span style={{ color:'var(--gold)' }}>({cartCount})</span>
        </h1>
        <button onClick={clearCart} style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.8rem', color:'#f87171', background:'none', border:'none', cursor:'pointer', padding:'6px 12px', borderRadius:8, transition:'background 0.2s' }}
          onMouseEnter={e=>e.currentTarget.style.background='rgba(248,113,113,0.1)'}
          onMouseLeave={e=>e.currentTarget.style.background='none'}>
          <FiTrash2 size={13}/> Clear All
        </button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:'1.5rem', alignItems:'start' }}>
        {/* Items */}
        <div style={{ display:'flex', flexDirection:'column', gap:'0.875rem', minWidth:0 }}>
          {cart.map(item => (
            <div key={item._id} style={{ background:'var(--dark-3)', border:'1px solid var(--dark-5)', borderRadius:18, padding:'1.25rem', display:'flex', gap:'1rem', alignItems:'center' }}>
              <Link to={`/products/${item._id}`} style={{ flexShrink:0 }}>
                <img src={item.images?.[0] || 'https://placehold.co/80x80/1A1A24/D4AF37?text=SZ'} alt={item.name}
                  style={{ width:72, height:72, objectFit:'cover', borderRadius:12, background:'var(--dark-4)' }}/>
              </Link>
              <div style={{ flex:1, minWidth:0 }}>
                <Link to={`/products/${item._id}`}>
                  <h3 style={{ fontSize:'0.9rem', fontWeight:600, color:'var(--text-1)', marginBottom:3, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{item.name}</h3>
                </Link>
                <p style={{ fontSize:'0.72rem', color:'var(--text-3)', marginBottom:6, letterSpacing:'0.04em', textTransform:'uppercase' }}>{item.category}</p>
                <p style={{ fontSize:'1rem', fontWeight:800, color:'var(--gold)', fontFamily:'"Space Mono",monospace' }}>Rs {item.price.toLocaleString()}</p>
              </div>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:10 }}>
                <div style={{ display:'flex', alignItems:'center', background:'var(--dark-4)', border:'1px solid var(--dark-5)', borderRadius:10, overflow:'hidden' }}>
                  <button onClick={() => updateQty(item._id, item.qty - 1)} style={{ width:32, height:32, background:'none', border:'none', cursor:'pointer', color:'var(--text-2)', display:'flex', alignItems:'center', justifyContent:'center', transition:'background 0.15s' }}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--dark-5)'}
                    onMouseLeave={e=>e.currentTarget.style.background='none'}>
                    <FiMinus size={12}/>
                  </button>
                  <span style={{ padding:'0 12px', fontSize:'0.875rem', fontWeight:700, color:'var(--text-1)', minWidth:36, textAlign:'center' }}>{item.qty}</span>
                  <button onClick={() => updateQty(item._id, item.qty + 1)} style={{ width:32, height:32, background:'none', border:'none', cursor:'pointer', color:'var(--text-2)', display:'flex', alignItems:'center', justifyContent:'center', transition:'background 0.15s' }}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--dark-5)'}
                    onMouseLeave={e=>e.currentTarget.style.background='none'}>
                    <FiPlus size={12}/>
                  </button>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ fontSize:'0.9rem', fontWeight:800, color:'var(--text-1)', fontFamily:'"Space Mono",monospace' }}>
                    Rs {(item.price * item.qty).toLocaleString()}
                  </span>
                  <button onClick={() => removeFromCart(item._id)} style={{ color:'#f87171', background:'none', border:'none', cursor:'pointer', padding:4, borderRadius:6, transition:'background 0.15s' }}
                    onMouseEnter={e=>e.currentTarget.style.background='rgba(248,113,113,0.1)'}
                    onMouseLeave={e=>e.currentTarget.style.background='none'}>
                    <FiTrash2 size={14}/>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div style={{ width:300, flexShrink:0 }}>
          <div style={{ background:'var(--dark-3)', border:'1px solid rgba(212,175,55,0.2)', borderRadius:20, padding:'1.5rem', position:'sticky', top:86, boxShadow:'0 8px 40px rgba(0,0,0,0.4)' }}>
            <h2 style={{ fontFamily:'"Playfair Display",serif', fontSize:'1.2rem', fontWeight:700, color:'var(--text-1)', marginBottom:'1.25rem' }}>Order Summary</h2>
            <div style={{ display:'flex', flexDirection:'column', gap:10, fontSize:'0.875rem', marginBottom:'1.25rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', color:'var(--text-2)' }}>
                <span>Subtotal ({cartCount} items)</span>
                <span>Rs {cartTotal.toLocaleString()}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', color:'var(--text-2)' }}>
                <span>Shipping</span>
                {shipping === 0
                  ? <span style={{ color:'#00D4AA', fontWeight:700 }}>FREE</span>
                  : <span>Rs {shipping}</span>}
              </div>
              {shipping > 0 && (
                <div style={{ background:'rgba(212,175,55,0.08)', border:'1px solid rgba(212,175,55,0.15)', borderRadius:8, padding:'8px 12px', fontSize:'0.75rem', color:'var(--gold)' }}>
                  <FiTag size={11} style={{ marginRight:5 }}/>
                  Add Rs {(26600 - cartTotal).toLocaleString()} more for free shipping!
                </div>
              )}
              <div style={{ height:1, background:'var(--dark-5)', margin:'4px 0' }}/>
              <div style={{ display:'flex', justifyContent:'space-between', fontWeight:800, fontSize:'1rem', color:'var(--text-1)' }}>
                <span>Total</span>
                <span style={{ fontFamily:'"Space Mono",monospace', color:'var(--gold)' }}>Rs {total.toLocaleString()}</span>
              </div>
            </div>
            <button onClick={() => user ? navigate('/checkout') : navigate('/login', { state:{ from:{ pathname:'/checkout' } } })} className="btn-primary" style={{ width:'100%', padding:'13px', fontSize:'0.95rem', justifyContent:'center' }}>
              {user ? 'Checkout' : 'Login to Checkout'} <FiArrowRight size={15}/>
            </button>
            <Link to="/products" className="btn-ghost" style={{ width:'100%', marginTop:8, justifyContent:'center', fontSize:'0.85rem' }}>
              <FiShoppingBag size={14}/> Continue Shopping
            </Link>
            <p style={{ textAlign:'center', fontSize:'0.7rem', color:'var(--text-3)', marginTop:'1rem' }}>🔒 Secure checkout · COD available</p>
          </div>
        </div>
      </div>
    </div>
  )
}
