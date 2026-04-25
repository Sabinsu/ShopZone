// client/src/components/ai/RecommendedProducts.jsx  ← NEW FILE
// Usage: <RecommendedProducts /> on HomePage or ProductDetailPage
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiStar } from 'react-icons/fi'
import { BsRobot } from 'react-icons/bs'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

function ProductMiniCard({ product }) {
  const img = product.images?.[0] || 'https://via.placeholder.com/150'
  return (
    <Link to={`/products/${product._id}`}
      className="group bg-white rounded-2xl shadow hover:shadow-md border border-gray-100 overflow-hidden transition-all hover:-translate-y-0.5">
      <div className="aspect-square overflow-hidden bg-gray-50">
        <img src={img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      </div>
      <div className="p-3">
        <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug">{product.name}</p>
        <div className="flex items-center gap-1 mt-1">
          <FiStar className="text-yellow-400 fill-yellow-400" size={11} />
          <span className="text-xs text-gray-500">{product.ratings?.toFixed(1) || '4.0'}</span>
        </div>
        <p className="text-orange-600 font-bold mt-1">${product.price?.toFixed(2)}</p>
      </div>
    </Link>
  )
}

export default function RecommendedProducts({ category }) {
  const { isUser } = useAuth()
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    if (!isUser) return
    const params = category ? `?category=${encodeURIComponent(category)}` : ''
    api.get(`/products/recommended${params}`)
      .then(r => setProducts(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isUser, category])

  if (!isUser || (!loading && products.length === 0)) return null

  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-2 mb-6">
          <BsRobot className="text-orange-500 text-xl" />
          <h2 className="text-xl font-bold text-gray-900">Recommended for You</h2>
          <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">AI Powered</span>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl aspect-square animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {products.slice(0, 6).map(p => <ProductMiniCard key={p._id} product={p} />)}
          </div>
        )}
      </div>
    </section>
  )
}
