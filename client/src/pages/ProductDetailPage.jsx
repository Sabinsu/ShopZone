// client/src/pages/ProductDetailPage.jsx  ← REPLACE
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiShoppingCart, FiHeart, FiStar, FiTruck, FiShield, FiShare2, FiMinus, FiPlus } from 'react-icons/fi'
import api from '../api/axios'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { SkeletonProductDetail } from '../components/ui/Skeleton'
import ProductCard from '../components/ProductCard'
import toast from 'react-hot-toast'

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { user } = useAuth()

  const [product,  setProduct]  = useState(null)
  const [related,  setRelated]  = useState([])
  const [reviews,  setReviews]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [activeImg, setActiveImg] = useState(0)
  const [qty,       setQty]       = useState(1)
  const [tab,       setTab]       = useState('desc')
  const [zoom,      setZoom]      = useState(false)

  // Review form
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [submitting,  setSubmitting] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [pRes, revRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/reviews/product/${id}`),
        ])
        setProduct(pRes.data)
        setReviews(revRes.data)
        // Track view for recommendations
        if (user?._id) api.post(`/recommendations/track`, { userId: user._id, productId: id, action: 'view' }).catch(()=>{})
        // Related products
        const relRes = await api.get(`/products?category=${encodeURIComponent(pRes.data.category)}&limit=6`)
        setRelated((relRes.data.products || relRes.data).filter(p => p._id !== id))
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [id, user?._id])

  const handleAddToCart = () => {
    addToCart(product, qty)
    toast.success(`${qty}x ${product.name} added to cart!`, { icon: '🛒' })
  }

  const handleBuyNow = () => {
    addToCart(product, qty)
    navigate('/checkout')
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (!user) { toast.error('Please login to review'); return }
    setSubmitting(true)
    try {
      const { data } = await api.post(`/reviews/${id}`, reviewForm)
      setReviews(prev => [data, ...prev])
      setReviewForm({ rating: 5, comment: '' })
      toast.success('Review submitted!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review')
    } finally { setSubmitting(false) }
  }

  if (loading) return <SkeletonProductDetail />
  if (!product) return <div className="text-center py-20 text-gray-500">Product not found</div>

  const discount = product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">

      {/* Breadcrumb */}
      <nav className="text-xs text-gray-400 mb-6 flex gap-1">
        <a href="/" className="hover:text-orange-500">Home</a> /
        <a href="/products" className="hover:text-orange-500">Products</a> /
        <a href={`/products?category=${product.category}`} className="hover:text-orange-500">{product.category}</a> /
        <span className="text-gray-600 truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10 mb-12">

        {/* Images */}
        <div>
          <div
            className="relative overflow-hidden rounded-2xl bg-gray-50 aspect-square cursor-zoom-in mb-3"
            onClick={() => setZoom(!zoom)}
          >
            <img
              src={product.images?.[activeImg] || '/placeholder.png'}
              alt={product.name}
              className={`w-full h-full object-cover transition-transform duration-300 ${zoom ? 'scale-150' : 'scale-100'}`}
            />
            {discount > 0 && (
              <span className="absolute top-3 left-3 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                -{discount}%
              </span>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                    i === activeImg ? 'border-orange-500' : 'border-transparent'
                  }`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <p className="badge-orange mb-2">{product.category}</p>
          <h1 className="text-2xl font-bold text-gray-900 mb-3 leading-snug">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex">
              {[1,2,3,4,5].map(s => (
                <FiStar key={s} size={16}
                  className={s <= Math.round(product.ratings) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />
              ))}
            </div>
            <span className="text-sm text-gray-500">{product.ratings?.toFixed(1)} ({product.numReviews} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-extrabold text-gray-900">
              Rs {product.price?.toLocaleString()}
            </span>
            {product.comparePrice > product.price && (
              <span className="text-lg text-gray-400 line-through">
                Rs {product.comparePrice?.toLocaleString()}
              </span>
            )}
            {discount > 0 && (
              <span className="text-green-600 font-semibold text-sm">
                Save Rs {(product.comparePrice - product.price).toLocaleString()}
              </span>
            )}
          </div>

          {/* Stock */}
          <div className="mb-6">
            {product.stock > 0 ? (
              <span className="badge-green">✓ In Stock ({product.stock} available)</span>
            ) : (
              <span className="badge-red">Out of Stock</span>
            )}
          </div>

          {/* Qty + Add to cart */}
          {product.stock > 0 && (
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Quantity:</span>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 hover:bg-gray-50 transition-colors">
                    <FiMinus size={14} />
                  </button>
                  <span className="px-4 py-2 text-sm font-semibold min-w-[40px] text-center">{qty}</span>
                  <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="px-3 py-2 hover:bg-gray-50 transition-colors">
                    <FiPlus size={14} />
                  </button>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleAddToCart} className="btn-outline flex-1 py-3.5">
                  <FiShoppingCart size={16} /> Add to Cart
                </button>
                <button onClick={handleBuyNow} className="btn-primary flex-1 py-3.5">
                  Buy Now
                </button>
              </div>
            </div>
          )}

          {/* Trust badges */}
          <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-xl text-sm">
            {[
              { icon: FiTruck,  text: 'Free delivery on Rs 2000+' },
              { icon: FiShield, text: '100% authentic products' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-gray-600">
                <Icon size={15} className="text-orange-500 flex-shrink-0" /> {text}
              </div>
            ))}
          </div>

          {/* Seller */}
          {product.seller && (
            <div className="mt-4 p-3 border border-gray-100 rounded-xl flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm">
                {product.seller.name?.charAt(0)}
              </div>
              <div>
                <p className="text-xs text-gray-400">Sold by</p>
                <p className="text-sm font-semibold text-gray-800">{product.seller.name || 'ShopZone Official'}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="flex gap-1 border-b border-gray-200 mb-6">
          {[['desc','Description'], ['reviews','Reviews'], ['shipping','Shipping']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-5 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                tab === key ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>{label}</button>
          ))}
        </div>

        {tab === 'desc' && (
          <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
            <p>{product.description || 'No description available.'}</p>
          </div>
        )}

        {tab === 'reviews' && (
          <div className="space-y-6">
            {/* Review form */}
            {user ? (
              <form onSubmit={handleReviewSubmit} className="card-sm space-y-3">
                <h3 className="font-semibold text-gray-800">Write a Review</h3>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} type="button" onClick={() => setReviewForm(f => ({ ...f, rating: s }))}>
                      <FiStar size={24}
                        className={s <= reviewForm.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 hover:text-amber-300'} />
                    </button>
                  ))}
                </div>
                <textarea
                  value={reviewForm.comment}
                  onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                  placeholder="Share your experience with this product..."
                  rows={3} required className="input resize-none"
                />
                <button type="submit" disabled={submitting} className="btn-primary py-2 px-6">
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            ) : (
              <div className="card-sm text-center text-gray-500 text-sm">
                <a href="/login" className="text-orange-500 font-semibold">Login</a> to write a review
              </div>
            )}

            {/* Reviews list */}
            {reviews.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">No reviews yet. Be the first!</p>
            ) : (
              reviews.map(r => (
                <div key={r._id} className="card-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center font-bold text-orange-600 text-sm">
                      {r.user?.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{r.user?.name}</p>
                      <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                    {r.isVerified && <span className="badge-green ml-auto text-xs">✓ Verified Purchase</span>}
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {[1,2,3,4,5].map(s => (
                      <FiStar key={s} size={13} className={s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />
                    ))}
                  </div>
                  <p className="text-sm text-gray-700">{r.comment}</p>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'shipping' && (
          <div className="space-y-3 text-sm text-gray-700">
            <div className="card-sm flex items-start gap-3">
              <FiTruck className="text-orange-500 mt-0.5" size={18} />
              <div>
                <p className="font-semibold mb-1">Standard Delivery</p>
                <p className="text-gray-500">3-5 business days · Free on orders over Rs 2,000</p>
              </div>
            </div>
            <div className="card-sm flex items-start gap-3">
              <FiShield className="text-orange-500 mt-0.5" size={18} />
              <div>
                <p className="font-semibold mb-1">Easy Returns</p>
                <p className="text-gray-500">7-day return window for most items</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div>
          <h2 className="section-title">Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
            {related.slice(0, 6).map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  )
}
