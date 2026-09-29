import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import "../App.css";
import SiteHeader from "../SiteHeader";
import { api, getImageUrl } from "../api/client";
import BackButton from "../BackButton";

function OrderConfirmation() {
  const { orderId } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);

  useEffect(() => {
    if (!order && orderId) {
      async function loadOrder() {
        try {
          setLoading(true);
          const data = await api.getOrder(orderId);
          setOrder(data);
        } catch (err) {
          console.error("Could not fetch order:", err);
        } finally {
          setLoading(false);
        }
      }
      loadOrder();
    }
  }, [orderId, order]);

  const stages = [
    { key: "Confirmed", label: "Confirmed", icon: "✓" },
    { key: "Processing", label: "Processing", icon: "📦" },
    { key: "Shipped", label: "Dispatched", icon: "🚚" },
    { key: "Delivered", label: "Delivered", icon: "🎉" },
  ];

  const getStageIndex = (status) => {
    if (!status) return 0;
    if (status === "Cancelled") return -1;
    const idx = stages.findIndex((s) => s.key.toLowerCase() === status.toLowerCase());
    return idx >= 0 ? idx : 0;
  };

  const currentIdx = getStageIndex(order?.status);

  return (
    <div className="site-shell">
      <SiteHeader active="cart" />

      <div className="page-content confirmation-page-content">
        <div className="page-back-row"><BackButton to="/profile" label="Back to My Orders" /></div>
        {/* Celebration Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div className="confirmation-check">✓</div>
          <h1 className="page-title" style={{ marginTop: 16, marginBottom: 8 }}>
            Order Placed Successfully!
          </h1>
          <p style={{ color: "#666", fontSize: 15, margin: 0 }}>
            Thank you for shopping with Apple Thread. Your order has been confirmed and is being prepared.
          </p>
          <div style={{ display: "inline-block", background: "rgba(31,61,46,0.08)", padding: "6px 16px", borderRadius: 20, marginTop: 12, fontSize: 13, fontWeight: 600, color: "var(--navy)" }}>
            Order Reference: #{orderId}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "#888" }}>
            Loading order summary...
          </div>
        ) : (
          <div className="confirmation-receipt-card">
            {/* Fulfillment Tracker */}
            <div className="order-stepper-wrap">
              <h3 style={{ margin: "0 0 16px", fontSize: 15, color: "var(--navy)" }}>Order Progress</h3>
              <div className="order-stepper">
                {stages.map((st, i) => {
                  const isDone = currentIdx >= i;
                  const isCurrent = currentIdx === i;

                  return (
                    <div key={st.key} className={`stepper-step ${isDone ? "is-done" : ""} ${isCurrent ? "is-current" : ""}`}>
                      <div className="step-circle">{st.icon}</div>
                      <span className="step-name">{st.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Items List */}
            {order?.items && order.items.length > 0 && (
              <div style={{ marginTop: 24, borderTop: "1px solid #f0f0f0", paddingTop: 20 }}>
                <h3 style={{ margin: "0 0 14px", fontSize: 15, color: "var(--navy)" }}>Items Ordered</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {order.items.map((item, idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {item.image && (
                          <img
                            src={getImageUrl(item.image)}
                            alt={item.name}
                            style={{ width: 44, height: 44, borderRadius: 6, objectFit: "cover", border: "1px solid #eee" }}
                          />
                        )}
                        <div>
                          <strong style={{ fontSize: 14 }}>{item.name}</strong>
                          <div style={{ fontSize: 12, color: "#777" }}>Qty: {item.qty} × Rs. {item.price}</div>
                        </div>
                      </div>
                      <strong style={{ fontSize: 14, color: "var(--navy)" }}>
                        Rs. {item.price * item.qty}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Address & Payment Info */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, marginTop: 24, borderTop: "1px solid #f0f0f0", paddingTop: 20 }}>
              <div>
                <h4 style={{ margin: "0 0 6px", fontSize: 13, textTransform: "uppercase", color: "#888", letterSpacing: 0.5 }}>
                  Delivery Address
                </h4>
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "#333" }}>
                  <strong>{order?.address?.name || order?.customerName}</strong><br />
                  {order?.address?.address || order?.address}<br />
                  {order?.address?.city || order?.city} {order?.address?.postal || ""}<br />
                  Phone: <strong>{order?.phone}</strong>
                </p>
              </div>

              <div>
                <h4 style={{ margin: "0 0 6px", fontSize: 13, textTransform: "uppercase", color: "#888", letterSpacing: 0.5 }}>
                  Payment Details
                </h4>
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "#333" }}>
                  Method: <strong>{order?.paymentMethod || "Cash on Delivery"}</strong><br />
                  Subtotal: Rs. {order?.subtotal?.toLocaleString()}<br />
                  Delivery Fee: {order?.delivery === 0 ? <strong style={{ color: "#1E7E34" }}>FREE</strong> : `Rs. ${order?.delivery}`}<br />
                  <span style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)" }}>
                    Total: Rs. {order?.total?.toLocaleString()}
                  </span>
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 12, marginTop: 32, justifyContent: "center", flexWrap: "wrap", borderTop: "1px solid #f0f0f0", paddingTop: 24 }}>
              <button
                type="button"
                className="btn-outline-sm"
                onClick={() => window.print()}
                style={{ padding: "10px 18px", fontSize: 13 }}
              >
                🖨️ Print Receipt
              </button>
              <Link to="/profile" className="modern-add-cart" style={{ textDecoration: "none", padding: "10px 22px", fontSize: 13 }}>
                📦 View in My Orders
              </Link>
              <Link to="/" className="secondary-shop-button" style={{ padding: "10px 18px", fontSize: 13 }}>
                Continue Shopping →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderConfirmation;
