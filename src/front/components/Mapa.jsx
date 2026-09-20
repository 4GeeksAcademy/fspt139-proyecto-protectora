import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
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

export const Mapa = ({ datos = [] }) => {
    const { store } = useGlobalReducer();
    const [mapaGrande, setMapaGrande] = useState(false);

    const posicionUsuario = obtenerPosicion(store.user_location);
    const centroMapa = posicionUsuario || [40.4168, -3.7038];

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
          }
        `}
            </style>

            <MapContainer
                key={`${centroMapa.join(",")}-${mapaGrande}`}
                center={centroMapa}
                zoom={11}
                style={{
                    height: mapaGrande ? "100vh" : "260px",
                    borderRadius: mapaGrande
                        ? 0
                        : "var(--bs-border-radius-xl)",
                }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://tile.openstreetmap.de/{z}/{x}/{y}.png"
                />

            
                {posicionUsuario && (
                    <Marker
                        position={posicionUsuario}
                        icon={iconoVerde}
                        zIndexOffset={1000}
                    >
                        <Popup>Tu ubicación</Popup>
                    </Marker>
                )}

                
                {datos.map((dato) => {
                    const posicion = obtenerPosicion(dato.map_positioning);

                    if (!posicion) return null;

                    return (
                        <Marker
                            key={dato.id}
                            position={posicion}
                            icon={iconoNormal}
                        >
                            <Popup
                                className="popup-animal"
                                minWidth={240}
                                maxWidth={320}
                            >
                                <div className="d-flex align-items-center gap-3">
                                   
                                    <div
                                        className="text-start flex-grow-1"
                                        style={{ minWidth: 0 }}
                                    >
                                        <strong className="d-block mb-1">
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
                                            style={{
                                                width: "56px",
                                                height: "56px",
                                            }}
                                        />
                                    ) : (
                                        <div
                                            className="rounded-circle bg-success-subtle d-flex align-items-center justify-content-center flex-shrink-0"
                                            style={{
                                                width: "56px",
                                                height: "56px",
                                            }}
                                        >
                                            🐾
                                        </div>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>

            <button
                type="button"
                className="btn btn-light btn-sm shadow position-absolute bottom-0 end-0 m-3"
                style={{ zIndex: 1000 }}
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
    );
};