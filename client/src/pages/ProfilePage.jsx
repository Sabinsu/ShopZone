import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiUser, FiPackage, FiEdit2, FiSave } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const [editing, setEditing]   = useState(false)
  const [saving, setSaving]     = useState(false)

  const [form, setForm] = useState({
    name:     user?.name     || '',
    email:    user?.email    || '',
    phone:    user?.phone    || '',
    password: '',
    address: {
      street:  user?.address?.street  || '',
      city:    user?.address?.city    || '',
      state:   user?.address?.state   || '',
      country: user?.address?.country || '',
      zip:     user?.address?.zip     || '',
    },
  })

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form }
      if (!form.password) delete payload.password  // don't send empty password
      await updateProfile(payload)
      toast.success('Profile updated!')
      setEditing(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))
  const setAddr = (key) => (e) => setForm(f => ({ ...f, address: { ...f.address, [key]: e.target.value } }))

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>

      <div className="grid sm:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="sm:col-span-1">
          <div className="card p-5 text-center mb-4">
            <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center text-3xl font-bold text-orange-600 mx-auto mb-3">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <h2 className="font-semibold text-gray-800">{user?.name}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{user?.email}</p>
            {user?.role === 'admin' && (
              <span className="badge bg-orange-100 text-orange-600 mt-2 inline-block">Admin</span>
            )}
          </div>
          <nav className="space-y-1">
            <Link to="/profile" className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-orange-50 text-orange-600 text-sm font-medium">
              <FiUser size={15} /> Profile
            </Link>
            <Link to="/orders" className="flex items-center gap-2 px-4 py-2.5 rounded-lg hover:bg-gray-100 text-gray-600 text-sm transition-colors">
              <FiPackage size={15} /> My Orders
            </Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className="flex items-center gap-2 px-4 py-2.5 rounded-lg hover:bg-gray-100 text-gray-600 text-sm transition-colors">
                🛠 Admin Panel
              </Link>
            )}
          </nav>
        </div>

        {/* Form */}
        <div className="sm:col-span-2">
          <div className="card p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-semibold text-gray-800">Personal Information</h3>
              <button
                onClick={() => setEditing(!editing)}
                className="flex items-center gap-1.5 text-sm text-orange-500 hover:text-orange-600"
              >
                <FiEdit2 size={13} /> {editing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                  <input className="input-field" value={form.name} onChange={set('name')} disabled={!editing} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                  <input className="input-field" type="email" value={form.email} onChange={set('email')} disabled={!editing} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
                  <input className="input-field" value={form.phone} onChange={set('phone')} disabled={!editing} placeholder="+1 234 567 8900" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">New Password</label>
                  <input className="input-field" type="password" value={form.password} onChange={set('password')} disabled={!editing} placeholder="Leave blank to keep" />
                </div>
              </div>

              <h4 className="text-sm font-medium text-gray-700 pt-2">Default Address</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Street</label>
                  <input className="input-field" value={form.address.street} onChange={setAddr('street')} disabled={!editing} />
                </div>
                {[['city','City'], ['state','State'], ['country','Country'], ['zip','ZIP']].map(([k, label]) => (
                  <div key={k}>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
                    <input className="input-field" value={form.address[k]} onChange={setAddr(k)} disabled={!editing} />
                  </div>
                ))}
              </div>

              {editing && (
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 mt-2">
                  <FiSave size={14} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
