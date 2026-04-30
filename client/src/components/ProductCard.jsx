import { Link } from 'react-router-dom'
import { FiShoppingCart, FiStar } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import toast from 'react-hot-toast'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0

  const handleAddToCart = (e) => {
    e.preventDefault()   // prevent Link navigation
    if (product.stock === 0) return toast.error('Out of stock')
    addToCart(product)
    toast.success('Added to cart!')
  }

  return (
    <Link to={`/products/${product._id}`} className="card group hover:shadow-md transition-shadow duration-200 flex flex-col">
      {/* Image */}
      <div className="relative overflow-hidden bg-gray-100 aspect-square">
        <img
          src={product.images?.[0] || 'https://placehold.co/300x300/e2e8f0/94a3b8?text=No+Image'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {discount > 0 && (
          <span className="absolute top-2 left-2 badge bg-red-500 text-white">-{discount}%</span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-medium text-sm">Out of Stock</span>
          </div>
        )}
        {product.isFeatured && (
          <span className="absolute top-2 right-2 badge bg-orange-500 text-white">Featured</span>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <p className="text-xs text-gray-400 mb-1">{product.brand || product.category}</p>
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 flex-1 group-hover:text-orange-500 transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        {product.numReviews > 0 && (
          <div className="flex items-center gap-1 mt-1.5">
            <div className="flex">
              {[1,2,3,4,5].map(star => (
                <FiStar key={star} size={11}
                  className={star <= Math.round(product.ratings) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
              ))}
            </div>
            <span className="text-xs text-gray-400">({product.numReviews})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mt-2">
          <span className="font-bold text-gray-900">${product.price.toFixed(2)}</span>
          {discount > 0 && (
            <span className="text-xs text-gray-400 line-through">${product.comparePrice.toFixed(2)}</span>
          )}
        </div>

        {/* Add to cart button */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="mt-3 w-full flex items-center justify-center gap-2 py-2 bg-gray-900 hover:bg-orange-500 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <FiShoppingCart size={13} />
          Add to Cart
        </button>
      </div>
    </Link>
  )
}
