import React from "react";
import {formatearCantidad, formatearFechaRelativa, getWhatsappUrl} from "../../utils/format";





export const ContribucionRow = ({ contribucion, unit, seleccionada, onAlternarSeleccion, onResponder, mostrarInput = true }) => {
  const usuario = contribucion.user;
  const nombreCompleto = usuario ? [usuario.name, usuario.last_name1].filter(Boolean).join(" ") : "Usuario";
  const respondida = Boolean(contribucion.shelter_answer);
  const fecha = formatearFechaRelativa(contribucion.created_at);

  const cantidadConUnidad =
    contribucion.amount != null
      ? unit === "€"
        ? `${formatearCantidad(contribucion.amount)}€`
        : `${formatearCantidad(contribucion.amount)}${unit ? ` ${unit}` : ""}`
      : null;

  const aportacion = [cantidadConUnidad, contribucion.details].filter(Boolean).join(" · ");

  return (
    <div
      className={`d-flex align-items-start gap-2 px-2 py-2 border-bottom ${mostrarInput ? "justify-content-between flex-wrap" : ""}`}
      style={{ backgroundColor: seleccionada ? "var(--rp-verde-cl)" : undefined, fontSize: "0.9rem" }}
    >
      {mostrarInput && (
        <label
          className="d-flex align-items-center justify-content-center flex-shrink-0"
          style={{ width: "2.75rem", height: "2.75rem", margin: "-0.5rem 0", cursor: respondida ? "default" : "pointer" }}
        >
          <input
            type="checkbox"
            className="form-check-input"
            style={{ width: "1.2rem", height: "1.2rem", cursor: "inherit" }}
            checked={seleccionada}
            disabled={respondida}
            onChange={() => onAlternarSeleccion(contribucion.user_request_id)}
            aria-label={`Seleccionar contribución de ${nombreCompleto}`}
          />
        </label>
      )}

      <div className="ms-3 flex-grow-1 min-w-0">
        <div className="d-flex align-items-start gap-3 flex-wrap">
          <div className="d-flex flex-column me-3  align-items-start">
            <span className="fw-semibold" style={{ minWidth: "160px" }}>{nombreCompleto}</span>
            {(usuario?.email) && (
              <span className="text-muted">{usuario?.email}</span>
            )}
            {(usuario?.phone) && (
                  <span className="text-muted">
                 <a href={getWhatsappUrl(usuario?.phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-decoration-none text-muted"
                    title="Escribir por WhatsApp">
                <i className="fa-brands fa-whatsapp text-success me-1"></i>
                   {usuario?.phone}
              </a>
              </span>)}
          </div>
          <div className="d-flex flex-column me-3 align-items-start">
            <b className="text-muted">Colabora con:</b> {aportacion && <span className="text-truncate">{aportacion}</span>}
          </div>
        </div>
        {contribucion.shelter_answer && (
          <p className="mb-0 mt-2 border-top border-1 pt-1 text-muted text-truncate" style={{ fontSize: "0.8rem" }}>
            Respuesta: {contribucion.shelter_answer}
          </p>
        )}
      </div>
<div className="d-flex flex-row justify-content-between align-items-center w-100">
      <span className={`badge ${respondida ? "bg-success" : "bg-warning text-dark"} flex-shrink-0`}>
        {respondida ? "Respondida" : "Pendiente"}
      </span>
      {/*<small className="text-muted" style={{ minWidth: "90px" }}>{fecha}</small>*/}
      <div className="d-flex gap-2">
        <button type="button" className="btn btn-outline-success rounded-pill btn-sm px-3" onClick={() => onResponder(contribucion)}>
          {respondida ? "Editar respuesta" : "Responder"}
        </button>
      </div>
</div>
    </div>
  );
};
