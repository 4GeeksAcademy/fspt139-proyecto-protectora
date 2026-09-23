import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Cifra, Bloque, FilaDesplegable } from "../../components/ResumenPiezas";
import { getMisColaboraciones } from "../../services/requestsService";
import { getMisSolicitudesAdopcion } from "../../services/addoptionRequestService";
import { ACEPTADA, ADDOPTION_REQUEST_STATUS_LABELS } from "../../utils/addoptionRequestStatus";
import { formatearCantidad, formatearFechaRelativa } from "../../utils/format";
 
// filas visibles de inicio en cada bloque
const MAX_FILAS = 5;
// filas que se piden al backend de cada vez: la primera tanda al entrar y otra con cada "Cargar más"
const POR_TANDA = 10;
 
// "200€" pegado, el resto con espacio ("20 kg"), igual que ContribucionRow; mas el comentario si lo hay
const formatearAportacion = (colaboracion) => {
  const unidad = colaboracion.request?.unit;
  const cantidad =
    colaboracion.amount != null
      ? `${formatearCantidad(colaboracion.amount)}${unidad === "€" ? "€" : unidad ? ` ${unidad}` : ""}`
      : null;
  return [cantidad, colaboracion.details].filter(Boolean).join(" · ");
};
 
// pie de cada bloque: "Ver todas / Ver menos" si hay mas filas de las que se ven de inicio y, desplegado,
// "Cargar más" mientras queden filas en el backend
const PieBloque = ({ listado, abierto, onAlternar, onCargarMas, cargandoMas }) => {
  if (listado.total_items <= MAX_FILAS) return null;
  const quedan = listado.total_items - listado.items.length;
 
  return (
    <div className="d-flex gap-3 mt-2">
      <button type="button" className="btn btn-link btn-sm px-0" onClick={onAlternar}>
        {abierto ? "Ver menos" : `Ver todas (${listado.total_items})`}
      </button>
      {abierto && quedan > 0 && (
        <button type="button" className="btn btn-link btn-sm px-0" onClick={onCargarMas} disabled={cargandoMas}>
          {cargandoMas ? "Cargando…" : `Cargar ${Math.min(quedan, POR_TANDA)} más`}
        </button>
      )}
    </div>
  );
};
 
