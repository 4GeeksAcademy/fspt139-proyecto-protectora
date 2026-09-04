export const AnimalCard = ({ imageClass, badgeText, badgeClass, name, details, org }) => {

    return (
        <div className="col-12 col-md-4">
            <div className="card h-100 shadow-sm border-0">

                <div className="position-relative">
                    <div className={`card-placeholder ${imageClass}`}></div>
                    <div className={`badge ${badgeClass} position-absolute top-0 start-0 m-2`}>
                        {badgeText}
                    </div>
                </div>

                <div className="card-body d-flex flex-column">

                    <h5 className="fw-bold">{name}</h5>
                    <p className="text-secondary small mb-3">{details}</p>

                    <div className="d-flex justify-content-between align-items-center mt-auto">
                        <small className="text-secondary">{org}</small>
                        <button className="btn btn-outline-success btn-sm">See profile</button>
                    </div>

                </div>
            </div>
        </div>
    );
};