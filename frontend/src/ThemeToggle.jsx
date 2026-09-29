import { useState, useEffect } from "react";

function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem("apple-thread-theme") === "dark";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    document.body.classList.toggle("dark-mode", dark);
    try {
      localStorage.setItem("apple-thread-theme", dark ? "dark" : "light");
    } catch (e) {
      console.error("Failed to save theme:", e);
    }
  }, [dark]);

  return (
    <button
      className={`theme-toggle ${dark ? "is-dark" : "is-light"}`}
      onClick={() => setDark(!dark)}
      aria-pressed={dark}
      aria-label="Toggle dark mode"
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span className="theme-toggle-track">
        <span className="theme-toggle-thumb">
          {dark ? (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
            </svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="5" />
              <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="12" y1="1.5" x2="12" y2="4" />
                <line x1="12" y1="20" x2="12" y2="22.5" />
                <line x1="1.5" y1="12" x2="4" y2="12" />
                <line x1="20" y1="12" x2="22.5" y2="12" />
                <line x1="4.2" y1="4.2" x2="6" y2="6" />
                <line x1="18" y1="18" x2="19.8" y2="19.8" />
                <line x1="4.2" y1="19.8" x2="6" y2="18" />
                <line x1="18" y1="6" x2="19.8" y2="4.2" />
              </g>
            </svg>
          )}
        </span>
      </span>
      <span className="theme-toggle-label">{dark ? "Dark" : "Light"}</span>
    </button>
  );
}

export default ThemeToggle;