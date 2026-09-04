import { Link } from "react-router-dom";
import { Logo } from "./Logo";

export const NavbarSimple = () => {
    return (
        <nav className="navbar navbar-light bg-white shadow-sm">
            <div className="container d-flex justify-content-between align-items-center">

                <Link to="/" className="navbar-brand d-flex align-items-center gap-2">
                    <Logo />
                </Link>


            </div>
        </nav>
    );
};