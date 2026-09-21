import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getShelterById } from "../services/sheltersService";
import { getRequests } from "../services/requestsService";
import { getAnimals, cargarMediaUrl } from "../services/animalsService";
import { esUrgente } from "../utils/necesidadDeadline";
import { generarIniciales } from "../utils/iniciales";
import { NecesidadCard } from "../components/NecesidadCard";
import { AnimalCard } from "../components/AnimalCard";
import { Metrica } from "../components/protectora/ProtectoraCard";
import { NotFound } from "./NotFound";
import useGlobalReducer from "../hooks/useGlobalReducer";

const Dato = ({ etiqueta, children }) => {
  if (children == null || children === "" || children === false) return null;
  return (
    <div className="d-flex justify-content-between align-items-start border-bottom py-2 gap-3">
      <span style={{ color: "var(--rp-gris)" }}>{etiqueta}</span>
      <span className="fw-semibold text-end">{children}</span>
    </div>
  );
};

const MAX_NECESIDADES = 3;
const MAX_ANIMALES = 6;


const Seccion = ({ titulo, items, vacio, children }) => (
  <section className="mt-5">
    <h4 className="fw-bold mb-3" style={{ color: "var(--rp-pino)" }}>{titulo}</h4>
    {items === null ? (
      <p style={{ color: "var(--rp-gris)" }}>Cargando…</p>
    ) : items.length === 0 ? (
      <p className="fst-italic" style={{ color: "var(--rp-gris)" }}>{vacio}</p>
    ) : (
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {items.map((item) => (
          <div className="col" key={item.id}>{children(item)}</div>
        ))}
      </div>
    )}
  </section>
);

