import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";
import { useAuth } from "../../context/AuthContext";
import BackButton from "../../BackButton";

function AdminLogin() {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await adminLogin(username, password);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.message || "Invalid username or password.");
    }
  }

  return (
    <div className="site-shell" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <div className="auth-card">
        <div className="page-back-row"><BackButton fallbackTo="/" /></div>
        <h2 style={{ textAlign: "center" }}>🔒 Apple Thread Admin</h2>
        <p style={{ textAlign: "center", fontSize: 11, color: "#999", marginBottom: 18 }}>
          Demo credentials — username <b>admin</b>, password <b>admin123</b>
        </p>
        <form onSubmit={handleSubmit}>
          <input className="input-plain" placeholder="Admin username" value={username} onChange={(e) => setUsername(e.target.value)} style={{ marginBottom: 10 }} />
          <input className="input-plain" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ marginBottom: 10 }} />
          {error && <p style={{ color: "var(--berry)", fontSize: 12, marginBottom: 10 }}>{error}</p>}
          <button className="modern-add-cart" style={{ width: "100%" }} type="submit">Login to Dashboard</button>
        </form>
        <p style={{ textAlign: "center", fontSize: 12, marginTop: 16 }}>
          <a href="/" className="link-back">← Back to customer site</a>
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;
