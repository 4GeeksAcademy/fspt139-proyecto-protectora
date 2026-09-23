import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getShelterNecesidades } from "../../services/requestsService";
import { getShelterAnimals } from "../../services/animalsService";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { ShelterNecesidadCard } from "../../components/protectora/ShelterNecesidadCard";
import { usePageTitle } from "../../hooks/usePageTitle";


//TODO: llevar al store (ver si necesitamos mñas estados antes)
const STATUS_OPTIONS = [
  { value: "", label: "Todos los estados" },
  { value: "abierta", label: "Abierta" },
  { value: "borrador", label: "Borrador" },
  { value: "cerrada", label: "Cerrada" },
];

const PER_PAGE = 8;

export const ProtectoraNecesidades = () => {
  const { store } = useGlobalReducer();
  const requestTypes = store.requestTypes;

  const [necesidades, setNecesidades] = useState([]);
  const [shelterAnimals, setShelterAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [tipoFilter, setTipoFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  usePageTitle("Panel · Necesidades");

  // pequeño debounce para no lanzar una petición por cada tecla
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [search, tipoFilter, statusFilter]);

  // animales de la protectora, para mostrar el nombre del animal vinculado en cada tarjeta
  useEffect(() => {
    getShelterAnimals({ ordenarPor: "name", orden: "asc", pagina: 1, perPage: 100 })
      .then((data) => setShelterAnimals(data.items || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchNecesidades = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getShelterNecesidades(
          { ordenarPor: "request_deadline", orden: "asc", pagina: page, perPage: PER_PAGE },
          { nombre: search, request_type_id: tipoFilter, status: statusFilter },
        );
        if (cancelled) return;
        setNecesidades(data.items || []);
        setTotalPages(data.total_pages || 1);
        setTotalItems(data.total_items || 0);
      } catch (err) {
        if (cancelled) return;
        setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchNecesidades();

    return () => {
      cancelled = true;
    };
  }, [page, search, tipoFilter, statusFilter]);

  const requestTypeNameById = new Map(requestTypes.map((type) => [type.id, type.name]));
  const animalNameById = new Map(shelterAnimals.map((animal) => [animal.id, animal.name]));

  const hasFilters = Boolean(search || tipoFilter || statusFilter);
  const clearFilters = () => {
    setSearchInput("");
    setTipoFilter("");
    setStatusFilter("");
  };

  return (
    <div className="container py-5">
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Necesidades</h2>
          <p className="text-muted mb-0">
            {loading ? "Cargando…" : `${totalItems} ${totalItems === 1 ? "necesidad publicada" : "necesidades publicadas"}`}
          </p>
        </div>
        <Link to="/panel/necesidades/create" className="btn btn-success rounded-pill px-4">
          Publicar necesidad
        </Link>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-5">
              <input
                type="search"
                className="form-control"
                placeholder="Buscar necesidad…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <div className="col-6 col-md-3">
              <select className="form-select" value={tipoFilter} onChange={(e) => setTipoFilter(e.target.value)}>
                <option value="">Todos los tipos</option>
                {requestTypes.map((type) => (
                  <option key={type.request_type_id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-6 col-md-3">
              <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-1 d-grid">
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
        <div className="text-center text-muted py-5">Cargando necesidades…</div>
      ) : necesidades.length === 0 ? (
        <div className="text-center text-muted py-5 border rounded-4 bg-light">
          {hasFilters ? (
            <>
              <p className="mb-2">Ninguna necesidad coincide con estos filtros.</p>
              <button type="button" className="btn btn-link" onClick={clearFilters}>
                Quitar filtros
              </button>
            </>
          ) : (
            <>
              <p className="mb-2">Todavía no has publicado ninguna necesidad.</p>
              <Link to="/panel/necesidades/create" className="btn btn-success rounded-pill px-4">
                Publica tu primera necesidad
              </Link>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="d-flex flex-column gap-3">
            {necesidades.map((necesidad) => (
              <ShelterNecesidadCard
                key={necesidad.request_id}
                necesidad={necesidad}
                requestTypeName={requestTypeNameById.get(necesidad.request_type_id)}
                animalName={animalNameById.get(necesidad.animal_id)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="d-flex justify-content-center mt-4" aria-label="Paginación de necesidades">
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
