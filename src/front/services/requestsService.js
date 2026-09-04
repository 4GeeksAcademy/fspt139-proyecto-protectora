const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const getRequests = (
  { ordenarPor, orden, pagina, perPage = 5 },
  filters = {},
) => {
  let url =
    backendUrl +
    "/api/requests?sort_by=" +
    ordenarPor +
    "&dir=" +
    orden +
    "&page=" +
    pagina +
    "&per_page=" +
    perPage;

  const { nombre, tipoShelter, tipoAnimal } = filters;

  if (nombre && nombre.trim() !== "") {
    url = url + "&name=" + nombre;
  }
  if (tipoShelter) {
    url = url + "&shelter_type_id=" + tipoShelter;
  }
  if (tipoAnimal) {
    url = url + "&animal_type_id=" + tipoAnimal;
  }

  return fetch(url).then((response) => response.json());
};
