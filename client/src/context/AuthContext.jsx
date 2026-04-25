// client/src/context/AuthContext.jsx  ← REPLACE existing file
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(() => {
    try { return JSON.parse(localStorage.getItem('shopzone_user')) } catch { return null }
  })
  const [loading, setLoading] = useState(false)

  // ── Persist user to localStorage ─────────────────────────────────────────
  useEffect(() => {
    if (user) localStorage.setItem('shopzone_user', JSON.stringify(user))
    else      localStorage.removeItem('shopzone_user')
  }, [user])

  // ── Auth helpers ──────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    setUser(data)
    return data
  }, [])

  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password })
    setUser(data)
    return data
  }, [])

  const loginWithGoogle = useCallback(async (credential) => {
    const { data } = await api.post('/auth/google', { credential })
    setUser(data)
    return data
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('shopzone_user')
  }, [])

  const updateUser = useCallback((updates) => {
    setUser(prev => prev ? { ...prev, ...updates } : null)
  }, [])

  const refreshProfile = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/profile')
      setUser(prev => ({ ...prev, ...data }))
    } catch { logout() }
  }, [logout])

  // ── Role helpers ──────────────────────────────────────────────────────────
  const isAdmin  = user?.role === 'admin'
  const isSeller = user?.role === 'seller' && user?.sellerInfo?.approved
  const isUser   = !!user

  // ── Notification helpers ──────────────────────────────────────────────────
  const unreadCount = user?.notifications?.filter(n => !n.read).length ?? 0

  const markNotificationsRead = useCallback(async () => {
    await api.put('/auth/notifications/read')
    setUser(prev => ({
      ...prev,
      notifications: prev.notifications?.map(n => ({ ...n, read: true })) ?? [],
    }))
  }, [])

  // ── Become seller ─────────────────────────────────────────────────────────
  const becomeSeller = useCallback(async (storeName, description) => {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/become-seller', { storeName, description })
      setUser(data.user)
      return data
    } finally { setLoading(false) }
  }, [])

  return (
    <AuthContext.Provider value={{
      user, loading, isAdmin, isSeller, isUser,
      login, register, loginWithGoogle, logout,
      updateUser, refreshProfile,
      unreadCount, markNotificationsRead,
      becomeSeller,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
