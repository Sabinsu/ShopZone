# 🚀 ShopZone — AI-Powered Multi-Vendor eCommerce Upgrade Guide

## What's Been Added

| Feature | Status |
|---|---|
| 🔐 JWT Auth + Google OAuth | ✅ Complete |
| 👤 Roles: Admin / Seller / User | ✅ Complete |
| 🏪 Multi-Vendor Seller System | ✅ Complete |
| 🌐 Auto Product Import (Cron) | ✅ Complete |
| 🧠 AI Chatbot (Claude-powered) | ✅ Complete |
| 🤖 AI Product Recommendations | ✅ Complete |
| 🏷️ Founder Section (Sabin & Jeevan) | ✅ Complete |
| ⭐ Reviews & Ratings | ✅ Complete |
| 🔔 Notification System | ✅ Complete |
| 🖼️ Cloudinary Image Upload | ✅ Complete |
| 📊 Admin Analytics Dashboard | ✅ Complete |
| 🔒 Rate Limiting + Helmet | ✅ Complete |
| 📧 Email Notifications | ✅ Complete |
| ❤️ Wishlist | ✅ Complete |

---

## 📁 File Map — What Goes Where

### SERVER FILES (copy to `ecommerce/server/`)

```
server/
├── server.js                    ← REPLACE  (adds helmet, cron, new routes)
├── package.json                 ← REPLACE  (new dependencies)
├── .env.example                 ← REPLACE  (new env vars)
├── models/
│   ├── User.js                  ← REPLACE  (seller role, notifications, wishlist)
│   └── Product.js               ← REPLACE  (seller ref, AI fields, externalId)
├── middleware/
│   ├── authMiddleware.js        ← REPLACE  (adds seller guard)
│   └── rateLimiter.js           ← NEW
├── routes/
│   ├── authRoutes.js            ← REPLACE  (Google OAuth, seller registration, notifications)
│   ├── productRoutes.js         ← REPLACE  (Cloudinary upload, reviews, recommendations)
│   ├── adminRoutes.js           ← REPLACE  (analytics, seller approval)
│   ├── aiRoutes.js              ← NEW      (chatbot + recommendations)
│   └── sellerRoutes.js          ← NEW      (seller dashboard API)
├── jobs/
│   └── importProducts.js        ← NEW      (cron auto-import)
└── utils/
    ├── cloudinary.js            ← NEW
    └── emailService.js          ← NEW
```

### CLIENT FILES (copy to `ecommerce/client/src/`)

```
client/src/
├── main.jsx                               ← REPLACE (adds GoogleOAuthProvider)
├── App.jsx                                ← REPLACE (new routes)
├── context/
│   └── AuthContext.jsx                    ← REPLACE (seller, notifications, Google)
├── components/
│   ├── SellerRoute.jsx                    ← NEW
│   ├── NotificationBell.jsx               ← NEW
│   ├── FounderSection.jsx                 ← NEW
│   └── ai/
│       ├── AIChatbot.jsx                  ← NEW (floating chatbot widget)
│       └── RecommendedProducts.jsx        ← NEW
└── pages/
    ├── LoginPage.jsx                      ← REPLACE (adds Google login)
    ├── AboutPage.jsx                      ← NEW
    ├── seller/
    │   ├── SellerDashboard.jsx            ← NEW
    │   ├── SellerProductForm.jsx          ← NEW (add/edit with Cloudinary)
    │   └── BecomeSeller.jsx               ← NEW
    └── admin/
        └── AdminAnalytics.jsx             ← NEW
```

---

## ⚙️ Step-by-Step Setup

### STEP 1 — Install new server dependencies

```bash
cd ecommerce/server
npm install express-rate-limit helmet node-cron nodemailer streamifier \
            google-auth-library axios
```

### STEP 2 — Install new client dependencies

```bash
cd ecommerce/client
npm install @react-oauth/google
```

### STEP 3 — Copy all upgraded files

Copy each file from this upgrade package to its destination as shown in the File Map above.

### STEP 4 — Configure environment variables

**server/.env** — copy from `.env.example` and fill in:
```env
ANTHROPIC_API_KEY=sk-ant-...        # from console.anthropic.com
GOOGLE_CLIENT_ID=xxxx.apps...       # from Google Cloud Console
CLOUDINARY_CLOUD_NAME=...           # from cloudinary.com
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
SMTP_USER=your@gmail.com            # Gmail with App Password
SMTP_PASS=xxxx xxxx xxxx xxxx
```

**client/.env** — create from `.env.example`:
```env
VITE_GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
```

### STEP 5 — Google OAuth Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID (Web Application)
4. Add Authorized origins: `http://localhost:5173`
5. Add Authorized redirect URIs: `http://localhost:5173`
6. Copy the Client ID to both `GOOGLE_CLIENT_ID` (server) and `VITE_GOOGLE_CLIENT_ID` (client)

### STEP 6 — Cloudinary Setup

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Go to Dashboard → copy Cloud Name, API Key, API Secret
3. Add to server `.env`

### STEP 7 — SMTP (Email) Setup

