import React from "react";

export const AnimalCard = ({ animal, onConocemeClick }) => {
  return (
    <div className="card h-100 border-0 shadow-sm" style={{ backgroundColor: "var(--rp-papel)", borderRadius: "var(--bs-border-radius-lg)" }}>
      
      {/* Contenedor de la imagen usando tus clases CSS (card-placeholder + img-nala, etc.) */}
      <div 
        className={`card-placeholder position-relative ${animal.cssClass}`} 
        style={{ 
          borderTopLeftRadius: "var(--bs-border-radius-lg)", 
          borderTopRightRadius: "var(--bs-border-radius-lg)",
          /* Si quieres que mantengan 220px de altura en lugar de los 160px de tu CSS, descomenta la siguiente línea: */
          // height: "220px" 
        }}
      >
        {/* Etiquetas sobre la imagen */}
        <div className="position-absolute top-0 start-0 p-3 d-flex flex-column gap-2">
          <span className="badge" style={{ backgroundColor: "var(--rp-verde)", color: "var(--rp-papel)" }}>
            {animal.estado}
          </span>
          {animal.urgente && (
            <span className="badge" style={{ backgroundColor: "var(--rp-arcilla)", color: "var(--rp-papel)" }}>
              ¡Urgente!
            </span>
          )}
        </div>
      </div>

      <div className="card-body d-flex flex-column p-3">
        {/* Nombre y Raza */}
        <div className="d-flex justify-content-between align-items-baseline mb-3">
          <h4 className="card-title mb-0" style={{ color: "var(--rp-pino)", fontFamily: "var(--rp-display)" }}>{animal.nombre}</h4>
          <span className="text-muted" style={{ fontSize: "0.85rem", color: "var(--rp-gris)" }}>{animal.tipo}</span>
        </div>

        {/* Fila de Edad y Peso */}
        <div className="d-flex gap-2 mb-3">
          <div className="d-flex flex-column align-items-center justify-content-center border rounded py-2 px-3 w-50" style={{ borderColor: "var(--rp-linea) !important", backgroundColor: "var(--rp-hueso)" }}>
            <span className="rp-eyebrow mb-1">Edad</span>
            <strong style={{ color: "var(--rp-tinta)", fontSize: "0.95rem" }}>{animal.edad}</strong>
          </div>
          <div className="d-flex flex-column align-items-center justify-content-center border rounded py-2 px-3 w-50" style={{ borderColor: "var(--rp-linea) !important", backgroundColor: "var(--rp-hueso)" }}>
            <span className="rp-eyebrow mb-1">Peso</span>
            <strong style={{ color: "var(--rp-tinta)", fontSize: "0.95rem" }}>{animal.peso}</strong>
          </div>
        </div>

        {/* Descripción */}
        <p className="card-text flex-grow-1" style={{ fontSize: "0.875rem", color: "var(--rp-gris)", lineHeight: "1.5" }}>
          {animal.descripcion}
        </p>

        {/* Características */}
        <div className="d-flex flex-wrap gap-1 mb-4">
          {animal.caracteristicas.map((caract, idx) => (
            <span key={idx} className="badge border" style={{ backgroundColor: "transparent", color: "var(--rp-verde)", borderColor: "var(--rp-verde) !important", fontSize: "0.75rem", padding: "0.35rem 0.6rem" }}>
              ✓ {caract}
            </span>
          ))}
        </div>

        {/* Footer de la tarjeta con botón */}
        <div className="mt-auto">
          <div className="mb-3 d-flex align-items-center gap-2" style={{ color: "var(--rp-gris)", fontSize: "0.85rem" }}>
            <span style={{ color: "var(--rp-arcilla)" }}>📍</span> {animal.protectora}
          </div>
          
          <button
            className="btn btn-outline-success w-100 rounded-pill"
            onClick={onConocemeClick}
          >
            Conóceme
          </button>
        </div>
      </div>
    </div>
  );
};