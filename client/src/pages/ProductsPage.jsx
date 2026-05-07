// client/src/pages/ProductsPage.jsx
import { useEffect, useState, useCallback } from 'react'
import SEOHead from '../components/SEOHead'
import { useSearchParams } from 'react-router-dom'
import { FiFilter, FiX, FiChevronDown, FiGrid, FiList, FiSearch } from 'react-icons/fi'
import api from '../api/axios'
import ProductCard from '../components/ProductCard'
import { SkeletonCard } from '../components/ui/Skeleton'
import Pagination from '../components/ui/Pagination'

const CATEGORIES = ['Electronics','Fashion','Home & Garden','Sports','Books','Beauty','Toys','Grocery','Other']
const SORTS = [
  { label:'Newest First',   value:'-createdAt' },
  { label:'Price: Low → High', value:'price' },
  { label:'Price: High → Low', value:'-price' },
  { label:'Best Sellers',  value:'-sold' },
  { label:'Top Rated',     value:'-ratings' },
]
const PRICE_RANGES = [
  { label:'Under Rs 5,000',    min:'',    max:'5000' },
  { label:'Rs 5K – 15K',       min:'5000',max:'15000' },
  { label:'Rs 15K – 50K',      min:'15000',max:'50000' },
  { label:'Rs 50K+',           min:'50000',max:'' },
]

