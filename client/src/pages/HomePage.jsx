import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiPackage, FiShield, FiTruck, FiStar } from 'react-icons/fi';
import ProductCard, { ProductCardSkeleton } from '../components/ui/ProductCard';
import RecommendedProducts from '../components/ai/RecommendedProducts';
import api from '../api/axios';

const CATEGORIES = [
  { name:'Electronics', emoji:'💻', color:'bg-blue-100 text-blue-700'   },
  { name:'Fashion',     emoji:'👗', color:'bg-pink-100 text-pink-700'   },
  { name:'Home',        emoji:'🏠', color:'bg-yellow-100 text-yellow-700'},
  { name:'Sports',      emoji:'⚽', color:'bg-green-100 text-green-700' },
  { name:'Books',       emoji:'📚', color:'bg-purple-100 text-purple-700'},
  { name:'Beauty',      emoji:'💄', color:'bg-red-100 text-red-700'     },
];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    api.get('/products/featured')
      .then(r => setFeatured(r.data.slice(0, 8)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white">
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-orange-50 via-white to-orange-50 py-16 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-block bg-orange-100 text-orange-600 text-xs font-semibold px-3 py-1 rounded-full mb-4 animate-pulse">
              🤖 AI-Powered Shopping
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
              Shop Smarter<br/>
              <span className="text-orange-500">With ShopZone</span>
            </h1>
            <p className="text-gray-600 text-lg mb-8 max-w-md">
              Discover products powered by AI recommendations — personalised just for you.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/products" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-full flex items-center gap-2 transition-all shadow-lg shadow-orange-200 hover:shadow-orange-300 hover:-translate-y-0.5">
                Shop Now <FiArrowRight/>
              </Link>
              <Link to="/become-seller" className="border-2 border-orange-500 text-orange-500 hover:bg-orange-50 font-semibold px-6 py-3 rounded-full transition-colors">
                Sell With Us
              </Link>
            </div>
          </div>
          <div className="hidden md:grid grid-cols-2 gap-4">
            {['📱','👟','🎧','💍'].map((emoji,i) => (
              <div key={i} className={`rounded-2xl p-6 flex items-center justify-center text-5xl h-32 transition-transform hover:scale-105 ${i%2===0 ? 'bg-orange-100' : 'bg-orange-50'}`}>
                {emoji}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust badges ── */}
      <section className="border-y border-gray-100 py-6 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon:<FiTruck className="text-orange-500" size={22}/>,   title:'Free Shipping',  sub:'Orders over $50'       },
            { icon:<FiShield className="text-orange-500" size={22}/>,  title:'Secure Payment', sub:'SSL encrypted'          },
            { icon:<FiPackage className="text-orange-500" size={22}/>, title:'Easy Returns',   sub:'30-day hassle-free'     },
            { icon:<FiStar className="text-orange-500" size={22}/>,    title:'Trusted Sellers',sub:'Verified merchants'     },
          ].map(({ icon, title, sub }) => (
            <div key={title} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">{icon}</div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{title}</p>
                <p className="text-gray-500 text-xs">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── AI Recommendations: For You + Trending ── */}
      <RecommendedProducts title="Discover Products"/>

      {/* ── Categories ── */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
          <Link to="/products" className="text-orange-500 hover:text-orange-600 text-sm font-medium flex items-center gap-1">
            View all <FiArrowRight size={14}/>
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {CATEGORIES.map(({ name, emoji, color }) => (
            <Link key={name} to={`/products?category=${encodeURIComponent(name)}`}
              className={`${color} rounded-2xl py-5 flex flex-col items-center gap-2 hover:opacity-80 hover:scale-105 transition-all cursor-pointer`}>
              <span className="text-3xl">{emoji}</span>
              <span className="text-xs font-semibold">{name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
          <Link to="/products?featured=true" className="text-orange-500 hover:text-orange-600 text-sm font-medium flex items-center gap-1">
            See all <FiArrowRight size={14}/>
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {loading
            ? [...Array(8)].map((_,i) => <ProductCardSkeleton key={i}/>)
            : featured.length === 0
              ? <p className="col-span-4 text-center py-12 text-gray-400">No featured products yet.</p>
              : featured.map(p => <ProductCard key={p._id} product={p}/>)
          }
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-gradient-to-r from-orange-500 to-orange-600 py-14 px-4 text-center">
        <h2 className="text-3xl font-bold text-white mb-3">Start Selling Today</h2>
        <p className="text-orange-100 max-w-xl mx-auto mb-6">
          Join thousands of sellers on ShopZone. Setting up your store takes under 5 minutes.
        </p>
        <Link to="/become-seller" className="bg-white text-orange-500 font-bold px-8 py-3 rounded-full hover:bg-orange-50 transition-all hover:scale-105 inline-flex items-center gap-2">
          Become a Seller <FiArrowRight/>
        </Link>
      </section>
    </div>
  );
}
