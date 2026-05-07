# ShopZone Nepal — v2.1.0 Upgrade Guide

## What Was Upgraded

### ✅ 1. Pagination Fix
- Backend: `getProducts`, `getAllProducts`, `getAllOrders`, `getAllUsers` all return `{ page, pages, total }`
- Frontend: New reusable `<Pagination>` component (`client/src/components/ui/Pagination.jsx`)
- Used in: ProductsPage, AdminProducts, AdminSellers

### ✅ 2. Image Upload System
- Backend: `server/middleware/uploadMiddleware.js` — Multer + Cloudinary support
- Route: `POST /api/upload` (authenticated)
- Admin: `/api/admin/products/upload-image`
- Seller: `/api/seller/upload-image`
- Frontend: `<ImageUpload>` component with drag-and-drop, preview, URL fallback
- Used in: AdminProducts modal, SellerProductForm

### ✅ 3. About Us Page (Real Founder Photos)
- `client/public/founders/sabin.jpeg` — extracted from Word doc
- `client/public/founders/jeevan.jpeg` — extracted from Word doc
- Modern design with timeline, values, social links

### ✅ 4. Homepage Improvement
- Products load immediately via `Promise.all`
- Featured + Popular/Trending sections
- Smooth scroll animations via CSS transitions

### ✅ 5. Seller Approval System
- `sellerInfo.status`: `pending | approved | rejected`
- BecomeSeller → sets `status: pending` (role stays `user`)
- Admin approves → `role: seller`, `status: approved`
- Admin rejects → `status: rejected` with reason
- New page: `/admin/sellers` with Pending/Approved/Rejected tabs
- Middleware blocks unapproved sellers from posting products

### ✅ 6. SEO Optimization
- `index.html`: Full meta tags, OG, Twitter Card
- `client/public/robots.txt`
- `client/public/sitemap.xml`
- `<SEOHead>` component for dynamic page titles/descriptions
- Backend: `/sitemap.xml` and `/robots.txt` endpoints

### ✅ 7. Premium UI/UX
- Hover effects on cards, buttons
- Smooth transitions everywhere
- Upload drag-and-drop zone
- Loading states, skeleton screens

### ✅ 8. Dark Mode / Light Mode
- `ThemeContext` with localStorage persistence
- `ThemeToggle` component (compact icon button in Navbar)
- Full CSS variable system: `[data-theme="dark"]` / `[data-theme="light"]`
- All colors, borders, backgrounds properly themed

---

## Setup Instructions

### Backend (server/)
```bash
cd server
npm install
cp .env.example .env
# Fill in MONGO_URI, JWT_SECRET, etc.
# Optional: Add CLOUDINARY_* vars for cloud image storage
npm run dev
```

### Frontend (client/)
```bash
cd client
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api for local dev
npm run dev
```

### Cloudinary Setup (Optional but Recommended)
1. Create free account at https://cloudinary.com
2. Get Cloud Name, API Key, API Secret from Dashboard
3. Add to `server/.env`:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_key
   CLOUDINARY_API_SECRET=your_secret
   ```
4. Images will auto-upload to Cloudinary; without these, files are saved locally in `server/uploads/`

---

## Deployment

### Vercel (Frontend)
- No changes needed — deploys from `client/`
- Add `VITE_API_URL` in Vercel environment variables

### Render (Backend)
- Updated `render.yaml` includes a 1GB disk mount for local uploads
- Add all env vars in Render dashboard
- Cloudinary recommended for production (disk resets on free tier)
