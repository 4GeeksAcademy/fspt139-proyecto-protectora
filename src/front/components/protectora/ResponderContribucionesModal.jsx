import React, { useState } from "react";
import { responderContribucion, responderContribucionesEnBloque } from "../../services/requestsService";

// modal para responder a una o varias contribuciones (contribuciones.length === 1 -> individual,
// permite ademas dejar una valoracion sobre quien colabora; con varias, respuesta en bloque sin valoracion)
export const ResponderContribucionesModal = ({ contribuciones, onCerrar, onRespondido }) => {
  const esIndividual = contribuciones.length === 1;
  const contribucion = esIndividual ? contribuciones[0] : null;
  const nombreDonante = contribucion?.user
    ? [contribucion.user.name, contribucion.user.last_name1].filter(Boolean).join(" ")
    : "esta persona";

  const [shelterAnswer, setShelterAnswer] = useState(contribucion?.shelter_answer || "");
  const [incluirValoracion, setIncluirValoracion] = useState(false);
  const [ranking, setRanking] = useState(5);
  const [review, setReview] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const handleEnviar = async (e) => {
    e.preventDefault();
    setError("");

    const respuesta = shelterAnswer.trim();
    if (!respuesta) {
      setError("Escribe una respuesta antes de enviar.");
      return;
    }

    setEnviando(true);
    try {
      if (esIndividual) {
        await responderContribucion(contribucion.user_request_id, {
          shelter_answer: respuesta,
          review: incluirValoracion ? { ranking, review: review.trim() || null } : null,
        });
      } else {
        await responderContribucionesEnBloque(contribuciones.map((c) => c.user_request_id), respuesta);
      }
      onRespondido?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

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
        style={{ maxWidth: "480px", width: "100%", maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 pb-3 border-bottom">
          <h4 className="fw-bold mb-1">
            {esIndividual ? `Responder a ${nombreDonante}` : `Responder a ${contribuciones.length} contribuciones`}
          </h4>
          <p className="mb-0 text-muted" style={{ fontSize: "0.875rem" }}>
            {esIndividual
              ? "Tu respuesta se guardará junto a esta contribución."
              : "Se enviará el mismo mensaje a todas las contribuciones seleccionadas."}
          </p>
        </div>

        <form onSubmit={handleEnviar} className="d-flex flex-column overflow-hidden">
          <div className="p-4 overflow-auto d-flex flex-column gap-3">
            {error && <div className="alert alert-danger mb-0">{error}</div>}

            <div>
              <label className="form-label" htmlFor="respuesta-protectora">
                Respuesta de la protectora
              </label>
              <textarea
                id="respuesta-protectora"
                className="form-control"
                rows={3}
                placeholder="Ej. Muchas gracias por tu ayuda, ya lo hemos recibido."
                value={shelterAnswer}
                onChange={(e) => setShelterAnswer(e.target.value)}
              />
            </div>

            {esIndividual && (
              <div className="border-top pt-3">
                <div className="form-check mb-2">
                  <input
                    id="incluir-valoracion"
                    type="checkbox"
                    className="form-check-input"
                    checked={incluirValoracion}
                    onChange={(e) => setIncluirValoracion(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="incluir-valoracion">
                    Dejar también una valoración sobre {nombreDonante}
                  </label>
                </div>

                {incluirValoracion && (
                  <div className="d-flex flex-column gap-2">
                    <div>
                      <label className="form-label" htmlFor="valoracion-ranking">
                        Valoración
                      </label>
                      <select
                        id="valoracion-ranking"
                        className="form-select"
                        value={ranking}
                        onChange={(e) => setRanking(Number(e.target.value))}
                      >
                        {[5, 4, 3, 2, 1].map((n) => (
                          <option key={n} value={n}>
                            {"★".repeat(n)}{"☆".repeat(5 - n)} ({n})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="form-label" htmlFor="valoracion-review">
                        Comentario (opcional)
                      </label>
                      <textarea
                        id="valoracion-review"
                        className="form-control"
                        rows={2}
                        placeholder="Ej. Colaborador puntual y de confianza."
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="d-flex justify-content-end gap-2 p-3 border-top">
            <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={onCerrar} disabled={enviando}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-success rounded-pill px-4" disabled={enviando}>
              {enviando ? "Enviando…" : "Enviar respuesta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
