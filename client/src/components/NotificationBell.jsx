// client/src/components/NotificationBell.jsx  ← NEW FILE
// Import and use inside Navbar.jsx
import { useState, useRef, useEffect } from 'react'
import { FiBell } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function NotificationBell() {
  const { user, unreadCount, markNotificationsRead } = useAuth()
  const [open,  setOpen]  = useState(false)
  const [notifs, setNotifs] = useState(user?.notifications || [])
  const ref = useRef(null)

  // Close on outside click
  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleOpen = async () => {
    setOpen(o => !o)
    if (!open && unreadCount > 0) {
      await markNotificationsRead()
      const { data } = await api.get('/auth/notifications')
      setNotifs(data)
    }
  }

  if (!user) return null

  return (
    <div className="relative" ref={ref}>
      <button onClick={handleOpen}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition">
        <FiBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="font-semibold text-sm text-gray-900">Notifications</span>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-xs">Close</button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifs.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">No notifications yet</p>
            ) : notifs.slice(0, 15).map(n => (
              <div key={n._id}
                className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 ${!n.read ? 'bg-orange-50/50' : ''}`}>
                <p className="text-sm text-gray-800">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
