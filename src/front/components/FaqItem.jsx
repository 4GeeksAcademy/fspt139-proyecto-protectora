export const FaqItem = ({ question, answer }) => {

    return (
        <details className="card shadow-sm border-0 mb-2">
            <summary className="card-body fw-bold" style={{ cursor: "pointer" }}>
                {question}
            </summary>
            <p className="text-secondary px-3 pb-3">{answer}</p>
        </details>

    );
};