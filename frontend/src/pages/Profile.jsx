import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";
import SiteHeader from "../SiteHeader";
import BackButton from "../BackButton";
import { useAuth } from "../context/AuthContext";
import { api, getImageUrl } from "../api/client";

function Profile() {
  const { user, logout, updateAccount } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("orders"); // "orders" | "account" | "addresses"
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  // Account details form state
  const [accountForm, setAccountForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    currentPassword: "",
    newPassword: "",
  });
  const [accountSavedMsg, setAccountSavedMsg] = useState("");
  const [accountError, setAccountError] = useState("");
  const [savingAccount, setSavingAccount] = useState(false);

  // Saved Delivery Addresses state
  const addressesKey = `apple-thread-addresses_${user?.id || "guest"}`;
  const [addresses, setAddresses] = useState(() => {
    try {
      const raw = localStorage.getItem(addressesKey);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error("Could not load addresses", e);
    }
    return [];
  });

  const [showAddAddress, setShowAddAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressError, setAddressError] = useState("");
  const [newAddr, setNewAddr] = useState({
    label: "Home",
    name: user?.name || "",
    phone: "",
    street: "",
    city: "",
    postal: "",
    isDefault: false,
  });

  useEffect(() => {
    setAccountForm((current) => ({
      ...current,
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    }));
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(addressesKey, JSON.stringify(addresses));
    } catch (e) {
      console.error("Could not save addresses", e);
    }
  }, [addresses, addressesKey]);

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoadingOrders(true);
        const data = await api.getOrders(user?.email);
        setOrders(data);
      } catch (err) {
        console.error("Failed to fetch user orders:", err);
      } finally {
        setLoadingOrders(false);
      }
    }
    loadOrders();
  }, [user]);

  function handleLogout() {
    logout();
    navigate("/");
  }

  async function handleSaveAccount(e) {
    e.preventDefault();
    setAccountError("");
    setAccountSavedMsg("");
    if (!user) {
      setAccountError("Please log in before updating your account details.");
      return;
    }

    setSavingAccount(true);
    try {
      await updateAccount({
        name: accountForm.name,
        email: accountForm.email,
        phone: accountForm.phone,
        currentPassword: accountForm.currentPassword,
        newPassword: accountForm.newPassword,
      });
      setAccountForm((current) => ({ ...current, currentPassword: "", newPassword: "" }));
      setAccountSavedMsg("Account details updated successfully!");
      setTimeout(() => setAccountSavedMsg(""), 3500);
    } catch (err) {
      setAccountError(err.message || "Could not update your account details.");
    } finally {
      setSavingAccount(false);
    }
  }

  function handleAddAddress(e) {
    e.preventDefault();
    if (!newAddr.name.trim() || !newAddr.phone.trim() || !newAddr.street.trim() || !newAddr.city.trim()) {
      setAddressError("Please complete the recipient, phone, street, and city fields.");
      return;
    }
    setAddressError("");

    let updated;
    if (editingAddressId) {
      updated = addresses.map((address) => ({
        ...address,
        ...(address.id === editingAddressId ? newAddr : {}),
        isDefault: newAddr.isDefault ? address.id === editingAddressId : address.isDefault,
      }));
    } else {
      const created = {
        id: "addr-" + Date.now(),
        ...newAddr,
        isDefault: newAddr.isDefault || addresses.length === 0,
      };
      updated = [...addresses, created];
      if (created.isDefault) {
        updated = updated.map((address) => ({ ...address, isDefault: address.id === created.id }));
      }
    }
    setAddresses(updated);
    setShowAddAddress(false);
    setEditingAddressId(null);
    setNewAddr({ label: "Office", name: user?.name || "", phone: "", street: "", city: "", postal: "", isDefault: false });
  }

  function handleEditAddress(address) {
    setEditingAddressId(address.id);
    setNewAddr({
      label: address.label,
      name: address.name,
      phone: address.phone,
      street: address.street,
      city: address.city,
      postal: address.postal,
      isDefault: address.isDefault,
    });
    setShowAddAddress(true);
  }

  function handleDeleteAddress(id) {
    if (window.confirm("Are you sure you want to delete this delivery address?")) {
      const remaining = addresses.filter((address) => address.id !== id);
      if (addresses.find((address) => address.id === id)?.isDefault && remaining.length > 0) {
        remaining[0].isDefault = true;
      }
      setAddresses(remaining);
    }
  }

  function handleSetDefaultAddress(id) {
    setAddresses(addresses.map((a) => ({ ...a, isDefault: a.id === id })));
  }

  const stages = ["Confirmed", "Processing", "Shipped", "Delivered"];
  const getStageIdx = (st) => {
    if (!st || st === "Cancelled") return -1;
    const idx = stages.findIndex((s) => s.toLowerCase() === st.toLowerCase());
    return idx >= 0 ? idx : 0;
  };

  return (
    <div className="site-shell">
      <SiteHeader active="profile" />

      <main className="profile-page-wrapper">
        <div className="profile-container">
          <div style={{ marginBottom: 18 }}>
            <BackButton to="/" label="Return to Storefront" />
          </div>

          <div className="profile-layout">
            {/* Sidebar Navigation */}
            <aside className="profile-sidebar">
              <div className="profile-avatar-card">
                <div className="profile-avatar-circle">
                  {(user?.name || "G")[0].toUpperCase()}
                </div>
                <h3 className="profile-name">{user ? user.name : "Guest Customer"}</h3>
                <p className="profile-email">{user ? user.email : "Not logged in"}</p>

                {user?.role === "admin" && (
                  <div className="admin-profile-badge">
                    <span>👑 Admin Account</span>
                    <Link to="/admin/dashboard" className="admin-shortcut-btn">
                      ⚙️ Admin Control Panel
                    </Link>
                  </div>
                )}
              </div>

              <div className="profile-nav-tabs">
                <button
                  type="button"
                  className={`profile-tab-link ${activeTab === "orders" ? "active" : ""}`}
                  onClick={() => setActiveTab("orders")}
                >
                  <span className="tab-icon">📦</span>
                  <span>My Order History</span>
                  <span className="tab-badge">{orders.length}</span>
                </button>

                <button
                  type="button"
                  className={`profile-tab-link ${activeTab === "account" ? "active" : ""}`}
                  onClick={() => setActiveTab("account")}
                >
                  <span className="tab-icon">👤</span>
                  <span>Account Details</span>
                </button>

                <button
                  type="button"
                  className={`profile-tab-link ${activeTab === "addresses" ? "active" : ""}`}
                  onClick={() => setActiveTab("addresses")}
                >
                  <span className="tab-icon">📍</span>
                  <span>Delivery Addresses</span>
                  <span className="tab-badge">{addresses.length}</span>
                </button>

                <Link to="/products" className="profile-tab-link continue-shopping">
                  <span className="tab-icon">🧵</span>
                  <span>Continue Shopping</span>
                </Link>

                {user ? (
                  <button type="button" className="profile-tab-link logout-link" onClick={handleLogout}>
                    <span className="tab-icon">🚪</span>
                    <span>Log Out</span>
                  </button>
                ) : (
                  <Link to="/login" className="profile-tab-link login-link">
                    <span className="tab-icon">🔑</span>
                    <span>Log In / Sign Up</span>
                  </Link>
                )}
              </div>
            </aside>

            {/* Main Tab Content */}
            <section className="profile-content-area">
              {/* TAB 1: ORDERS */}
              {activeTab === "orders" && (
                <div>
                  <div className="tab-header">
                    <div>
                      <h2>My Order History</h2>
                      <p>Track your orders, view item details, and check delivery status.</p>
                    </div>
                    <span className="orders-count-pill">{orders.length} order(s) placed</span>
                  </div>

                  {loadingOrders ? (
                    <div className="profile-loading">
                      <p>Fetching your orders from database...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="empty-profile-card">
                      <div className="empty-icon">🛍️</div>
                      <h3>No orders placed yet</h3>
                      <p>When you place an order, live tracking and receipt information will appear right here.</p>
                      <Link to="/products" className="primary-shop-button">
                        Explore Threads &amp; Shop Now →
                      </Link>
                    </div>
                  ) : (
                    <div className="orders-list">
                      {orders.map((o) => {
                        const isExpanded = expandedId === o.id;
                        const currentIdx = getStageIdx(o.status);

                        return (
                          <div key={o.id} className="order-history-card">
                            <div
                              className="order-card-header"
                              onClick={() => setExpandedId(isExpanded ? null : o.id)}
                            >
                              <div>
                                <strong className="order-ref-title">Order #{o.id}</strong>
                                <div className="order-date-sub">
                                  Placed on {new Date(o.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                                </div>
                              </div>

                              <div className="order-header-right">
                                <div className="order-amount-block">
                                  <div className="order-price-val">Rs. {o.total?.toLocaleString()}</div>
                                  <div className="order-items-qty">
                                    {o.items?.reduce((s, i) => s + i.qty, 0)} item(s) · {o.paymentMethod}
                                  </div>
                                </div>

                                <span
                                  className={`pill ${
                                    o.status === "Delivered"
                                      ? "pill-success"
                                      : o.status === "Cancelled"
                                      ? "pill-danger"
                                      : o.status === "Shipped"
                                      ? "pill-info"
                                      : "pill-warning"
                                  }`}
                                >
                                  ● {o.status}
                                </span>

                                <button
                                  type="button"
                                  className="btn-outline-sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedId(isExpanded ? null : o.id);
                                  }}
                                >
                                  {isExpanded ? "Hide ▲" : "Track & Details ▼"}
                                </button>
                              </div>
                            </div>

                            {/* Expanded Tracking & Details */}
                            {isExpanded && (
                              <div className="order-card-body">
                                {o.status !== "Cancelled" ? (
                                  <div className="order-stepper-wrap" style={{ marginBottom: 18 }}>
                                    <div className="order-stepper">
                                      {stages.map((stName, idx) => {
                                        const isDone = currentIdx >= idx;
                                        const isCurrent = currentIdx === idx;
                                        return (
                                          <div key={stName} className={`stepper-step ${isDone ? "is-done" : ""} ${isCurrent ? "is-current" : ""}`}>
                                            <div className="step-circle">{isDone ? "✓" : idx + 1}</div>
                                            <span className="step-name">{stName}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="cancelled-order-banner">
                                    ⚠️ This order was cancelled.
                                  </div>
                                )}

                                <div className="order-info-grid">
                                  <div>
                                    <h4 className="info-title">Delivery Address</h4>
                                    <p className="info-text">
                                      <strong>{o.address?.name || o.customerName}</strong><br />
                                      {o.address?.address || o.address}, {o.address?.city || o.city} {o.address?.postal || ""}<br />
                                      Phone: {o.phone}
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="info-title">Payment Summary</h4>
                                    <p className="info-text">
                                      Method: <strong>{o.paymentMethod}</strong><br />
                                      Subtotal: Rs. {o.subtotal?.toLocaleString()}<br />
                                      Delivery: {o.delivery === 0 ? "FREE" : `Rs. ${o.delivery}`}<br />
                                      <strong>Grand Total: Rs. {o.total?.toLocaleString()}</strong>
                                    </p>
                                  </div>
                                </div>

                                <h4 className="info-title" style={{ marginTop: 14 }}>Ordered Products</h4>
                                <table className="wf-table">
                                  <thead>
                                    <tr>
                                      <th>Item</th>
                                      <th>Unit Price</th>
                                      <th>Quantity</th>
                                      <th>Total</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {o.items?.map((item, i) => (
                                      <tr key={i}>
                                        <td>
                                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            {item.image && (
                                              <img
                                                src={getImageUrl(item.image)}
                                                alt={item.name}
                                                style={{ width: 34, height: 34, borderRadius: 4, objectFit: "cover" }}
                                              />
                                            )}
                                            <span>{item.name}</span>
                                          </div>
                                        </td>
                                        <td>Rs. {item.price}</td>
                                        <td>{item.qty}</td>
                                        <td><strong>Rs. {item.price * item.qty}</strong></td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: ACCOUNT DETAILS */}
              {activeTab === "account" && (
                <div className="tab-card">
                  <div className="tab-header">
                    <div>
                      <h2>Account Details &amp; Profile</h2>
                      <p>Manage your personal credentials, contact info, and security.</p>
                    </div>
                  </div>

                  {accountSavedMsg && (
                    <div style={{ background: "#E1F5E8", color: "#1E7E34", border: "1px solid #b7e4c7", padding: "10px 16px", borderRadius: 8, marginBottom: 18, fontSize: 13 }}>
                      ✓ {accountSavedMsg}
                    </div>
                  )}
                  {accountError && <div className="settings-error" role="alert">{accountError}</div>}

                  <form onSubmit={handleSaveAccount} className="profile-form">
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
                      <div>
                        <label className="label">Full Name *</label>
                        <input
                          type="text"
                          className="input-plain"
                          value={accountForm.name}
                          onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <label className="label">Contact Phone Number *</label>
                        <input
                          type="text"
                          className="input-plain"
                          value={accountForm.phone}
                          onChange={(e) => setAccountForm({ ...accountForm, phone: e.target.value })}
                          placeholder="e.g. 077 123 4567"
                          required
                        />
                      </div>

                      <div style={{ gridColumn: "1 / -1" }}>
                        <label className="label">Registered Email Address</label>
                        <input
                          type="email"
                          className="input-plain"
                          value={accountForm.email}
                          onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                          required
                        />
                        <small style={{ color: "#888", display: "block", marginTop: 4 }}>
                          Changing this also updates the email used for future sign-ins.
                        </small>
                      </div>
                    </div>

                    <div style={{ marginTop: 24, paddingTop: 18, borderTop: "1px solid #eee" }}>
                      <h4 style={{ margin: "0 0 12px", color: "var(--navy)" }}>Security &amp; Password</h4>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
                        <div>
                          <label className="label">Current Password</label>
                          <input
                            type="password"
                            className="input-plain"
                            placeholder="Leave blank if unchanged"
                            value={accountForm.currentPassword}
                            onChange={(e) => setAccountForm({ ...accountForm, currentPassword: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="label">New Password</label>
                          <input
                            type="password"
                            className="input-plain"
                            placeholder="Minimum 6 characters"
                            value={accountForm.newPassword}
                            onChange={(e) => setAccountForm({ ...accountForm, newPassword: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: 24 }}>
                      <button type="submit" className="primary-shop-button" disabled={savingAccount} style={{ border: "none", cursor: "pointer", padding: "12px 28px" }}>
                        {savingAccount ? "Saving Profile..." : "💾 Save Profile Changes"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 3: DELIVERY ADDRESSES */}
              {activeTab === "addresses" && (
                <div className="tab-card">
                  <div className="tab-header">
                    <div>
                      <h2>Saved Delivery Addresses</h2>
                      <p>Manage your delivery destinations for faster, 1-click checkout.</p>
                    </div>
                    <button
                      type="button"
                      className="primary-shop-button"
                      style={{ padding: "8px 16px", fontSize: 13 }}
                      onClick={() => {
                        if (showAddAddress) {
                          setShowAddAddress(false);
                          setEditingAddressId(null);
                          setNewAddr({ label: "Home", name: user?.name || "", phone: "", street: "", city: "", postal: "", isDefault: false });
                        } else {
                          setShowAddAddress(true);
                        }
                      }}
                    >
                      {showAddAddress ? "✕ Cancel" : "➕ Add New Address"}
                    </button>
                  </div>

                  {/* Add New Address Form Modal/Accordion */}
                  {showAddAddress && (
                    <form onSubmit={handleAddAddress} className="add-address-form">
                      <h3 style={{ margin: "0 0 14px", fontSize: 16, color: "var(--navy)" }}>{editingAddressId ? "Edit Delivery Address" : "New Delivery Address"}</h3>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
                        <div>
                          <label className="label">Address Label (e.g. Home, Office) *</label>
                          <input
                            type="text"
                            className="input-plain"
                            placeholder="Home, Office, Boutique"
                            value={newAddr.label}
                            onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label className="label">Receiver Name *</label>
                          <input
                            type="text"
                            className="input-plain"
                            placeholder="Full name"
                            value={newAddr.name}
                            onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label className="label">Contact Phone *</label>
                          <input
                            type="text"
                            className="input-plain"
                            placeholder="077 123 4567"
                            value={newAddr.phone}
                            onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                            required
                          />
                        </div>
                        <div style={{ gridColumn: "1 / -1" }}>
                          <label className="label">Street Address *</label>
                          <input
                            type="text"
                            className="input-plain"
                            placeholder="House number, Street name"
                            value={newAddr.street}
                            onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label className="label">City / Town *</label>
                          <input
                            type="text"
                            className="input-plain"
                            placeholder="e.g. Colombo, Kandy"
                            value={newAddr.city}
                            onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label className="label">Postal Code</label>
                          <input
                            type="text"
                            className="input-plain"
                            placeholder="e.g. 00100"
                            value={newAddr.postal}
                            onChange={(e) => setNewAddr({ ...newAddr, postal: e.target.value })}
                          />
                        </div>
                      </div>

                      <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8 }}>
                        <input
                          type="checkbox"
                          id="setDefaultCheck"
                          checked={newAddr.isDefault}
                          onChange={(e) => setNewAddr({ ...newAddr, isDefault: e.target.checked })}
                        />
                        <label htmlFor="setDefaultCheck" style={{ fontSize: 13, cursor: "pointer" }}>
                          Set this as my default delivery address
                        </label>
                      </div>
                      {addressError && <div className="settings-error" role="alert">{addressError}</div>}

                      <div style={{ marginTop: 18, display: "flex", gap: 10 }}>
                        <button type="submit" className="primary-shop-button" style={{ padding: "10px 22px", fontSize: 13 }}>
                          {editingAddressId ? "Update Address" : "Save Address"}
                        </button>
                        <button type="button" className="btn-outline-sm" onClick={() => { setShowAddAddress(false); setEditingAddressId(null); }}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Addresses List */}
                  <div className="addresses-grid">
                    {addresses.length === 0 && (
                      <div className="empty-addresses">No saved delivery addresses yet. Add one to make checkout faster.</div>
                    )}
                    {addresses.map((addr) => (
                      <div key={addr.id} className={`address-card ${addr.isDefault ? "is-default" : ""}`}>
                        <div className="address-card-header">
                          <span className="address-label-badge">{addr.label}</span>
                          {addr.isDefault && (
                            <span className="default-pill">★ Default</span>
                          )}
                        </div>
                        <h4 className="address-recipient">{addr.name}</h4>
                        <p className="address-lines">
                          {addr.street}<br />
                          {addr.city} {addr.postal}<br />
                          Phone: <strong>{addr.phone}</strong>
                        </p>

                        <div className="address-actions">
                          <button
                            type="button"
                            className="btn-outline-sm"
                            style={{ padding: "4px 10px", fontSize: 11 }}
                            onClick={() => handleEditAddress(addr)}
                          >
                            Edit
                          </button>
                          {!addr.isDefault && (
                            <button
                              type="button"
                              className="btn-outline-sm"
                              style={{ padding: "4px 10px", fontSize: 11 }}
                              onClick={() => handleSetDefaultAddress(addr.id)}
                            >
                              Make Default
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn-delete-addr"
                            onClick={() => handleDeleteAddress(addr.id)}
                            title="Delete address"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

    </div>
  );
}

export default Profile;
