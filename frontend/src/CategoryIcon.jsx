function CategoryIcon({ type, color = "#B23A48" }) {
  const common = { fill: "none", stroke: color, strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" };
  if (type === "spool") {
    return (
      <svg width="34" height="34" viewBox="0 0 40 40" {...common}>
        <rect x="10" y="6" width="20" height="4" rx="1" />
        <rect x="10" y="30" width="20" height="4" rx="1" />
        <rect x="17" y="10" width="6" height="20" />
        <ellipse cx="20" cy="20" rx="8" ry="8" />
      </svg>
    );
  }
  if (type === "hoop") {
    return (
      <svg width="34" height="34" viewBox="0 0 40 40" {...common}>
        <circle cx="20" cy="20" r="14" />
        <circle cx="20" cy="20" r="9" />
        <path d="M20 11v3M20 26v3M11 20h3M26 20h3" />
      </svg>
    );
  }
  if (type === "cones") {
    return (
      <svg width="34" height="34" viewBox="0 0 40 40" {...common}>
        <path d="M12 30V14a3 3 0 013-3h0a3 3 0 013 3v16" />
        <path d="M22 30V16a3 3 0 013-3h0a3 3 0 013 3v14" />
        <line x1="8" y1="30" x2="32" y2="30" />
      </svg>
    );
  }
  return (
    <svg width="34" height="34" viewBox="0 0 40 40" {...common}>
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="28" r="4" />
      <line x1="15" y1="15" x2="32" y2="32" />
      <line x1="15" y1="25" x2="32" y2="8" />
    </svg>
  );
}

export default CategoryIcon;
