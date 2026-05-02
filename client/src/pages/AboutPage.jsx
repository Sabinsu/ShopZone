// client/src/pages/AboutPage.jsx
import { Link } from 'react-router-dom'
export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <span className="text-6xl">🛍️</span>
      <h1 className="text-4xl font-extrabold text-gray-900 mt-4 mb-3">About ShopZone</h1>
      <p className="text-gray-500 text-lg mb-8">
        ShopZone is an AI-powered ecommerce platform built for speed, simplicity, and smart shopping experiences.
        We connect buyers with trusted sellers across Nepal and beyond.
      </p>
      <div className="grid sm:grid-cols-3 gap-6 mb-10">
        {[
          { emoji: '🤖', title: 'AI-Powered', desc: 'Smart recommendations tailored for you' },
          { emoji: '🔒', title: 'Secure',     desc: '100% secure transactions, every time' },
          { emoji: '🚀', title: 'Fast',       desc: 'Lightning-fast delivery nationwide' },
        ].map(f => (
          <div key={f.title} className="card text-center">
            <p className="text-4xl mb-2">{f.emoji}</p>
            <p className="font-bold text-gray-900">{f.title}</p>
            <p className="text-sm text-gray-500 mt-1">{f.desc}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-3 justify-center">
        <Link to="/products" className="btn-primary">Start Shopping</Link>
        <Link to="/become-seller" className="btn-outline">Become a Seller</Link>
      </div>
    </div>
  )
}
