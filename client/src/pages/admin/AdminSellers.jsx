// client/src/pages/admin/AdminSellers.jsx
import { useEffect, useState } from 'react'
import { FiCheck, FiX, FiSearch, FiClock, FiUser } from 'react-icons/fi'
import api from '../../api/axios'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { SkeletonTable } from '../../components/ui/Skeleton'
import Pagination from '../../components/ui/Pagination'
import toast from 'react-hot-toast'

const LIMIT = 20
const TABS = ['pending', 'approved', 'rejected']

export default function AdminSellers() {
  const [users,   setUsers]   = useState([])
  const [total,   setTotal]   = useState(0)
  const [page,    setPage]    = useState(1)
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState('pending')
  const [search,  setSearch]  = useState('')
  const [rejectModal, setRejectModal] = useState(null)  // user to reject
  const [rejectReason, setRejectReason] = useState('')

  const load = (p = 1) => {
    setLoading(true)
    // For pending tab use dedicated endpoint; for others use users endpoint
    const endpoint = tab === 'pending'
      ? `/admin/sellers/pending?page=${p}&limit=${LIMIT}`
      : `/admin/users?search=${encodeURIComponent(search)}&page=${p}&limit=${LIMIT}`
    api.get(endpoint)
      .then(r => {
        let users = r.data.users || r.data
        if (tab !== 'pending') {
          users = users.filter(u => u.sellerInfo?.status === tab || (tab === 'approved' && u.sellerInfo?.approved))
        }
        setUsers(users)
        setTotal(r.data.total || users.length)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { setPage(1); load(1) }, [tab, search])
  useEffect(() => { if (page > 1) load(page) }, [page])

  const approve = async (user) => {
    try {
      await api.put(`/admin/sellers/${user._id}/approve`)
      toast.success(`${user.name} approved as seller!`)
      load(page)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const reject = async () => {
    if (!rejectModal) return
    try {
      await api.put(`/admin/sellers/${rejectModal._id}/reject`, { reason: rejectReason || undefined })
      toast.success(`Application rejected`)
      setRejectModal(null); setRejectReason('')
      load(page)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const statusColor = (s) => {
    if (s === 'approved') return 'badge-green'
    if (s === 'rejected') return 'badge-red'
    return 'badge-yellow'
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content p-6">
        <h1 style={{ fontSize:'1.5rem', fontWeight:800, color:'var(--text-1)', marginBottom:'1.5rem' }}>Seller Applications</h1>

        {/* Tabs */}
        <div style={{ display:'flex', gap:8, marginBottom:'1.25rem' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding:'7px 18px', borderRadius:20, fontSize:'0.8rem', fontWeight:600, cursor:'pointer',
              background: t === tab ? 'rgba(212,175,55,0.15)' : 'var(--dark-4)',
              color: t === tab ? 'var(--gold)' : 'var(--text-3)',
              border: `1px solid ${t === tab ? 'rgba(212,175,55,0.3)' : 'var(--dark-5)'}`,
              transition: 'all 0.2s', textTransform:'capitalize',
            }}>{t}</button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position:'relative', marginBottom:'1.25rem', maxWidth:340 }}>
          <FiSearch style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-3)' }} size={14}/>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search sellers..." className="input" style={{ paddingLeft:36, paddingTop:8, paddingBottom:8, fontSize:'0.85rem' }}/>
        </div>

        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          {loading ? <div style={{ padding:'1.5rem' }}><SkeletonTable/></div> : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Seller</th><th>Store Name</th><th>Applied</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign:'center', padding:'3rem', color:'var(--text-3)' }}>
                      No {tab} applications
                    </td></tr>
                  ) : users.map(u => (
                    <tr key={u._id}>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div style={{ width:34, height:34, borderRadius:'50%', background:'linear-gradient(135deg,var(--gold-light),var(--gold))', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, color:'#0A0A0F', fontSize:'0.85rem' }}>
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight:600, color:'var(--text-1)', fontSize:'0.875rem' }}>{u.name}</div>
                            <div style={{ fontSize:'0.75rem', color:'var(--text-3)' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontWeight:600, color:'var(--text-2)' }}>{u.sellerInfo?.storeName || '—'}</td>
                      <td style={{ fontSize:'0.78rem', color:'var(--text-3)' }}>
                        {u.sellerInfo?.appliedAt ? new Date(u.sellerInfo.appliedAt).toLocaleDateString() : '—'}
                      </td>
                      <td>
                        <span className={statusColor(u.sellerInfo?.status || 'pending')} style={{ textTransform:'capitalize' }}>
                          {u.sellerInfo?.status || 'pending'}
                        </span>
                        {u.sellerInfo?.rejectReason && (
                          <div style={{ fontSize:'0.7rem', color:'var(--text-3)', marginTop:3, maxWidth:160 }} title={u.sellerInfo.rejectReason}>
                            {u.sellerInfo.rejectReason.slice(0, 40)}…
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ display:'flex', gap:6 }}>
                          {u.sellerInfo?.status !== 'approved' && (
                            <button onClick={() => approve(u)} style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:8, background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.25)', color:'#4ade80', cursor:'pointer', fontSize:'0.8rem', fontWeight:600 }}>
                              <FiCheck size={13}/> Approve
                            </button>
                          )}
                          {u.sellerInfo?.status !== 'rejected' && (
                            <button onClick={() => { setRejectModal(u); setRejectReason('') }} style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:8, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', color:'#f87171', cursor:'pointer', fontSize:'0.8rem', fontWeight:600 }}>
                              <FiX size={13}/> Reject
                            </button>
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

        <Pagination page={page} totalPages={Math.ceil(total / LIMIT)} onPageChange={setPage} loading={loading}/>

        {/* Reject Modal */}
        {rejectModal && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
            <div className="animate-slide-up card" style={{ maxWidth:440, width:'100%' }}>
              <h3 style={{ fontWeight:800, color:'var(--text-1)', marginBottom:12 }}>Reject Application</h3>
              <p style={{ color:'var(--text-2)', fontSize:'0.875rem', marginBottom:16 }}>
                Rejecting <strong>{rejectModal.name}</strong>'s seller application for store "{rejectModal.sellerInfo?.storeName}".
              </p>
              <label className="label">Reason (optional)</label>
              <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                rows={3} className="input" style={{ resize:'none', marginBottom:16 }}
                placeholder="Tell the seller why their application was rejected..."/>
              <div style={{ display:'flex', gap:10 }}>
                <button onClick={() => setRejectModal(null)} className="btn-ghost" style={{ flex:1, border:'1px solid var(--dark-5)' }}>Cancel</button>
                <button onClick={reject} className="btn-danger" style={{ flex:1, fontWeight:700 }}>Confirm Reject</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
