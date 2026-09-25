import { Link } from "react-router-dom";
import { Logo } from "./Logo";

export const Footer = () => {

    return (
        <footer className="bg-success-subtle text-light pt-5 pb-4 mt-5">
            <div className="container">

                <div className="row g-4">

                    <div className="col-12 col-md-6">
                        <div className="d-flex align-items-center gap-2 mb-2">
                            <Logo />
                        </div>
                        <p className="text-dark-emphasis">
                            Las protectoras publican lo que necesitan. Tú decides con qué ayudar.
                        </p>
                        <p className="text-dark-emphasis">
                            © 2026 RedProtectora · 4Geeks Academy
                        </p>
                    </div>

                    <div className="col-6 col-md-3">
                        <h6 className="fw-bold mb-3">Plataforma</h6>
                        <ul className="list-unstyled">
                            <li className="mb-2"><Link to="/" className="text-dark-emphasis text-decoration-none">Inicio</Link></li>
                            <li className="mb-2"><Link to="/necesidades" className="text-dark-emphasis text-decoration-none">Necesidades</Link></li>
                            <li className="mb-2"><Link to="/adoptar" className="text-dark-emphasis text-decoration-none">Adopción</Link></li>
                            <li className="mb-2"><Link to="/protectoras" className="text-dark-emphasis text-decoration-none">Protectoras</Link></li>
                        </ul>
                    </div>

                    <div className="col-6 col-md-3">
                        <h6 className="fw-bold mb-3">Cuenta</h6>
                        <ul className="list-unstyled">
                            <li className="mb-2"><Link to="/login" className="text-dark-emphasis text-decoration-none">Acceder</Link></li>
                            <li className="mb-2"><Link to="/signup" className="text-dark-emphasis text-decoration-none">Crear cuenta</Link></li>
                            <li className="mb-2"><Link to="/terminos-y-privacidad" className="text-dark-emphasis text-decoration-none">Términos de uso y política de privacidad</Link></li>
                            <li className="mb-2"><Link to="/ayuda" className="text-dark-emphasis text-decoration-none">Ayuda</Link></li>
                        </ul>
                    </div>

                </div>
            </div>
        </footer>
    );
};