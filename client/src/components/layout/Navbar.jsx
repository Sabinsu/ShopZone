import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiMenu, FiX, FiSearch, FiPackage, FiLogOut, FiBell } from 'react-icons/fi';
import { MdStorefront, MdDashboard } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import api from '../../api/axios';

export default function Navbar() {
  const { user, isAdmin, isSeller, logout, unreadCount, markNotificationsRead } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const [menuOpen,   setMenuOpen]   = useState(false);
  const [userMenu,   setUserMenu]   = useState(false);
  const [search,     setSearch]     = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  // Live search suggestions
  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (search.trim().length < 2) { setSuggestions([]); setShowSuggest(false); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await api.post('/ai/search', { query: search });
        setSuggestions(data.products?.slice(0,5) || []);
        setShowSuggest(true);
      } catch { setSuggestions([]); }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e) => { if (!searchRef.current?.contains(e.target)) setShowSuggest(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
      setSearch(''); setShowSuggest(false); setMenuOpen(false);
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
          <Link to="/" className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-orange-200">S</div>
            <span className="font-bold text-gray-900 text-xl hidden sm:block">ShopZone</span>
          </Link>

          {/* AI Search bar (desktop) */}
          <div ref={searchRef} className="hidden md:flex flex-1 max-w-lg relative">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15}/>
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggest(true)}
                  placeholder="Search products... (AI-powered)"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>
            </form>

            {/* Live suggestions dropdown */}
            {showSuggest && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                {suggestions.map(p => (
                  <button key={p._id} onClick={() => { navigate(`/products/${p._id}`); setSearch(''); setShowSuggest(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50 transition-colors text-left">
                    <img src={p.images?.[0]||'https://via.placeholder.com/32'} alt=""
                      className="w-8 h-8 rounded-lg object-cover bg-gray-100 shrink-0"/>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.category} · ${p.price?.toFixed(2)}</p>
                    </div>
                  </button>
                ))}
                <button onClick={handleSearch}
                  className="w-full px-4 py-2.5 text-xs text-orange-500 font-semibold hover:bg-orange-50 transition-colors text-left border-t border-gray-100">
                  See all results for "{search}" →
                </button>
              </div>
            )}
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-5">
            <NavLink to="/products" className={linkCls}>Products</NavLink>
            <NavLink to="/about"    className={linkCls}>About</NavLink>

            {/* Cart */}
            <Link to="/cart" className="relative text-gray-700 hover:text-orange-500 transition-colors p-1">
              <FiShoppingCart size={22}/>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-sm">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* User menu */}
            {user ? (
              <div className="relative">
                <button onClick={() => setUserMenu(v => !v)}
                  className="flex items-center gap-2 focus:outline-none hover:opacity-80 transition-opacity">
                  {user.avatar
                    ? <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover border-2 border-orange-200"/>
                    : <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
                        {user.name?.[0]?.toUpperCase()}
                      </div>
                  }
                  {unreadCount > 0 && (
                    <span className="w-2 h-2 bg-red-500 rounded-full absolute top-0 right-0"/>
                  )}
                </button>

                {userMenu && (
                  <div className="absolute right-0 mt-2 w-54 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-semibold text-gray-800 text-sm truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <MenuItem to="/profile"  icon={<FiUser size={14}/>}       label="My Profile"       close={() => setUserMenu(false)}/>
                    <MenuItem to="/orders"   icon={<FiPackage size={14}/>}    label="My Orders"        close={() => setUserMenu(false)}/>
                    {(isAdmin||isSeller) && <MenuItem to="/seller" icon={<MdStorefront size={14}/>} label="Seller Dashboard" close={() => setUserMenu(false)}/>}
                    {isAdmin && <MenuItem to="/admin"  icon={<MdDashboard size={14}/>} label="Admin Panel" close={() => setUserMenu(false)}/>}
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors mt-1 border-t border-gray-100">
                      <FiLogOut size={14}/> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-orange-500 transition-colors">Login</Link>
                <Link to="/register" className="text-sm font-bold bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition-all hover:shadow-md hover:shadow-orange-200">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile: cart + hamburger */}
          <div className="flex md:hidden items-center gap-3">
            <Link to="/cart" className="relative text-gray-700 p-1">
              <FiShoppingCart size={22}/>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
            <button onClick={() => setMenuOpen(v => !v)} className="text-gray-700 p-1">
              {menuOpen ? <FiX size={24}/> : <FiMenu size={24}/>}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3 shadow-lg">
          <form onSubmit={handleSearch} className="flex">
            <div className="relative w-full">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14}/>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400"/>
            </div>
          </form>
          <NavLink to="/products" className={linkCls} onClick={() => setMenuOpen(false)}>Products</NavLink>
          <NavLink to="/about"    className={linkCls} onClick={() => setMenuOpen(false)}>About</NavLink>
          {user ? (
            <>
              <NavLink to="/profile" className={linkCls} onClick={() => setMenuOpen(false)}>Profile</NavLink>
              <NavLink to="/orders"  className={linkCls} onClick={() => setMenuOpen(false)}>My Orders</NavLink>
              {(isAdmin||isSeller) && <NavLink to="/seller" className={linkCls} onClick={() => setMenuOpen(false)}>Seller Dashboard</NavLink>}
              {isAdmin && <NavLink to="/admin" className={linkCls} onClick={() => setMenuOpen(false)}>Admin Panel</NavLink>}
              <button onClick={handleLogout} className="block w-full text-left text-sm font-medium text-red-500">Logout</button>
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
    <Link to={to} onClick={close}
      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">
      {icon} {label}
    </Link>
  );
}
