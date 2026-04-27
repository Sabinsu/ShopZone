import { useState, useEffect } from 'react';
import { FiTrendingUp, FiStar, FiZap } from 'react-icons/fi';
import { BsRobot } from 'react-icons/bs';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import ProductCard, { ProductCardSkeleton } from '../ui/ProductCard';

export default function RecommendedProducts({ productId, category, title }) {
  const { user } = useAuth();
  const [tab,      setTab]      = useState(productId ? 'related' : user ? 'recommended' : 'trending');
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    setLoading(true);
    setProducts([]);

    let endpoint = productId
      ? `/ai/related/${productId}?limit=8`
      : tab === 'recommended' && user
        ? '/ai/recommendations?limit=12'
        : '/ai/trending?limit=12';

    api.get(endpoint)
      .then(r => setProducts(Array.isArray(r.data) ? r.data : r.data.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [tab, user, productId, category]);

  if (!loading && products.length === 0) return null;

  return (
    <section className="py-10 bg-gradient-to-b from-white to-orange-50/30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <FiZap size={20} className="text-orange-500"/>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {productId ? 'Related Products' : title || 'Discover Products'}
              </h2>
              {user && tab === 'recommended' && !productId && (
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <BsRobot size={11}/> Personalised by AI based on your activity
                </p>
              )}
            </div>
            {tab === 'recommended' && !productId && (
              <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-semibold">AI Powered</span>
            )}
          </div>

          {!productId && (
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
              {(user ? [
                { id: 'recommended', label: 'For You',  icon: BsRobot      },
                { id: 'trending',    label: 'Trending', icon: FiTrendingUp  },
              ] : [
                { id: 'trending',    label: 'Trending', icon: FiTrendingUp  },
              ]).map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setTab(id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    tab === id ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon size={12}/> {label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {loading
            ? [...Array(productId ? 8 : 12)].map((_, i) => <ProductCardSkeleton key={i}/>)
            : products.slice(0, productId ? 8 : 12).map(p => <ProductCard key={p._id} product={p} compact/>)
          }
        </div>
      </div>
    </section>
  );
}
