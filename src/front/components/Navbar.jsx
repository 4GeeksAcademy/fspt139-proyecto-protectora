import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import useGlobalReducer from "../hooks/useGlobalReducer";
import {UserAvatar} from "./UserAvatar";

export const Navbar = () => {
    const { store } = useGlobalReducer();
    const user = store.user;

    return (
        <nav className="navbar navbar-light bg-white shadow-sm">
            <div className="container d-flex justify-content-between align-items-center">

                <Link to="/" className="navbar-brand d-flex align-items-center gap-2">
                    <Logo />
                </Link>

                <div className="d-flex gap-3">
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/necesidades" className="nav-link">Needs</Link>
                    <Link to="/adoptar" className="nav-link">Adopt</Link>
                    <Link to="/protectoras" className="nav-link">Shelters</Link>
                    <Link to="/ayuda" className="nav-link">Help</Link>
                </div>

                {user ? (
                    <div className="dropdown">
                        <button
                            type="button"
                            className="btn btn-light border rounded-pill d-flex align-items-center gap-2 py-1 ps-3 pe-2"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                        >
                            <UserAvatar user={user} />
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end">
                            <li>
                                <Link className="dropdown-item" to="/logout">Salir</Link>
                            </li>
                        </ul>
                    </div>
                ) : (
                    <div className="d-flex gap-2">
                        <Link to="/login" className="btn btn-outline-secondary btn-sm">Log in</Link>
                        <button className="btn btn-success btn-sm">Sign up</button>
                    </div>
                )}

            </div>
        </nav>
    );
};