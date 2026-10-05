import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CryptoJS from "crypto-js";
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
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const paymentCancelled = searchParams.get("payment") === "cancelled";

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
    email: defaultAddress?.email || user?.email || "",
    phone: defaultAddress?.phone || user?.phone || "",
    address: defaultAddress?.street || "",
    city: defaultAddress?.city || "",
    postal: defaultAddress?.postal || "",
  });
  const [paymentMethod, setPaymentMethod] = useState("PayHere");
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
        email: address.email || user?.email || "",
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
        email: form.email || user?.email || "",
      };

      const createdOrder = await api.createOrder(orderPayload);

      // Refresh product stock in context
      fetchProducts();

      if (paymentMethod === "PayHere") {
        const baseUrl = window.location.origin;
        const fmtAmount = Number(total).toFixed(2);
        const merchantId = "1238361";
        const merchantSecret = "OTA0NDc2MTQwMjczMTY3MzU0NzEzMDU4NDk3MzM3NTg5NzczNzY=";

        // PayHere Sandbox MD5 Hash Formula (Week 07 Lab)
        const cryptoLib = (typeof CryptoJS !== "undefined" && CryptoJS.MD5) ? CryptoJS : window.CryptoJS;
        const hashedSecret = cryptoLib.MD5(merchantSecret).toString().toUpperCase();
        const hashString = merchantId + createdOrder.id + fmtAmount + "LKR" + hashedSecret;
        const generatedHash = cryptoLib.MD5(hashString).toString().toUpperCase();

        const nameParts = (form.name || "").trim().split(/\s+/);
        const firstName = nameParts[0] || "Customer";
        const lastName = nameParts.slice(1).join(" ") || "AppleThread";
        const itemsDesc = items.map((i) => `${i.name} (x${i.qty})`).join(", ").slice(0, 200) || "Apple Thread Order";

        const payhereData = {
          merchant_id: merchantId,
          return_url: `${baseUrl}/order-confirmation/${createdOrder.id}?payhere=success`,
          cancel_url: `${baseUrl}/checkout?payment=cancelled`,
          notify_url: "http://localhost:5000/api/orders/payhere-notify",
          order_id: createdOrder.id,
          items: itemsDesc,
          currency: "LKR",
          amount: fmtAmount,
          first_name: firstName,
          last_name: lastName,
          email: form.email || "customer@applethread.lk",
          phone: form.phone,
          address: form.address,
          city: form.city,
          country: "Sri Lanka",
          hash: generatedHash,
        };

        clearCart();

        const formEl = document.createElement("form");
        formEl.method = "POST";
        formEl.action = "https://sandbox.payhere.lk/pay/checkout";

        Object.entries(payhereData).forEach(([key, val]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = val;
          formEl.appendChild(input);
        });

        document.body.appendChild(formEl);
        formEl.submit();
        return;
      }

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

        {paymentCancelled && (
          <div style={{ background: "#FEF3C7", border: "1px solid #F59E0B", color: "#92400E", padding: "12px 16px", borderRadius: 8, marginBottom: 20, fontSize: 14 }}>
            ⚠️ <strong>Payment Cancelled:</strong> Your PayHere transaction was not completed. You can try again below or select another payment method.
          </div>
        )}

        {error && (
          <div style={{ background: "#FDE8E8", color: "#9B1C1C", padding: "12px 16px", borderRadius: 8, marginBottom: 20, fontSize: 14 }}>
            ⚠️ {error}
          </div>
        )}

        <form className="checkout-layout" onSubmit={placeOrder}>
          <div className="checkout-form">
            <h2 style={{ fontSize: 16, marginBottom: 14 }}>1. Customer & Delivery Address</h2>
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
              <span className="label">Email Address *</span>
              <input
                className="input-plain"
                type="email"
                placeholder="e.g. customer@example.com"
                required
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
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
              
              {/* PayHere Sandbox Option */}
              <label style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                cursor: "pointer",
                fontSize: 14,
                padding: "12px",
                border: paymentMethod === "PayHere" ? "2px solid #2F4C7A" : "1px solid #d4d4d4",
                borderRadius: 8,
                background: paymentMethod === "PayHere" ? "#F0F4FA" : "#fff",
                transition: "all 0.15s ease"
              }}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="PayHere"
                  checked={paymentMethod === "PayHere"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ marginTop: 4 }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
                    <strong>PayHere (Online Payment / Card)</strong>
                    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      <span style={{ fontSize: 10, background: "#004B8D", color: "#fff", fontWeight: 700, padding: "2px 6px", borderRadius: 4 }}>PayHere</span>
                      <span style={{ fontSize: 10, background: "#1A1F71", color: "#fff", fontWeight: 700, padding: "2px 6px", borderRadius: 4 }}>VISA</span>
                      <span style={{ fontSize: 10, background: "#EB001B", color: "#fff", fontWeight: 700, padding: "2px 6px", borderRadius: 4 }}>MasterCard</span>
                      <span style={{ fontSize: 10, background: "#28a745", color: "#fff", fontWeight: 600, padding: "2px 6px", borderRadius: 4 }}>Sandbox</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>
                    Official Sri Lankan Payment Gateway. Supports credit/debit test cards with real-time hash verification.
                  </div>
                </div>
              </label>

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
              style={{
                width: "100%",
                padding: "13px 0",
                fontSize: 15,
                background: paymentMethod === "PayHere" ? "#004B8D" : "var(--navy)",
                color: "#fff"
              }}
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? "Connecting..."
                : paymentMethod === "PayHere"
                ? `🔒 Pay with PayHere (Rs. ${total})`
                : `Confirm Order (Rs. ${total})`}
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
