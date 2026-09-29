import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminShell from "./AdminShell";
import OrderFlowchart from "./OrderFlowchart";
import { api, getImageUrl } from "../../api/client";
import "../../App.css";

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    revenue: 0,
    productsCount: 0,
    lowStockCount: 0,
    orderStages: [],
    itemSales: [],
    categoryBreakdown: [],
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);
  const [itemSort, setItemSort] = useState("revenue"); // "revenue" | "units" | "stock"
  const [itemSearch, setItemSearch] = useState("");

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      setLoading(true);
      const data = await api.getStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  }

  // Filter & sort item sales
  const filteredItemSales = (stats.itemSales || [])
    .filter((item) =>
      item.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
      item.category.toLowerCase().includes(itemSearch.toLowerCase())
    )
    .sort((a, b) => {
      if (itemSort === "revenue") return b.totalRevenue - a.totalRevenue;
      if (itemSort === "units") return b.unitsSold - a.unitsSold;
      if (itemSort === "stock") return a.stock - b.stock;
      return 0;
    });

  return (
    <AdminShell active="dashboard" title="Admin Overview &amp; Sales Analytics">
      {loading ? (
        <p style={{ color: "#888", padding: "20px 0" }}>Loading real-time business metrics from database...</p>
      ) : (
        <>
          {/* Top KPI Cards */}
          <div className="grid4">
            <div className="kpi">
              <div className="k">Total Orders</div>
              <div className="v">{stats.totalOrders}</div>
            </div>
            <div className="kpi">
              <div className="k">Total Revenue</div>
              <div className="v">Rs. {stats.revenue?.toLocaleString()}</div>
            </div>
            <div className="kpi">
              <div className="k">Active Products</div>
              <div className="v">{stats.productsCount}</div>
            </div>
            <div className="kpi">
              <div className="k">Low Stock Alerts</div>
              <div className="v" style={{ color: stats.lowStockCount > 0 ? "#B23A48" : "inherit" }}>
                {stats.lowStockCount}
              </div>
            </div>
          </div>

          {/* Interactive Order Fulfillment Lifecycle Flowchart */}
          <div style={{ marginTop: 28 }}>
            <OrderFlowchart orderStages={stats.orderStages} totalRevenue={stats.revenue} />
          </div>

          {/* Item-Wise Sales Breakdown Section */}
          <div style={{ marginTop: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, color: "var(--navy)" }}>📦 Item-Wise Sales Performance</h3>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#666" }}>
                  Detailed breakdown of units sold, revenue generated, and remaining stock per product
                </p>
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <input
                  type="text"
                  placeholder="Filter by product..."
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                  className="input-plain"
                  style={{ width: 170, fontSize: 12, padding: "6px 10px" }}
                />
                <button
                  type="button"
                  className={`btn-outline-sm ${itemSort === "revenue" ? "on" : ""}`}
                  onClick={() => setItemSort("revenue")}
                  style={{ fontSize: 12, padding: "6px 10px" }}
                >
                  Top Revenue
                </button>
                <button
                  type="button"
                  className={`btn-outline-sm ${itemSort === "units" ? "on" : ""}`}
                  onClick={() => setItemSort("units")}
                  style={{ fontSize: 12, padding: "6px 10px" }}
                >
                  Most Sold
                </button>
                <button
                  type="button"
                  className={`btn-outline-sm ${itemSort === "stock" ? "on" : ""}`}
                  onClick={() => setItemSort("stock")}
                  style={{ fontSize: 12, padding: "6px 10px" }}
                >
                  Low Stock
                </button>
              </div>
            </div>

            {filteredItemSales.length === 0 ? (
              <div style={{ background: "white", padding: 24, borderRadius: 8, border: "1px solid #eee", textAlign: "center" }}>
                <p style={{ color: "#888", margin: 0 }}>No product sales records match your filter.</p>
              </div>
            ) : (
              <div style={{ background: "white", borderRadius: 8, border: "1px solid #eee", overflowX: "auto" }}>
                <table className="wf-table">
                  <thead>
                    <tr>
                      <th style={{ width: 50 }}>#</th>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Units Sold</th>
                      <th>Total Revenue</th>
                      <th>Revenue Share</th>
                      <th>Stock Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItemSales.map((item, idx) => (
                      <tr key={item.id}>
                        <td><strong>#{idx + 1}</strong></td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <img
                              src={getImageUrl(item.image)}
                              alt={item.name}
                              style={{ width: 36, height: 36, borderRadius: 6, objectFit: "cover", border: "1px solid #ddd" }}
                            />
                            <div>
                              <strong>{item.name}</strong>
                              <div style={{ fontSize: 11, color: "#888" }}>ID: {item.id}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="pill pill-warning" style={{ fontSize: 11, padding: "2px 8px" }}>
                            {item.category}
                          </span>
                        </td>
                        <td>Rs. {item.price}</td>
                        <td>
                          <strong style={{ fontSize: 14, color: item.unitsSold > 0 ? "var(--navy)" : "#888" }}>
                            {item.unitsSold}
                          </strong>
                        </td>
                        <td>
                          <strong style={{ color: "var(--navy)" }}>
                            Rs. {item.totalRevenue?.toLocaleString()}
                          </strong>
                        </td>
                        <td style={{ minWidth: 130 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ flex: 1, height: 6, background: "#f0f0f0", borderRadius: 3, overflow: "hidden" }}>
                              <div
                                style={{
                                  width: `${Math.min(100, item.revenuePercent || 0)}%`,
                                  height: "100%",
                                  background: "var(--gold)",
                                  borderRadius: 3,
                                }}
                              />
                            </div>
                            <span style={{ fontSize: 11, color: "#666", minWidth: 34 }}>
                              {item.revenuePercent}%
                            </span>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`pill ${
                              item.stock === 0
                                ? "pill-danger"
                                : item.stock <= 10
                                ? "pill-warning"
                                : "pill-success"
                            }`}
                            style={{ fontSize: 11, padding: "3px 8px" }}
                          >
                            {item.stock === 0 ? "Out of Stock" : item.stock <= 10 ? `Low: ${item.stock}` : `${item.stock} in stock`}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Category Revenue Distribution */}
          {stats.categoryBreakdown && stats.categoryBreakdown.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 18, color: "var(--navy)" }}>
                🏷️ Sales by Category
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
                {stats.categoryBreakdown.map((cat) => (
                  <div
                    key={cat.category}
                    style={{
                      background: "white",
                      padding: "16px 18px",
                      borderRadius: 8,
                      border: "1px solid #eee",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <strong style={{ color: "var(--navy)" }}>{cat.category}</strong>
                      <span style={{ fontSize: 12, color: "#888" }}>{cat.unitsSold} units</span>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "var(--navy)", marginBottom: 8 }}>
                      Rs. {cat.revenue?.toLocaleString()}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 5, background: "#f0f0f0", borderRadius: 3, overflow: "hidden" }}>
                        <div
                          style={{
                            width: `${Math.min(100, cat.revenuePercent || 0)}%`,
                            height: "100%",
                            background: "var(--sage)",
                            borderRadius: 3,
                          }}
                        />
                      </div>
                      <span style={{ fontSize: 11, color: "#666" }}>{cat.revenuePercent}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Orders Table */}
          <div style={{ marginTop: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <p className="eyebrow" style={{ margin: 0 }}>Recent Orders in Database</p>
              <Link to="/admin/orders" className="btn-outline-sm" style={{ textDecoration: "none" }}>
                View All Orders →
              </Link>
            </div>

            {stats.recentOrders?.length === 0 ? (
              <div style={{ background: "white", padding: 24, borderRadius: 8, border: "1px solid #eee", textAlign: "center" }}>
                <p style={{ color: "#888", margin: 0 }}>No orders placed in the database yet.</p>
              </div>
            ) : (
              <div style={{ background: "white", borderRadius: 8, border: "1px solid #eee", overflowX: "auto" }}>
                <table className="wf-table">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders?.map((o) => (
                      <tr key={o.id}>
                        <td><strong>{o.id}</strong></td>
                        <td>{o.customerName}</td>
                        <td>{new Date(o.date).toLocaleDateString()}</td>
                        <td><strong>Rs. {o.total}</strong></td>
                        <td>
                          <span className={`pill ${o.status === "Delivered" ? "pill-success" : o.status === "Cancelled" ? "pill-danger" : "pill-warning"}`}>
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </AdminShell>
  );
}

export default AdminDashboard;
