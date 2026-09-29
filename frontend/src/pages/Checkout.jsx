import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import SiteHeader from "../SiteHeader";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useProducts } from "../context/ProductsContext";
import { api } from "../api/client";
import { useSettings } from "../context/SettingsContext";
import BackButton from "../BackButton";

function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const { fetchProducts } = useProducts();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const addressesKey = `apple-thread-addresses_${user?.id || "guest"}`;
  const [savedAddresses] = useState(() => {
    try {
      const stored = localStorage.getItem(addressesKey);
      if (!stored) return [];
      const addresses = JSON.parse(stored);
      if (
        !Array.isArray(addresses) ||
        addresses.some((address) =>
          !address ||
          typeof address.id !== "string" ||
          typeof address.name !== "string" ||
          typeof address.phone !== "string" ||
          typeof address.street !== "string" ||
          typeof address.city !== "string"
        )
      ) {
        throw new Error("Saved delivery address data is invalid.");
      }
      return addresses;
    } catch (error) {
      console.error("Could not load saved checkout addresses:", error);
      return [];
    }
  });
  const defaultAddress = savedAddresses.find((address) => address.isDefault);
  const [selectedAddressId, setSelectedAddressId] = useState(defaultAddress?.id || "");

  const [form, setForm] = useState({
    name: defaultAddress?.name || user?.name || "",
    phone: defaultAddress?.phone || user?.phone || "",
    address: defaultAddress?.street || "",
    city: defaultAddress?.city || "",
    postal: defaultAddress?.postal || "",
  });
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const delivery = subtotal >= Number(settings.freeDeliveryThreshold) ? 0 : Number(settings.deliveryFee);
  const total = subtotal + delivery;

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setSelectedAddressId("");
  }

  function selectSavedAddress(id) {
    setSelectedAddressId(id);
    const address = savedAddresses.find((saved) => saved.id === id);
    if (address) {
      setForm({
        name: address.name,
        phone: address.phone,
        address: address.street,
        city: address.city,
        postal: address.postal,
      });
    }
  }

  async function placeOrder(e) {
    e.preventDefault();
    if (items.length === 0) return;

    setError("");
    setSubmitting(true);

    try {
      const orderPayload = {
        items,
        address: form,
        paymentMethod,
        email: user?.email || "",
      };

      const createdOrder = await api.createOrder(orderPayload);

      // Refresh product stock in context
      fetchProducts();

      clearCart();
      navigate(`/order-confirmation/${createdOrder.id}`, { state: { total, order: createdOrder } });
    } catch (err) {
      console.error("Order placement error:", err);
      setError(err.message || "Failed to place order. Please try again.");
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="site-shell">
        <SiteHeader active="cart" />
        <div className="page-content empty-checkout">
          <div className="page-back-row"><BackButton to="/cart" /></div>
          <p>Your cart is empty — nothing to check out yet.</p>
          <button className="primary-shop-button" onClick={() => navigate("/products")}>Shop Threads</button>
        </div>
      </div>
    );
  }

  return (
    <div className="site-shell">
      <SiteHeader active="cart" />

      <div className="page-content checkout-page-content">
        <div className="page-back-row"><BackButton to="/cart" /></div>
        <h1 className="page-title" style={{ marginBottom: 20 }}>Checkout & Delivery</h1>

        {error && (
          <div style={{ background: "#FDE8E8", color: "#9B1C1C", padding: "12px 16px", borderRadius: 8, marginBottom: 20, fontSize: 14 }}>
            ⚠️ {error}
          </div>
        )}

        <form className="checkout-layout" onSubmit={placeOrder}>
          <div className="checkout-form">
            <h2 style={{ fontSize: 16, marginBottom: 14 }}>1. Delivery Address</h2>
            {savedAddresses.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <label className="label" htmlFor="saved-address-select">Use a saved delivery address</label>
                <select
                  id="saved-address-select"
                  className="input-plain"
                  value={selectedAddressId}
                  onChange={(e) => selectSavedAddress(e.target.value)}
                >
                  <option value="">Enter a different address</option>
                  {savedAddresses.map((address) => (
                    <option key={address.id} value={address.id}>
                      {address.label}{address.isDefault ? " · Default" : ""} — {address.city}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div style={{ marginBottom: 12 }}>
              <span className="label">Full Name *</span>
              <input
                className="input-plain"
                placeholder="Receiver's full name"
                required
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <span className="label">Phone Number *</span>
              <input
                className="input-plain"
                placeholder="e.g. 077 123 4567"
                required
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <span className="label">Delivery Street Address *</span>
              <input
                className="input-plain"
                placeholder="House number, Street name"
                required
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
              />
            </div>

            <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
              <div style={{ flex: 1 }}>
                <span className="label">City / Town *</span>
                <input
                  className="input-plain"
                  placeholder="e.g. Colombo, Kandy"
                  required
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                />
              </div>
              <div style={{ flex: 1 }}>
                <span className="label">Postal Code (Optional)</span>
                <input
                  className="input-plain"
                  placeholder="e.g. 00100"
                  value={form.postal}
                  onChange={(e) => update("postal", e.target.value)}
                />
              </div>
            </div>

            <h2 style={{ fontSize: 16, marginTop: 10, marginBottom: 14 }}>2. Payment Method</h2>
            <div style={{ background: "#FAFAF8", border: "1px solid #e0e0e0", borderRadius: 8, padding: "14px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 14 }}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Cash on Delivery"
                  checked={paymentMethod === "Cash on Delivery"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div>
                  <strong>Cash on Delivery (COD)</strong>
                  <div style={{ fontSize: 12, color: "#666" }}>Pay cash when the package arrives at your doorstep.</div>
                </div>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 14 }}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Bank Transfer"
                  checked={paymentMethod === "Bank Transfer"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div>
                  <strong>Direct Bank Transfer</strong>
                  <div style={{ fontSize: 12, color: "#666" }}>Transfer directly to our commercial bank account.</div>
                </div>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 14 }}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Card Payment"
                  checked={paymentMethod === "Card Payment"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div>
                  <strong>Credit / Debit Card</strong>
                  <div style={{ fontSize: 12, color: "#666" }}>Visa, MasterCard, or Amex on delivery.</div>
                </div>
              </label>
            </div>
          </div>

          <div className="cart-summary" style={{ position: "sticky", top: 20 }}>
            <h2 style={{ fontSize: 17, marginBottom: 14 }}>Order Summary</h2>
            <div style={{ maxHeight: 220, overflowY: "auto", marginBottom: 14 }}>
              {items.map((i) => (
                <div className="summary-row" key={i.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
                  <span>{i.name} × {i.qty}</span>
                  <strong>Rs. {i.qty * i.price}</strong>
                </div>
              ))}
            </div>
            <hr style={{ border: 0, borderTop: "1px solid #e0e0e0", margin: "14px 0" }} />
            <div className="summary-row" style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}>
              <span>Subtotal</span>
              <span>Rs. {subtotal}</span>
            </div>
            <div className="summary-row" style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 14 }}>
              <span>Delivery</span>
              <span style={{ color: delivery === 0 ? "#1E7E34" : "inherit", fontWeight: delivery === 0 ? 700 : 400 }}>
                {delivery === 0 ? "FREE" : `Rs. ${delivery}`}
              </span>
            </div>
            <div className="summary-row" style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 700, color: "var(--navy)", marginBottom: 16 }}>
              <span>Total Payable</span>
              <span>Rs. {total}</span>
            </div>

            <button
              className="modern-add-cart"
              style={{ width: "100%", padding: "13px 0", fontSize: 15 }}
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Placing Order..." : `Confirm Order (Rs. ${total})`}
            </button>
            <p style={{ fontSize: 11, color: "#888", textAlign: "center", marginTop: 10 }}>
              🔒 100% Safe &amp; Secure Order Processing
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Checkout;
