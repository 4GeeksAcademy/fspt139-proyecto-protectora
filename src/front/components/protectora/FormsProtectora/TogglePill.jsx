import React from "react";

export const TogglePill = ({ label, checked, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="d-inline-flex align-items-center gap-2 border rounded-pill px-3 py-2"
    style={{
      borderColor: checked ? "var(--rp-verde)" : "var(--rp-linea)",
      backgroundColor: checked ? "var(--rp-verde-cl)" : "var(--rp-papel)",
      fontSize: "0.875rem",
      color: "var(--rp-pino)",
      transition: "all 0.15s ease",
    }}
  >
    <span
      className="d-inline-flex align-items-center justify-content-center rounded-circle"
      style={{ width: "16px", height: "16px", border: `2px solid ${checked ? "var(--rp-verde)" : "#c7c1b2"}` }}
    >
      {checked && (
        <span className="rounded-circle" style={{ width: "8px", height: "8px", backgroundColor: "var(--rp-verde)" }} />
      )}
    </span>
    {label}
  </button>
);
