import React from "react";
import { ProtectoraCard } from "../components/protectora/ProtectoraCard";

const protectorasEjemplo = [
    { id: 1, nombre: "Protectora Huellas de Amor", ciudad: "Valencia", descripcion: "Dedicados al rescate y rehabilitación de perros abandonados." },
    { id: 2, nombre: "Asociación Felina Sagunto", ciudad: "Sagunto", descripcion: "Cuidado y adopción de colonias felinas locales." }
];



export const Protectoras = () => {
    return (
        <div className="container py-4">
            <h2 className="text-center fw-bold mb-4">Protectoras Asociadas</h2>
            <div className="row g-4">
                {protectorasEjemplo.map((prot) => (
                    <div className="col-12 col-md-6" key={prot.id}>
                        <ProtectoraCard protectora={prot} />
                    </div>
                ))}
            </div>
        </div>
    );
};