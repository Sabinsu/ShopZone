// client/src/components/layout/Footer.jsx
import { Link } from 'react-router-dom'
import { FiGithub, FiTwitter, FiInstagram } from 'react-icons/fi'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="flex items-center gap-2 mb-3">
            <span className="text-xl">🛍️</span>
            <span className="text-xl font-extrabold text-white">Shop<span className="text-orange-400">Zone</span></span>
          </Link>
          <p className="text-sm leading-relaxed">Your one-stop AI-powered shopping destination. Fast delivery, great prices.</p>
          <div className="flex gap-3 mt-4">
            {[FiGithub, FiTwitter, FiInstagram].map((Icon, i) => (
              <a key={i} href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all">
                <Icon size={14} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">Shop</h4>
          <ul className="space-y-2 text-sm">
            {['Products', 'New Arrivals', 'Best Sellers', 'Deals'].map(l => (
              <li key={l}><Link to="/products" className="hover:text-orange-400 transition-colors">{l}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">Account</h4>
          <ul className="space-y-2 text-sm">
            {[['My Profile', '/profile'], ['My Orders', '/orders'], ['Cart', '/cart'], ['Become a Seller', '/become-seller']].map(([l, h]) => (
              <li key={l}><Link to={h} className="hover:text-orange-400 transition-colors">{l}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">Help</h4>
          <ul className="space-y-2 text-sm">
            {['FAQ', 'Contact Us', 'Shipping Policy', 'Return Policy'].map(l => (
              <li key={l}><a href="#" className="hover:text-orange-400 transition-colors">{l}</a></li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-600">
        © {new Date().getFullYear()} ShopZone · Built with ❤️ · 
        <a href="https://shopzone-api.onrender.com/api/health" target="_blank" rel="noreferrer" className="ml-1 hover:text-orange-400">API Status</a>
      </div>
    </footer>
  )
}
