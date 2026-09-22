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
                            Shelters post what they need. You choose what to cover.
                        </p>
                        <p className="text-dark-emphasis">
                            © 2026 RedProtectora · 4Geeks Academy
                        </p>
                    </div>

                    <div className="col-6 col-md-3">
                        <h6 className="fw-bold mb-3">Platform</h6>
                        <ul className="list-unstyled">
                            <li className="mb-2"><Link to="/" className="text-dark-emphasis text-decoration-none">Home</Link></li>
                            <li className="mb-2"><Link to="/necesidades" className="text-dark-emphasis text-decoration-none">Needs</Link></li>
                            <li className="mb-2"><Link to="/adoptar" className="text-dark-emphasis text-decoration-none">Adopt</Link></li>
                            <li className="mb-2"><Link to="/protectoras" className="text-dark-emphasis text-decoration-none">Shelters</Link></li>
                        </ul>
                    </div>

                    <div className="col-6 col-md-3">
                        <h6 className="fw-bold mb-3">Account</h6>
                        <ul className="list-unstyled">
                            <li className="mb-2"><Link to="/login" className="text-dark-emphasis text-decoration-none">Log in</Link></li>
                            <li className="mb-2"><Link to="/signup" className="text-dark-emphasis text-decoration-none">Sign up</Link></li>
                            <li className="mb-2"><Link to="/terminos-y-privacidad" className="text-dark-emphasis text-decoration-none">Terms of Use and Privacy Policy</Link></li>
                            <li className="mb-2"><Link to="/ayuda" className="text-dark-emphasis text-decoration-none">Help</Link></li>
                        </ul>
                    </div>

                </div>
            </div>
        </footer>
    );
};