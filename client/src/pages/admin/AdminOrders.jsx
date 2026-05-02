// client/src/pages/admin/AdminOrders.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiSearch, FiChevronDown } from 'react-icons/fi'
import api from '../../api/axios'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { SkeletonTable } from '../../components/ui/Skeleton'
import toast from 'react-hot-toast'

const STATUSES = ['pending','confirmed','shipped','delivered','cancelled']

export default function AdminOrders() {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('')
  const [search,  setSearch]  = useState('')
  const [updating, setUpdating] = useState(null)

  const load = () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filter) params.set('status', filter)
    if (search) params.set('search', search)
    api.get(`/admin/orders?${params}`)
      .then(r => setOrders(r.data.orders || r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }
  useEffect(load, [filter, search])

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(orderId)
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus })
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o))
      toast.success(`Order status updated to "${newStatus}"`)
    } catch {
      toast.error('Failed to update status')
    } finally { setUpdating(null) }
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Orders</h1>

        <div className="flex flex-wrap gap-3 mb-5">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15}/>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by order ID or customer..." className="input pl-9 py-2 text-sm"/>
          </div>
          {/* Status filter */}
          <div className="relative">
            <select value={filter} onChange={e => setFilter(e.target.value)}
              className="input py-2 pr-8 text-sm appearance-none min-w-[140px]">
              <option value="">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14}/>
          </div>
        </div>

        <div className="card p-0 overflow-hidden">
          {loading ? <div className="p-6"><SkeletonTable rows={8}/></div> : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Update Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-10 text-gray-400">No orders found</td></tr>
                  ) : orders.map(order => (
                    <tr key={order._id}>
                      <td>
                        <Link to={`/orders/${order._id}`} className="text-orange-500 font-mono text-xs hover:underline">
                          #{order._id.slice(-8).toUpperCase()}
                        </Link>
                      </td>
                      <td>
                        <p className="font-medium text-sm">{order.user?.name || 'Guest'}</p>
                        <p className="text-xs text-gray-400">{order.user?.email}</p>
                      </td>
                      <td className="text-sm">{order.items?.length}</td>
                      <td className="font-bold text-sm">Rs {order.totalPrice?.toLocaleString()}</td>
                      <td><span className={`status-${order.status}`}>{order.status}</span></td>
                      <td className="text-xs text-gray-400 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="relative">
                          <select
                            value={order.status}
                            onChange={e => handleStatusChange(order._id, e.target.value)}
                            disabled={updating === order._id || order.status === 'cancelled'}
                            className="input py-1.5 pr-7 text-xs appearance-none min-w-[120px] disabled:opacity-50"
                          >
                            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          {updating === order._id && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                              <span className="spinner w-3 h-3"/>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
