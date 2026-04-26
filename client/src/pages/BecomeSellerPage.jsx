import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiStore, FiFileText, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function BecomeSellerPage() {
  const { user, becomeSeller, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ storeName: '', description: '' });
  const [done, setDone] = useState(false);

  if (!user) return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <p className="text-gray-600 mb-4">You need to be logged in to apply as a seller.</p>
      <Link to="/login" state={{ from: '/become-seller' }} className="bg-orange-500 text-white font-semibold px-5 py-2.5 rounded-full hover:bg-orange-600 transition-colors">
        Login
      </Link>
    </div>
  );

  if (user.role === 'seller' && user.sellerInfo?.approved) {
    navigate('/seller');
    return null;
  }

  if (user.role === 'seller' && !user.sellerInfo?.approved) return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <FiStore size={28} className="text-yellow-500"/>
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Application Under Review</h2>
      <p className="text-gray-500 text-sm">Your seller application is pending admin approval. We'll notify you soon!</p>
    </div>
  );

  if (done) return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <FiCheckCircle size={28} className="text-green-500"/>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
      <p className="text-gray-500 mb-6">Our team will review your application and get back to you within 1-2 business days.</p>
      <Link to="/" className="bg-orange-500 text-white font-semibold px-5 py-2.5 rounded-full hover:bg-orange-600 transition-colors">
        Back to Home
      </Link>
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.storeName.trim()) return toast.error('Store name is required');
    try {
      await becomeSeller(form.storeName, form.description);
      setDone(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Application failed');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FiStore size={30} className="text-orange-500"/>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Become a Seller</h1>
        <p className="text-gray-500 max-w-md mx-auto">Open your store on ShopZone and reach thousands of customers. It's free to apply!</p>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-3 gap-4 mb-10 text-center">
        {[['🚀','Easy Setup','Go live in minutes'],['📦','Full Dashboard','Manage products & orders'],['💰','Low Fees','Keep more of what you earn']].map(([e,t,d]) => (
          <div key={t} className="bg-orange-50 rounded-2xl p-4">
            <div className="text-2xl mb-1">{e}</div>
            <p className="font-semibold text-gray-800 text-sm">{t}</p>
            <p className="text-gray-500 text-xs mt-0.5">{d}</p>
          </div>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <h2 className="font-bold text-gray-900 mb-5">Store Information</h2>
        <div className="mb-4">
          <label className="text-sm font-semibold text-gray-700 mb-1 block">Store Name *</label>
          <div className="relative">
            <FiStore className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15}/>
            <input
              type="text" required
              value={form.storeName}
              onChange={e => setForm(f => ({ ...f, storeName: e.target.value }))}
              placeholder="My Amazing Store"
              className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>
        </div>
        <div className="mb-6">
          <label className="text-sm font-semibold text-gray-700 mb-1 block">Store Description</label>
          <div className="relative">
            <FiFileText className="absolute left-3 top-3 text-gray-400" size={15}/>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Tell customers what you sell..."
              rows={4}
              className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 resize-none"
            />
          </div>
        </div>
        <button
          type="submit" disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {loading ? 'Submitting…' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
}
