import FounderSection from '../components/FounderSection'
import { FiShoppingBag, FiUsers, FiPackage, FiGlobe } from 'react-icons/fi'

const STATS = [
  { icon: FiUsers,      value: '10,000+', label: 'Happy Customers' },
  { icon: FiPackage,    value: '50,000+', label: 'Products Listed' },
  { icon: FiShoppingBag,value: '500+',    label: 'Verified Sellers' },
  { icon: FiGlobe,      value: '20+',     label: 'Cities Served' },
]

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-bold mb-3">About ShopZone</h1>
        <p className="text-gray-400 max-w-xl mx-auto text-lg">
          Nepal's first AI-powered multi-vendor eCommerce platform — built to empower local sellers and delight shoppers.
        </p>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map(s => (
            <div key={s.label}>
              <s.icon className="text-orange-500 text-2xl mx-auto mb-2" />
              <p className="text-3xl font-bold text-gray-900">{s.value}</p>
              <p className="text-gray-500 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Founders */}
      <FounderSection />

      {/* Story */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h2>
          <p className="text-gray-500 leading-relaxed">
            ShopZone was born in Kathmandu in 2024, when two developers realized local sellers had no easy way to reach 
            customers online. Starting with just 10 sellers and 200 products, we've grown into a platform that serves 
            thousands of buyers every day — powered by AI and driven by community.
          </p>
        </div>
      </section>
    </div>
  )
}