For Gmail:
1. Enable 2-Factor Authentication
2. Go to Google Account → Security → App Passwords
3. Generate a password for "Mail"
4. Use your Gmail as `SMTP_USER` and the App Password as `SMTP_PASS`

### STEP 8 — Update Navbar to include NotificationBell

In `client/src/components/layout/Navbar.jsx`, add:
```jsx
import NotificationBell from '../NotificationBell'

// Inside the Navbar JSX, near the cart icon:
<NotificationBell />
```

### STEP 9 — Add RecommendedProducts to HomePage

In `client/src/pages/HomePage.jsx`, add:
```jsx
import RecommendedProducts from '../components/ai/RecommendedProducts'

// Inside the return, after the featured products section:
<RecommendedProducts />
```

### STEP 10 — Add FounderSection to HomePage or AboutPage

Already included in `AboutPage.jsx`. To also show on home page:
```jsx
import FounderSection from '../components/FounderSection'
// Add <FounderSection /> at the bottom of HomePage
```

### STEP 11 — Add founder photos (optional)

Place photos at:
- `client/public/founders/sabin.jpg`
- `client/public/founders/jeevan.jpg`

If images aren't provided, initials (SS / JS) will show as a fallback.

### STEP 12 — Run the project

```bash
# Terminal 1 — Backend
cd ecommerce/server
npm run dev

# Terminal 2 — Frontend
cd ecommerce/client
npm run dev
```

---

## 🌐 Auto Product Import

On server start, the cron job automatically:
- Fetches products from FakeStore API (100 products)
- Fetches products from DummyJSON API (100 products)
- Deduplicates using `externalId + externalSrc`
- Categorizes them into your categories
- Re-runs every 6 hours

To run import manually:
```bash
cd ecommerce/server
node jobs/importProducts.js
```

To view import history: `GET /api/admin/import-history` (admin only)

---

## 🧠 AI Chatbot

The chatbot uses the **Anthropic Claude API** by default.
- Requires `ANTHROPIC_API_KEY` in server `.env`
- Rate limited to 10 messages/minute per user
- Automatically loads your top 20 products as context
- To use **OpenAI instead**: swap the axios call in `server/routes/aiRoutes.js`

---

## 👤 User Roles Flow

```
Register → role: 'user'
              ↓
    Apply as Seller → role: 'seller', approved: false
              ↓
    Admin approves → approved: true (email sent)
              ↓
    Seller can add/edit/delete own products
```

Admin can be set manually in MongoDB:
```js
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } })
```

---

## 📊 Admin Dashboard Routes

| Route | Description |
|---|---|
| `/admin` | Main dashboard |
| `/admin/analytics` | Sales analytics + seller approvals |
| `/admin/products` | All products management |
| `/admin/orders` | All orders |
| `/admin/users` | User management |

---

## 🏪 Seller Dashboard Routes

| Route | Description |
|---|---|
| `/become-seller` | Apply to be a seller |
| `/seller` | Seller dashboard + stats |
| `/seller/products/new` | Add new product |
| `/seller/products/edit/:id` | Edit product |

---

## 🔒 Security Checklist

- ✅ Passwords hashed with bcrypt (salt rounds: 10)
- ✅ JWT tokens (30 day expiry)
- ✅ Rate limiting on all API routes (200 req/15min)
- ✅ Stricter rate limiting on auth (20 req/15min)
- ✅ AI endpoint rate limited (10 req/min)
- ✅ Helmet.js security headers
- ✅ CORS restricted to client URL
- ✅ Input validation on all routes
- ✅ Role-based route protection
- ✅ Sellers can only edit their own products
- ✅ Environment variables for all secrets

---

## 🚀 Deployment

### Backend → Railway

1. Push server code to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Add all env vars from `.env` in Railway dashboard
4. Railway auto-detects Node.js and runs `npm start`

### Frontend → Vercel

1. Push client code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project
3. Set framework: Vite
4. Add env var: `VITE_API_URL=https://your-railway-app.up.railway.app/api`
5. Add `VITE_GOOGLE_CLIENT_ID`

### MongoDB → MongoDB Atlas

1. [mongodb.com/atlas](https://mongodb.com/atlas) — free tier works
2. Create cluster → Get connection string
3. Add to `MONGO_URI` in Railway env vars

### After deploying:

Update Google OAuth → Authorized origins with your Vercel domain.

---

## 🔧 Tailwind CSS — add missing utilities to `index.css`

Make sure these utility classes exist in `client/src/index.css`:
```css
@layer components {
  .input  { @apply w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition; }
  .label  { @apply block text-sm font-medium text-gray-700 mb-1; }
  .btn-primary  { @apply bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl transition; }
  .btn-outline  { @apply border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white font-semibold px-5 py-2.5 rounded-xl transition; }
  .spinner { @apply w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin; }
  .badge { @apply text-xs font-semibold px-2.5 py-1 rounded-full; }
}
```

Also add slide-up animation in tailwind.config.js:
```js
theme: {
  extend: {
    keyframes: {
      'slide-up': { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } }
    },
    animation: { 'slide-up': 'slide-up 0.2s ease-out' }
  }
}
```