export const ColaboradorActividad = () => {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [todasColaboraciones, setTodasColaboraciones] = useState(false);
  const [todasSolicitudes, setTodasSolicitudes] = useState(false);
  const [cargandoMas, setCargandoMas] = useState(false);
 
  useEffect(() => {
    // las cifras salen del total_items de cada listado: con perPage 1 solo nos interesa el recuento
    Promise.all([
      getMisColaboraciones({ perPage: POR_TANDA }),
      getMisColaboraciones({ perPage: 1 }, { respondidas: true }),
      getMisSolicitudesAdopcion({ perPage: POR_TANDA }),
      getMisSolicitudesAdopcion({ perPage: 1 }, { status: ACEPTADA }),
    ])
      .then(([colaboraciones, respondidas, solicitudes, aceptadas]) =>
        setDatos({
          colaboraciones,
          respondidas: respondidas.total_items,
          solicitudes,
          aceptadas: aceptadas.total_items,
        }),
      )
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);
 
  // pide la siguiente tanda de un listado ("colaboraciones" o "solicitudes") y la añade a la que ya teniamos
  const cargarMas = (clave, pedirTanda) => {
    setCargandoMas(true);
    pedirTanda({ pagina: datos[clave].page + 1, perPage: POR_TANDA })
      .then((tanda) =>
        setDatos((prev) => ({ ...prev, [clave]: { ...tanda, items: [...prev[clave].items, ...tanda.items] } })),
      )
      .catch((err) => setError(err.message))
      .finally(() => setCargandoMas(false));
  };
 
  return (
    <div className="container py-5">
      <div className="mb-4">
        <h2 className="fw-bold mb-2">Mi actividad</h2>
        <p className="mb-0">Un resumen de lo que has aportado a las protectoras de la red.</p>
      </div>
 
      {cargando ? (
        <div className="py-5 text-center text-muted">Cargando actividad…</div>
      ) : !datos ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : (
        <>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
 
          <div className="row g-3 mb-4">
            <Cifra numero={datos.colaboraciones.total_items} texto="Colaboraciones enviadas" color="#138f4d" />
            <Cifra numero={datos.respondidas} texto="Respondidas por las protectoras" color="#E8B04B" />
            <Cifra numero={datos.solicitudes.total_items} texto="Solicitudes de adopción" color="#F0946A" />
            <Cifra numero={datos.aceptadas} texto="Adopciones aceptadas" color="#E0756B" />
          </div>
 
          <div className="row g-3">
            <Bloque
              titulo="Mis colaboraciones"
              vacio="Todavía no has colaborado con ninguna necesidad."
              pie={
                <PieBloque
                  listado={datos.colaboraciones}
                  abierto={todasColaboraciones}
                  onAlternar={() => setTodasColaboraciones(!todasColaboraciones)}
                  onCargarMas={() => cargarMas("colaboraciones", getMisColaboraciones)}
                  cargandoMas={cargandoMas}
                />
              }
            >
              {(todasColaboraciones ? datos.colaboraciones.items : datos.colaboraciones.items.slice(0, MAX_FILAS)).map(
                (colaboracion) => {
                  const aportacion = formatearAportacion(colaboracion);
                  return (
                    <FilaDesplegable
                      key={colaboracion.user_request_id}
                      nombre={colaboracion.request?.name}
                      etiqueta={colaboracion.shelter_answer ? "Respondida" : "Sin respuesta"}
                      badgeClass={colaboracion.shelter_answer ? undefined : "bg-secondary"}
                    >
                      <p className="text-muted mb-1">
                        {colaboracion.request?.shelter_name} · {formatearFechaRelativa(colaboracion.created_at)}
                      </p>
                      {aportacion && <p className="mb-1">Tu aportación: {aportacion}</p>}
                      {colaboracion.shelter_answer && (
                        <p className="rounded-3 p-2 mb-1" style={{ backgroundColor: "var(--rp-verde-cl)" }}>
                          <strong>Respuesta:</strong> {colaboracion.shelter_answer}
                        </p>
                      )}
                      <Link to={`/necesidades/${colaboracion.request?.request_id}`}>Ver necesidad</Link>
                    </FilaDesplegable>
                  );
                },
              )}
            </Bloque>
 
            <Bloque
              titulo="Mis solicitudes de adopción"
              vacio="Todavía no has solicitado ninguna adopción."
              pie={
                <PieBloque
                  listado={datos.solicitudes}
                  abierto={todasSolicitudes}
                  onAlternar={() => setTodasSolicitudes(!todasSolicitudes)}
                  onCargarMas={() => cargarMas("solicitudes", getMisSolicitudesAdopcion)}
                  cargandoMas={cargandoMas}
                />
              }
            >
              {(todasSolicitudes ? datos.solicitudes.items : datos.solicitudes.items.slice(0, MAX_FILAS)).map(
                (solicitud) => {
                  const estado = ADDOPTION_REQUEST_STATUS_LABELS[solicitud.status];
                  return (
                    <FilaDesplegable
                      key={solicitud.addoption_request_id}
                      nombre={solicitud.animal?.name}
                      etiqueta={estado?.label}
                      badgeClass={estado?.badgeClass}
                    >
                      <p className="text-muted mb-1">
                        {solicitud.animal?.shelter_name} · {formatearFechaRelativa(solicitud.created_at)}
                      </p>
                      <Link to={`/adoptar/${solicitud.animal?.animal_id}`}>Ver ficha de {solicitud.animal?.name}</Link>
                    </FilaDesplegable>
                  );
                },
              )}
            </Bloque>
          </div>
        </>
      )}
    </div>
  );
};