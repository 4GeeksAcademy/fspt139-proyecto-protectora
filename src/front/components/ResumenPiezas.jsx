import React, { useState } from "react";
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
 
// bloque con titulo, enlace opcional a la seccion completa, sus filas (o un texto si no hay ninguna)
// y un pie opcional debajo de las filas
export const Bloque = ({ titulo, verTodas, vacio, pie, children }) => (
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
      {pie}
    </div>
  </div>
);
 
// etiqueta de las filas: admite clases de Bootstrap (`badgeClass`), un color de fondo (`fondo`)
// o, sin ninguno de los dos, el verde claro por defecto
const Etiqueta = ({ texto, fondo, badgeClass }) => {
  const estilo = fondo
    ? { backgroundColor: fondo }
    : { backgroundColor: "var(--rp-verde-cl)", color: "var(--rp-verde-osc)" };
 
  return (
    <span className={`badge rounded-pill flex-shrink-0 ${badgeClass || ""}`} style={badgeClass ? undefined : estilo}>
      {texto}
    </span>
  );
};
 
// fila clicable con nombre y etiqueta que lleva a otra pagina
export const Fila = ({ to, nombre, etiqueta, fondo, badgeClass }) => (
  <Link
    to={to}
    className="d-flex justify-content-between align-items-center gap-2 py-2 border-top text-decoration-none text-reset"
  >
    <span className="text-truncate">{nombre}</span>
    <Etiqueta texto={etiqueta} fondo={fondo} badgeClass={badgeClass} />
  </Link>
);
 
// fila con el mismo aspecto que Fila, pero al pulsarla despliega su detalle (children) en vez de navegar
export const FilaDesplegable = ({ nombre, etiqueta, fondo, badgeClass, children }) => {
  const [abierta, setAbierta] = useState(false);
 
  return (
    <div className="border-top">
      <button
        type="button"
        className="btn w-100 d-flex justify-content-between align-items-center gap-2 py-2 px-0 border-0 text-start"
        onClick={() => setAbierta(!abierta)}
        aria-expanded={abierta}
      >
        <span className="text-truncate">{nombre}</span>
        <span className="d-flex align-items-center gap-2 flex-shrink-0">
          <Etiqueta texto={etiqueta} fondo={fondo} badgeClass={badgeClass} />
          <i className={`fa-solid fa-chevron-${abierta ? "up" : "down"} small text-muted`}></i>
        </span>
      </button>
 
      {abierta && <div className="small pb-3">{children}</div>}
    </div>
  );
};