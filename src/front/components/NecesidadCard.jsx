export const NecesidadCard = ({ imageClass, title, org, badgeText, badgeClass, current, total, unit, note }) => {

    const percent = (current / total) * 100;

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

                    <h5 className="fw-bold">{title}</h5>
                    <p className="text-secondary small mb-3">{org}</p>

                    <p className="mb-1">
                        <strong>{current}</strong> / {total} {unit}
                    </p>

                    <div className="progress mb-3" style={{ height: "8px" }}>
                        <div className="progress-bar bg-success" style={{ width: `${percent}%` }}></div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mt-auto">
                        <small className="text-secondary">{note}</small>
                        <button className="btn btn-success btn-sm">Help</button>
                    </div>

                </div>
            </div>
        </div>
    );
};