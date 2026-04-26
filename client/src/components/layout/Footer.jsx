import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold text-lg">S</div>
              <span className="font-bold text-white text-xl">ShopZone</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Your trusted multi-vendor marketplace. Shop smarter with AI-powered recommendations.
            </p>
            <div className="flex gap-4 mt-5">
              {[FaFacebook, FaTwitter, FaInstagram, FaYoutube].map((Icon, i) => (
                <a key={i} href="#" className="text-gray-400 hover:text-orange-400 transition-colors"><Icon size={18}/></a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              {[['Products', '/products'], ['New Arrivals', '/products?sort=newest'], ['Featured', '/products?featured=true'], ['About Us', '/about']].map(([l, h]) => (
                <li key={l}><Link to={h} className="hover:text-orange-400 transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-semibold text-white mb-4">Account</h4>
            <ul className="space-y-2 text-sm">
              {[['My Profile', '/profile'], ['My Orders', '/orders'], ['Cart', '/cart'], ['Become a Seller', '/become-seller']].map(([l, h]) => (
                <li key={l}><Link to={h} className="hover:text-orange-400 transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3"><FiMapPin className="mt-0.5 shrink-0 text-orange-400"/><span>Kathmandu, Nepal</span></li>
              <li className="flex items-center gap-3"><FiPhone className="shrink-0 text-orange-400"/><span>+977 98XXXXXXXX</span></li>
              <li className="flex items-center gap-3"><FiMail className="shrink-0 text-orange-400"/><a href="mailto:support@shopzone.com" className="hover:text-orange-400 transition-colors">support@shopzone.com</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-500">
          <p>© {year} ShopZone. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-orange-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-orange-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-orange-400 transition-colors">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
