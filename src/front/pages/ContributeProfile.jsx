import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getRequestById } from "../services/requestsService";
import { cargarMediaUrl } from "../services/animalsService";
import { construirBadge, calcularDeadlineLabel } from "../utils/necesidadDeadline";
import { NotFound } from "./NotFound";

const formatearCantidad = (valor) => {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return null;
  return numero.toLocaleString("es-ES", { maximumFractionDigits: 2 });
};

export const ContributeProfile = () => {
  const { id } = useParams();

  const [necesidad, setNecesidad] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [noEncontrada, setNoEncontrada] = useState(false);

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setError(null);
    setNoEncontrada(false);

    getRequestById(id)
      .then((data) => {
        if (cancelado) return;
        setNecesidad(data);
      })
      .catch((err) => {
        if (cancelado) return;
        if (err.status === 404) setNoEncontrada(true);
        else setError(err.message);
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => { cancelado = true; };
  }, [id]);

  if (cargando) {
    return (
      <div className="container py-5 d-flex justify-content-center">
        <div className="spinner-grow" style={{ color: "var(--rp-verde)" }} role="status">
          <span className="visually-hidden">Cargando…</span>
        </div>
      </div>
    );
  }

  if (noEncontrada) return <NotFound />;

  if (error || !necesidad) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error || "No se ha podido cargar la necesidad"}</div>
        <Link to="/necesidades" className="btn btn-outline-secondary">← Volver al tablón</Link>
      </div>
    );
  }

    const badge = construirBadge(necesidad);
  const cubierta = necesidad.status === "cerrada";

  const actual = Number(necesidad.amount_current) || 0;
  const objetivo = Number(necesidad.amount_needed) || 0;
  const porcentaje = objetivo > 0 ? Math.min((actual / objetivo) * 100, 100) : 0;
  const restante = Math.max(objetivo - actual, 0);

  const colaboradores = necesidad.collaborators || 0;
  const textoColaboradores =
    colaboradores === 0
      ? "Nadie ha colaborado todavía"
      : colaboradores === 1
        ? "1 persona ha colaborado"
        : `${colaboradores} personas han colaborado`;

  return (
    <div style={{ backgroundColor: "var(--rp-hueso)" }}>
      <div className="container py-5">

        <Link to="/necesidades" className="btn btn-outline-secondary rounded-pill mb-4">
          ← Volver al tablón
        </Link>

        <div className="card border-0 shadow-sm overflow-hidden" style={{ backgroundColor: "var(--rp-papel)" }}>

          <div
            className="position-relative d-flex align-items-center justify-content-center"
            style={{ height: "260px", backgroundColor: "var(--rp-verde-cl)" }}
          >
            {necesidad.cover_image ? (
              <img
                src={cargarMediaUrl(necesidad.cover_image)}
                alt={necesidad.name}
                className="w-100 h-100"
                style={{ objectFit: "cover" }}
              />
            ) : (
              <span style={{ fontSize: "4rem", opacity: 0.35 }}>🐾</span>
            )}

            {badge && (
              <span
                className="badge position-absolute top-0 start-0 m-3"
                style={{ backgroundColor: badge.fondo, color: "var(--rp-papel)" }}
              >
                {badge.texto}
              </span>
            )}
          </div>

          <div className="card-body p-4">

            <h2 className="fw-bold mb-1" style={{ color: "var(--rp-pino)" }}>
              {necesidad.name}
            </h2>
            <p className="mb-4" style={{ color: "var(--rp-gris)" }}>
              {[necesidad.shelter_name, necesidad.request_type_name].filter(Boolean).join(" · ")}
            </p>

            {objetivo > 0 && (
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-baseline mb-1">
                  <span className="fs-5">
                    <strong>{formatearCantidad(actual)}</strong>
                    <span style={{ color: "var(--rp-gris)" }}>
                      {" "}/ {formatearCantidad(objetivo)} {necesidad.unit}
                    </span>
                  </span>
                  <small style={{ color: "var(--rp-gris)" }}>{textoColaboradores}</small>
                </div>

                <div className="progress mb-2" style={{ height: "10px", backgroundColor: "var(--rp-verde-cl)" }}>
                  <div
                    className="progress-bar"
                    style={{ width: `${porcentaje}%`, backgroundColor: "var(--rp-verde)" }}
                    role="progressbar"
                    aria-valuenow={porcentaje}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>

                {!cubierta && restante > 0 && (
                  <small style={{ color: "var(--rp-gris)" }}>
                    Faltan {formatearCantidad(restante)} {necesidad.unit}
                  </small>
                )}
              </div>
            )}

            <p className="mb-4" style={{ lineHeight: 1.7 }}>{necesidad.description}</p>

            <div className="d-flex flex-wrap gap-4 mb-4 pt-3 border-top">
              <div>
                <p className="rp-eyebrow mb-1">Fecha límite</p>
                <p className="fw-semibold mb-0">{calcularDeadlineLabel(necesidad.request_deadline)}</p>
              </div>
              <div>
                <p className="rp-eyebrow mb-1">Protectora</p>
                <p className="fw-semibold mb-0">{necesidad.shelter_name || "Sin asignar"}</p>
              </div>
              {necesidad.footnote && (
                <div>
                  <p className="rp-eyebrow mb-1">A tener en cuenta</p>
                  <p className="fw-semibold mb-0">{necesidad.footnote}</p>
                </div>
              )}
            </div>

            {cubierta ? (
              <div className="alert alert-success mb-0">
                Esta necesidad ya está cubierta. ¡Gracias a quienes colaboraron!
              </div>
            ) : (
              <button className="btn btn-success btn-lg w-100 rounded-pill">
                Colaborar
              </button>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ContributeProfile;