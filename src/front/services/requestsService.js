import { getToken } from "./authServices.js";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// tablon publico de necesidades (no requiere sesion)
export const getRequests = async (
  { ordenarPor = "created_at", orden = "desc", pagina = 1, perPage = 12 } = {},
  filters = {},
) => {
  const params = new URLSearchParams({
    sort_by: ordenarPor,
    dir: orden,
    page: pagina,
    per_page: perPage,
  });

  const { nombre, tipoShelter, tipoAnimal, requestTypeId, shelterId, animalId } = filters;

  if (nombre && nombre.trim() !== "") params.set("name", nombre.trim());
  if (tipoShelter) params.set("shelter_type_id", tipoShelter);
  if (tipoAnimal) params.set("animal_type_id", tipoAnimal);
  if (requestTypeId) params.set("request_type_id", requestTypeId);
  if (shelterId) params.set("shelter_id", shelterId);
  if (animalId) params.set("animal_id", animalId);

  const response = await fetch(`${backendUrl}/api/requests?${params.toString()}`);

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || data.message || "No se han podido obtener las necesidades");
  }
  return response.json();
};


// ficha publica de una necesidad por su UUID (no requiere sesion)
export const getRequestById = async (request_id) => {
  const response = await fetch(`${backendUrl}/api/requests/${request_id}`);

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const error = new Error(data.error || data.message || "No se ha podido cargar la necesidad");
    error.status = response.status;
    throw error;
  }
  return response.json();
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
  const location = response.headers.get("Location") || `/panel/necesidades/${request_id}`;

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

// envia la colaboracion del usuario logueado con una necesidad (cantidad o detalles de como puede ayudar)
export const crearColaboracion = async (request_id, { amount, details } = {}) => {
  const response = await fetch(`${backendUrl}/api/requests/${request_id}/user-requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ amount, details }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || data.message || "No se ha podido enviar tu colaboración");
  }
  return response.json();
};

// listado (paginado) de las contribuciones de una necesidad propia de la protectora
export const getShelterUserRequests = async (request_id, { pagina = 1, perPage = 20 } = {}) => {
  const params = new URLSearchParams({ page: pagina, per_page: perPage });

  const response = await fetch(`${backendUrl}/api/shelter/requests/${request_id}/user-requests?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || data.message || "No se han podido obtener las contribuciones");
  }
  return response.json();
};

// responde a una contribucion de una en una y deja tambien una valoracion
export const responderContribucion = async (user_request_id, { shelter_answer, review } = {}) => {
  const response = await fetch(`${backendUrl}/api/shelter/user-requests/${user_request_id}/answer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ shelter_answer, review }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || data.message || "No se ha podido enviar la respuesta");
  }
  return response.json();
};

// responde en bloque (mismo mensaje) a varias contribuciones seleccionadas
export const responderContribucionesEnBloque = async (user_request_ids, shelter_answer) => {
  const response = await fetch(`${backendUrl}/api/shelter/user-requests/answer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ user_request_ids, shelter_answer }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || data.message || "No se han podido enviar las respuestas");
  }
  return response.json();
};