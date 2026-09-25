import React from "react";
import { Link } from "react-router-dom";
import { AvatarLogoProtectora } from "./AvatarLogoProtectora";



export const Metrica = ({ valor, etiqueta, destacada }) => (
  <div className="flex-fill">
    <p
      className="fw-bold mb-0 fs-5"
      style={{ color: destacada ? "var(--rp-verde)" : "var(--rp-pino)" }}
    >
      {valor ?? 0}
    </p>
    <small
      className="text-lowercase"
      style={{ color: "var(--rp-gris)", fontSize: "0.75rem" }}
    >
      {etiqueta}
    </small>
  </div>
);

export const ProtectoraCard = ({ protectora, esMiProtectora = false }) => {
  if (!protectora) return null;

  return (
    <div
      className="card h-100 border-0 shadow-sm overflow-hidden"
      style={{ backgroundColor: "var(--rp-papel)" }}
    >
      <div style={{ height: "6px", backgroundColor: "var(--rp-verde)" }} />

      <div className="card-body d-flex flex-column p-4">

        <div className="d-flex align-items-center gap-3 mb-3">
          <AvatarLogoProtectora logoUrl={protectora.logo_url} nombre={protectora.name} size={52} />

          <div className="overflow-hidden">
            <h5
              className="fw-bold mb-1 text-truncate"
              style={{ color: "var(--rp-pino)", fontSize: "1.05rem" }}
            >
              {protectora.name}
            </h5>
            <div className="d-flex flex-wrap gap-1">
              {esMiProtectora && (
                <span
                  className="badge rounded-pill"
                  style={{ backgroundColor: "var(--rp-pino)", color: "var(--rp-papel)" }}
                >
                  Tu protectora
                </span>
              )}
              {protectora.has_urgent && (
                <span className="badge rounded-pill" style={{ backgroundColor: "var(--rp-arcilla)", color: "var(--rp-papel)" }}>
                  Necesidad urgente
                </span>
              )}
            </div>
          </div>
        </div>

        {protectora.address && (
          <p className="small mb-2 text-truncate" style={{ color: "var(--rp-gris)" }}>
            📍 {protectora.address}
          </p>
        )}

        <p
          className="mb-3"
          style={{
            color: "var(--rp-gris)",
            fontSize: "0.9rem",
            lineHeight: 1.5,
            minHeight: "4.05rem",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {protectora.description}
        </p>

        <div
          className="d-flex text-center rounded-3 py-2 mb-3 mt-auto"
          style={{ backgroundColor: "var(--rp-hueso)" }}
        >
          <Metrica valor={protectora.open_requests} etiqueta="necesidades" destacada />
          <div className="vr" style={{ backgroundColor: "var(--rp-linea)" }} />
          <Metrica valor={protectora.published_animals} etiqueta="animales" />
          <div className="vr" style={{ backgroundColor: "var(--rp-linea)" }} />
          <Metrica valor={protectora.supporters} etiqueta="apoyos" />
        </div>

        <div className={`d-flex ${esMiProtectora ? 'justify-content-between' : 'justify-content-end'}`}    >
            {esMiProtectora && (
            <Link to={`/panel/perfil`}
                  className="btn btn-danger text-white btn-sm rounded-pill px-4"
            ><i className="fa fa-edit me-1"></i> Modificar</Link>
                )}

          <Link
            to={`/protectoras/${protectora.shelter_id}`}
            className="btn btn-success btn-sm rounded-pill px-4"
          >
            Ver perfil
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProtectoraCard;