import React from "react";
import { formatearFechaRelativa } from "../../utils/format";
import { ADDOPTION_REQUEST_STATUS_LABELS, PENDIENTE } from "../../utils/addoptionRequestStatus";


export const SolicitudAdopcionRow = ({ solicitud, seleccionada, onAlternarSeleccion, onVer, onAprobar, procesando, mostrarInput= true }) => {
  const usuario = solicitud.user;
  const estado = ADDOPTION_REQUEST_STATUS_LABELS[solicitud.status] || { label: solicitud.status, badgeClass: "bg-light text-dark border" };
  const nombreCompleto = usuario ? [usuario.name, usuario.last_name1].filter(Boolean).join(" ") : "Usuario";
  const esPendiente = solicitud.status === PENDIENTE;
  const ultima = formatearFechaRelativa(solicitud.created_at);

  return (
    <div
      className={ `d-flex align-items-center gap-2 px-2 py-1 border-bottom ${ mostrarInput ? "justify-content-between flex-wrap" : "" }`}
      style={{ backgroundColor: seleccionada ? "var(--rp-verde-cl)" : undefined, fontSize: "0.9rem" }}
    >
      { mostrarInput && (
      <label
        className="d-flex align-items-center justify-content-center flex-shrink-0"
        style={{ width: "2.75rem", height: "2.75rem", margin: "-0.75rem 0", cursor: esPendiente ? "pointer" : "default" }}
      >
        <input
          type="checkbox"
          className="form-check-input"
          style={{ width: "1.2rem", height: "1.2rem", cursor: "inherit" }}
          checked={seleccionada}
          disabled={!esPendiente}
          onChange={() => onAlternarSeleccion(solicitud.addoption_request_id)}
          aria-label={`Seleccionar solicitud de ${nombreCompleto}`}
        />
      </label>
          )}

      <div className="ms-3 flex-grow-1 min-w-0 d-flex align-items-center gap-3" role="button" onClick={() => onVer(solicitud)}>
        <span className="fw-semibold text-truncate" style={{ minWidth: "160px" }}>{nombreCompleto}</span>
        <span className="text-muted text-truncate d-none d-md-inline">{usuario?.email}</span>
      </div>

      <span className={`badge ${estado.badgeClass} flex-shrink-0`}>{estado.label}</span>
      <small className="text-muted flex-shrink-0 d-none d-sm-inline" style={{ minWidth: "90px" }}>{ultima}</small>

      <div className="d-flex gap-2 flex-shrink-0 justify-content-end w-100 ">
        <button type="button" className="btn btn-link btn-sm px-3 text-secondary" onClick={() => onVer(solicitud)}>
          Ver Detalles
        </button>
        {esPendiente && (
          <button
            type="button"
            className="btn btn-success rounded-pill btn-sm px-3"
            onClick={() => onAprobar(solicitud)}
            disabled={procesando}
          >
            Aprobar <i className="fa fa-check"></i>
          </button>
        )}
      </div>
    </div>
  );
};
