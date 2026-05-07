// client/src/pages/HomePage.jsx
import { useEffect, useState, useRef } from 'react'
import SEOHead from '../components/SEOHead'
import { Link, useNavigate } from 'react-router-dom'
import { FiArrowRight, FiTruck, FiShield, FiRefreshCw, FiHeadphones, FiStar, FiZap } from 'react-icons/fi'
import api from '../api/axios'
import ProductCard from '../components/ProductCard'
import { useAuth } from '../context/AuthContext'

const CATEGORIES = [
  { name:'Electronics',  emoji:'📱', gradient:'135deg, #1a1a2e 0%, #16213e 100%', accent:'#4FC3F7' },
  { name:'Fashion',      emoji:'👗', gradient:'135deg, #1a1224 0%, #2d1b33 100%', accent:'#E91E8C' },
  { name:'Home & Garden',emoji:'🏡', gradient:'135deg, #0d2018 0%, #1a3a2a 100%', accent:'#00D4AA' },
  { name:'Sports',       emoji:'⚽', gradient:'135deg, #1a1500 0%, #2a2200 100%', accent:'#D4AF37' },
  { name:'Books',        emoji:'📚', gradient:'135deg, #0d0d1a 0%, #1a1a2e 100%', accent:'#9C27B0' },
  { name:'Beauty',       emoji:'💄', gradient:'135deg, #1a0d12 0%, #2d1520 100%', accent:'#FF6B8B' },
  { name:'Toys',         emoji:'🧸', gradient:'135deg, #1a0d00 0%, #2d1800 100%', accent:'#FF8C42' },
  { name:'Grocery',      emoji:'🛒', gradient:'135deg, #0d1a0d 0%, #1a2e1a 100%', accent:'#66BB6A' },
]

const STATS = [
  { value:'50K+', label:'Products' },
  { value:'2M+',  label:'Happy Customers' },
  { value:'99%',  label:'Satisfaction' },
  { value:'24/7', label:'Support' },
]

function SkeletonCard() {
  return (
    <div style={{ background:'var(--dark-3)', border:'1px solid var(--dark-5)', borderRadius:18, overflow:'hidden' }}>
      <div className="skeleton" style={{ aspectRatio:'1', borderRadius:0 }}/>
      <div style={{ padding:'12px 14px' }}>
        <div className="skeleton" style={{ height:10, width:'40%', marginBottom:8 }}/>
        <div className="skeleton" style={{ height:14, width:'85%', marginBottom:6 }}/>
        <div className="skeleton" style={{ height:14, width:'60%', marginBottom:10 }}/>
        <div className="skeleton" style={{ height:18, width:'45%' }}/>
      </div>
    </div>
  )
}

