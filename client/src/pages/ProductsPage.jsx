import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FiSearch, FiFilter, FiStar, FiShoppingCart, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const CATEGORIES = ['Electronics','Fashion','Home','Sports','Books','Beauty','Jewelry','Automotive','Toys'];
const SORT_OPTIONS = [
  { value: '',           label: 'Default' },
  { value: 'newest',     label: 'Newest' },
  { value: 'price_asc',  label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'rating',     label: 'Top Rated' },
];

export default function ProductsPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [total,    setTotal]    = useState(0);
  const [pages,    setPages]    = useState(1);
  const [loading,  setLoading]  = useState(true);
  const [showFilter, setShowFilter] = useState(false);

  const search   = params.get('search')   || '';
  const category = params.get('category') || '';
  const sort     = params.get('sort')     || '';
  const minPrice = params.get('minPrice') || '';
  const maxPrice = params.get('maxPrice') || '';
  const page     = parseInt(params.get('page') || '1');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ page, limit: 12 });
      if (search)   query.set('search',   search);
      if (category) query.set('category', category);
      if (sort)     query.set('sort',     sort);
      if (minPrice) query.set('minPrice', minPrice);
      if (maxPrice) query.set('maxPrice', maxPrice);
      const { data } = await api.get(`/products?${query}`);
      setProducts(data.products || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch { toast.error('Failed to load products'); }
    finally  { setLoading(false); }
  }, [search, category, sort, minPrice, maxPrice, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const setParam = (key, val) => {
    const next = new URLSearchParams(params);
    if (val) next.set(key, val); else next.delete(key);
    next.delete('page');
    setParams(next);
  };

  const goPage = (p) => {
    const next = new URLSearchParams(params);
    next.set('page', p);
    setParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input
            type="text"
            defaultValue={search}
            onKeyDown={e => { if (e.key === 'Enter') setParam('search', e.target.value); }}
            placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-orange-400"
          />
        </div>
        <select
          value={sort}
          onChange={e => setParam('sort', e.target.value)}
          className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 bg-white"
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button
          onClick={() => setShowFilter(v => !v)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${showFilter ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-700 border-gray-300 hover:border-orange-400'}`}
        >
          <FiFilter size={15}/> Filters
        </button>
      </div>

      {/* Filter panel */}
      {showFilter && (
        <div className="bg-gray-50 rounded-2xl p-5 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Category</label>
            <select
              value={category}
              onChange={e => setParam('category', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm bg-white focus:outline-none"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Min Price</label>
            <input
              type="number" min="0"
              defaultValue={minPrice}
              onBlur={e => setParam('minPrice', e.target.value)}
              placeholder="$0"
              className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Max Price</label>
            <input
              type="number" min="0"
              defaultValue={maxPrice}
              onBlur={e => setParam('maxPrice', e.target.value)}
              placeholder="$9999"
              className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setParams({})}
              className="w-full py-2 text-sm text-orange-500 border border-orange-300 rounded-lg hover:bg-orange-50"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Results info */}
      <p className="text-sm text-gray-500 mb-4">
        {loading ? 'Loading...' : `Showing ${products.length} of ${total} products`}
        {category && <span className="ml-2 bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-xs font-medium">{category}</span>}
      </p>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(12)].map((_, i) => <div key={i} className="bg-gray-100 rounded-2xl h-72 animate-pulse"/>)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-lg font-medium">No products found</p>
          <p className="text-sm mt-1">Try adjusting your filters or search term</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(p => <ProductCard key={p._id} product={p} addToCart={addToCart} navigate={navigate}/>)}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button onClick={() => goPage(page - 1)} disabled={page <= 1} className="p-2 rounded-lg border border-gray-300 disabled:opacity-40 hover:border-orange-400">
            <FiChevronLeft/>
          </button>
          {[...Array(pages)].map((_, i) => {
            const p = i + 1;
            if (p === 1 || p === pages || (p >= page - 1 && p <= page + 1)) {
              return (
                <button key={p} onClick={() => goPage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium border transition-colors ${p === page ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-300 hover:border-orange-400'}`}
                >{p}</button>
              );
            }
            if (p === page - 2 || p === page + 2) return <span key={p} className="px-1 text-gray-400">…</span>;
            return null;
          })}
          <button onClick={() => goPage(page + 1)} disabled={page >= pages} className="p-2 rounded-lg border border-gray-300 disabled:opacity-40 hover:border-orange-400">
            <FiChevronRight/>
          </button>
        </div>
      )}
    </div>
  );
}

function ProductCard({ product, addToCart, navigate }) {
  const img      = product.images?.[0] || 'https://via.placeholder.com/300x300?text=No+Image';
  const discount = product.comparePrice > product.price
    ? Math.round((1 - product.price / product.comparePrice) * 100) : 0;

  return (
    <div
      onClick={() => navigate(`/products/${product._id}`)}
      className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
    >
      <div className="relative bg-gray-50 h-48 overflow-hidden">
        <img src={img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
        {discount > 0 && <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">-{discount}%</span>}
        {product.stock === 0 && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><span className="text-white font-bold text-sm">Out of Stock</span></div>}
      </div>
      <div className="p-3">
        <p className="text-xs text-gray-400 mb-1 capitalize">{product.category}</p>
        <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 mb-2">{product.name}</h3>
        <div className="flex items-center gap-1 mb-3">
          <FiStar size={12} className="text-yellow-400 fill-yellow-400"/>
          <span className="text-xs text-gray-600">{product.ratings?.toFixed(1) || '0.0'}</span>
          <span className="text-xs text-gray-400">({product.numReviews || 0})</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="font-bold text-gray-900">${product.price?.toFixed(2)}</span>
            {discount > 0 && <span className="text-xs text-gray-400 line-through ml-1">${product.comparePrice?.toFixed(2)}</span>}
          </div>
          <button
            onClick={e => { e.stopPropagation(); if (product.stock > 0) { addToCart(product); toast.success('Added to cart!'); } }}
            disabled={product.stock === 0}
            className="w-8 h-8 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition-colors"
          >
            <FiShoppingCart size={14}/>
          </button>
        </div>
      </div>
    </div>
  );
}
