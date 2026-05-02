// client/src/pages/admin/AdminAnalytics.jsx
import AdminSidebar from '../../components/admin/AdminSidebar'
export default function AdminAnalytics() {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-500 text-sm mb-6">Sales and revenue insights</p>
        <div className="card text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">📊</p>
          <p className="font-medium">Analytics coming soon</p>
          <p className="text-sm mt-1">Charts and reports will appear here</p>
        </div>
      </div>
    </div>
  )
}
