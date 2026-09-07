import {Link} from "react-router-dom";


export const NavbarProtectora = () => {
    return (
        <>
            <li><Link to="/panel" className="dropdown-item">Panel</Link></li>
            <li><Link to="/panel/necesidades" className="dropdown-item">Necesidades</Link></li>
            <li><Link to="/panel/animales" className="dropdown-item">Animales</Link></li>
            <li><Link to="/panel/adopciones" className="dropdown-item">Adopciones</Link></li>
            <li><Link to="/panel/perfil" className="dropdown-item">Perfil</Link></li>
        </>

    )
}