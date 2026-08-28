import React from "react";
export const ProtectoraCard = ({ protectora }) => {
    return (
        <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
                <h5 className="card-title fw-bold">{protectora.nombre}</h5>
                <p className="card-text text-secondary">{protectora.descripcion}</p>
                <p className="small text-muted mb-1">📍 {protectora.ciudad}</p>
                <a href={protectora.web || "#"} className="btn btn-primary btn-sm mt-2">
                    Contactar
                </a>
            </div>
        </div>
    );
};