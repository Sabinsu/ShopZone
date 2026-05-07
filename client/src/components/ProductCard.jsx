// client/src/components/ProductCard.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiShoppingCart, FiHeart, FiStar, FiEye } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function ProductCard({ product }) {
  const { addToCart, isInCart } = useCart()
  const { isUser, user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [imgLoaded,  setImgLoaded]  = useState(false)
  const [hovered,    setHovered]    = useState(false)
  const [wishlisted, setWishlisted] = useState(user?.wishlist?.includes(product._id))

  const discount = product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100) : 0

  const handleAddToCart = (e) => {
    e.stopPropagation()
    addToCart(product)
    toast.success(`Added to cart!`, { icon: '🛒' })
  }

  const handleWishlist = async (e) => {
    e.stopPropagation()
    if (!isUser) { toast.error('Please login first'); return }
    try {
      const { data } = await api.post(`/auth/wishlist/${product._id}`)
      setWishlisted(data.added)
      updateUser({ wishlist: data.wishlist })
    } catch { toast.error('Failed') }
  }

  return (
    <div
      onClick={() => navigate(`/products/${product._id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--dark-3)',
        border: `1px solid ${hovered ? 'rgba(212,175,55,0.28)' : 'var(--dark-5)'}`,
        borderRadius: 18,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.32s cubic-bezier(0.16,1,0.3,1)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? '0 12px 48px rgba(212,175,55,0.12), 0 4px 20px rgba(0,0,0,0.4)' : '0 2px 16px rgba(0,0,0,0.3)',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '1', background: 'var(--dark-4)' }}>
        {!imgLoaded && <div className="skeleton" style={{ position:'absolute', inset:0, borderRadius:0 }} />}

        <img
          src={product.images?.[0] || 'https://placehold.co/400x400/1A1A24/D4AF37?text=ShopZone'}
          loading="lazy"
          onError={e => { e.target.src = 'https://placehold.co/400x400/1A1A24/7A7268?text=No+Image' }}
          alt={product.name}
          onLoad={() => setImgLoaded(true)}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transition: 'transform 0.5s cubic-bezier(0.16,1,0.3,1)',
            transform: hovered ? 'scale(1.08)' : 'scale(1)',
            opacity: imgLoaded ? 1 : 0,
          }}
        />

        {/* Overlay on hover */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(10,10,15,0.7) 0%, transparent 50%)',
          opacity: hovered ? 1 : 0, transition: 'opacity 0.3s',
        }}/>

        {/* Badges */}
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
          {discount > 0 && (
            <span style={{ background:'var(--gold)', color:'#0A0A0F', fontSize:'0.65rem', fontWeight:800, padding:'3px 8px', borderRadius:6, letterSpacing:'0.04em' }}>
              -{discount}%
            </span>
          )}
          {product.isFeatured && (
            <span style={{ background:'rgba(212,175,55,0.15)', color:'var(--gold)', border:'1px solid rgba(212,175,55,0.3)', fontSize:'0.6rem', fontWeight:700, padding:'2px 7px', borderRadius:5, letterSpacing:'0.06em' }}>
              ★ FEATURED
            </span>
          )}
          {product.stock === 0 && (
            <span style={{ background:'rgba(248,113,113,0.15)', color:'#f87171', border:'1px solid rgba(248,113,113,0.3)', fontSize:'0.6rem', fontWeight:700, padding:'2px 7px', borderRadius:5 }}>
              SOLD OUT
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          style={{
            position: 'absolute', top: 10, right: 10,
            width: 32, height: 32, borderRadius: '50%',
            background: wishlisted ? 'rgba(248,113,113,0.2)' : 'rgba(10,10,15,0.6)',
            border: wishlisted ? '1px solid rgba(248,113,113,0.4)' : '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.2s',
            opacity: hovered || wishlisted ? 1 : 0,
          }}
        >
          <FiHeart size={13} style={{ color: wishlisted ? '#f87171' : '#F5F0E8', fill: wishlisted ? '#f87171' : 'none' }} />
        </button>

        {/* Add to cart — slides up on hover */}
        {product.stock > 0 && (
          <button
            onClick={handleAddToCart}
            style={{
              position: 'absolute', bottom: 10, left: 10, right: 10,
              padding: '9px', borderRadius: 10,
              background: isInCart(product._id)
                ? 'rgba(0,212,170,0.85)'
                : 'rgba(212,175,55,0.92)',
              backdropFilter: 'blur(8px)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              fontSize: '0.8rem', fontWeight: 700,
              color: '#0A0A0F', letterSpacing: '0.02em',
              transform: hovered ? 'translateY(0)' : 'translateY(60px)',
              transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            <FiShoppingCart size={13}/>
            {isInCart(product._id) ? 'In Cart ✓' : 'Add to Cart'}
          </button>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '12px 14px 14px' }}>
        <p style={{ fontSize: '0.65rem', color: 'var(--gold)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 5 }}>
          {product.category}
        </p>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-1)', lineHeight: 1.4, marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '2.45rem', fontFamily: '"DM Sans", sans-serif' }}>
          {product.name}
        </h3>

        {/* Stars */}
        {product.numReviews > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
            <div style={{ display: 'flex' }}>
              {[1,2,3,4,5].map(s => (
                <FiStar key={s} size={11} style={{
                  color: s <= Math.round(product.ratings) ? 'var(--gold)' : 'var(--dark-5)',
                  fill:  s <= Math.round(product.ratings) ? 'var(--gold)' : 'transparent',
                }}/>
              ))}
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>({product.numReviews})</span>
          </div>
        )}

        {/* Price */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-1)', fontFamily: '"Space Mono", monospace' }}>
            Rs {product.price?.toLocaleString()}
          </span>
          {product.comparePrice > product.price && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', textDecoration: 'line-through' }}>
              Rs {product.comparePrice?.toLocaleString()}
            </span>
          )}
        </div>

        {product.stock > 0 && product.stock <= 10 && (
          <p style={{ fontSize: '0.7rem', color: '#f87171', marginTop: 5, fontWeight: 600 }}>
            ⚡ Only {product.stock} left
          </p>
        )}
      </div>
    </div>
  )
}
