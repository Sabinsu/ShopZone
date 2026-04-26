import { Link } from 'react-router-dom';
import { FiShoppingBag, FiUsers, FiGlobe, FiAward } from 'react-icons/fi';

export default function AboutPage() {
  const stats = [
    { icon: FiUsers,       value: '50K+',  label: 'Happy Customers' },
    { icon: FiShoppingBag, value: '10K+',  label: 'Products Listed' },
    { icon: FiGlobe,       value: '120+',  label: 'Countries Served' },
    { icon: FiAward,       value: '500+',  label: 'Trusted Sellers' },
  ];

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-50 to-white py-16 px-4 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">About ShopZone</h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
          ShopZone is a next-generation multi-vendor marketplace combining powerful AI tools with an intuitive shopping experience. We connect sellers and buyers worldwide.
        </p>
      </section>

      {/* Stats */}
      <section className="max-w-5xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map(({ icon: Icon, value, label }) => (
          <div key={label} className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Icon size={22} className="text-orange-500"/>
            </div>
            <p className="text-3xl font-extrabold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </section>

      {/* Mission */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            We believe commerce should empower everyone — from solo entrepreneurs to enterprise brands. ShopZone provides the tools, reach, and technology to help every seller succeed and every shopper find exactly what they love.
          </p>
          <Link to="/become-seller" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-full inline-flex items-center gap-2 transition-colors">
            Join as a Seller
          </Link>
        </div>
      </section>
    </div>
  );
}
