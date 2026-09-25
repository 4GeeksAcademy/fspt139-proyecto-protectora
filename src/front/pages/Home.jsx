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

const imagenesAnimales = [
    "https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1559190394-df5a28aab5c5?auto=format&fit=crop&w=800&q=80",


    "https://images.unsplash.com/photo-1513360371669-4adf3dd7df8?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1568393691622-c7ba131d63b4?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=800&q=80",


    "https://images.unsplash.com/photo-1591160690555-5debfba289f0?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1608848461950-0fe51dfc41cb?auto=format&fit=crop&w=800&q=80",

    "https://images.unsplash.com/photo-1577023311546-cdc07a8454d9?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1553882809-a4f57e59501d?auto=format&fit=crop&w=800&q=80"
];

const efectosVisuales = [
    { transform: "scale(1)" },
    { transform: "scale(1.04)" },
    { transform: "scale(0.97)" },
    { transform: "scale(1.02) rotate(0.5deg)" },
    { transform: "scale(1.03) rotate(-0.5deg)" }
];

export const Home = () => {
    const { store } = useGlobalReducer();
    const esProtectora = store.user?.rol === "shelter_admin";
    const esColaborador = store.user?.rol === "volunteer";

    const [insights, setInsights] = useState(null);
    const [protectora, setProtectora] = useState(null);

    const [indiceImagen, setIndiceImagen] = useState(() => Math.floor(Math.random() * imagenesAnimales.length));
    const [indiceEfecto, setIndiceEfecto] = useState(() => Math.floor(Math.random() * efectosVisuales.length));
    const [opacidad, setOpacidad] = useState(1);
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

    useEffect(() => {
        const intervalo = setInterval(() => {
            setOpacidad(0);
            setTimeout(() => {
                setIndiceImagen((prevIndex) => (prevIndex + 1) % imagenesAnimales.length);
                setIndiceEfecto((prevEfecto) => (prevEfecto + 1) % efectosVisuales.length);
                setOpacidad(1);
            }, 600);
        }, 7000);

        return () => clearInterval(intervalo);
    }, []);

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
                                            No piden un donativo.
                                            <br />
                                            <span className="text-success">Piden lo que necesitan.</span>
                                        </h1>

                                        <p className="text-secondary mt-3 mb-4">
                                            Las protectoras publican exactamente qué necesitan, cuánto y para cuándo.
                                            Tú eliges la parte que puedes cubrir y ves cómo se completa.
                                        </p>
                                    </>
                                )}

                                <div className="d-flex flex-wrap justify-content-center justify-content-md-start gap-2">
                                    <Link to="/necesidades" className="btn btn-success btn-lg">Ver necesidades</Link>
                                    <Link to="/adoptar" className="btn btn-outline-success btn-lg">Ver animales en adopción</Link>
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
                            src={imagenesAnimales[indiceImagen]}
                            alt="Animales en adopción"
                            className="img-fluid rounded-4 shadow-sm"
                            style={{
                                height: "340px",
                                width: "100%",
                                objectFit: "cover",
                                transition: "all 0.6s ease-in-out",
                                opacity: opacidad,
                                ...efectosVisuales[indiceEfecto]
                            }}
                        />
                    </div>
                </div>
            </div>

            {esProtectora ? (
                protectora && <ResumenProtectora protectora={protectora} />
            ) : (
                <>
                    <div className="row text-center g-3 mb-5">
                        <Statscard number={insights ? insights.needs_open : 0} label="Necesidades abiertas" color="#138f4d" />
                        <Statscard number={insights ? insights.animals_for_adoption : 0} label="Animales en adopción" color="#F0946A" />
                        <Statscard number={insights ? insights.registered_shelters : 0} label="Protectoras registradas" color="#E8B04B" />
                        <Statscard number={insights ? insights.collaborations_closed : 0} label="Colaboraciones completadas" color="#E0756B" />
                    </div>

                    {insights && <NecesidadesDestacadas needs={insights.open_needs} />}

                    {insights && <BuscanCasa animals={insights.open_adoptions} />}
                </>
            )}
        </div>
    );
};