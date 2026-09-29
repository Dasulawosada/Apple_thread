import { useState } from "react";
import "../App.css";
import SiteHeader from "../SiteHeader";
import { api } from "../api/client";
import { useSettings } from "../context/SettingsContext";
import BackButton from "../BackButton";

function Contact() {
  const { settings } = useSettings();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await api.sendContact(form);
      setSent(true);
      setForm({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setSent(false), 4000);
    } catch (err) {
      setError(err.message || "Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="site-shell">
      <SiteHeader active="contact" />

      <div className="page-content contact-page-content">
        <div className="page-back-row"><BackButton /></div>
        <h1 className="page-title" style={{ marginBottom: 20 }}>Contact Us &amp; Customer Support</h1>

        {sent && (
          <div style={{ background: "#DEF7EC", color: "#03543F", padding: "14px 18px", borderRadius: 8, marginBottom: 20, fontSize: 14 }}>
            ✓ Thank you! Your message has been saved to our database. Our team will contact you shortly.
          </div>
        )}

        {error && (
          <div style={{ background: "#FDE8E8", color: "#9B1C1C", padding: "14px 18px", borderRadius: 8, marginBottom: 20, fontSize: 14 }}>
            ⚠️ {error}
          </div>
        )}

        <div className="contact-layout">
          <form className="checkout-form" onSubmit={handleSubmit}>
            <h2 style={{ fontSize: 16, marginBottom: 14 }}>Send Us an Inquiry</h2>
            <div style={{ marginBottom: 12 }}>
              <span className="label">Your Name *</span>
              <input
                className="input-plain"
                placeholder="Full name"
                required
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <span className="label">Email Address *</span>
              <input
                className="input-plain"
                placeholder="you@example.com"
                type="email"
                required
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <span className="label">Subject</span>
              <input
                className="input-plain"
                placeholder="e.g. Bulk order inquiry / Thread color availability"
                value={form.subject}
                onChange={(e) => update("subject", e.target.value)}
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <span className="label">Your Message *</span>
              <textarea
                className="input-plain"
                placeholder="Write your question or request..."
                rows={4}
                required
                value={form.message}
                onChange={(e) => update("message", e.target.value)}
              />
            </div>

            <button
              className="modern-add-cart"
              type="submit"
              disabled={submitting}
              style={{ minWidth: 160 }}
            >
              {submitting ? "Sending..." : "Send Message"}
            </button>
          </form>

          <div className="cart-summary">
            <h2 style={{ fontSize: 16, marginBottom: 12 }}>Store Contact Details</h2>
            <p style={{ fontSize: 13, color: "#555", lineHeight: 2.2 }}>
              📍 <strong>Location:</strong> Colombo, Sri Lanka<br />
              📞 <strong>Hotline:</strong> {settings.ownerPhone}<br />
              ✉️ <strong>Email:</strong> {settings.ownerEmail}<br />
              ⏰ <strong>Hours:</strong> Mon – Sat: 8:30 AM – 6:00 PM
            </p>

            <h2 style={{ fontSize: 16, marginTop: 24, marginBottom: 12 }}>Frequently Asked Questions</h2>
            <div style={{ fontSize: 13, color: "#666", lineHeight: 1.8 }}>
              <p style={{ margin: "0 0 10px" }}>
                <strong>Q: How long does delivery take?</strong><br />
                Island-wide delivery within 2-3 working days.
              </p>
              <p style={{ margin: "0 0 10px" }}>
                <strong>Q: Do you offer bulk discounts for garment factories?</strong><br />
                Yes! Please message us with required spool quantities.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
