import React, { useRef, useState } from "react";
import { abrirProcesoAdopcion } from "../../../services/addoptionProcessService";

//editor de las solicitudes abiertas (modo 1, personalizado, sin limite)
const LIMITE_PERSONALIZADO_MIN = 2; // a partir de 1 hasta max
const LIMITE_PERSONALIZADO_MAX = 100;
const LIMITE_PERSONALIZADO_POR_DEFECTO = 3;

const OPCIONES_MODO_LIMITE = [
  { modo: "unica", etiqueta: "Una a una" },
  { modo: "personalizado", etiqueta: null },
  { modo: "sinLimite", etiqueta: "Sin límite" },
];

const OPCIONES_MODO_FECHAS = [
  { modo: "sinFecha", etiqueta: "Sin fecha límite" },
  { modo: "soloFin", etiqueta: "Fecha límite" },
  { modo: "inicioFin", etiqueta: "Rango de fechas" },
];

const PREGUNTAS_POR_DEFECTO = [
  "¿Vives con otros animales en casa?",
  "¿Cuántas horas pasaría solo al día?",
  "¿Dónde dormirá y dónde estará cuando no estéis?",
  "¿Has convivido antes con un animal así? Cuéntanos.",
  "¿Qué harías si necesitara un tratamiento largo y caro?",
];

const clampLimitePersonalizado = (numero) =>
    Math.min(LIMITE_PERSONALIZADO_MAX, Math.max(LIMITE_PERSONALIZADO_MIN, numero));


//fix para arrastrar en movil
const encontrarIndicePorPosicion = (filasRef, longitud, clientY) => {
  for (let i = 0; i < longitud; i++) {
    const fila = filasRef.current[i];
    if (!fila) continue;
    const rect = fila.getBoundingClientRect();
    if (clientY < rect.top) return i;
    if (clientY <= rect.bottom) return i;
  }
  return longitud - 1;
};

const derivarModoFechas = (startDate, endDate) => {
  if (startDate && endDate) return { modoFechas: "inicioFin", fechaInicio: startDate, fechaFin: endDate };
  if (endDate) return { modoFechas: "soloFin", fechaInicio: "", fechaFin: endDate };
  return { modoFechas: "sinFecha", fechaInicio: "", fechaFin: "" };
};
const derivarModoLimite = (limite) => {
  if (limite === 1) return { modoLimiteSolicitudes: "unica", limitePersonalizado: LIMITE_PERSONALIZADO_POR_DEFECTO };
  if (typeof limite === "number") {
    return { modoLimiteSolicitudes: "personalizado", limitePersonalizado: clampLimitePersonalizado(limite) };
  }
  return { modoLimiteSolicitudes: "sinLimite", limitePersonalizado: LIMITE_PERSONALIZADO_POR_DEFECTO };
};


const construirEstadoInicial = (procesoExistente, catalogoRequisitos) => {
  if (procesoExistente) {
    return {
      ...derivarModoLimite(procesoExistente.concurrent_requests_limit ?? null),
      ...derivarModoFechas(procesoExistente.start_date ?? null, procesoExistente.end_date ?? null),
      requisitos: (procesoExistente.requirements || [])
        .slice()
        .sort((a, b) => a.position - b.position)
        .map((r) => r.label),
      aportacion:
        procesoExistente.contribution_amount != null ? String(procesoExistente.contribution_amount) : "",
      preguntas: (procesoExistente.questions || [])
        .slice()
        .sort((a, b) => a.position - b.position)
        .map((q) => q.question),
    };
  }
  return {
    modoLimiteSolicitudes: "sinLimite",
    limitePersonalizado: LIMITE_PERSONALIZADO_POR_DEFECTO,
    modoFechas: "sinFecha",
    fechaInicio: "",
    fechaFin: "",
    requisitos: (catalogoRequisitos || []).filter((r) => r.is_checked_by_default).map((r) => r.label),
    aportacion: "",
    preguntas: [...PREGUNTAS_POR_DEFECTO],
  };
};

