// client/src/pages/ProductsPage.jsx  ← REPLACE
import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FiFilter, FiX, FiChevronDown } from 'react-icons/fi'
import api from '../api/axios'
import ProductCard from '../components/ProductCard'
import { SkeletonCard } from '../components/ui/Skeleton'

const CATEGORIES = ['Electronics','Fashion','Home & Garden','Sports','Books','Beauty','Toys','Grocery','Other']
const SORTS = [
  { label: 'Newest',        value: '-createdAt' },
  { label: 'Price: Low',    value: 'price' },
  { label: 'Price: High',   value: '-price' },
  { label: 'Best Seller',   value: '-sold' },
  { label: 'Top Rated',     value: '-ratings' },
]

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [products, setProducts] = useState([])
  const [total,    setTotal]    = useState(0)
  const [loading,  setLoading]  = useState(true)
  const [showFilter, setShowFilter] = useState(false)

  // Filter state derived from URL params
  const search   = searchParams.get('search')   || ''
  const category = searchParams.get('category') || ''
  const sort     = searchParams.get('sort')     || '-createdAt'
  const minPrice = searchParams.get('minPrice') || ''
  const maxPrice = searchParams.get('maxPrice') || ''
  const page     = parseInt(searchParams.get('page') || '1')
  const LIMIT    = 20

  const setParam = (key, val) => {
    const p = new URLSearchParams(searchParams)
    if (val) p.set(key, val); else p.delete(key)
    p.set('page', '1')
    setSearchParams(p)
  }

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search)   params.set('search',   search)
      if (category) params.set('category', category)
      if (sort)     params.set('sort',     sort)
      if (minPrice) params.set('minPrice', minPrice)
      if (maxPrice) params.set('maxPrice', maxPrice)
      params.set('page',  page)
      params.set('limit', LIMIT)
      const { data } = await api.get(`/products?${params}`)
      setProducts(data.products || data)
      setTotal(data.total || (data.products || data).length)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [search, category, sort, minPrice, maxPrice, page])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {category ? `${category}` : search ? `Results for "${search}"` : 'All Products'}
          </h1>
          {!loading && <p className="text-sm text-gray-400 mt-0.5">{total.toLocaleString()} products found</p>}
        </div>
        <div className="flex items-center gap-3">
          {/* Sort */}
          <div className="relative">
            <select
              value={sort}
              onChange={e => setParam('sort', e.target.value)}
              className="input py-2 pr-8 text-sm appearance-none cursor-pointer min-w-[140px]"
            >
              {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14}/>
          </div>
          {/* Filter toggle (mobile) */}
          <button onClick={() => setShowFilter(!showFilter)} className="btn-outline py-2 px-4 text-sm md:hidden">
            <FiFilter size={14}/> Filters
          </button>
        </div>
      </div>

      <div className="flex gap-6">

        {/* Sidebar filters */}
        <aside className={`w-56 flex-shrink-0 space-y-6 ${showFilter ? 'block' : 'hidden md:block'}`}>
          {/* Categories */}
          <div className="card-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-gray-800">Category</h3>
              {category && <button onClick={() => setParam('category', '')} className="text-xs text-orange-500"><FiX size={12}/></button>}
            </div>
            <div className="space-y-1">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setParam('category', c === category ? '' : c)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    category === c ? 'bg-orange-500 text-white font-medium' : 'hover:bg-orange-50 text-gray-700'
                  }`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Price range */}
          <div className="card-sm">
            <h3 className="font-semibold text-sm text-gray-800 mb-3">Price Range</h3>
            <div className="space-y-2">
              <input type="number" placeholder="Min price" value={minPrice}
                onChange={e => setParam('minPrice', e.target.value)}
                className="input py-2 text-sm" />
              <input type="number" placeholder="Max price" value={maxPrice}
                onChange={e => setParam('maxPrice', e.target.value)}
                className="input py-2 text-sm" />
            </div>
          </div>

          {/* Clear filters */}
          {(category || minPrice || maxPrice || search) && (
            <button onClick={() => setSearchParams({})} className="btn-outline w-full py-2 text-sm">
              Clear All Filters
            </button>
          )}
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array(12).fill(0).map((_, i) => <SkeletonCard key={i}/>)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-6xl">😕</span>
              <p className="text-gray-500 mt-4 text-lg font-medium">No products found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map(p => <ProductCard key={p._id} product={p}/>)}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    disabled={page <= 1}
                    onClick={() => setParam('page', String(page - 1))}
                    className="btn-ghost px-4 py-2 text-sm disabled:opacity-40">← Prev</button>

                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    const p2 = i + 1
                    return (
                      <button key={p2}
                        onClick={() => setParam('page', String(p2))}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                          p2 === page ? 'bg-orange-500 text-white' : 'hover:bg-gray-100 text-gray-700'
                        }`}>{p2}</button>
                    )
                  })}

                  <button
                    disabled={page >= totalPages}
                    onClick={() => setParam('page', String(page + 1))}
                    className="btn-ghost px-4 py-2 text-sm disabled:opacity-40">Next →</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
