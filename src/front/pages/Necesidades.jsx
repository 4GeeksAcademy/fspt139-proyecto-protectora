import React from "react";
import { NecesidadCard } from "../components/NecesidadCard";

export const Necesidades = () => {

    return (
        <div className="container py-4">

            <p className="text-success fw-bold text-uppercase small mb-1">Public board</p>
            <h2 className="fw-bold mb-1">Open needs</h2>
            <p className="text-secondary mb-4">27 needs from 6 shelters, updated today</p>

            <div className="d-flex flex-wrap gap-2 align-items-center mb-4">

                <div className="d-flex gap-2 flex-wrap">
                    <button className="btn btn-success btn-sm rounded-pill">All</button>
                    <button className="btn btn-outline-secondary btn-sm rounded-pill">Financial</button>
                    <button className="btn btn-outline-secondary btn-sm rounded-pill">Supplies</button>
                    <button className="btn btn-outline-secondary btn-sm rounded-pill">Volunteering</button>
                    <button className="btn btn-outline-secondary btn-sm rounded-pill">Other</button>
                    <button className="btn btn-outline-secondary btn-sm rounded-pill">Any shelter ▾</button>
                </div>

                <input
                    type="text"
                    className="form-control form-control-sm rounded-pill w-auto ms-auto"
                    placeholder="Search need..."
                />

            </div>

            <div className="row g-4">

                <NecesidadCard
                    imageClass="img-vet"
                    title="Nala's surgery fund"
                    org="Protectora Huellas"
                    badgeText="Urgent"
                    badgeClass="bg-danger"
                    current={340}
                    total={600}
                    unit="€"
                    note="Surgery Sept 3"
                />

                <NecesidadCard
                    imageClass="img-food"
                    title="Puppy food"
                    org="Protectora Huellas"
                    badgeText="3 days left"
                    badgeClass="bg-warning text-dark"
                    current={12}
                    total={20}
                    unit="kg"
                    note="Pick up at the shelter"
                />

                <NecesidadCard
                    imageClass="img-car"
                    title="Vet transport"
                    org="Protectora Huellas"
                    badgeText="Urgent"
                    badgeClass="bg-danger"
                    current={0}
                    total={1}
                    unit="trip"
                    note="A car is needed, Thursday"
                />

                <NecesidadCard
                    imageClass="img-blanket"
                    title="Blankets and towels"
                    org="Protectora Huellas"
                    badgeText="Covered"
                    badgeClass="bg-success"
                    current={4}
                    total={4}
                    unit="blankets"
                    note="Closed on August 14"
                />

                <NecesidadCard
                    imageClass="img-social"
                    title="Social media outreach"
                    org="Colonia Felina Vallecas"
                    badgeText="7 days left"
                    badgeClass="bg-warning text-dark"
                    current={2}
                    total={5}
                    unit="posts"
                    note="Photos and animal bios"
                />

                <NecesidadCard
                    imageClass="img-walk"
                    title="Weekend walks"
                    org="Colonia Felina Vallecas"
                    badgeText="5 days left"
                    badgeClass="bg-warning text-dark"
                    current={3}
                    total={6}
                    unit="shifts"
                    note="Saturdays and Sundays"
                />

                <NecesidadCard
                    imageClass="img-pills"
                    title="Trufa's medication"
                    org="Gatos del Sur"
                    badgeText="Urgent"
                    badgeClass="bg-danger"
                    current={80}
                    total={120}
                    unit="€"
                    note="2-week treatment"
                />

                <NecesidadCard
                    imageClass="img-kitten"
                    title="Cat litter"
                    org="Gatos del Sur"
                    badgeText="10 days left"
                    badgeClass="bg-warning text-dark"
                    current={18}
                    total={30}
                    unit="kg"
                    note="Pick up locally"
                />

                <NecesidadCard
                    imageClass="img-puppies"
                    title="Temporary foster for litter"
                    org="Refugio Els Amics"
                    badgeText="Urgent"
                    badgeClass="bg-danger"
                    current={0}
                    total={1}
                    unit="home"
                    note="4 puppies, 2 weeks old"
                />

            </div>

            <div className="text-center mt-4">
                <button className="btn btn-outline-success">Load more needs</button>
            </div>

        </div>
    );
};