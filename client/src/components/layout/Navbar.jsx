// client/src/components/layout/Navbar.jsx  ← REPLACE
import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  FiShoppingCart, FiUser, FiMenu, FiX, FiSearch,
  FiHeart, FiPackage, FiLogOut, FiSettings, FiChevronDown,
  FiLayout
} from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user, logout, isAdmin, isSeller } = useAuth()
  const { cartCount } = useCart()
  const navigate = useNavigate()
  const location = useLocation()

  const [mobileOpen, setMobileOpen]   = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [scrolled, setScrolled]       = useState(false)
  const userMenuRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target))
        setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close mobile on route change
  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const handleLogout = () => {
    logout()
    setUserMenuOpen(false)
    toast.success('Logged out successfully')
    navigate('/')
  }

  return (
    <nav className={`sticky top-0 z-50 bg-white transition-shadow duration-200 ${scrolled ? 'shadow-nav' : 'border-b border-gray-100'}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-16 gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-2xl">🛍️</span>
            <span className="text-xl font-extrabold text-gray-900">
              Shop<span className="text-orange-500">Zone</span>
            </span>
          </Link>

          {/* Search bar — desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-4">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="input pr-10 py-2 text-sm"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors">
                <FiSearch size={16} />
              </button>
            </div>
          </form>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1 ml-auto">
            <Link to="/products" className="btn-ghost text-sm">Products</Link>

            {/* Cart */}
            <Link to="/cart" className="relative btn-ghost">
              <FiShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* User menu */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 btn-ghost"
                >
                  {user.avatar
                    ? <img src={user.avatar} alt="avatar" className="w-7 h-7 rounded-full object-cover ring-2 ring-orange-200" />
                    : <div className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                  }
                  <span className="text-sm font-medium max-w-[80px] truncate">{user.name?.split(' ')[0]}</span>
                  <FiChevronDown size={14} className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-lg py-2 animate-fade-in z-50">
                    <div className="px-4 py-2 border-b border-gray-50 mb-1">
                      <p className="font-semibold text-sm text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    <DropLink to="/profile"  icon={<FiUser size={14}/>}    label="Profile" onClick={() => setUserMenuOpen(false)} />
                    <DropLink to="/orders"   icon={<FiPackage size={14}/>} label="My Orders" onClick={() => setUserMenuOpen(false)} />
                    {(isAdmin || isSeller) && (
                      <DropLink
                        to={isAdmin ? '/admin' : '/seller'}
                        icon={<FiLayout size={14}/>}
                        label={isAdmin ? 'Admin Panel' : 'Seller Panel'}
                        onClick={() => setUserMenuOpen(false)}
                      />
                    )}
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <FiLogOut size={14} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login"    className="btn-ghost text-sm">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">Sign Up</Link>
              </div>
            )}
          </div>

          {/* Mobile: cart + hamburger */}
          <div className="flex items-center gap-2 md:hidden ml-auto">
            <Link to="/cart" className="relative btn-ghost p-2">
              <FiShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-orange-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="btn-ghost p-2">
              {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="input pr-10 py-2.5 text-sm"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <FiSearch size={16} />
            </button>
          </form>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-4 animate-slide-up">
          <Link to="/products" className="flex items-center py-3 text-sm font-medium text-gray-700 border-b border-gray-50">Products</Link>
          {user ? (
            <>
              <Link to="/profile"  className="flex items-center gap-2 py-3 text-sm text-gray-700 border-b border-gray-50"><FiUser size={15}/> Profile</Link>
              <Link to="/orders"   className="flex items-center gap-2 py-3 text-sm text-gray-700 border-b border-gray-50"><FiPackage size={15}/> My Orders</Link>
              {isAdmin  && <Link to="/admin"  className="flex items-center gap-2 py-3 text-sm text-gray-700 border-b border-gray-50"><FiLayout size={15}/> Admin Panel</Link>}
              {isSeller && <Link to="/seller" className="flex items-center gap-2 py-3 text-sm text-gray-700 border-b border-gray-50"><FiLayout size={15}/> Seller Panel</Link>}
              <button onClick={handleLogout} className="flex items-center gap-2 pt-3 text-sm text-red-500 w-full"><FiLogOut size={15}/> Logout</button>
            </>
          ) : (
            <div className="flex gap-3 pt-3">
              <Link to="/login"    className="btn-outline flex-1 py-2.5 text-sm">Login</Link>
              <Link to="/register" className="btn-primary flex-1 py-2.5 text-sm">Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}

function DropLink({ to, icon, label, onClick }) {
  return (
    <Link to={to} onClick={onClick}
      className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">
      {icon} {label}
    </Link>
  )
}
