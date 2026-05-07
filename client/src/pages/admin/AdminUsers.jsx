// client/src/pages/admin/AdminUsers.jsx
import { useEffect, useState } from 'react'
import { FiSearch, FiShield, FiUser, FiTrash2, FiCheck } from 'react-icons/fi'
import api from '../../api/axios'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { SkeletonTable } from '../../components/ui/Skeleton'
import Pagination from '../../components/ui/Pagination'
import toast from 'react-hot-toast'

export default function AdminUsers() {
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')

  const load = () => {
    setLoading(true)
    api.get(`/admin/users?search=${search}`)
      .then(r => setUsers(r.data.users || r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }
  useEffect(load, [search])

  const toggleAdmin = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin'
    if (!window.confirm(`Make ${user.name} a${newRole === 'admin' ? 'n admin' : ' regular user'}?`)) return
    try {
      await api.put(`/admin/users/${user._id}/role`, { role: newRole })
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, role: newRole } : u))
      toast.success(`${user.name} is now ${newRole}`)
    } catch { toast.error('Failed to update role') }
  }

  const deleteUser = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return
    try {
      await api.delete(`/admin/users/${id}`)
      setUsers(prev => prev.filter(u => u._id !== id))
      toast.success('User deleted')
    } catch { toast.error('Failed to delete user') }
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Users ({users.length})</h1>

        <div className="relative mb-5 max-w-sm">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15}/>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search users..." className="input pl-9 py-2 text-sm"/>
        </div>

        <div className="card p-0 overflow-hidden">
          {loading ? <div className="p-6"><SkeletonTable rows={8}/></div> : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id}>
                      <td>
                        <div className="flex items-center gap-3">
                          {user.avatar
                            ? <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover"/>
                            : <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm">
                                {user.name?.charAt(0).toUpperCase()}
                              </div>
                          }
                          <span className="font-medium text-sm">{user.name}</span>
                        </div>
                      </td>
                      <td className="text-sm text-gray-500">{user.email}</td>
                      <td>
                        <div style={{display:'flex',flexDirection:'column',gap:3}}>
                          <span className={user.role === 'admin' ? 'badge-orange' : user.role === 'seller' ? 'badge-blue' : 'badge-gray'}>
                            {user.role}
                          </span>
                          {user.sellerInfo?.status && (
                            <span className={user.sellerInfo.status === 'approved' ? 'badge-green' : user.sellerInfo.status === 'rejected' ? 'badge-red' : 'badge-yellow'} style={{fontSize:'0.65rem'}}>
                              {user.sellerInfo.status}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="text-xs text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="flex gap-1">
                          <button onClick={() => toggleAdmin(user)}
                            className={`btn-ghost p-2 text-sm ${user.role === 'admin' ? 'text-orange-500 hover:bg-orange-50' : 'text-gray-400 hover:bg-gray-100'}`}
                            title={user.role === 'admin' ? 'Remove admin' : 'Make admin'}>
                            {user.role === 'admin' ? <FiShield size={14}/> : <FiUser size={14}/>}
                          </button>
                          <button onClick={() => deleteUser(user._id, user.name)}
                            className="btn-ghost p-2 text-red-400 hover:bg-red-50">
                            <FiTrash2 size={14}/>
                          </button>
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
