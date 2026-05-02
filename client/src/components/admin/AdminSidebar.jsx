// client/src/components/admin/AdminSidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom'
import { FiHome, FiShoppingBag, FiPackage, FiUsers, FiBarChart2, FiLogOut, FiExternalLink } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const LINKS = [
  { to: '/admin',           icon: FiHome,        label: 'Dashboard',  exact: true },
  { to: '/admin/products',  icon: FiShoppingBag, label: 'Products' },
  { to: '/admin/orders',    icon: FiPackage,     label: 'Orders' },
  { to: '/admin/users',     icon: FiUsers,       label: 'Users' },
  { to: '/admin/analytics', icon: FiBarChart2,   label: 'Analytics' },
]

export default function AdminSidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out')
    navigate('/')
  }

  return (
    <aside className="admin-sidebar">
      {/* Logo */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-xl">🛍️</span>
          <div>
            <p className="text-white font-extrabold text-sm">ShopZone</p>
            <p className="text-gray-400 text-xs">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1">
        {LINKS.map(({ to, icon: Icon, label, exact }) => (
          <NavLink
            key={to} to={to} end={exact}
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={16}/> {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800 space-y-2">
        <a href="https://shop-zone-pearl.vercel.app" target="_blank" rel="noreferrer"
          className="admin-nav-item text-xs">
          <FiExternalLink size={14}/> View Store
        </a>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">{user?.name}</p>
            <p className="text-gray-400 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="admin-nav-item w-full text-red-400 hover:text-red-300 hover:bg-red-900/20">
          <FiLogOut size={15}/> Logout
        </button>
      </div>
    </aside>
  )
}