const Pill = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{
    padding:'6px 14px', borderRadius:999, fontSize:'0.8rem', fontWeight:600, cursor:'pointer',
    background: active ? 'rgba(212,175,55,0.15)' : 'var(--dark-4)',
    color: active ? 'var(--gold)' : 'var(--text-2)',
    border: `1px solid ${active ? 'rgba(212,175,55,0.3)' : 'var(--dark-5)'}`,
    transition:'all 0.2s', whiteSpace:'nowrap',
  }}>{children}</button>
)

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [total,    setTotal]    = useState(0)
  const [loading,  setLoading]  = useState(true)
  const [showFilter, setShowFilter] = useState(false)

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
      const p = new URLSearchParams()
      if (search)   p.set('search', search)
      if (category) p.set('category', category)
      if (sort)     p.set('sort', sort)
      if (minPrice) p.set('minPrice', minPrice)
      if (maxPrice) p.set('maxPrice', maxPrice)
      p.set('page', page); p.set('limit', LIMIT)
      const { data } = await api.get(`/products?${p}`)
      setProducts(data.products || data)
      setTotal(data.total || (data.products || data).length)
    } catch {}
    finally { setLoading(false) }
  }, [search, category, sort, minPrice, maxPrice, page])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const totalPages = Math.ceil(total / LIMIT)

  const FilterSidebar = () => (
    <aside style={{ width:220, flexShrink:0 }}>
      <div style={{ background:'var(--dark-3)', border:'1px solid var(--dark-5)', borderRadius:18, padding:'1.25rem', position:'sticky', top:86 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem' }}>
          <h3 style={{ fontSize:'0.875rem', fontWeight:700, color:'var(--text-1)' }}>Filters</h3>
          {(category || minPrice || maxPrice || search) && (
            <button onClick={() => setSearchParams({})} style={{ fontSize:'0.7rem', color:'var(--gold)', fontWeight:600, background:'none', border:'none', cursor:'pointer' }}>Clear All</button>
          )}
        </div>

        <div style={{ marginBottom:'1.25rem' }}>
          <p style={{ fontSize:'0.7rem', fontWeight:700, color:'var(--text-3)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'0.75rem' }}>Category</p>
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setParam('category', c === category ? '' : c)} style={{
                textAlign:'left', padding:'7px 10px', borderRadius:8, fontSize:'0.8rem', cursor:'pointer',
                background: category===c ? 'rgba(212,175,55,0.12)' : 'transparent',
                color: category===c ? 'var(--gold)' : 'var(--text-2)',
                border: `1px solid ${category===c ? 'rgba(212,175,55,0.2)' : 'transparent'}`,
                fontWeight: category===c ? 700 : 400, transition:'all 0.15s',
              }}>{c}</button>
            ))}
          </div>
        </div>

        <div>
          <p style={{ fontSize:'0.7rem', fontWeight:700, color:'var(--text-3)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'0.75rem' }}>Price Range</p>
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            {PRICE_RANGES.map(r => {
              const active = minPrice === r.min && maxPrice === r.max
              return (
                <button key={r.label} onClick={() => {
                  if (active) { setParam('minPrice',''); setParam('maxPrice','') }
                  else { const p = new URLSearchParams(searchParams); r.min ? p.set('minPrice',r.min) : p.delete('minPrice'); r.max ? p.set('maxPrice',r.max) : p.delete('maxPrice'); p.set('page','1'); setSearchParams(p) }
                }} style={{
                  textAlign:'left', padding:'7px 10px', borderRadius:8, fontSize:'0.8rem', cursor:'pointer',
                  background: active ? 'rgba(212,175,55,0.12)' : 'transparent',
                  color: active ? 'var(--gold)' : 'var(--text-2)',
                  border: `1px solid ${active ? 'rgba(212,175,55,0.2)' : 'transparent'}`,
                  fontWeight: active ? 700 : 400, transition:'all 0.15s',
                }}>{r.label}</button>
              )
            })}
          </div>
        </div>
      </div>
    </aside>
  )

  return (
    <div style={{ maxWidth:1280, margin:'0 auto', padding:'2rem 1.25rem', minHeight:'100vh' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'1.5rem', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <h1 style={{ fontFamily:'"Playfair Display",serif', fontSize:'clamp(1.4rem,3vw,2rem)', fontWeight:800, color:'var(--text-1)', marginBottom:4 }}>
            {category || search ? (category || `"${search}"`) : 'All Products'}
          </h1>
          {!loading && <p style={{ fontSize:'0.8rem', color:'var(--text-3)' }}>{total.toLocaleString()} products found</p>}
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <div style={{ position:'relative' }}>
            <select value={sort} onChange={e => setParam('sort', e.target.value)} style={{
              background:'var(--dark-3)', border:'1px solid var(--dark-5)', color:'var(--text-1)',
              padding:'9px 32px 9px 12px', borderRadius:10, fontSize:'0.8rem', cursor:'pointer',
              appearance:'none', minWidth:150, outline:'none',
            }}>
              {SORTS.map(s => <option key={s.value} value={s.value} style={{ background:'var(--dark-3)' }}>{s.label}</option>)}
            </select>
            <FiChevronDown style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', color:'var(--text-3)', pointerEvents:'none' }} size={13}/>
          </div>
          <button onClick={() => setShowFilter(!showFilter)} className="btn-ghost md:hidden" style={{ padding:'9px 14px', fontSize:'0.8rem', border:'1px solid var(--dark-5)', borderRadius:10, background:'var(--dark-3)' }}>
            <FiFilter size={14}/> Filters
          </button>
        </div>
      </div>

      {/* Category pills */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:'1.5rem' }}>
        <Pill active={!category} onClick={() => setParam('category','')}>All</Pill>
        {CATEGORIES.map(c => <Pill key={c} active={category===c} onClick={() => setParam('category', c===category ? '' : c)}>{c}</Pill>)}
      </div>

      <div style={{ display:'flex', gap:'1.5rem' }}>
        <div className="hidden md:block"><FilterSidebar/></div>
        {showFilter && <div className="md:hidden"><FilterSidebar/></div>}

        <div style={{ flex:1 }}>
          {loading ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(190px,1fr))', gap:'1.25rem' }}>
              {Array(12).fill(0).map((_,i) => <SkeletonCard key={i}/>)}
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign:'center', padding:'5rem 1rem' }}>
              <div style={{ fontSize:'5rem', marginBottom:'1rem' }}>😕</div>
              <h2 style={{ fontFamily:'"Playfair Display",serif', fontSize:'1.5rem', color:'var(--text-1)', marginBottom:8 }}>No products found</h2>
              <p style={{ color:'var(--text-3)', marginBottom:'1.5rem' }}>Try adjusting your filters</p>
              <button onClick={() => setSearchParams({})} className="btn-primary">Clear Filters</button>
            </div>
          ) : (
            <>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(190px,1fr))', gap:'1.25rem' }}>
                {products.map(p => <ProductCard key={p._id} product={p}/>)}
              </div>
              <Pagination page={page} totalPages={totalPages} onPageChange={(p) => setParam('page', String(p))} loading={loading}/>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
