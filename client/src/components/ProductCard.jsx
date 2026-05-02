// client/src/components/ProductCard.jsx  ← REPLACE existing file
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
  const [imgLoaded, setImgLoaded] = useState(false)
  const [wishlisted, setWishlisted] = useState(
    user?.wishlist?.includes(product._id)
  )

  const discount = product.comparePrice && product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0

  const handleAddToCart = (e) => {
    e.stopPropagation()
    addToCart(product)
    toast.success(`${product.name} added to cart!`, { icon: '🛒' })
  }

  const handleWishlist = async (e) => {
    e.stopPropagation()
    if (!isUser) { toast.error('Please login to add to wishlist'); return }
    try {
      const { data } = await api.post(`/auth/wishlist/${product._id}`)
      setWishlisted(data.added)
      updateUser({ wishlist: data.wishlist })
      toast.success(data.added ? 'Added to wishlist' : 'Removed from wishlist')
    } catch { toast.error('Failed to update wishlist') }
  }

  return (
    <div
      onClick={() => navigate(`/products/${product._id}`)}
      className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden cursor-pointer
                 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image container */}
      <div className="relative overflow-hidden bg-gray-50 aspect-square">
        {/* Skeleton while loading */}
        {!imgLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}

        <img
          src={product.images?.[0] || '/placeholder.png'}
          alt={product.name}
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover transition-transform duration-500
                      group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount > 0 && (
            <span className="badge bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              -{discount}%
            </span>
          )}
          {product.stock === 0 && (
            <span className="badge bg-gray-700 text-white text-xs px-2 py-0.5 rounded-full">
              Out of stock
            </span>
          )}
          {product.isFeatured && (
            <span className="badge bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
              ⭐ Featured
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center
                     bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100
                     transition-opacity duration-200 hover:scale-110"
        >
          <FiHeart
            size={15}
            className={wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}
          />
        </button>

        {/* Quick view overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />

        {/* Bottom action strip */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0
                        transition-transform duration-300 p-2">
          {product.stock > 0 ? (
            <button
              onClick={handleAddToCart}
              className={`w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold
                         rounded-xl transition-all
                         ${isInCart(product._id)
                           ? 'bg-green-500 text-white'
                           : 'bg-orange-500 hover:bg-orange-600 text-white'}`}
            >
              <FiShoppingCart size={14} />
              {isInCart(product._id) ? 'In Cart' : 'Add to Cart'}
            </button>
          ) : (
            <button
              onClick={e => { e.stopPropagation(); navigate(`/products/${product._id}`) }}
              className="w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold
                         bg-gray-700 text-white rounded-xl"
            >
              <FiEye size={14} /> View Details
            </button>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{product.category}</p>
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-tight mb-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* Rating */}
        {product.numReviews > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[1,2,3,4,5].map(s => (
                <FiStar key={s} size={11}
                  className={s <= Math.round(product.ratings)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-gray-300'
                  }
                />
              ))}
            </div>
            <span className="text-xs text-gray-400">({product.numReviews})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-base font-bold text-gray-900">
            Rs {product.price.toLocaleString()}
          </span>
          {product.comparePrice > product.price && (
            <span className="text-xs text-gray-400 line-through">
              Rs {product.comparePrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Stock indicator */}
        {product.stock > 0 && product.stock <= 10 && (
          <p className="text-xs text-red-500 mt-1 font-medium">
            Only {product.stock} left!
          </p>
        )}
      </div>
    </div>
  )
}
