// client/src/pages/ProfilePage.jsx
import { useState } from 'react'
import { FiUser, FiMail, FiPhone, FiSave } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [form,    setForm]    = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [loading, setLoading] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.put('/auth/profile', form)
      updateUser(data)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      <div className="card mb-5">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          {user?.avatar
            ? <img src={user.avatar} alt="" className="w-16 h-16 rounded-full object-cover ring-4 ring-orange-100"/>
            : <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-extrabold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
          }
          <div>
            <p className="text-lg font-bold text-gray-900">{user?.name}</p>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <span className={`mt-1 inline-block ${user?.role === 'admin' ? 'badge-orange' : 'badge-gray'}`}>{user?.role}</span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15}/>
              <input value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))}
                className="input pl-9" placeholder="Your full name"/>
            </div>
          </div>
          <div>
            <label className="label">Email</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15}/>
              <input value={user?.email} disabled className="input pl-9 bg-gray-50 cursor-not-allowed text-gray-400"/>
            </div>
          </div>
          <div>
            <label className="label">Phone</label>
            <div className="relative">
              <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15}/>
              <input value={form.phone} onChange={e => setForm(f=>({...f,phone:e.target.value}))}
                className="input pl-9" placeholder="+977-XXXXXXXXXX"/>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary py-3">
            {loading ? <span className="spinner w-5 h-5"/> : <><FiSave size={15}/> Save Changes</>}
          </button>
        </form>
      </div>
    </div>
  )
}
