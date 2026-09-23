import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Mapa } from "../components/Mapa";
import { AnimalCard } from "../components/AnimalCard";
import { getAnimals } from "../services/animalsService";
import useGlobalReducer from "../hooks/useGlobalReducer";
 
const PER_PAGE = 12;
 
const PESTANAS = [
  { key: "todos", label: "Todos" },
  { key: "perros", label: "Perros" },
  { key: "gatos", label: "Gatos" },
  { key: "otros", label: "Otros" },
];
 
const EDADES = [
  { value: "", label: "Cualquier edad" },
  { value: "cachorro", label: "Cachorro" },
  { value: "adulto", label: "Adulto" },
  { value: "senior", label: "Senior" },
];
 
export const Adoptar = () => {
  const { store } = useGlobalReducer();
  const animalTypes = store.animalTypes;
  const shelterTypes = store.shelterTypes || [];
  const esProtectora = store.user?.rol === "shelter_admin";
 
 
  // pagina y filtros viven en la URL (?pagina=2&especie=gatos...): al volver atras el navegador recupera
  // esa URL y el listado sale tal como lo dejaste
  const [searchParams, setSearchParams] = useSearchParams();
  const especie = searchParams.get("especie") || "todos";
  const edad = searchParams.get("edad") || "";
  const tipoId = searchParams.get("tipo") || "";
  const pagina = Number(searchParams.get("pagina")) || 1;
 
  // cambia uno o varios parametros de la URL (vacio = se quita); cualquier cambio de filtro vuelve a
  // la pagina 1. replace: no deja una entrada en el historial por cada filtro o pagina
  const actualizarUrl = (cambios) => {
    const params = new URLSearchParams(searchParams);
    if (!("pagina" in cambios)) params.delete("pagina");
    Object.entries(cambios).forEach(([clave, valor]) => (valor ? params.set(clave, valor) : params.delete(clave)));
    setSearchParams(params, { replace: true });
  };
 
 
  const [animales, setAnimales] = useState([]);
  const [totalAnimales, setTotalAnimales] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
 
 
 
 
  const animalTypeIds = useMemo(() => {
    if (especie === "todos") return undefined;
 
    const esPerroOGato = (type) =>
      ["perro", "gato"].includes(type.species?.toLowerCase());
 
    if (especie === "otros") {
      return animalTypes
        .filter((type) => !esPerroOGato(type))
        .map((type) => type.id);
    }
 
    const buscada = especie === "perros" ? "perro" : "gato";
 
    return animalTypes
      .filter((type) => type.species?.toLowerCase() === buscada)
      .map((type) => type.id);
  }, [especie, animalTypes]);
 
  const esperandoCatalogo =
    especie !== "todos" && animalTypes.length === 0;
 
 
  useEffect(() => {
    if (esperandoCatalogo) return;
 
    let cancelado = false;
    setCargando(true);
    setError(null);
 
    getAnimals(
      { pagina, perPage: PER_PAGE },
      { animalTypeIds, shelterTypeId: tipoId, edad }
    )
      .then((data) => {
        if (cancelado) return;
 
        setAnimales(data.items || []);
        setTotalAnimales(data.total_items || 0);
        setTotalPaginas(data.total_pages || 1);
      })
      .catch((err) => {
        if (cancelado) return;
 
        setError(err.message);
        setAnimales([]);
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });
 
    return () => {
      cancelado = true;
    };
  }, [pagina, edad, tipoId, animalTypeIds, esperandoCatalogo]);
 
  // "todos" es el valor por defecto: no hace falta llevarlo en la URL
  const cambiarEspecie = (key) => actualizarUrl({ especie: key === "todos" ? "" : key });
  const cambiarEdad = (value) => actualizarUrl({ edad: value });
  const cambiarTipo = (value) => actualizarUrl({ tipo: value });
  const limpiarFiltros = () => setSearchParams({}, { replace: true });
 
  const sinResultados =
    !cargando && !error && animales.length === 0;
 
  const antetitulo = esProtectora ? "Toda la red" : "Adopciones";
 
  const titulo = esProtectora ? "Animales de toda la red" : "Buscan casa";
 
  const textoContador = esProtectora
    ? `${totalAnimales} animales publicados por todas las protectoras, incluidos los vuestros`
    : `${totalAnimales} animales esperando una familia`;
 
  return (
    <div
      className="d-flex flex-column min-vh-100"
      style={{ backgroundColor: "var(--rp-hueso)" }}
    >
      <div className="bg-success-subtle py-5">
        <div className="container">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3">
            <div>
              <p className="text-success fw-bold text-uppercase small mb-1">{antetitulo}</p>
 
              <h2 className="fw-bold mb-1">{titulo}</h2>
 
              <p className="text-secondary mb-0">
                {cargando ? "Cargando animales…" : textoContador}
              </p>
            </div>
 
            {esProtectora && (
              <div className="d-flex flex-wrap gap-2">
                <Link
                  to="/panel/adopciones"
                  className="btn btn-success rounded-pill px-4 py-2 fw-semibold shadow-sm"
                >
                  Ver mis adopciones
                </Link>
 
                <Link
                  to="/panel/animales"
                  className="btn btn-success rounded-pill px-4 py-2 fw-semibold shadow-sm"
                >
                  Ver mis animales
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
 
      <div className="container mt-4">
        <Mapa datos={animales} />
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
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
            <div className="d-flex flex-nowrap gap-2 overflow-auto pb-1 pb-md-0">
              {PESTANAS.map((pestana) => (
                <button
                  key={pestana.key}
                  className={`btn rounded-pill px-4 text-nowrap ${especie === pestana.key
                    ? "btn-primary"
                    : "btn-light"
                    }`}
                  onClick={() => cambiarEspecie(pestana.key)}
                >
                  {pestana.label}
                </button>
              ))}
            </div>
 
            <div className="d-flex flex-nowrap gap-2">
              <select
                className="form-select form-select-sm rounded-pill"
                style={{ width: "170px" }}
                value={edad}
                onChange={(e) => cambiarEdad(e.target.value)}
              >
                {EDADES.map((opcion) => (
                  <option key={opcion.value} value={opcion.value}>
                    {opcion.label}
                  </option>
                ))}
              </select>
 
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
              No hay animales con estos filtros 🐾
            </h4>
 
            <button
              className="btn btn-outline-primary rounded-pill mt-3 px-4"
              onClick={limpiarFiltros}
            >
              Restablecer filtros
            </button>
          </div>
        )}
 
        {!cargando && animales.length > 0 && (
          <>
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              {animales.map((animal) => (
                <div className="col" key={animal.animal_id}>
                  <AnimalCard animal={animal} />
                </div>
              ))}
            </div>
 
            {totalPaginas > 1 && (
              <div className="d-flex justify-content-center align-items-center gap-3 mt-5 pt-4">
                <button
                  className="btn btn-outline-primary rounded-pill px-4"
                  disabled={pagina <= 1}
                  onClick={() => actualizarUrl({ pagina: pagina - 1 })}
                >
                  Anterior
                </button>
 
                <span style={{ color: "var(--rp-gris)" }}>
                  Página {pagina} de {totalPaginas}
                </span>
 
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
 
export default Adoptar;