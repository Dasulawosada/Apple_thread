function ThreadSpool({ color = "#B23A48", size = 60 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="spool-icon">
      <rect x="8" y="10" width="84" height="9" rx="3" fill="#3A2E22" />
      <rect x="8" y="81" width="84" height="9" rx="3" fill="#3A2E22" />
      <rect x="30" y="14" width="6" height="72" fill="#3A2E22" opacity="0.25" />
      <rect x="64" y="14" width="6" height="72" fill="#3A2E22" opacity="0.25" />
      <circle cx="50" cy="50" r="28" fill={color} />
      <path d="M25 34 Q50 20 75 34" stroke="#ffffff66" strokeWidth="3" fill="none" />
      <path d="M25 50 Q50 38 75 50" stroke="#ffffff40" strokeWidth="2.5" fill="none" />
      <path d="M25 66 Q50 80 75 66" stroke="#ffffff66" strokeWidth="3" fill="none" />
    </svg>
  );
}

export default ThreadSpool;
