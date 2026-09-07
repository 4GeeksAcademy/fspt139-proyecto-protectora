import {Link} from "react-router-dom";

export const NavbarColaborador = () => {
    return (
        <>
            <li><Link to="/colaborador" className="dropdown-item">Actividad</Link></li>
            <li><Link to="/colaborador/perfil" className="dropdown-item">Perfil</Link></li>

        </>
    )

}
