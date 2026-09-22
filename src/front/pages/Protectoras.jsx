import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Mapa } from "../components/Mapa";
import { ProtectoraCard } from "../components/protectora/ProtectoraCard";
import { getShelters, getShelterProfile } from "../services/sheltersService";
import { getAnimals, cargarMediaUrl } from "../services/animalsService";
import useGlobalReducer from "../hooks/useGlobalReducer";

const PER_PAGE = 12;

const PESTANAS = [
  { key: "todas", label: "Todas" },
  { key: "urgentes", label: "Con necesidades urgentes" },
  { key: "animales", label: "Con animales en adopción" },
];

const PopupProtectora = ({ protectora }) => {
  const [animales, setAnimales] = useState([]);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelado = false;

    setCargando(true);
    setError(null);

    getAnimals(
      { pagina: 1, perPage: 6 },
      { shelterId: protectora.id }
    )
      .then((data) => {
        if (cancelado) return;

        setAnimales(data.items || []);
        setTotal(data.total_items || 0);
      })
      .catch(() => {
        if (cancelado) return;

        setError("No se han podido cargar los animales.");
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [protectora.id]);

  return (
    <div className="text-start">
      {cargando && (
        <div className="small text-secondary mb-2">
          Cargando animales…
        </div>
      )}

      {error && (
        <div className="small text-danger mb-2">
          {error}
        </div>
      )}

      {!cargando && !error && (
        <>
          {animales.map((animal) => (
            <Link
              key={animal.animal_id}
              to={`/adoptar/${animal.animal_id}`}
              className="d-flex align-items-center gap-3 text-decoration-none text-reset border-bottom pb-1 mb-1"
            >
              {/* Nombre del animal */}
              <strong
                className="text-dark text-truncate"
                style={{
                  width: "65%",
                  minWidth: 0,
                }}
                title={animal.name}
              >
                {animal.name}
              </strong>

              {/* Avatar alineado a la derecha */}
              {animal.cover_image ? (
                <img
                  src={cargarMediaUrl(animal.cover_image)}
                  alt={animal.name}
                  className="rounded-circle object-fit-cover flex-shrink-0"
                  style={{ width: "36px", height: "36px" }}
                />
              ) : (
                <div
                  className="rounded-circle bg-success-subtle d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: "36px", height: "36px" }}
                >
                  <i className="fa-solid fa-paw"></i>
                </div>
              )}
            </Link>
          ))}

          {animales.length === 0 && (
            <div className="small text-secondary mb-2">
              Sin animales publicados.
            </div>
          )}

          {total > animales.length && (
            <div className="small text-secondary mt-2 mb-2">
              Mostrando {animales.length} de {total} animales.
            </div>
          )}
        </>
      )}

      {protectora.website ? (
        <a
          href={protectora.website}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-success btn-sm w-100 text-white mt-2"
        >
          Ver protectora
        </a>
      ) : (
        <div className="small text-secondary mt-2">
          Esta protectora no tiene web.
        </div>
      )}
    </div>
  );
};

export const Protectoras = () => {
  const { store } = useGlobalReducer();
  const shelterTypes = store.shelterTypes || [];

  const esProtectora = store.user?.rol === "shelter_admin";
  const [miShelterUuid, setMiShelterUuid] = useState(null);

  useEffect(() => {
    if (!esProtectora) return;

    getShelterProfile()
      .then((datos) => setMiShelterUuid(datos.shelter_id))
      .catch(() => setMiShelterUuid(null));
  }, [esProtectora]);

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
      }
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

    return () => {
      cancelado = true;
    };
  }, [pagina, pestana, tipoId]);

  const cambiarPestana = (key) => {
    setPestana(key);
    setPagina(1);
  };

  const cambiarTipo = (id) => {
    setTipoId(id);
    setPagina(1);
  };

  const limpiarFiltros = () => {
    setPestana("todas");
    setTipoId("");
    setPagina(1);
  };

  const sinResultados =
    !cargando && !error && protectoras.length === 0;

  const textoContador = esProtectora
  ? `${totalItems} protectoras registradas, incluida la vuestra`
  : totalItems === 1
    ? "1 protectora en toda España"
    : `${totalItems} protectoras en toda España`;

  return (
    <div
      className="d-flex flex-column min-vh-100"
      style={{ backgroundColor: "var(--rp-hueso)" }}
    >
      {/* Cabecera */}
      <div className="bg-success-subtle py-5">
        <div className="container">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3">
            <div>
              <p className="text-success fw-bold text-uppercase small mb-1">
                Red de protectoras
              </p>

              <h2 className="fw-bold mb-1">
                Protectoras registradas
              </h2>

              <p className="text-secondary mb-0">
                {cargando ? "Cargando protectoras…" : textoContador}
              </p>
            </div>

            {!store.user && (
              <Link
                to="/signup"
                className="btn btn-success rounded-pill px-4 py-2 fw-semibold shadow-sm"
              >
                Registrar mi protectora
              </Link>
            )}

            {esProtectora && miShelterUuid && (
              <Link
                to={`/protectoras/${miShelterUuid}`}
                className="btn btn-success rounded-pill px-4 py-2 fw-semibold shadow-sm"
              >
                Ver mi perfil publico
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mapa con la misma altura que en Adoptar */}
      <div className="container mt-4">
        <Mapa
          datos={cargando || error ? [] : protectoras}
          popupMaxWidth={560}
          altura={260}
          renderPopup={(grupo) => (
            <div
              className="d-flex flex-wrap gap-3"
              style={{
                width:
                  grupo.length > 1
                    ? "min(520px, calc(100vw - 80px))"
                    : "240px",
                maxWidth: "100%",
              }}
            >
              {grupo.map((protectora) => (
                <div
                  key={protectora.shelter_id}
                  className="border rounded-3 p-2"
                  style={{
                    flex: "1 1 220px",
                    minWidth: 0,
                  }}
                >
                  <div className="fw-bold text-success text-break border-bottom pb-2 mb-2">
                    {protectora.name}
                  </div>

                  <PopupProtectora protectora={protectora} />
                </div>
              ))}
            </div>
          )}
        />
      </div>

      <div className="container py-5 flex-grow-1">
        {/* Filtros */}
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
                  className={`btn rounded-pill px-4 text-nowrap ${pestana === p.key ? "btn-primary" : "btn-light"
                    }`}
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

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {cargando && (
          <div className="d-flex justify-content-center py-5 my-5">
            <div
              className="spinner-grow"
              style={{ color: "var(--rp-verde)" }}
              role="status"
            >
              <span className="visually-hidden">Cargando…</span>
            </div>
          </div>
        )}

        {sinResultados && (
          <div className="text-center py-5 my-5">
            <h4 style={{ color: "var(--rp-gris)" }}>
              No hay protectoras que coincidan con los filtros 🐾
            </h4>

            <button
              className="btn btn-outline-success rounded-pill mt-3 px-4"
              onClick={limpiarFiltros}
            >
              Restablecer filtros
            </button>
          </div>
        )}

        {!cargando && protectoras.length > 0 && (
          <>
            {/* Tarjetas */}
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              {protectoras.map((protectora) => (
                <div className="col" key={protectora.shelter_id}>
                  <ProtectoraCard
                    protectora={protectora}
                    esMiProtectora={esProtectora && protectora.id === store.user?.shelter_id}
                  />
                </div>
              ))}
            </div>

            {/* Paginacion */}
            {totalPaginas > 1 && (
              <div className="d-flex justify-content-center align-items-center gap-3 mt-5 pt-4">
                <button
                  className="btn btn-outline-success rounded-pill px-4"
                  disabled={pagina <= 1}
                  onClick={() => setPagina((p) => p - 1)}
                >
                  Anterior
                </button>

                <span style={{ color: "var(--rp-gris)" }}>
                  Página {pagina} de {totalPaginas}
                </span>

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