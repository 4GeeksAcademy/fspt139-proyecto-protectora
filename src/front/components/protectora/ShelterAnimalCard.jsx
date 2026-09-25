import React from "react";
import { Link } from "react-router-dom";
import { calcularAgeLabel } from "../../utils/animalAge";
import { cargarMediaUrl } from "../../services/animalsService";
import { ANIMAL_STATUS_LABELS, ANIMAL_STATUS_BADGE_CLASS } from "../../utils/format";

const truncate = (text, max) => {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max).trim()}…` : text;
};

export const ShelterAnimalCard = ({ animal }) => {
  if (!animal) return null;

  const ageLabel = calcularAgeLabel(animal.birthdate) || "N/A";
  const traits = (animal.traits || "")
    .split(",")
    .map((trait) => trait.trim())
    .filter(Boolean);
  const sexLabel = animal.sex === "macho" ? "Macho" : animal.sex === "hembra" ? "Hembra" : null;
  const tieneProceso = Boolean(animal.addoption_process_id);

  return (
    <div className="card h-100 shadow-sm">
      <div
        className="position-relative bg-light d-flex align-items-center justify-content-center overflow-hidden rounded-top"
        style={{ height: "160px" }}
      >
        {/*<div className="position-absolute top-0 start-0 m-3 d-flex flex-column gap-1 align-items-start">*/}

        <div className="position-absolute top-0 start-0 m-2 d-flex align-items-top gap-1 justify-content-between" style={{width:"95%"}}>
          <div className="d-flex align-items-start gap-1 flex-column ">
            <span className={`badge ${ANIMAL_STATUS_BADGE_CLASS[animal.status] || "bg-secondary"}`}>
              {ANIMAL_STATUS_LABELS[animal.status] || animal.status}
            </span>
            {animal.is_adopted ? (
              <span className="badge" style={{ backgroundColor: "var(--rp-verde)", color: "var(--rp-papel)" }}>
                {animal.sex === "hembra" ? "Adoptada" : "Adoptado"}
              </span>
            ) : tieneProceso && (
              <span className="badge" style={{ backgroundColor: "var(--rp-miel)", color: "var(--rp-papel)" }}>
                En adopción
              </span>
            )}
          </div>
          <Link to={`/panel/adopciones/${animal.addoption_process_id}`}>
          <span className="badge bg-success text-white" title="Solicitudes de adopción recibidas">
            <i className="fa fa-envelope me-1"></i>
            {animal.addoption_requests_count ?? 0}
          </span>
          </Link>
        </div>
        {animal.cover_image ? (
          <img
            src={cargarMediaUrl(animal.cover_image)}
            alt={animal.name}
            className="w-100 h-100"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <span style={{ fontSize: "2rem", opacity: 0.35 }}>🐾</span>
        )}
      </div>

      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-baseline mb-2">
          <h5 className="card-title mb-0 fw-bold">{animal.name}</h5>
          <small className="text-muted text-truncate ms-2">{animal.breed}</small>
        </div>

        <div className="row g-2 mb-3 text-center">
          <div className="col-6">
            <div className="border rounded py-2 bg-light">
              <div className="text-uppercase text-muted" style={{ fontSize: "0.65rem" }}>
                Edad
              </div>
              <strong style={{ fontSize: "0.9rem" }}>{ageLabel}</strong>
            </div>
          </div>
          <div className="col-6">
            <div className="border rounded py-2 bg-light">
              <div className="text-uppercase text-muted" style={{ fontSize: "0.65rem" }}>
                Peso
              </div>
              <strong style={{ fontSize: "0.9rem" }}>{animal.weight ? `${Number(animal.weight)} kg` : "—"}</strong>
            </div>
          </div>
        </div>

        <p className="text-muted small flex-grow-1">{truncate(animal.story, 110) || "Sin historia todavía."}</p>

        {traits.length > 0 && (
          <div className="d-flex flex-wrap gap-1 mb-3">
            {traits.slice(0, 3).map((trait) => (
              <span key={trait} className="badge bg-light text-dark border">
                {trait}
              </span>
            ))}
          </div>
        )}



        <div className="d-flex gap-2 justify-content-between">
        <Link to={`/panel/animales/${animal.animal_id}`} className="btn btn-outline-success mt-auto">
          Editar ✏️
        </Link>
        <Link to={`/animal/view/${animal.animal_id}`} className="btn btn-outline-success mt-auto">
          Vista Pública 👀
        </Link>
        </div>
      </div>
    </div>
  );
};
