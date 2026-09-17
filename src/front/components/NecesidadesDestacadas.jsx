import { NecesidadCard } from "./NecesidadCard";

const getImageClass = (requestType) => {
    if (requestType === "medica") return "img-pills";
    if (requestType === "vacunacion") return "img-vet";
    if (requestType === "esterilizacion") return "img-vet";
    if (requestType === "alimento") return "img-food";
    if (requestType === "transporte") return "img-car";
    return "img-food";
};

export const NecesidadesDestacadas = ({ needs }) => {

    return (
        <div className="mb-5">
            <h2 className="fw-bold mb-1">Open needs</h2>
            <p className="text-secondary mb-4">What's needed right now</p>

            <div className="row g-4">

                {needs.map((need) => (
                    <NecesidadCard
                        key={need.id}
                        id={need.id}
                        imageClass={getImageClass(need.request_type)}
                        title={need.name}
                        org={"Shelter " + need.shelter_id}
                        badgeText={need.request_type}
                        badgeClass="bg-warning text-dark"
                        current={0}
                        total={Number(need.amount_needed).toFixed(2)}
                        unit="€"
                        note={need.description}
                    />
                ))}

            </div>
        </div>
    );
};