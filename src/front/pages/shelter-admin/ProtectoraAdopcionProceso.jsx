import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { eliminarProcesoAdopcion, getShelterAddoptionProcessById, setAddoptionProcessStatus } from "../../services/addoptionProcessService";
import {
  aceptarSolicitudAdopcion,
  descartarSolicitudesAdopcion,
  getShelterAddoptionRequests,
} from "../../services/addoptionRequestService";
import { cargarMediaUrl } from "../../services/animalsService";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { SolicitudAdopcionRow } from "../../components/protectora/SolicitudAdopcionRow";
import { SolicitudAdopcionDetalleModal } from "../../components/protectora/SolicitudAdopcionDetalleModal";
import { AbrirProcesoAdopcionModal } from "../../components/protectora/FormsProtectora/AbrirProcesoAdopcionModal";
import { ADDOPTION_REQUEST_STATUS_OPTIONS, PENDIENTE } from "../../utils/addoptionRequestStatus";
import { ADDOPTION_PROCESS_STATUS_LABELS, ABIERTO, CERRADO } from "../../utils/addoptionProcessStatus";
import { usePageTitle } from "../../hooks/usePageTitle";

const PER_PAGE = 20;

export const ProtectoraAdopcionProceso = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { store, dispatch } = useGlobalReducer();

  const [proceso, setProceso] = useState(null);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [cargandoProceso, setCargandoProceso] = useState(true);
  const [errorProceso, setErrorProceso] = useState("");
  const [cambiandoEstadoProceso, setCambiandoEstadoProceso] = useState(false);
  const [confirmandoEliminarProceso, setConfirmandoEliminarProceso] = useState(false);
  const [eliminandoProceso, setEliminandoProceso] = useState(false);

  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  usePageTitle("Panel · Proceso de adopción");

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [seleccionadas, setSeleccionadas] = useState(new Set());
  const [procesando, setProcesando] = useState(false);
  const [solicitudAbierta, setSolicitudAbierta] = useState(null);
  const [solicitudAAprobar, setSolicitudAAprobar] = useState(null);
  const [confirmandoDescarteMasivo, setConfirmandoDescarteMasivo] = useState(false);
  const [solicitudADescartar, setSolicitudADescartar] = useState(null);

  const cargarProceso = useCallback(() => {
    setCargandoProceso(true);
    setErrorProceso("");
    getShelterAddoptionProcessById(id)
      .then(setProceso)
      .catch((err) => setErrorProceso(err.message))
      .finally(() => setCargandoProceso(false));
  }, [id]);

  useEffect(() => {
    cargarProceso();
  }, [cargarProceso]);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const cargarSolicitudes = useCallback(() => {
    setCargando(true);
    setError("");
    getShelterAddoptionRequests(id, { pagina: page, perPage: PER_PAGE }, { search, status: statusFilter })
      .then((data) => {
        setSolicitudes(data.items || []);
        setTotalPages(data.total_pages || 1);
        setTotalItems(data.total_items || 0);
        setSeleccionadas(new Set());
      })
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, [id, page, search, statusFilter]);

  useEffect(() => {
    cargarSolicitudes();
  }, [cargarSolicitudes]);

  const refrescarTodo = () => {
    cargarProceso();
    cargarSolicitudes();
  };

  // boton Cerrar/Reabrir de la cabecera: cambia solo el status, sin tocar fechas/limite/requisitos/preguntas
  const handleCambiarEstadoProceso = async () => {
    const nuevoEstado = proceso.status === ABIERTO ? CERRADO : ABIERTO;
    setCambiandoEstadoProceso(true);
    try {
      const actualizado = await setAddoptionProcessStatus(proceso.addoption_process_id, nuevoEstado);
      setProceso(actualizado);
      dispatch({ type: "set-success", payload: nuevoEstado === CERRADO ? "Proceso cerrado." : "Proceso reabierto." });
    } catch (err) {
      dispatch({ type: "set-error", payload: err.message });
    } finally {
      setCambiandoEstadoProceso(false);
    }
  };

  // eliminar solo esta disponible si el proceso todavia no tiene ninguna solicitud (lo valida tambien el backend)
  const confirmarEliminarProceso = async () => {
    setConfirmandoEliminarProceso(false);
    setEliminandoProceso(true);
    try {
      await eliminarProcesoAdopcion(proceso.addoption_process_id);
      dispatch({ type: "set-success", payload: "Proceso de adopción eliminado." });
      navigate("/panel/adopciones");
    } catch (err) {
      dispatch({ type: "set-error", payload: err.message });
      setEliminandoProceso(false);
    }
  };

  const seleccionablesEnPagina = solicitudes.filter((s) => s.status === PENDIENTE);
  const todasSeleccionadas =
    seleccionablesEnPagina.length > 0 && seleccionablesEnPagina.every((s) => seleccionadas.has(s.addoption_request_id));

  const alternarSeleccion = (requestId) => {
    setSeleccionadas((prev) => {
      const next = new Set(prev);
      if (next.has(requestId)) next.delete(requestId);
      else next.add(requestId);
      return next;
    });
  };

  const alternarSeleccionarTodas = () => {
    setSeleccionadas((prev) => {
      if (prev.size > 0 && todasSeleccionadas) return new Set();
      return new Set(seleccionablesEnPagina.map((s) => s.addoption_request_id));
    });
  };

  const handleDescartarSeleccionadas = () => {
    if (seleccionadas.size === 0) return;
    setConfirmandoDescarteMasivo(true);
  };

  const confirmarDescartarSeleccionadas = async () => {
    const cantidad = seleccionadas.size;
    setConfirmandoDescarteMasivo(false);
    setProcesando(true);
    try {
      await descartarSolicitudesAdopcion(Array.from(seleccionadas));
      dispatch({ type: "set-success", payload: `${cantidad} ${cantidad === 1 ? "solicitud descartada" : "solicitudes descartadas"}.` });
      refrescarTodo();
    } catch (err) {
      dispatch({ type: "set-error", payload: err.message });
    } finally {
      setProcesando(false);
    }
  };

  const handleDescartarUna = (solicitud) => {
    setSolicitudADescartar(solicitud);
  };

  const confirmarDescartarUna = async () => {
    const solicitud = solicitudADescartar;
    if (!solicitud) return;
    setSolicitudADescartar(null);
    setProcesando(true);
    try {
      await descartarSolicitudesAdopcion([solicitud.addoption_request_id]);
      dispatch({ type: "set-success", payload: "Solicitud descartada." });
      setSolicitudAbierta(null);
      refrescarTodo();
    } catch (err) {
      dispatch({ type: "set-error", payload: err.message });
    } finally {
      setProcesando(false);
    }
  };

  const handleAprobar = (solicitud) => {
    setSolicitudAAprobar(solicitud);
  };

  const confirmarAprobar = async () => {
    const solicitud = solicitudAAprobar;
    if (!solicitud) return;
    setSolicitudAAprobar(null);
    setProcesando(true);
    try {
      await aceptarSolicitudAdopcion(solicitud.addoption_request_id);
      dispatch({ type: "set-success", payload: "Solicitud aprobada. Las demás solicitudes pendientes se han descartado." });
      setSolicitudAbierta(null);
      refrescarTodo();
    } catch (err) {
      dispatch({ type: "set-error", payload: err.message });
    } finally {
      setProcesando(false);
    }
  };

  const hasFilters = Boolean(search || statusFilter);
  const clearFilters = () => {
    setSearchInput("");
    setStatusFilter("");
  };

  if (cargandoProceso) {
    return (
      <div className="container py-5 d-flex justify-content-center">
        <div className="spinner-grow" style={{ color: "var(--rp-verde)" }} role="status">
          <span className="visually-hidden">Cargando…</span>
        </div>
      </div>
    );
  }

  if (errorProceso || !proceso) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{errorProceso || "No se ha podido cargar el proceso"}</div>
        <Link to="/panel/adopciones" className="btn btn-outline-secondary">← Volver a Procesos de adopción</Link>
      </div>
    );
  }

  const estado = ADDOPTION_PROCESS_STATUS_LABELS[proceso.status] || { label: proceso.status, badgeClass: "bg-light text-dark border" };
  const animal = proceso.animal;
  const selectedAnimalType = store.animalTypes.find((t) => t.id === animal?.animal_type_id);
  const puedeEliminarProceso = (proceso.request_count ?? 0) === 0;

  const limiteLabel =
    proceso.concurrent_requests_limit === 1
      ? "Una a la vez"
      : proceso.concurrent_requests_limit == null
        ? "Sin límite"
        : `Hasta ${proceso.concurrent_requests_limit}`;

  return (
    <div className="container py-5">
      <Link to="/panel/adopciones" className="btn btn-outline-secondary rounded-pill mb-4">
        <i className="fa fa-arrow-left text-danger me-1"></i> Volver a Procesos de adopción
      </Link>

      <div className="card shadow-sm rounded-4 mb-4">
        <div className="card-body">






          <div className="d-flex flex-nowrap gap-3 align-items-start">
            <div
              className="flex-shrink-0 rounded-3 overflow-hidden bg-light d-flex align-items-center justify-content-center"
              style={{ width: "72px", height: "72px" }}
            >
              {animal?.cover_image ? (
                <img src={cargarMediaUrl(animal.cover_image)} alt="" className="w-100 h-100" style={{ objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: "1.3rem", opacity: 0.35 }}>🐾</span>
              )}
            </div>

            <div className="flex-grow-1 min-w-0">
              <div className="d-flex align-items-center gap-2 mb-1">
                <h4 className="fw-bold mb-0">{animal?.name || "Animal sin asignar"}</h4>
              </div>
              <p className="text-muted mb-0" style={{ fontSize: "0.875rem" }}>
                {proceso.questions?.length || 0} {proceso.questions?.length === 1 ? "pregunta" : "preguntas"} en el
                formulario de solicitud
              </p>
            </div>

            <div className="dropdown">
              <button
                type="button"
                className="btn btn-outline-secondary d-flex align-items-center justify-content-center"
                style={{ width: "40px", height: "40px" }}
                data-bs-toggle="dropdown"
                aria-expanded="false"
                aria-label="Más acciones del proceso"
              >
                <i className="fa fa-ellipsis-vertical"></i>
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={handleCambiarEstadoProceso}
                    disabled={cambiandoEstadoProceso}
                  >
                    <i className={`fa ${proceso.status === ABIERTO ? "fa-lock" : "fa-lock-open"} me-2`}></i>
                    {cambiandoEstadoProceso ? "Guardando…" : proceso.status === ABIERTO ? "Cerrar proceso" : "Reabrir proceso"}
                  </button>
                </li>
                <li>
                  <button type="button" className="dropdown-item" onClick={() => setModalEditarAbierto(true)}>
                    <i className="fa fa-pencil me-2"></i> Editar
                  </button>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <button
                    type="button"
                    className="dropdown-item text-danger"
                    onClick={() => setConfirmandoEliminarProceso(true)}
                    disabled={!puedeEliminarProceso || eliminandoProceso}
                    title={!puedeEliminarProceso ? "No se puede eliminar: ya tiene solicitudes de adopción" : undefined}
                  >
                    <i className="fa fa-trash me-2"></i> {eliminandoProceso ? "Eliminando…" : "Eliminar"}
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <span className={`badge ${estado.badgeClass} mt-3`}>{estado.label}</span>
          <hr />

          <div className="row g-3">
            <div className="col-6 col-md-3">
              <div className="text-uppercase text-muted" style={{ fontSize: "0.7rem" }}>Solicitudes a la vez</div>
              <div className="fw-semibold" style={{ fontSize: "0.9rem" }}>{limiteLabel}</div>
            </div>
            <div className="col-6 col-md-3">
              <div className="text-uppercase text-muted" style={{ fontSize: "0.7rem" }}>Aportación</div>
              <div className="fw-semibold" style={{ fontSize: "0.9rem" }}>
                {proceso.contribution_amount != null ? `${Number(proceso.contribution_amount).toLocaleString("es-ES")} €` : "—"}
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="text-uppercase text-muted" style={{ fontSize: "0.7rem" }}>Fecha de inicio</div>
              <div className="fw-semibold" style={{ fontSize: "0.9rem" }}>
                {proceso.start_date ? new Date(proceso.start_date).toLocaleDateString("es-ES") : "—"}
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="text-uppercase text-muted" style={{ fontSize: "0.7rem" }}>Fecha límite</div>
              <div className="fw-semibold" style={{ fontSize: "0.9rem" }}>
                {proceso.end_date ? new Date(proceso.end_date).toLocaleDateString("es-ES") : "—"}
              </div>
            </div>
          </div>

          <div className="mt-3">
            <div className="text-uppercase text-muted mb-1" style={{ fontSize: "0.7rem" }}>Requisitos</div>
            {proceso.requirements?.length > 0 ? (
              <div className="d-flex flex-wrap gap-1">
                {proceso.requirements.map((r) => (
                  <span
                    key={r.addoption_process_requirement_id}
                    className="badge bg-light text-dark border"
                    style={{ fontWeight: 400, whiteSpace: "normal", wordBreak: "break-word", textAlign: "left" }}
                  >
                    {r.label}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-muted" style={{ fontSize: "0.9rem" }}>Sin requisitos</span>
            )}
          </div>
        </div>
      </div>

      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-7">
              <input
                type="search"
                className="form-control"
                placeholder="Buscar por nombre o email del solicitante…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <div className="col-8 col-md-3">
              <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                {ADDOPTION_REQUEST_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="col-4 col-md-1 d-grid">
              <button type="button" className="btn btn-outline-secondary" onClick={clearFilters} disabled={!hasFilters}>
                Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">{error}</div>
      )}


      <div className="card shadow-sm rounded-4 overflow-hidden">
        {seleccionablesEnPagina.length !== 0 ? (
        <div className="d-flex flex-wrap align-items-center gap-2 px-2 py-2 border-bottom bg-light">

          <label
            className="d-flex align-items-center justify-content-center flex-shrink-0"
            style={{ width: "2.75rem", height: "2.75rem", margin: "-0.5rem 0", cursor: seleccionablesEnPagina.length === 0 ? "default" : "pointer" }}
          >
            <input
              type="checkbox"
              className="form-check-input"
              style={{ width: "1.2rem", height: "1.2rem", cursor: "inherit" }}
              checked={todasSeleccionadas}
              disabled={seleccionablesEnPagina.length === 0}
              onChange={alternarSeleccionarTodas}
              aria-label="Seleccionar todas las solicitudes pendientes de esta página"
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
                    className="btn btn-danger btn-sm rounded-pill px-3"
                    onClick={handleDescartarSeleccionadas}
                    disabled={procesando}
                >
                  Descartar seleccionadas <i className="fa-solid fa-circle-xmark"></i>
                </button>
              </div>
            </div>
          )}
        </div>
            ):
            <>
            </>
          }

        {cargando ? (
          <div className="text-center text-muted py-5">Cargando solicitudes…</div>
        ) : solicitudes.length === 0 ? (
          <div className="text-center text-muted py-5">
            {hasFilters ? (
              <>
                <p className="mb-2">Ninguna solicitud coincide con estos filtros.</p>
                <button type="button" className="btn btn-link" onClick={clearFilters}>Quitar filtros</button>
              </>
            ) : (
              <p className="mb-0">Todavía no ha llegado ninguna solicitud para este proceso.</p>
            )}
          </div>
        ) : (
          solicitudes.map((solicitud) => (
            <SolicitudAdopcionRow
              key={solicitud.addoption_request_id}
              solicitud={solicitud}
              seleccionada={seleccionadas.has(solicitud.addoption_request_id)}
              onAlternarSeleccion={alternarSeleccion}
              onVer={setSolicitudAbierta}
              onAprobar={handleAprobar}
              procesando={procesando}
              mostrarInput={seleccionablesEnPagina.length !== 0}
            />
          ))
        )}
      </div>

      {totalPages > 1 && (
        <nav className="d-flex justify-content-center mt-4" aria-label="Paginación de solicitudes">
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

      {solicitudAbierta && (
        <SolicitudAdopcionDetalleModal
          solicitud={solicitudAbierta}
          onCerrar={() => setSolicitudAbierta(null)}
          onAprobar={handleAprobar}
          onDescartar={handleDescartarUna}
          procesando={procesando}
        />
      )}

      {solicitudAAprobar && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ backgroundColor: "rgba(18, 33, 28, 0.55)", zIndex: 1090 }}
          onClick={() => setSolicitudAAprobar(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="bg-white rounded-4 shadow p-4"
            style={{ maxWidth: "440px", width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h5 className="fw-bold mb-2">¿Aprobar esta solicitud?</h5>
            <p className="text-muted mb-4" style={{ fontSize: "0.9rem" }}>
              El proceso se cerrará y el resto de solicitudes pendientes se descartarán automáticamente.
            </p>
            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary rounded-pill px-4"
                onClick={() => setSolicitudAAprobar(null)}
                disabled={procesando}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-success rounded-pill px-4"
                onClick={confirmarAprobar}
                disabled={procesando}
              >
                Aprobar <i className="fa fa-check"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmandoDescarteMasivo && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ backgroundColor: "rgba(18, 33, 28, 0.55)", zIndex: 1090 }}
          onClick={() => setConfirmandoDescarteMasivo(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="bg-white rounded-4 shadow p-4"
            style={{ maxWidth: "440px", width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h5 className="fw-bold mb-2">
              ¿Descartar {seleccionadas.size} {seleccionadas.size === 1 ? "solicitud" : "solicitudes"}?
            </h5>
            <p className="text-muted mb-4" style={{ fontSize: "0.9rem" }}>
              No se puede deshacer.
            </p>
            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary px-4 rounded-pill"
                onClick={() => setConfirmandoDescarteMasivo(false)}
                disabled={procesando}
              >
                Cancelar
              </button>
              <button
                  type="button"
                  className="btn btn-danger rounded-pill px-4"
                  onClick={confirmarDescartarSeleccionadas}
                  disabled={procesando}
              >
                Descartar <i className="fa-solid fa-circle-xmark"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      {solicitudADescartar && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ backgroundColor: "rgba(18, 33, 28, 0.55)", zIndex: 1090 }}
          onClick={() => setSolicitudADescartar(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="bg-white rounded-4 shadow p-4"
            style={{ maxWidth: "440px", width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h5 className="fw-bold mb-2">¿Descartar esta solicitud?</h5>
            <p className="text-muted mb-4" style={{ fontSize: "0.9rem" }}>
              No se puede deshacer.
            </p>
            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary px-4"
                onClick={() => setSolicitudADescartar(null)}
                disabled={procesando}
              >
                Cancelar
              </button>
              <button
                  type="button"
                  className="btn btn-danger rounded-pill px-4"
                  onClick={confirmarDescartarUna}
                  disabled={procesando}
              >
                Descartar <i className="fa-solid fa-circle-xmark"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      {modalEditarAbierto && (
        <AbrirProcesoAdopcionModal
          animal={animal}
          procesoExistente={proceso}
          catalogoRequisitos={selectedAnimalType?.requirements || []}
          onCerrar={() => setModalEditarAbierto(false)}
          onProcesoAbierto={() => refrescarTodo()}
          isEditing={true}
        />
      )}

      {confirmandoEliminarProceso && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ backgroundColor: "rgba(18, 33, 28, 0.55)", zIndex: 1090 }}
          onClick={() => setConfirmandoEliminarProceso(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="bg-white rounded-4 shadow p-4"
            style={{ maxWidth: "440px", width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h5 className="fw-bold mb-2">¿Eliminar este proceso de adopción?</h5>
            <p className="text-muted mb-4" style={{ fontSize: "0.9rem" }}>
              No se puede deshacer. Se borrarán su configurarión, los datos del animal se mantienen.
            </p>
            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary rounded-pill px-4"
                onClick={() => setConfirmandoEliminarProceso(false)}
                disabled={eliminandoProceso}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-danger rounded-pill px-4"
                onClick={confirmarEliminarProceso}
                disabled={eliminandoProceso}
              >
                Eliminar <i className="fa fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
