export const ContributeProfile = () => {

    return (
        <div className="container py-4">

            <div className="card shadow-sm border-0">

                <div className="position-relative">
                    <div className="card-placeholder img-food" style={{ height: "220px" }}></div>
                    <div className="badge bg-warning text-dark position-absolute top-0 start-0 m-2">
                        3 days left
                    </div>
                </div>

                <div className="card-body p-4">

                    <h2 className="fw-bold mb-1">Puppy food</h2>
                    <p className="text-secondary mb-4">Protectora Huellas</p>

                    <p className="mb-1">
                        <strong>12</strong> / 20 kg
                    </p>

                    <div className="progress mb-4" style={{ height: "8px" }}>
                        <div className="progress-bar bg-success" style={{ width: "60%" }}></div>
                    </div>

                    <p className="text-secondary mb-4">
                        The shelter needs puppy food for the new litter that just arrived.
                        Pick up is available at the shelter, Monday to Saturday.
                    </p>

                    <button className="btn btn-success">Confirm collaboration</button>

                </div>
            </div>

        </div>
    );
};