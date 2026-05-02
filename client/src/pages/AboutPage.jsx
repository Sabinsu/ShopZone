// client/src/pages/AboutPage.jsx
import { Link } from 'react-router-dom'
import { FiLinkedin, FiGithub, FiTwitter, FiArrowRight, FiCode, FiHeart, FiStar, FiTrendingUp, FiUsers, FiShoppingBag } from 'react-icons/fi'

const FOUNDERS = [
  {
    name:    'Sabin Prasad Subedi',
    role:    'Co-Founder & CEO',
    avatar:  'SP',
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
    avatar:  'JS',
    gradient:'linear-gradient(135deg, #00D4AA 0%, #007A63 100%)',
    bio:     'Creative technologist and UI/UX innovator who transforms complex problems into elegant, human-centered solutions. Jeevan architects ShopZone\'s technical foundation, ensuring every interaction feels premium, fast, and intuitive for millions of users.',
    expertise: ['Backend Architecture', 'DevOps & Cloud', 'UI/UX Design', 'Database Engineering'],
    quote:   '"Great products aren\'t built — they\'re crafted with love, code, and obsession."',
    social:  { linkedin: '#', github: '#', twitter: '#' },
    flag:    '🇳🇵',
  },
]

const MILESTONES = [
  { year:'2022', title:'The Idea', desc:'Sabin and Jeevan met at a hackathon in Kathmandu, united by a shared frustration with outdated ecommerce experiences.' },
  { year:'2023', title:'First Build', desc:'Six months of late nights in a tiny office. The first version of ShopZone launched with 200 products and 50 users.' },
  { year:'2024', title:'AI Integration', desc:'Integrated Claude AI for smart recommendations. User engagement tripled. 10,000 products, 100,000 users.' },
  { year:'2025', title:'Going National', desc:'ShopZone became Nepal\'s fastest-growing ecommerce platform. 50,000 products, 2M+ satisfied customers.' },
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

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section style={{
        background: 'radial-gradient(ellipse at 60% 40%, rgba(212,175,55,0.1) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(0,212,170,0.06) 0%, transparent 50%)',
        borderBottom: '1px solid var(--dark-5)',
        padding: 'clamp(4rem,10vw,8rem) 1.25rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Grid pattern */}
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(212,175,55,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.03) 1px, transparent 1px)', backgroundSize:'50px 50px', pointerEvents:'none' }}/>

        <div style={{ maxWidth:800, margin:'0 auto', position:'relative' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(212,175,55,0.1)', border:'1px solid rgba(212,175,55,0.25)', borderRadius:999, padding:'6px 16px', marginBottom:'1.5rem' }}>
            <span style={{ fontSize:'0.75rem', color:'var(--gold)', fontWeight:700, letterSpacing:'0.1em' }}>🇳🇵 PROUDLY NEPALI</span>
          </div>
          <h1 style={{ fontFamily:'"Playfair Display",serif', fontSize:'clamp(2.5rem,6vw,4.5rem)', fontWeight:900, color:'var(--text-1)', lineHeight:1.1, marginBottom:'1.5rem' }}>
            Built with{' '}
            <span style={{ background:'linear-gradient(135deg,#F0D060,#D4AF37,#A8861A)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
              Passion
            </span>
            {', '}
            <br/>
            Powered by Innovation
          </h1>
          <p style={{ fontSize:'1.1rem', color:'var(--text-2)', lineHeight:1.8, maxWidth:600, margin:'0 auto 2.5rem' }}>
            ShopZone is more than an ecommerce platform — it's a mission to democratize commerce in Nepal and connect local sellers with the world.
          </p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <Link to="/products" className="btn-primary" style={{ fontSize:'1rem', padding:'13px 28px' }}>
              Shop Now <FiArrowRight size={15}/>
            </Link>
            <Link to="/become-seller" className="btn-outline" style={{ fontSize:'1rem', padding:'12px 24px' }}>
              <FiShoppingBag size={15}/> Become a Seller
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────────────────── */}
      <section style={{ borderBottom:'1px solid var(--dark-5)', background:'var(--dark-2)' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'2.5rem 1.25rem', display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:'2rem', textAlign:'center' }}>
          {[
            { value:'50,000+', label:'Products', icon:'📦' },
            { value:'2M+',     label:'Customers', icon:'👥' },
            { value:'10,000+', label:'Sellers',   icon:'🏪' },
            { value:'99.9%',   label:'Uptime',    icon:'⚡' },
          ].map(({ value, label, icon }) => (
            <div key={label}>
              <div style={{ fontSize:'2rem', marginBottom:6 }}>{icon}</div>
              <p style={{ fontFamily:'"Space Mono",monospace', fontSize:'1.8rem', fontWeight:700, color:'var(--gold)', lineHeight:1 }}>{value}</p>
              <p style={{ fontSize:'0.8rem', color:'var(--text-3)', marginTop:4, letterSpacing:'0.06em', textTransform:'uppercase', fontWeight:600 }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── OUR STORY ─────────────────────────────────────────────────────────── */}
      <section style={{ maxWidth:900, margin:'0 auto', padding:'5rem 1.25rem' }}>
        <p style={{ fontSize:'0.7rem', fontWeight:700, color:'var(--gold)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:12, textAlign:'center' }}>Our Story</p>
        <h2 style={{ fontFamily:'"Playfair Display",serif', fontSize:'clamp(1.8rem,4vw,3rem)', fontWeight:800, color:'var(--text-1)', textAlign:'center', marginBottom:'1.5rem', lineHeight:1.2 }}>
          From a Kathmandu Hackathon<br/>to Nepal's Leading Platform
        </h2>
        <p style={{ color:'var(--text-2)', lineHeight:1.9, fontSize:'1rem', textAlign:'center', maxWidth:680, margin:'0 auto', marginBottom:'3rem' }}>
          In 2022, two friends with laptops, strong coffee, and a shared dream decided to build something that would change how Nepal shops. What started as a weekend hackathon project became ShopZone — a full-scale AI-powered ecommerce platform serving millions.
        </p>

        {/* Timeline */}
        <div style={{ position:'relative', paddingLeft:'2rem' }}>
          <div style={{ position:'absolute', left:0, top:0, bottom:0, width:2, background:'linear-gradient(180deg, var(--gold) 0%, rgba(212,175,55,0.1) 100%)' }}/>
          {MILESTONES.map(({ year, title, desc }, i) => (
            <div key={year} style={{ position:'relative', marginBottom:'2.5rem', paddingLeft:'1.5rem' }}>
              <div style={{ position:'absolute', left:-10, top:6, width:20, height:20, borderRadius:'50%', background: i===MILESTONES.length-1 ? 'var(--gold)' : 'var(--dark-4)', border:`2px solid ${i===MILESTONES.length-1 ? 'var(--gold)' : 'var(--dark-5)'}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                {i===MILESTONES.length-1 && <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--dark)' }}/>}
              </div>
              <span style={{ fontFamily:'"Space Mono",monospace', fontSize:'0.75rem', color:'var(--gold)', fontWeight:700 }}>{year}</span>
              <h3 style={{ fontFamily:'"Playfair Display",serif', fontSize:'1.2rem', fontWeight:700, color:'var(--text-1)', margin:'4px 0 6px' }}>{title}</h3>
              <p style={{ fontSize:'0.9rem', color:'var(--text-3)', lineHeight:1.7 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOUNDERS ─────────────────────────────────────────────────────────── */}
      <section style={{ borderTop:'1px solid var(--dark-5)', background:'var(--dark-2)', padding:'5rem 1.25rem' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'3.5rem' }}>
            <p style={{ fontSize:'0.7rem', fontWeight:700, color:'var(--gold)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:12 }}>The Team</p>
            <h2 style={{ fontFamily:'"Playfair Display",serif', fontSize:'clamp(1.8rem,4vw,3rem)', fontWeight:800, color:'var(--text-1)' }}>Meet the Founders</h2>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(440px, 1fr))', gap:'2rem' }}>
            {FOUNDERS.map(({ name, role, avatar, gradient, bio, expertise, quote, social, flag }) => (
              <div key={name} style={{ background:'var(--dark-3)', border:'1px solid var(--dark-5)', borderRadius:24, overflow:'hidden', transition:'all 0.35s', position:'relative' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(212,175,55,0.25)'; e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 20px 60px rgba(0,0,0,0.4)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--dark-5)'; e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none' }}
              >
                {/* Top accent line */}
                <div style={{ height:3, background:gradient }}/>

                <div style={{ padding:'2.5rem' }}>
                  <div style={{ display:'flex', gap:'1.5rem', alignItems:'flex-start', marginBottom:'1.5rem' }}>
                    {/* Avatar */}
                    <div style={{ flexShrink:0 }}>
                      <div style={{ width:80, height:80, borderRadius:20, background:gradient, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'"Playfair Display",serif', fontSize:'1.8rem', fontWeight:900, color:'#0A0A0F', boxShadow:`0 8px 32px rgba(0,0,0,0.4)`, position:'relative' }}>
                        {avatar}
                        <span style={{ position:'absolute', bottom:-4, right:-4, fontSize:'1.2rem' }}>{flag}</span>
                      </div>
                    </div>
                    {/* Name & role */}
                    <div>
                      <h3 style={{ fontFamily:'"Playfair Display",serif', fontSize:'1.35rem', fontWeight:800, color:'var(--text-1)', marginBottom:4, lineHeight:1.2 }}>{name}</h3>
                      <p style={{ fontSize:'0.8rem', fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--gold)', marginBottom:'0.75rem' }}>{role}</p>
                      <div style={{ display:'flex', gap:6 }}>
                        {Object.entries(social).map(([platform, url]) => {
                          const icons = { linkedin: FiLinkedin, github: FiGithub, twitter: FiTwitter }
                          const Icon = icons[platform]
                          return (
                            <a key={platform} href={url} style={{ width:28, height:28, borderRadius:7, background:'var(--dark-4)', border:'1px solid var(--dark-5)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-3)', transition:'all 0.2s' }}
                              onMouseEnter={e => { e.currentTarget.style.background='rgba(212,175,55,0.12)'; e.currentTarget.style.color='var(--gold)' }}
                              onMouseLeave={e => { e.currentTarget.style.background='var(--dark-4)'; e.currentTarget.style.color='var(--text-3)' }}
                            ><Icon size={12}/></a>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <p style={{ fontSize:'0.9rem', color:'var(--text-2)', lineHeight:1.8, marginBottom:'1.5rem' }}>{bio}</p>

                  {/* Quote */}
                  <div style={{ background:'var(--dark-4)', border:'1px solid var(--dark-5)', borderLeft:'3px solid var(--gold)', borderRadius:'0 12px 12px 0', padding:'1rem 1.25rem', marginBottom:'1.5rem' }}>
                    <p style={{ fontSize:'0.875rem', color:'var(--text-2)', lineHeight:1.6, fontStyle:'italic' }}>{quote}</p>
                  </div>

                  {/* Expertise tags */}
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {expertise.map(tag => (
                      <span key={tag} style={{ fontSize:'0.7rem', fontWeight:600, padding:'4px 10px', borderRadius:6, background:'var(--dark-4)', color:'var(--text-2)', border:'1px solid var(--dark-5)' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUES ───────────────────────────────────────────────────────────── */}
      <section style={{ maxWidth:1100, margin:'0 auto', padding:'5rem 1.25rem' }}>
        <div style={{ textAlign:'center', marginBottom:'3rem' }}>
          <p style={{ fontSize:'0.7rem', fontWeight:700, color:'var(--gold)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:12 }}>What We Believe</p>
          <h2 style={{ fontFamily:'"Playfair Display",serif', fontSize:'clamp(1.8rem,4vw,3rem)', fontWeight:800, color:'var(--text-1)' }}>Our Core Values</h2>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px,1fr))', gap:'1.25rem' }}>
          {VALUES.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="card-glow" style={{ transition:'transform 0.3s' }}
              onMouseEnter={e => e.currentTarget.style.transform='translateY(-4px)'}
              onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
            >
              <div style={{ width:46, height:46, borderRadius:12, background:`${color}15`, border:`1px solid ${color}30`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'1.25rem' }}>
                <Icon size={20} style={{ color }} />
              </div>
              <h3 style={{ fontFamily:'"Playfair Display",serif', fontSize:'1.1rem', fontWeight:700, color:'var(--text-1)', marginBottom:8 }}>{title}</h3>
              <p style={{ fontSize:'0.875rem', color:'var(--text-3)', lineHeight:1.7 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section style={{ background:'var(--dark-2)', borderTop:'1px solid var(--dark-5)', padding:'4rem 1.25rem', textAlign:'center' }}>
        <div style={{ maxWidth:600, margin:'0 auto' }}>
          <h2 style={{ fontFamily:'"Playfair Display",serif', fontSize:'clamp(1.6rem,3vw,2.5rem)', fontWeight:800, color:'var(--text-1)', marginBottom:'1rem' }}>
            Ready to Join the Revolution?
          </h2>
          <p style={{ color:'var(--text-3)', marginBottom:'2rem' }}>Join over 2 million customers who trust ShopZone for premium shopping.</p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <Link to="/register" className="btn-primary" style={{ fontSize:'1rem', padding:'13px 28px' }}>Create Free Account</Link>
            <Link to="/products" className="btn-outline"  style={{ fontSize:'1rem', padding:'12px 24px' }}>Browse Products</Link>
          </div>
        </div>
      </section>

    </div>
  )
}
