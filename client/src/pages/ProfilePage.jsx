import { useState } from 'react';
import { FiUser, FiMail, FiPhone, FiMapPin, FiBell, FiSave } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser, markNotificationsRead } = useAuth();
  const [tab,     setTab]     = useState('profile');
  const [form,    setForm]    = useState({
    name:  user?.name    || '',
    phone: user?.phone   || '',
    address: {
      street:  user?.address?.street  || '',
      city:    user?.address?.city    || '',
      state:   user?.address?.state   || '',
      country: user?.address?.country || '',
      zip:     user?.address?.zip     || '',
    },
  });
  const [saving,  setSaving]  = useState(false);
  const [pwForm,  setPwForm]  = useState({ current: '', newPass: '', confirm: '' });
  const [pwSaving,setPwSaving]= useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleAddr   = e => setForm(f => ({ ...f, address: { ...f.address, [e.target.name]: e.target.value } }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', form);
      updateUser(data.user || data);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPass !== pwForm.confirm) return toast.error("Passwords don't match");
    if (pwForm.newPass.length < 6)         return toast.error("Password too short");
    setPwSaving(true);
    try {
      await api.put('/auth/change-password', { currentPassword: pwForm.current, newPassword: pwForm.newPass });
      toast.success('Password changed!');
      setPwForm({ current: '', newPass: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setPwSaving(false); }
  };

  const unread = user?.notifications?.filter(n => !n.read).length || 0;
  const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 text-2xl font-bold">
          {user?.avatar
            ? <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover"/>
            : user?.name?.[0]?.toUpperCase()
          }
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{user?.name}</h1>
          <p className="text-sm text-gray-500">{user?.email} · <span className="capitalize font-medium text-orange-500">{user?.role}</span></p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {[
          { key: 'profile',  label: 'Profile' },
          { key: 'security', label: 'Security' },
          { key: 'notifications', label: `Notifications${unread ? ` (${unread})` : ''}` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => { setTab(key); if (key === 'notifications') markNotificationsRead(); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === key ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >{label}</button>
        ))}
      </div>

      {/* Profile Tab */}
      {tab === 'profile' && (
        <form onSubmit={handleSave} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-5">Personal Information</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Full Name</label>
              <div className="relative"><FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15}/>
                <input name="name" value={form.name} onChange={handleChange} className={`${inputCls} pl-9`} placeholder="Your name"/>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Email (read-only)</label>
              <div className="relative"><FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15}/>
                <input value={user?.email} readOnly className={`${inputCls} pl-9 bg-gray-50 cursor-not-allowed text-gray-400`}/>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Phone</label>
              <div className="relative"><FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15}/>
                <input name="phone" value={form.phone} onChange={handleChange} className={`${inputCls} pl-9`} placeholder="+1 555 000 0000"/>
              </div>
            </div>
          </div>
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><FiMapPin size={15} className="text-orange-500"/> Address</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Street</label>
              <input name="street" value={form.address.street} onChange={handleAddr} className={inputCls} placeholder="123 Main St"/>
            </div>
            {[['city','City'],['state','State'],['country','Country'],['zip','ZIP']].map(([n,l]) => (
              <div key={n}>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">{l}</label>
                <input name={n} value={form.address[n]} onChange={handleAddr} className={inputCls} placeholder={l}/>
              </div>
            ))}
          </div>
          <button type="submit" disabled={saving} className="mt-6 flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm">
            <FiSave size={15}/> {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      )}

      {/* Security Tab */}
      {tab === 'security' && (
        <form onSubmit={handlePasswordChange} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm max-w-md">
          <h2 className="font-bold text-gray-900 mb-5">Change Password</h2>
          {[
            { name: 'current', label: 'Current Password',  val: pwForm.current,  set: v => setPwForm(f => ({ ...f, current: v })) },
            { name: 'newPass', label: 'New Password',      val: pwForm.newPass,  set: v => setPwForm(f => ({ ...f, newPass: v })) },
            { name: 'confirm', label: 'Confirm Password',  val: pwForm.confirm,  set: v => setPwForm(f => ({ ...f, confirm: v })) },
          ].map(({ name, label, val, set }) => (
            <div key={name} className="mb-4">
              <label className="text-xs font-semibold text-gray-600 mb-1 block">{label}</label>
              <input type="password" value={val} onChange={e => set(e.target.value)} required className={inputCls} placeholder="••••••••"/>
            </div>
          ))}
          <button type="submit" disabled={pwSaving} className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm">
            {pwSaving ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      )}

      {/* Notifications Tab */}
      {tab === 'notifications' && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <FiBell className="text-orange-500" size={18}/>
            <h2 className="font-bold text-gray-900">Notifications</h2>
          </div>
          {!user?.notifications?.length ? (
            <div className="py-16 text-center text-gray-400">
              <FiBell size={36} className="mx-auto mb-2 opacity-30"/>
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {user.notifications.map((n, i) => (
                <div key={i} className={`px-6 py-4 flex items-start gap-3 ${!n.read ? 'bg-orange-50' : ''}`}>
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!n.read ? 'bg-orange-500' : 'bg-gray-300'}`}/>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
