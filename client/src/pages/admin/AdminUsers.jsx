import AdminLayout from '../../components/admin/AdminLayout';
import { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiCheck, FiX, FiUser, FiShield } from 'react-icons/fi';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const ROLE_COLORS = { user: 'bg-gray-100 text-gray-600', seller: 'bg-blue-100 text-blue-700', admin: 'bg-red-100 text-red-600' };

export default function AdminUsers() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page,    setPage]    = useState(1);
  const [pages,   setPages]   = useState(1);
  const [busy,    setBusy]    = useState(null);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    const q = new URLSearchParams({ page, limit: 15 });
    if (search)     q.set('search', search);
    if (roleFilter) q.set('role',   roleFilter);
    api.get(`/admin/users?${q}`)
      .then(r => { setUsers(r.data.users || []); setPages(r.data.pages || 1); })
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  }, [page, search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!confirm(`Change role to "${newRole}"?`)) return;
    setBusy(userId);
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
      toast.success(`Role updated to ${newRole}`);
    } catch { toast.error('Role update failed'); }
    finally { setBusy(null); }
  };

  const handleApproveSeller = async (userId, approve) => {
    setBusy(userId);
    try {
      await api.put(`/admin/users/${userId}/approve-seller`, { approve });
      setUsers(prev => prev.map(u =>
        u._id === userId ? { ...u, sellerInfo: { ...u.sellerInfo, approved: approve }, role: approve ? 'seller' : u.role } : u
      ));
      toast.success(approve ? 'Seller approved!' : 'Seller rejected');
    } catch { toast.error('Action failed'); }
    finally { setBusy(null); }
  };

  const handleToggleActive = async (userId, isActive) => {
    setBusy(userId);
    try {
      await api.put(`/admin/users/${userId}/status`, { isActive: !isActive });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: !isActive } : u));
      toast.success(isActive ? 'User deactivated' : 'User activated');
    } catch { toast.error('Action failed'); }
    finally { setBusy(null); }
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Users</h1>

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14}/>
          <input
            type="text" placeholder="Search by name or email..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="pl-8 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-orange-400 w-60"
          />
        </div>
        <select
          value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-orange-400"
        >
          <option value="">All Roles</option>
          <option value="user">Users</option>
          <option value="seller">Sellers</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(8)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse"/>)}</div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm min-w-[750px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['User','Role','Store','Status','Joined','Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400">No users found</td></tr>
              ) : users.map(u => (
                <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-xs shrink-0">
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-xs">{u.name}</p>
                        <p className="text-gray-400 text-xs">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${ROLE_COLORS[u.role] || 'bg-gray-100 text-gray-600'}`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {u.sellerInfo?.storeName ? (
                      <div>
                        <p className="font-medium text-gray-700">{u.sellerInfo.storeName}</p>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${u.sellerInfo.approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {u.sellerInfo.approved ? 'Approved' : 'Pending'}
                        </span>
                      </div>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {/* Approve/reject pending seller */}
                      {u.role === 'seller' && !u.sellerInfo?.approved && (
                        <>
                          <button onClick={() => handleApproveSeller(u._id, true)}  disabled={busy === u._id} title="Approve seller"
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-40">
                            <FiCheck size={14}/>
                          </button>
                          <button onClick={() => handleApproveSeller(u._id, false)} disabled={busy === u._id} title="Reject seller"
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40">
                            <FiX size={14}/>
                          </button>
                        </>
                      )}
                      {/* Toggle admin */}
                      <button onClick={() => handleToggleRole(u._id, u.role)} disabled={busy === u._id} title={u.role === 'admin' ? 'Remove admin' : 'Make admin'}
                        className="p-1.5 text-purple-500 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-40">
                        <FiShield size={14}/>
                      </button>
                      {/* Toggle active */}
                      <button onClick={() => handleToggleActive(u._id, u.isActive)} disabled={busy === u._id} title={u.isActive ? 'Deactivate' : 'Activate'}
                        className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 ${u.isActive ? 'text-red-400 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}>
                        {u.isActive ? <FiX size={14}/> : <FiCheck size={14}/>}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {[...Array(pages)].map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              className={`w-9 h-9 rounded-lg text-sm font-medium border transition-colors ${page === i + 1 ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-300 hover:border-orange-400'}`}
            >{i + 1}</button>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
