import { getToken } from "./authServices.js";

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




// Lista solo las necesidades de la protectora del usuario logueado
export const getShelterNecesidades = async (
  { ordenarPor = "created_at", orden = "desc", pagina = 1, perPage = 12 } = {},
  filters = {},
) => {
  const params = new URLSearchParams({
    sort_by: ordenarPor,
    dir: orden,
    page: pagina,
    per_page: perPage,
  });

  const { nombre, request_type_id, status } = filters;

  if (nombre && nombre.trim() !== "") params.set("name", nombre.trim());
  if (request_type_id) params.set("request_type_id", request_type_id);
  if (status) params.set("status", status);

  const response = await fetch(`${backendUrl}/api/shelter/requests?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || data.message || "No se han podido obtener tus necesidades");
  }
  return response.json();
};

// Trae una necesidad de la protectora del usuario logueado (para precargar el formulario de edición)
export const getShelterNecesidad = async (request_id) => {
  const response = await fetch(`${backendUrl}/api/shelter/requests/${request_id}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || data.message || "No se ha podido cargar la necesidad");
  }
  return response.json();
};

// Genera el request_id y hace PUT sobre ese recurso, aprovechamos el uuid
export const crearNecesidad = async (necesidad) => {
  const request_id = necesidad.request_id || crypto.randomUUID();

  const response = await fetch(`${backendUrl}/api/shelter/requests/${request_id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ ...necesidad, request_id }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || data.message || "No se ha podido publicar la necesidad");
  }

  const data = await response.json();
  const location = response.headers.get("Location") || `/panel/necesidades`;

  return { ...data, request_id, location };
};

// Sube una foto o vídeo a la necesidad recien creada o editada
export const uploadNecesidadMedia = async (request_id, file, isCover) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("is_cover", isCover ? "true" : "false");

  const response = await fetch(`${backendUrl}/api/shelter/requests/${request_id}/media`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || data.message || "No se ha podido subir el archivo");
  }
  return response.json();
};

// elimina una foto o vídeo de la necesidad
export const deleteNecesidadMedia = async (request_id, media_id) => {
  const response = await fetch(`${backendUrl}/api/shelter/requests/${request_id}/media/${media_id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || data.message || "No se ha podido eliminar el archivo");
  }
  return response.json();
};

//define como portada una foto o vídeo de la necesidad
export const setNecesidadMediaCover = async (request_id, media_id) => {
  const response = await fetch(`${backendUrl}/api/shelter/requests/${request_id}/media/${media_id}/cover`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || data.message || "No se ha podido marcar como portada");
  }
  return response.json();
};
