import { useState, useEffect } from "react";
import AdminShell from "./AdminShell";
import { api } from "../../api/client";
import "../../App.css";

const STATUS_OPTIONS = ["Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      setLoading(true);
      const data = await api.getOrders();
      setOrders(data);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(orderId, newStatus) {
    try {
      setUpdatingId(orderId);
      const updated = await api.updateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    } catch (err) {
      alert("Failed to update status: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === "All") return true;
    return o.status === filterStatus;
  });

  return (
    <AdminShell active="orders" title="Customer Orders Management">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["All", ...STATUS_OPTIONS].map((st) => (
            <button
              key={st}
              className={`btn-outline-sm ${filterStatus === st ? "on" : ""}`}
              onClick={() => setFilterStatus(st)}
              style={{
                background: filterStatus === st ? "var(--navy)" : "white",
                color: filterStatus === st ? "white" : "var(--charcoal)",
                borderColor: filterStatus === st ? "var(--navy)" : "#ccc",
              }}
            >
              {st} {st !== "All" && `(${orders.filter((o) => o.status === st).length})`}
            </button>
          ))}
        </div>

        <button className="btn-outline-sm" onClick={fetchOrders} title="Refresh orders from database">
          ↻ Refresh Orders
        </button>
      </div>

      {loading ? (
        <p style={{ color: "#888", padding: "20px 0" }}>Loading orders from database...</p>
      ) : filteredOrders.length === 0 ? (
        <div style={{ background: "white", padding: 30, borderRadius: 8, textAlign: "center", border: "1px solid #eee" }}>
          <p style={{ color: "#888", margin: 0 }}>No orders found with status "{filterStatus}".</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filteredOrders.map((order) => {
            const isExpanded = expandedId === order.id;

            return (
              <div
                key={order.id}
                style={{
                  background: "white",
                  borderRadius: 10,
                  border: "1px solid #e5e5e5",
                  padding: "16px 20px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 12,
                    cursor: "pointer",
                  }}
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                >
                  <div>
                    <strong style={{ fontSize: 16, color: "var(--navy)" }}>{order.id}</strong>
                    <span style={{ fontSize: 12, color: "#888", marginLeft: 12 }}>
                      {new Date(order.date).toLocaleDateString()} at {new Date(order.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <div style={{ fontSize: 13, marginTop: 4, color: "#444" }}>
                      Customer: <strong>{order.customerName}</strong> ({order.phone})
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)" }}>
                        Rs. {order.total}
                      </div>
                      <div style={{ fontSize: 11, color: "#888" }}>
                        {order.items.reduce((s, i) => s + i.qty, 0)} item(s) · {order.paymentMethod}
                      </div>
                    </div>

                    <div onClick={(e) => e.stopPropagation()}>
                      <select
                        className="input-plain"
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          padding: "6px 12px",
                          borderRadius: 20,
                          background:
                            order.status === "Delivered"
                              ? "#E1F5E8"
                              : order.status === "Shipped"
                              ? "#E3F2FD"
                              : order.status === "Cancelled"
                              ? "#FEE2E2"
                              : "#FFF8E1",
                          color:
                            order.status === "Delivered"
                              ? "#1E7E34"
                              : order.status === "Shipped"
                              ? "#0D47A1"
                              : order.status === "Cancelled"
                              ? "#B91C1C"
                              : "#B45309",
                          border: "1px solid currentColor",
                        }}
                      >
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      className="btn-outline-sm"
                      style={{ padding: "4px 10px", fontSize: 11 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedId(isExpanded ? null : order.id);
                      }}
                    >
                      {isExpanded ? "Hide Details ▲" : "View Items ▼"}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #eee", fontSize: 13 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 14 }}>
                      <div>
                        <h4 style={{ margin: "0 0 6px", color: "var(--navy)" }}>Delivery Address</h4>
                        <p style={{ margin: 0, color: "#555", lineHeight: 1.6 }}>
                          {order.customerName}<br />
                          {order.address.address}, {order.address.city} {order.address.postal}<br />
                          Phone: {order.phone}<br />
                          {order.customerEmail && `Email: ${order.customerEmail}`}
                        </p>
                      </div>

                      <div>
                        <h4 style={{ margin: "0 0 6px", color: "var(--navy)" }}>Order Summary</h4>
                        <p style={{ margin: 0, color: "#555", lineHeight: 1.6 }}>
                          Subtotal: Rs. {order.subtotal}<br />
                          Delivery Fee: {order.delivery === 0 ? "FREE" : `Rs. ${order.delivery}`}<br />
                          <strong>Total: Rs. {order.total}</strong><br />
                          Payment: {order.paymentMethod}
                        </p>
                      </div>
                    </div>

                    <h4 style={{ margin: "10px 0 8px", color: "var(--navy)" }}>Ordered Items</h4>
                    <table className="wf-table" style={{ fontSize: 12 }}>
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Unit Price</th>
                          <th>Quantity</th>
                          <th>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item, idx) => (
                          <tr key={idx}>
                            <td>{item.name}</td>
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
    </AdminShell>
  );
}

export default AdminOrders;
