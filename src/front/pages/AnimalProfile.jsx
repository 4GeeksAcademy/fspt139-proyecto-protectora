import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate, useLocation, Link } from "react-router-dom";
import { getAnimalById, cargarMediaUrl } from "../services/animalsService";
import { getPublicAddoptionProcess } from "../services/addoptionRequestService";
import { calcularAgeLabel } from "../utils/animalAge";
import { construirTags } from "../utils/animalTags";
import { NotFound } from "./NotFound";
import { SolicitarAdopcionModal } from "../components/adopcion/SolicitarAdopcionModal";
import { AnimalNeeds } from "../components/necesidades/AnimalNeeds";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { usePageTitle } from "../hooks/usePageTitle";
import { ANIMAL_PUBLIC_STATUS_LABELS } from "../utils/format";


// una fila etiqueta/valor que desaparece sola si no hay valor
// todo: refactorizar y sacar a componente fuera cuando jose rodriguez termine pagina de shelter
const Dato = ({ etiqueta, children }) => {
  if (children === null || children === undefined || children === "") return null;
  return (
    <div className="d-flex justify-content-between align-items-start border-bottom py-2 gap-3">
      <span style={{ color: "var(--rp-gris)" }}>{etiqueta}</span>
      <span className="fw-semibold text-end">{children}</span>
    </div>
  );
};

// los tres estados que acordamos: Si / No / Sin datos
const Convivencia = ({ valor }) => {
  if (valor === true) return <span style={{ color: "var(--rp-verde)" }}>Sí</span>;
  if (valor === false) return <span style={{ color: "var(--rp-arcilla)" }}>No</span>;
  return <span className="fst-italic" style={{ color: "var(--rp-gris)" }}>Sin datos</span>;
};

const SiNo = (valor) => (valor === true ? "Sí" : valor === false ? "No" : null);

