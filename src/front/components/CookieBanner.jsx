import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export const CookieBanner = () => {
    const [mostrar, setMostrar] = useState(false);

    useEffect(() => {
        const consentimiento = localStorage.getItem("cookieConsent");
        if (!consentimiento) {
            setMostrar(true);
        }
    }, []);

    const aceptarCookies = () => {
        localStorage.setItem("cookieConsent", "accepted");
        setMostrar(false);
    };

    const rechazarCookies = () => {
        localStorage.setItem("cookieConsent", "declined");
        setMostrar(false);
    };

    if (!mostrar) return null;

    return (
        <div className="fixed-bottom bg-dark text-white p-3 shadow-lg" style={{ zIndex: 1050, borderTop: "3px solid #138f4d" }}>
            <div className="container d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
                <p className="mb-0 small text-light text-center text-md-start">
                    Utilizamos cookies propias y de terceros para garantizar el correcto funcionamiento del sitio y mejorar tu experiencia de navegación. Puedes aceptar todas las cookies o rechazarlas.{" "}
                    <Link to="/terminos-y-privacidad#cookies" className="text-white fw-semibold">Más información</Link>
                </p>
                <div className="d-flex gap-2 flex-shrink-0">
                    <button className="btn btn-outline-light btn-sm px-3" onClick={rechazarCookies}>
                        Rechazar
                    </button>
                    <button className="btn btn-success btn-sm px-3" onClick={aceptarCookies}>
                        Aceptar todas
                    </button>
                </div>
            </div>
        </div>
    );
};