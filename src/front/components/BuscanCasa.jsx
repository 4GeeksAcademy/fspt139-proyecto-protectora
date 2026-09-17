import { HomeAnimalCard } from "./HomeAnimalCard";

export const BuscanCasa = ({ animals }) => {

    return (
        <div className="mb-5">
            <h2 className="fw-bold mb-1">Looking for a home</h2>
            <p className="text-secondary mb-4">Animals waiting for a family</p>

            <div className="row g-4">

                {animals.map((animal) => (
                    <HomeAnimalCard
                        key={animal.id}
                        imageUrl={animal.cover_image}
                        badgeText={animal.status}
                        badgeClass="bg-success"
                        name={animal.name}
                        details={animal.breed + " · " + animal.size}
                        org={"Shelter " + animal.shelter_id}
                    />
                ))}

            </div>
        </div>
    );
};