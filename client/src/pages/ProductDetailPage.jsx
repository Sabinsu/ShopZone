// Key additions vs original:
//   1. Tracks 'view' on mount
//   2. Related Products section (RecommendationSection type="related")
//   3. Collaborative "Customers also bought" section
//   4. Review section is already there — preserved
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { FiStar, FiShoppingCart, FiHeart, FiMinus, FiPlus, FiArrowLeft, FiShare2, FiTruck, FiShield } from 'react-icons/fi'
import { useCart }    from '../context/CartContext'
import { useAuth }    from '../context/AuthContext'
import { useTracker } from '../hooks/useTracker'
import RecommendationSection from '../components/product/RecommendationSection'
import api  from '../api/axios'
import toast from 'react-hot-toast'

export default function ProductDetailPage() {
  const { id }        = useParams()
  const navigate      = useNavigate()
  const { addToCart } = useCart()
  const { user, isUser } = useAuth()
  const { track }     = useTracker()

  const [product,  setProduct]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [qty,      setQty]      = useState(1)
  const [selImg,   setSelImg]   = useState(0)
  const [review,   setReview]   = useState({ rating: 5, comment: '' })
  const [submitting, setSubmitting] = useState(false)
  const [wishlist, setWishlist] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.get(`/products/${id}`)
      .then(r => {
        setProduct(r.data)
        // Track view for recommendations
        track('view', { productId: r.data._id, category: r.data.category })
      })
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
      <div className="grid md:grid-cols-2 gap-10">
        <div className="aspect-square bg-gray-200 rounded-2xl"/>
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-5 bg-gray-200 rounded"/>)}
        </div>
      </div>
    </div>
  )
  if (!product) return null

  const images  = product.images?.length ? product.images : ['https://via.placeholder.com/400']
  const inStock = product.stock > 0
  const disc    = product.comparePrice > product.price
    ? Math.round((1-product.price/product.comparePrice)*100) : 0

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addToCart(product)
    toast.success(`${product.name} added to cart!`)
    track('cart', { productId: product._id, category: product.category })
  }

  const handleWishlist = async () => {
    if (!isUser) return toast.error('Login to add to wishlist')
    try {
      const { data } = await api.post(`/auth/wishlist/${product._id}`)
      setWishlist(data.added)
      toast.success(data.added ? 'Added to wishlist' : 'Removed from wishlist')
      if (data.added) track('wishlist', { productId: product._id, category: product.category })
    } catch { toast.error('Failed to update wishlist') }
  }

  const handleReview = async (e) => {
    e.preventDefault()
    if (!review.comment.trim()) return toast.error('Please write a comment')
    setSubmitting(true)
    try {
      await api.post(`/products/${product._id}/reviews`, review)
      toast.success('Review submitted!')
      const { data } = await api.get(`/products/${product._id}`)
      setProduct(data)
      setReview({ rating: 5, comment: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Review failed')
    } finally { setSubmitting(false) }
  }

  const alreadyReviewed = isUser && product.reviews?.some(r => r.user?._id === user?._id || r.user === user?._id)

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <button onClick={() => navigate(-1)} className="hover:text-orange-500 flex items-center gap-1">
            <FiArrowLeft size={14}/> Back
          </button>
          <span>/</span>
          <Link to="/products" className="hover:text-orange-500">Products</Link>
          <span>/</span>
          <Link to={`/products?category=${product.category}`} className="hover:text-orange-500 capitalize">{product.category}</Link>
          <span>/</span>
          <span className="text-gray-700 line-clamp-1">{product.name}</span>
        </nav>

        {/* Main grid */}
        <div className="grid md:grid-cols-2 gap-10 mb-12">
          {/* Images */}
          <div>
            <div className="bg-gray-50 rounded-2xl overflow-hidden aspect-square mb-3">
              <img src={images[selImg]} alt={product.name}
                className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"/>
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setSelImg(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${selImg===i?'border-orange-500':'border-gray-200'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover"/>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium capitalize">
                  {product.category}
                </span>
                {product.brand && <span className="text-xs text-gray-400 ml-2">{product.brand}</span>}
              </div>
              <button onClick={handleWishlist}
                className={`p-2 rounded-full border transition-colors ${wishlist?'bg-red-50 border-red-300 text-red-500':'border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-400'}`}>
                <FiHeart size={18} className={wishlist?'fill-red-500':''}/>
              </button>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-3">{product.name}</h1>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <FiStar key={i} size={16} className={i < Math.round(product.ratings) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}/>
                ))}
              </div>
              <span className="text-sm text-gray-600">{product.ratings?.toFixed(1)} ({product.numReviews} reviews)</span>
              {product.sold > 0 && <span className="text-xs text-gray-400">{product.sold} sold</span>}
            </div>

            <div className="flex items-end gap-3 mb-5">
              <span className="text-3xl font-extrabold text-gray-900">${product.price?.toFixed(2)}</span>
              {disc > 0 && (
                <>
                  <span className="text-lg text-gray-400 line-through">${product.comparePrice?.toFixed(2)}</span>
                  <span className="bg-red-500 text-white text-sm font-bold px-2 py-0.5 rounded-full">-{disc}% OFF</span>
                </>
              )}
            </div>

            <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

            {/* Stock */}
            <div className="mb-5">
              {inStock ? (
                <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                  ✅ In stock ({product.stock} available)
                </span>
              ) : (
                <span className="text-red-500 text-sm font-medium">❌ Out of stock</span>
              )}
            </div>

            {/* Qty + Add to Cart */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q-1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <FiMinus size={14}/>
                </button>
                <span className="w-10 h-10 flex items-center justify-center font-semibold text-gray-900">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q+1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors" disabled={!inStock}>
                  <FiPlus size={14}/>
                </button>
              </div>
              <button onClick={handleAddToCart} disabled={!inStock}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-40 transition-colors">
                <FiShoppingCart size={17}/> Add to Cart
              </button>
            </div>

            {/* Trust */}
            <div className="grid grid-cols-2 gap-3 text-xs text-gray-500 bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-2"><FiTruck className="text-orange-400"/><span>Free shipping over $50</span></div>
              <div className="flex items-center gap-2"><FiShield className="text-orange-400"/><span>30-day returns</span></div>
            </div>

            {/* Seller info */}
            {product.seller && (
              <div className="mt-4 p-3 bg-blue-50 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center text-blue-700 text-sm font-bold">
                  {product.seller.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-xs text-gray-500">Sold by</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {product.seller.sellerInfo?.storeName || product.seller.name}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Related Products ── */}
        <RecommendationSection
          type="related"
          productId={product._id}
          label="Similar Products"
          limit={6}
          cols="grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"
        />

        {/* ── Collaborative ── */}
        <RecommendationSection
          type="collaborative"
          productId={product._id}
          label="Customers Also Bought"
          limit={6}
          cols="grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"
        />

        {/* ── Reviews ── */}
        <div className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Customer Reviews ({product.numReviews || 0})
          </h2>

          {product.reviews?.length > 0 && (
            <div className="space-y-4 mb-8">
              {product.reviews.map(r => (
                <div key={r._id} className="bg-gray-50 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 text-sm font-bold">
                        {r.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="font-semibold text-gray-800 text-sm">{r.name}</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <FiStar key={i} size={12} className={i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}/>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">{r.comment}</p>
                  <p className="text-xs text-gray-400 mt-2">{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}

          {/* Write review */}
          {isUser && !alreadyReviewed ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Write a Review</h3>
              <form onSubmit={handleReview} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Rating</label>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(n => (
                      <button key={n} type="button" onClick={() => setReview(r => ({ ...r, rating: n }))}>
                        <FiStar size={24} className={n <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 hover:text-yellow-200'}/>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Your Review</label>
                  <textarea
                    value={review.comment}
                    onChange={e => setReview(r => ({ ...r, comment: e.target.value }))}
                    rows={4}
                    placeholder="Share your experience with this product..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 resize-none"
                    required
                  />
                </div>
                <button type="submit" disabled={submitting}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-xl disabled:opacity-50 transition-colors">
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          ) : isUser && alreadyReviewed ? (
            <p className="text-gray-400 text-sm bg-gray-50 rounded-xl p-4">You have already reviewed this product.</p>
          ) : (
            <div className="bg-orange-50 rounded-xl p-4 text-center">
              <p className="text-gray-600 text-sm">
                <Link to="/login" className="text-orange-500 font-medium">Login</Link> to write a review.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
