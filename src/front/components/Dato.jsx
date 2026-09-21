import React from "react";

// una fila etiqueta/valor que desaparece sola si no hay valor
export const Dato = ({ etiqueta, children }) => {
  if (children == null || children === "" || children === false) return null;
  return (
    <div className="d-flex justify-content-between align-items-start border-bottom py-2 gap-3">
      <span style={{ color: "var(--rp-gris)" }}>{etiqueta}</span>
      <span className="fw-semibold text-end">{children}</span>
    </div>
  );
};