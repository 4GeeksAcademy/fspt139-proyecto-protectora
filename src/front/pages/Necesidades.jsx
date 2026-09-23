import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams} from "react-router-dom";
import { NecesidadCard } from "../components/NecesidadCard";
import { Mapa } from "../components/Mapa";
import { getRequests } from "../services/requestsService";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { getShelters } from "../services/sheltersService";

const PER_PAGE = 12;

// Cambia esta ruta si "Colaborar" utiliza una diferente.
const rutaNecesidad = (id) => `/necesidades/${encodeURIComponent(id)}`;

const posicionValida = (valor) => {
  if (typeof valor !== "string") return false;
  const partes = valor.split(",").map((parte) => parte.trim());
  if (partes.length !== 2 || partes.some((parte) => parte === "")) return false;
  const [lat, lng] = partes.map(Number);
  return Number.isFinite(lat) && Number.isFinite(lng)
    && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
};

export const Necesidades = () => {
  const { store } = useGlobalReducer();
  const requestTypes = store.requestTypes || [];
  const shelterTypes = store.shelterTypes || [];
  const esProtectora = store.user?.rol === "shelter_admin";

  const [searchParams, setSearchParams] = useSearchParams();
  const categoria = searchParams.get("categoria") || "";
  const tipoId = searchParams.get("tipo") || "";
  const busquedaAplicada = searchParams.get("q") || "";
  const pagina = Number(searchParams.get("pagina")) || 1

  const [busqueda, setBusqueda] = useState(busquedaAplicada);
  const [necesidades, setNecesidades] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [shelters, setShelters] = useState([]);

  useEffect(() => {
    let cancelado = false;

    getShelters({ ordenarPor: "name", orden: "asc", pagina: 1, perPage: 100 })
      .then((data) => {
        if (!cancelado) setShelters(data.items || []);
      })
      .catch(() => {
        if (!cancelado) setShelters([]);
      });


    return () => { cancelado = true; };
  }, []);

  const actualizarUrl = (cambios) => {
    const params = new URLSearchParams(searchParams);
    if (!("pagina" in cambios)) params.delete("pagina");
    Object.entries(cambios).forEach(([clave, valor]) => (valor ? params.set(clave, valor) : params.delete(clave)));
    setSearchParams(params, { replace: true });
  };

  useEffect(() => {
    // al volver atras el buscador ya coincide con la URL: sin esta guarda nos devolveria a la pagina 1
    if (busqueda === busquedaAplicada) return;

    const temporizador = setTimeout(() => actualizarUrl({ q: busqueda }), 400);

    return () => clearTimeout(temporizador);
  }, [busqueda]);

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setError(null);

    getRequests(
      { pagina, perPage: PER_PAGE },
      { nombre: busquedaAplicada, requestTypeId: categoria, tipoShelter: tipoId, status: "abierta"},
    )
      .then((data) => {
        if (cancelado) return;
        setNecesidades(data.items || []);
        setTotalItems(data.total_items || 0);
        setTotalPaginas(data.total_pages || 1);
      })
      .catch((err) => {
        if (cancelado) return;
        setError(err?.message || "No se pudieron cargar las necesidades.");
        setNecesidades([]);
        setTotalItems(0);
        setTotalPaginas(1);
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => { cancelado = true; };
  }, [pagina, categoria, tipoId, busquedaAplicada]);

  const necesidadesMapa = useMemo(() => {
    if (cargando || error) return [];

    return necesidades.flatMap((necesidad) => {
      const idProtectora = necesidad.shelter_id
        ?? necesidad.shelter?.id
        ?? necesidad.shelter?.shelter_id;

      const protectora = idProtectora == null ? undefined : shelters.find(
        (shelter) => String(shelter.id ?? shelter.shelter_id) === String(idProtectora),
      );

      const posicion = [
        necesidad.map_positioning,
        necesidad.shelter?.map_positioning,
        protectora?.map_positioning,
      ].find(posicionValida);

      if (!posicion) return [];

      return [{
        ...necesidad,
        map_positioning: posicion.split(",").map(Number).join(","),
        nombreProtectoraMapa: necesidad.shelter_name
          || necesidad.shelter?.name
          || protectora?.name
          || "",
      }];
    });
  }, [necesidades, shelters, cargando, error]);

  const cambiarCategoria = (id) => actualizarUrl({ categoria: id });
  const cambiarTipo = (id) => actualizarUrl({ tipo: id });

  const limpiarFiltros = () => {
    setBusqueda("");
    setSearchParams({}, { replace: true });
  };

  const sinResultados = !cargando && !error && necesidades.length === 0;

  const antetitulo = esProtectora ? "Toda la red" : "Tablón público";

  const titulo = esProtectora ? "Necesidades de toda la red" : "Necesidades abiertas";

  const textoContador = esProtectora
    ? `${totalItems} necesidades abiertas en toda la red, incluidas las vuestras`
    : `${totalItems} necesidades esperando ayuda`;

  return (
    <div style={{ backgroundColor: "var(--rp-hueso)" }}>
      <div className="bg-success-subtle py-5">
        <div className="container">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3">
            <div>
              <p className="text-success fw-bold text-uppercase small mb-1">{antetitulo}</p>
              <h2 className="fw-bold mb-1">{titulo}</h2>
              <p className="text-secondary mb-0">
                {cargando ? "Cargando necesidades…" : textoContador}
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

      <div className="container mt-4">
        <Mapa
          datos={necesidadesMapa}
          altura={260}
          popupMaxWidth={360}
          renderPopup={(grupo) => (
            <div style={{ width: "300px", maxWidth: "calc(100vw - 90px)", maxHeight: "320px", overflowY: "auto" }}>
              {grupo.map((necesidad) => {
                const id = necesidad.request_id ?? necesidad.id;
                const nombre = necesidad.name || necesidad.title || "Necesidad";
                const imagen = necesidad.cover_image || necesidad.image_url
                  || necesidad.animal?.cover_image;
                const tieneId = id !== null && id !== undefined;
                const Fila = tieneId ? Link : "div";

                return (
                  <Fila
                    key={id ?? nombre}
                    {...(tieneId ? { to: rutaNecesidad(id) } : {})}
                    className="d-flex align-items-center justify-content-between text-decoration-none"
                    style={{ gap: "22px", padding: "12px 4px", color: "var(--rp-verde, #203b2f)" }}
                  >
                    <div style={{ flex: 1, minWidth: 0, overflowWrap: "anywhere" }}>
                      <div className="fw-bold mb-1" style={{ fontSize: "15px" }}>
                        {nombre}
                      </div>
                      <div className="text-secondary" style={{ fontSize: "13px" }}>
                        {necesidad.nombreProtectoraMapa}
                      </div>
                      {tieneId && (
                        <div className="mt-1 fw-semibold" style={{ fontSize: "12px" }}>
                          Ver necesidad →
                        </div>
                      )}
                    </div>

                    <span
                      aria-hidden="true"
                      className="d-flex align-items-center justify-content-center rounded-circle"
                      style={{
                        position: "relative", width: "64px", height: "64px",
                        flexShrink: 0, overflow: "hidden",
                        backgroundColor: "#e2eee6", fontSize: "22px", fontWeight: 700,
                      }}
                    >
                      {nombre.charAt(0).toUpperCase()}
                      {imagen && (
                        <img
                          key={imagen}
                          src={imagen}
                          alt=""
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      )}
                    </span>
                  </Fila>
                );
              })}
            </div>
          )}
        />
        {!cargando && !error && necesidades.length > 0 && (
          <p className="text-secondary small mt-2 mb-0">
            El mapa muestra las necesidades de esta página con ubicación disponible.
          </p>
        )}
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
            <div className="d-flex flex-nowrap gap-2 overflow-auto pb-1" style={{ minWidth: 0 }}>
              <button
                className={`btn rounded-pill px-4 text-nowrap ${categoria === "" ? "btn-primary" : "btn-light"}`}
                onClick={() => cambiarCategoria("")}
              >
                Todas
              </button>
              {requestTypes.map((tipo) => {
                const id = String(tipo.id ?? tipo.request_type_id);
                return (
                  <button
                    key={id}
                    className={`btn rounded-pill px-4 text-nowrap ${categoria === id ? "btn-primary" : "btn-light"}`}
                    onClick={() => cambiarCategoria(id)}
                  >
                    {tipo.name}
                  </button>
                );
              })}
            </div>

            <div className="d-flex flex-wrap flex-sm-nowrap gap-2">
  <select
    aria-label="Filtrar por tipo de protectora"
    className="form-select form-select-sm rounded-pill"
    style={{ width: "190px", maxWidth: "100%" }}
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
                aria-label="Buscar necesidad"
                className="form-control form-control-sm rounded-pill"
                style={{ width: "200px", maxWidth: "100%" }}
                placeholder="Buscar necesidad…"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>
        </div>

        {error && <div className="alert alert-danger" role="alert">{error}</div>}

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

        {!cargando && !error && necesidades.length > 0 && (
          <>
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              {necesidades.map((necesidad) => (
                <div className="col" key={necesidad.request_id ?? necesidad.id}>
                  <NecesidadCard necesidad={necesidad} />
                </div>
              ))}
            </div>

            {totalPaginas > 1 && (
              <div className="d-flex flex-wrap justify-content-center align-items-center gap-3 mt-5 pt-4">
                <button
                  className="btn btn-outline-primary rounded-pill px-4"
                  disabled={pagina <= 1}
                  onClick={() => actualizarUrl({ pagina: pagina - 1 })}
                >
                  Anterior
                </button>
                <span style={{ color: "var(--rp-gris)" }}>Página {pagina} de {totalPaginas}</span>
                <button
                  className="btn btn-outline-primary rounded-pill px-4"
                  disabled={pagina >= totalPaginas}
                  onClick={() => actualizarUrl({ pagina: pagina + 1 })}
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