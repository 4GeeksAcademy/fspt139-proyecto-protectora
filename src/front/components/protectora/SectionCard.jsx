import React from "react";
import { OrdinalBadge } from "../OrdinalBadge";

//cada uno de los bloques de secciones del formulario de animal
export const SectionCard = ({ number, title, subtitle, unlocked, children }) => (
  <div
    className="p-4 p-md-5 border-0 rounded-4 shadow-sm text-start mb-4"
    style={{
      backgroundColor: unlocked ? "var(--rp-papel)" : "var(--rp-hueso)",
      opacity: unlocked ? 1 : 0.55,
      transition: "opacity 0.2s ease, background-color 0.2s ease",
    }}
    {...(!unlocked ? { inert: "" } : {})}
  >
    <div className="d-flex align-items-center gap-2 mb-1">
      <OrdinalBadge number={number} muted={!unlocked} />
      <h4 className="mb-0">{title}</h4>
    </div>
    <p className="mb-1 text-muted small">{subtitle}</p>
    {!unlocked && (
      <p className="mb-3" style={{ color: "var(--rp-gris)", fontSize: "0.8rem" }}>
        Completa la identidad para continuar.
      </p>
    )}
    {unlocked && <div className="mb-3" />}
    {children}
  </div>
);