function SectionHeader({ label, title, subtitle }) {
  return (
    <div style={{ marginBottom:'2.5rem' }}>
      <p style={{ fontSize:'0.7rem', fontWeight:700, color:'var(--gold)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:10 }}>{label}</p>
      <h2 style={{ fontFamily:'"Playfair Display",serif', fontSize:'clamp(1.6rem,3vw,2.4rem)', fontWeight:800, color:'var(--text-1)', lineHeight:1.15, marginBottom:8 }}>{title}</h2>
      {subtitle && <p style={{ fontSize:'0.95rem', color:'var(--text-3)', maxWidth:480 }}>{subtitle}</p>}
    </div>
  )
}

export default function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [featured,  setFeatured]  = useState([])
  const [trending,  setTrending]  = useState([])
  const [recs,      setRecs]      = useState([])
  const [loading,   setLoading]   = useState(true)
  const [activeHero, setActiveHero] = useState(0)
  const heroRef = useRef(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [fRes, tRes] = await Promise.all([
          api.get('/products?isFeatured=true&limit=10'),
          api.get('/products?sort=-sold&limit=10'),
        ])
        setFeatured(fRes.data.products || fRes.data)
        setTrending(tRes.data.products || tRes.data)
        if (user?._id) {
          const rRes = await api.get(`/recommendations/${user._id}`)
          setRecs(rRes.data || [])
        }
      } catch {}
      finally { setLoading(false) }
    }
    load()
  }, [user?._id])

  useEffect(() => {
    const t = setInterval(() => setActiveHero(h => (h + 1) % 3), 5000)
    return () => clearInterval(t)
  }, [])

  const HERO_SLIDES = [
    { tag:'AI-Powered Shopping', title:'Discover\nPremium Products', sub:'Curated collections at unbeatable prices with smart AI recommendations', cta:'Shop Now', ctaLink:'/products', emoji:'🛍️', bg:'radial-gradient(ellipse at 70% 50%, rgba(212,175,55,0.12) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(255,107,53,0.08) 0%, transparent 50%), var(--dark)' },
    { tag:'New Collection', title:'Trending\nFashion & Tech', sub:'The latest in electronics, fashion, and lifestyle — all in one place', cta:'Explore Now', ctaLink:'/products?sort=-createdAt', emoji:'✨', bg:'radial-gradient(ellipse at 30% 50%, rgba(233,30,140,0.1) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(212,175,55,0.08) 0%, transparent 50%), var(--dark)' },
    { tag:'Best Deals Today', title:'Up to 60%\nOff Everything', sub:'Flash sales on top brands. Limited time only. Free shipping on Rs 2000+', cta:'Grab Deals', ctaLink:'/products?sort=-sold', emoji:'🔥', bg:'radial-gradient(ellipse at 60% 60%, rgba(0,212,170,0.1) 0%, transparent 60%), radial-gradient(ellipse at 10% 30%, rgba(212,175,55,0.08) 0%, transparent 50%), var(--dark)' },
  ]

  const slide = HERO_SLIDES[activeHero]

  return (
    <div style={{ minHeight:'100vh' }}>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section style={{
        background: slide.bg,
        minHeight: '92vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        transition: 'background 1s ease',
      }}>
        {/* Decorative grid lines */}
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(212,175,55,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.03) 1px, transparent 1px)', backgroundSize:'60px 60px', pointerEvents:'none' }}/>

        {/* Floating orbs */}
        <div style={{ position:'absolute', top:'20%', right:'10%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:'10%', left:'5%', width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle, rgba(255,107,53,0.05) 0%, transparent 70%)', pointerEvents:'none' }}/>

        <div style={{ maxWidth:1280, margin:'0 auto', padding:'6rem 1.25rem', width:'100%', display:'grid', gridTemplateColumns:'1fr auto', alignItems:'center', gap:'4rem' }}>
          <div style={{ maxWidth:680 }}>
            {/* Tag */}
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(212,175,55,0.1)', border:'1px solid rgba(212,175,55,0.25)', borderRadius:999, padding:'6px 14px', marginBottom:'1.5rem' }}>
              <span style={{ width:6, height:6, background:'var(--gold)', borderRadius:'50%', display:'inline-block', animation:'pulseGold 2s infinite' }}/>
              <span style={{ fontSize:'0.75rem', color:'var(--gold)', fontWeight:700, letterSpacing:'0.08em' }}>{slide.tag}</span>
            </div>

            {/* Title */}
            <h1 className="animate-fade-in" style={{ fontFamily:'"Playfair Display",serif', fontSize:'clamp(2.8rem,6vw,5rem)', fontWeight:900, lineHeight:1.08, color:'var(--text-1)', marginBottom:'1.5rem', whiteSpace:'pre-line' }}>
              {slide.title.split('\n')[0]}{'\n'}
              <span style={{ background:'linear-gradient(135deg, var(--gold-light), var(--gold), var(--gold-dark))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                {slide.title.split('\n')[1]}
              </span>
            </h1>

            <p style={{ fontSize:'1.1rem', color:'var(--text-2)', lineHeight:1.7, marginBottom:'2.5rem', maxWidth:540 }}>{slide.sub}</p>

            <div style={{ display:'flex', gap:14, flexWrap:'wrap', alignItems:'center' }}>
              <Link to={slide.ctaLink} className="btn-primary" style={{ fontSize:'1rem', padding:'14px 32px' }}>
                {slide.cta} <FiArrowRight size={16}/>
              </Link>
              <Link to="/products" className="btn-outline" style={{ fontSize:'1rem', padding:'13px 28px' }}>
                Browse All
              </Link>
            </div>

            {/* Stats */}
            <div style={{ display:'flex', gap:'2.5rem', marginTop:'3rem', flexWrap:'wrap' }}>
              {STATS.map(({ value, label }) => (
                <div key={label}>
                  <p style={{ fontFamily:'"Space Mono",monospace', fontSize:'1.4rem', fontWeight:700, color:'var(--gold)', lineHeight:1 }}>{value}</p>
                  <p style={{ fontSize:'0.75rem', color:'var(--text-3)', marginTop:4, letterSpacing:'0.04em' }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hero emoji */}
          <div className="hidden md:flex animate-float" style={{ fontSize:'9rem', userSelect:'none', filter:'drop-shadow(0 0 60px rgba(212,175,55,0.3))' }}>
            {slide.emoji}
          </div>
        </div>

        {/* Hero dots */}
        <div style={{ position:'absolute', bottom:'2rem', left:'50%', transform:'translateX(-50%)', display:'flex', gap:8 }}>
          {HERO_SLIDES.map((_, i) => (
            <button key={i} onClick={()=>setActiveHero(i)} style={{ width: i===activeHero?24:8, height:8, borderRadius:4, background: i===activeHero?'var(--gold)':'var(--dark-5)', border:'none', cursor:'pointer', transition:'all 0.3s' }}/>
          ))}
        </div>
      </section>

      {/* ── FEATURES BAR ────────────────────────────────────────────────────── */}
      <section style={{ background:'var(--dark-2)', borderTop:'1px solid var(--dark-5)', borderBottom:'1px solid var(--dark-5)' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'1.5rem 1.25rem', display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'1.5rem' }}>
          {[
            { icon:FiTruck,      label:'Free Shipping',  sub:'Orders over Rs 2,000',   color:'#D4AF37' },
            { icon:FiShield,     label:'Secure Payment', sub:'100% protected',          color:'#00D4AA' },
            { icon:FiRefreshCw,  label:'Easy Returns',   sub:'7-day hassle-free',       color:'#4FC3F7' },
            { icon:FiHeadphones, label:'24/7 Support',   sub:'Always here to help',     color:'#E91E8C' },
          ].map(({ icon: Icon, label, sub, color }) => (
            <div key={label} style={{ display:'flex', alignItems:'center', gap:12, padding:'8px 0' }}>
              <div style={{ width:40, height:40, borderRadius:10, background:`${color}18`, border:`1px solid ${color}30`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Icon size={17} style={{ color }} />
              </div>
              <div>
                <p style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--text-1)' }}>{label}</p>
                <p style={{ fontSize:'0.75rem', color:'var(--text-3)', marginTop:1 }}>{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ──────────────────────────────────────────────────────── */}
      <section className="section">
        <SectionHeader label="Explore" title="Shop by Category" subtitle="Find exactly what you're looking for across our curated collections" />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(130px, 1fr))', gap:'1rem' }}>
          {CATEGORIES.map(({ name, emoji, gradient, accent }) => (
            <Link key={name} to={`/products?category=${encodeURIComponent(name)}`} style={{
              background: `linear-gradient(${gradient})`,
              border: `1px solid ${accent}20`,
              borderRadius: 16,
              padding: '1.25rem 0.75rem',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
              textDecoration: 'none', transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
              cursor: 'pointer',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px) scale(1.02)'; e.currentTarget.style.borderColor=`${accent}50`; e.currentTarget.style.boxShadow=`0 8px 32px ${accent}15` }}
              onMouseLeave={e => { e.currentTarget.style.transform='translateY(0) scale(1)'; e.currentTarget.style.borderColor=`${accent}20`; e.currentTarget.style.boxShadow='none' }}
            >
              <span style={{ fontSize:'2.2rem' }}>{emoji}</span>
              <span style={{ fontSize:'0.75rem', fontWeight:700, color: accent, textAlign:'center', lineHeight:1.3, letterSpacing:'0.02em' }}>{name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── PROMO BANNERS ─────────────────────────────────────────────────────── */}
      <section className="section" style={{ paddingTop:0 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:'1.25rem' }}>
          {[
            { title:'Electronics\nSale', sub:'Up to 50% off top brands', link:'/products?category=Electronics', emoji:'📱', bg:'linear-gradient(135deg, #0d1a2e 0%, #1a2e4a 100%)', accent:'#4FC3F7', badge:'Limited Time' },
            { title:'Fashion\nWeek', sub:'New arrivals every week', link:'/products?category=Fashion', emoji:'👗', bg:'linear-gradient(135deg, #1a0d1a 0%, #2d1535 100%)', accent:'#E91E8C', badge:'New Arrivals' },
            { title:'Home &\nLiving', sub:'Transform your space', link:'/products?category=Home & Garden', emoji:'🏡', bg:'linear-gradient(135deg, #0a1a12 0%, #0d2a1a 100%)', accent:'#00D4AA', badge:'Best Sellers' },
          ].map(({ title, sub, link, emoji, bg, accent, badge }) => (
            <Link key={title} to={link} style={{
              background: bg, border:`1px solid ${accent}20`,
              borderRadius: 20, padding: '2rem',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              textDecoration: 'none', transition: 'all 0.3s', overflow: 'hidden', position: 'relative',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor=`${accent}40`; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=`0 8px 32px ${accent}15` }}
              onMouseLeave={e => { e.currentTarget.style.borderColor=`${accent}20`; e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none' }}
            >
              <div>
                <span style={{ fontSize:'0.65rem', fontWeight:700, color:accent, letterSpacing:'0.1em', textTransform:'uppercase', display:'block', marginBottom:8 }}>{badge}</span>
                <h3 style={{ fontFamily:'"Playfair Display",serif', fontSize:'1.4rem', fontWeight:800, color:'var(--text-1)', lineHeight:1.2, whiteSpace:'pre-line', marginBottom:8 }}>{title}</h3>
                <p style={{ fontSize:'0.8rem', color:'var(--text-3)', marginBottom:16 }}>{sub}</p>
                <span style={{ fontSize:'0.8rem', fontWeight:700, color:accent, display:'flex', alignItems:'center', gap:4 }}>
                  Shop Now <FiArrowRight size={12}/>
                </span>
              </div>
              <span style={{ fontSize:'4rem', opacity:0.8, marginLeft:'1rem' }}>{emoji}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ────────────────────────────────────────────────── */}
      <section className="section animate-fade-in" style={{ paddingTop:0 }}>
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:'2.5rem' }}>
          <SectionHeader label="Handpicked" title="Featured Products" subtitle="Our top picks — premium quality, amazing value" />
          <Link to="/products?isFeatured=true" className="btn-outline" style={{ fontSize:'0.8rem', padding:'8px 16px', flexShrink:0, marginBottom:'2.5rem' }}>
            View All <FiArrowRight size={12}/>
          </Link>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:'1.25rem' }}>
          {loading
            ? Array(8).fill(0).map((_,i) => <SkeletonCard key={i}/>)
            : featured.length > 0
              ? featured.slice(0,10).map(p => <ProductCard key={p._id} product={p}/>)
              : <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'3rem', color:'var(--text-3)' }}>
                  <p style={{ fontSize:'2rem', marginBottom:8 }}>🛍️</p>
                  <p>No featured products yet — <a href="/products" style={{ color:'var(--gold)' }}>browse all products</a></p>
                </div>
          }
        </div>
      </section>

      {/* ── AI RECOMMENDATIONS ───────────────────────────────────────────────── */}
      {user && recs.length > 0 && (
        <section className="section" style={{ paddingTop:0 }}>
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:'2.5rem' }}>
            <SectionHeader label="AI-Powered" title="Recommended for You" />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:'1.25rem' }}>
            {recs.slice(0,8).map(p => <ProductCard key={p._id} product={p}/>)}
          </div>
        </section>
      )}

      {/* ── TRENDING ─────────────────────────────────────────────────────────── */}
      <section className="section" style={{ paddingTop:0 }}>
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:'2.5rem' }}>
          <SectionHeader label="Hot Right Now" title="🔥 Trending Products" />
          <Link to="/products?sort=-sold" className="btn-outline" style={{ fontSize:'0.8rem', padding:'8px 16px', flexShrink:0, marginBottom:'2.5rem' }}>
            View All <FiArrowRight size={12}/>
          </Link>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:'1.25rem' }}>
          {loading
            ? Array(8).fill(0).map((_,i) => <SkeletonCard key={i}/>)
            : trending.slice(0,10).map(p => <ProductCard key={p._id} product={p}/>)
          }
        </div>
      </section>

      {/* ── NEWSLETTER SECTION ───────────────────────────────────────────────── */}
      <section className="section" style={{ paddingTop:0 }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(212,175,55,0.04) 50%, rgba(255,107,53,0.06) 100%)',
          border: '1px solid rgba(212,175,55,0.2)',
          borderRadius: 28,
          padding: 'clamp(2rem,5vw,4rem)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:600, height:300, background:'radial-gradient(ellipse, rgba(212,175,55,0.06) 0%, transparent 70%)', pointerEvents:'none' }}/>
          <p style={{ fontSize:'0.7rem', fontWeight:700, color:'var(--gold)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:12 }}>Stay Updated</p>
          <h2 style={{ fontFamily:'"Playfair Display",serif', fontSize:'clamp(1.6rem,3vw,2.8rem)', fontWeight:800, color:'var(--text-1)', marginBottom:12, lineHeight:1.2 }}>
            Join 2M+ Smart Shoppers
          </h2>
          <p style={{ color:'var(--text-3)', fontSize:'1rem', marginBottom:'2rem', maxWidth:480, margin:'0 auto 2rem' }}>
            Get exclusive deals, new arrivals, and AI-powered recommendations in your inbox.
          </p>
          <div style={{ display:'flex', gap:10, maxWidth:440, margin:'0 auto', flexWrap:'wrap', justifyContent:'center' }}>
            <input placeholder="Enter your email address" className="input" style={{ flex:1, minWidth:220 }}/>
            <button className="btn-primary" style={{ flexShrink:0 }}>Subscribe <FiArrowRight size={14}/></button>
          </div>
          <p style={{ fontSize:'0.72rem', color:'var(--text-3)', marginTop:12 }}>No spam. Unsubscribe anytime. Free forever.</p>
        </div>
      </section>

    </div>
  )
}
