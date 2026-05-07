// client/src/components/SEOHead.jsx
// Simple SEO helper — updates document.title and meta tags dynamically
import { useEffect } from 'react'

const BASE = 'ShopZone Nepal'

export default function SEOHead({
  title,
  description = 'ShopZone — Nepal\'s premier AI-powered eCommerce platform. Shop electronics, fashion, home goods and more at the best prices.',
  image = 'https://shop-zone-pearl.vercel.app/og-image.png',
  url,
  type = 'website',
}) {
  const fullTitle = title ? `${title} | ${BASE}` : `${BASE} — Shop Smart, Shop Local`

  useEffect(() => {
    // Title
    document.title = fullTitle

    const setMeta = (selector, attr, value) => {
      let el = document.querySelector(selector)
      if (!el) {
        el = document.createElement('meta')
        const [attrName] = selector.match(/\[([^\]]+)=/) || []
        if (attrName) {
          const [, name, val] = attrName.match(/(\w+)="([^"]+)"/) || []
          if (name) el.setAttribute(name, val)
        }
        document.head.appendChild(el)
      }
      el.setAttribute(attr, value)
    }

    // Standard meta
    setMeta('meta[name="description"]', 'content', description)

    // Open Graph
    setMeta('meta[property="og:title"]',       'content', fullTitle)
    setMeta('meta[property="og:description"]',  'content', description)
    setMeta('meta[property="og:image"]',        'content', image)
    setMeta('meta[property="og:url"]',          'content', url || window.location.href)
    setMeta('meta[property="og:type"]',         'content', type)
    setMeta('meta[property="og:site_name"]',    'content', BASE)

    // Twitter Card
    setMeta('meta[name="twitter:card"]',        'content', 'summary_large_image')
    setMeta('meta[name="twitter:title"]',       'content', fullTitle)
    setMeta('meta[name="twitter:description"]', 'content', description)
    setMeta('meta[name="twitter:image"]',       'content', image)

    return () => { document.title = BASE }
  }, [fullTitle, description, image, url, type])

  return null
}
