import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiFilter, FiChevronLeft, FiChevronRight, FiX, FiSliders } from 'react-icons/fi';
import ProductCard, { ProductCardSkeleton } from '../components/ui/ProductCard';
import api from '../api/axios';
import toast from 'react-hot-toast';

const CATEGORIES = ['Electronics','Fashion','Home','Sports','Books','Beauty','Jewelry','Automotive','Toys'];
const SORT_OPTIONS = [
  { value:'',           label:'Default'            },
  { value:'newest',     label:'Newest'             },
  { value:'price_asc',  label:'Price: Low → High'  },
  { value:'price_desc', label:'Price: High → Low'  },
  { value:'rating',     label:'Top Rated'          },
  { value:'popular',    label:'Most Popular'       },
];

export default function ProductsPage() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total,    setTotal]    = useState(0);
  const [pages,    setPages]    = useState(1);
  const [loading,  setLoading]  = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [searchInput, setSearchInput] = useState(params.get('search') || '');

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
    finally { setLoading(false); }
  }, [search, category, sort, minPrice, maxPrice, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const setParam = (key, val) => {
    const next = new URLSearchParams(params);
    val ? next.set(key, val) : next.delete(key);
    next.delete('page');
    setParams(next);
  };

  const goPage = (p) => {
    const next = new URLSearchParams(params);
    next.set('page', p);
    setParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearAll = () => { setParams({}); setSearchInput(''); };
  const activeFilters = [search,category,sort,minPrice,maxPrice].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          {!loading && <p className="text-sm text-gray-500 mt-0.5">{total.toLocaleString()} results{category && ` in ${category}`}</p>}
        </div>
        {activeFilters > 0 && (
          <button onClick={clearAll} className="flex items-center gap-1.5 text-sm text-red-500 border border-red-200 px-3 py-1.5 rounded-xl hover:bg-red-50 transition-colors">
            <FiX size={14}/> Clear filters ({activeFilters})
          </button>
        )}
      </div>

      {/* Search + Sort + Filter toggle */}
      <div className="flex flex-wrap gap-3 mb-5">
        <form className="relative flex-1 min-w-[200px]"
          onSubmit={e => { e.preventDefault(); setParam('search', searchInput); }}>
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15}/>
          <input type="text" value={searchInput} onChange={e => setSearchInput(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white"
          />
          {searchInput && (
            <button type="button" onClick={() => { setSearchInput(''); setParam('search',''); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <FiX size={14}/>
            </button>
          )}
        </form>

        <select value={sort} onChange={e => setParam('sort', e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-orange-400 cursor-pointer">
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <button onClick={() => setShowFilter(v => !v)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${showFilter ? 'bg-orange-500 text-white border-orange-500 shadow-md' : 'bg-white text-gray-700 border-gray-200 hover:border-orange-400'}`}>
          <FiSliders size={15}/> Filters {activeFilters > 0 && <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${showFilter ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-600'}`}>{activeFilters}</span>}
        </button>
      </div>

      {/* Filter panel */}
      {showFilter && (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4 animate-in slide-in-from-top-2">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Category</label>
            <select value={category} onChange={e => setParam('category', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-2.5 py-2 text-sm bg-white focus:outline-none">
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Min Price ($)</label>
            <input type="number" min="0" defaultValue={minPrice}
              onBlur={e => setParam('minPrice', e.target.value)}
              placeholder="0"
              className="w-full border border-gray-200 rounded-xl px-2.5 py-2 text-sm focus:outline-none focus:border-orange-400"/>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Max Price ($)</label>
            <input type="number" min="0" defaultValue={maxPrice}
              onBlur={e => setParam('maxPrice', e.target.value)}
              placeholder="9999"
              className="w-full border border-gray-200 rounded-xl px-2.5 py-2 text-sm focus:outline-none focus:border-orange-400"/>
          </div>
          <div className="flex items-end">
            <button onClick={clearAll}
              className="w-full py-2 text-sm text-orange-500 border border-orange-200 rounded-xl hover:bg-orange-50 transition-colors font-medium">
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Category quick pills */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-5 scrollbar-none">
        <button onClick={() => setParam('category','')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors ${!category ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          All
        </button>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setParam('category', category===c ? '' : c)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors ${category===c ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(12)].map((_,i) => <ProductCardSkeleton key={i}/>)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <p className="text-6xl mb-4">🔍</p>
          <p className="text-lg font-semibold text-gray-600">No products found</p>
          <p className="text-sm mt-1 mb-6">Try different filters or search terms</p>
          <button onClick={clearAll} className="bg-orange-500 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-orange-600 transition-colors">
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(p => <ProductCard key={p._id} product={p}/>)}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button onClick={() => goPage(page-1)} disabled={page<=1}
            className="p-2.5 rounded-xl border border-gray-200 bg-white disabled:opacity-40 hover:border-orange-400 transition-colors">
            <FiChevronLeft size={16}/>
          </button>
          {[...Array(pages)].map((_,i) => {
            const p = i+1;
            if (p===1||p===pages||(p>=page-1&&p<=page+1)) return (
              <button key={p} onClick={() => goPage(p)}
                className={`w-10 h-10 rounded-xl text-sm font-semibold border transition-colors ${p===page ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-200' : 'bg-white border-gray-200 hover:border-orange-400'}`}>
                {p}
              </button>
            );
            if (p===page-2||p===page+2) return <span key={p} className="text-gray-400 px-1">…</span>;
            return null;
          })}
          <button onClick={() => goPage(page+1)} disabled={page>=pages}
            className="p-2.5 rounded-xl border border-gray-200 bg-white disabled:opacity-40 hover:border-orange-400 transition-colors">
            <FiChevronRight size={16}/>
          </button>
        </div>
      )}
    </div>
  );
}
