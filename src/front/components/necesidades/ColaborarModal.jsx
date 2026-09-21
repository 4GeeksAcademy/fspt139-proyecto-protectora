import React, { useEffect, useRef, useState } from "react";
import { crearColaboracion } from "../../services/requestsService";

// etiquetas para el formulario según el tipo de ayuda, mismos inputs (version inicial)
// todo: consultar con todos si lo desarrollamos como el figma con preguntas personalizadas o más simple con importe y respuesta
const COPY_BY_TYPE = {
  money: {
    cantidadLabel: "¿Cuánto quieres aportar?",
    detallesLabel: "¿Cómo lo vas a entregar?",
    detallesPlaceholder: "Ej. transferencia bancaria, en mano, Bizum...",
  },
  resources: {
    cantidadLabel: "¿Cuánto puedes traer?",
    detallesLabel: "¿Cuándo y cómo lo entregas?",
    detallesPlaceholder: "Ej. este sábado, lo llevo al refugio...",
  },
  time: {
    cantidadLabel: "¿Cuánto puedes cubrir?",
    detallesLabel: "Cuéntanos cómo puedes ayudar",
    detallesPlaceholder: "Ej. días y horas disponibles, si tienes coche...",
  },
  others: {
    cantidadLabel: "¿Cuánto puedes aportar?",
    detallesLabel: "Cuéntanos cómo puedes ayudar",
    detallesPlaceholder: "Danos algo de contexto sobre tu ayuda...",
  },
};


//todo: sacar a utils.js
const formatearCantidad = (valor) => {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return null;
  return numero.toLocaleString("es-ES", { maximumFractionDigits: 2 });
};



export const ColaborarModal = ({ necesidad, onCerrar, onColaboracionCreada }) => {
  const [paso, setPaso] = useState("formulario"); // "formulario" | "exito"
  const copy = COPY_BY_TYPE[necesidad.request_type_code] || COPY_BY_TYPE.others;

  const tieneObjetivo = necesidad.amount_needed !== null && necesidad.amount_needed !== undefined;
  const actual = Number(necesidad.amount_current) || 0;
  const objetivo = Number(necesidad.amount_needed) || 0;
  const restante = Math.max(objetivo - actual, 0);
  const step = necesidad.request_type_code === "money" ? "0.50" : "1";

  const [cantidad, setCantidad] = useState("");
  const [detalles, setDetalles] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [colaboracion, setColaboracion] = useState(null);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [pendiente, setPendiente] = useState(null);
  const errorRef = useRef(null);

  // cuando aparece un error, el foco salta al mensaje para que se note por que no se ha enviado
  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  // valida y si esta todo correcto pide confirm: abre modal bootstrap para cofirmacion
  const handleEnviar = (e) => {
    e.preventDefault();
    setError("");

    const cantidadTexto = cantidad.trim();
    const cantidadNumero = cantidadTexto === "" ? null : Number(cantidadTexto);
    const cantidadValida = cantidadNumero !== null && Number.isFinite(cantidadNumero) && cantidadNumero > 0;

    if (tieneObjetivo && !cantidadValida) {
      setError("Indica una cantidad válida.");
      return;
    }
    if (!tieneObjetivo && !cantidadValida && !detalles.trim()) {
      setError("Indica una cantidad o cuéntanos cómo puedes ayudar.");
      return;
    }

    setPendiente({
      amount: cantidadValida ? cantidadNumero : null,
      details: detalles.trim() || null,
    });
    setMostrarConfirmacion(true);
  };

  // cerrar la confirmacion, cancel
  const handleCancelarConfirmacion = () => {
    setMostrarConfirmacion(false);
  };

  const handleConfirmarEnvio = async () => {
    setEnviando(true);
    try {
      const resultado = await crearColaboracion(necesidad.request_id, pendiente);
      setColaboracion(resultado);
      onColaboracionCreada?.(resultado);
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
        style={{ maxWidth: "480px", width: "100%", maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {paso === "formulario" ? (
          <>
            <div className="p-4 pb-3 border-bottom">
              <h4 className="fw-bold mb-2">Vas a colaborar con esta necesidad</h4>
              <p className="mb-0 text-muted" style={{ fontSize: "0.875rem" }}>
                {necesidad.name}
              </p>
            </div>

            <form onSubmit={handleEnviar} className="d-flex flex-column overflow-hidden">
              <div className="p-4 overflow-auto d-flex flex-column gap-3">
                {error && (
                  <div className="alert alert-danger" role="alert" tabIndex={-1} ref={errorRef}>
                    {error}
                  </div>
                )}

                {tieneObjetivo && (
                  <div>
                    <label className="form-label" htmlFor="colaborar-cantidad">
                      {copy.cantidadLabel}
                    </label>
                    <div className="input-group">
                      <input
                        id="colaborar-cantidad"
                        type="number"
                        min="0"
                        step={step}
                        className="form-control"
                        value={cantidad}
                        onChange={(e) => setCantidad(e.target.value)}
                      />
                      {necesidad.unit && <span className="input-group-text">{necesidad.unit}</span>}
                    </div>
                    {restante > 0 && (
                      <div className="form-text">
                        Quedan {formatearCantidad(restante)} {necesidad.unit} para completar el objetivo.
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="form-label" htmlFor="colaborar-detalles">
                    {copy.detallesLabel}
                    {tieneObjetivo ? " (opcional)" : ""}
                  </label>
                  <textarea
                    id="colaborar-detalles"
                    className="form-control"
                    rows={3}
                    placeholder={copy.detallesPlaceholder}
                    value={detalles}
                    onChange={(e) => setDetalles(e.target.value)}
                  />
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 p-3 border-top">
                <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={onCerrar}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-success rounded-pill px-4" disabled={enviando}>
                  {enviando ? "Enviando…" : "Confirmar colaboración"}
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
            <h4 className="fw-bold mb-2">¡Gracias por tu ayuda!</h4>
            <p className="text-muted mb-4">
              Hemos avisado a la protectora de tu aportación
              {colaboracion?.amount ? ` de ${formatearCantidad(colaboracion.amount)} ${necesidad.unit || ""}` : ""}.
              La marcarán como recibida cuando la entregues.
            </p>
            <button type="button" className="btn btn-success rounded-pill w-100" onClick={onCerrar}>
              Entendido
            </button>
          </div>
        )}
      </div>
    </div>
      {/* todo: sacar a componente Confirm reutilizable*/ }
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
          <h5 className="fw-bold mb-3">Confirma tu colaboración</h5>
          <div className="alert alert-warning mb-3" role="alert">
            Por favor, <b>confirma</b>. <br />Colaborar con esta necesidad es un
            compromiso vinculante: la protectora contará con tu aportación para cubrir el objetivo.
          </div>
          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary rounded-pill px-4"
              onClick={handleCancelarConfirmacion}
              disabled={enviando}
            >
              Atrás
            </button>
            <button
              type="button"
              className="btn btn-success rounded-pill px-4"
              onClick={handleConfirmarEnvio}
              disabled={enviando}
            >
              {enviando ? "Enviando…" : "Continuar"}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};
