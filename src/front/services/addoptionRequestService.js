import { getToken } from "./authServices.js";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// trae el proceso de adopcion publico de un animal (o null si nunca se abrio ninguno);
// incluye is_open_for_requests para saber si admite solicitudes ahora mismo
export const getPublicAddoptionProcess = async (animal_id) => {
  const response = await fetch(`${backendUrl}/api/animals/${animal_id}/addoption-process`);

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || data.message || "No se ha podido cargar el proceso de adopción");
  }
  return response.json();
};

// envia la solicitud de adopcion del usuario logueado, con sus respuestas a las preguntas del proceso
export const crearSolicitudAdopcion = async (animal_id, respuestas) => {
  const response = await fetch(`${backendUrl}/api/animals/${animal_id}/addoption-requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ answers: respuestas }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || data.message || "No se ha podido enviar la solicitud de adopción");
  }
  return response.json();
};

// listado (paginado) de las solicitudes de un proceso propio de la protectora, con datos del
// solicitante incluidos; admite filtro por estado y busqueda por nombre/email
export const getShelterAddoptionRequests = async (
  addoption_process_id,
  { orden = "desc", pagina = 1, perPage = 20 } = {},
  filters = {},
) => {
  const params = new URLSearchParams({ dir: orden, page: pagina, per_page: perPage });

  const { search, status } = filters;
  if (search && search.trim() !== "") params.set("search", search.trim());
  if (status) params.set("status", status);

  const response = await fetch(
    `${backendUrl}/api/shelter/addoption-processes/${addoption_process_id}/addoption-requests?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    },
  );

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || data.message || "No se han podido obtener las solicitudes");
  }
  return response.json();
};

// detalle completo (respuestas + datos del solicitante) de una solicitud propia de la protectora
export const getShelterAddoptionRequestDetail = async (addoption_request_id) => {
  const response = await fetch(`${backendUrl}/api/shelter/addoption-requests/${addoption_request_id}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || data.message || "No se ha podido cargar la solicitud");
  }
  return response.json();
};

// aprueba una solicitud (accion individual): cierra el proceso y descarta el resto de pendientes
export const aceptarSolicitudAdopcion = async (addoption_request_id) => {
  const response = await fetch(`${backendUrl}/api/shelter/addoption-requests/${addoption_request_id}/accept`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || data.message || "No se ha podido aprobar la solicitud");
  }
  return response.json();
};

// descarta varias solicitudes de una vez (seleccion multiple tipo Gmail)
export const descartarSolicitudesAdopcion = async (addoption_request_ids) => {
  const response = await fetch(`${backendUrl}/api/shelter/addoption-requests/discard`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ addoption_request_ids }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || data.message || "No se han podido descartar las solicitudes");
  }
  return response.json();
};
