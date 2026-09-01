import { Statscard } from "../components/Statscard";
export const Home = () => {
    return (
        <div className="container py-4">

            <div className="bg-success bg-opacity-10 rounded-4 p-5 mb-5">

                <div className="row align-items-center">

                    <div className="col-12 col-md-6">

                        <div className="badge bg-white text-success rounded-pill px-3 py-2 mb-3">
                            ● 14 needs open today
                        </div>

                        <h1 className="fw-bold display-5">
                            They don't ask for money.
                            <br />
                            <div className="text-success d-inline">They ask for specific things.</div>
                        </h1>

                        <p className="text-secondary my-3">
                            Shelters post exactly what they need, how much, and by when.
                            You choose the part you can cover and see it get filled.
                        </p>

                        <div className="d-flex gap-2">
                            <button className="btn btn-success btn-lg">See what's needed</button>
                            <button className="btn btn-outline-success btn-lg">Register my shelter</button>
                        </div>
                    </div>

                    <div className="col-12 col-md-6 mt-4 mt-md-0">
                        <img
                            src="https://placedog.net/500/400?id=10"
                            alt="Dog"
                            className="img-fluid rounded-4"
                        />
                    </div>

                </div>
            </div>

            <div className="row text-center g-3 mb-5">
                <Statscard number={14} label="Needs open" color="#138f4d" />
                <Statscard number={38} label="Animals for adoption" color="#F0946A" />
                <Statscard number={6} label="Registered shelters" color="#E8B04B" />
                <Statscard number={312} label="Collaborations closed" color="#E0756B" />
            </div>

        </div>
    );
};