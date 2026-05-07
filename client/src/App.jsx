// client/src/App.jsx  ← REPLACE existing file
import { Routes, Route } from 'react-router-dom'
import Navbar      from './components/layout/Navbar'
import Footer      from './components/layout/Footer'
import ScrollToTop from './components/ScrollToTop'
import AIChatbot   from './components/ai/AIChatbot'

// Public pages
import HomePage          from './pages/HomePage'
import ProductsPage      from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage          from './pages/CartPage'
import LoginPage         from './pages/LoginPage'
import RegisterPage      from './pages/RegisterPage'
import AboutPage         from './pages/AboutPage'

// Auth-protected pages
import CheckoutPage     from './pages/CheckoutPage'
import OrderSuccessPage from './pages/OrderSuccessPage'
import OrderHistoryPage from './pages/OrderHistoryPage'
import OrderDetailPage  from './pages/OrderDetailPage'
import ProfilePage      from './pages/ProfilePage'

// Admin pages
import AdminDashboard  from './pages/admin/AdminDashboard'
import AdminProducts   from './pages/admin/AdminProducts'
import AdminOrders     from './pages/admin/AdminOrders'
import AdminUsers      from './pages/admin/AdminUsers'
import AdminAnalytics  from './pages/admin/AdminAnalytics'
import AdminSellers    from './pages/admin/AdminSellers'

// Seller pages
import SellerDashboard  from './pages/seller/SellerDashboard'
import SellerProductForm from './pages/seller/SellerProductForm'
import BecomeSeller     from './pages/seller/BecomeSeller'

// Route guards
import PrivateRoute from './components/PrivateRoute'
import AdminRoute   from './components/AdminRoute'
import SellerRoute  from './components/SellerRoute'

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main className="min-h-screen">
        <Routes>
          {/* ── Public ── */}
          <Route path="/"             element={<HomePage />} />
          <Route path="/products"     element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart"         element={<CartPage />} />
          <Route path="/login"        element={<LoginPage />} />
          <Route path="/register"     element={<RegisterPage />} />
          <Route path="/about"        element={<AboutPage />} />
          <Route path="/become-seller" element={<PrivateRoute><BecomeSeller /></PrivateRoute>} />

          {/* ── Private ── */}
          <Route path="/checkout"          element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
          <Route path="/order-success/:id" element={<PrivateRoute><OrderSuccessPage /></PrivateRoute>} />
          <Route path="/orders"            element={<PrivateRoute><OrderHistoryPage /></PrivateRoute>} />
          <Route path="/orders/:id"        element={<PrivateRoute><OrderDetailPage /></PrivateRoute>} />
          <Route path="/profile"           element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

          {/* ── Seller ── */}
          <Route path="/seller"                   element={<SellerRoute><SellerDashboard /></SellerRoute>} />
          <Route path="/seller/products/new"      element={<SellerRoute><SellerProductForm /></SellerRoute>} />
          <Route path="/seller/products/edit/:id" element={<SellerRoute><SellerProductForm /></SellerRoute>} />

          {/* ── Admin ── */}
          <Route path="/admin"           element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
          <Route path="/admin/products"  element={<AdminRoute><AdminProducts /></AdminRoute>} />
          <Route path="/admin/orders"    element={<AdminRoute><AdminOrders /></AdminRoute>} />
          <Route path="/admin/users"     element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/sellers"   element={<AdminRoute><AdminSellers /></AdminRoute>} />

          {/* ── 404 ── */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center text-center px-4">
              <div>
                <h1 className="text-8xl font-extrabold text-gray-100">404</h1>
                <p className="text-gray-500 mt-2 text-lg">Page not found</p>
                <a href="/" className="mt-6 inline-block btn-primary">← Go Home</a>
              </div>
            </div>
          } />
        </Routes>
      </main>
      <Footer />
      <AIChatbot />
    </>
  )
}
