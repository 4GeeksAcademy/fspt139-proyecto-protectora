import { Link } from "react-router-dom";

export const CategoryCard = ({ bgClass, title, description, link, onSelect, activa = false, cta = "Ver más →" }) => {

    return (
        <div className="col-12 col-sm-6 col-md-3">
            <div className={`card h-100 shadow-sm ${activa ? "border border-success" : "border-0"}`}>
                <div className="card-body d-flex flex-column">

                    <div className={`rounded-circle ${bgClass}`} style={{ width: "20px", height: "20px" }}></div>

                    <h5 className="fw-bold mt-3">{title}</h5>
                    <p className="text-secondary small mb-2 flex-grow-1">{description}</p>

                    {onSelect ? (
                        <button
                            type="button"
                            onClick={onSelect}
                            className="btn btn-link p-0 text-success fw-bold text-decoration-none small text-start stretched-link"
                        >
                            {cta}
                        </button>
                    ) : (
                        <Link to={link} className="text-success fw-bold text-decoration-none small stretched-link">
                            {cta}
                        </Link>
                    )}

                </div>
            </div>
        </div>
    );
};