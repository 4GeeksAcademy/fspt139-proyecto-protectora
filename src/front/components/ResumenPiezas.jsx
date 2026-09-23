import React from "react";
import { Link } from "react-router-dom";
 
// piezas compartidas de los resumenes de protectora (Home) y colaborador (Actividad)
 
// cifra del resumen, mismo aspecto que Statscard del Home; con `to` es clicable
export const Cifra = ({ numero, texto, color, to }) => {
  const contenido = (
    <div className="border rounded-3 p-3 d-flex align-items-center gap-3 h-100">
      <div className="rounded-2 flex-shrink-0" style={{ width: "12px", height: "12px", backgroundColor: color }} />
      <div>
        <div className="fs-3 fw-bold">{numero}</div>
        <div className="text-secondary small">{texto}</div>
      </div>
    </div>
  );
 
  return (
    <div className="col-6 col-md-3">
      {to ? (
        <Link to={to} className="d-block h-100 text-decoration-none text-reset">
          {contenido}
        </Link>
      ) : (
        contenido
      )}
    </div>
  );
};
 
// bloque con titulo, enlace opcional a la seccion completa y sus filas (o un texto si no hay ninguna)
export const Bloque = ({ titulo, verTodas, vacio, children }) => (
  <div className="col-md-6">
    <div className="p-4 rounded-4 shadow-sm h-100" style={{ backgroundColor: "var(--rp-papel)" }}>
      <div className="d-flex justify-content-between align-items-baseline mb-2">
        <h5 className="fw-bold mb-0">{titulo}</h5>
        {verTodas && (
          <Link to={verTodas} className="small">
            Ver todas
          </Link>
        )}
      </div>
      {React.Children.count(children) > 0 ? children : <p className="text-muted small mb-0 mt-3">{vacio}</p>}
    </div>
  </div>
);
 
// fila clicable con nombre y etiqueta; la etiqueta admite clases de Bootstrap (`badgeClass`),
// un color de fondo (`fondo`) o, sin ninguno de los dos, el verde claro por defecto
export const Fila = ({ to, nombre, etiqueta, fondo, badgeClass }) => {
  const estilo = fondo ? { backgroundColor: fondo } : { backgroundColor: "var(--rp-verde-cl)", color: "var(--rp-verde-osc)" };
 
  return (
    <Link
      to={to}
      className="d-flex justify-content-between align-items-center gap-2 py-2 border-top text-decoration-none text-reset"
    >
      <span className="text-truncate">{nombre}</span>
      <span className={`badge rounded-pill flex-shrink-0 ${badgeClass || ""}`} style={badgeClass ? undefined : estilo}>
        {etiqueta}
      </span>
    </Link>
  );
};