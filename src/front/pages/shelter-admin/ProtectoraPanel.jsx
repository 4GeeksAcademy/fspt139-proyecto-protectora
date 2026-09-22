import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getShelterProfile } from "../../services/sheltersService";
import { getShelterNecesidades } from "../../services/requestsService";
import { getShelterAddoptionProcesses } from "../../services/addoptionProcessService";
import { calcularDeadlineLabel, construirBadge } from "../../utils/necesidadDeadline";

const MAX_FILAS = 3;

// cifra del resumen, mismo aspecto que Statscard del Home; con `to` es clicable
const Cifra = ({ numero, texto, color, to }) => {
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

// bloque con titulo, enlace a la seccion completa y sus filas (o un texto si no hay ninguna)
const Bloque = ({ titulo, verTodas, vacio, children }) => (
  <div className="col-md-6">
    <div className="p-4 rounded-4 shadow-sm h-100" style={{ backgroundColor: "var(--rp-papel)" }}>
      <div className="d-flex justify-content-between align-items-baseline mb-2">
        <h5 className="fw-bold mb-0">{titulo}</h5>
        <Link to={verTodas} className="small">
          Ver todas
        </Link>
      </div>
      {React.Children.count(children) > 0 ? children : <p className="text-muted small mb-0 mt-3">{vacio}</p>}
    </div>
  </div>
);

// fila clicable con nombre y etiqueta; sin `fondo` la etiqueta va en verde claro
const Fila = ({ to, nombre, etiqueta, fondo }) => (
  <Link
    to={to}
    className="d-flex justify-content-between align-items-center gap-2 py-2 border-top text-decoration-none text-reset"
  >
    <span className="text-truncate">{nombre}</span>
    <span
      className="badge rounded-pill flex-shrink-0"
      style={fondo ? { backgroundColor: fondo } : { backgroundColor: "var(--rp-verde-cl)", color: "var(--rp-verde-osc)" }}
    >
      {etiqueta}
    </span>
  </Link>
);

export const ProtectoraPanel = () => {
  const [resumen, setResumen] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      getShelterProfile(),
      getShelterNecesidades({ ordenarPor: "request_deadline", orden: "asc", perPage: 20 }, { status: "abierta" }),
      getShelterAddoptionProcesses({ perPage: MAX_FILAS }, { hasPending: true }),
    ])
      .then(([protectora, necesidades, adopciones]) =>
        setResumen({
          protectora,
          plazos: necesidades.items.filter((necesidad) => necesidad.request_deadline).slice(0, MAX_FILAS),
          adopciones,
        }),
      )
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

   if (cargando) return <div className="container py-5 text-center text-muted">Cargando resumen…</div>;
  if (error)
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );

  const { protectora, plazos, adopciones } = resumen;

  return (
    <div className="container py-5">
      <h2 className="fw-bold mb-2">Hola, {protectora.name}</h2>
      <p className="mb-4">Esto es lo que tenéis en marcha ahora mismo.</p>

      <div className="row g-3 mb-4">
        <Cifra numero={protectora.open_requests} texto="Necesidades abiertas" color="#138f4d" to="/panel/necesidades" />
        <Cifra numero={protectora.published_animals} texto="Animales en adopción" color="#F0946A" to="/panel/animales" />
        <Cifra numero={adopciones.total_items} texto="Adopciones por revisar" color="#E8B04B" to="/panel/adopciones" />
        <Cifra numero={protectora.supporters} texto="Colaboradores en total" color="#E0756B" />
      </div>

      <div className="row g-3">
        <Bloque titulo="Próximos plazos" verTodas="/panel/necesidades" vacio="No tenéis necesidades abiertas con fecha límite.">
          {plazos.map((necesidad) => {
            const badge = construirBadge(necesidad) || { texto: calcularDeadlineLabel(necesidad.request_deadline) };
            return (
              <Fila
                key={necesidad.request_id}
                to={`/panel/necesidades/${necesidad.request_id}`}
                nombre={necesidad.name}
                etiqueta={badge.texto}
                fondo={badge.fondo}
              />
            );
          })}
        </Bloque>

        <Bloque titulo="Solicitudes de adopción" verTodas="/panel/adopciones" vacio="No hay solicitudes pendientes de revisar.">
          {adopciones.items.map((proceso) => (
            <Fila
              key={proceso.addoption_process_id}
              to={`/panel/adopciones/${proceso.addoption_process_id}`}
              nombre={proceso.animal?.name}
              etiqueta={`${proceso.pending_count} ${proceso.pending_count === 1 ? "nueva" : "nuevas"}`}
            />
          ))}
        </Bloque>
      </div>
    </div>
  );
};