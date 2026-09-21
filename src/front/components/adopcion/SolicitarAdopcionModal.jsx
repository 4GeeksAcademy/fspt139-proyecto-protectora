import React, { useEffect, useRef, useState } from "react";
import { crearSolicitudAdopcion } from "../../services/addoptionRequestService";

// modal publico para que un usuario logueado solicite la adopcion de un animal: contesta a las
// preguntas del proceso vigente y, si todo va bien, crea la addoption_request correspondiente
export const SolicitarAdopcionModal = ({ animal, proceso, onCerrar, onSolicitudEnviada }) => {
  const [paso, setPaso] = useState("formulario"); // "formulario" | "exito"
  const preguntas = (proceso.questions || []).slice().sort((a, b) => a.position - b.position);
  const [respuestas, setRespuestas] = useState(() =>
    Object.fromEntries(preguntas.map((p) => [p.addoption_request_question_id, ""]))
  );
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const errorRef = useRef(null);

  // cuando aparece un error, el foco salta al mensaje: en un modal largo si no, el usuario
  // no se entera de por que no se ha enviado la solicitud
  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  const handleCambiarRespuesta = (preguntaId, valor) => {
    setRespuestas((prev) => ({ ...prev, [preguntaId]: valor }));
  };

  // valida y, si esta todo contestado, no envia todavia: pide una doble confirmacion antes de
  // crear la solicitud (es vinculante para el usuario, conviene que revise lo escrito)
  const handleEnviar = (e) => {
    e.preventDefault();
    setError("");

    const sinContestar = preguntas.some((p) => !respuestas[p.addoption_request_question_id]?.trim());
    if (sinContestar) {
      setError("Contesta a todas las preguntas antes de enviar la solicitud.");
      return;
    }

    setMostrarConfirmacion(true);
  };

  // cerrar la confirmacion nunca envia nada: el usuario vuelve al formulario con sus respuestas intactas
  const handleCancelarConfirmacion = () => {
    setMostrarConfirmacion(false);
  };

  const handleConfirmarEnvio = async () => {
    setEnviando(true);
    try {
      const solicitud = await crearSolicitudAdopcion(
        animal.animal_id,
        preguntas.map((p) => ({
          addoption_request_question_id: p.addoption_request_question_id,
          answer: respuestas[p.addoption_request_question_id].trim(),
        }))
      );
      onSolicitudEnviada?.(solicitud);
      setMostrarConfirmacion(false);
      setPaso("exito");
    } catch (err) {
      setMostrarConfirmacion(false);
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
      style={{ backgroundColor: "rgba(18, 33, 28, 0.55)", zIndex: 1090 }}
      onClick={onCerrar}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="bg-white rounded-4 shadow d-flex flex-column"
        style={{ maxWidth: "560px", width: "100%", maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {paso === "formulario" ? (
          <>
            <div className="p-4 pb-3 border-bottom">
              <h4 className="fw-bold mb-2">Solicitar adopción</h4>
              <p className="mb-0 text-muted" style={{ fontSize: "0.875rem" }}>
                Contesta a estas preguntas para que la protectora conozca tu situación antes de
                valorar tu solicitud para <b>{animal.name}</b>.
              </p>
            </div>

            <form onSubmit={handleEnviar} className="d-flex flex-column overflow-hidden">
              <div className="p-4 overflow-auto">
                {error && (
                  <div className="alert alert-danger" role="alert" tabIndex={-1} ref={errorRef}>
                    {error}
                  </div>
                )}

                {(proceso.requirements?.length > 0 || proceso.contribution_amount != null) && (
                  <div className="mb-4 p-3 rounded" style={{ backgroundColor: "var(--rp-verde-cl)" }}>
                    {proceso.requirements?.length > 0 && (
                      <>
                        <p className="rp-eyebrow mb-1">Requisitos que acepta la protectora</p>
                        <ul className="mb-0" style={{ fontSize: "0.875rem" }}>
                          {proceso.requirements.map((r) => (
                            <li key={r.id}>{r.label}</li>
                          ))}
                        </ul>
                      </>
                    )}
                    {proceso.contribution_amount != null && (
                      <p className="mt-2 mb-0 fw-semibold" style={{ fontSize: "0.875rem" }}>
                        Aportación de adopción: {Number(proceso.contribution_amount).toLocaleString("es-ES")} €
                      </p>
                    )}
                  </div>
                )}

                <div className="d-flex flex-column gap-3">
                  {preguntas.map((pregunta, index) => (
                    <div key={pregunta.addoption_request_question_id}>
                      <label
                        className="form-label"
                        htmlFor={`pregunta-${pregunta.addoption_request_question_id}`}
                        style={{ fontSize: "0.875rem" }}
                      >
                        <span className="fw-semibold" style={{ color: "var(--rp-verde-osc)" }}>
                          {String(index + 1).padStart(2, "0")}
                        </span>{" "}
                        {pregunta.question}
                      </label>
                      <textarea
                        id={`pregunta-${pregunta.addoption_request_question_id}`}
                        className="form-control"
                        rows={2}
                        value={respuestas[pregunta.addoption_request_question_id]}
                        onChange={(e) =>
                          handleCambiarRespuesta(pregunta.addoption_request_question_id, e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 p-3 border-top">
                <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={onCerrar}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-success rounded-pill px-4" disabled={enviando}>
                  {enviando ? "Enviando…" : "Enviar solicitud"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="p-5 text-center">
            <span
              className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
              style={{ width: "56px", height: "56px", backgroundColor: "var(--rp-verde)" }}
            >
              <svg width="24" height="18" viewBox="0 0 24 18" fill="none" aria-hidden="true">
                <path d="M2 9L9 16L22 2" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <h4 className="fw-bold mb-2">Solicitud enviada</h4>
            <p className="text-muted mb-4">
              La protectora de <b>{animal.name}</b> ya tiene tu solicitud y tus respuestas. Te avisarán en
              cuanto la revisen.
            </p>
            <button type="button" className="btn btn-success rounded-pill w-100" onClick={onCerrar}>
              Entendido
            </button>
          </div>
        )}
      </div>
    </div>

    {mostrarConfirmacion && (
      <div
        className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
        style={{ backgroundColor: "rgba(18, 33, 28, 0.55)", zIndex: 1100 }}
        onClick={handleCancelarConfirmacion}
      >
        <div
          role="alertdialog"
          aria-modal="true"
          className="bg-white rounded-4 shadow p-4"
          style={{ maxWidth: "420px", width: "100%" }}
          onClick={(e) => e.stopPropagation()}
        >
          <h5 className="fw-bold mb-3">Confirma tu solicitud</h5>
          <div className="alert alert-warning mb-3" role="alert">
            Por favor, <b>revisa tus respuestas</b>. <br />Enviar esta solicitud supone un compromiso formal y responsable con el proceso de adopción.
          </div>
          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary rounded-pill px-4"
              onClick={handleCancelarConfirmacion}
              disabled={enviando}
            >
              Revisar
            </button>
            <button
              type="button"
              className="btn btn-success rounded-pill px-4"
              onClick={handleConfirmarEnvio}
              disabled={enviando}
            >
              {enviando ? "Enviando…" : "Confirmar y enviar"}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};
