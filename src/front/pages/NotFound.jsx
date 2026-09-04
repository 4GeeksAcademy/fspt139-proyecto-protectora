import { Link } from "react-router-dom";

export const NotFound = () => {
    return (
        <div className="container py-5 text-center">
            <h1 className="fw-bold mb-2 text-primary">404</h1>
            <p className="mb-4 text-secondary">
                La página que buscas no existe o se ha movido.
            </p>
            <Link to="/" className="btn btn-success">Volver al inicio</Link>
        </div>
    );
};
