// Lightweight hook for tracking user activity for AI recommendations
import { useCallback } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export function useTracker() {
  const { isUser } = useAuth()

  const track = useCallback(async (type, opts = {}) => {
    if (!isUser) return  // only track logged-in users
    try {
      await api.post('/recommendations/track', {
        type,
        productId: opts.productId || null,
        category:  opts.category  || '',
        keyword:   opts.keyword   || '',
        meta:      opts.meta      || {},
      })
    } catch {
      // Fire-and-forget — never throw
    }
  }, [isUser])

  return { track }
}

// Usage examples:
// const { track } = useTracker()
// track('view',     { productId: product._id, category: product.category })
// track('cart',     { productId: product._id, category: product.category })
// track('purchase', { productId: item.product, category: item.category })
// track('search',   { keyword: 'laptop' })
// track('wishlist', { productId: id })
