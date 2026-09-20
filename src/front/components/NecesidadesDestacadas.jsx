import { NecesidadCard } from "./NecesidadCard";

export const NecesidadesDestacadas = ({ needs }) => {
    return (
        <div className="mb-5">
            <h2 className="fw-bold mb-1">Necesidades abiertas</h2>
            <p className="text-secondary mb-4">Lo que hace falta ahora mismo</p>

            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                {(needs || []).map((need) => (
                    <div className="col" key={need.request_id}>
                        <NecesidadCard necesidad={need} />
                    </div>
                ))}
            </div>
        </div>
    );
};