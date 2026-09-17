import React from "react";

//fila de check usada en las vistas previas de los formularios de protectora (animal, necesidad...)
export const ChecklistRow = ({ label, done }) => (
  <div className="d-flex align-items-center gap-2 py-1">
    <span
      className="d-inline-flex align-items-center justify-content-center flex-shrink-0 rounded-circle"
      style={{
        width: "18px",
        height: "18px",
        border: `2px solid ${done ? "var(--rp-verde)" : "gray"}`,
        backgroundColor: done ? "var(--rp-verde)" : "transparent",
        transition: "all 0.2s ease",
      }}
    >
      {done && (
        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
          <path d="M1 3.5L3.2 5.7L8 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
    <span
      style={{
        fontSize: "0.85rem",
        color: done ? "var(--rp-pino)" : "var(--rp-gris)",
        transition: "color 0.2s ease",
      }}
    >
      {label}
    </span>
  </div>
);
