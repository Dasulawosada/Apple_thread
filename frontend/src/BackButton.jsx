import { useNavigate, Link } from "react-router-dom";

export default function BackButton({ to, fallbackTo = "/", label = "Back", style = {} }) {
  const navigate = useNavigate();

  if (to) {
    return (
      <Link to={to} className="btn-back" style={style}>
        <span className="btn-back-arrow">←</span>
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      className="btn-back"
      onClick={() => navigate(window.history.state?.idx > 0 ? -1 : fallbackTo)}
      style={style}
    >
      <span className="btn-back-arrow">←</span>
      <span>{label}</span>
    </button>
  );
}
