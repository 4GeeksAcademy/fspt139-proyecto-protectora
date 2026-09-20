import React from "react";
import {getWhatsappUrl} from "../../utils/format";
import { ADDOPTION_REQUEST_STATUS_LABELS, PENDIENTE } from "../../utils/addoptionRequestStatus";

const Dato = ({ etiqueta, children }) => {
  if (children === null || children === undefined || children === "") return null;
  return (
    <div className="d-flex justify-content-between align-items-start border-bottom py-2 gap-3">
      <span className="text-muted" style={{ fontSize: "0.85rem" }}>{etiqueta}</span>
      <span className="fw-semibold text-end" style={{ fontSize: "0.85rem" }}>{children}</span>
    </div>
  );
};

// modal de solo lectura con el detalle completo de una solicitud: datos del solicitante y
// todas sus respuestas al formulario del proceso; permite aprobar/descartar desde aqui tambien
export const SolicitudAdopcionDetalleModal = ({ solicitud, onCerrar, onAprobar, onDescartar, procesando }) => {
  if (!solicitud) return null;

  const usuario = solicitud.user;
  const estado = ADDOPTION_REQUEST_STATUS_LABELS[solicitud.status] || { label: solicitud.status, badgeClass: "bg-light text-dark border" };
  const nombreCompleto = usuario ? [usuario.name, usuario.last_name1, usuario.last_name2].filter(Boolean).join(" ") : "Usuario";
  const fecha = solicitud.created_at ? new Date(solicitud.created_at).toLocaleString("es-ES") : null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
      style={{ backgroundColor: "rgba(18, 33, 28, 0.55)", zIndex: 1090 }}
      onClick={onCerrar}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="bg-white rounded-4 shadow d-flex flex-column"
        style={{ maxWidth: "620px", width: "100%", maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 pb-3 border-bottom">
          <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
            <h4 className="fw-bold mb-0">{nombreCompleto}</h4>
            <span className={`badge ${estado.badgeClass}`}>{estado.label}</span>
          </div>
          <p className="mb-0 text-muted" style={{ fontSize: "0.875rem" }}>
            {fecha ? `Solicitud enviada el ${fecha}` : "Solicitud de adopción"}
          </p>
        </div>

        <div className="p-4 overflow-auto">
          <h6 className="fw-bold mb-2">Datos de contacto</h6>
          <Dato etiqueta="Email">{usuario?.email}</Dato>
          <Dato etiqueta="Teléfono">

            <a href={getWhatsappUrl(usuario?.phone)}
               target="_blank"
               rel="noopener noreferrer"
               className="text-decoration-none text-muted"
               title="Escribir por WhatsApp">
              <i className="fa-brands fa-whatsapp text-success me-1"></i>
              {usuario?.phone}
            </a>
            </Dato>
          <Dato etiqueta="Dirección">{usuario?.address}</Dato>

          {solicitud.answers?.length > 0 && (
            <>
              <h6 className="fw-bold mt-4 mb-2">Respuestas al formulario</h6>
              <div className="d-flex flex-column gap-3">
                {solicitud.answers.map((respuesta) => (
                  <div key={respuesta.addoption_request_answer_id}>
                    <p className="mb-1 fw-semibold" style={{ fontSize: "0.85rem", color: "var(--rp-verde-osc)" }}>
                      {respuesta.question}
                    </p>
                    <p className="mb-0" style={{ fontSize: "0.9rem" }}>{respuesta.answer}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="d-flex flex-column flex-sm-row justify-content-sm-between gap-2 p-3 border-top">
          <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={onCerrar}>
            Cerrar
          </button>
          {solicitud.status === PENDIENTE && (
            <div className="d-flex flex-column flex-sm-row gap-2">
              <button
                type="button"
                className="btn btn-danger rounded-pill px-4"
                onClick={() => onDescartar(solicitud)}
                disabled={procesando}
              >
                Descartar <i className="fa fa-trash"></i>
              </button>
              <button
                type="button"
                className="btn btn-success rounded-pill px-4"
                onClick={() => onAprobar(solicitud)}
                disabled={procesando}
              >
                Aprobar <i className="fa fa-check"></i>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
