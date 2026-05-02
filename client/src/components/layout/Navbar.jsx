// client/src/components/layout/Navbar.jsx
import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FiShoppingCart, FiUser, FiMenu, FiX, FiSearch, FiPackage, FiLogOut, FiChevronDown, FiLayout } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import toast from 'react-hot-toast'

const S = {
  nav: (scrolled) => ({
    position:'sticky', top:0, zIndex:100,
    background: scrolled ? 'rgba(10,10,15,0.95)' : 'rgba(10,10,15,0.7)',
    backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)',
    borderBottom:`1px solid ${scrolled?'rgba(212,175,55,0.18)':'rgba(255,255,255,0.05)'}`,
    transition:'all 0.35s ease',
    boxShadow: scrolled ? '0 4px 48px rgba(0,0,0,0.6)' : 'none',
  }),
  inner: { maxWidth:1280, margin:'0 auto', padding:'0 1.25rem', display:'flex', alignItems:'center', height:68, gap:'1.25rem' },
  logo:  { display:'flex', alignItems:'center', gap:10, flexShrink:0 },
  logoBox: { width:36, height:36, background:'linear-gradient(135deg,#F0D060,#D4AF37,#A8861A)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:900, color:'#0A0A0F', boxShadow:'0 4px 18px rgba(212,175,55,0.45)', fontFamily:'"Playfair Display",serif' },
  logoText: { fontFamily:'"Playfair Display",serif', fontSize:'1.35rem', fontWeight:800, color:'#F5F0E8', letterSpacing:'-0.02em' },
  right: { marginLeft:'auto', display:'flex', alignItems:'center', gap:6 },
  iconBtn: { display:'flex', alignItems:'center', justifyContent:'center', width:38, height:38, borderRadius:10, background:'transparent', border:'none', cursor:'pointer', color:'#BDB5A6', transition:'all 0.2s' },
  cartBadge: { position:'absolute', top:2, right:2, background:'var(--gold)', color:'#0A0A0F', width:16, height:16, borderRadius:'50%', fontSize:'0.6rem', fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center' },
  avatar: { width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,#F0D060,#D4AF37)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', fontWeight:800, color:'#0A0A0F' },
  dropdown: { position:'absolute', right:0, top:'calc(100% + 8px)', width:205, background:'#1A1A24', border:'1px solid #2C2C3A', borderRadius:16, boxShadow:'0 20px 60px rgba(0,0,0,0.7)', overflow:'hidden', zIndex:200 },
  dropItem: { display:'flex', alignItems:'center', gap:10, padding:'10px 16px', fontSize:'0.875rem', color:'#BDB5A6', cursor:'pointer', transition:'all 0.15s', border:'none', background:'none', width:'100%', textDecoration:'none' },
}

export default function Navbar() {
  const { user, logout, isAdmin, isSeller } = useAuth()
  const { cartCount } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen,   setMobileOpen]   = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchOpen,   setSearchOpen]   = useState(false)
  const [searchQuery,  setSearchQuery]  = useState('')
  const [scrolled,     setScrolled]     = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])
  useEffect(() => {
    const fn = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setUserMenuOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])
  useEffect(() => { setMobileOpen(false); setSearchOpen(false) }, [location.pathname])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) { navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`); setSearchQuery(''); setSearchOpen(false) }
  }
  const handleLogout = () => { logout(); setUserMenuOpen(false); toast.success('See you soon! ✨'); navigate('/') }

  const navLinks = [
    { to:'/products', label:'Shop All' },
    { to:'/products?isFeatured=true', label:'Featured' },
    { to:'/products?sort=-sold', label:'Trending' },
    { to:'/about', label:'About' },
  ]

  return (
    <nav style={S.nav(scrolled)}>
      <div style={S.inner}>
        {/* Logo */}
        <Link to="/" style={S.logo}>
          <div style={S.logoBox}>S</div>
          <span style={S.logoText}>Shop<span style={{color:'var(--gold)'}}>Zone</span></span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex" style={{gap:2}}>
          {navLinks.map(({to, label}) => {
            const active = location.pathname + location.search === to || (location.pathname === to.split('?')[0] && !to.includes('?'))
            return (
              <Link key={to} to={to} style={{
                padding:'6px 13px', borderRadius:8, fontSize:'0.875rem', fontWeight:500,
                color: active ? 'var(--gold)' : '#BDB5A6',
                background: active ? 'rgba(212,175,55,0.1)' : 'transparent',
                transition:'all 0.2s', textDecoration:'none',
              }}>{label}</Link>
            )
          })}
        </div>

        {/* Right actions */}
        <div style={S.right}>
          {/* Search */}
          <button onClick={() => setSearchOpen(s => !s)} style={S.iconBtn}
            onMouseEnter={e=>{e.currentTarget.style.background='var(--dark-4)';e.currentTarget.style.color='#F5F0E8'}}
            onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#BDB5A6'}}>
            <FiSearch size={17}/>
          </button>

          {/* Cart */}
          <Link to="/cart" style={{...S.iconBtn, position:'relative'}}
            onMouseEnter={e=>{e.currentTarget.style.background='var(--dark-4)';e.currentTarget.style.color='#F5F0E8'}}
            onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#BDB5A6'}}>
            <FiShoppingCart size={17}/>
            {cartCount > 0 && <span style={S.cartBadge}>{cartCount > 9 ? '9+' : cartCount}</span>}
          </Link>

          {/* User */}
          {user ? (
            <div ref={menuRef} style={{position:'relative'}} className="hidden md:block">
              <button onClick={() => setUserMenuOpen(s => !s)} style={{
                display:'flex', alignItems:'center', gap:8, padding:'5px 10px 5px 6px',
                background: userMenuOpen ? 'var(--dark-4)' : 'var(--dark-3)',
                border:`1px solid ${userMenuOpen ? 'rgba(212,175,55,0.3)':'var(--dark-5)'}`,
                borderRadius:10, cursor:'pointer', transition:'all 0.2s',
              }}>
                {user.avatar
                  ? <img src={user.avatar} alt="" style={{width:26,height:26,borderRadius:'50%',objectFit:'cover'}}/>
                  : <div style={S.avatar}>{user.name?.charAt(0).toUpperCase()}</div>
                }
                <span style={{fontSize:'0.85rem',fontWeight:500,color:'#F5F0E8',maxWidth:72,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user.name?.split(' ')[0]}</span>
                <FiChevronDown size={12} style={{color:'#7A7268', transition:'transform 0.2s', transform: userMenuOpen?'rotate(180deg)':'none'}}/>
              </button>

              {userMenuOpen && (
                <div style={S.dropdown} className="animate-scale-in">
                  <div style={{padding:'12px 16px', borderBottom:'1px solid var(--dark-5)'}}>
                    <p style={{fontWeight:600,fontSize:'0.875rem',color:'#F5F0E8'}}>{user.name}</p>
                    <p style={{fontSize:'0.7rem',color:'#7A7268',marginTop:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user.email}</p>
                    <span style={{marginTop:6,display:'inline-block'}} className="badge-orange">{user.role}</span>
                  </div>
                  {[
                    {to:'/profile', icon:FiUser,    label:'Profile'},
                    {to:'/orders',  icon:FiPackage, label:'My Orders'},
                    ...(isAdmin  ? [{to:'/admin',  icon:FiLayout, label:'Admin Panel'}]  : []),
                    ...(isSeller ? [{to:'/seller', icon:FiLayout, label:'Seller Panel'}] : []),
                  ].map(({to, icon:Icon, label}) => (
                    <Link key={to} to={to} onClick={()=>setUserMenuOpen(false)} style={S.dropItem}
                      onMouseEnter={e=>{e.currentTarget.style.background='var(--dark-4)';e.currentTarget.style.color='#F5F0E8'}}
                      onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#BDB5A6'}}>
                      <Icon size={14}/> {label}
                    </Link>
                  ))}
                  <div style={{borderTop:'1px solid var(--dark-5)'}}>
                    <button onClick={handleLogout} style={{...S.dropItem, color:'#f87171'}}
                      onMouseEnter={e=>{e.currentTarget.style.background='rgba(248,113,113,0.08)'}}
                      onMouseLeave={e=>{e.currentTarget.style.background='transparent'}}>
                      <FiLogOut size={14}/> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex" style={{gap:8}}>
              <Link to="/login"    className="btn-ghost"   style={{fontSize:'0.85rem',padding:'7px 14px'}}>Login</Link>
              <Link to="/register" className="btn-primary" style={{fontSize:'0.85rem',padding:'8px 18px'}}>Join Free</Link>
            </div>
          )}

          {/* Mobile toggle */}
          <button onClick={()=>setMobileOpen(s=>!s)} style={S.iconBtn} className="md:hidden"
            onMouseEnter={e=>e.currentTarget.style.background='var(--dark-4)'}
            onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
            {mobileOpen ? <FiX size={20}/> : <FiMenu size={20}/>}
          </button>
        </div>
      </div>

      {/* Search bar */}
      {searchOpen && (
        <div style={{borderTop:'1px solid var(--dark-5)', padding:'12px 1.25rem'}} className="animate-slide-down">
          <form onSubmit={handleSearch} style={{position:'relative', maxWidth:600, margin:'0 auto'}}>
            <FiSearch style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',color:'#7A7268',pointerEvents:'none'}} size={16}/>
            <input autoFocus value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
              placeholder="Search for products, brands, categories..." className="input" style={{paddingLeft:44}}/>
          </form>
        </div>
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{background:'var(--dark-2)', borderTop:'1px solid var(--dark-5)', padding:'1rem 1.25rem'}} className="md:hidden animate-slide-down">
          <form onSubmit={handleSearch} style={{marginBottom:'1rem',position:'relative'}}>
            <FiSearch style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'#7A7268'}} size={15}/>
            <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Search..." className="input" style={{paddingLeft:38,fontSize:'0.875rem'}}/>
          </form>
          <div style={{display:'flex',flexDirection:'column',gap:2}}>
            {navLinks.map(({to,label}) => (
              <Link key={to} to={to} style={{padding:'10px 12px',borderRadius:8,fontSize:'0.9rem',color:'#BDB5A6',fontWeight:500}}>{label}</Link>
            ))}
            <div style={{height:1,background:'var(--dark-5)',margin:'8px 0'}}/>
            {user ? (
              <>
                <Link to="/profile" style={{display:'flex',alignItems:'center',gap:8,padding:'10px 12px',fontSize:'0.875rem',color:'#BDB5A6'}}><FiUser size={14}/> Profile</Link>
                <Link to="/orders"  style={{display:'flex',alignItems:'center',gap:8,padding:'10px 12px',fontSize:'0.875rem',color:'#BDB5A6'}}><FiPackage size={14}/> Orders</Link>
                {isAdmin  && <Link to="/admin"  style={{display:'flex',alignItems:'center',gap:8,padding:'10px 12px',fontSize:'0.875rem',color:'var(--gold)'}}><FiLayout size={14}/> Admin</Link>}
                {isSeller && <Link to="/seller" style={{display:'flex',alignItems:'center',gap:8,padding:'10px 12px',fontSize:'0.875rem',color:'var(--gold)'}}><FiLayout size={14}/> Seller</Link>}
                <button onClick={handleLogout} style={{display:'flex',alignItems:'center',gap:8,padding:'10px 12px',fontSize:'0.875rem',color:'#f87171',background:'none',border:'none',cursor:'pointer'}}><FiLogOut size={14}/> Logout</button>
              </>
            ) : (
              <div style={{display:'flex',gap:8,marginTop:4}}>
                <Link to="/login"    className="btn-outline" style={{flex:1,justifyContent:'center',fontSize:'0.875rem'}}>Login</Link>
                <Link to="/register" className="btn-primary" style={{flex:1,justifyContent:'center',fontSize:'0.875rem'}}>Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
