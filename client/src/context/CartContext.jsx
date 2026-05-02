// client/src/context/CartContext.jsx  ← REPLACE existing file
import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const CartContext = createContext(null)

const STORAGE_KEY = 'shopzone_cart'

const readCart = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] } catch { return [] }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(readCart)

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
  }, [cart])

  // Add item (or increment qty)
  const addToCart = useCallback((product, qty = 1) => {
    setCart(prev => {
      const idx = prev.findIndex(i => i._id === product._id)
      if (idx >= 0) {
        const updated = [...prev]
        updated[idx] = { ...updated[idx], qty: updated[idx].qty + qty }
        return updated
      }
      return [...prev, { ...product, qty }]
    })
  }, [])

  // Remove item
  const removeFromCart = useCallback((productId) => {
    setCart(prev => prev.filter(i => i._id !== productId))
  }, [])

  // Update qty (remove if qty <= 0)
  const updateQty = useCallback((productId, qty) => {
    if (qty <= 0) { removeFromCart(productId); return }
    setCart(prev => prev.map(i => i._id === productId ? { ...i, qty } : i))
  }, [removeFromCart])

  // Clear cart
  const clearCart = useCallback(() => setCart([]), [])

  // Derived
  const cartCount   = cart.reduce((s, i) => s + i.qty, 0)
  const cartTotal   = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const isInCart    = (id) => cart.some(i => i._id === id)

  return (
    <CartContext.Provider value={{
      cart, cartCount, cartTotal,
      addToCart, removeFromCart, updateQty, clearCart, isInCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
