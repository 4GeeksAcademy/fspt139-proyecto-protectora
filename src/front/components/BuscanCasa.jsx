import { HomeAnimalCard } from "./HomeAnimalCard";

export const BuscanCasa = () => {

    return (
        <div className="mb-5">
            <h2 className="fw-bold mb-1">Looking for a home</h2>
            <p className="text-secondary mb-4">38 animals from 6 shelters</p>

            <div className="row g-4">

                <HomeAnimalCard
                    imageClass="img-nala"
                    badgeText="Available"
                    badgeClass="bg-success"
                    name="Cabezon"
                    details="Mixed breed dog · 2 years · 14 kg"
                    org="Protectora Huellas"
                />

                <HomeAnimalCard
                    imageClass="img-trufa"
                    badgeText="In process"
                    badgeClass="bg-warning text-dark"
                    name="Trufa"
                    details="European shorthair cat · 7 months"
                    org="Protectora Huellas"
                />

                <HomeAnimalCard
                    imageClass="img-bruno"
                    badgeText="Available"
                    badgeClass="bg-success"
                    name="Bruno"
                    details="Podenco · 5 years · 22 kg"
                    org="Colonia Felina Vallecas"
                />

            </div>
        </div>
    );
};