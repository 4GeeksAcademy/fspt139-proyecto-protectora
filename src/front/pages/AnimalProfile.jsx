import React from "react";
import { useParams, Link } from "react-router-dom";

export const AnimalProfile = () => {
    const { id } = useParams();

    return (
        <div className="container py-5">
            <Link to="/adoptar" className="btn btn-outline-secondary mb-4">← Volver a Adoptar</Link>
            <div className="row bg-white p-4 shadow-sm rounded">
                <div className="col-md-6">
                    <img 
                        src="https://images.unsplash.com/photo-1543466835-00a7907e9de1" 
                        alt="Mascota" 
                        className="img-fluid rounded"
                    />
                </div>
                <div className="col-md-6">
                    <h1 className="fw-bold">Nala (ID: {id})</h1>
                    <span className="badge bg-success mb-3">En Adopción</span>
                    <p><strong>Raza:</strong> Mestiza</p>
                    <p><strong>Edad:</strong> 2 años</p>
                    <p><strong>Sexo:</strong> Hembra</p>
                    <p className="mt-3">
                        Nala es una perrita muy cariñosa y juguetona. Se lleva excelente con otros perros y niños. Busca un hogar responsable donde le den mucho amor.
                    </p>
                    <button className="btn btn-success btn-lg mt-3 w-100">Solicitar Adopción</button>
                </div>
            </div>
        </div>
    );
};