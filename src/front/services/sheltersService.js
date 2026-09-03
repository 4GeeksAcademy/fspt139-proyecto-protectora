const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const getShelters = (
  { ordenarPor, orden, pagina, perPage = 5 },
  filters = {},
) => {
  let url =
    backendUrl +
    "/api/shelters?sort_by=" +
    ordenarPor +
    "&dir=" +
    orden +
    "&page=" +
    pagina +
    "&per_page=" +
    perPage;

  const { nombre, phone } = filters;

  if (nombre && nombre.trim() !== "") {
    url = url + "&name=" + nombre;
  }
  if (phone && phone.trim() !== "") {
    url = url + "&phone=" + phone;
  }

  return fetch(url).then((response) => response.json());
}
