import { Link } from 'react-router-dom'
import { FiShoppingCart, FiUsers, FiPackage, FiDollarSign, FiTrendingUp, FiList, FiBarChart2, FiShoppingBag } from 'react-icons/fi'

const MENU = [
  { to:'/admin/analytics', icon: FiBarChart2,    title:'Analytics',   desc:'Sales, revenue, charts',    color:'bg-purple-500' },
  { to:'/admin/orders',    icon: FiShoppingCart, title:'Orders',      desc:'Manage & update orders',    color:'bg-blue-500' },
  { to:'/admin/products',  icon: FiPackage,      title:'Products',    desc:'Add, edit, delete products',color:'bg-orange-500' },
  { to:'/admin/users',     icon: FiUsers,        title:'Users',       desc:'Manage users & sellers',    color:'bg-green-500' },
]

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-500 mt-1">Welcome back. Manage your ShopZone platform.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          {MENU.map(({ to, icon: Icon, title, desc, color }) => (
            <Link key={to} to={to}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-5 hover:shadow-md transition-all hover:-translate-y-0.5">
              <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center shrink-0`}>
                <Icon className="text-white" size={24}/>
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg">{title}</h2>
                <p className="text-gray-500 text-sm mt-0.5">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-orange-500 hover:underline">← Back to storefront</Link>
        </div>
      </div>
    </div>
  )
}
