import { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('shopzone_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const persist = (u) => {
    if (u) localStorage.setItem('shopzone_user', JSON.stringify(u));
    else   localStorage.removeItem('shopzone_user');
    setUser(u);
  };

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    persist(data);
    return data;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    persist(data);
    return data;
  }, []);

  const loginWithGoogle = useCallback(async (credential) => {
    const { data } = await api.post('/auth/google', { credential });
    persist(data);
    return data;
  }, []);

  const logout = useCallback(() => persist(null), []);

  const updateUser = useCallback((updates) => {
    setUser(prev => {
      const next = prev ? { ...prev, ...updates } : null;
      if (next) localStorage.setItem('shopzone_user', JSON.stringify(next));
      return next;
    });
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/profile');
      setUser(prev => {
        const next = { ...prev, ...data };
        localStorage.setItem('shopzone_user', JSON.stringify(next));
        return next;
      });
    } catch { logout(); }
  }, [logout]);

  const becomeSeller = useCallback(async (storeName, description) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/become-seller', { storeName, description });
      persist(data.user);
      return data;
    } finally { setLoading(false); }
  }, []);

  const markNotificationsRead = useCallback(async () => {
    await api.put('/auth/notifications/read');
    setUser(prev => {
      if (!prev) return prev;
      const next = { ...prev, notifications: prev.notifications?.map(n => ({ ...n, read: true })) ?? [] };
      localStorage.setItem('shopzone_user', JSON.stringify(next));
      return next;
    });
  }, []);

  const isAdmin  = user?.role === 'admin';
  const isSeller = (user?.role === 'seller' && user?.sellerInfo?.approved) || user?.role === 'admin';
  const isUser   = !!user;
  const unreadCount = user?.notifications?.filter(n => !n.read).length ?? 0;

  return (
    <AuthContext.Provider value={{
      user, loading, isAdmin, isSeller, isUser,
      login, register, loginWithGoogle, logout,
      updateUser, refreshProfile, becomeSeller,
      unreadCount, markNotificationsRead,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
