import React from "react";
import { ProtectoraCard } from "../components/protectora/ProtectoraCard";
import { Footer } from "../components/Footer";

export const Protectoras = () => {
  const ejemploProtectora = [
    {
      id: 1,
      iniciales: "PH",
      nombre: "Protectora Huellas",
      ubicacion: "Alcalá de Henares, Madrid",
      descripcion: "Rescate y acogida de perros y gatos abandonados desde 2016. Refugio propio con capacidad para 40 animales.",
      necesidades: 5,
      animales: 12,
      colaboraciones: 340,
      distancia_ciudad: "2,4 km de ti",
      web: "#"
    }, {
      id: 1,
      iniciales: "PH",
      nombre: "Protectora Huellas",
      ubicacion: "Alcalá de Henares, Madrid",
      descripcion: "Rescate y acogida de perros y gatos abandonados desde 2016. Refugio propio con capacidad para 40 animales.",
      necesidades: 5,
      animales: 12,
      colaboraciones: 340,
      distancia_ciudad: "2,4 km de ti",
      web: "#"
    }
  ];

  return (
    <div className="container-fluid py-5" style={{ backgroundColor: "#FAF9F6", minHeight: "100vh" }}>
      <div className="container">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4">
          <div>
            <small className="text-success fw-bold text-uppercase" style={{ letterSpacing: "1px", fontSize: "0.75rem" }}>
              RED DE PROTECTORAS
            </small>
            <h1 className="fw-bold text-dark mt-2 mb-1" style={{ fontSize: "2.5rem" }}>
              Protectoras registradas
            </h1>
            <p className="text-muted mb-0">1 protectora verificada en toda España</p>
          </div>
          <button className="btn btn-success rounded-pill px-4 py-2 mt-3 mt-md-0 fw-semibold shadow-sm">
            Registrar mi protectora
          </button>
        </div>

        <div className="d-flex flex-wrap gap-2 mb-5 align-items-center">
          <button className="btn btn-success rounded-pill px-3 py-2 fw-medium">Todas</button>
          <button className="btn bg-white text-muted border rounded-pill px-3 py-2 fw-medium">Con necesidades urgentes</button>
          <button className="btn bg-white text-muted border rounded-pill px-3 py-2 fw-medium">Cerca de mí</button>
          
          <select className="form-select w-auto rounded-pill border-0 shadow-sm text-secondary ms-md-2 px-4 py-2 bg-white fw-medium">
            <option defaultValue>Cualquier provincia</option>
            <option value="madrid">Madrid</option>
            <option value="valencia">Valencia</option>
            <option value="sevilla">Sevilla</option>
          </select>
        </div>

        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {ejemploProtectora.map((item) => (
            <div className="col" key={item.id}>
              <ProtectoraCard protectora={item} />
              
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Protectoras;