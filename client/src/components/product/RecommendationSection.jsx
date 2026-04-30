// Replaces the old ai/RecommendedProducts.jsx — much more powerful
// Usage:
//   <RecommendationSection type="for-you" />
//   <RecommendationSection type="trending" category="Electronics" />
//   <RecommendationSection type="related"  productId={id} />
//   <RecommendationSection type="collaborative" productId={id} label="Customers also bought" />

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiStar, FiShoppingCart, FiTrendingUp, FiHeart, FiArrowRight } from 'react-icons/fi'
import { BsRobot } from 'react-icons/bs'
import api from '../../api/axios'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { useTracker } from '../../hooks/useTracker'
import toast from 'react-hot-toast'

const ENDPOINT_MAP = {
  'for-you':       '/recommendations/for-you',
  'trending':      '/recommendations/trending',
  'related':       (pid) => `/recommendations/related/${pid}`,
  'collaborative': (pid) => `/recommendations/collaborative/${pid}`,
}

const LABELS = {
  'for-you':       { icon: <BsRobot />,        title: 'Recommended For You', badge: 'AI Powered' },
  'trending':      { icon: <FiTrendingUp />,   title: 'Trending Now',        badge: '🔥 Hot' },
  'related':       { icon: <FiHeart />,        title: 'Similar Products',    badge: null },
  'collaborative': { icon: <FiShoppingCart />, title: 'Customers Also Bought', badge: null },
}

function ProductCard({ product, onAdd }) {
  const img = product.images?.[0] || 'https://via.placeholder.com/200'
  const disc = product.comparePrice > product.price
    ? Math.round((1 - product.price / product.comparePrice) * 100) : 0

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
      <Link to={`/products/${product._id}`} className="relative overflow-hidden bg-gray-50 aspect-square block">
        <img
          src={img}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {disc > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            -{disc}%
          </span>
        )}
      </Link>
      <div className="p-3 flex flex-col flex-1">
        <p className="text-xs text-gray-400 capitalize mb-1">{product.category}</p>
        <Link to={`/products/${product._id}`}
          className="font-semibold text-gray-800 text-sm line-clamp-2 hover:text-orange-500 transition-colors flex-1">
          {product.name}
        </Link>
        <div className="flex items-center gap-1 my-1.5">
          <FiStar size={11} className="text-yellow-400 fill-yellow-400"/>
          <span className="text-xs text-gray-500">{product.ratings?.toFixed(1) || '0.0'}</span>
          {product.sold > 0 && <span className="text-xs text-gray-400 ml-1">{product.sold} sold</span>}
        </div>
        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="font-bold text-gray-900">${product.price?.toFixed(2)}</span>
            {disc > 0 && (
              <span className="text-xs text-gray-400 line-through ml-1">${product.comparePrice?.toFixed(2)}</span>
            )}
          </div>
          <button
            onClick={() => onAdd(product)}
            className="w-8 h-8 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center transition-colors shadow-sm"
          >
            <FiShoppingCart size={13}/>
          </button>
        </div>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-gray-100 rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-200"/>
      <div className="p-3 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-1/3"/>
        <div className="h-4 bg-gray-200 rounded w-full"/>
        <div className="h-4 bg-gray-200 rounded w-3/4"/>
        <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"/>
      </div>
    </div>
  )
}

export default function RecommendationSection({
  type = 'trending',
  productId = null,
  category  = '',
  label     = '',
  limit     = 6,
  cols      = 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
}) {
  const { addToCart }  = useCart()
  const { isUser }     = useAuth()
  const { track }      = useTracker()
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [basedOn,  setBasedOn]  = useState([])

  useEffect(() => {
    if (type === 'for-you' && !isUser) {
      setLoading(false)
      return
    }
    if ((type === 'related' || type === 'collaborative') && !productId) {
      setLoading(false)
      return
    }

    const endpointFn = ENDPOINT_MAP[type]
    const endpoint   = typeof endpointFn === 'function' ? endpointFn(productId) : endpointFn
    const params     = new URLSearchParams({ limit })
    if (category) params.set('category', category)

    api.get(`${endpoint}?${params}`)
      .then(r => {
        const data = r.data
        if (Array.isArray(data)) setProducts(data)
        else { setProducts(data.products || []); setBasedOn(data.basedOn || []) }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [type, productId, category, limit, isUser])

  const handleAdd = (product) => {
    addToCart(product)
    toast.success(`${product.name} added to cart!`)
    track('cart', { productId: product._id, category: product.category })
  }

  const meta = LABELS[type] || LABELS.trending
  const displayLabel = label || meta.title

  if (!loading && products.length === 0) return null

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="text-orange-500 text-lg">{meta.icon}</span>
          <h2 className="text-xl font-bold text-gray-900">{displayLabel}</h2>
          {meta.badge && (
            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-semibold">
              {meta.badge}
            </span>
          )}
          {type === 'for-you' && basedOn.length > 0 && (
            <span className="text-xs text-gray-400 hidden sm:inline">
              based on your interest in {basedOn.slice(0, 2).join(', ')}
            </span>
          )}
        </div>
        <Link to="/products" className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1 font-medium">
          See all <FiArrowRight size={13}/>
        </Link>
      </div>

      <div className={`grid ${cols} gap-4`}>
        {loading
          ? Array(limit).fill(0).map((_, i) => <SkeletonCard key={i}/>)
          : products.slice(0, limit).map(p => (
              <ProductCard key={p._id} product={p} onAdd={handleAdd}/>
            ))
        }
      </div>
    </section>
  )
}
