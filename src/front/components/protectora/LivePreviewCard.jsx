import React from "react";
import { calcularAgeLabel } from "../../utils/animalAge";
import { ChecklistRow } from "./ChecklistRow";
import { ProgressBar } from "./ProgressBar";

//sticky del lateral del formulario de animal y checklist de datos

export const LivePreviewCard = ({ species, form, mediaItems, coverId }) => {
  const cover = mediaItems.find((item) => item.id === coverId && item.kind === "image");
  const ageLabel = form.unknownBirthdate ? "Edad sin confirmar" : calcularAgeLabel(form.birthdate);
  const displayName = form.name.trim() || "Sin nombre";
  const traitsLabel = form.traits.length > 0 ? form.traits.join(" · ") : "sin carácter";

  const subtitleParts = [ageLabel, form.sex ? (form.sex === "hembra" ? "Hembra" : "Macho") : null].filter(Boolean);

  const requiredChecks = [
    { label: "Especie", done: Boolean(species) },
    { label: "Nombre y sexo", done: form.name.trim().length > 0 },
    { label: "Edad", done: form.unknownBirthdate || Boolean(form.birthdate) },
    { label: "Tamaño", done: Boolean(form.weight) },
    { label: "Al menos una foto", done: mediaItems.length > 0 },
  ];

  const bonusChecks = [
    {
      label: "Vacunas y salud",
      done: Boolean(form.vaccines.trim() || form.hasMicrochip || form.isSterilized || form.testsDone.trim()),
    },
    { label: "Carácter y actividad", done: form.activityIndex != null || form.traits.length > 0 },
    { label: "Historia contada", done: form.story.trim().length > 0 },
    { label: "Un vídeo corto", done: mediaItems.some((item) => item.kind === "video") },
  ];

  const totalChecks = requiredChecks.length + bonusChecks.length;
  const doneChecks = [...requiredChecks, ...bonusChecks].filter((c) => c.done).length;
  const percent = Math.round((doneChecks / totalChecks) * 100);

  return (
    <div style={{ position: "sticky", top: "65px" }}>
      <p
        className="mb-2 text-uppercase fw-semibold"
        style={{ fontSize: "0.7rem", letterSpacing: "0.08em", color: "var(--rp-gris)" }}
      >
        Así se verá en el buscador
      </p>

      <div
        className="rounded-4 overflow-hidden mb-3"
        style={{ backgroundColor: "var(--rp-papel)", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
      >
        <div
          className="position-relative"
          style={{
            height: "180px",
            backgroundColor: "var(--rp-verde-cl)",
            backgroundImage: cover
              ? undefined
              : "radial-gradient(circle, rgba(47,122,85,0.18) 1px, transparent 1px)",
            backgroundSize: "14px 14px",
          }}
        >
          <span
            className="position-absolute top-0 start-0 m-2 badge rounded-pill"
            style={{ backgroundColor: "#f6e6c8", color: "#8a5a13", fontSize: "0.7rem", fontWeight: 600 }}
          >
            Borrador
          </span>

          {cover ? (
            <img src={cover.previewUrl} alt="" className="w-100 h-100" style={{ objectFit: "cover" }} />
          ) : (
            <div className="d-flex align-items-center justify-content-center h-100">
              <span style={{ fontSize: "2rem", opacity: 0.45 }}>🐾</span>
            </div>
          )}
        </div>

        <div className="p-3">
          <div className="d-flex justify-content-between align-items-baseline">
            <h5 className="mb-0 fw-bold" style={{ color: "var(--rp-pino)" }}>
              {displayName}
            </h5>
            {species && (
              <span style={{ fontSize: "0.75rem", color: "var(--rp-gris)" }}>{species}</span>
            )}
          </div>
          <p className="mb-2 mt-1" style={{ fontSize: "0.8rem", color: "var(--rp-gris)" }}>
            {subtitleParts.length > 0 ? subtitleParts.join(" · ") : "—"}
          </p>

          <span
            className="d-inline-block rounded-pill px-2 py-1 mb-3"
            style={{
              backgroundColor: "var(--rp-verde-cl)",
              color: form.traits.length > 0 ? "var(--rp-verde-osc)" : "var(--rp-gris)",
              fontSize: "0.75rem",
            }}
          >
            {traitsLabel}
          </span>

          <div className="d-flex justify-content-between align-items-baseline mb-1">
            <span style={{ fontSize: "0.75rem", color: "var(--rp-gris)" }}>Ficha completa</span>
            <span className="fw-semibold" style={{ fontSize: "0.75rem", color: "var(--rp-pino)" }}>
              {percent} %
            </span>
          </div>
          <ProgressBar percent={percent} />
        </div>
      </div>

      <div
        className="rounded-4 p-3"
        style={{ backgroundColor: "var(--rp-papel)", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
      >
        <p className="fw-semibold mb-2" style={{ fontSize: "0.85rem", color: "var(--rp-pino)" }}>
          Para poder publicar
        </p>
        {requiredChecks.map((check) => (
          <ChecklistRow key={check.label} {...check} />
        ))}

        <p
          className="text-uppercase fw-semibold mt-3 mb-1"
          style={{ fontSize: "0.65rem", letterSpacing: "0.06em", color: "var(--rp-gris)" }}
        >
          Suma solicitudes
        </p>
        {bonusChecks.map((check) => (
          <ChecklistRow key={check.label} {...check} />
        ))}
      </div>
    </div>
  );
};
