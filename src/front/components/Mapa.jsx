import React, { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { cargarMediaUrl } from "../services/animalsService";

const iconoNormal = new Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const iconoVerde = new Icon({
  ...iconoNormal.options,
  className: "pin-usuario",
});

// Expone la instancia del mapa de la pagina al componente padre (via onListo)
const ObtenerInstanciaMapa = ({ onListo }) => {
  const mapa = useMap();
  useEffect(() => {
    onListo(mapa);
  }, [mapa, onListo]);
  return null;
};

// Convierte las coordenadas del backend en dos numeros
const obtenerPosicion = (ubicacion) => {
  if (typeof ubicacion !== "string") return null;

  const partes = ubicacion.split(",");

  if (
    partes.length !== 2 ||
    partes.some((parte) => parte.trim() === "")
  ) {
    return null;
  }

  const [lat, lng] = partes.map(Number);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;

  return [lat, lng];
};

export const Mapa = ({
  datos = [],
  renderPopup,
  popupMaxWidth = 320,
  altura = 260,
}) => {
  const { store } = useGlobalReducer();
  const [mapaGrande, setMapaGrande] = useState(false);
  const instanciaMapaRef = useRef(null);

  const posicionUsuario = obtenerPosicion(store.user_location);

  // Agrupa los elementos que tienen las mismas coordenadas
  const ubicacionesAgrupadas = useMemo(() => {
    const grupos = new Map();

    datos.forEach((dato) => {
      const posicion = obtenerPosicion(dato.map_positioning);

      if (!posicion) return;

      const clave = posicion.join(",");

      if (!grupos.has(clave)) {
        grupos.set(clave, {
          posicion,
          elementos: [],
        });
      }

      grupos.get(clave).elementos.push(dato);
    });

    return Array.from(grupos.values());
  }, [datos]);

  // Busca la primera posicion de los datosa que nos devuelve posicion, ojo... requiere que mantengamos como map_positioning la propiedad del fetch que traigamos
  const primeraPosicionValida = useMemo(() => {
    for (const dato of datos) {
      const posicion = obtenerPosicion(dato.map_positioning);
      if (posicion) return posicion;
    }
    return null;
  }, [datos]);

  // Centra el mapa en:
  // - la primera posicion valida del listado (map_positioning)
  // - si no hay resultados con ubicacion cae en la posicion del usuario
  // - si no tenemos Madrid por defecto
  const centroMapa =
    primeraPosicionValida || posicionUsuario || [40.4168, -3.7038];

  return (
    <div
      className={
        mapaGrande
          ? "position-fixed top-0 start-0 w-100 h-100"
          : "position-relative"
      }
      style={{ zIndex: mapaGrande ? 2000 : 0 }}
    >
      <style>
        {`
          .leaflet-marker-icon.pin-usuario {
            filter: hue-rotate(270deg);
          }

          .popup-animal .leaflet-popup-content {
            margin: 10px 12px;
            max-height: none;
            overflow: visible;
          }
        `}
      </style>

      <MapContainer
        key={`${centroMapa.join(",")}-${mapaGrande}`}
        center={centroMapa}
        zoom={11}
        style={{
          height: mapaGrande ? "100vh" : `${altura}px`,
          borderRadius: mapaGrande
            ? 0
            : "var(--bs-border-radius-xl)",
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.de/{z}/{x}/{y}.png"
        />

        {/* Pin verde del usuario */}
        {posicionUsuario && (
          <Marker
            position={posicionUsuario}
            icon={iconoVerde}
            zIndexOffset={1000}
          >
            <Popup>Tu ubicación</Popup>
          </Marker>
        )}

        {/* Un pin por cada ubicacion */}
        {ubicacionesAgrupadas.map((grupo) => {
          const protectoraId = grupo.elementos[0]?.shelter_id;

          return (
            <Marker
              key={grupo.posicion.join(",")}
              position={grupo.posicion}
              icon={iconoNormal}
            >
              <Popup
                className="popup-animal"
                minWidth={240}
                maxWidth={popupMaxWidth}
              >
                {renderPopup ? (
                  renderPopup(grupo.elementos)
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {grupo.elementos.slice(0, 2).map((dato, index) => {
                      const animalId = dato.animal_id || dato.id;

                      return (
                        <Link
                          key={animalId || index}
                          to={`/adoptar/${animalId}`}
                          className={`d-flex align-items-center gap-3 text-decoration-none text-reset ${
                            index > 0 ? "pt-2 border-top" : ""
                          }`}
                        >
                          <div
                            className="text-start flex-grow-1"
                            style={{ minWidth: 0 }}
                          >
                            <strong className="d-block mb-1 text-dark">
                              {dato.name}
                            </strong>

                            {dato.breed && (
                              <div className="small text-secondary">
                                {dato.breed}
                              </div>
                            )}

                            {dato.shelter_name && (
                              <div className="small text-secondary">
                                {dato.shelter_name}
                              </div>
                            )}

                            {dato.address && (
                              <div className="small text-secondary">
                                {dato.address}
                              </div>
                            )}
                          </div>

                          {dato.cover_image ? (
                            <img
                              src={cargarMediaUrl(dato.cover_image)}
                              alt={dato.name}
                              className="rounded-circle object-fit-cover flex-shrink-0"
                              style={{ width: "56px", height: "56px" }}
                            />
                          ) : (
                            <div
                              className="rounded-circle bg-success-subtle d-flex align-items-center justify-content-center flex-shrink-0"
                              style={{ width: "56px", height: "56px" }}
                            >
                              <i className="fa-solid fa-paw"></i>
                            </div>
                          )}
                        </Link>
                      );
                    })}

                    {protectoraId && (
                      <div className="pt-2 border-top">
                        <Link
                          to={`/protectora/${protectoraId}`}
                          className="btn btn-sm btn-outline-success w-100"
                        >
                          Ver protectora
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </Popup>
            </Marker>
          );
        })}

        <ObtenerInstanciaMapa
          onListo={(mapa) => { instanciaMapaRef.current = mapa; }}
        />
      </MapContainer>

      <div
        className="position-absolute bottom-0 end-0 m-3 d-flex flex-column gap-2"
        style={{ zIndex: 1000 }}
      >
        {posicionUsuario && (
          <button
            type="button"
            className="btn btn-light btn-sm shadow"
            title="Centrar en mi ubicación"
            aria-label="Centrar en mi ubicación"
            onClick={() => {
              instanciaMapaRef.current?.setView(
                posicionUsuario,
                instanciaMapaRef.current.getZoom(),
              );
            }}
          >
            <i className="fa-solid fa-location-crosshairs"></i>
          </button>
        )}

        {/* Boton para ampliar o reducir el mapa */}
        <button
          type="button"
          className="btn btn-light btn-sm shadow"
          title={mapaGrande ? "Reducir mapa" : "Ampliar mapa"}
          aria-label={mapaGrande ? "Reducir mapa" : "Ampliar mapa"}
          onClick={() => setMapaGrande(!mapaGrande)}
        >
          <i
            className={
              mapaGrande
                ? "fa-solid fa-compress"
                : "fa-solid fa-expand"
            }
          ></i>
        </button>
      </div>
    </div>
  );
};