export const ProtectoraProfile = () => {
  const { id } = useParams();
  const { store } = useGlobalReducer();

  const [protectora, setProtectora] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [noEncontrada, setNoEncontrada] = useState(false);
  const [necesidades, setNecesidades] = useState(null);
  const [animales, setAnimales] = useState(null);

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setError(null);
    setNoEncontrada(false);

    getShelterById(id)
      .then((data) => {
        if (!cancelado) setProtectora(data);
      })
      .catch((err) => {
        if (cancelado) return;
        if (err.status === 404) setNoEncontrada(true);
        else setError(err.message);
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => { cancelado = true; };
  }, [id]);

  // los listados filtran por el id numerico, que solo tenemos cuando llega la ficha
  useEffect(() => {
    if (!protectora) return;
    let cancelado = false;
    setNecesidades(null);
    setAnimales(null);

    getRequests({ ordenarPor: "request_deadline", orden: "asc", perPage: 20 }, { shelterId: protectora.id })
      .then((data) => {
        if (cancelado) return;
        const abiertas = (data.items || []).filter((n) => n.status === "abierta");
        const urgentes = abiertas.filter((n) => esUrgente(n.request_deadline));
        setNecesidades((urgentes.length > 0 ? urgentes : abiertas).slice(0, MAX_NECESIDADES));
      })
      .catch(() => {
        if (!cancelado) setNecesidades([]);
      });

    getAnimals({ perPage: MAX_ANIMALES }, { shelterId: protectora.id })
      .then((data) => {
        if (!cancelado) setAnimales(data.items || []);
      })
      .catch(() => {
        if (!cancelado) setAnimales([]);
      });

    return () => { cancelado = true; };
  }, [protectora?.id]);

  if (cargando) {
    return (
      <div className="container py-5 d-flex justify-content-center">
        <div className="spinner-grow" style={{ color: "var(--rp-verde)" }} role="status">
          <span className="visually-hidden">Cargando…</span>
        </div>
      </div>
    );
  }

  if (noEncontrada) return <NotFound />;

  if (error || !protectora) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error || "No se ha podido cargar la protectora"}</div>
        <Link to="/protectoras" className="btn btn-outline-secondary">← Volver a Protectoras</Link>
      </div>
    );
  }

  const tipo = protectora.shelter_type?.name;
  const desde = protectora.created_at ? new Date(protectora.created_at).getFullYear() : null;
  const subtitulo = [tipo, desde && `En Red Protectora desde ${desde}`].filter(Boolean).join(" · ");
  const categorias = store.requestTypes || [];

  return (
    <div style={{ backgroundColor: "var(--rp-hueso)" }}>
      <div className="container py-5">
        <Link to="/protectoras" className="btn btn-outline-secondary rounded-pill mb-4">
          ← Volver a Protectoras
        </Link>

        <div className="row g-4">
          <div className="col-lg-5">
            <div
              className="position-relative rounded overflow-hidden d-flex align-items-center justify-content-center"
              style={{ height: "320px", backgroundColor: "var(--rp-verde-cl)" }}
            >
              {protectora.logo_url ? (
                <img
                  src={cargarMediaUrl(protectora.logo_url)}
                  alt={protectora.name}
                  className="w-100 h-100"
                  style={{ objectFit: "contain", backgroundColor: "var(--rp-papel)" }}
                />
              ) : (
                <span className="fw-bold" style={{ fontSize: "5rem", color: "var(--rp-verde)" }}>
                  {generarIniciales(protectora.name)}
                </span>
              )}

              <div className="position-absolute top-0 start-0 m-3 d-flex gap-1">
                {tipo && (
                  <span className="badge" style={{ backgroundColor: "var(--rp-verde)", color: "var(--rp-papel)" }}>
                    {tipo}
                  </span>
                )}
                {protectora.has_urgent && (
                  <span className="badge" style={{ backgroundColor: "var(--rp-arcilla)", color: "var(--rp-papel)" }}>
                    Necesidad urgente
                  </span>
                )}
              </div>
            </div>

            <div className="d-flex text-center rounded-3 py-3 mt-3" style={{ backgroundColor: "var(--rp-papel)" }}>
              <Metrica valor={protectora.open_requests} etiqueta="necesidades" destacada />
              <div className="vr" style={{ backgroundColor: "var(--rp-linea)" }} />
              <Metrica valor={protectora.published_animals} etiqueta="animales" />
              <div className="vr" style={{ backgroundColor: "var(--rp-linea)" }} />
              <Metrica valor={protectora.supporters} etiqueta="apoyos" />
            </div>
          </div>

          <div className="col-lg-7">
            <h1 className="fw-bold mb-1" style={{ color: "var(--rp-pino)" }}>{protectora.name}</h1>
            {subtitulo && <p className="text-secondary mb-3">{subtitulo}</p>}
            {protectora.description && (
              <p className="mb-4" style={{ lineHeight: 1.7 }}>{protectora.description}</p>
            )}

            <h5 className="fw-bold mt-4 mb-2">Contacto</h5>
            <Dato etiqueta="Dirección">{protectora.address}</Dato>
            <Dato etiqueta="Email">
              {protectora.email && <a href={`mailto:${protectora.email}`}>{protectora.email}</a>}
            </Dato>
            <Dato etiqueta="Teléfono">
              {protectora.phone && <a href={`tel:${protectora.phone}`}>{protectora.phone}</a>}
            </Dato>
            <Dato etiqueta="Web">
              {protectora.website && (
                <a href={protectora.website} target="_blank" rel="noopener noreferrer">Visitar web</a>
              )}
            </Dato>
            <Dato etiqueta="Instagram">{protectora.instagram}</Dato>

            <h5 className="fw-bold mt-4 mb-2">Necesidades</h5>
            <Dato etiqueta="Activas">{protectora.open_requests}</Dato>
            <Dato etiqueta="Cubiertas">{protectora.closed_requests}</Dato>
            {categorias.map((categoria) => (
              <Dato key={categoria.code} etiqueta={categoria.name}>
                {protectora.requests_by_category?.[categoria.code]}
              </Dato>
            ))}
          </div>
        </div>

        <Seccion
          titulo="Lo que más necesitan ahora"
          items={necesidades}
          vacio="Esta protectora no tiene necesidades abiertas ahora mismo."
        >
          {(necesidad) => <NecesidadCard necesidad={necesidad} />}
        </Seccion>

        <Seccion
          titulo="Buscan hogar"
          items={animales}
          vacio="Esta protectora no tiene animales en adopción ahora mismo."
        >
          {(animal) => <AnimalCard animal={animal} />}
        </Seccion>
      </div>
    </div>
  );
};