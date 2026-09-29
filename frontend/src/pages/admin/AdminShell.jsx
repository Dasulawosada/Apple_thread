import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import BackButton from "../../BackButton";

function AdminShell({ active, title, children }) {
  const { adminLogout, user } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    adminLogout();
    navigate("/admin");
  }

  const items = [
    { key: "dashboard", label: "📊 Dashboard & Analytics", to: "/admin/dashboard" },
    { key: "orders", label: "📦 Customer Orders", to: "/admin/orders" },
    { key: "products", label: "🧵 Product Catalog", to: "/admin/products" },
    { key: "add", label: "➕ Add New Product", to: "/admin/products/new" },
    { key: "settings", label: "⚙️ Site Settings", to: "/admin/settings" },
  ];

  return (
    <div className="admin-shell">
      <div className="admin-side">
        <div className="admin-brand">
          <span style={{ fontSize: 20 }}>🧵</span>
          <div>
            <strong>APPLE THREAD</strong>
            <small>CONTROL SUITE</small>
          </div>
        </div>

        <div className="admin-nav-list">
          {items.map((it) => (
            <Link key={it.key} to={it.to} className={`admin-nav-item ${active === it.key ? "on" : ""}`}>
              {it.label}
            </Link>
          ))}
        </div>

        <div style={{ marginTop: "auto", paddingTop: 18, borderTop: "1px solid rgba(255,255,255,0.12)" }}>
          <Link to="/" className="admin-nav-item exit-store">
            ← Return to Store
          </Link>
          <button className="admin-logout" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </div>

      <div className="admin-main">
        <div className="admin-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <BackButton to="/" label="Storefront" />
            <h2 style={{ margin: 0 }}>{title}</h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ textAlign: "right" }}>
              <strong style={{ fontSize: 13, display: "block" }}>{user?.name || "Administrator"}</strong>
              <small style={{ fontSize: 11, color: "var(--gold)" }}>👑 Store Owner / Admin</small>
            </div>
            <div className="circle">{(user?.name || "A")[0].toUpperCase()}</div>
          </div>
        </div>
        <div className="admin-content-inner">
          {children}
        </div>
      </div>
    </div>
  );
}

export default AdminShell;
