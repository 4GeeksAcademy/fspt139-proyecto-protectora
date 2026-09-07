import { Link } from "react-router-dom";
import { Logo } from "../Logo";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { UserAvatar } from "../UserAvatar";
import { closeCollapse } from "./closeCollapse";

import {NavbarProtectora} from "./NavbarProtectora";
import {NavbarColaborador} from "./NavbarColaborador";

const COLLAPSE_ID = "navbarGuestCollapse";

export const Navbar = () => {
    const { store } = useGlobalReducer();
    const user = store.user;
    const closeMenu = () => closeCollapse(COLLAPSE_ID);

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
            <div className="container">
                <Link to="/" className="navbar-brand d-flex align-items-center gap-2">
                    <Logo />
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#${COLLAPSE_ID}`}
                    aria-controls={COLLAPSE_ID}
                    aria-expanded="false"
                    aria-label="Menú"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id={COLLAPSE_ID}>

                    {/*///////////////////////////////////*/}
                    {/*// NAVEGACION PRINCIPAL DE LA WEB */}
                    {/*///////////////////////////////////*/}
                    <div className="navbar-nav mx-lg-auto gap-lg-2">
                        <Link onClick={closeMenu} to="/" className="nav-link">Home</Link>
                        <Link onClick={closeMenu} to="/necesidades" className="nav-link">Needs</Link>
                        <Link onClick={closeMenu} to="/adoptar" className="nav-link">Adopt</Link>
                        <Link onClick={closeMenu} to="/protectoras" className="nav-link">Shelters</Link>
                        <Link onClick={closeMenu} to="/ayuda" className="nav-link">Help</Link>
                    </div>
                    {/*///////////////////////////////////*/}
                    <hr className="d-lg-none my-2" />

                    {user ? (
                        ///////////////////////////////////
                        // MENU DE USUARIO IDENTIFICADO
                        ///////////////////////////////////
                        <div className="dropdown mt-2 mt-lg-0 d-flex justify-content-end">
                            <button
                                type="button"
                                className="btn btn-light border rounded-pill d-flex align-items-center gap-2 py-1 ps-3 pe-2 w-auto w-lg-auto justify-content-end"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                <UserAvatar user={user} />
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end">

                                { user?.rol === "shelter_admin" ? (<NavbarProtectora />): <NavbarColaborador /> }
                                <li>
                                    <Link className="dropdown-item text-end" to="/logout">Salir</Link>
                                </li>
                            </ul>
                        </div>
                        ///////////////////////////////////

                    ) : (
                        ///////////////////////////////////
                        // MENU LOGIN /SIGNUP
                        ///////////////////////////////////
                        <div className="d-flex flex-column flex-lg-row gap-2 mt-2 mt-lg-0">
                            <Link
                                onClick={closeMenu}
                                to="/login"
                                className="btn btn-outline-secondary btn-sm"
                            >
                                Log in
                            </Link>
                            <button className="btn btn-success btn-sm">Sign up</button>
                        </div>
                        ///////////////////////////////////
                    )}
                </div>
            </div>
        </nav>
    );
};
