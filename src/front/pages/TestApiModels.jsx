import { useEffect, useState } from "react";

export const TestApiModels = () => {

	const [shelters, setShelters] = useState([]);
	const [error, setError] = useState(null);

	useEffect(() => {
		const backendUrl = import.meta.env.VITE_BACKEND_URL;

		fetch(backendUrl + "/api/shelters")
			.then((response) => response.json())
			.then((data) => setShelters(data))
			.catch((err) => setError(err.message));
	}, []);

	return (
		<div>
			<h1>Test Api Models</h1>
			<p>Listado devuelto por /api/shelters</p>
			<br />

			{error && <p className="text-danger">{error}</p>}

			{shelters.map((shelter) => (
				<div key={shelter.id}>
					<h2>{shelter.name}</h2>
					<p>{shelter.description}</p>
					<br />
				</div>
			))}
		</div>
	);
};