export const AbrirProcesoAdopcionModal = ({
  animal,
  procesoExistente,
  catalogoRequisitos = [],
  onCerrar,
  onProcesoAbierto,
  isEditing = false,
}) => {

  const [paso, setPaso] = useState("formulario"); // "formulario" | "exito"
  const [form, setForm] = useState(() => construirEstadoInicial(procesoExistente, catalogoRequisitos));
  const [nuevaPregunta, setNuevaPregunta] = useState("");
  const [nuevoRequisito, setNuevoRequisito] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [indicePreguntaArrastrado, setIndicePreguntaArrastrado] = useState(null);
  const [indicePreguntaSobreEl, setIndicePreguntaSobreEl] = useState(null);
  const [indiceRequisitoArrastrado, setIndiceRequisitoArrastrado] = useState(null);
  const [indiceRequisitoSobreEl, setIndiceRequisitoSobreEl] = useState(null);
  const filasRequisitoRef = useRef([]);
  const filasPreguntaRef = useRef([]);

  //para el fix para arrastrar en movil
  const handlePointerDownRequisito = (index, e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIndiceRequisitoArrastrado(index);
    setIndiceRequisitoSobreEl(index);
  };
  const handlePointerMoveRequisito = (e) => {
    if (indiceRequisitoArrastrado === null) return;
    setIndiceRequisitoSobreEl(encontrarIndicePorPosicion(filasRequisitoRef, form.requisitos.length, e.clientY));
  };
  const handlePointerUpRequisito = () => {
    if (indiceRequisitoArrastrado !== null && indiceRequisitoSobreEl !== null) {
      handleReordenarRequisito(indiceRequisitoArrastrado, indiceRequisitoSobreEl);
    }
    setIndiceRequisitoArrastrado(null);
    setIndiceRequisitoSobreEl(null);
  };
  const handlePointerDownPregunta = (index, e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIndicePreguntaArrastrado(index);
    setIndicePreguntaSobreEl(index);
  };
  const handlePointerMovePregunta = (e) => {
    if (indicePreguntaArrastrado === null) return;
    setIndicePreguntaSobreEl(encontrarIndicePorPosicion(filasPreguntaRef, form.preguntas.length, e.clientY));
  };
  const handlePointerUpPregunta = () => {
    if (indicePreguntaArrastrado !== null && indicePreguntaSobreEl !== null) {
      handleReordenarPregunta(indicePreguntaArrastrado, indicePreguntaSobreEl);
    }
    setIndicePreguntaArrastrado(null);
    setIndicePreguntaSobreEl(null);
  };




  const handleCambiarLimitePersonalizado = (valorInput) => {
    if (valorInput === "") {
      setForm((prev) => ({ ...prev, limitePersonalizado: "" }));
      return;
    }
    const numero = Math.trunc(Number(valorInput));
    if (Number.isNaN(numero)) return;
    setForm((prev) => ({ ...prev, limitePersonalizado: clampLimitePersonalizado(numero) }));
  };

  const handleAnadirRequisitoSugerido = (label) => {
    setForm((prev) => (prev.requisitos.includes(label) ? prev : { ...prev, requisitos: [...prev.requisitos, label] }));
  };
  const handleAnadirRequisitoPersonalizado = () => {
    const texto = nuevoRequisito.trim();
    if (!texto || form.requisitos.includes(texto)) return;
    setForm((prev) => ({ ...prev, requisitos: [...prev.requisitos, texto] }));
    setNuevoRequisito("");
  };

  const handleQuitarRequisito = (index) => {
    setForm((prev) => ({ ...prev, requisitos: prev.requisitos.filter((_, i) => i !== index) }));
  };

  const handleReordenarRequisito = (indiceOrigen, indiceDestino) => {
    if (indiceOrigen === indiceDestino) return;
    setForm((prev) => {
      const requisitos = [...prev.requisitos];
      const [movido] = requisitos.splice(indiceOrigen, 1);
      requisitos.splice(indiceDestino, 0, movido);
      return { ...prev, requisitos };
    });
  };

  const handleAnadirPregunta = () => {
    const texto = nuevaPregunta.trim();
    if (!texto) return;
    setForm((prev) => ({ ...prev, preguntas: [...prev.preguntas, texto] }));
    setNuevaPregunta("");
  };

  const handleQuitarPregunta = (index) => {
    setForm((prev) => ({ ...prev, preguntas: prev.preguntas.filter((_, i) => i !== index) }));
  };

  const handleReordenarPregunta = (indiceOrigen, indiceDestino) => {
    if (indiceOrigen === indiceDestino) return;
    setForm((prev) => {
      const preguntas = [...prev.preguntas];
      const [movida] = preguntas.splice(indiceOrigen, 1);
      preguntas.splice(indiceDestino, 0, movida);
      return { ...prev, preguntas };
    });
  };

  const sugerenciasPendientes = catalogoRequisitos.filter((r) => !form.requisitos.includes(r.label));

  const limiteSolicitudesFinal =
    form.modoLimiteSolicitudes === "unica"
      ? 1
      : form.modoLimiteSolicitudes === "sinLimite"
        ? null
        : clampLimitePersonalizado(Number(form.limitePersonalizado) || LIMITE_PERSONALIZADO_MIN);




  const handleAbrirProceso = async (e) => {
    e.preventDefault();
    setError("");

    if (form.modoFechas !== "sinFecha" && !form.fechaFin) {
      setError("Indica la fecha límite del proceso.");
      return;
    }
    if (form.modoFechas === "inicioFin" && !form.fechaInicio) {
      setError("Indica la fecha de inicio del proceso.");
      return;
    }
    if (form.modoFechas === "inicioFin" && form.fechaInicio && form.fechaFin && form.fechaInicio > form.fechaFin) {
      setError("La fecha de inicio debe ser anterior a la fecha límite.");
      return;
    }

    setGuardando(true);
    try {
      const proceso = await abrirProcesoAdopcion(animal.animal_id, {
        concurrent_requests_limit: limiteSolicitudesFinal,
        contribution_amount: form.aportacion.trim() === "" ? null : Number(form.aportacion),
        start_date: form.modoFechas === "inicioFin" ? form.fechaInicio : null,
        end_date: form.modoFechas === "sinFecha" ? null : form.fechaFin,
        requirements: form.requisitos,
        questions: form.preguntas,
      });
      onProcesoAbierto?.(proceso);
      setPaso("exito");
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
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
        style={{ maxWidth: "620px", width: "100%", maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {paso === "formulario" ? (
          <>
            <div className="p-4 pb-3 border-bottom">
              <h4 className="fw-bold mb-2">{isEditing ? "Editar proceso de adopción" : "Abrir proceso de adopción"}</h4>
              <p className="mb-0 text-muted" style={{ fontSize: "0.875rem" }}>
                {isEditing ? (
                  <>Actualiza los requisitos, preguntas y configuración de <b>{animal.name}</b>.</>
                ) : (
                  <>A partir de ahora la ficha de <b>{animal.name}</b> mostrará el botón de solicitud y las
                    respuestas llegarán como <b>solicitudes de adopción</b>.</>
                )}
              </p>
            </div>

            <form onSubmit={handleAbrirProceso} className="d-flex flex-column overflow-hidden">
              <div className="p-4 overflow-auto">
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                <div className="mb-4">
                  <label className="form-label d-block">Solicitudes abiertas a la vez</label>
                  <div className="d-flex w-100 gap-1 p-1 rounded-pill" style={{ backgroundColor: "var(--rp-verde-cl)" }}>
                    {OPCIONES_MODO_LIMITE.map((opcion) => {
                      const seleccionado = form.modoLimiteSolicitudes === opcion.modo;
                      const etiqueta =
                        opcion.modo === "personalizado" ? `Hasta ${form.limitePersonalizado}` : opcion.etiqueta;
                      return (
                        <button
                          type="button"
                          key={opcion.modo}
                          onClick={() => setForm((prev) => ({ ...prev, modoLimiteSolicitudes: opcion.modo }))}
                          className="flex-fill text-center rounded-pill py-2 px-1 fw-semibold"
                          style={{
                            backgroundColor: seleccionado ? "var(--rp-papel)" : "transparent",
                            color: seleccionado ? "var(--rp-verde-osc)" : "var(--rp-pino)",
                            boxShadow: seleccionado ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
                            fontSize: "clamp(0.65rem, 2.8vw, 0.9rem)",
                            transition: "all 0.15s ease",
                          }}
                        >
                          {etiqueta}
                        </button>
                      );
                    })}
                  </div>

                  {form.modoLimiteSolicitudes === "personalizado" && (
                    <div className="mt-2">
                      <label className="form-label mb-1" htmlFor="limite-personalizado" style={{ fontSize: "0.8rem" }}>
                        Número máximo de solicitudes simultáneas ({LIMITE_PERSONALIZADO_MIN}-{LIMITE_PERSONALIZADO_MAX})
                      </label>
                      <input
                        id="limite-personalizado"
                        type="number"
                        min={LIMITE_PERSONALIZADO_MIN}
                        max={LIMITE_PERSONALIZADO_MAX}
                        step="1"
                        className="form-control"
                        style={{ maxWidth: "140px" }}
                        value={form.limitePersonalizado}
                        onChange={(e) => handleCambiarLimitePersonalizado(e.target.value)}
                      />
                    </div>
                  )}

                  <p className="mt-2 mb-0 text-muted" style={{ fontSize: "0.8rem" }}>«Una a una» el proceso se cierra cuando se reciba una solicitud.</p>
                  <p className="mt-2 mb-0 text-muted" style={{ fontSize: "0.8rem" }}>«Hasta {form.limitePersonalizado}» el proceso se cierra cuando se llega a {form.limitePersonalizado} solicitudes.</p>
                  <p className="mt-2 mb-0 text-muted" style={{ fontSize: "0.8rem" }}>«Sin límite» se admiten todas las solicitudes para revisar cual es la idónea.</p>

                </div>

                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-baseline mb-2">
                    <label className="form-label mb-0">Requisitos que aceptáis (obligatorios)</label>
                    <span style={{ color: "var(--rp-gris)", fontSize: "0.7rem" }}>
                      {form.requisitos.length} requisitos
                    </span>
                  </div>

                  <div className="d-flex flex-column gap-2 mb-2">
                    {form.requisitos.map((requisito, index) => (
                      <div
                        key={index}
                        ref={(el) => (filasRequisitoRef.current[index] = el)}
                        className="d-flex align-items-center gap-2 rounded-3 border px-3 py-2"
                        style={{
                          borderColor: indiceRequisitoSobreEl === index ? "var(--rp-verde)" : "var(--rp-linea)",
                          backgroundColor: indiceRequisitoArrastrado === index ? "var(--rp-verde-cl)" : undefined,
                          opacity: indiceRequisitoArrastrado === index ? 0.6 : 1,
                        }}
                      >
                        <span
                          className="d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{ color: "var(--rp-gris)", fontSize: "1rem", lineHeight: 1, cursor: "grab", touchAction: "none" }}
                          aria-hidden="true"
                          onPointerDown={(e) => handlePointerDownRequisito(index, e)}
                          onPointerMove={handlePointerMoveRequisito}
                          onPointerUp={handlePointerUpRequisito}
                          onPointerCancel={handlePointerUpRequisito}
                        >
                          ⠿
                        </span>
                        <span className="flex-grow-1" style={{ fontSize: "0.875rem" }}>
                          {requisito}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuitarRequisito(index)}
                          className="btn btn-sm btn-light rounded-circle d-flex align-items-center justify-content-center p-0"
                          style={{ width: "24px", height: "24px" }}
                          aria-label="Quitar requisito"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  {sugerenciasPendientes.length > 0 && (
                    <div className="d-flex flex-wrap gap-2 mb-2">
                      {sugerenciasPendientes.map((r) => (
                        <button
                          type="button"
                          key={r.animal_type_requirement_id || r.label}
                          onClick={() => handleAnadirRequisitoSugerido(r.label)}
                          className="rounded-pill border px-3 py-1"
                          style={{
                            borderColor: "var(--rp-linea)",
                            backgroundColor: "var(--rp-papel)",
                            color: "var(--rp-pino)",
                            fontSize: "0.8rem",
                          }}
                        >
                          + {r.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="d-flex gap-2">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Escribe otro requisito"
                      value={nuevoRequisito}
                      onChange={(e) => setNuevoRequisito(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAnadirRequisitoPersonalizado();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAnadirRequisitoPersonalizado}
                      className="btn btn-outline-secondary rounded-pill px-3 flex-shrink-0"
                    >
                      Añadir
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-baseline">
                    <label className="form-label mb-0" htmlFor="aportacion-adopcion">
                      Aportación de adopción
                    </label>
                    <span style={{ color: "var(--rp-gris)", fontSize: "0.7rem" }}>opcional · €</span>
                  </div>
                  <input
                    id="aportacion-adopcion"
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-control"
                    placeholder="120"
                    value={form.aportacion}
                    onChange={(e) => setForm((prev) => ({ ...prev, aportacion: e.target.value }))}
                  />
                  <p className="mt-2 mb-0 text-muted" style={{ fontSize: "0.8rem" }}>
                    Se muestra siempre junto a lo que cubre. La transparencia aquí reduce las bajas a mitad de
                    proceso.
                  </p>
                </div>

                <div className="mb-1">
                  <div className="d-flex justify-content-between align-items-baseline mb-2">
                    <label className="form-label mb-0">Preguntas del formulario</label>
                    <span style={{ color: "var(--rp-gris)", fontSize: "0.7rem" }}>
                      {form.preguntas.length} preguntas
                    </span>
                  </div>
                  <div className="d-flex flex-column gap-2 mb-2">
                    {form.preguntas.map((pregunta, index) => (
                      <div
                        key={index}
                        ref={(el) => (filasPreguntaRef.current[index] = el)}
                        className="d-flex align-items-center gap-2 rounded-3 border px-3 py-2"
                        style={{
                          borderColor: indicePreguntaSobreEl === index ? "var(--rp-verde)" : "var(--rp-linea)",
                          backgroundColor: indicePreguntaArrastrado === index ? "var(--rp-verde-cl)" : undefined,
                          opacity: indicePreguntaArrastrado === index ? 0.6 : 1,
                        }}
                      >
                        <span
                          className="d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{ color: "var(--rp-gris)", fontSize: "1rem", lineHeight: 1, cursor: "grab", touchAction: "none" }}
                          aria-hidden="true"
                          onPointerDown={(e) => handlePointerDownPregunta(index, e)}
                          onPointerMove={handlePointerMovePregunta}
                          onPointerUp={handlePointerUpPregunta}
                          onPointerCancel={handlePointerUpPregunta}
                        >
                          ⠿
                        </span>
                        <span className="fw-semibold" style={{ color: "var(--rp-verde-osc)", fontSize: "0.8rem" }}>
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="flex-grow-1" style={{ fontSize: "0.875rem" }}>
                          {pregunta}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuitarPregunta(index)}
                          className="btn btn-sm btn-light rounded-circle d-flex align-items-center justify-content-center p-0"
                          style={{ width: "24px", height: "24px" }}
                          aria-label="Quitar pregunta"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="d-flex gap-2">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Escribe otra pregunta"
                      value={nuevaPregunta}
                      onChange={(e) => setNuevaPregunta(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAnadirPregunta();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAnadirPregunta}
                      className="btn btn-outline-secondary rounded-pill px-3 flex-shrink-0"
                    >
                      Añadir
                    </button>
                  </div>
                </div>

                <div className="mb-1">
                  <label className="form-label d-block">Duración del proceso</label>
                  <div className="d-flex w-100 gap-1 p-1 rounded-pill" style={{ backgroundColor: "var(--rp-verde-cl)" }}>
                    {OPCIONES_MODO_FECHAS.map((opcion) => {
                      const seleccionado = form.modoFechas === opcion.modo;
                      return (
                        <button
                          type="button"
                          key={opcion.modo}
                          onClick={() => setForm((prev) => ({ ...prev, modoFechas: opcion.modo }))}
                          className="flex-fill text-center rounded-pill py-2 px-1 fw-semibold"
                          style={{
                            backgroundColor: seleccionado ? "var(--rp-papel)" : "transparent",
                            color: seleccionado ? "var(--rp-verde-osc)" : "var(--rp-pino)",
                            boxShadow: seleccionado ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
                            fontSize: "clamp(0.65rem, 2.8vw, 0.9rem)",
                            transition: "all 0.15s ease",
                          }}
                        >
                          {opcion.etiqueta}
                        </button>
                      );
                    })}
                  </div>

                  {form.modoFechas !== "sinFecha" && (
                    <div className="row g-2 mt-2">
                      {form.modoFechas === "inicioFin" && (
                        <div className="col-6">
                          <label className="form-label mb-1" htmlFor="fecha-inicio-proceso" style={{ fontSize: "0.8rem" }}>
                            Fecha de inicio
                          </label>
                          <input
                            id="fecha-inicio-proceso"
                            type="date"
                            className="form-control"
                            value={form.fechaInicio}
                            max={form.fechaFin || undefined}
                            onChange={(e) => setForm((prev) => ({ ...prev, fechaInicio: e.target.value }))}
                          />
                        </div>
                      )}
                      <div className={form.modoFechas === "inicioFin" ? "col-6" : "col-12 col-sm-6"}>
                        <label className="form-label mb-1" htmlFor="fecha-fin-proceso" style={{ fontSize: "0.8rem" }}>
                          Fecha límite
                        </label>
                        <input
                          id="fecha-fin-proceso"
                          type="date"
                          className="form-control"
                          value={form.fechaFin}
                          min={form.modoFechas === "inicioFin" ? form.fechaInicio || undefined : undefined}
                          onChange={(e) => setForm((prev) => ({ ...prev, fechaFin: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}

                  <p className="mt-2 mb-0 text-muted" style={{ fontSize: "0.8rem" }}>
                    Define durante cuánto tiempo estará abierto este proceso de adopción.
                  </p>
                </div>
              </div>

              <div className="d-flex flex-column flex-sm-row justify-content-sm-end gap-2 p-3 border-top">
                <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={onCerrar}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-success rounded-pill px-4" disabled={guardando}>
                  {guardando ? (isEditing ? "Guardando…" : "Abriendo…") : (isEditing ? "Guardar cambios" : "Abrir proceso")}
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
            <h4 className="fw-bold mb-2">{isEditing ? "Cambios guardados" : "Proceso abierto"}</h4>
            <p className="text-muted mb-4">
              {isEditing ? (
                <>El proceso de adopción de <b>{animal.name}</b> ha sido actualizado correctamente.</>
              ) : (
                <>La ficha de <b>{animal.name}</b> ya muestra el botón <b>Solicitar adopción</b>. Cada solicitud
                  llegará con las respuestas al formulario.</>
              )}
            </p>
            <button type="button" className="btn btn-success rounded-pill w-100" onClick={onCerrar}>
              Entendido
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
