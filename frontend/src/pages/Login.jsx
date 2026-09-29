import { useEffect, useRef, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import "../App.css";
import SiteHeader from "../SiteHeader";
import { useAuth } from "../context/AuthContext";
import BackButton from "../BackButton";

const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

function Login() {
  const { user, loginWithEmail, registerWithEmail, loginWithGoogleToken } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const googleBtnRef = useRef(null);

  const [mode, setMode] = useState(searchParams.get("mode") === "register" ? "register" : "login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/profile");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (window.google && GOOGLE_CLIENT_ID.startsWith("YOUR_") === false) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          loginWithGoogleToken(response.credential);
          navigate("/profile");
        },
      });
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: "outline",
        size: "large",
        width: 280,
      });
      setGoogleReady(true);
    }
  }, [loginWithGoogleToken, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (mode === "register") {
        if (!name.trim()) throw new Error("Please enter your name.");
        if (!email.trim() || !password) throw new Error("Email and password are required.");
        if (password.length < 6) throw new Error("Password must be at least 6 characters.");

        await registerWithEmail(name, email, password);
      } else {
        if (!email.trim() || !password) throw new Error("Email and password are required.");
        await loginWithEmail(email, password);
      }
      navigate("/profile");
    } catch (err) {
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="site-shell">
      <SiteHeader active="login" />

      <div className="auth-card">
        <div className="page-back-row"><BackButton fallbackTo="/" /></div>
        {/* Tab switch between Login and Register */}
        <div style={{ display: "flex", borderBottom: "1px solid #e0e0e0", marginBottom: 20 }}>
          <button
            type="button"
            style={{
              flex: 1,
              padding: "10px",
              background: "none",
              border: "none",
              borderBottom: mode === "login" ? "3px solid var(--navy)" : "3px solid transparent",
              fontWeight: mode === "login" ? 700 : 500,
              color: mode === "login" ? "var(--navy)" : "#888",
              cursor: "pointer",
              fontSize: 14,
            }}
            onClick={() => { setMode("login"); setError(""); }}
          >
            Log In
          </button>
          <button
            type="button"
            style={{
              flex: 1,
              padding: "10px",
              background: "none",
              border: "none",
              borderBottom: mode === "register" ? "3px solid var(--navy)" : "3px solid transparent",
              fontWeight: mode === "register" ? 700 : 500,
              color: mode === "register" ? "var(--navy)" : "#888",
              cursor: "pointer",
              fontSize: 14,
            }}
            onClick={() => { setMode("register"); setError(""); }}
          >
            Create Account
          </button>
        </div>

        <h2 style={{ textAlign: "center", marginBottom: 16, fontSize: 20 }}>
          {mode === "register" ? "Join Apple Thread" : "Welcome Back"}
        </h2>

        {error && (
          <div style={{ background: "#FDE8E8", color: "#9B1C1C", padding: "10px 14px", borderRadius: 6, marginBottom: 14, fontSize: 13 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <div style={{ marginBottom: 12 }}>
              <span className="label">Full Name *</span>
              <input
                className="input-plain"
                placeholder="e.g. Kasun Fernando"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div style={{ marginBottom: 12 }}>
            <span className="label">Email Address *</span>
            <input
              className="input-plain"
              placeholder="you@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <span className="label">Password *</span>
            <input
              className="input-plain"
              placeholder={mode === "register" ? "At least 6 characters" : "Enter your password"}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            className="modern-add-cart"
            style={{ width: "100%", padding: "11px 0" }}
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Processing..." : mode === "register" ? "Create Account" : "Log In"}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: "center" }}>
          <div ref={googleBtnRef} style={{ display: "flex", justifyContent: "center", marginBottom: googleReady ? 14 : 0 }} />

          <p style={{ textAlign: "center", fontSize: 11, color: "#999", margin: "14px 0" }}>— or quick test login —</p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <button
              type="button"
              className="btn-outline-sm"
              onClick={() => {
                setEmail("customer@applethread.lk");
                setPassword("user123");
                setMode("login");
              }}
            >
              Fill Sample Customer
            </button>
          </div>
        </div>

        <p style={{ textAlign: "center", fontSize: 12, marginTop: 20 }}>
          <Link to="/" className="link-back">← Back to Store</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
