const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const getAnimals = (
  { ordenarPor, orden, pagina, perPage = 5 },
  filters = {},
) => {
  let url =
    backendUrl +
    "/api/animals?sort_by=" +
    ordenarPor +
    "&dir=" +
    orden +
    "&page=" +
    pagina +
    "&per_page=" +
    perPage;

  const { nombre, raza } = filters;

  if (nombre && nombre.trim() !== "") {
    url = url + "&name=" + nombre;
  }
  if (raza && raza.trim() !== "") {
    url = url + "&breed=" + raza;
  }

  return fetch(url).then((response) => response.json());
};
