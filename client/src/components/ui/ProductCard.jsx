import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiEye, FiStar, FiZoomIn } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';

// ── Skeleton loader ───────────────────────────────────────────────────────────
export function ProductCardSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden animate-pulse">
      <div className="bg-gray-200 h-48 w-full"/>
      <div className="p-3 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-1/3"/>
        <div className="h-4 bg-gray-200 rounded w-3/4"/>
        <div className="h-3 bg-gray-200 rounded w-1/2"/>
        <div className="flex justify-between items-center pt-1">
          <div className="h-5 bg-gray-200 rounded w-1/4"/>
          <div className="h-8 w-8 bg-gray-200 rounded-full"/>
        </div>
      </div>
    </div>
  );
}

// ── Quick View Modal ──────────────────────────────────────────────────────────
function QuickViewModal({ product, onClose }) {
  const { addToCart }  = useCart();
  const [qty, setQty]  = useState(1);
  const img = product.images?.[0] || 'https://via.placeholder.com/400x400?text=No+Image';
  const discount = product.comparePrice > product.price
    ? Math.round((1 - product.price / product.comparePrice) * 100) : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="grid grid-cols-2">
          <div className="relative overflow-hidden bg-gray-50 aspect-square">
            <img src={img} alt={product.name} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"/>
            {discount > 0 && (
              <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                -{discount}%
              </span>
            )}
          </div>
          <div className="p-5 flex flex-col justify-between">
            <div>
              <p className="text-xs text-orange-500 font-semibold capitalize mb-1">{product.category}</p>
              <h3 className="font-bold text-gray-900 text-sm mb-2 leading-snug">{product.name}</h3>
              <div className="flex items-center gap-1 mb-3">
                {[1,2,3,4,5].map(s => (
                  <FiStar key={s} size={12}
                    className={s <= Math.round(product.ratings) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}/>
                ))}
                <span className="text-xs text-gray-500 ml-1">({product.numReviews})</span>
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-xl font-extrabold text-gray-900">${product.price?.toFixed(2)}</span>
                {discount > 0 && <span className="text-sm text-gray-400 line-through">${product.comparePrice?.toFixed(2)}</span>}
              </div>
              <p className="text-xs text-gray-500 line-clamp-3">{product.description}</p>
            </div>
            <div className="space-y-2 mt-4">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden w-fit">
                <button onClick={() => setQty(q => Math.max(1, q-1))} className="px-3 py-1.5 hover:bg-gray-100 text-sm font-bold">−</button>
                <span className="px-3 py-1.5 text-sm font-semibold">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q+1))} className="px-3 py-1.5 hover:bg-gray-100 text-sm font-bold">+</button>
              </div>
              <button
                onClick={() => {
                  for (let i = 0; i < qty; i++) addToCart(product);
                  toast.success(`${qty}× ${product.name} added!`);
                  onClose();
                }}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main ProductCard ──────────────────────────────────────────────────────────
export default function ProductCard({ product, compact = false }) {
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCart();
  const { user } = useAuth();
  const [quickView, setQuickView] = useState(false);
  const [wished,    setWished]    = useState(false);

  const img      = product.images?.[0] || 'https://via.placeholder.com/300x300?text=No+Image';
  const discount = product.comparePrice > product.price
    ? Math.round((1 - product.price / product.comparePrice) * 100) : 0;
  const inCart   = isInCart(product._id);

  const trackAndNavigate = () => {
    if (user) api.post('/ai/track', { productId: product._id, action: 'view' }).catch(() => {});
    navigate(`/products/${product._id}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (product.stock === 0) return;
    if (user) api.post('/ai/track', { productId: product._id, action: 'cart' }).catch(() => {});
    addToCart(product);
    toast.success('Added to cart!');
  };

  const handleWishlist = async (e) => {
    e.stopPropagation();
    if (!user) return toast.error('Login to save wishlist');
    setWished(w => !w);
    if (user) api.post('/ai/track', { productId: product._id, action: 'wishlist' }).catch(() => {});
    toast.success(wished ? 'Removed from wishlist' : '❤️ Added to wishlist');
  };

  return (
    <>
      <div
        onClick={trackAndNavigate}
        className={`bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer relative ${compact ? '' : 'hover:-translate-y-1'}`}
      >
        {/* Image with zoom + overlays */}
        <div className={`relative overflow-hidden bg-gray-50 ${compact ? 'h-36' : 'h-48'}`}>
          <img
            src={img}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                -{discount}%
              </span>
            )}
            {product.stock === 0 && (
              <span className="bg-gray-800 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                Out of Stock
              </span>
            )}
            {product.isFeatured && (
              <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                ⭐ Featured
              </span>
            )}
          </div>

          {/* Hover action buttons */}
          <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={e => { e.stopPropagation(); setQuickView(true); }}
              className="w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center text-gray-600 hover:text-orange-500 transition-colors"
              title="Quick view"
            >
              <FiZoomIn size={14}/>
            </button>
            <button
              onClick={handleWishlist}
              className={`w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center transition-colors ${wished ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
              title="Wishlist"
            >
              <FiHeart size={14} className={wished ? 'fill-red-500' : ''}/>
            </button>
            <button
              onClick={e => { e.stopPropagation(); navigate(`/products/${product._id}`); }}
              className="w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center text-gray-400 hover:text-blue-500 transition-colors"
              title="View details"
            >
              <FiEye size={14}/>
            </button>
          </div>
        </div>

        {/* Card body */}
        <div className="p-3">
          <p className="text-xs text-gray-400 mb-0.5 capitalize">{product.category}</p>
          <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 mb-1.5 leading-snug">{product.name}</h3>

          {/* Stars */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[1,2,3,4,5].map(s => (
                <FiStar key={s} size={10}
                  className={s <= Math.round(product.ratings || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}/>
              ))}
            </div>
            <span className="text-xs text-gray-400">({product.numReviews || 0})</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-gray-900 text-sm">${product.price?.toFixed(2)}</span>
              {discount > 0 && (
                <span className="text-xs text-gray-400 line-through ml-1">${product.comparePrice?.toFixed(2)}</span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all text-white text-sm font-bold disabled:opacity-40 ${inCart ? 'bg-green-500 hover:bg-green-600' : 'bg-orange-500 hover:bg-orange-600 hover:scale-110'}`}
            >
              <FiShoppingCart size={14}/>
            </button>
          </div>
        </div>
      </div>

      {quickView && <QuickViewModal product={product} onClose={() => setQuickView(false)}/>}
    </>
  );
}
