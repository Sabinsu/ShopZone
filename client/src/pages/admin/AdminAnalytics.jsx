import AdminLayout from '../../components/admin/AdminLayout';
import { useState, useEffect } from 'react';
import { FiTrendingUp, FiDollarSign, FiPackage, FiUsers, FiStar } from 'react-icons/fi';
import api from '../../api/axios';

export default function AdminAnalytics() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [period,  setPeriod]  = useState('30d');

  useEffect(() => {
    setLoading(true);
    api.get(`/admin/analytics?period=${period}`)
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [period]);

  const metrics = data ? [
    { label: 'Total Revenue',   value: `$${(data.totalRevenue  || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: FiDollarSign, bg: 'bg-green-100',  text: 'text-green-600'  },
    { label: 'Orders Placed',   value: (data.totalOrders   || 0).toLocaleString(), icon: FiPackage,   bg: 'bg-blue-100',   text: 'text-blue-600'   },
    { label: 'New Users',       value: (data.newUsers      || 0).toLocaleString(), icon: FiUsers,     bg: 'bg-purple-100', text: 'text-purple-600' },
    { label: 'Avg Order Value', value: `$${(data.avgOrderValue|| 0).toFixed(2)}`,  icon: FiTrendingUp,bg: 'bg-orange-100', text: 'text-orange-600' },
  ] : [];

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <div className="flex gap-2">
          {[['7d','7 Days'],['30d','30 Days'],['90d','90 Days'],['1y','1 Year']].map(([val, label]) => (
            <button key={val} onClick={() => setPeriod(val)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${period === val ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >{label}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse"/>)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {metrics.map(({ label, value, icon: Icon, bg, text }) => (
              <div key={label} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                  <Icon size={20} className={text}/>
                </div>
                <p className="text-2xl font-extrabold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Revenue by day */}
          {data?.dailyRevenue?.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-6">
              <h2 className="font-bold text-gray-900 mb-4">Daily Revenue</h2>
              <div className="flex items-end gap-1.5 h-40 overflow-x-auto">
                {data.dailyRevenue.map((d, i) => {
                  const max = Math.max(...data.dailyRevenue.map(x => x.revenue), 1);
                  const h   = Math.max(4, (d.revenue / max) * 100);
                  return (
                    <div key={i} className="flex flex-col items-center gap-1 shrink-0" style={{ flex: '1 0 24px' }}>
                      <div title={`$${d.revenue.toFixed(2)}`} style={{ height: `${h}%` }}
                        className="w-full bg-orange-400 rounded-t-sm hover:bg-orange-500 transition-colors min-h-[4px]"/>
                      <span className="text-[10px] text-gray-400 rotate-45 origin-left whitespace-nowrap" style={{ display: i % Math.ceil(data.dailyRevenue.length / 7) === 0 ? 'block' : 'none' }}>
                        {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Top products */}
            {data?.topProducts?.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <h2 className="font-bold text-gray-900 mb-4">Top Products</h2>
                <div className="space-y-3">
                  {data.topProducts.map((p, i) => (
                    <div key={p._id} className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-400 w-5 shrink-0">#{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.sold} sold · ${p.revenue?.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiStar size={12} className="text-yellow-400"/>
                        <span className="text-xs text-gray-600">{p.ratings?.toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Orders by status */}
            {data?.ordersByStatus && (
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <h2 className="font-bold text-gray-900 mb-4">Orders by Status</h2>
                <div className="space-y-2">
                  {Object.entries(data.ordersByStatus).map(([status, count]) => {
                    const total = Object.values(data.ordersByStatus).reduce((a, b) => a + b, 0);
                    const pct   = total ? Math.round((count / total) * 100) : 0;
                    return (
                      <div key={status} className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 capitalize w-20 shrink-0">{status}</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-400 rounded-full" style={{ width: `${pct}%` }}/>
                        </div>
                        <span className="text-xs font-semibold text-gray-700 w-8 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </AdminLayout>
  );
}
