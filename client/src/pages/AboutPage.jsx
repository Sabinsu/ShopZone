// client/src/pages/AboutPage.jsx
import { Link } from 'react-router-dom'
import SEOHead from '../components/SEOHead'
import { FiLinkedin, FiGithub, FiTwitter, FiArrowRight, FiCode, FiHeart, FiStar, FiTrendingUp, FiUsers, FiShoppingBag } from 'react-icons/fi'

const FOUNDERS = [
  {
    name:    'Sabin Prasad Subedi',
    role:    'Founder & CEO',
    photo:   '/founders/sabin.jpeg',
    initials:'SP',
    gradient:'linear-gradient(135deg, #D4AF37 0%, #A8861A 100%)',
    bio:     'Visionary entrepreneur and full-stack architect with a passion for building scalable, AI-powered platforms. Sabin leads product strategy and engineering at ShopZone, driven by the belief that world-class technology should be accessible to everyone in Nepal and beyond.',
    expertise: ['Full-Stack Development', 'AI/ML Integration', 'Product Strategy', 'System Architecture'],
    quote:   '"Technology should empower every Nepali entrepreneur to reach the world."',
    social:  { linkedin: '#', github: '#', twitter: '#' },
    flag:    '🇳🇵',
  },
  {
    name:    'Jeevan Shakya',
    role:    'Co-Founder & CTO',
    photo:   '/founders/jeevan.jpeg',
    initials:'JS',
    gradient:'linear-gradient(135deg, #00D4AA 0%, #007A63 100%)',
    bio:     "Creative technologist and UI/UX innovator who transforms complex problems into elegant, human-centered solutions. Jeevan architects ShopZone's technical foundation, ensuring every interaction feels premium, fast, and intuitive.",
    expertise: ['Backend Architecture', 'DevOps & Cloud', 'UI/UX Design', 'Database Engineering'],
    quote:   '"Great products aren\'t built — they\'re crafted with love, code, and obsession."',
    social:  { linkedin: '#', github: '#', twitter: '#' },
    flag:    '🇳🇵',
  },
]

const MILESTONES = [
  { year:'2022', title:'The Idea', desc:'Sabin and Jeevan met at a hackathon in Kathmandu, united by a shared frustration with outdated ecommerce experiences.' },
  { year:'2023', title:'First Build', desc:'Six months of late nights. The first version of ShopZone launched with 200 products and 50 users.' },
  { year:'2024', title:'AI Integration', desc:'Integrated Claude AI for smart recommendations. User engagement tripled. 10,000 products, 100,000 users.' },
  { year:'2025', title:'Going National', desc:"ShopZone became Nepal's fastest-growing ecommerce platform. 50,000 products, 2M+ satisfied customers." },
]

const VALUES = [
  { icon: FiHeart,       title: 'Customer First',   desc: 'Every decision starts with one question: how does this serve our customer better?', color:'#E91E8C' },
  { icon: FiCode,        title: 'Craft & Quality',  desc: 'We obsess over every pixel and every API call. Mediocrity is not in our vocabulary.', color:'#D4AF37' },
  { icon: FiTrendingUp,  title: 'Bold Innovation',  desc: 'We embrace AI and emerging tech to stay years ahead of the curve.', color:'#00D4AA' },
  { icon: FiUsers,       title: 'Community',        desc: 'ShopZone exists to empower Nepali buyers, sellers, and entrepreneurs.', color:'#4FC3F7' },
]

