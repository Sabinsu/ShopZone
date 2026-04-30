// Key additions vs original:
//   1. RecommendationSection (for-you, trending) below featured products
//   2. FounderSection near bottom
//   3. Product card click tracks 'view' activity
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiArrowRight, FiShoppingCart, FiStar, FiPackage, FiShield, FiTruck } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useTracker } from '../hooks/useTracker'
import RecommendationSection from '../components/product/RecommendationSection'
import FounderSection from '../components/FounderSection'
import api from '../api/axios'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { name: 'Electronics',  emoji: '💻', color: 'bg-blue-100   text-blue-700' },
  { name: 'Clothing',     emoji: '👗', color: 'bg-pink-100   text-pink-700' },
  { name: 'Home & Kitchen',emoji:'🏠', color: 'bg-yellow-100 text-yellow-700' },
  { name: 'Sports',       emoji: '⚽', color: 'bg-green-100  text-green-700' },
  { name: 'Books',        emoji: '📚', color: 'bg-purple-100 text-purple-700' },
  { name: 'Health & Beauty',emoji:'💄',color: 'bg-red-100    text-red-700' },
]

export default function HomePage() {
  const [featured, setFeatured] = useState([])
  const [loading,  setLoading]  = useState(true)
  const { addToCart }  = useCart()
  const { isUser }     = useAuth()
  const { track }      = useTracker()
  const navigate       = useNavigate()

  useEffect(() => {
    api.get('/products/featured')
      .then(r => setFeatured(r.data.slice(0, 8)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleAddToCart = (product) => {
    addToCart(product)
    toast.success(`${product.name} added to cart!`)
    track('cart', { productId: product._id, category: product.category })
  }

  const handleProductClick = (product) => {
    track('view', { productId: product._id, category: product.category })
    navigate(`/products/${product._id}`)
  }

  return (
    <div className="bg-white">
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-orange-50 via-white to-orange-50 py-16 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-block bg-orange-100 text-orange-600 text-xs font-semibold px-3 py-1 rounded-full mb-4">
              🤖 AI-Powered Shopping
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
              Shop Smarter<br/>
              <span className="text-orange-500">With ShopZone</span>
            </h1>
            <p className="text-gray-600 text-lg mb-8 max-w-md">
              Discover thousands of products from trusted sellers — powered by AI recommendations just for you.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/products" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-full flex items-center gap-2 transition-colors shadow-lg shadow-orange-200">
                Shop Now <FiArrowRight/>
              </Link>
              <Link to="/become-seller" className="border-2 border-orange-500 text-orange-500 hover:bg-orange-50 font-semibold px-6 py-3 rounded-full transition-colors">
                Sell With Us
              </Link>
            </div>
          </div>
          <div className="hidden md:grid grid-cols-2 gap-4">
            {['📱','👟','🎧','💍'].map((emoji, i) => (
              <div key={i} className={`rounded-2xl p-6 flex items-center justify-center text-5xl ${i%2===0?'bg-orange-100':'bg-orange-50'} h-32`}>
                {emoji}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust badges ── */}
      <section className="border-y border-gray-100 py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: <FiTruck   className="text-orange-500" size={24}/>, title: 'Free Shipping',  sub: 'On orders over $50' },
            { icon: <FiShield  className="text-orange-500" size={24}/>, title: 'Secure Payment', sub: 'SSL encrypted checkout' },
            { icon: <FiPackage className="text-orange-500" size={24}/>, title: 'Easy Returns',   sub: '30-day hassle-free' },
            { icon: <FiStar    className="text-orange-500" size={24}/>, title: 'Trusted Sellers',sub: 'Verified merchants' },
          ].map(({ icon, title, sub }) => (
            <div key={title} className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">{icon}</div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{title}</p>
                <p className="text-gray-500 text-xs">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
          <Link to="/products" className="text-orange-500 hover:text-orange-600 text-sm font-medium flex items-center gap-1">
            View all <FiArrowRight size={14}/>
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {CATEGORIES.map(({ name, emoji, color }) => (
            <Link key={name} to={`/products?category=${encodeURIComponent(name)}`}
              className={`${color} rounded-xl py-5 flex flex-col items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer`}>
              <span className="text-3xl">{emoji}</span>
              <span className="text-xs font-semibold text-center">{name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="max-w-7xl mx-auto px-4 pb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
          <Link to="/products?featured=true" className="text-orange-500 hover:text-orange-600 text-sm font-medium flex items-center gap-1">
            See all <FiArrowRight size={14}/>
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <div key={i} className="bg-gray-100 rounded-2xl h-64 animate-pulse"/>)}
          </div>
        ) : featured.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <FiPackage size={48} className="mx-auto mb-3 opacity-40"/>
            <p>No featured products yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map(product => (
              <ProductCard key={product._id} product={product} onAddToCart={handleAddToCart} onClick={handleProductClick}/>
            ))}
          </div>
        )}
      </section>

      {/* ── Trending Now (no auth needed) ── */}
      <section className="max-w-7xl mx-auto px-4 pb-8">
        <RecommendationSection type="trending" limit={6} cols="grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"/>
      </section>

      {/* ── Personalised recommendations (auth only) ── */}
      {isUser && (
        <section className="max-w-7xl mx-auto px-4 pb-8">
          <RecommendationSection type="for-you" limit={6} cols="grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"/>
        </section>
      )}

      {/* ── Become Seller CTA ── */}
      <section className="bg-gradient-to-r from-orange-500 to-orange-600 py-14 px-4 text-center">
        <h2 className="text-3xl font-bold text-white mb-3">Start Selling Today</h2>
        <p className="text-orange-100 max-w-xl mx-auto mb-6">
          Join thousands of sellers on ShopZone and reach millions of customers. Setting up your store takes under 5 minutes.
        </p>
        <Link to="/become-seller" className="bg-white text-orange-500 font-bold px-8 py-3 rounded-full hover:bg-orange-50 transition-colors inline-flex items-center gap-2">
          Become a Seller <FiArrowRight/>
        </Link>
      </section>

      {/* ── Founders ── */}
      <FounderSection />
    </div>
  )
}

function ProductCard({ product, onAddToCart, onClick }) {
  const img = product.images?.[0] || 'https://via.placeholder.com/300x300?text=No+Image'
  const discount = product.comparePrice > product.price
    ? Math.round((1 - product.price / product.comparePrice) * 100) : 0

  return (
    <div
      className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer hover:-translate-y-0.5"
      onClick={() => onClick(product)}
    >
      <div className="relative overflow-hidden bg-gray-50 h-44">
        <img src={img} alt={product.name} loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            -{discount}%
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-xs text-gray-400 mb-1 capitalize">{product.category}</p>
        <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 mb-2">{product.name}</h3>
        <div className="flex items-center gap-1 mb-2">
          <FiStar size={12} className="text-yellow-400 fill-yellow-400"/>
          <span className="text-xs text-gray-600">{product.ratings?.toFixed(1)||'0.0'}</span>
          <span className="text-xs text-gray-400">({product.numReviews||0})</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="font-bold text-gray-900">${product.price?.toFixed(2)}</span>
            {discount > 0 && <span className="text-xs text-gray-400 line-through ml-1">${product.comparePrice?.toFixed(2)}</span>}
          </div>
          <button
            onClick={e => { e.stopPropagation(); onAddToCart(product) }}
            className="w-8 h-8 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center transition-colors"
          >
            <FiShoppingCart size={14}/>
          </button>
        </div>
      </div>
    </div>
  )
}
