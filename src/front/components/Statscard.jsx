export const Statscard = ({ number, label, color }) => {

    return (
        <div className="col-6 col-md-3">
            <div className="border rounded-3 p-3 d-flex align-items-center justify-content-center gap-3">

                <div
                    className="rounded-2"
                    style={{ width: "12px", height: "12px", backgroundColor: color }}
                ></div>

                <div>
                    <div className="fs-3 fw-bold">{number}</div>
                    <div className="text-secondary small">{label}</div>
                </div>

            </div>
        </div>
    );
};