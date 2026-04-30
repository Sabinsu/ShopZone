import { createContext, useContext, useReducer, useEffect } from 'react'

const CartContext = createContext(null)

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const existing = state.find(i => i._id === action.item._id)
      if (existing) {
        return state.map(i =>
          i._id === action.item._id
            ? { ...i, quantity: Math.min(i.quantity + (action.qty || 1), i.stock) }
            : i
        )
      }
      return [...state, { ...action.item, quantity: action.qty || 1 }]
    }
    case 'REMOVE':
      return state.filter(i => i._id !== action.id)
    case 'UPDATE_QTY':
      return state.map(i =>
        i._id === action.id ? { ...i, quantity: action.qty } : i
      )
    case 'CLEAR':
      return []
    case 'INIT':
      return action.items
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, [])

  // Restore cart from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('cart')
    if (saved) dispatch({ type: 'INIT', items: JSON.parse(saved) })
  }, [])

  // Persist cart on every change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  const addToCart    = (item, qty = 1) => dispatch({ type: 'ADD', item, qty })
  const removeFromCart = (id)           => dispatch({ type: 'REMOVE', id })
  const updateQty    = (id, qty)        => dispatch({ type: 'UPDATE_QTY', id, qty })
  const clearCart    = ()               => dispatch({ type: 'CLEAR' })

  const cartTotal   = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const cartCount   = cart.reduce((sum, i) => sum + i.quantity, 0)
  const shippingFee = cartTotal > 100 ? 0 : 10   // free shipping over $100
  const tax         = cartTotal * 0.08            // 8% tax
  const orderTotal  = cartTotal + shippingFee + tax

  return (
    <CartContext.Provider value={{
      cart, cartTotal, cartCount, shippingFee, tax, orderTotal,
      addToCart, removeFromCart, updateQty, clearCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
