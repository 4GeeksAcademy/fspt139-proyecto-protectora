import { NecesidadCard } from "./NecesidadCard";
import useGlobalReducer from "../hooks/useGlobalReducer";


//TODO: refactorizar NecesidadCard para reducir el numero de props a cambio de pasarle un need/request

const getImageClass = (requestTypeName) => {
    //todo: ampliar tipos de ayuda o la imagen de la need directamente
    if (requestTypeName === "money") return "img-pills";
    if (requestTypeName === "resources") return "img-food";
    if (requestTypeName === "time") return "img-car";
    return "img-food";
};

export const NecesidadesDestacadas = ({ needs }) => {
    const { store } = useGlobalReducer();
    const requestTypes = store.requestTypes;

    return (
        <div className="mb-5">
            <h2 className="fw-bold mb-1">Open needs</h2>
            <p className="text-secondary mb-4">What's needed right now</p>

            <div className="row g-4">

                {needs.map((need) => {
                    return (
                        <NecesidadCard
                            key={need.id}
                            id={need.request_id}
                            imageClass={getImageClass(need.request_type_code)}
                            title={need.name}
                            org={"Shelter " + need.shelter_id}
                            badgeText={need.request_type_name}
                            badgeClass="bg-warning text-dark"
                            current={0}
                            total={need.amount_needed != null ? Number(need.amount_needed).toFixed(2) : "—"}
                            unit={need.unit || "€"}
                            note={need.description}
                        />
                    );
                })}

            </div>
        </div>
    );
};