import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getShelterAnimals } from "../../services/animalsService";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { ShelterAnimalCard } from "../../components/protectora/ShelterAnimalCard";
import { ANIMAL_STATUS_OPTIONS } from "../../utils/format";
import { usePageTitle } from "../../hooks/usePageTitle";

const PER_PAGE = 8;

export const ProtectoraAnimales = () => {
  const { store } = useGlobalReducer();
  const animalTypes = store.animalTypes;

  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  usePageTitle("Panel · Animales");

  // pequeño debounce para no lanzar una petición por cada tecla
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [search, speciesFilter, statusFilter]);

  useEffect(() => {
    let cancelled = false;

    const fetchAnimals = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getShelterAnimals(
          { pagina: page, perPage: PER_PAGE },
          { nombre: search, animal_type_id: speciesFilter, status: statusFilter },
        );
        if (cancelled) return;
        setAnimals(data.items || []);
        setTotalPages(data.total_pages || 1);
        setTotalItems(data.total_items || 0);
      } catch (err) {
        if (cancelled) return;
        setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAnimals();

    return () => {
      cancelled = true;
    };
  }, [page, search, speciesFilter, statusFilter]);

  const speciesById = new Map(animalTypes.map((type) => [type.id, type.species]));

  const hasFilters = Boolean(search || speciesFilter || statusFilter);
  const clearFilters = () => {
    setSearchInput("");
    setSpeciesFilter("");
    setStatusFilter("");
  };

  return (
    <div className="container py-5">
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Mis animales</h2>
          <p className="text-muted mb-0">
            {loading ? "Cargando…" : `${totalItems} ${totalItems === 1 ? "animal" : "animales"} publicados`}
          </p>
        </div>
        <Link to="/panel/animales/create" className="btn btn-success rounded-pill px-4">
          Publicar animal
        </Link>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-5">
              <input
                type="search"
                className="form-control"
                placeholder="Buscar por nombre…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <div className="col-6 col-md-3">
              <select
                className="form-select"
                value={speciesFilter}
                onChange={(e) => setSpeciesFilter(e.target.value)}
              >
                <option value="">Todas las especies</option>
                {animalTypes.map((type) => (
                  <option key={type.animal_type_id} value={type.id}>
                    {type.species}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-6 col-md-3">
              <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                {ANIMAL_STATUS_OPTIONS.map((opt) => (
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
        <div className="text-center text-muted py-5">Cargando animales…</div>
      ) : animals.length === 0 ? (
        <div className="text-center text-muted py-5 border rounded-4 bg-light">
          {hasFilters ? (
            <>
              <p className="mb-2">Ningún animal coincide con estos filtros.</p>
              <button type="button" className="btn btn-link" onClick={clearFilters}>
                Quitar filtros
              </button>
            </>
          ) : (
            <>
              <p className="mb-2">Todavía no has publicado ningún animal.</p>
              <Link to="/panel/animales/create" className="btn btn-success rounded-pill px-4">
                Publica tu primer animal
              </Link>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="row g-3">
            {animals.map((animal) => (
              <div className="col-12 col-sm-6 col-lg-3" key={animal.animal_id}>
                <ShelterAnimalCard animal={animal} />
              </div>
            ))}
          </div>


          {totalPages > 1 && (
            <nav className="d-flex justify-content-center mt-4" aria-label="Paginación de animales">
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
