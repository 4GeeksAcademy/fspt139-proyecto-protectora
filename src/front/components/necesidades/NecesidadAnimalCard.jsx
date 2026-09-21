import React from "react";
import { Link } from "react-router-dom";
import { cargarMediaUrl } from "../../services/animalsService";
import { ACTIVADO } from "../../utils/format";

// minicard del animal al que pertenece la necesidad, con enlace a su ficha
export const NecesidadAnimalCard = ({ necesidad }) => {
  if (!necesidad?.animal_uuid || necesidad.animal_status !== ACTIVADO) return null;

  return (
    <div className="mt-4">
      <p className="rp-eyebrow mb-2">Animal relacionado</p>
      <div
        className="d-flex align-items-center gap-3 p-2 rounded"
        style={{ backgroundColor: "var(--rp-papel)" }}
      >
        <div
          className="rounded overflow-hidden flex-shrink-0 d-flex align-items-start justify-content-center"
          style={{ width: "64px", height: "64px", backgroundColor: "var(--rp-verde-cl)" }}
        >
          {necesidad.animal_cover_image ? (
            <img
              src={cargarMediaUrl(necesidad.animal_cover_image)}
              alt={necesidad.animal_name}
              className="w-100 h-100"
              style={{ objectFit: "cover" }}
            />
          ) : (
            <span style={{ fontSize: "1.5rem", opacity: 0.35 }}>🐾</span>
          )}
        </div>

        <div className="flex-grow-1">
          <p className="fw-semibold mb-0">{necesidad.animal_name}</p>
          {(necesidad.animal_story) && (
            <p className="small mb-0 text-secondary">
              {necesidad.animal_story}
            </p>
          )}
        </div>

        <Link to={`/adoptar/${necesidad.animal_uuid}`} className="btn btn-sm btn-outline-success flex-shrink-0">
          Ver ficha
        </Link>
      </div>
    </div>
  );
};

export default NecesidadAnimalCard;
