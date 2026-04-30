import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FiSearch, FiFilter, FiStar, FiShoppingCart, FiX, FiChevronDown } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { useTracker } from '../hooks/useTracker'
import RecommendationSection from '../components/product/RecommendationSection'
import api  from '../api/axios'
import toast from 'react-hot-toast'

const CATEGORIES = ['Electronics','Clothing','Home & Kitchen','Sports','Books','Accessories','Health & Beauty','Food & Grocery','Footwear','Automotive','Other']
const SORTS = [
  { label:'Newest',         value:'newest' },
  { label:'Price: Low-High',value:'price_asc' },
  { label:'Price: High-Low',value:'price_desc' },
  { label:'Top Rated',      value:'rating' },
]

function ProductCard({ product, onAdd }) {
  const img  = product.images?.[0] || 'https://via.placeholder.com/300'
  const disc = product.comparePrice > product.price
    ? Math.round((1 - product.price / product.comparePrice) * 100) : 0

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden hover:-translate-y-0.5 flex flex-col">
      <Link to={`/products/${product._id}`} className="relative overflow-hidden bg-gray-50 block" style={{aspectRatio:'1/1'}}>
        <img src={img} alt={product.name} loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
        {disc > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">-{disc}%</span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="text-sm font-semibold text-gray-600">Out of Stock</span>
          </div>
        )}
      </Link>
      <div className="p-3 flex flex-col flex-1">
        <p className="text-xs text-gray-400 mb-1 capitalize">{product.category}</p>
        <Link to={`/products/${product._id}`}
          className="font-semibold text-gray-800 text-sm line-clamp-2 hover:text-orange-500 transition-colors flex-1">
          {product.name}
        </Link>
        <div className="flex items-center gap-1 my-1.5">
          <FiStar size={11} className="text-yellow-400 fill-yellow-400"/>
          <span className="text-xs text-gray-500">{product.ratings?.toFixed(1)||'0.0'}</span>
          <span className="text-xs text-gray-300">({product.numReviews||0})</span>
        </div>
        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="font-bold text-gray-900">${product.price?.toFixed(2)}</span>
            {disc > 0 && <span className="text-xs text-gray-400 line-through ml-1">${product.comparePrice?.toFixed(2)}</span>}
          </div>
          <button onClick={() => onAdd(product)} disabled={product.stock === 0}
            className="w-8 h-8 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center disabled:opacity-40 transition-colors">
            <FiShoppingCart size={13}/>
          </button>
        </div>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="bg-gray-200" style={{aspectRatio:'1/1'}}/>
      <div className="p-3 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-1/3"/>
        <div className="h-4 bg-gray-200 rounded w-full"/>
        <div className="h-4 bg-gray-200 rounded w-3/4"/>
        <div className="flex justify-between mt-2">
          <div className="h-5 bg-gray-200 rounded w-1/3"/>
          <div className="w-8 h-8 bg-gray-200 rounded-full"/>
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { addToCart } = useCart()
  const { track }     = useTracker()

  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [page,     setPage]     = useState(1)
  const [pages,    setPages]    = useState(1)
  const [total,    setTotal]    = useState(0)
  const [sidebar,  setSidebar]  = useState(false)

  const [filters, setFilters] = useState({
    search:   searchParams.get('search')   || '',
    category: searchParams.get('category') || '',
    sort:     searchParams.get('sort')     || 'newest',
    minPrice: '',
    maxPrice: '',
  })

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 12, ...filters })
      const { data } = await api.get(`/products?${params}`)
      setProducts(data.products || [])
      setPages(data.pages || 1)
      setTotal(data.total || 0)
    } catch { toast.error('Failed to load products') }
    finally { setLoading(false) }
  }, [page, filters])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const applyFilter = (key, value) => {
    setFilters(f => ({ ...f, [key]: value }))
    setPage(1)
  }

  const clearFilters = () => {
    setFilters({ search:'', category:'', sort:'newest', minPrice:'', maxPrice:'' })
    setPage(1)
  }

  const handleAdd = (product) => {
    addToCart(product)
    toast.success(`${product.name} added to cart!`)
    track('cart', { productId: product._id, category: product.category })
  }

  const hasFilters = filters.search || filters.category || filters.minPrice || filters.maxPrice

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
            <input value={filters.search}
              onChange={e => applyFilter('search', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && e.target.value && track('search', { keyword: e.target.value })}
              placeholder="Search products..."
              className="input pl-9 bg-white"/>
          </div>
          <select value={filters.sort} onChange={e => applyFilter('sort', e.target.value)}
            className="input bg-white w-auto">
            {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <button onClick={() => setSidebar(s => !s)}
            className="flex items-center gap-2 btn-outline py-2.5 sm:hidden">
            <FiFilter size={15}/> Filters
            {hasFilters && <span className="w-5 h-5 bg-orange-500 text-white rounded-full text-xs flex items-center justify-center">!</span>}
          </button>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className={`${sidebar ? 'block' : 'hidden'} sm:block w-56 shrink-0`}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Filters</h3>
                {hasFilters && (
                  <button onClick={clearFilters} className="text-xs text-orange-500 hover:underline flex items-center gap-1">
                    <FiX size={12}/> Clear
                  </button>
                )}
              </div>

              {/* Category */}
              <div className="mb-5">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Category</h4>
                <div className="space-y-1">
                  <button onClick={() => applyFilter('category','')}
                    className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${!filters.category?'bg-orange-50 text-orange-600 font-medium':'text-gray-600 hover:bg-gray-50'}`}>
                    All Categories
                  </button>
                  {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => applyFilter('category', cat)}
                      className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${filters.category===cat?'bg-orange-50 text-orange-600 font-medium':'text-gray-600 hover:bg-gray-50'}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price range */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Price Range</h4>
                <div className="flex gap-2">
                  <input type="number" placeholder="Min" value={filters.minPrice}
                    onChange={e => applyFilter('minPrice', e.target.value)}
                    className="input text-xs p-2"/>
                  <input type="number" placeholder="Max" value={filters.maxPrice}
                    onChange={e => applyFilter('maxPrice', e.target.value)}
                    className="input text-xs p-2"/>
                </div>
              </div>
            </div>
          </aside>

          {/* Products grid */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                {loading ? 'Loading...' : `${total} products found`}
                {filters.category && <span className="ml-2 font-medium text-gray-700">in {filters.category}</span>}
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(12)].map((_,i) => <SkeletonCard key={i}/>)}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-400 text-lg mb-2">No products found</p>
                <button onClick={clearFilters} className="text-orange-500 hover:underline text-sm">Clear filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map(p => <ProductCard key={p._id} product={p} onAdd={handleAdd}/>)}
              </div>
            )}

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm hover:border-orange-400 disabled:opacity-40 bg-white transition-colors">
                  ← Prev
                </button>
                {[...Array(Math.min(pages, 7))].map((_, i) => {
                  const p = i + 1
                  return (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-xl text-sm border transition-colors ${page===p?'bg-orange-500 text-white border-orange-500':'bg-white border-gray-200 hover:border-orange-400'}`}>
                      {p}
                    </button>
                  )
                })}
                <button onClick={() => setPage(p => Math.min(pages, p+1))} disabled={page===pages}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm hover:border-orange-400 disabled:opacity-40 bg-white transition-colors">
                  Next →
                </button>
              </div>
            )}

            {/* Trending at the bottom */}
            <div className="mt-12">
              <RecommendationSection type="trending" limit={4} cols="grid-cols-2 sm:grid-cols-4"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
