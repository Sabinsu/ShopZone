import { Link, useLocation } from 'react-router-dom'
import { FiGrid, FiPackage, FiShoppingBag, FiUsers, FiArrowLeft } from 'react-icons/fi'

const NAV = [
  { to: '/admin',          icon: FiGrid,       label: 'Dashboard' },
  { to: '/admin/products', icon: FiPackage,    label: 'Products' },
  { to: '/admin/orders',   icon: FiShoppingBag,label: 'Orders' },
  { to: '/admin/users',    icon: FiUsers,      label: 'Users' },
]

export default function AdminLayout({ title, children }) {
  const { pathname } = useLocation()

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 text-gray-300 flex-shrink-0 hidden md:flex flex-col">
        <div className="p-5 border-b border-gray-800">
          <Link to="/" className="text-lg font-bold text-orange-500">Shop<span className="text-white">Zone</span></Link>
          <p className="text-xs text-gray-500 mt-0.5">Admin Panel</p>
        </div>
        <nav className="p-3 flex-1">
          {NAV.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm transition-colors ${
                pathname === to ? 'bg-orange-500 text-white' : 'hover:bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              <Icon size={16} /> {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-800">
          <Link to="/" className="flex items-center gap-2 px-3 py-2 text-xs text-gray-500 hover:text-gray-300">
            <FiArrowLeft size={13} /> Back to Store
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
        {/* Mobile nav */}
        <div className="flex gap-2 mb-4 md:hidden overflow-x-auto pb-1">
          {NAV.map(({ to, label }) => (
            <Link key={to} to={to}
              className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap ${pathname === to ? 'bg-orange-500 text-white' : 'bg-white border text-gray-600'}`}>
              {label}
            </Link>
          ))}
        </div>
        <h1 className="text-xl font-bold text-gray-800 mb-6">{title}</h1>
        {children}
      </main>
    </div>
  )
}
