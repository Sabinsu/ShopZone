import { Link } from 'react-router-dom'
import { FiGithub, FiMail, FiMapPin, FiPhone } from 'react-icons/fi'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="text-2xl font-extrabold text-white">
              Shop<span className="text-orange-500">Zone</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed">
              Nepal's AI-powered multi-vendor eCommerce platform. Shop smarter, sell faster.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="mailto:hello@shopzone.com.np" className="hover:text-orange-400 transition-colors"><FiMail size={18}/></a>
              <a href="https://github.com" className="hover:text-orange-400 transition-colors"><FiGithub size={18}/></a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-white font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              {['Electronics','Clothing','Home & Kitchen','Sports','Books'].map(cat => (
                <li key={cat}>
                  <Link to={`/products?category=${encodeURIComponent(cat)}`}
                    className="hover:text-orange-400 transition-colors">{cat}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-white font-semibold mb-4">Account</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label:'My Orders',    to:'/orders' },
                { label:'My Profile',   to:'/profile' },
                { label:'Wishlist',     to:'/profile' },
                { label:'Become Seller',to:'/become-seller' },
                { label:'Seller Dashboard',to:'/seller' },
              ].map(l => (
                <li key={l.label}><Link to={l.to} className="hover:text-orange-400 transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2"><FiMapPin size={14} className="shrink-0 mt-0.5 text-orange-400"/><span>Kathmandu, Nepal</span></li>
              <li className="flex items-center gap-2"><FiPhone size={14} className="text-orange-400"/><span>+977 9800000000</span></li>
              <li className="flex items-center gap-2"><FiMail size={14} className="text-orange-400"/><span>hello@shopzone.com.np</span></li>
            </ul>
            <Link to="/about" className="inline-block mt-4 text-sm text-orange-400 hover:text-orange-300 transition-colors">
              About us →
            </Link>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p>© {new Date().getFullYear()} ShopZone. All rights reserved.</p>
          <p>
            Built with ❤️ by{' '}
            <span className="text-orange-400 font-medium">Sabin Prasad Subedi</span>
            {' '}&{' '}
            <span className="text-orange-400 font-medium">Jeevan Shakya</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
