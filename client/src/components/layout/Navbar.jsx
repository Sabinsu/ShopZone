import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FiShoppingCart, FiUser, FiMenu, FiX, FiSearch, FiLogOut, FiPackage, FiBarChart2, FiShoppingBag } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import NotificationBell from '../NotificationBell'
import { useTracker } from '../../hooks/useTracker'

export default function Navbar() {
  const { user, logout, isAdmin, isSeller } = useAuth()
  const { cartCount } = useCart()
  const { track }     = useTracker()
  const navigate      = useNavigate()
  const location      = useLocation()
  const [open,        setOpen]   = useState(false)
  const [search,      setSearch] = useState('')
  const [dropOpen,    setDropOpen] = useState(false)
  const dropRef = useRef(null)

  useEffect(() => { setOpen(false) }, [location])

  useEffect(() => {
    const fn = e => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const handleSearch = e => {
    e.preventDefault()
    if (!search.trim()) return
    track('search', { keyword: search.trim() })
    navigate(`/products?search=${encodeURIComponent(search.trim())}`)
    setSearch('')
  }

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="font-extrabold text-xl text-orange-500 shrink-0">
          Shop<span className="text-gray-900">Zone</span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden sm:flex">
          <div className="relative w-full">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
            />
          </div>
        </form>

        {/* Right side */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Notification bell */}
          {user && <NotificationBell />}

          {/* Cart */}
          <Link to="/cart" className="relative p-2 text-gray-600 hover:text-orange-500 transition-colors">
            <FiShoppingCart size={20}/>
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>

          {/* User menu */}
          {user ? (
            <div className="relative" ref={dropRef}>
              <button onClick={() => setDropOpen(o => !o)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 transition-colors">
                {user.avatar
                  ? <img src={user.avatar} className="w-7 h-7 rounded-full object-cover" alt=""/>
                  : <div className="w-7 h-7 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 text-xs font-bold">
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                }
                <span className="text-sm font-medium text-gray-700 hidden sm:inline max-w-20 truncate">{user.name}</span>
              </button>

              {dropOpen && (
                <div className="absolute right-0 top-10 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-slide-down">
                  <div className="px-4 py-2 border-b border-gray-50 mb-1">
                    <p className="font-semibold text-sm text-gray-800 truncate">{user.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${
                      user.role==='admin' ? 'bg-orange-100 text-orange-700' :
                      user.role==='seller'? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-600'}`}>{user.role}</span>
                  </div>
                  <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-orange-500 transition-colors">
                    <FiUser size={14}/> My Profile
                  </Link>
                  <Link to="/orders" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-orange-500 transition-colors">
                    <FiPackage size={14}/> My Orders
                  </Link>
                  {isSeller && (
                    <Link to="/seller" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-orange-500 transition-colors">
                      <FiShoppingBag size={14}/> Seller Dashboard
                    </Link>
                  )}
                  {isAdmin && (
                    <Link to="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-orange-500 transition-colors">
                      <FiBarChart2 size={14}/> Admin Panel
                    </Link>
                  )}
                  {!isSeller && !isAdmin && (
                    <Link to="/become-seller" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-orange-500 transition-colors">
                      <FiShoppingBag size={14}/> Become a Seller
                    </Link>
                  )}
                  <div className="border-t border-gray-50 mt-1 pt-1">
                    <button onClick={() => { logout(); navigate('/'); setDropOpen(false) }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">
                      <FiLogOut size={14}/> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors px-3 py-1.5">
                Login
              </Link>
              <Link to="/register" className="text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-xl transition-colors">
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button onClick={() => setOpen(o => !o)} className="sm:hidden p-2 text-gray-600">
            {open ? <FiX size={20}/> : <FiMenu size={20}/>}
          </button>
        </div>
      </div>

      {/* Mobile search */}
      <div className="sm:hidden px-4 pb-3">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15}/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"/>
          </div>
        </form>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="sm:hidden border-t border-gray-100 bg-white py-2 px-4 space-y-1 animate-slide-down">
          <Link to="/"        className="block py-2 text-sm text-gray-700 hover:text-orange-500">Home</Link>
          <Link to="/products"className="block py-2 text-sm text-gray-700 hover:text-orange-500">Products</Link>
          <Link to="/about"   className="block py-2 text-sm text-gray-700 hover:text-orange-500">About</Link>
          {user && <Link to="/orders"  className="block py-2 text-sm text-gray-700 hover:text-orange-500">My Orders</Link>}
          {isSeller && <Link to="/seller" className="block py-2 text-sm text-gray-700 hover:text-orange-500">Seller Dashboard</Link>}
          {isAdmin  && <Link to="/admin"  className="block py-2 text-sm text-gray-700 hover:text-orange-500">Admin Panel</Link>}
        </div>
      )}
    </nav>
  )
}
