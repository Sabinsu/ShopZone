// client/src/pages/HomePage.jsx  ← REPLACE
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiArrowRight, FiTruck, FiShield, FiRefreshCw, FiHeadphones } from 'react-icons/fi'
import api from '../api/axios'
import ProductCard from '../components/ProductCard'
import { SkeletonCard } from '../components/ui/Skeleton'
import { useAuth } from '../context/AuthContext'

const CATEGORIES = [
  { name: 'Electronics',   emoji: '📱', color: 'bg-blue-50   text-blue-600' },
  { name: 'Fashion',        emoji: '👗', color: 'bg-pink-50   text-pink-600' },
  { name: 'Home & Garden',  emoji: '🏡', color: 'bg-green-50  text-green-600' },
  { name: 'Sports',         emoji: '⚽', color: 'bg-yellow-50 text-yellow-600' },
  { name: 'Books',          emoji: '📚', color: 'bg-purple-50 text-purple-600' },
  { name: 'Beauty',         emoji: '💄', color: 'bg-rose-50   text-rose-600' },
  { name: 'Toys',           emoji: '🧸', color: 'bg-orange-50 text-orange-600' },
  { name: 'Grocery',        emoji: '🛒', color: 'bg-lime-50   text-lime-600' },
]

const FEATURES = [
  { icon: FiTruck,      title: 'Free Shipping',   desc: 'On orders over Rs 2,000' },
  { icon: FiShield,     title: 'Secure Payment',  desc: '100% secure transactions' },
  { icon: FiRefreshCw,  title: 'Easy Returns',    desc: '7-day hassle-free returns' },
  { icon: FiHeadphones, title: '24/7 Support',    desc: 'Round the clock help' },
]

export default function HomePage() {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const [featured,  setFeatured]  = useState([])
  const [trending,  setTrending]  = useState([])
  const [recs,      setRecs]      = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [featRes, trendRes] = await Promise.all([
          api.get('/products?isFeatured=true&limit=8'),
          api.get('/products?sort=sold&limit=8'),
        ])
        setFeatured(featRes.data.products || featRes.data)
        setTrending(trendRes.data.products || trendRes.data)

        if (user?._id) {
          const recRes = await api.get(`/recommendations/${user._id}`)
          setRecs(recRes.data || [])
        }
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [user?._id])

  return (
    <div className="animate-fade-in">

      {/* ── Hero ──────────────────────────────────── */}
      <section className="bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 text-center md:text-left">
            <span className="inline-block bg-white/20 text-sm font-semibold px-4 py-1 rounded-full mb-4 backdrop-blur">🔥 AI-Powered Shopping</span>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4">
              Shop Smarter,<br />
              <span className="text-white/90">Save Bigger</span>
            </h1>
            <p className="text-orange-100 text-lg mb-8 max-w-md">
              Discover millions of products at the best prices. Free shipping, easy returns, 24/7 support.
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <Link to="/products" className="bg-white text-orange-600 font-bold px-8 py-3.5 rounded-xl hover:bg-orange-50 transition-all flex items-center gap-2">
                Shop Now <FiArrowRight />
              </Link>
              {!user && (
                <Link to="/register" className="bg-orange-600/40 backdrop-blur text-white font-bold px-8 py-3.5 rounded-xl hover:bg-orange-600/60 transition-all border border-white/20">
                  Join Free
                </Link>
              )}
            </div>
            <div className="flex flex-wrap gap-6 mt-8 justify-center md:justify-start text-sm text-orange-100">
              <span>✓ 50,000+ Products</span>
              <span>✓ 2M+ Happy Customers</span>
              <span>✓ 100% Secure</span>
            </div>
          </div>
          <div className="text-[140px] select-none hidden md:block animate-bounce">🛍️</div>
        </div>
      </section>

      {/* ── Features bar ──────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3 py-2">
              <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{title}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories ────────────────────────────── */}
      <section className="section">
        <h2 className="section-title">Shop by Category</h2>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {CATEGORIES.map(({ name, emoji, color }) => (
            <Link
              key={name}
              to={`/products?category=${encodeURIComponent(name)}`}
              className={`${color} rounded-2xl p-3 flex flex-col items-center gap-2 text-center
                          hover:shadow-md hover:-translate-y-1 transition-all duration-200 group`}
            >
              <span className="text-3xl">{emoji}</span>
              <span className="text-xs font-semibold leading-tight">{name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Promo banner ──────────────────────────── */}
      <section className="section pt-0">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-8 flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-200 font-medium mb-1">Limited Time</p>
              <h3 className="text-2xl font-extrabold mb-2">Up to 50% Off<br/>Electronics</h3>
              <Link to="/products?category=Electronics" className="text-sm bg-white text-blue-600 font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 transition-all inline-flex items-center gap-1">
                Shop Now <FiArrowRight size={14}/>
              </Link>
            </div>
            <span className="text-7xl">📱</span>
          </div>
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl p-8 flex items-center justify-between">
            <div>
              <p className="text-sm text-pink-200 font-medium mb-1">New Arrivals</p>
              <h3 className="text-2xl font-extrabold mb-2">Trendy Fashion<br/>Collection</h3>
              <Link to="/products?category=Fashion" className="text-sm bg-white text-pink-600 font-semibold px-4 py-2 rounded-lg hover:bg-pink-50 transition-all inline-flex items-center gap-1">
                Explore <FiArrowRight size={14}/>
              </Link>
            </div>
            <span className="text-7xl">👗</span>
          </div>
        </div>
      </section>

      {/* ── Featured Products ──────────────────────── */}
      <section className="section pt-0">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title mb-0">⭐ Featured Products</h2>
          <Link to="/products?isFeatured=true" className="text-orange-500 hover:text-orange-600 text-sm font-semibold flex items-center gap-1">
            View All <FiArrowRight size={14}/>
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {loading
            ? Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)
            : featured.map(p => <ProductCard key={p._id} product={p} />)
          }
        </div>
      </section>

      {/* ── Recommendations (only if logged in) ──── */}
      {user && recs.length > 0 && (
        <section className="section pt-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title mb-0">🤖 Recommended for You</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {recs.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}

      {/* ── Trending ───────────────────────────────── */}
      <section className="section pt-0">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title mb-0">🔥 Trending Now</h2>
          <Link to="/products?sort=sold" className="text-orange-500 hover:text-orange-600 text-sm font-semibold flex items-center gap-1">
            View All <FiArrowRight size={14}/>
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {loading
            ? Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)
            : trending.map(p => <ProductCard key={p._id} product={p} />)
          }
        </div>
      </section>

    </div>
  )
}
