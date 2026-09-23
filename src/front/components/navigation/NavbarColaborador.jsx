import {Link} from "react-router-dom";
import { closeCollapse, NAVBAR_COLLAPSE_ID } from "./closeCollapse";

const closeMenu = () => closeCollapse(NAVBAR_COLLAPSE_ID);

export const NavbarColaborador = () => {
    return (
        <>
            <li><Link onClick={closeMenu} to="/colaborador" className="dropdown-item">Actividad</Link></li>
            <li><Link onClick={closeMenu} to="/colaborador/perfil" className="dropdown-item">Perfil</Link></li>

        </>
    )

}
