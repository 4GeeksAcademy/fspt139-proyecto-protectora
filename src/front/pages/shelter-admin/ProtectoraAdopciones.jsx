import React, { useEffect, useState } from "react";
import { getShelterAddoptionProcesses } from "../../services/addoptionProcessService";
import { AdoptionProcessCard } from "../../components/protectora/AdoptionProcessCard";
import { ADDOPTION_PROCESS_STATUS_OPTIONS } from "../../utils/addoptionProcessStatus";

const PER_PAGE = 8;

export const ProtectoraAdopciones = () => {
  const [procesos, setProcesos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pendingFilter, setPendingFilter] = useState(false);

  // pequeño debounce para no lanzar una petición por cada tecla
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, pendingFilter]);

  useEffect(() => {
    let cancelled = false;

    const fetchProcesos = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getShelterAddoptionProcesses(
          { pagina: page, perPage: PER_PAGE },
          { search, status: statusFilter, hasPending: pendingFilter },
        );
        if (cancelled) return;
        setProcesos(data.items || []);
        setTotalPages(data.total_pages || 1);
        setTotalItems(data.total_items || 0);
      } catch (err) {
        if (cancelled) return;
        setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProcesos();

    return () => {
      cancelled = true;
    };
  }, [page, search, statusFilter, pendingFilter]);

  const hasFilters = Boolean(search || statusFilter || pendingFilter);
  const clearFilters = () => {
    setSearchInput("");
    setStatusFilter("");
    setPendingFilter(false);
  };

  return (
    <div className="container py-5">
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Procesos de adopción</h2>
          <p className="text-muted mb-0">
            {loading ? "Cargando…" : `${totalItems} ${totalItems === 1 ? "proceso" : "procesos"} de adopción`}
          </p>
        </div>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-6 order-1 order-md-1">
              <input
                type="search"
                className="form-control"
                placeholder="Buscar por nombre de animal…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <div className="col-12 col-md-6 order-2 order-md-4 d-flex align-items-center">
              <div className="form-check form-switch">
                <input
                  type="checkbox"
                  className="form-check-input"
                  role="switch"
                  id="pendingFilter"
                  checked={pendingFilter}
                  onChange={(e) => setPendingFilter(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="pendingFilter">
                  Con solicitudes pendientes
                </label>
              </div>
            </div>
            <div className="col-12 col-md-4 order-3 order-md-2">
              <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                {ADDOPTION_PROCESS_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-2 order-4 order-md-3 d-grid">
              <button type="button" className="btn btn-outline-secondary" onClick={clearFilters} disabled={!hasFilters}>
                Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center text-muted py-5">Cargando procesos de adopción…</div>
      ) : procesos.length === 0 ? (
        <div className="text-center text-muted py-5 border rounded-4 bg-light">
          {hasFilters ? (
            <>
              <p className="mb-2">Ningún proceso coincide con estos filtros.</p>
              <button type="button" className="btn btn-link" onClick={clearFilters}>
                Quitar filtros
              </button>
            </>
          ) : (
            <p className="mb-0">
              Todavía no has abierto ningún proceso de adopción. Ábrelo desde la ficha de un animal.
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="d-flex flex-column gap-3">
            {procesos.map((proceso) => (
              <AdoptionProcessCard key={proceso.addoption_process_id} proceso={proceso} />
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="d-flex justify-content-center mt-4" aria-label="Paginación de procesos de adopción">
              <ul className="pagination mb-0">
                <li className={`page-item ${page <= 1 ? "disabled" : ""}`}>
                  <button type="button" className="page-link" onClick={() => setPage((p) => Math.max(1, p - 1))}>
                    Anterior
                  </button>
                </li>
                <li className="page-item disabled">
                  <span className="page-link">
                    Página {page} de {totalPages}
                  </span>
                </li>
                <li className={`page-item ${page >= totalPages ? "disabled" : ""}`}>
                  <button
                    type="button"
                    className="page-link"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Siguiente
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}
    </div>
  );
};
