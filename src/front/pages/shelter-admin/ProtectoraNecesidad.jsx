import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getShelterNecesidad, getShelterUserRequests } from "../../services/requestsService";
import { cargarMediaUrl } from "../../services/animalsService";
import { calcularDeadlineLabel } from "../../utils/necesidadDeadline";
import { ContribucionRow } from "../../components/protectora/ContribucionRow";
import { ResponderContribucionesModal } from "../../components/protectora/ResponderContribucionesModal";
import {formatearCantidad} from "../../utils/format";
import BotonCompartir from "../../components/BotonCompartir";

const PER_PAGE = 20;

const ESTADO_LABELS = {
  borrador: { label: "Borrador", badgeClass: "bg-light text-dark border" },
  cerrada: { label: "Cerrada", badgeClass: "bg-secondary" },
  abierta: { label: "Abierta", badgeClass: "bg-warning text-dark" },
};


export const ProtectoraNecesidad = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [necesidad, setNecesidad] = useState(null);
  const [cargandoNecesidad, setCargandoNecesidad] = useState(true);
  const [errorNecesidad, setErrorNecesidad] = useState("");

  const [contribuciones, setContribuciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [seleccionadas, setSeleccionadas] = useState(new Set());
  const [respondiendoA, setRespondiendoA] = useState(null); // contribucion individual, o "bulk"

  const cargarNecesidad = useCallback(() => {
    setCargandoNecesidad(true);
    setErrorNecesidad("");
    getShelterNecesidad(id)
      .then(setNecesidad)
      .catch((err) => setErrorNecesidad(err.message))
      .finally(() => setCargandoNecesidad(false));
  }, [id]);

  useEffect(() => {
    cargarNecesidad();
  }, [cargarNecesidad]);

  const cargarContribuciones = useCallback(() => {
    setCargando(true);
    setError("");
    getShelterUserRequests(id, { pagina: page, perPage: PER_PAGE })
      .then((data) => {
        setContribuciones(data.items || []);
        setTotalPages(data.total_pages || 1);
        setSeleccionadas(new Set());
      })
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, [id, page]);

  useEffect(() => {
    cargarContribuciones();
  }, [cargarContribuciones]);

  const refrescarTodo = () => {
    cargarNecesidad();
    cargarContribuciones();
  };

  const seleccionablesEnPagina = contribuciones.filter((c) => !c.shelter_answer);
  const todasSeleccionadas =
    seleccionablesEnPagina.length > 0 && seleccionablesEnPagina.every((c) => seleccionadas.has(c.user_request_id));

  const alternarSeleccion = (userRequestId) => {
    setSeleccionadas((prev) => {
      const next = new Set(prev);
      if (next.has(userRequestId)) next.delete(userRequestId);
      else next.add(userRequestId);
      return next;
    });
  };

  const alternarSeleccionarTodas = () => {
    setSeleccionadas((prev) => {
      if (prev.size > 0 && todasSeleccionadas) return new Set();
      return new Set(seleccionablesEnPagina.map((c) => c.user_request_id));
    });
  };

  const contribucionesSeleccionadas = contribuciones.filter((c) => seleccionadas.has(c.user_request_id));

  const handleResponderSeleccionadas = () => {
    if (contribucionesSeleccionadas.length === 0) return;
    setRespondiendoA(contribucionesSeleccionadas);
  };

  const handleResponderUna = (contribucion) => {
    setRespondiendoA([contribucion]);
  };

  const handleRespondido = () => {
    setRespondiendoA(null);
    refrescarTodo();
  };




  if (cargandoNecesidad) {
    return (
      <div className="container py-5 d-flex justify-content-center">
        <div className="spinner-grow" style={{ color: "var(--rp-verde)" }} role="status">
          <span className="visually-hidden">Cargando…</span>
        </div>
      </div>
    );
  }

  if (errorNecesidad || !necesidad) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{errorNecesidad || "No se ha podido cargar la necesidad"}</div>
        <Link to="/panel/necesidades" className="btn btn-outline-secondary">← Volver al listado</Link>
      </div>
    );
  }

  const estado = ESTADO_LABELS[necesidad.status] || { label: necesidad.status, badgeClass: "bg-light text-dark border" };
  const tieneObjetivo = necesidad.amount_needed != null;
  const actual = Number(necesidad.amount_current) || 0;
  const objetivo = Number(necesidad.amount_needed) || 0;
  const percent = tieneObjetivo && objetivo > 0 ? Math.min((actual / objetivo) * 100, 100) : 0;



  return (
    <div className="container py-5">
      <Link to="/panel/necesidades" className="btn btn-outline-secondary rounded-pill mb-4">
        <i className="fa fa-arrow-left text-danger me-1"></i> Volver al listado
      </Link>

      <div className="card shadow-sm rounded-4 mb-4">
        <div className="card-body">


          <div className="d-flex flex-nowrap gap-3 align-items-start">
            <div
              className="flex-shrink-0 rounded-3 overflow-hidden bg-light d-flex align-items-center justify-content-center"
              style={{ width: "72px", height: "72px" }}
            >
              {necesidad.cover_image ? (
                <img src={cargarMediaUrl(necesidad.cover_image)} alt="" className="w-100 h-100" style={{ objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: "1.3rem", opacity: 0.35 }}>🐾</span>
              )}
            </div>


            <div className="flex-grow-1 min-w-0">
              <div className="d-flex align-items-center gap-2 mb-1">
                <h4 className="fw-bold mb-0">{necesidad.name}</h4>

              </div>
              <p className="text-muted mb-0" style={{ fontSize: "0.875rem" }}>
                {necesidad.request_type_name || "Necesidad"}
                {necesidad.animal_name ? ` · ${necesidad.animal_name}` : " · Necesidad general"}
              </p>
            </div>

            <div className="dropdown">
              <button
                type="button"
                className="btn btn-outline-secondary d-flex align-items-center justify-content-center"
                style={{ width: "40px", height: "40px" }}
                data-bs-toggle="dropdown"
                aria-expanded="false"
                aria-label="Más acciones de la necesidad"
              >
                <i className="fa fa-ellipsis-vertical"></i>
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => navigate(`/panel/necesidades/${necesidad.request_id}/editar`)}
                  >
                    <i className="fa fa-pencil me-2"></i> Editar
                  </button>
                </li>
              </ul>
            </div>

          </div>
          <span className={`badge ${estado.badgeClass} mt-3`}>{estado.label}</span>

          <hr />

          {necesidad.description && <p className="mb-3">{necesidad.description}</p>}

          {tieneObjetivo && (
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-baseline mb-1">
                <span>
                  <strong>{formatearCantidad(actual)}</strong>
                  <span className="text-muted"> / {formatearCantidad(objetivo)} {necesidad.unit}</span>
                </span>
                <small className="text-muted">
                  {necesidad.collaborators || 0} {necesidad.collaborators === 1 ? "colaborador" : "colaboradores"}
                </small>
              </div>
              <div className="progress" style={{ height: "8px" }}>
                <div
                  className="progress-bar bg-success"
                  style={{ width: `${percent}%` }}
                  role="progressbar"
                  aria-valuenow={percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>
          )}

          <div className="row g-3">
            <div className="col-6 col-md-3">
              <div className="text-uppercase text-muted" style={{ fontSize: "0.7rem" }}>Fecha límite</div>
              <div className="fw-semibold" style={{ fontSize: "0.9rem" }}>
                {calcularDeadlineLabel(necesidad.request_deadline)}
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="text-uppercase text-muted" style={{ fontSize: "0.7rem" }}>A tener en cuenta</div>
              <div className="fw-semibold" style={{ fontSize: "0.9rem" }}>{necesidad.footnote || "—"}</div>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <div className="card shadow-sm rounded-4 overflow-hidden">
        <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom bg-light">
          <span className="fw-semibold" style={{ fontSize: "0.9rem" }}>Contribuciones</span>
        </div>

        {seleccionablesEnPagina.length !== 0 && (
          <div className="d-flex flex-wrap align-items-center gap-2 px-2 py-2 border-bottom bg-light">
            <label
              className="d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: "2.75rem", height: "2.75rem", margin: "-0.5rem 0", cursor: "pointer" }}
            >
              <input
                type="checkbox"
                className="form-check-input"
                style={{ width: "1.2rem", height: "1.2rem", cursor: "inherit" }}
                checked={todasSeleccionadas}
                onChange={alternarSeleccionarTodas}
                aria-label="Seleccionar todas las contribuciones pendientes de esta página"
              />
            </label>

            {seleccionadas.size > 0 && (
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 flex-grow-1">
                <span className="fw-semibold" style={{ fontSize: "0.9rem" }}>
                  {seleccionadas.size} {seleccionadas.size === 1 ? "seleccionada" : "seleccionadas"}
                </span>
                <div className="d-flex flex-wrap gap-2">
                  <button type="button" className="btn btn-link btn-sm" onClick={() => setSeleccionadas(new Set())}>
                    Limpiar selección
                  </button>
                  <button
                    type="button"
                    className="btn btn-success btn-sm rounded-pill px-3"
                    onClick={handleResponderSeleccionadas}
                  >
                    Responder seleccionadas <i className="fa fa-reply"></i>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {cargando ? (
          <div className="text-center text-muted py-5">Cargando contribuciones…</div>
        ) : contribuciones.length === 0 ? (
          <div className="text-center text-muted py-5">
            <p className="mb-0">Todavía no ha llegado ninguna colaboración para tu petición.</p>

          <BotonCompartir url={`${window.location.origin}/necesidades/${necesidad.request_id}`} />

          </div>
        ) : (
          contribuciones.map((contribucion) => (
            <ContribucionRow
              key={contribucion.user_request_id}
              contribucion={contribucion}
              unit={necesidad.unit}
              seleccionada={seleccionadas.has(contribucion.user_request_id)}
              onAlternarSeleccion={alternarSeleccion}
              onResponder={handleResponderUna}
              mostrarInput={seleccionablesEnPagina.length !== 0}
            />
          ))
        )}
      </div>

      {totalPages > 1 && (
        <nav className="d-flex justify-content-center mt-4" aria-label="Paginación de contribuciones">
          <ul className="pagination mb-0">
            <li className={`page-item ${page <= 1 ? "disabled" : ""}`}>
              <button type="button" className="page-link" onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Anterior
              </button>
            </li>
            <li className="page-item disabled">
              <span className="page-link">Página {page} de {totalPages}</span>
            </li>
            <li className={`page-item ${page >= totalPages ? "disabled" : ""}`}>
              <button type="button" className="page-link" onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                Siguiente
              </button>
            </li>
          </ul>
        </nav>
      )}

      {respondiendoA && (
        <ResponderContribucionesModal
          contribuciones={respondiendoA}
          onCerrar={() => setRespondiendoA(null)}
          onRespondido={handleRespondido}
        />
      )}
    </div>
  );
};

export default ProtectoraNecesidad;
