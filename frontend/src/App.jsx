import { BrowserRouter, Routes, Route } from "react-router-dom";

import { SettingsProvider } from "./context/SettingsContext";
import { ProductsProvider } from "./context/ProductsContext";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { ReviewsProvider } from "./context/ReviewsContext";
import RequireAdmin from "./RequireAdmin";
import SiteFooter from "./SiteFooter";

import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Contact from "./pages/Contact";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminAddProduct from "./pages/admin/AdminAddProduct";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminSettings from "./pages/admin/AdminSettings";

function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <ProductsProvider>
          <CartProvider>
            <ReviewsProvider>
              <BrowserRouter>
                <>
                <Routes>
                  {/* Customer site */}
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/contact" element={<Contact />} />

                  {/* Admin panel */}
                  <Route path="/admin" element={<AdminLogin />} />
                  <Route path="/admin/dashboard" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
                  <Route path="/admin/orders" element={<RequireAdmin><AdminOrders /></RequireAdmin>} />
                  <Route path="/admin/products" element={<RequireAdmin><AdminProducts /></RequireAdmin>} />
                  <Route path="/admin/products/new" element={<RequireAdmin><AdminAddProduct /></RequireAdmin>} />
                  <Route path="/admin/products/:id/edit" element={<RequireAdmin><AdminAddProduct /></RequireAdmin>} />
                  <Route path="/admin/settings" element={<RequireAdmin><AdminSettings /></RequireAdmin>} />

                  <Route path="*" element={<Home />} />
                </Routes>
                <SiteFooter />
                </>
              </BrowserRouter>
            </ReviewsProvider>
          </CartProvider>
        </ProductsProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}

export default App;
