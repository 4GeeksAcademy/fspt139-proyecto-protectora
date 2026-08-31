import { Link } from "react-router-dom";
export const Navbar = () => {

	return (
		<nav className="navbar navbar-light bg-white shadow-sm">
			<div className="container d-flex justify-content-between align-items-center">


				<Link to="/" className="navbar-brand fw-bold text-success">
					RedProtectoras
				</Link>

				<div className="d-flex gap-3">
					<Link to="/" className="nav-link">Home</Link>
					<Link to="/necesidades" className="nav-link">Needs</Link>
					<Link to="/adoptar" className="nav-link">Adopt</Link>
					<Link to="/protectoras" className="nav-link">Shelters</Link>
					<Link to="/ayuda" className="nav-link">Help</Link>
				</div>

				<div className="d-flex gap-2">
					<button className="btn btn-outline-secondary btn-sm">Log in</button>
					<button className="btn btn-success btn-sm">Sign up</button>
				</div>

			</div>
		</nav>
	);
};