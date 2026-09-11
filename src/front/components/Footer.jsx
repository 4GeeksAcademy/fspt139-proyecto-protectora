import { Link } from "react-router-dom";
import { Logo } from "./Logo";

export const Footer = () => {

    return (
        <footer className="bg-dark text-light pt-5 pb-4 mt-5">
            <div className="container">

                <div className="row g-4">

                    <div className="col-12 col-md-6">
                        <div className="d-flex align-items-center gap-2 mb-2">
                            <Logo />
                        </div>
                        <p className="text-secondary">
                            Concrete help for shelters and rescues. Final bootcamp project.
                        </p>
                    </div>

                    <div className="col-6 col-md-3">
                        <h6 className="fw-bold mb-3">Platform</h6>
                        <ul className="list-unstyled">
                            <li className="mb-2"><Link to="/" className="text-secondary text-decoration-none">Home</Link></li>
                            <li className="mb-2"><Link to="/necesidades" className="text-secondary text-decoration-none">Needs</Link></li>
                            <li className="mb-2"><Link to="/adoptar" className="text-secondary text-decoration-none">Adopt</Link></li>
                            <li className="mb-2"><Link to="/protectoras" className="text-secondary text-decoration-none">Shelters</Link></li>
                        </ul>
                    </div>

                    <div className="col-6 col-md-3">
                        <h6 className="fw-bold mb-3">Account</h6>
                        <ul className="list-unstyled">
                            <li className="mb-2"><Link to="/login" className="text-secondary text-decoration-none">Log in</Link></li>
                            <li className="mb-2"><Link to="/signup" className="text-secondary text-decoration-none">Sign up</Link></li>
                            <li className="mb-2"><a href="#" className="text-secondary text-decoration-none">Terms of Use and Privacy Policy</a></li>
                            <li className="mb-2"><a href="#" className="text-secondary text-decoration-none">Help</a></li>
                        </ul>
                    </div>

                </div>
            </div>
        </footer>
    );
};