import { Link } from "react-router-dom";
import appleLogo from "./assets/apple-logo.png";
import { useSettings } from "./context/SettingsContext";

export default function SiteFooter() {
  const { settings } = useSettings();

  return (
    <footer className="universal-footer">
      <div className="footer-top-accent"></div>
      <div className="footer-container">
        {/* Brand & Proprietor Card */}
        <div className="footer-col footer-col-brand">
          <Link to="/" className="footer-brand">
            <img src={appleLogo} alt="Apple Thread" className="footer-logo-img" />
            <div>
              <strong className="footer-brand-title">APPLE THREAD</strong>
              <small className="footer-brand-sub">{settings.storeTagline}</small>
            </div>
          </Link>

          <p className="footer-about">
            Sri Lanka’s trusted source for premium sewing, embroidery, and industrial threads.
            Delivering color-fast durability, strength, and vibrant shades island-wide.
          </p>

          <div className="owner-contact-card">
            <div className="owner-badge">Proprietor &amp; Store Management</div>
            <div className="owner-name">{settings.ownerName}</div>
            <div className="owner-details">
              <div className="contact-row">
                <span className="contact-icon">📧</span>
                <a href={`mailto:${settings.ownerEmail}`} className="contact-link">
                  {settings.ownerEmail}
                </a>
              </div>
              <div className="contact-row">
                <span className="contact-icon">📞</span>
                <a href={`tel:${settings.ownerPhone.replace(/[^\d+]/g, "")}`} className="contact-link">
                  {settings.ownerPhone}
                </a>
              </div>
              <div className="contact-row">
                <span className="contact-icon">📍</span>
                <span>Colombo, Sri Lanka · Island-wide Delivery</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-col">
          <h4 className="footer-heading">Collections &amp; Threads</h4>
          <ul className="footer-menu">
            <li><Link to="/products?category=Sewing">Sewing Threads</Link></li>
            <li><Link to="/products?category=Embroidery">Silk Embroidery</Link></li>
            <li><Link to="/products?category=Industrial">Industrial Cones</Link></li>
            <li><Link to="/products?category=Accessories">Tailoring Accessories</Link></li>
            <li><Link to="/products">All Products Catalog</Link></li>
          </ul>
        </div>

        {/* Customer Service */}
        <div className="footer-col">
          <h4 className="footer-heading">Customer Care</h4>
          <ul className="footer-menu">
            <li><Link to="/contact">Help &amp; Contact Us</Link></li>
            <li><Link to="/profile">My Account &amp; Orders</Link></li>
            <li><Link to="/cart">Shopping Cart</Link></li>
            <li><Link to="/checkout">Checkout &amp; Shipping</Link></li>
            <li><span className="footer-info-item">🚚 Island-wide Courier Delivery</span></li>
            <li><span className="footer-info-item">💵 Cash on Delivery Available</span></li>
          </ul>
        </div>

        {/* Store Trust & Portal */}
        <div className="footer-col">
          <h4 className="footer-heading">Business Security</h4>
          <div className="trust-card">
            <div className="trust-item">
              <span className="trust-icon">🛡️</span>
              <div>
                <strong>100% Genuine Quality</strong>
                <p>Color-fast threads tested for durability</p>
              </div>
            </div>
            <div className="trust-item">
              <span className="trust-icon">📦</span>
              <div>
                <strong>Doorstep Delivery</strong>
                <p>Express courier island-wide in 2–4 days</p>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <Link to="/admin" className="footer-staff-btn">
              🔒 Staff / Admin Portal
            </Link>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="footer-bottom-bar">
        <div className="footer-bottom-inner">
          <p>© 2026 Apple Thread Sri Lanka. Owned &amp; Managed by <strong>{settings.ownerName}</strong>. All Rights Reserved.</p>
          <div className="footer-badges">
            <span className="secure-badge">🔒 SSL Secured Checkout</span>
            <span className="secure-badge">COD / Bank Transfer</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
