import { useEffect, useState } from "react";
import { getAnimals } from "../services/animalsService.js";

export const TestAnimalFilters = () => {

	const [animals, setAnimals] = useState([]);
	const [error, setError] = useState(null);

	const [nombre, setNombre] = useState("");
	const [raza, setRaza] = useState("");
	const [ordenarPor, setOrdenarPor] = useState("name");
	const [orden, setOrden] = useState("asc");
	const [pagina, setPagina] = useState(1);
	const [totalPaginas, setTotalPaginas] = useState(1);

	useEffect(() => {
		getAnimals({ ordenarPor, orden, pagina }, { nombre, raza })
			.then((data) => {
				setAnimals(data.items);
				setTotalPaginas(data.total_pages);
			})
			.catch((err) => setError(err.message));
	}, [nombre, raza, ordenarPor, orden, pagina]);

	const hayAnterior = pagina > 1;
	const haySiguiente = pagina < totalPaginas;

	return (
		<div>
			<h1>Test Animal Filters</h1>
			<p>Listado devuelto por /api/animals</p>

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
				placeholder="Buscar por raza..."
				value={raza}
				onChange={(e) => {
					setRaza(e.target.value);
					setPagina(1);
				}}
			/>


			<select value={ordenarPor} onChange={(e) => setOrdenarPor(e.target.value)}>
				<option value="name">Nombre</option>
				<option value="breed">Raza</option>
				<option value="created_at">Fecha de alta</option>
			</select>

			<select value={orden} onChange={(e) => setOrden(e.target.value)}>
				<option value="asc">Ascendente</option>
				<option value="desc">Descendente</option>
			</select>

			<br />
			<br />

			{error && <p className="text-danger">{error}</p>}

			{animals.map((animal) => (
				<div key={animal.id}>
					<h2>{animal.name}</h2>
					<p>{animal.story}</p>
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
