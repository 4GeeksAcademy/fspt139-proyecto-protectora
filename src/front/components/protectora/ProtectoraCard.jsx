import React from "react";

export const ProtectoraCard = ({ protectora }) => {
  if (!protectora) return null;

  const nombre = protectora.nombre || protectora.name || "Sin nombre";
  const ubicacion = protectora.ubicacion || protectora.ciudad || protectora.location || "Ubicación no especificada";
  const descripcion = protectora.descripcion || protectora.description || "Sin descripción disponible.";
  const iniciales = protectora.iniciales || nombre.substring(0, 2).toUpperCase();
  
  const necesidades = protectora.necesidades ?? protectora.necesidades_count ?? 0;
  const animales = protectora.animales ?? protectora.animales_count ?? 0;
  const colaboraciones = protectora.colaboraciones ?? protectora.colaboraciones_count ?? 0;
  
  const distancia = protectora.distancia_ciudad || protectora.distancia || "Ubicación web";
  const enlaceWeb = protectora.web || protectora.url || "#";

  return (
    <div 
      className="card h-100 border-0 rounded-4 overflow-hidden" 
      style={{ 
        backgroundColor: '#ffffff', 
        boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.06)';
      }}
    >
      <div style={{ height: '6px', background: 'linear-gradient(90deg, #198754, #20c997)' }}></div>
      
      <div className="card-body d-flex flex-column p-4">
        <div className="d-flex align-items-center mb-4">
          <div 
            className="rounded-circle d-flex justify-content-center align-items-center me-3 shadow-sm text-white fw-bold" 
            style={{ 
              width: '55px', 
              height: '55px', 
              background: 'linear-gradient(135deg, #198754, #20c997)',
              fontSize: '1.2rem',
              flexShrink: 0 
            }}
          >
            {iniciales}
          </div>
          <div>
            <h5 className="card-title fw-bold mb-1 text-dark" style={{ lineHeight: '1.2' }}>{nombre}</h5>
            <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1 rounded-pill fw-medium">
              📍 {ubicacion}
            </span>
          </div>
        </div>

        <p className="card-text text-secondary mb-4 flex-grow-1" style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>
          {descripcion}
        </p>

        <div className="d-flex justify-content-between text-center bg-light rounded-4 p-3 mb-4 border" style={{ borderColor: '#f0f0f0' }}>
          <div>
            <h5 className="fw-bold text-success mb-0">{necesidades}</h5>
            <small className="text-muted fw-bold" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Necesidades</small>
          </div>
          <div className="border-end border-start px-3" style={{ borderColor: '#e0e0e0' }}>
            <h5 className="fw-bold text-dark mb-0">{animales}</h5>
            <small className="text-muted fw-bold" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Animales</small>
          </div>
          <div>
            <h5 className="fw-bold text-dark mb-0">{colaboraciones}</h5>
            <small className="text-muted fw-bold" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Apoyos</small>
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center mt-auto pt-2">
          <small className="text-muted fw-medium" style={{ fontSize: '0.85rem' }}>
            {distancia}
          </small>
          <a 
            href={enlaceWeb} 
            className="btn btn-success shadow-sm rounded-pill px-4 py-2 fw-bold" 
            style={{ fontSize: '0.85rem', transition: 'background-color 0.2s ease' }}
          >
            Ver perfil
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProtectoraCard;