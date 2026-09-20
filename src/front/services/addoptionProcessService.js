import { getToken } from "./authServices.js";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// trae el proceso de adopcion abierto de un animal propio (o null si nunca se abrio ninguno)
export const getAddoptionProcess = async (animal_id) => {
  const response = await fetch(`${backendUrl}/api/shelter/animals/${animal_id}/addoption-process`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || data.message || "No se ha podido cargar el proceso de adopción");
  }
  return response.json();
};

// abre (o reconfigura) el proceso de adopcion de un animal propio de la protectora
export const abrirProcesoAdopcion = async (animal_id, proceso) => {
  const response = await fetch(`${backendUrl}/api/shelter/animals/${animal_id}/addoption-process`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(proceso),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || data.message || "No se ha podido abrir el proceso de adopción");
  }
  return response.json();
};

// listado de /panel/adopciones: todos los procesos de la protectora (uno por animal), con
// recuento de solicitudes y fecha de la ultima
export const getShelterAddoptionProcesses = async (
  { ordenarPor = "update_at", orden = "desc", pagina = 1, perPage = 12 } = {},
  filters = {},
) => {
  const params = new URLSearchParams({
    sort_by: ordenarPor,
    dir: orden,
    page: pagina,
    per_page: perPage,
  });

  const { search, status, hasPending } = filters;
  if (search && search.trim() !== "") params.set("search", search.trim());
  if (status) params.set("status", status);
  if (hasPending) params.set("has_pending", "true");

  const response = await fetch(`${backendUrl}/api/shelter/addoption-processes?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || data.message || "No se han podido obtener los procesos de adopción");
  }
  return response.json();
};

// cabecera de la vista de un proceso concreto (por su addoption_process_id publico)
export const getShelterAddoptionProcessById = async (addoption_process_id) => {
  const response = await fetch(`${backendUrl}/api/shelter/addoption-processes/${addoption_process_id}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || data.message || "No se ha podido cargar el proceso de adopción");
  }
  return response.json();
};

// cierra o reabre manualmente un proceso desde el panel, sin tocar el resto de su configuracion
export const setAddoptionProcessStatus = async (addoption_process_id, status) => {
  const response = await fetch(`${backendUrl}/api/shelter/addoption-processes/${addoption_process_id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || data.message || "No se ha podido cambiar el estado del proceso");
  }
  return response.json();
};

// elimina un proceso propio de la protectora (solo si todavia no tiene solicitudes)
export const eliminarProcesoAdopcion = async (addoption_process_id) => {
  const response = await fetch(`${backendUrl}/api/shelter/addoption-processes/${addoption_process_id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || data.message || "No se ha podido eliminar el proceso de adopción");
  }
  return response.json();
};
