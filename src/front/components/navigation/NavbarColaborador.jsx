import {Link} from "react-router-dom";
import { closeCollapse, NAVBAR_COLLAPSE_ID } from "./closeCollapse";

const closeMenu = () => closeCollapse(NAVBAR_COLLAPSE_ID);

export const NavbarColaborador = () => {
    return (
        <>
            <li><Link onClick={closeMenu} to="/colaborador" className="dropdown-item"><i className="fa fa-chart-line me-1"></i> Actividad</Link></li>
            <li><Link onClick={closeMenu} to="/settings/perfil" className="dropdown-item"><i className="fa fa-gear me-1"></i> Ajustes</Link></li>
            <hr className="dropdown-divider" />
        </>
    )

}
