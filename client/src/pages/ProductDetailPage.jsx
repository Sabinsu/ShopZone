import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiStar, FiShoppingCart, FiChevronLeft, FiMinus, FiPlus, FiHeart, FiShare2 } from 'react-icons/fi';
import RecommendedProducts from '../components/ai/RecommendedProducts';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCart();
  const { user } = useAuth();
  const viewTimer = useRef(null);

  const [product,   setProduct]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [qty,       setQty]       = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [wished,     setWished]     = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${id}`)
      .then(r => { setProduct(r.data); setActiveImg(0); })
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false));

    // Track view + time spent
    if (user) {
      api.post('/ai/track', { productId: id, action: 'view' }).catch(() => {});
      const start = Date.now();
      viewTimer.current = setInterval(() => {
        // nothing — just track duration on unmount
      }, 10000);
      return () => {
        clearInterval(viewTimer.current);
        const duration = Math.round((Date.now() - start) / 1000);
        if (duration > 5) api.post('/ai/track', { productId: id, action: 'view', duration }).catch(() => {});
      };
    }
  }, [id, user, navigate]);

  const handleAddToCart = () => {
    if (!product || product.stock === 0) return;
    if (user) api.post('/ai/track', { productId: product._id, action: 'cart' }).catch(() => {});
    for (let i = 0; i < qty; i++) addToCart(product);
    toast.success(`${qty}× ${product.name} added to cart!`);
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Login to write a review');
    setSubmitting(true);
    try {
      await api.post(`/products/${id}/reviews`, reviewForm);
      if (user) api.post('/ai/track', { productId: id, action: 'review' }).catch(() => {});
      toast.success('Review submitted!');
      const { data } = await api.get(`/products/${id}`);
      setProduct(data);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="grid md:grid-cols-2 gap-10">
        <div className="aspect-square bg-gray-100 rounded-2xl animate-pulse"/>
        <div className="space-y-4">{[...Array(6)].map((_,i) => <div key={i} className="h-6 bg-gray-100 rounded animate-pulse"/>)}</div>
      </div>
    </div>
  );
  if (!product) return null;

  const images   = product.images?.length ? product.images : ['https://via.placeholder.com/600x600?text=No+Image'];
  const discount = product.comparePrice > product.price ? Math.round((1 - product.price / product.comparePrice) * 100) : 0;
  const inCart   = isInCart(product._id);

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-500 hover:text-orange-500 mb-6 text-sm transition-colors">
          <FiChevronLeft/> Back
        </button>

        <div className="grid md:grid-cols-2 gap-10 mb-12">
          {/* Image gallery */}
          <div>
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-3 group">
              <img src={images[activeImg]} alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img,i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${i===activeImg ? 'border-orange-500 scale-105' : 'border-gray-200 hover:border-orange-300'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover"/>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div>
            <p className="text-sm text-orange-500 font-semibold capitalize mb-1">{product.category}</p>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">{product.name}</h1>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1,2,3,4,5].map(s => (
                  <FiStar key={s} size={16} className={s<=Math.round(product.ratings||0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}/>
                ))}
              </div>
              <span className="text-sm text-gray-500">{product.ratings?.toFixed(1)} ({product.numReviews} reviews)</span>
            </div>

            <div className="flex items-baseline gap-3 mb-5">
              <span className="text-3xl font-extrabold text-gray-900">${product.price?.toFixed(2)}</span>
              {discount > 0 && <>
                <span className="text-lg text-gray-400 line-through">${product.comparePrice?.toFixed(2)}</span>
                <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-0.5 rounded-full">-{discount}%</span>
              </>}
            </div>

            <p className="text-gray-600 text-sm leading-relaxed mb-5">{product.description}</p>

            <p className={`text-sm font-semibold mb-5 ${product.stock>0 ? 'text-green-600' : 'text-red-500'}`}>
              {product.stock>0 ? `✓ In Stock (${product.stock} left)` : '✗ Out of Stock'}
            </p>

            {product.stock > 0 && (
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button onClick={() => setQty(q => Math.max(1,q-1))} className="px-3 py-2 hover:bg-gray-100"><FiMinus size={14}/></button>
                  <span className="px-4 py-2 font-semibold text-sm">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock,q+1))} className="px-3 py-2 hover:bg-gray-100"><FiPlus size={14}/></button>
                </div>
                <button onClick={handleAddToCart}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105 ${inCart ? 'bg-green-500 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}>
                  <FiShoppingCart size={17}/> {inCart ? 'In Cart — Add More' : 'Add to Cart'}
                </button>
              </div>
            )}

            <div className="flex gap-3">
              <Link to="/cart" className="flex-1 text-center py-3 border-2 border-orange-500 text-orange-500 rounded-xl font-semibold text-sm hover:bg-orange-50 transition-colors">
                View Cart
              </Link>
              <button onClick={() => { setWished(v=>!v); toast.success(wished?'Removed from wishlist':'Added to wishlist ❤️'); }}
                className={`px-4 border-2 rounded-xl transition-all ${wished ? 'border-red-400 text-red-500 bg-red-50' : 'border-gray-200 text-gray-400 hover:border-red-300'}`}>
                <FiHeart size={18} className={wished ? 'fill-red-400' : ''}/>
              </button>
              <button onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success('Link copied!'); }}
                className="px-4 border-2 border-gray-200 text-gray-400 hover:border-gray-300 rounded-xl transition-colors">
                <FiShare2 size={18}/>
              </button>
            </div>

            {product.seller?.name && (
              <div className="mt-5 bg-gray-50 rounded-xl p-4 text-sm">
                <p className="text-gray-500">Sold by <span className="font-semibold text-gray-800">{product.seller.sellerInfo?.storeName || product.seller.name}</span></p>
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div className="border-t border-gray-100 pt-10 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Customer Reviews ({product.numReviews})</h2>
          {user ? (
            <form onSubmit={handleReview} className="bg-gray-50 rounded-2xl p-5 mb-8">
              <h3 className="font-semibold text-gray-800 mb-3">Write a Review</h3>
              <div className="flex gap-1 mb-3">
                {[1,2,3,4,5].map(s => (
                  <button key={s} type="button" onClick={() => setReviewForm(f => ({ ...f, rating: s }))}>
                    <FiStar size={24} className={s<=reviewForm.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 hover:text-yellow-200 transition-colors'}/>
                  </button>
                ))}
              </div>
              <textarea value={reviewForm.comment} onChange={e => setReviewForm(f=>({...f,comment:e.target.value}))}
                placeholder="Share your experience..." rows={3} required
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400 mb-3 resize-none"/>
              <button type="submit" disabled={submitting}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2 rounded-xl text-sm transition-colors disabled:opacity-60">
                {submitting ? 'Submitting…' : 'Submit Review'}
              </button>
            </form>
          ) : (
            <div className="bg-orange-50 rounded-2xl p-5 mb-8 text-center">
              <Link to="/login" className="text-orange-500 font-semibold">Login</Link>{' '}
              <span className="text-gray-600 text-sm">to write a review</span>
            </div>
          )}
          {product.reviews?.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No reviews yet. Be the first!</p>
          ) : (
            <div className="space-y-4">
              {product.reviews.map(r => (
                <div key={r._id} className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm">
                        {r.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="font-semibold text-gray-800 text-sm">{r.name}</span>
                    </div>
                    <div className="flex">
                      {[1,2,3,4,5].map(s => <FiStar key={s} size={13} className={s<=r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}/>)}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">{r.comment}</p>
                  <p className="text-xs text-gray-400 mt-2">{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Related Products AI section */}
      <RecommendedProducts productId={product._id}/>
    </div>
  );
}
