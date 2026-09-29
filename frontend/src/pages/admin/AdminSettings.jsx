import { useEffect, useState } from "react";
import AdminShell from "./AdminShell";
import { useSettings } from "../../context/SettingsContext";

export default function AdminSettings() {
  const { settings, updateSettings, resetSettings } = useSettings();
  const [form, setForm] = useState({ ...settings });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm({ ...settings });
  }, [settings]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await updateSettings(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message || "Could not save store settings.");
    }
  }

  async function handleReset() {
    if (window.confirm("Are you sure you want to reset all store settings to default?")) {
      setError("");
      try {
        await resetSettings();
        setForm({ ...settings, announcement: "🧵 Free delivery on orders over Rs. 2,500 across Sri Lanka", ownerName: "Thenuwara Hannadige", ownerEmail: "Wosadasula2004@gmail.com", ownerPhone: "071-0835022", freeDeliveryThreshold: 2500, deliveryFee: 250, storeTagline: "Sri Lanka's Premium Quality Thread Supplier" });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } catch (err) {
        setError(err.message || "Could not reset store settings.");
      }
    }
  }

  return (
    <AdminShell active="settings" title="Store &amp; Platform Customization Settings">
      <div className="admin-settings-wrap">
        {saved && (
          <div style={{ background: "#E1F5E8", color: "#1E7E34", border: "1px solid #b7e4c7", padding: "12px 18px", borderRadius: 8, marginBottom: 20, fontSize: 14 }}>
            ✓ Store settings updated successfully! Changes are now live across the storefront.
          </div>
        )}
        {error && <div className="settings-error" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} className="admin-settings-card">
          <div className="settings-section">
            <h3 className="settings-section-title">📢 Storefront Announcement &amp; Highlights</h3>
            <p className="settings-section-desc">Customize the high-priority announcement text shown at the very top of all pages.</p>
            
            <div style={{ marginBottom: 16 }}>
              <label className="label">Top Announcement Bar Text</label>
              <input
                type="text"
                className="input-plain"
                value={form.announcement}
                onChange={(e) => setForm({ ...form, announcement: e.target.value })}
                placeholder="e.g. 🧵 Free delivery on orders over Rs. 2,500 across Sri Lanka"
                required
              />
            </div>

            <div>
              <label className="label">Store Tagline / Subtitle</label>
              <input
                type="text"
                className="input-plain"
                value={form.storeTagline}
                onChange={(e) => setForm({ ...form, storeTagline: e.target.value })}
                placeholder="Store mission or tagline"
              />
            </div>
          </div>

          <div className="settings-section" style={{ marginTop: 28 }}>
            <h3 className="settings-section-title">👤 Proprietor &amp; Store Contact Credentials</h3>
            <p className="settings-section-desc">These official business details appear on all page footers, receipts, and contact channels.</p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
              <div>
                <label className="label">Proprietor / Owner Name *</label>
                <input
                  type="text"
                  className="input-plain"
                  value={form.ownerName}
                  onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="label">Customer Care Phone / WhatsApp *</label>
                <input
                  type="text"
                  className="input-plain"
                  value={form.ownerPhone}
                  onChange={(e) => setForm({ ...form, ownerPhone: e.target.value })}
                  required
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label className="label">Official Contact Email *</label>
                <input
                  type="email"
                  className="input-plain"
                  value={form.ownerEmail}
                  onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          <div className="settings-section" style={{ marginTop: 28 }}>
            <h3 className="settings-section-title">🚚 Shipping &amp; Delivery Thresholds</h3>
            <p className="settings-section-desc">Configure island-wide delivery rules and free shipping qualification.</p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
              <div>
                <label className="label">Free Delivery Minimum Order (Rs.) *</label>
                <input
                  type="number"
                  className="input-plain"
                  value={form.freeDeliveryThreshold}
                  onChange={(e) => setForm({ ...form, freeDeliveryThreshold: Number(e.target.value) })}
                  min="0"
                  required
                />
                <span style={{ fontSize: 11, color: "#888", display: "block", marginTop: 4 }}>
                  Orders equal or above this amount get FREE shipping.
                </span>
              </div>

              <div>
                <label className="label">Standard Island-wide Delivery Fee (Rs.) *</label>
                <input
                  type="number"
                  className="input-plain"
                  value={form.deliveryFee}
                  onChange={(e) => setForm({ ...form, deliveryFee: Number(e.target.value) })}
                  min="0"
                  required
                />
                <span style={{ fontSize: 11, color: "#888", display: "block", marginTop: 4 }}>
                  Charged when order is below free delivery threshold.
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 14, marginTop: 32, alignItems: "center", borderTop: "1px solid #eee", paddingTop: 20 }}>
            <button type="submit" className="modern-add-cart" style={{ padding: "12px 28px", width: "auto" }}>
              💾 Save Store Changes
            </button>
            <button type="button" onClick={handleReset} className="btn-outline-sm" style={{ padding: "10px 18px" }}>
              ↺ Reset to Defaults
            </button>
          </div>
        </form>
      </div>
    </AdminShell>
  );
}
