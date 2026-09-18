import React from "react";
import { ChecklistRow } from "./ChecklistRow";
import { ProgressBar } from "./ProgressBar";

//sticky del lateral del formulario de necesidad: como lo verá quien colabora + checklist para publicar
export const NecesidadPreviewCard = ({ requestType, form, mediaItems = [], coverId }) => {
  const cover = mediaItems.find((item) => item.id === coverId && item.kind === "image");
  const displayName = form.name.trim() || "Sin nombre.";
  const displayDescription = form.description.trim() || "Sin descripción. (campo requerido)";

  const objetivoLabel = form.hasLimit
    ? `0/${form.amountNeeded || "—"} ${form.unit}`
    : `0 ${form.unit}`;
  const percent = form.hasLimit && Number(form.amountNeeded) > 0 ? 0 : 0;

  const fechaLabel = form.hasDeadline
    ? (form.requestDeadline || "Fecha límite pendiente de elegir")
    : "Sin fecha límite";

  const checks = [
    { label: "Tipo de ayuda", done: Boolean(requestType) },
    { label: "Nombre de la necesidad", done: form.name.trim().length > 0 },
    { label: "Cantidad objetivo", done: !form.hasLimit || Boolean(form.amountNeeded) },
    { label: "Fecha límite o sin límite", done: !form.hasDeadline || Boolean(form.requestDeadline) },
  ];

  return (
    <div style={{ position: "sticky", top: "65px" }}>
      <p
        className="mb-2 text-uppercase fw-semibold"
        style={{ fontSize: "0.7rem", letterSpacing: "0.08em", color: "var(--rp-gris)" }}
      >
        Así lo verá quien colabora
      </p>

      <div
        className="rounded-4 overflow-hidden mb-3"
        style={{ backgroundColor: "var(--rp-papel)", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
      >
        {mediaItems.length > 0 && (
          <div
            className="d-flex align-items-center justify-content-center"
            style={{ height: "120px", backgroundColor: "var(--rp-verde-cl)" }}
          >
            {cover ? (
              <img src={cover.previewUrl} alt="" className="w-100 h-100" style={{ objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize: "1.5rem", opacity: 0.45 }}>🐾</span>
            )}
          </div>
        )}

        <div className="p-3">
        <div className="d-flex gap-2 mb-2">
          <span
            className="d-inline-block rounded-pill px-2 py-1"
            style={{ backgroundColor: "var(--rp-verde-cl)", color: "var(--rp-verde-osc)", fontSize: "0.75rem" }}
          >
            {requestType?.name || "Sin tipo"}
          </span>
          <span
            className="d-inline-block rounded-pill px-2 py-1"
            style={{ backgroundColor: "#f6e6c8", color: "#8a5a13", fontSize: "0.75rem" }}
          >
            {form.status === "abierta" ? "Abierta" : "Borrador"}
          </span>
        </div>

        <h5 className="mb-1 fw-bold" style={{ color: "var(--rp-pino)" }}>
          {displayName}
        </h5>
        <p className="mb-3" style={{ fontSize: "0.8rem", color: "var(--rp-gris)" }}>
          {displayDescription}
        </p>

        <div className="d-flex justify-content-between align-items-baseline mb-1">
          <span className="fw-semibold" style={{ fontSize: "0.85rem", color: "var(--rp-pino)" }}>
            {objetivoLabel}
          </span>
          <span style={{ fontSize: "0.75rem", color: "var(--rp-gris)" }}>{percent} %</span>
        </div>
        <div className="mb-3">
          <ProgressBar percent={percent} />
        </div>

        <p className="mb-0" style={{ fontSize: "0.75rem", color: "var(--rp-gris)" }}>
          {fechaLabel}
        </p>
        </div>
      </div>

      <div
        className="rounded-4 p-3"
        style={{ backgroundColor: "var(--rp-papel)", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
      >
        <p className="fw-semibold mb-2" style={{ fontSize: "0.85rem", color: "var(--rp-pino)" }}>
          Para poder publicar
        </p>
        {checks.map((check) => (
          <ChecklistRow key={check.label} {...check} />
        ))}
      </div>
    </div>
  );
};
