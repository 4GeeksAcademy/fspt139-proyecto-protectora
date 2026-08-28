import React from "react";
import { Link } from "react-router-dom";

const animalesEjemplo = [
    { id: 1, nombre: "Nala", edad: "2 años", ubicacion: "Valencia", imagen: "https://images.unsplash.com/photo-1543466835-00a7907e9de1" },
    { id: 2, nombre: "Rocky", edad: "4 meses", ubicacion: "Sagunto", imagen: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e" },
    { id: 3, nombre: "Mimi", edad: "1 año", ubicacion: "Castellón", imagen: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba" }
];

const AnimalCard = ({ animal }) => {
    return (
        <div className="card h-100 shadow-sm border-0">
            <img 
                src={animal.imagen || "https://via.placeholder.com/300x200"} 
                className="card-img-top" 
                alt={animal.nombre}
                style={{ height: "200px", objectFit: "cover" }}
            />
            <div className="card-body d-flex flex-column">
                <h5 className="card-title fw-bold text-success">{animal.nombre}</h5>
                <p className="card-text text-muted mb-1"><strong>Edad:</strong> {animal.edad}</p>
                <p className="card-text text-muted mb-3"><strong>Ubicación:</strong> {animal.ubicacion}</p>
                <Link to={`/adoptar/${animal.id}`} className="btn btn-outline-success mt-auto w-100">
                    Ver Ficha
                </Link>
            </div>
        </div>
    );
};

export const Adoptar = () => {
    return (
        <div className="container py-4">
            <h2 className="text-center fw-bold mb-4">Mascotas en Adopción</h2>
            <div className="row g-4">
                {animalesEjemplo.map((animal) => (
                    <div className="col-12 col-md-6 col-lg-4" key={animal.id}>
                        <AnimalCard animal={animal} />
                    </div>
                ))}
            </div>
        </div>
    );
};