import { NavLink, useNavigate } from 'react-router-dom';
import {
  FiGrid, FiShoppingBag, FiPackage, FiUsers,
  FiTrendingUp, FiLogOut, FiX, FiMenu, FiSun
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

const NAV = [
  { to: '/admin',           label: 'Dashboard',  icon: FiGrid,        exact: true },
  { to: '/admin/products',  label: 'Products',   icon: FiShoppingBag              },
  { to: '/admin/orders',    label: 'Orders',     icon: FiPackage                  },
  { to: '/admin/users',     label: 'Users',      icon: FiUsers                    },
  { to: '/admin/analytics', label: 'Analytics',  icon: FiTrendingUp               },
];

export default function AdminSidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <>
      {/* Mobile overlay toggle */}
      <button
        onClick={() => setCollapsed(v => !v)}
        className="lg:hidden fixed top-4 left-4 z-50 w-9 h-9 bg-gray-900 text-white rounded-lg flex items-center justify-center shadow-lg"
      >
        {collapsed ? <FiX size={16}/> : <FiMenu size={16}/>}
      </button>

      <aside className={`
        fixed top-0 left-0 h-full z-40 bg-gray-900 text-white flex flex-col transition-all duration-300
        ${collapsed ? 'w-0 overflow-hidden lg:w-16' : 'w-60'}
        lg:relative lg:h-auto lg:min-h-screen
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-700/50">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shrink-0">S</div>
          {!collapsed && <span className="font-bold text-lg tracking-tight">ShopZone</span>}
        </div>

        {/* User */}
        {!collapsed && (
          <div className="px-5 py-4 border-b border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{user?.name}</p>
                <p className="text-xs text-gray-400">Administrator</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`
              }
            >
              <Icon size={18} className="shrink-0"/>
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-gray-700/50 space-y-1">
          <a href="/" target="_blank" rel="noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all">
            <FiSun size={18}/>
            {!collapsed && <span>View Store</span>}
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:text-white hover:bg-red-500/20 transition-all"
          >
            <FiLogOut size={18}/>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
