import { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { getRequests } from "../services/requestsService.js";


export const TestRequestsFilters = () => {

	const { store } = useGlobalReducer();

	const [requests, setRequests] = useState([]);
	const [error, setError] = useState(null);

	const [nombre, setNombre] = useState("");
	const [tipoShelter, setTipoShelter] = useState("");
	const [tipoAnimal, setTipoAnimal] = useState("");
	const [ordenarPor, setOrdenarPor] = useState("name");
	const [orden, setOrden] = useState("asc");
	const [pagina, setPagina] = useState(1);
	const [totalPaginas, setTotalPaginas] = useState(1);

	useEffect(() => {
		getRequests({ ordenarPor, orden, pagina }, { nombre, tipoShelter, tipoAnimal })
			.then((data) => {
				setRequests(data.items);
				setTotalPaginas(data.total_pages);
			})
			.catch((err) => setError(err.message));
	}, [nombre, tipoShelter, tipoAnimal, ordenarPor, orden, pagina]);

	const hayAnterior = pagina > 1;
	const haySiguiente = pagina < totalPaginas;

	return (
		<div>
			<h1>Test Requests Filters</h1>
			<p>Listado devuelto por /api/requests</p>

			<input
				type="text"
				placeholder="Buscar por nombre..."
				value={nombre}
				onChange={(e) => {
					setNombre(e.target.value);
					setPagina(1);
				}}
			/>

			<select
				value={tipoShelter}
				onChange={(e) => {
					setTipoShelter(e.target.value);
					setPagina(1);
				}}
			>
				<option value="">Todos los tipos de protectora</option>
				{store.shelterTypes.map((tipo) => (
					<option key={tipo.id} value={tipo.id}>{tipo.name}</option>
				))}
			</select>

			<select
				value={tipoAnimal}
				onChange={(e) => {
					setTipoAnimal(e.target.value);
					setPagina(1);
				}}
			>
				<option value="">Todos los tipos de animal</option>
				{store.animalTypes.map((tipo) => (
					<option key={tipo.id} value={tipo.id}>{tipo.species}</option>
				))}
			</select>


			<select value={ordenarPor} onChange={(e) => setOrdenarPor(e.target.value)}>
				<option value="name">Nombre</option>
				<option value="request_deadline">Fecha limite</option>
				<option value="amount_needed">Importe necesario</option>
				<option value="created_at">Fecha de alta</option>
			</select>

			<select value={orden} onChange={(e) => setOrden(e.target.value)}>
				<option value="asc">Ascendente</option>
				<option value="desc">Descendente</option>
			</select>

			<br />
			<br />

			{error && <p className="text-danger">{error}</p>}

			{requests.map((req) => (
				<div key={req.id}>
					<h2>{req.name}</h2>
					<p>{req.description}</p>
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
