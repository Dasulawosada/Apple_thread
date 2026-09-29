import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import appleLogo from "./assets/apple-logo.png";
import { useCart } from "./context/CartContext";
import { useAuth } from "./context/AuthContext";
import { useSettings } from "./context/SettingsContext";

function SiteHeader({ active }) {
  const { totalItems } = useCart();
  const { user } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate("/products");
    }
  }

  return (
    <>
      <div className="announcement-bar">
        <div className="header-inner announcement-inner">
          <p>{settings.announcement}</p>
          <div className="announcement-links">
            <Link to="/contact">Help & Support</Link>
            {user ? (
              <>
                <Link to="/profile">Hi, {user.name?.split(" ")[0] || "Account"}</Link>
                {user.role === "admin" && (
                  <Link to="/admin/dashboard" className="admin-badge-top">
                    ⚙️ Admin
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/login?mode=register">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>

      <header className="main-header">
        <div className="header-inner main-header-inner">
          <Link to="/" className="brand-logo">
            <img src={appleLogo} alt="Apple Thread logo" className="brand-mark" />
            <div>
              <strong>APPLE THREAD</strong>
              <small>{settings.storeTagline || "QUALITY THREADS ONLINE"}</small>
            </div>
          </Link>

          <form className="header-search" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Search for threads, colours, brands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" aria-label="Search products">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </form>

          <div className="header-actions">
            <ThemeToggle />
            <Link to={user ? "/profile" : "/login"} className="account-link">
              <span>Account</span>
              <strong>{user ? user.name?.split(" ")[0] : "Login"}</strong>
            </Link>
            <Link to="/cart" className="new-cart-button">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1.4" />
                <circle cx="19" cy="21" r="1.4" />
                <path d="M2.5 3h2l2.6 12.4a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.55L21.5 8H6" />
              </svg>
              <span>Cart</span>
              <b>{totalItems}</b>
            </Link>
          </div>
        </div>
      </header>

      <nav className="main-navigation">
        <div className="header-inner main-nav-inner">
          <Link to="/products" className="all-categories">
            <span className="all-cat-icon">☰</span> All Categories
          </Link>
          <div className="main-nav-links">
            <Link to="/" className={active === "home" ? "on" : ""}>Home</Link>
            <Link to="/products?category=Sewing">Sewing Threads</Link>
            <Link to="/products?category=Embroidery">Embroidery</Link>
            <Link to="/products?category=Industrial">Industrial</Link>
            <Link to="/products?category=Accessories">Accessories</Link>
            <Link to="/products" className={active === "products" ? "on" : ""}>All Threads</Link>
            <Link to="/contact" className={active === "contact" ? "on" : ""}>Contact Us</Link>
          </div>
          {user && user.role === "admin" && (
            <Link to="/admin/dashboard" className="admin-link" title="Open Admin Management Panel">
              🔒 Admin Dashboard
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}

export default SiteHeader;
