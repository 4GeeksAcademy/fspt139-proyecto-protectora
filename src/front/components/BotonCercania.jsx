import React from "react";

export const BotonCercania = ({ activo, disponible, onClick }) => (
    <span
        className="d-inline-block flex-shrink-0"
        title={disponible ? "Ordenar por distancia a tu ubicación" : "No es posible ordenar por cercanía"}
    >
        <button
            type="button"
            className={`btn rounded-pill px-3 text-nowrap ${activo ? "btn-primary" : "btn-light"}`}
            aria-pressed={activo}
            disabled={!disponible && !activo}
            onClick={onClick}
        >
            <i className="fa-solid fa-location-dot me-2" aria-hidden="true"></i>
            Cerca de mi
        </button>
    </span>
);
