import React, { useEffect, useState } from "react";
import { Cifra, Bloque, Fila } from "../../components/ResumenPiezas";
import { getMisColaboraciones } from "../../services/requestsService";
import { getMisSolicitudesAdopcion } from "../../services/addoptionRequestService";
import { ACEPTADA, ADDOPTION_REQUEST_STATUS_LABELS } from "../../utils/addoptionRequestStatus";
 
const MAX_FILAS = 5;
 
export const ColaboradorActividad = () => {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
 
  useEffect(() => {
    // las cifras salen del total_items de cada listado: con perPage 1 solo nos interesa el recuento
    Promise.all([
      getMisColaboraciones({ perPage: MAX_FILAS }),
      getMisColaboraciones({ perPage: 1 }, { respondidas: true }),
      getMisSolicitudesAdopcion({ perPage: MAX_FILAS }),
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
 
  return (
    <div className="container py-5">
      <div className="mb-4">
        <h2 className="fw-bold mb-2">Mi actividad</h2>
        <p className="mb-0">Un resumen de lo que has aportado a las protectoras de la red.</p>
      </div>
 
      {cargando ? (
        <div className="py-5 text-center text-muted">Cargando actividad…</div>
      ) : error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : (
        <>
          <div className="row g-3 mb-4">
            <Cifra numero={datos.colaboraciones.total_items} texto="Colaboraciones enviadas" color="#138f4d" />
            <Cifra numero={datos.respondidas} texto="Respondidas por las protectoras" color="#E8B04B" />
            <Cifra numero={datos.solicitudes.total_items} texto="Solicitudes de adopción" color="#F0946A" />
            <Cifra numero={datos.aceptadas} texto="Adopciones aceptadas" color="#E0756B" />
          </div>
 
          <div className="row g-3">
            <Bloque titulo="Mis colaboraciones" vacio="Todavía no has colaborado con ninguna necesidad.">
              {datos.colaboraciones.items.map((colaboracion) => (
                <Fila
                  key={colaboracion.user_request_id}
                  to={`/necesidades/${colaboracion.request?.request_id}`}
                  nombre={colaboracion.request?.name}
                  etiqueta={colaboracion.shelter_answer ? "Respondida" : "Sin respuesta"}
                  badgeClass={colaboracion.shelter_answer ? undefined : "bg-secondary"}
                />
              ))}
            </Bloque>
 
            <Bloque titulo="Mis solicitudes de adopción" vacio="Todavía no has solicitado ninguna adopción.">
              {datos.solicitudes.items.map((solicitud) => {
                const estado = ADDOPTION_REQUEST_STATUS_LABELS[solicitud.status];
                return (
                  <Fila
                    key={solicitud.addoption_request_id}
                    to={`/adoptar/${solicitud.animal?.animal_id}`}
                    nombre={solicitud.animal?.name}
                    etiqueta={estado?.label}
                    badgeClass={estado?.badgeClass}
                  />
                );
              })}
            </Bloque>
          </div>
        </>
      )}
    </div>
  );
};