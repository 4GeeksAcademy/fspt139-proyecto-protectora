import React, { useEffect, useState } from "react";
import { generarIniciales } from "../../utils/iniciales";
import { cargarMediaUrl } from "../../services/animalsService";

// circulo con el logo de la protectora, o sus iniciales si no tiene logo
export const AvatarLogoProtectora = ({ logoUrl, nombre, size = 52, className = "", cargando = false }) => {
  const [logoRoto, setLogoRoto] = useState(false);

  useEffect(() => {
    setLogoRoto(false);
  }, [logoUrl]);

  return (
    <div
      className={`position-relative rounded-circle overflow-hidden d-flex align-items-center justify-content-center flex-shrink-0 ${className}`}
      style={{ width: `${size}px`, height: `${size}px`, backgroundColor: "var(--rp-verde-cl)" }}
    >
      {logoUrl && !logoRoto ? (
        <img
          src={cargarMediaUrl(logoUrl)}
          alt=""
          className="w-100 h-100"
          style={{ objectFit: "cover" }}
          onError={() => setLogoRoto(true)}
        />
      ) : (
        <span className="fw-bold" style={{ color: "var(--rp-verde)", fontSize: `${size * 0.34}px` }}>
          {generarIniciales(nombre)}
        </span>
      )}

      {cargando && (
        <div
          className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: "rgba(255,255,255,0.7)" }}
        >
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        </div>
      )}
    </div>
  );
};

export default AvatarLogoProtectora;