export default function AboutPage() {
  return (
    <div style={{ background:'var(--dark)', minHeight:'100vh' }}>
    <SEOHead title="About Us" description="Meet the founders of ShopZone Nepal — Sabin Prasad Subedi and Jeevan Shakya. Learn our story, mission and values."/>

      {/* SEO Meta */}
      <title>About Us — ShopZone Nepal</title>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section style={{
        background: 'radial-gradient(ellipse at 60% 40%, rgba(212,175,55,0.1) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(0,212,170,0.06) 0%, transparent 50%)',
        borderBottom: '1px solid var(--dark-5)',
        padding: 'clamp(5rem,10vw,9rem) 1.25rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(212,175,55,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.03) 1px, transparent 1px)', backgroundSize:'50px 50px', pointerEvents:'none' }}/>
        <div style={{ maxWidth:800, margin:'0 auto', position:'relative' }}>
          <span style={{ display:'inline-block', background:'rgba(212,175,55,0.1)', border:'1px solid rgba(212,175,55,0.25)', color:'var(--gold)', padding:'6px 18px', borderRadius:20, fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'1.5rem' }}>
            Our Story
          </span>
          <h1 style={{ fontFamily:'"Playfair Display",serif', fontSize:'clamp(2.5rem,6vw,4.5rem)', fontWeight:900, color:'var(--text-1)', lineHeight:1.1, marginBottom:'1.5rem' }}>
            Built in Nepal,<br/>
            <span style={{ WebkitTextFillColor:'transparent', WebkitBackgroundClip:'text', backgroundClip:'text', background:'linear-gradient(135deg,#F0D060,#D4AF37,#A8861A)' }}>
              For the World
            </span>
          </h1>
          <p style={{ fontSize:'clamp(1rem,2vw,1.2rem)', color:'var(--text-2)', maxWidth:600, margin:'0 auto 2.5rem', lineHeight:1.7 }}>
            ShopZone is Nepal's premier AI-powered eCommerce platform. We're on a mission to connect Nepali buyers and sellers with the world.
          </p>
          <div style={{ display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap' }}>
            <Link to="/products" className="btn-primary" style={{ padding:'14px 28px' }}>
              Shop Now <FiArrowRight size={16}/>
            </Link>
            <Link to="/become-seller" className="btn-outline" style={{ padding:'14px 28px' }}>
              <FiShoppingBag size={16}/> Sell With Us
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOUNDERS ─────────────────────────────────────────────────────────── */}
      <section style={{ padding:'clamp(4rem,8vw,7rem) 1.25rem', maxWidth:1100, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:'3.5rem' }}>
          <p style={{ fontSize:'0.7rem', fontWeight:700, color:'var(--gold)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:10 }}>Meet the Team</p>
          <h2 style={{ fontFamily:'"Playfair Display",serif', fontSize:'clamp(1.8rem,4vw,3rem)', fontWeight:800, color:'var(--text-1)', marginBottom:12 }}>The Founders</h2>
          <p style={{ color:'var(--text-3)', fontSize:'0.95rem', maxWidth:480, margin:'0 auto' }}>Two friends. One vision. Building Nepal's tech future.</p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%, 440px), 1fr))', gap:'2rem' }}>
          {FOUNDERS.map((f) => (
            <div key={f.name} style={{
              background:'var(--dark-3)', border:'1px solid var(--dark-5)',
              borderRadius:28, overflow:'hidden',
              transition:'all 0.4s cubic-bezier(0.16,1,0.3,1)',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-6px)'; e.currentTarget.style.boxShadow='0 20px 60px rgba(0,0,0,0.4)'; e.currentTarget.style.borderColor='rgba(212,175,55,0.2)' }}
              onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderColor='var(--dark-5)' }}
            >
              {/* Photo */}
              <div style={{ position:'relative', aspectRatio:'4/3', overflow:'hidden', background:'var(--dark-4)' }}>
                <img
                  src={f.photo}
                  alt={f.name}
                  style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center top', display:'block' }}
                  onError={e => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
                {/* Fallback avatar */}
                <div style={{ display:'none', alignItems:'center', justifyContent:'center', width:'100%', height:'100%', background:f.gradient, fontSize:'4rem', fontWeight:900, color:'rgba(255,255,255,0.9)', fontFamily:'"Playfair Display",serif', position:'absolute', inset:0 }}>
                  {f.initials}
                </div>
                {/* Gradient overlay */}
                <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'50%', background:'linear-gradient(transparent, var(--dark-3))' }}/>
                {/* Flag */}
                <div style={{ position:'absolute', top:14, right:14, background:'rgba(0,0,0,0.5)', backdropFilter:'blur(8px)', borderRadius:20, padding:'4px 12px', fontSize:'0.85rem' }}>
                  {f.flag}
                </div>
              </div>

              {/* Info */}
              <div style={{ padding:'1.75rem' }}>
                <div style={{ marginBottom:'1rem' }}>
                  <h3 style={{ fontFamily:'"Playfair Display",serif', fontSize:'1.35rem', fontWeight:800, color:'var(--text-1)', marginBottom:4 }}>{f.name}</h3>
                  <p style={{ fontSize:'0.8rem', fontWeight:700, color:'var(--gold)', textTransform:'uppercase', letterSpacing:'0.08em' }}>{f.role}</p>
                </div>

                <p style={{ color:'var(--text-2)', fontSize:'0.875rem', lineHeight:1.7, marginBottom:'1.25rem' }}>{f.bio}</p>

                {/* Quote */}
                <blockquote style={{ borderLeft:'3px solid var(--gold)', paddingLeft:'1rem', marginBottom:'1.25rem', fontStyle:'italic', color:'var(--text-3)', fontSize:'0.85rem', lineHeight:1.6 }}>
                  {f.quote}
                </blockquote>

                {/* Expertise */}
                <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:'1.25rem' }}>
                  {f.expertise.map(s => (
                    <span key={s} style={{ padding:'4px 12px', borderRadius:20, fontSize:'0.72rem', fontWeight:600, background:'rgba(212,175,55,0.08)', color:'var(--gold)', border:'1px solid rgba(212,175,55,0.15)' }}>{s}</span>
                  ))}
                </div>

                {/* Social */}
                <div style={{ display:'flex', gap:10 }}>
                  {[{ icon:FiLinkedin, href:f.social.linkedin }, { icon:FiGithub, href:f.social.github }, { icon:FiTwitter, href:f.social.twitter }].map(({ icon:Icon, href }, i) => (
                    <a key={i} href={href} target="_blank" rel="noreferrer" style={{ width:34, height:34, borderRadius:8, background:'var(--dark-4)', border:'1px solid var(--dark-5)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-3)', transition:'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.background='rgba(212,175,55,0.1)'; e.currentTarget.style.color='var(--gold)'; e.currentTarget.style.borderColor='rgba(212,175,55,0.3)' }}
                      onMouseLeave={e => { e.currentTarget.style.background='var(--dark-4)'; e.currentTarget.style.color='var(--text-3)'; e.currentTarget.style.borderColor='var(--dark-5)' }}>
                      <Icon size={14}/>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── VALUES ──────────────────────────────────────────────────────────── */}
      <section style={{ padding:'clamp(3rem,6vw,6rem) 1.25rem', background:'var(--dark-2)', borderTop:'1px solid var(--dark-5)', borderBottom:'1px solid var(--dark-5)' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'3rem' }}>
            <p style={{ fontSize:'0.7rem', fontWeight:700, color:'var(--gold)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:10 }}>What We Believe</p>
            <h2 style={{ fontFamily:'"Playfair Display",serif', fontSize:'clamp(1.8rem,4vw,2.8rem)', fontWeight:800, color:'var(--text-1)' }}>Our Core Values</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:'1.5rem' }}>
            {VALUES.map(v => (
              <div key={v.title} style={{ background:'var(--dark-3)', border:'1px solid var(--dark-5)', borderRadius:20, padding:'1.75rem', transition:'all 0.3s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor=v.color+'55'; e.currentTarget.style.transform='translateY(-4px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--dark-5)'; e.currentTarget.style.transform='none' }}>
                <div style={{ width:44, height:44, borderRadius:12, background:`${v.color}18`, border:`1px solid ${v.color}33`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'1rem' }}>
                  <v.icon size={20} style={{ color: v.color }}/>
                </div>
                <h3 style={{ fontFamily:'"Playfair Display",serif', fontSize:'1.1rem', fontWeight:700, color:'var(--text-1)', marginBottom:8 }}>{v.title}</h3>
                <p style={{ color:'var(--text-3)', fontSize:'0.875rem', lineHeight:1.6 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIMELINE ─────────────────────────────────────────────────────────── */}
      <section style={{ padding:'clamp(4rem,8vw,7rem) 1.25rem', maxWidth:800, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:'3.5rem' }}>
          <p style={{ fontSize:'0.7rem', fontWeight:700, color:'var(--gold)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:10 }}>Our Journey</p>
          <h2 style={{ fontFamily:'"Playfair Display",serif', fontSize:'clamp(1.8rem,4vw,2.8rem)', fontWeight:800, color:'var(--text-1)' }}>Key Milestones</h2>
        </div>
        <div style={{ position:'relative' }}>
          <div style={{ position:'absolute', left:'50%', top:0, bottom:0, width:2, background:'linear-gradient(var(--gold), var(--dark-5))', transform:'translateX(-50%)', opacity:0.3 }} className="hidden md:block"/>
          {MILESTONES.map((m, i) => (
            <div key={m.year} style={{ display:'flex', gap:'2rem', marginBottom:'2.5rem', alignItems:'flex-start', flexDirection: i % 2 === 0 ? 'row' : 'row-reverse' }} className="md:flex">
              <div style={{ flex:1, textAlign: i % 2 === 0 ? 'right' : 'left' }} className="hidden md:block">
                <span style={{ fontFamily:'"Space Mono",monospace', fontSize:'2rem', fontWeight:700, color:'var(--gold)', opacity:0.4 }}>{m.year}</span>
              </div>
              <div style={{ width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg,var(--gold-light),var(--gold))', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 0 20px rgba(212,175,55,0.4)', zIndex:1 }}>
                <FiStar size={16} style={{ color:'#0A0A0F' }}/>
              </div>
              <div style={{ flex:1, background:'var(--dark-3)', border:'1px solid var(--dark-5)', borderRadius:18, padding:'1.25rem 1.5rem' }}>
                <div className="md:hidden" style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--gold)', marginBottom:4 }}>{m.year}</div>
                <h4 style={{ fontFamily:'"Playfair Display",serif', fontSize:'1.1rem', fontWeight:700, color:'var(--text-1)', marginBottom:6 }}>{m.title}</h4>
                <p style={{ color:'var(--text-3)', fontSize:'0.875rem', lineHeight:1.6 }}>{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section style={{ padding:'clamp(4rem,8vw,6rem) 1.25rem', textAlign:'center', background:'var(--dark-2)', borderTop:'1px solid var(--dark-5)' }}>
        <h2 style={{ fontFamily:'"Playfair Display",serif', fontSize:'clamp(1.6rem,4vw,2.8rem)', fontWeight:800, color:'var(--text-1)', marginBottom:16, maxWidth:600, margin:'0 auto 1rem' }}>
          Ready to Join the ShopZone Family?
        </h2>
        <p style={{ color:'var(--text-3)', marginBottom:'2.5rem', fontSize:'0.95rem' }}>Whether you're a buyer or a seller, there's a place for you here.</p>
        <div style={{ display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap' }}>
          <Link to="/products" className="btn-primary" style={{ padding:'14px 32px' }}>Start Shopping <FiArrowRight size={15}/></Link>
          <Link to="/become-seller" className="btn-outline" style={{ padding:'14px 32px' }}><FiShoppingBag size={15}/> Sell With Us</Link>
        </div>
      </section>
    </div>
  )
}
