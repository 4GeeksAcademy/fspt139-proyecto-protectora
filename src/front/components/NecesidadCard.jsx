import { Link } from "react-router-dom";
import { construirBadge, esFueraDePlazo } from "../utils/necesidadDeadline";
import { cargarMediaUrl } from "../services/animalsService";
import {formatearCantidad} from "../utils/format";


export const NecesidadCard = ({ necesidad }) => {
  if (!necesidad) return null;

  const badge = construirBadge(necesidad);
  const cubierta = necesidad.status === "cerrada";
  const fueraDePlazo = esFueraDePlazo(necesidad.request_deadline);
  const puedeColaborar = !cubierta && !fueraDePlazo;

  const actual = Number(necesidad.amount_current) || 0;
  const objetivo = Number(necesidad.amount_needed) || 0;
  const porcentaje = objetivo > 0 ? Math.min((actual / objetivo) * 100, 100) : 0;

  const colaboradores = necesidad.collaborators || 0;
  const textoColaboradores =
    colaboradores === 0
      ? "nadie aún"
      : colaboradores === 1
        ? "1 persona"
        : `${colaboradores} personas`;

  return (
    <div
      className="card h-100 border-0 shadow-sm overflow-hidden"
      style={{ backgroundColor: "var(--rp-papel)" }}
    >

      <div
        className="position-relative d-flex align-items-center justify-content-center flex-shrink-0"
        style={{ height: "160px", backgroundColor: "var(--rp-verde-cl)" }}
      >
        {necesidad.cover_image ? (
          <img
            src={cargarMediaUrl(necesidad.cover_image)}
            alt={necesidad.name}
            className="w-100 h-100"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <span style={{ fontSize: "2.5rem", opacity: 0.35 }}>🐾</span>
        )}

        {badge && (
          <span
            className="badge position-absolute top-0 start-0 m-2"
            style={{ backgroundColor: badge.fondo, color: "var(--rp-papel)" }}
          >
            {badge.texto}
          </span>
        )}
      </div>

      <div className="card-body d-flex flex-column p-3">

        <h5
          className="fw-bold mb-1"
          style={{
            color: "var(--rp-pino)",
            fontSize: "1.05rem",
            lineHeight: 1.3,
            minHeight: "2.73rem",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {necesidad.name}
        </h5>

        <p className="small mb-3 text-truncate" style={{ color: "var(--rp-gris)" }}>
          {[necesidad.shelter_name, necesidad.request_type_name].filter(Boolean).join(" · ")}
        </p>

        <div className="mt-auto">

          {objetivo > 0 && (
            <>
              <div className="d-flex justify-content-between align-items-baseline mb-1 gap-2">
                <span style={{ fontSize: "0.9rem" }}>
                  <strong>{formatearCantidad(actual)}</strong>
                  <span style={{ color: "var(--rp-gris)" }}>
                    {" "}/ {formatearCantidad(objetivo)} {necesidad.unit}
                  </span>
                </span>
                <small className="text-nowrap" style={{ color: "var(--rp-gris)" }}>
                  {textoColaboradores}
                </small>
              </div>

              <div
                className="progress mb-3"
                style={{ height: "8px", backgroundColor: "var(--rp-verde-cl)" }}
              >
                <div
                  className="progress-bar"
                  style={{ width: `${porcentaje}%`, backgroundColor: "var(--rp-verde)" }}
                  role="progressbar"
                  aria-valuenow={porcentaje}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </>
          )}

          <div
            className="d-flex justify-content-between align-items-center gap-2"
            style={{ minHeight: "2rem" }}
          >
            <small className="text-truncate" style={{ color: "var(--rp-gris)" }}>
              {necesidad.footnote}
            </small>
            <Link
              to={`/necesidades/${necesidad.request_id}`}
              className={`btn btn-sm flex-shrink-0 ${puedeColaborar ? "btn-success" : "btn-outline-secondary"}`}
            >
              {puedeColaborar ? "Colaborar" : "Ver detalle"}
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};