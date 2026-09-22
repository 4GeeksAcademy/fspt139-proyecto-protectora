import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { NecesidadCard } from "../components/NecesidadCard";
import { getRequests } from "../services/requestsService";
import useGlobalReducer from "../hooks/useGlobalReducer";

const PER_PAGE = 12;

export const Necesidades = () => {
  const { store } = useGlobalReducer();
  const requestTypes = store.requestTypes || [];
  const shelterTypes = store.shelterTypes || [];
  const esProtectora = store.user?.rol === "shelter_admin";

  const [categoria, setCategoria] = useState("");
  const [tipoId, setTipoId] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);

  const [necesidades, setNecesidades] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);


  // espera a que el usuario deje de teclear antes de llamar a la API
  const [busquedaAplicada, setBusquedaAplicada] = useState("");

  useEffect(() => {
    const temporizador = setTimeout(() => {
      setBusquedaAplicada(busqueda);
      setPagina(1);
    }, 400);

    return () => clearTimeout(temporizador);
  }, [busqueda]);

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setError(null);

    getRequests(
      { pagina, perPage: PER_PAGE },
      { nombre: busquedaAplicada, requestTypeId: categoria, tipoShelter: tipoId },
    )
      .then((data) => {
        if (cancelado) return;
        setNecesidades(data.items || []);
        setTotalItems(data.total_items || 0);
        setTotalPaginas(data.total_pages || 1);
      })
      .catch((err) => {
        if (cancelado) return;
        setError(err.message);
        setNecesidades([]);
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => { cancelado = true; };
  }, [pagina, categoria, tipoId, busquedaAplicada]);

  const cambiarCategoria = (id) => { setCategoria(id); setPagina(1); };
  const cambiarTipo = (id) => { setTipoId(id); setPagina(1); };

  const limpiarFiltros = () => {
    setCategoria("");
    setTipoId("");
    setBusqueda("");
    setPagina(1);
  };

  const sinResultados = !cargando && !error && necesidades.length === 0;

  return (
    <div style={{ backgroundColor: "var(--rp-hueso)" }}>
      <div className="bg-success-subtle py-5">
        <div className="container">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3">
            <div>
              <p className="text-success fw-bold text-uppercase small mb-1">Tablón público</p>
              <h2 className="fw-bold mb-1">Necesidades abiertas</h2>
              <p className="text-secondary mb-0">
                {cargando ? "Cargando necesidades…" : `${totalItems} necesidades esperando ayuda`}
              </p>
            </div>

            {esProtectora && (
              <Link
                to="/panel/necesidades"
                className="btn btn-success rounded-pill px-4 py-2 fw-semibold shadow-sm"
              >
                Ver mis necesidades
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="container py-5">
        <div
          className="p-3 p-md-4 mb-4"
          style={{
            backgroundColor: "var(--rp-papel)",
            borderRadius: "var(--bs-border-radius-xl)",
            border: "1px solid var(--rp-linea)",
          }}
        >
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
            <div className="d-flex flex-nowrap gap-2 overflow-auto pb-1">
              <button
                className={`btn rounded-pill px-4 text-nowrap ${categoria === "" ? "btn-primary" : "btn-light"}`}
                onClick={() => cambiarCategoria("")}
              >
                Todas
              </button>
              {requestTypes.map((tipo) => (
                <button
                  key={tipo.request_type_id}
                  className={`btn rounded-pill px-4 text-nowrap ${categoria === String(tipo.id) ? "btn-primary" : "btn-light"}`}
                  onClick={() => cambiarCategoria(String(tipo.id))}
                >
                  {tipo.name}
                </button>
              ))}
            </div>

            <div className="d-flex flex-nowrap gap-2">
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

              <input
                type="search"
                className="form-control form-control-sm rounded-pill"
                style={{ width: "200px" }}
                placeholder="Buscar necesidad…"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
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
            <h4 style={{ color: "var(--rp-gris)" }}>No hay necesidades con estos filtros 🐾</h4>
            <button className="btn btn-outline-primary rounded-pill mt-3 px-4" onClick={limpiarFiltros}>
              Restablecer filtros
            </button>
          </div>
        )}

        {!cargando && necesidades.length > 0 && (
          <>
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              {necesidades.map((necesidad) => (
                <div className="col" key={necesidad.request_id}>
                  <NecesidadCard necesidad={necesidad} />
                </div>
              ))}
            </div>

            {totalPaginas > 1 && (
              <div className="d-flex justify-content-center align-items-center gap-3 mt-5 pt-4">
                <button
                  className="btn btn-outline-primary rounded-pill px-4"
                  disabled={pagina <= 1}
                  onClick={() => setPagina((p) => p - 1)}
                >
                  Anterior
                </button>
                <span style={{ color: "var(--rp-gris)" }}>Página {pagina} de {totalPaginas}</span>
                <button
                  className="btn btn-outline-primary rounded-pill px-4"
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

export default Necesidades;