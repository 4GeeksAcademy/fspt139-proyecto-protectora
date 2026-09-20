import React from "react";
import { Link } from "react-router-dom";
import { cargarMediaUrl } from "../../services/animalsService";
import { formatearFechaRelativa } from "../../utils/format";
import { ADDOPTION_PROCESS_STATUS_LABELS } from "../../utils/addoptionProcessStatus";

const limiteLabel = (limite) => {
  if (limite === 1) return "Una a la vez";
  if (limite == null) return "Sin límite";
  return `Hasta ${limite}`;
};

export const AdoptionProcessCard = ({ proceso }) => {
  if (!proceso) return null;

  const estado = ADDOPTION_PROCESS_STATUS_LABELS[proceso.status] || { label: proceso.status, badgeClass: "bg-light text-dark border" };
  const animal = proceso.animal;
  const ultima = formatearFechaRelativa(proceso.latest_request_at);

  return (
    <div className="card shadow-sm rounded-4">
      <div className="card-body d-flex gap-3">
        <div
          className="flex-shrink-0 rounded-3 overflow-hidden bg-light d-flex align-items-center justify-content-center d-none d-sm-flex"
          style={{ width: "72px", height: "72px" }}
        >
          {animal?.cover_image ? (
            <img
              src={cargarMediaUrl(animal.cover_image)}
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
            <h5 className="card-title mb-0 fw-bold">{animal?.name || "Animal sin asignar"}</h5>
            <span className={`badge ${estado.badgeClass}`}>{estado.label}</span>
          </div>

          <p className="text-muted small mb-2">
            {limiteLabel(proceso.concurrent_requests_limit)}
            {proceso.contribution_amount != null && (
              <> · {Number(proceso.contribution_amount).toLocaleString("es-ES")} €</>
            )}
            {proceso.end_date && <> · hasta {new Date(proceso.end_date).toLocaleDateString("es-ES")}</>}
          </p>

          <div className="d-flex align-items-center gap-3 mb-2">
            <span className="fw-semibold" style={{ fontSize: "0.9rem" }}>
              {proceso.request_count} {proceso.request_count === 1 ? "solicitud" : "solicitudes"}
            </span>
            {proceso.pending_count > 0 && (
              <span className="badge bg-danger-subtle text-danger-emphasis border border-danger-subtle">
                {proceso.pending_count} {proceso.pending_count === 1 ? "pendiente" : "pendientes"}
              </span>
            )}
          </div>

          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-3">
            <small className="text-muted">
              {ultima ? `Última solicitud ${ultima}` : "Todavía sin solicitudes"}
            </small>
            <Link
              to={`/panel/adopciones/${proceso.addoption_process_id}`}
              className="btn btn-outline-success btn-sm px-3"
            >
              Ver solicitudes <i className="fa fa-arrow-right text-danger ms-1"></i>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
