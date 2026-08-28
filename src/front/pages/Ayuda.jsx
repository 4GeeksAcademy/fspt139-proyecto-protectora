import React from "react";

export const Ayuda = () => {
    return (
        <div className="container py-5">
            <h2 className="fw-bold text-center mb-4">¿Cómo puedes ayudar?</h2>
            <div className="row g-4 text-center">
                <div className="col-md-4">
                    <div className="p-4 border rounded shadow-sm">
                        <h3>🐶 Adopta</h3>
                        <p>Dale una segunda oportunidad a un animal sin hogar.</p>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="p-4 border rounded shadow-sm">
                        <h3>🏠 Casa de Acogida</h3>
                        <p>Recibe temporalmente a una mascota mientras encuentra un hogar definitivo.</p>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="p-4 border rounded shadow-sm">
                        <h3>❤️ Donaciones</h3>
                        <p>Apoya económicamente o con insumos (comida, mantas, medicinas).</p>
                    </div>
                </div>
            </div>
        </div>
    );
};