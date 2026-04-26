import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiStar, FiShoppingCart, FiHeart, FiShare2, FiChevronLeft, FiMinus, FiPlus } from 'react-icons/fi';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCart();
  const { user } = useAuth();

  const [product,  setProduct]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [qty,      setQty]      = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${id}`)
      .then(r => { setProduct(r.data); setActiveImg(0); })
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false));
    if (user) api.post(`/products/${id}/track-view`).catch(() => {});
  }, [id, user, navigate]);

  const handleAddToCart = () => {
    if (!product || product.stock === 0) return;
    for (let i = 0; i < qty; i++) addToCart(product);
    toast.success(`${qty}× ${product.name} added to cart!`);
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Login to write a review');
    setSubmitting(true);
    try {
      await api.post(`/products/${id}/reviews`, reviewForm);
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
        <div className="space-y-4">{[...Array(6)].map((_, i) => <div key={i} className="h-6 bg-gray-100 rounded animate-pulse"/>)}</div>
      </div>
    </div>
  );

  if (!product) return null;

  const images   = product.images?.length ? product.images : ['https://via.placeholder.com/600x600?text=No+Image'];
  const discount = product.comparePrice > product.price
    ? Math.round((1 - product.price / product.comparePrice) * 100) : 0;
  const inCart   = isInCart(product._id);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-500 hover:text-orange-500 mb-6 text-sm transition-colors">
        <FiChevronLeft/> Back to products
      </button>

      <div className="grid md:grid-cols-2 gap-10 mb-12">
        {/* Image gallery */}
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-3">
            <img src={images[activeImg]} alt={product.name} className="w-full h-full object-cover"/>
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-colors ${i === activeImg ? 'border-orange-500' : 'border-gray-200'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover"/>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div>
          <p className="text-sm text-orange-500 font-medium capitalize mb-1">{product.category}</p>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex">
              {[1,2,3,4,5].map(s => (
                <FiStar key={s} size={16} className={s <= Math.round(product.ratings) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}/>
              ))}
            </div>
            <span className="text-sm text-gray-600">{product.ratings?.toFixed(1)} ({product.numReviews} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-extrabold text-gray-900">${product.price?.toFixed(2)}</span>
            {discount > 0 && <>
              <span className="text-lg text-gray-400 line-through">${product.comparePrice?.toFixed(2)}</span>
              <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-0.5 rounded-full">-{discount}%</span>
            </>}
          </div>

          <p className="text-gray-600 text-sm leading-relaxed mb-6">{product.description}</p>

          {/* Stock */}
          <p className={`text-sm font-medium mb-4 ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {product.stock > 0 ? `✓ In Stock (${product.stock} left)` : '✗ Out of Stock'}
          </p>

          {/* Qty + Add to cart */}
          {product.stock > 0 && (
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-gray-100 transition-colors"><FiMinus size={14}/></button>
                <span className="px-4 py-2 font-semibold text-sm">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="px-3 py-2 hover:bg-gray-100 transition-colors"><FiPlus size={14}/></button>
              </div>
              <button
                onClick={handleAddToCart}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-colors ${inCart ? 'bg-green-500 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}
              >
                <FiShoppingCart size={17}/>
                {inCart ? 'In Cart — Add More' : 'Add to Cart'}
              </button>
            </div>
          )}

          <div className="flex gap-3">
            <Link to="/cart" className="flex-1 text-center py-3 border-2 border-orange-500 text-orange-500 rounded-xl font-semibold text-sm hover:bg-orange-50 transition-colors">
              View Cart
            </Link>
          </div>

          {/* Seller info */}
          {product.seller?.name && (
            <div className="mt-5 bg-gray-50 rounded-xl p-4 text-sm">
              <p className="text-gray-500">Sold by <span className="font-semibold text-gray-800">{product.seller.sellerInfo?.storeName || product.seller.name}</span></p>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="border-t border-gray-100 pt-10">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Customer Reviews ({product.numReviews})</h2>

        {/* Write review */}
        {user ? (
          <form onSubmit={handleReview} className="bg-gray-50 rounded-2xl p-5 mb-8">
            <h3 className="font-semibold text-gray-800 mb-3">Write a Review</h3>
            <div className="flex gap-1 mb-3">
              {[1,2,3,4,5].map(s => (
                <button key={s} type="button" onClick={() => setReviewForm(f => ({ ...f, rating: s }))}>
                  <FiStar size={24} className={s <= reviewForm.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 hover:text-yellow-200'}/>
                </button>
              ))}
            </div>
            <textarea
              value={reviewForm.comment}
              onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
              placeholder="Share your experience..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400 mb-3 resize-none"
              required
            />
            <button type="submit" disabled={submitting} className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2 rounded-xl text-sm transition-colors disabled:opacity-60">
              {submitting ? 'Submitting…' : 'Submit Review'}
            </button>
          </form>
        ) : (
          <div className="bg-orange-50 rounded-2xl p-5 mb-8 text-center">
            <p className="text-gray-600 text-sm"><Link to="/login" className="text-orange-500 font-semibold">Login</Link> to write a review</p>
          </div>
        )}

        {/* Review list */}
        {product.reviews?.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No reviews yet. Be the first!</p>
        ) : (
          <div className="space-y-4">
            {product.reviews.map(r => (
              <div key={r._id} className="bg-white border border-gray-100 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm">
                      {r.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="font-semibold text-gray-800 text-sm">{r.name}</span>
                  </div>
                  <div className="flex">
                    {[1,2,3,4,5].map(s => <FiStar key={s} size={13} className={s <= r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}/>)}
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
  );
}