export const AnimalProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // si llegaste desde la web, volver es ir atras: recupera el listado con su pagina y filtros;
  // si entraste directo a la ficha (un enlace compartido) no hay atras y vamos al listado
  const volver = () => (location.key !== "default" ? navigate(-1) : navigate("/adoptar"));
  const { store } = useGlobalReducer();
  const [searchParams, setSearchParams] = useSearchParams();

  const [animal, setAnimal] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [noEncontrado, setNoEncontrado] = useState(false);
  const [mediaActivo, setMediaActivo] = useState(null);
  const [proceso, setProceso] = useState(null);
  const [modalSolicitudAbierto, setModalSolicitudAbierto] = useState(false);
  usePageTitle(animal?.name);

  const recargarProceso = () => {
    getPublicAddoptionProcess(id).then(setProceso).catch(() => setProceso(null));
  };

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setError(null);
    setNoEncontrado(false);

    getAnimalById(id)
      .then((data) => {
        if (cancelado) return;
        setAnimal(data);
        const media = data.media || [];
        setMediaActivo(media.find((m) => m.is_cover) || media[0] || null);
      })
      .catch((err) => {
        if (cancelado) return;
        if (err.status === 404) setNoEncontrado(true);
        else setError(err.message);
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    getPublicAddoptionProcess(id)
      .then((data) => {
        if (!cancelado) setProceso(data);
      })
      .catch(() => {
        if (!cancelado) setProceso(null);
      });

    return () => { cancelado = true; };
  }, [id]);

  // vuelta desde el login (?adoptar=1 en la url, ver el Link "Inicia sesión para solicitar
  // adopción"): si ya hay sesion y el proceso sigue admitiendo solicitudes, abre el modal solo
  useEffect(() => {
    if (!proceso || !store.token || searchParams.get("adoptar") !== "1") return;

    if (proceso.is_open_for_requests) setModalSolicitudAbierto(true);

    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("adoptar");
      return next;
    }, { replace: true });
  }, [proceso, store.token]);

  if (cargando) {
    return (
      <div className="container py-5 d-flex justify-content-center">
        <div className="spinner-grow" style={{ color: "var(--rp-verde)" }} role="status">
          <span className="visually-hidden">Cargando…</span>
        </div>
      </div>
    );
  }

  if (noEncontrado) {
    return <NotFound />;
  }

  if (error || !animal) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error || "No se ha podido cargar la ficha"}</div>
        <button type="button" onClick={volver} className="btn btn-outline-secondary"><i className="fa fa-arrow-left text-danger me-1" /> Volver</button>
      </div>
    );
  }

  const estado = ANIMAL_PUBLIC_STATUS_LABELS[animal.status] || { texto: animal.status, fondo: "var(--rp-gris)" };
  const tags = construirTags(animal);
  const media = animal.media || [];
  const edad = calcularAgeLabel(animal.birthdate);
  const peso = Number(animal.weight) > 0 ? `${Number(animal.weight).toLocaleString("es-ES")} kg` : null;

  const especie =
    animal.sex === "hembra" && animal.species?.endsWith("o")
      ? `${animal.species.slice(0, -1)}a`
      : animal.species;

  const subtitulo = [especie, animal.breed, edad, peso].filter(Boolean).join(" · ");
  const sexo = animal.sex === "macho" ? "Macho" : animal.sex === "hembra" ? "Hembra" : null;

  return (
    <div style={{ backgroundColor: "var(--rp-hueso)" }}>
      <div className="container py-5">
        <button type="button" onClick={volver} className="btn btn-outline-secondary rounded-pill mb-4">
          <i className="fa fa-arrow-left text-danger me-1" /> Volver
        </button>

        <div className="row g-4">
          <div className="col-lg-6" id="animal-media">
            <div
              className="position-relative rounded overflow-hidden d-flex align-items-center justify-content-center"
              style={{ height: "400px", backgroundColor: "var(--rp-verde-cl)" }}
            >
              {mediaActivo?.format === "video" ? (
                <video
                  key={mediaActivo.media_id}
                  src={cargarMediaUrl(mediaActivo.url)}
                  controls
                  className="w-100 h-100"
                  style={{ objectFit: "contain", backgroundColor: "#000" }}
                />
              ) : mediaActivo ? (
                <img
                  src={cargarMediaUrl(mediaActivo.url)}
                  alt={animal.name}
                  className="w-100 h-100"
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <span style={{ fontSize: "4rem", opacity: 0.35 }}>🐾</span>
              )}
            </div>

            <span
              className="badge d-inline-block mt-3"
              style={{ backgroundColor: estado.fondo, color: "var(--rp-papel)" }}
            >
              {estado.texto}
            </span>

            {media.length > 1 && (
              <div className="d-flex gap-2 mt-3 overflow-auto">
                {media.map((item) => {
                  const activo = mediaActivo?.media_id === item.media_id;
                  const estilo = {
                    width: "80px",
                    height: "80px",
                    objectFit: "cover",
                    cursor: "pointer",
                    opacity: activo ? 1 : 0.6,
                    border: activo ? "2px solid var(--rp-verde)" : "2px solid transparent",
                  };

                  if (item.format === "video") {
                    return (
                      <div
                        key={item.media_id}
                        onClick={() => setMediaActivo(item)}
                        className="rounded flex-shrink-0 d-flex align-items-center justify-content-center"
                        style={{ ...estilo, backgroundColor: "var(--rp-tinta)", color: "#fff", fontSize: "1.5rem" }}
                      >
                        ▶
                      </div>
                    );
                  }

                  return (
                    <img
                      key={item.media_id}
                      src={cargarMediaUrl(item.url)}
                      alt={animal.name}
                      onClick={() => setMediaActivo(item)}
                      className="rounded flex-shrink-0"
                      style={estilo}
                    />
                  );
                })}
              </div>
            )}

            <AnimalNeeds animal={animal} />

          </div>

          <div className="col-lg-6">
            <h1 className="fw-bold mb-1" style={{ color: "var(--rp-pino)" }}>{animal.name}</h1>
            {subtitulo && <p className="text-secondary mb-3">{subtitulo}</p>}

            {tags.length > 0 && (
              <div className="d-flex flex-wrap gap-1 mb-4">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="badge border"
                    style={{
                      backgroundColor: "transparent",
                      color: "var(--rp-verde)",
                      borderColor: "var(--rp-verde)",
                      textTransform: "none",
                    }}
                  >
                    ✓ {tag}
                  </span>
                ))}
              </div>
            )}

            {animal.story && <p className="mb-4" style={{ lineHeight: 1.7 }}>{animal.story}</p>}

            <h5 className="fw-bold mt-4 mb-2">Sobre {animal.name}</h5>
            <Dato etiqueta="Sexo">{sexo}</Dato>
            <Dato etiqueta="Tamaño">{animal.size}</Dato>
            <Dato etiqueta="Peso">{peso}</Dato>
            <Dato etiqueta="Nivel de actividad">{animal.activity_level}</Dato>

            <h5 className="fw-bold mt-4 mb-2">Salud</h5>
            <Dato etiqueta="Esterilizado">{SiNo(animal.is_sterilized)}</Dato>
            <Dato etiqueta="Microchip">{SiNo(animal.has_microchip)}</Dato>
            <Dato etiqueta="Vacunas">{animal.vaccines}</Dato>
            <Dato etiqueta="Pruebas realizadas">{animal.tests_done}</Dato>
            <Dato etiqueta="Necesidades especiales">{animal.special_needs}</Dato>

            <h5 className="fw-bold mt-4 mb-2">Convivencia</h5>
            <Dato etiqueta="Con niños"><Convivencia valor={animal.lives_with_kids} /></Dato>
            <Dato etiqueta="Con perros"><Convivencia valor={animal.lives_with_dogs} /></Dato>
            <Dato etiqueta="Con gatos"><Convivencia valor={animal.lives_with_cats} /></Dato>

            {animal.ideal_home && (
              <>
                <h5 className="fw-bold mt-4 mb-2">Hogar ideal</h5>
                <p style={{ color: "var(--rp-gris)", lineHeight: 1.7 }}>{animal.ideal_home}</p>
              </>
            )}

            <div className="mt-4 p-3 rounded" style={{ backgroundColor: "var(--rp-papel)" }}>
              <p className="rp-eyebrow mb-1">Protectora</p>
              <p className="fw-semibold mb-0">{animal.shelter_name || "Sin asignar"}</p>
            </div>

            {proceso?.is_open_for_requests ? (
              store.token ? (
                <button
                  className="btn btn-success btn-lg w-100 mt-4 rounded-pill"
                  onClick={() => setModalSolicitudAbierto(true)}
                >
                  Adoptar
                </button>
              ) : (
                <Link
                  to="/login"
                  state={{ from: `/adoptar/${id}?adoptar=1` }}
                  className="btn btn-success btn-lg w-100 mt-4 rounded-pill d-block text-center"
                >
                  Adoptar
                </Link>
              )
            ) : (
              <>
                <p className="mt-4 mb-0 text-center text-muted" style={{ fontSize: "0.875rem" }}>
                  Este animal no tiene un proceso de adopción abierto en este momento.
                </p>
                {animal.shelter_id && (
                  <Link
                    to={`/protectoras/${animal.shelter_id}`}
                    className="btn btn-outline-success btn-lg w-100 mt-3 rounded-pill"
                  >
                    Ver protectora
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {modalSolicitudAbierto && proceso && (
        <SolicitarAdopcionModal
          animal={animal}
          proceso={proceso}
          onCerrar={() => {
            setModalSolicitudAbierto(false);
            recargarProceso();
          }}
          onSolicitudEnviada={() => recargarProceso()}
        />
      )}
    </div>
  );
};

export default AnimalProfile;