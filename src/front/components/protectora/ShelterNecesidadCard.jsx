import React from "react";
import { Link } from "react-router-dom";
import { ProgressBar } from "./ProgressBar";
import { calcularDeadlineLabel, esUrgente } from "../../utils/necesidadDeadline";
import { cargarMediaUrl } from "../../services/animalsService";

//TODO: determinare los estados de una necesidad

const getEstadoDisplay = (necesidad) => {
  if (necesidad.status === "borrador") return { label: "Borrador", badgeClass: "bg-light text-dark border" };
  if (necesidad.status === "cerrada") return { label: "Cerrada", badgeClass: "bg-secondary" };
  if (esUrgente(necesidad.request_deadline)) return { label: "Urgente", badgeClass: "bg-danger" };
  return { label: "Abierta", badgeClass: "bg-warning text-dark" };
};

export const ShelterNecesidadCard = ({ necesidad, requestTypeName, animalName }) => {
  if (!necesidad) return null;

  const estado = getEstadoDisplay(necesidad);
  const tieneObjetivo = necesidad.amount_needed != null;
  const objetivoLabel = tieneObjetivo
    ? `0/${Number(necesidad.amount_needed)} ${necesidad.unit || ""}`.trim()
    : `0 · sin tope`;

  const percent = 0;

  const esCerrada = necesidad.status === "cerrada";

  return (
    <div className="card shadow-sm rounded-4">
      <div className="card-body d-flex gap-3">
        <div
          className="flex-shrink-0 rounded-3 overflow-hidden bg-light d-flex align-items-center justify-content-center d-none d-sm-flex"
          style={{ width: "72px", height: "72px" }}
        >
          {necesidad.cover_image ? (
            <img
              src={cargarMediaUrl(necesidad.cover_image)}
              alt=""
              className="w-100 h-100"
              style={{ objectFit: "cover" }}
            />
          ) : (
            <span style={{ fontSize: "1.3rem", opacity: 0.35 }}>🐾</span>
          )}
        </div>

        <div className="flex-grow-1 min-w-0">
          <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
            <h5 className="card-title mb-0 fw-bold">{necesidad.name}</h5>
            <span className={`badge ${estado.badgeClass}`}>{estado.label}</span>
          </div>

          <p className="text-muted small mb-2">
            {animalName ? (
              <span className="d-inline-flex align-items-center gap-2">
                <span
                  className="d-inline-flex align-items-center justify-content-center rounded-circle bg-light border"
                  style={{ width: "22px", height: "22px", fontSize: "0.7rem" }}
                >
                  {animalName.charAt(0).toUpperCase()}
                </span>
                {animalName}
              </span>
            ) : (
              "Necesidad general"
            )}
          </p>

          <div className="mb-2">
            <strong style={{ fontSize: "0.9rem" }}>{objetivoLabel}</strong>
            <div className="mt-1">
              <ProgressBar percent={percent} />
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-3">
            <small className="text-muted">
              {requestTypeName || "Necesidad"} · {calcularDeadlineLabel(necesidad.request_deadline)}
            </small>
            <Link
              to={`/panel/necesidades/${necesidad.request_id}`}
              className="btn btn-outline-success btn-sm rounded-pill px-3"
            >
              {esCerrada ? "Ver" : "Gestionar"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
