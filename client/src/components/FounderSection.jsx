// Add to HomePage.jsx: import FounderSection from '../components/FounderSection'
// Then place <FounderSection /> near the bottom of the page

const FOUNDERS = [
  {
    name:        'Sabin Prasad Subedi',
    role:        'Founder & CEO',
    description: 'Visionary entrepreneur with a passion for democratizing e-commerce in South Asia. Sabin built ShopZone from the ground up with a mission to empower local sellers and connect them with customers nationwide.',
    avatar:      '/founders/sabin.jpg',   // place your image in client/public/founders/
    linkedin:    '#',
    initials:    'SS',
    color:       'from-orange-400 to-orange-600',
  },
  {
    name:        'Jeevan Shakya',
    role:        'Co-Founder & CTO',
    description: 'Full-stack architect and AI enthusiast who drives ShopZone\'s technology roadmap. Jeevan leads the engineering team in building scalable, AI-powered features that delight both sellers and shoppers.',
    avatar:      '/founders/jeevan.jpg',  // place your image in client/public/founders/
    linkedin:    '#',
    initials:    'JS',
    color:       'from-blue-400 to-blue-600',
  },
]

export default function FounderSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-5xl mx-auto px-4">
        {/* Heading */}
        <div className="text-center mb-14">
          <span className="text-orange-500 font-semibold text-sm uppercase tracking-widest">Our Story</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
            Meet the Founders
          </h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">
            ShopZone was built by two friends who believed every seller deserves a world-class platform.
          </p>
          <div className="w-16 h-1 bg-orange-500 rounded-full mx-auto mt-4" />
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-10">
          {FOUNDERS.map((f) => (
            <div key={f.name}
              className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl border border-gray-100 p-8 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1">
              
              {/* Avatar */}
              <div className={`w-28 h-28 rounded-full bg-gradient-to-br ${f.color} flex items-center justify-center text-white text-3xl font-bold mb-5 shadow-lg overflow-hidden`}>
                <img
                  src={f.avatar}
                  alt={f.name}
                  className="w-full h-full object-cover"
                  onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
                <span style={{ display: 'none' }} className="w-full h-full flex items-center justify-center text-3xl font-bold">
                  {f.initials}
                </span>
              </div>

              {/* Info */}
              <h3 className="text-xl font-bold text-gray-900">{f.name}</h3>
              <span className="mt-1 mb-4 inline-block px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                {f.role}
              </span>
              <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>

              {/* LinkedIn */}
              <a href={f.linkedin} target="_blank" rel="noreferrer"
                className="mt-6 text-sm font-medium text-blue-600 hover:text-blue-800 underline underline-offset-2">
                Connect on LinkedIn →
              </a>
            </div>
          ))}
        </div>

        {/* Mission banner */}
        <div className="mt-14 bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-8 text-center text-white">
          <h3 className="text-xl font-bold mb-2">🚀 Our Mission</h3>
          <p className="text-orange-100 max-w-2xl mx-auto">
            To build the most trusted, AI-powered multi-vendor marketplace in Nepal — 
            where every seller can grow their business and every shopper finds exactly what they need.
          </p>
        </div>
      </div>
    </section>
  )
}
