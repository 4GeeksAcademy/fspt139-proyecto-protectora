import { NecesidadCard } from "./NecesidadCard";

export const NecesidadesDestacadas = () => {

    return (
        <div className="mb-5">
            <h2 className="fw-bold mb-1">Open needs</h2>
            <p className="text-secondary mb-4">What's needed right now</p>

            <div className="row g-4">

                <NecesidadCard
                    imageClass="img-cat"
                    title="Take two cats to the vet"
                    org="Gatos del Sur"
                    badgeText="Urgent"
                    badgeClass="bg-danger"
                    current={0}
                    total={1}
                    unit="trip"
                    note="A car is needed"
                />

                <NecesidadCard
                    imageClass="img-food"
                    title="Puppy food"
                    org="Protectora Animal Feliz"
                    badgeText="3 days left"
                    badgeClass="bg-warning text-dark"
                    current={12}
                    total={20}
                    unit="kg"
                    note="Pick up at the shelter"
                />

                <NecesidadCard
                    imageClass="img-blanket"
                    title="Blankets and towels"
                    org="Protectora Croissant"
                    badgeText="Covered"
                    badgeClass="bg-success"
                    current={4}
                    total={4}
                    unit="blankets"
                    note="Closed on August 14"
                />

            </div>
        </div>
    );
};