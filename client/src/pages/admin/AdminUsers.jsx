import { useState, useEffect, useCallback } from 'react'
import { FiSearch, FiEdit2, FiTrash2, FiX, FiUser, FiShield, FiShoppingBag } from 'react-icons/fi'
import api   from '../../api/axios'
import toast from 'react-hot-toast'

const ROLE_CONFIG = {
  user:   { color: 'bg-gray-100   text-gray-700',   icon: <FiUser    size={12}/> },
  seller: { color: 'bg-blue-100   text-blue-700',   icon: <FiShoppingBag size={12}/> },
  admin:  { color: 'bg-orange-100 text-orange-700', icon: <FiShield  size={12}/> },
}

function EditModal({ user, onClose, onSave }) {
  const [role,     setRole]     = useState(user.role)
  const [isActive, setIsActive] = useState(user.isActive !== false)
  const [saving,   setSaving]   = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try { await onSave(user._id, { role, isActive }); onClose() }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-900">Edit User</h3>
          <button onClick={onClose}><FiX className="text-gray-400"/></button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center font-bold text-orange-700">
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Role</label>
            <select value={role} onChange={e => setRole(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
              <option value="user">User</option>
              <option value="seller">Seller</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <span className="text-sm text-gray-700">Account Active</span>
            <button onClick={() => setIsActive(a => !a)}
              className={`w-11 h-6 rounded-full transition-colors relative ${isActive ? 'bg-green-500' : 'bg-gray-300'}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isActive ? 'translate-x-5' : 'translate-x-0.5'}`}/>
            </button>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50 transition-colors">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminUsers() {
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [page,    setPage]    = useState(1)
  const [pages,   setPages]   = useState(1)
  const [total,   setTotal]   = useState(0)
  const [search,  setSearch]  = useState('')
  const [editUser, setEditUser] = useState(null)
  const [roleFilter, setRoleFilter] = useState('all')

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/admin/users?page=${page}`)
      setUsers(data.users || [])
      setPages(data.pages || 1)
      setTotal(data.total || 0)
    } catch { toast.error('Failed to load users') }
    finally { setLoading(false) }
  }, [page])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleSave = async (userId, updates) => {
    try {
      await api.put(`/admin/users/${userId}`, updates)
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, ...updates } : u))
      toast.success('User updated!')
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed') }
  }

  const handleDelete = async (userId, name) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return
    try {
      await api.delete(`/admin/users/${userId}`)
      setUsers(prev => prev.filter(u => u._id !== userId))
      setTotal(t => t - 1)
      toast.success('User deleted')
    } catch (err) { toast.error(err.response?.data?.message || 'Delete failed') }
  }

  const filtered = users.filter(u => {
    const matchRole   = roleFilter === 'all' || u.role === roleFilter
    const matchSearch = !search.trim() ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    return matchRole && matchSearch
  })

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Users</h1>
            <p className="text-sm text-gray-500 mt-1">{total} registered users</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"/>
            </div>
            <div className="flex gap-2">
              {['all','user','seller','admin'].map(r => (
                <button key={r} onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize border transition-colors ${
                    roleFilter === r ? 'bg-orange-500 text-white border-orange-500' : 'bg-white border-gray-200 text-gray-600 hover:border-orange-300'
                  }`}>{r}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-3">
              {[...Array(8)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse"/>)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400"><p>No users found</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['User','Role','Status','Joined','Store','Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(u => {
                    const roleCfg = ROLE_CONFIG[u.role] || ROLE_CONFIG.user
                    return (
                      <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center font-bold text-orange-700 text-sm shrink-0">
                              {u.name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{u.name}</p>
                              <p className="text-xs text-gray-400">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${roleCfg.color}`}>
                            {roleCfg.icon} {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${u.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {u.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {u.sellerInfo?.storeName || '—'}
                          {u.role === 'seller' && !u.sellerInfo?.approved && (
                            <span className="ml-1 text-yellow-600 font-medium">(Pending)</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => setEditUser(u)}
                              className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                              <FiEdit2 size={14}/>
                            </button>
                            <button onClick={() => handleDelete(u._id, u.name)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                              <FiTrash2 size={14}/>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {pages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {[...Array(pages)].map((_, i) => (
              <button key={i} onClick={() => setPage(i+1)}
                className={`w-9 h-9 rounded-xl text-sm font-medium border transition-colors ${
                  page===i+1 ? 'bg-orange-500 text-white border-orange-500' : 'bg-white border-gray-200 hover:border-orange-400'
                }`}>{i+1}</button>
            ))}
          </div>
        )}
      </div>

      {editUser && <EditModal user={editUser} onClose={() => setEditUser(null)} onSave={handleSave}/>}
    </div>
  )
}
