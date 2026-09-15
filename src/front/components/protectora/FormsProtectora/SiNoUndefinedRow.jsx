import React from "react";

// true = Sí, false = No, null = Sin definir
const OPCIONES = [
  { value: true, label: "Sí" },
  { value: false, label: "No" },
  { value: null, label: "Sin definir" },
];

export const SiNoUndefinedRow = ({ label, value, onChange }) => (
  <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
    <span style={{ fontSize: "0.875rem", color: "var(--rp-pino)" }}>{label}</span>
    <div className="d-flex gap-1 p-1 rounded-pill" style={{ backgroundColor: "var(--rp-verde-cl)" }}>
      {OPCIONES.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            type="button"
            key={opt.label}
            onClick={() => onChange(opt.value)}
            className="rounded-pill px-3 py-1 border-0"
            style={{
              border: selected ? "1px solid var(--rp-verde)" : "1px solid transparent",
              backgroundColor: selected ? "var(--rp-papel)" : "transparent",
              color: selected ? "var(--rp-verde-osc)" : "var(--rp-pino)",
              fontSize: "0.75rem",
              fontWeight: selected ? 600 : 400,
              boxShadow: selected ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
              transition: "all 0.15s ease",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  </div>
);
