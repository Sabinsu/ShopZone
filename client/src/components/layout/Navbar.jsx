import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiMenu, FiX, FiSearch, FiPackage, FiLogOut, FiSettings } from 'react-icons/fi';
import { MdStorefront, MdDashboard } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Navbar() {
  const { user, isAdmin, isSeller, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [userMenu,  setUserMenu]  = useState(false);
  const [search,    setSearch]    = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
      setMenuOpen(false);
    }
  };

  const handleLogout = () => { logout(); setUserMenu(false); navigate('/'); };

  const linkCls = ({ isActive }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-orange-500' : 'text-gray-700 hover:text-orange-500'}`;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold text-lg">S</div>
            <span className="font-bold text-gray-900 text-xl">ShopZone</span>
          </Link>

          {/* Search — hidden on mobile */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-4 py-2 rounded-full border border-gray-300 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </form>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/products" className={linkCls}>Products</NavLink>
            <NavLink to="/about"    className={linkCls}>About</NavLink>

            {/* Cart */}
            <Link to="/cart" className="relative text-gray-700 hover:text-orange-500 transition-colors">
              <FiShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* User menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenu(v => !v)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  {user.avatar
                    ? <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover border-2 border-orange-200" />
                    : <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold">
                        {user.name?.[0]?.toUpperCase()}
                      </div>
                  }
                </button>

                {userMenu && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="font-semibold text-gray-800 text-sm truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <MenuItem to="/profile"  icon={<FiUser size={15}/>}    label="My Profile"      close={() => setUserMenu(false)} />
                    <MenuItem to="/orders"   icon={<FiPackage size={15}/>} label="My Orders"       close={() => setUserMenu(false)} />
                    {(isAdmin || isSeller) && (
                      <MenuItem to="/seller" icon={<MdStorefront size={15}/>} label="Seller Dashboard" close={() => setUserMenu(false)} />
                    )}
                    {isAdmin && (
                      <MenuItem to="/admin"  icon={<MdDashboard size={15}/>} label="Admin Panel"   close={() => setUserMenu(false)} />
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <FiLogOut size={15}/> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login"    className="text-sm font-medium text-gray-700 hover:text-orange-500">Login</Link>
                <Link to="/register" className="text-sm font-medium bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition-colors">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile: cart + hamburger */}
          <div className="flex md:hidden items-center gap-3">
            <Link to="/cart" className="relative text-gray-700">
              <FiShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
            <button onClick={() => setMenuOpen(v => !v)} className="text-gray-700">
              {menuOpen ? <FiX size={24}/> : <FiMenu size={24}/>}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
          <form onSubmit={handleSearch} className="flex">
            <div className="relative w-full">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-4 py-2 rounded-full border border-gray-300 text-sm focus:outline-none focus:border-orange-400"
              />
            </div>
          </form>
          <NavLink to="/products" className={linkCls} onClick={() => setMenuOpen(false)}>Products</NavLink>
          <NavLink to="/about"    className={linkCls} onClick={() => setMenuOpen(false)}>About</NavLink>
          {user ? (
            <>
              <NavLink to="/profile" className={linkCls} onClick={() => setMenuOpen(false)}>Profile</NavLink>
              <NavLink to="/orders"  className={linkCls} onClick={() => setMenuOpen(false)}>My Orders</NavLink>
              {(isAdmin || isSeller) && <NavLink to="/seller" className={linkCls} onClick={() => setMenuOpen(false)}>Seller Dashboard</NavLink>}
              {isAdmin && <NavLink to="/admin" className={linkCls} onClick={() => setMenuOpen(false)}>Admin Panel</NavLink>}
              <button onClick={handleLogout} className="block w-full text-left text-sm font-medium text-red-600">Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/login"    className={linkCls} onClick={() => setMenuOpen(false)}>Login</NavLink>
              <NavLink to="/register" className={linkCls} onClick={() => setMenuOpen(false)}>Sign Up</NavLink>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

function MenuItem({ to, icon, label, close }) {
  return (
    <Link to={to} onClick={close} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">
      {icon} {label}
    </Link>
  );
}
