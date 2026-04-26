import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Context
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layout
import Navbar      from './components/layout/Navbar';
import Footer      from './components/layout/Footer';
import ScrollToTop from './components/ScrollToTop';
import AIChatbot   from './components/ai/AIChatbot';

// Route guards
import PrivateRoute from './components/PrivateRoute';
import AdminRoute   from './components/AdminRoute';
import SellerRoute  from './components/SellerRoute';

// Pages — Public
import HomePage         from './pages/HomePage';
import ProductsPage     from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage         from './pages/CartPage';
import LoginPage        from './pages/LoginPage';
import RegisterPage     from './pages/RegisterPage';
import AboutPage        from './pages/AboutPage';
import BecomeSellerPage from './pages/BecomeSellerPage';

// Pages — Protected (user)
import ProfilePage      from './pages/ProfilePage';
import CheckoutPage     from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import OrderDetailPage  from './pages/OrderDetailPage';

// Pages — Admin
import AdminDashboard   from './pages/admin/AdminDashboard';
import AdminProducts    from './pages/admin/AdminProducts';
import AdminOrders      from './pages/admin/AdminOrders';
import AdminUsers       from './pages/admin/AdminUsers';
import AdminAnalytics   from './pages/admin/AdminAnalytics';

// Pages — Seller
import SellerDashboard   from './pages/seller/SellerDashboard';
import SellerProductForm from './pages/seller/SellerProductForm';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <CartProvider>
          <Router>
            <ScrollToTop/>
            <div className="flex flex-col min-h-screen">
              <Navbar/>
              <main className="flex-1">
                <Routes>
                  {/* ── Public ── */}
                  <Route path="/"               element={<HomePage/>}/>
                  <Route path="/products"       element={<ProductsPage/>}/>
                  <Route path="/products/:id"   element={<ProductDetailPage/>}/>
                  <Route path="/cart"           element={<CartPage/>}/>
                  <Route path="/login"          element={<LoginPage/>}/>
                  <Route path="/register"       element={<RegisterPage/>}/>
                  <Route path="/about"          element={<AboutPage/>}/>
                  <Route path="/become-seller"  element={<BecomeSellerPage/>}/>

                  {/* ── Protected (any logged-in user) ── */}
                  <Route path="/profile"        element={<PrivateRoute><ProfilePage/></PrivateRoute>}/>
                  <Route path="/checkout"       element={<PrivateRoute><CheckoutPage/></PrivateRoute>}/>
                  <Route path="/order-success/:id" element={<PrivateRoute><OrderSuccessPage/></PrivateRoute>}/>
                  <Route path="/orders"         element={<PrivateRoute><OrderHistoryPage/></PrivateRoute>}/>
                  <Route path="/orders/:id"     element={<PrivateRoute><OrderDetailPage/></PrivateRoute>}/>

                  {/* ── Admin ── */}
                  <Route path="/admin"          element={<AdminRoute><AdminDashboard/></AdminRoute>}/>
                  <Route path="/admin/products" element={<AdminRoute><AdminProducts/></AdminRoute>}/>
                  <Route path="/admin/orders"   element={<AdminRoute><AdminOrders/></AdminRoute>}/>
                  <Route path="/admin/users"    element={<AdminRoute><AdminUsers/></AdminRoute>}/>
                  <Route path="/admin/analytics"element={<AdminRoute><AdminAnalytics/></AdminRoute>}/>

                  {/* ── Seller ── */}
                  <Route path="/seller"                    element={<SellerRoute><SellerDashboard/></SellerRoute>}/>
                  <Route path="/seller/products"           element={<SellerRoute><AdminProducts/></SellerRoute>}/>
                  <Route path="/seller/products/new"       element={<SellerRoute><SellerProductForm/></SellerRoute>}/>
                  <Route path="/seller/products/edit/:id"  element={<SellerRoute><SellerProductForm/></SellerRoute>}/>

                  {/* ── 404 ── */}
                  <Route path="*" element={
                    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                      <p className="text-6xl">🔍</p>
                      <h1 className="text-2xl font-bold text-gray-900">Page Not Found</h1>
                      <a href="/" className="text-orange-500 hover:text-orange-600 font-medium">← Back to Home</a>
                    </div>
                  }/>
                </Routes>
              </main>
              <Footer/>
              <AIChatbot/>
            </div>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: { borderRadius: '12px', fontSize: '14px' },
                success: { iconTheme: { primary: '#f97316', secondary: 'white' } },
              }}
            />
          </Router>
        </CartProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
