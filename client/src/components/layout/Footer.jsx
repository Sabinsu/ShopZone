// client/src/components/layout/Footer.jsx
import { Link } from 'react-router-dom'
import { FiGithub, FiTwitter, FiInstagram, FiHeart } from 'react-icons/fi'

export default function Footer() {
  return (
    <footer style={{ background: 'var(--dark-2)', borderTop: '1px solid var(--dark-5)', marginTop: '5rem' }}>

      {/* Main footer grid */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '4rem 1.25rem 3rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem' }}>

        {/* Brand */}
        <div style={{ gridColumn: 'span 1' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
            <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg,#F0D060,#D4AF37)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Playfair Display",serif', fontWeight: 900, color: '#0A0A0F', fontSize: 17 }}>S</div>
            <span style={{ fontFamily: '"Playfair Display",serif', fontSize: '1.3rem', fontWeight: 800, color: '#F5F0E8' }}>Shop<span style={{ color: 'var(--gold)' }}>Zone</span></span>
          </Link>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-3)', lineHeight: 1.7, maxWidth: 240 }}>
            AI-powered premium ecommerce platform. Discover curated products at unbeatable prices.
          </p>
          <div style={{ display: 'flex', gap: 8, marginTop: '1.25rem' }}>
            {[FiGithub, FiTwitter, FiInstagram].map((Icon, i) => (
              <a key={i} href="#" style={{
                width: 34, height: 34, borderRadius: 9,
                background: 'var(--dark-4)', border: '1px solid var(--dark-5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-3)', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(212,175,55,0.12)'; e.currentTarget.style.color='var(--gold)'; e.currentTarget.style.borderColor='rgba(212,175,55,0.3)' }}
                onMouseLeave={e => { e.currentTarget.style.background='var(--dark-4)'; e.currentTarget.style.color='var(--text-3)'; e.currentTarget.style.borderColor='var(--dark-5)' }}
              >
                <Icon size={14} />
              </a>
            ))}
          </div>
        </div>

        {/* Links columns */}
        {[
          { title: 'Shop', links: [['All Products','/products'],['Featured','/products?isFeatured=true'],['Trending','/products?sort=-sold'],['New Arrivals','/products?sort=-createdAt']] },
          { title: 'Account', links: [['My Profile','/profile'],['My Orders','/orders'],['Cart','/cart'],['Become a Seller','/become-seller']] },
          { title: 'Company', links: [['About Us','/about'],['Blog','#'],['Careers','#'],['Press','#']] },
          { title: 'Support', links: [['Help Center','#'],['Contact Us','#'],['Return Policy','#'],['Shipping Info','#']] },
        ].map(({ title, links }) => (
          <div key={title}>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>{title}</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {links.map(([label, href]) => (
                <li key={label}>
                  <Link to={href} style={{ fontSize: '0.875rem', color: 'var(--text-3)', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.target.style.color = 'var(--text-1)'}
                    onMouseLeave={e => e.target.style.color = 'var(--text-3)'}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid var(--dark-5)', padding: '1.25rem', textAlign: 'center' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
          © {new Date().getFullYear()} ShopZone. Made with <FiHeart size={12} style={{ color: 'var(--gold)' }} /> by Sabin Prasad Subedi &amp; Jeevan Shakya
          <span style={{ color: 'var(--dark-5)' }}>·</span>
          <a href="https://shopzone-api.onrender.com/api/health" target="_blank" rel="noreferrer"
            style={{ color: 'var(--gold)', fontSize: '0.75rem', transition: 'opacity 0.2s' }}>
            API Status
          </a>
        </p>
      </div>
    </footer>
  )
}
