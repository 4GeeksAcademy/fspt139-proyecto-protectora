import { Link } from "react-router-dom";

export const CategoryCard = ({ bgClass, title, description, link }) => {

    return (
        <div className="col-12 col-sm-6 col-md-3">
            <div className="card h-100 shadow-sm border-0">
                <div className="card-body">

                    <div className={`rounded-circle ${bgClass}`} style={{ width: "20px", height: "20px" }}></div>

                    <h5 className="fw-bold mt-3">{title}</h5>
                    <p className="text-secondary small mb-2">{description}</p>
                    <Link to={link} className="text-success fw-bold text-decoration-none small">
                        See more →
                    </Link>

                </div>
            </div>
        </div>
    );
};