import React from "react";

// icono del numero de paso del formulario
export const OrdinalBadge = ({ number, muted }) => (
    <>
        <span
            className={`d-inline-flex align-items-center justify-content-center fw-bold text-white fw-bold ${muted ? "" : "bg-primary"}`}
            style={{
                width: "24px",
                height: "24px",
                borderRadius: "8px",
                fontSize: "0.7rem",
                backgroundColor: muted ? "var(--rp-linea)" : undefined,
                color: muted ? "var(--rp-gris)" : undefined,
            }}
        >
              {number}
            </span>
    </>
);