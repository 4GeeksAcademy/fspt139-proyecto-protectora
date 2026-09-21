import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ProtectoraCard } from "../components/protectora/ProtectoraCard";
import { getShelters } from "../services/sheltersService";
import useGlobalReducer from "../hooks/useGlobalReducer";

const PER_PAGE = 12;

const PESTANAS = [
  { key: "todas", label: "Todas" },
  { key: "urgentes", label: "Con necesidades urgentes" },
  { key: "animales", label: "Con animales en adopción" },
];

export const Protectoras = () => {
  const { store } = useGlobalReducer();
  const shelterTypes = store.shelterTypes || [];

  const [pestana, setPestana] = useState("todas");
  const [tipoId, setTipoId] = useState("");
  const [pagina, setPagina] = useState(1);

  const [protectoras, setProtectoras] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setError(null);

    getShelters(
      { ordenarPor: "name", orden: "asc", pagina, perPage: PER_PAGE },
      {
        shelterTypeId: tipoId,
        hasUrgent: pestana === "urgentes",
        hasAnimals: pestana === "animales",
      },
    )
      .then((data) => {
        if (cancelado) return;
        setProtectoras(data.items || []);
        setTotalItems(data.total_items || 0);
        setTotalPaginas(data.total_pages || 1);
      })
      .catch((err) => {
        if (cancelado) return;
        setError(err.message);
        setProtectoras([]);
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => { cancelado = true; };
  }, [pagina, pestana, tipoId]);

  const cambiarPestana = (key) => { setPestana(key); setPagina(1); };
  const cambiarTipo = (id) => { setTipoId(id); setPagina(1); };

  const limpiarFiltros = () => {
    setPestana("todas");
    setTipoId("");
    setPagina(1);
  };

  const sinResultados = !cargando && !error && protectoras.length === 0;
  const textoContador =
    totalItems === 1 ? "1 protectora en toda España" : `${totalItems} protectoras en toda España`;

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: "var(--rp-hueso)" }}>

      <div className="bg-success-subtle py-5">
        <div className="container">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3">
            <div>
              <p className="text-success fw-bold text-uppercase small mb-1">Red de protectoras</p>
              <h2 className="fw-bold mb-1">Protectoras registradas</h2>
              <p className="text-secondary mb-0">
                {cargando ? "Cargando protectoras…" : textoContador}
              </p>
            </div>
            <Link to="/signup" className="btn btn-success rounded-pill px-4 py-2 fw-semibold shadow-sm">
              Registrar mi protectora
            </Link>
          </div>
        </div>
      </div>

      <div className="container py-5 flex-grow-1">

        <div
          className="p-3 p-md-4 mb-4"
          style={{
            backgroundColor: "var(--rp-papel)",
            borderRadius: "var(--bs-border-radius-xl)",
            border: "1px solid var(--rp-linea)",
          }}
        >
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-center gap-3">
            <div className="d-flex flex-nowrap gap-2 overflow-auto pb-1 pb-lg-0">
              {PESTANAS.map((p) => (
                <button
                  key={p.key}
                  className={`btn rounded-pill px-4 text-nowrap ${pestana === p.key ? "btn-primary" : "btn-light"}`}
                  onClick={() => cambiarPestana(p.key)}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <select
              className="form-select form-select-sm rounded-pill"
              style={{ width: "190px" }}
              value={tipoId}
              onChange={(e) => cambiarTipo(e.target.value)}
            >
              <option value="">Cualquier tipo</option>
              {shelterTypes.map((tipo) => (
                <option key={tipo.shelter_type_id} value={tipo.id}>
                  {tipo.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {cargando && (
          <div className="d-flex justify-content-center py-5 my-5">
            <div className="spinner-grow" style={{ color: "var(--rp-verde)" }} role="status">
              <span className="visually-hidden">Cargando…</span>
            </div>
          </div>
        )}

        {sinResultados && (
          <div className="text-center py-5 my-5">
            <h4 style={{ color: "var(--rp-gris)" }}>No hay protectoras que coincidan con los filtros 🐾</h4>
            <button className="btn btn-outline-success rounded-pill mt-3 px-4" onClick={limpiarFiltros}>
              Restablecer filtros
            </button>
          </div>
        )}

        {!cargando && protectoras.length > 0 && (
          <>
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              {protectoras.map((protectora) => (
                <div className="col" key={protectora.shelter_id}>
                  <ProtectoraCard protectora={protectora} />
                </div>
              ))}
            </div>

            {totalPaginas > 1 && (
              <div className="d-flex justify-content-center align-items-center gap-3 mt-5 pt-4">
                <button
                  className="btn btn-outline-success rounded-pill px-4"
                  disabled={pagina <= 1}
                  onClick={() => setPagina((p) => p - 1)}
                >
                  Anterior
                </button>
                <span style={{ color: "var(--rp-gris)" }}>Página {pagina} de {totalPaginas}</span>
                <button
                  className="btn btn-outline-success rounded-pill px-4"
                  disabled={pagina >= totalPaginas}
                  onClick={() => setPagina((p) => p + 1)}
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Protectoras;