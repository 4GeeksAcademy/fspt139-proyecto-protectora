import {Link} from "react-router-dom";
import { closeCollapse, NAVBAR_COLLAPSE_ID } from "./closeCollapse";

const closeMenu = () => closeCollapse(NAVBAR_COLLAPSE_ID);

export const NavbarProtectora = () => {
    return (
        <>
            <li><Link onClick={closeMenu} to="/panel/necesidades" className="dropdown-item">Necesidades</Link></li>
            <li><Link onClick={closeMenu} to="/panel/animales" className="dropdown-item">Animales</Link></li>
            <li><Link onClick={closeMenu} to="/panel/adopciones" className="dropdown-item">Adopciones</Link></li>
            <li><Link onClick={closeMenu} to="/panel/perfil" className="dropdown-item">Perfil</Link></li>
        </>

    )
}