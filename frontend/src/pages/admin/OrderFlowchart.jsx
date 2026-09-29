import { Link } from "react-router-dom";

export default function OrderFlowchart({ orderStages = [], totalRevenue = 0 }) {
  const stageMap = {
    Confirmed: {
      icon: "📋",
      label: "1. Confirmed",
      desc: "New orders received & verified",
      color: "#D97706",
      bg: "#FEF3C7",
      border: "#F59E0B",
    },
    Processing: {
      icon: "📦",
      label: "2. Processing",
      desc: "Items picked, packed & spooled",
      color: "#2563EB",
      bg: "#DBEAFE",
      border: "#3B82F6",
    },
    Shipped: {
      icon: "🚚",
      label: "3. Dispatched",
      desc: "With courier for island-wide delivery",
      color: "#7C3AED",
      bg: "#EDE9FE",
      border: "#8B5CF6",
    },
    Delivered: {
      icon: "✅",
      label: "4. Delivered",
      desc: "Successfully handed over to customer",
      color: "#059669",
      bg: "#D1FAE5",
      border: "#10B981",
    },
  };

  const getStageData = (name) => {
    return orderStages.find((s) => s.stage.toLowerCase() === name.toLowerCase()) || { count: 0, revenue: 0 };
  };

  const cancelledData = getStageData("Cancelled");

  return (
    <div className="flowchart-card">
      <div className="flowchart-header">
        <div>
          <h3 className="flowchart-title">📊 Order Fulfillment Lifecycle Flowchart</h3>
          <p className="flowchart-subtitle">
            Visual pipeline tracking order status progression from placement to final doorstep delivery
          </p>
        </div>
        <Link to="/admin/orders" className="btn-outline-sm">
          Manage All Orders →
        </Link>
      </div>

      {/* Main Pipeline Stages */}
      <div className="flowchart-pipeline">
        {["Confirmed", "Processing", "Shipped", "Delivered"].map((stageKey, idx, arr) => {
          const config = stageMap[stageKey];
          const data = getStageData(stageKey);

          return (
            <div key={stageKey} className="flowchart-node-wrapper">
              <Link
                to="/admin/orders"
                className="flowchart-node"
                style={{
                  borderTop: `4px solid ${config.border}`,
                }}
                title={`Click to view ${data.count} ${stageKey} orders`}
              >
                <div className="flowchart-node-badge" style={{ background: config.bg, color: config.color }}>
                  {config.icon}
                </div>
                <div className="flowchart-node-content">
                  <div className="flowchart-node-label">{config.label}</div>
                  <div className="flowchart-node-desc">{config.desc}</div>
                  <div className="flowchart-node-metrics">
                    <span className="flowchart-count" style={{ color: config.color }}>
                      <strong>{data.count}</strong> order{data.count === 1 ? "" : "s"}
                    </span>
                    <span className="flowchart-revenue">
                      Rs. {data.revenue.toLocaleString()}
                    </span>
                  </div>
                </div>
              </Link>

              {idx < arr.length - 1 && (
                <div className="flowchart-arrow">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12H19M19 12L12 5M19 12L12 19"
                      stroke="#888"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Cancelled/Exception Branch */}
      <div className="flowchart-exception-bar">
        <span className="exception-indicator">
          <strong>Exceptions &amp; Returns:</strong> {cancelledData.count} order(s) Cancelled (Rs. {cancelledData.revenue.toLocaleString()})
        </span>
        <span className="exception-hint">
          Tip: Click any stage above to instantly filter and manage corresponding orders in the database.
        </span>
      </div>
    </div>
  );
}
