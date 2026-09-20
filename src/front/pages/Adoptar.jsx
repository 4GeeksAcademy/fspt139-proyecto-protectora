import React, { useEffect, useMemo, useState } from "react";
import { Mapa } from "../components/Mapa";
import { AnimalCard } from "../components/AnimalCard";
import { getAnimals } from "../services/animalsService";
import { getShelters } from "../services/sheltersService";
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


  const [especie, setEspecie] = useState("todos");
  const [edad, setEdad] = useState("");
  const [shelterId, setShelterId] = useState("");
  const [pagina, setPagina] = useState(1);


  const [animales, setAnimales] = useState([]);
  const [totalAnimales, setTotalAnimales] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);


  const [shelters, setShelters] = useState([]);


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
    getShelters({
      ordenarPor: "name",
      orden: "asc",
      pagina: 1,
      perPage: 100,
    })
      .then((data) => setShelters(data.items || []))
      .catch(() => setShelters([]));
  }, []);

  useEffect(() => {
    if (esperandoCatalogo) return;

    let cancelado = false;
    setCargando(true);
    setError(null);

    getAnimals(
      { pagina, perPage: PER_PAGE },
      { animalTypeIds, shelterId, edad }
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
  }, [pagina, edad, shelterId, animalTypeIds, esperandoCatalogo]);

  const cambiarEspecie = (key) => {
    setEspecie(key);
    setPagina(1);
  };

  const cambiarEdad = (value) => {
    setEdad(value);
    setPagina(1);
  };

  const cambiarProtectora = (value) => {
    setShelterId(value);
    setPagina(1);
  };

  const limpiarFiltros = () => {
    setEspecie("todos");
    setEdad("");
    setShelterId("");
    setPagina(1);
  };

  const sinResultados =
    !cargando && !error && animales.length === 0;

  return (
    <div
      className="d-flex flex-column min-vh-100"
      style={{ backgroundColor: "var(--rp-hueso)" }}
    >
      <div className="bg-success-subtle py-5">
        <div className="container">
          <p className="text-success fw-bold text-uppercase small mb-1">
            Adopciones
          </p>

          <h2 className="fw-bold mb-1">Buscan casa</h2>

          <p className="text-secondary mb-0">
            {cargando
              ? "Cargando animales…"
              : `${totalAnimales} animales esperando una familia`}
          </p>
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
                value={shelterId}
                onChange={(e) => cambiarProtectora(e.target.value)}
              >
                <option value="">Cualquier protectora</option>

                {shelters.map((shelter) => (
                  <option key={shelter.shelter_id} value={shelter.id}>
                    {shelter.name}
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
                  onClick={() => setPagina((p) => p - 1)}
                >
                  Anterior
                </button>

                <span style={{ color: "var(--rp-gris)" }}>
                  Página {pagina} de {totalPaginas}
                </span>

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

export default Adoptar;