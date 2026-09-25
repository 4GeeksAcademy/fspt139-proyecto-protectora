import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BuscanCasa } from "../components/BuscanCasa";
import { NecesidadesDestacadas } from "../components/NecesidadesDestacadas";
import { Statscard } from "../components/Statscard";
import { ResumenProtectora } from "../components/protectora/ResumenProtectora";
import { getHomeInsights } from "../services/insightsService";
import { getShelterProfile } from "../services/sheltersService";
import { usePageTitle } from "../hooks/usePageTitle";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Home = () => {

    const { store } = useGlobalReducer();
    const esProtectora = store.user?.rol === "shelter_admin";
    const esColaborador = store.user?.rol === "volunteer";

    const [insights, setInsights] = useState(null);
    const [protectora, setProtectora] = useState(null);

    usePageTitle();

    useEffect(() => {
        if (esProtectora) return;

        getHomeInsights()
            .then((data) => setInsights(data))
            .catch((error) => console.log(error));
    }, [esProtectora]);

    useEffect(() => {
        if (!esProtectora) return;

        getShelterProfile()
            .then((datos) => setProtectora(datos))
            .catch((error) => console.log(error));
    }, [esProtectora]);

    return (
        <div className="container py-4">

            <div className="bg-success bg-opacity-10 rounded-4 p-4 p-md-5 mb-5">

                <div className="row align-items-center g-4">

                    <div className="col-12 col-md-6 text-center text-md-start">

                        {esProtectora ? (
                            <>
                                <h1 className="fw-bold display-5 lh-sm mb-0">
                                    Hola,
                                    <br />
                                    <span className="text-success">{protectora?.name}</span>
                                </h1>

                                <p className="text-secondary mt-3 mb-4">
                                    Gracias por cuidar de ellos cada día. Publicad lo que
                                    necesitáis y la comunidad se encarga del resto.
                                </p>

                                <div className="d-flex flex-wrap justify-content-center justify-content-md-start gap-2">
                                    <Link to="/panel/necesidades/create" className="btn btn-success btn-lg">Publicar necesidad</Link>
                                    <Link to="/panel/animales/create" className="btn btn-outline-success btn-lg">Publicar animal</Link>
                                    <Link to="/panel/animales" className="btn btn-outline-success btn-lg">Ver mis animales</Link>
                                </div>
                            </>
                        ) : (
                            <>

                                {esColaborador ? (
                                    <>
                                        <h1 className="fw-bold display-5 lh-sm mb-0">
                                            Hola,
                                            <br />
                                            <span className="text-success">{store.user.name}</span>
                                        </h1>

                                        <p className="text-secondary mt-3 mb-4">
                                            Gracias por tu tiempo y por querer ayudar. Cada cosa que aportas
                                            llega directa a los animales que la necesitan.
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <h1 className="fw-bold display-5 lh-sm mb-0">
                                            They don't ask for money.
                                            <br />
                                            <span className="text-success">They ask for specific things.</span>
                                        </h1>

                                        <p className="text-secondary mt-3 mb-4">
                                            Shelters post exactly what they need, how much, and by when.
                                            You choose the part you can cover and see it get filled.
                                        </p>
                                    </>
                                )}

                                <div className="d-flex flex-wrap justify-content-center justify-content-md-start gap-2">
                                    <Link to="/necesidades" className="btn btn-success btn-lg">See what's needed</Link>
                                    <Link to="/adoptar" className="btn btn-outline-success btn-lg">See animals in adoption</Link>
                                </div>

                                {esColaborador && (
                                    <p className="small text-secondary mt-3 mb-0">
                                        Tus colaboraciones y solicitudes de adopción están en{" "}
                                        <Link to="/colaborador" className="text-success fw-semibold">Actividad</Link>.
                                    </p>
                                )}
                            </>
                        )}
                    </div>

                    <div className="col-12 col-md-6">
                        <img
                            src="https://placedog.net/500/400?id=10"
                            alt="Perro en adopción"
                            className="img-fluid rounded-4 w-100"
                            style={{ maxHeight: "340px", objectFit: "cover" }}
                        />
                    </div>

                </div>
            </div>

            {esProtectora ? (
                protectora && <ResumenProtectora protectora={protectora} />
            ) : (
                <>
                    <div className="row text-center g-3 mb-5">
                        <Statscard number={insights ? insights.needs_open : 0} label="Needs open" color="#138f4d" />
                        <Statscard number={insights ? insights.animals_for_adoption : 0} label="Animals for adoption" color="#F0946A" />
                        <Statscard number={insights ? insights.registered_shelters : 0} label="Registered shelters" color="#E8B04B" />
                        <Statscard number={insights ? insights.collaborations_closed : 0} label="Collaborations closed" color="#E0756B" />
                    </div>

                    {insights && <NecesidadesDestacadas needs={insights.open_needs} />}

                    {insights && <BuscanCasa animals={insights.open_adoptions} />}
                </>
            )}

        </div>
    );
};