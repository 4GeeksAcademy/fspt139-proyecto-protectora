import { useEffect, useState } from "react";
import { getShelters } from "../services/sheltersService.js";

export const TestSheltersFilters = () => {

	const [shelters, setShelters] = useState([]);
	const [error, setError] = useState(null);

	const [nombre, setNombre] = useState("");
	const [phone, setPhone] = useState("");
	const [ordenarPor, setOrdenarPor] = useState("name");
	const [orden, setOrden] = useState("asc");
	const [pagina, setPagina] = useState(1);
	const [totalPaginas, setTotalPaginas] = useState(1);

	useEffect(() => {
		getShelters({ ordenarPor, orden, pagina }, { nombre, phone })
			.then((data) => {
				setShelters(data.items);
				setTotalPaginas(data.total_pages);
			})
			.catch((err) => setError(err.message));
	}, [nombre, phone, ordenarPor, orden, pagina]);

	const hayAnterior = pagina > 1;
	const haySiguiente = pagina < totalPaginas;

	return (
		<div>
			<h1>Test Api Models</h1>
			<p>Listado devuelto por /api/shelters</p>

			<input
				type="text"
				placeholder="Buscar por nombre..."
				value={nombre}
				onChange={(e) => {
					setNombre(e.target.value);
					setPagina(1);
				}}
			/>

			<input
				type="text"
				placeholder="Buscar por phone..."
				value={phone}
				onChange={(e) => {
					setPhone(e.target.value);
					setPagina(1);
				}}
			/>


			<select value={ordenarPor} onChange={(e) => setOrdenarPor(e.target.value)}>
				<option value="name">Nombre</option>
				<option value="address">Direccion</option>
				<option value="created_at">Fecha de alta</option>
			</select>

			<select value={orden} onChange={(e) => setOrden(e.target.value)}>
				<option value="asc">Ascendente</option>
				<option value="desc">Descendente</option>
			</select>

			<br />
			<br />

			{error && <p className="text-danger">{error}</p>}

			{shelters.map((shelter) => (
				<div key={shelter.id}>
					<h2>{shelter.name}</h2>
					<p>{shelter.description}</p>
					<br />
				</div>
			))}

			<button disabled={!hayAnterior} onClick={() => setPagina(pagina - 1)}>
				Anterior
			</button>
			<span> Pagina {pagina} de {totalPaginas} </span>
			<button disabled={!haySiguiente} onClick={() => setPagina(pagina + 1)}>
				Siguiente
			</button>
		</div>
	);
};
