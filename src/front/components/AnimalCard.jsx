import React from "react";
import { Link } from "react-router-dom";
import { calcularAgeLabel } from "../utils/animalAge";
import { construirTags } from "../utils/animalTags";
import { cargarMediaUrl } from "../services/animalsService";

const MAX_TAGS = 3;

// "Perro" + hembra -> "Perra". Funciona con Perro/Gato/Conejo; con Hurón devuelve el original.
const concordarEspecie = (species, sex) => {
  if (!species) return null;
  if (sex === "hembra" && species.endsWith("o")) return `${species.slice(0, -1)}a`;
  return species;
};

const formatearPeso = (weight) => {
  const kg = Number(weight);
  if (!Number.isFinite(kg) || kg <= 0) return null;
  return `${kg.toLocaleString("es-ES")} kg`;
};

const truncar = (texto, max) => {
  if (!texto) return "";
  return texto.length > max ? `${texto.slice(0, max).trim()}…` : texto;
};

export const AnimalCard = ({ animal, esMia = false }) => {
  if (!animal) return null;

  const tieneProceso = Boolean(animal.addoption_process_id);
  const tieneRequests = Boolean(animal.animal_request_ids?.length);

  const subtitulo = [
    concordarEspecie(animal.species, animal.sex),
    animal.breed,
    calcularAgeLabel(animal.birthdate),
    formatearPeso(animal.weight),
  ]
    .filter(Boolean)
    .join(" · ");

  const tags = construirTags(animal).slice(0, MAX_TAGS);

  return (
    <div
      className="card h-100 border-0 shadow-sm overflow-hidden"
      style={{ backgroundColor: "var(--rp-papel)", borderRadius: "var(--bs-border-radius-lg)" }}
    >
      <div
        className="position-relative d-flex align-items-center justify-content-center"
        style={{ height: "200px", backgroundColor: "var(--rp-verde-cl)" }}
      >
        {animal.cover_image ? (
          <img
            src={cargarMediaUrl(animal.cover_image)}
            alt={animal.name}
            className="w-100 h-100"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <span style={{ fontSize: "3rem", opacity: 0.35 }}>🐾</span>
        )}

        {(tieneProceso || tieneRequests) && (
          <div className="position-absolute top-0 start-0 m-3 d-flex flex-column gap-1 align-items-start">
            {tieneProceso && (
              <span className="badge" style={{ backgroundColor: "var(--rp-miel)", color: "var(--rp-papel)" }}>
                En adopción
              </span>
            )}
            {tieneRequests && (
              <span className="badge" style={{ backgroundColor: "var(--rp-arcilla)", color: "var(--rp-papel)" }}>
                Te necesita
              </span>
            )}
          </div>
        )}
      </div>

      <div className="card-body d-flex flex-column p-3">
        <h4 className="card-title mb-1" style={{ color: "var(--rp-pino)", fontFamily: "var(--rp-display)" }}>
          {animal.name}
        </h4>

        {subtitulo && (
          <p className="mb-2" style={{ fontSize: "0.85rem", color: "var(--rp-gris)" }}>
            {subtitulo}
          </p>
        )}

        <p className="card-text flex-grow-1" style={{ fontSize: "0.875rem", color: "var(--rp-gris)", lineHeight: 1.5 }}>
          {truncar(animal.story, 120)}
        </p>

        {tags.length > 0 && (
          <div className="d-flex flex-wrap gap-1 mb-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className="badge border"
                style={{
                  backgroundColor: "transparent",
                  color: "var(--rp-verde)",
                  borderColor: "var(--rp-verde)",
                  fontSize: "0.75rem",
                  padding: "0.35rem 0.6rem",
                }}
              >
                ✓ {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto d-flex flex-wrap justify-content-between align-items-center gap-2">
          {animal.shelter_id ? (
            <Link
              to={`/protectoras/${animal.shelter_id}`}
              className="text-truncate text-decoration-none"
              style={{ color: "var(--rp-gris)", fontSize: "0.875rem" }}
            >
              {animal.shelter_name || "Ver protectora"}
            </Link>
          ) : (
            <small className="text-truncate" style={{ color: "var(--rp-gris)" }}>
              Protectora sin asignar
            </small>
          )}

          <div className="d-flex flex-wrap gap-2 flex-shrink-0">
            {esMia && (
              <Link
                to={`/panel/animales/${animal.animal_id}`}
                className="btn btn-sm btn-outline-secondary"
              >
                Editar ✏️
              </Link>
            )}

            <Link to={`/adoptar/${animal.animal_id}`} className="btn btn-sm btn-outline-success">
              Ver ficha
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};