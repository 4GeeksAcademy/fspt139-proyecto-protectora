import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getShelterNecesidades } from "../../services/requestsService";
import { getShelterAddoptionProcesses } from "../../services/addoptionProcessService";
import { calcularDeadlineLabel, construirBadge } from "../../utils/necesidadDeadline";
import { Cifra, Bloque, Fila } from "../ResumenPiezas";

const MAX_FILAS = 3;



export const ResumenProtectora = ({ protectora }) => {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      getShelterNecesidades({ ordenarPor: "request_deadline", orden: "asc", perPage: 20 }, { status: "abierta" }),
      getShelterAddoptionProcesses({ perPage: MAX_FILAS }, { hasPending: true }),
    ])
      .then(([necesidades, adopciones]) =>
        setDatos({
          plazos: necesidades.items.filter((necesidad) => necesidad.request_deadline).slice(0, MAX_FILAS),
          adopciones,
        }),
      )
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <div className="py-5 text-center text-muted">Cargando resumen…</div>;
  if (error)
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );

  const { plazos, adopciones } = datos;

  return (
    <>
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
    </>
  );
};

export default ResumenProtectora;