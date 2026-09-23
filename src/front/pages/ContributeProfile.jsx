import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate, useLocation, Link } from "react-router-dom";
import { getRequestById } from "../services/requestsService";
import { cargarMediaUrl } from "../services/animalsService";
import { construirBadge, calcularDeadlineLabel, esFueraDePlazo } from "../utils/necesidadDeadline";
import { NotFound } from "./NotFound";
import { ColaborarModal } from "../components/necesidades/ColaborarModal";
import { NecesidadAnimalCard } from "../components/necesidades/NecesidadAnimalCard";
import useGlobalReducer from "../hooks/useGlobalReducer";
import {formatearCantidad} from "../utils/format";
import { usePageTitle } from "../hooks/usePageTitle";

// una fila etiqueta/valor que desaparece sola si no hay valor
const Dato = ({ etiqueta, children }) => {
  if (children === null || children === undefined || children === "") return null;
  return (
    <div className="d-flex justify-content-between align-items-start border-bottom py-2 gap-3">
      <span style={{ color: "var(--rp-gris)" }}>{etiqueta}</span>
      <span className="fw-semibold text-end">{children}</span>
    </div>
  );
};

export const ContributeProfile = () => {
  const { id } = useParams();
  const { store } = useGlobalReducer();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const volver = () => (location.key !== "default" ? navigate(-1) : navigate("/necesidades"));

  const [necesidad, setNecesidad] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [noEncontrada, setNoEncontrada] = useState(false);
  const [modalColaborarAbierto, setModalColaborarAbierto] = useState(false);

  usePageTitle(necesidad?.name);

  const recargarNecesidad = () => {
    getRequestById(id).then(setNecesidad).catch(() => {});
  };

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

  // vuelta desde el login (?colaborar=1 en la url, ver el Link "Inicia sesión para colaborar"):
  // si ya hay sesion y la necesidad admite colaboraciones, abre el modal solo y limpia la url
  useEffect(() => {
    if (!necesidad || !store.token || searchParams.get("colaborar") !== "1") return;

    const puedeColaborar = necesidad.status !== "cerrada" && !esFueraDePlazo(necesidad.request_deadline);
    if (puedeColaborar) setModalColaborarAbierto(true);

    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("colaborar");
      return next;
    }, { replace: true });
  }, [necesidad, store.token]);

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
        <button type="button" onClick={volver} className="btn btn-outline-secondary rounded-pill mb-4">
          <i className="fa fa-arrow-left text-danger me-1"></i> Volver
        </button>
      </div>
    );
  }

  const badge = construirBadge(necesidad);
  const cubierta = necesidad.status === "cerrada";
  const fueraDePlazo = esFueraDePlazo(necesidad.request_deadline);

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

  const subtitulo = [necesidad.shelter_name, necesidad.request_type_name].filter(Boolean).join(" · ");

  return (
    <div style={{ backgroundColor: "var(--rp-hueso)" }}>
      <div className="container py-5">
        <button type="button" onClick={volver} className="btn btn-outline-secondary rounded-pill mb-4">
          <i className="fa fa-arrow-left text-danger me-1"></i> Volver
        </button>

        <div className="row g-4">
          <div className="col-lg-6">
            <div
              className="position-relative rounded overflow-hidden d-flex align-items-center justify-content-center"
              style={{ height: "400px", backgroundColor: "var(--rp-verde-cl)" }}
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
            </div>

            {badge && (
              <span
                className="badge d-inline-block mt-3"
                style={{ backgroundColor: badge.fondo, color: "var(--rp-papel)" }}
              >
                {badge.texto}
              </span>
            )}

            <NecesidadAnimalCard necesidad={necesidad} />
          </div>

          <div className="col-lg-6">
            <h1 className="fw-bold mb-1" style={{ color: "var(--rp-pino)" }}>{necesidad.name}</h1>
            {subtitulo && <p className="text-secondary mb-3">{subtitulo}</p>}

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

            {necesidad.description && <p className="mb-4" style={{ lineHeight: 1.7 }}>{necesidad.description}</p>}

            <h5 className="fw-bold mt-4 mb-2">Sobre esta necesidad</h5>
            <Dato etiqueta="Fecha límite">{calcularDeadlineLabel(necesidad.request_deadline)}</Dato>
            <Dato etiqueta="A tener en cuenta">{necesidad.footnote}</Dato>

            <div className="mt-4 p-3 rounded" style={{ backgroundColor: "var(--rp-papel)" }}>
              <p className="rp-eyebrow mb-1">Protectora</p>
              <p className="fw-semibold mb-0">{necesidad.shelter_name || "Sin asignar"}</p>
            </div>

            {cubierta ? (
              <div className="alert alert-success mt-4 mb-0">
                Esta necesidad ya está cubierta. ¡Gracias a quienes colaboraron!
              </div>
            ) : fueraDePlazo ? (
              <div className="alert alert-secondary mt-4 mb-0">
                El plazo para colaborar ha finalizado.
              </div>
            ) : store.token ? (
              <button
                className="btn btn-success btn-lg w-100 mt-4 rounded-pill"
                onClick={() => setModalColaborarAbierto(true)}
              >
                Colaborar
              </button>
            ) : (
              <Link
                to="/login"
                state={{ from: `/necesidades/${necesidad.request_id}?colaborar=1` }}
                className="btn btn-success btn-lg w-100 mt-4 rounded-pill d-block text-center"
              >
                Colaborar
              </Link>
            )}
          </div>
        </div>
      </div>

      {modalColaborarAbierto && (
        <ColaborarModal
          necesidad={necesidad}
          onCerrar={() => {
            setModalColaborarAbierto(false);
            recargarNecesidad();
          }}
          onColaboracionCreada={() => recargarNecesidad()}
        />
      )}
    </div>
  );
};

export default ContributeProfile;