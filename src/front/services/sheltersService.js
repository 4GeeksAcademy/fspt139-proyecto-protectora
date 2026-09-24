import { getToken } from "./authServices.js";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

// lanza un error con el status http, para poder distinguir un 404 en la vista
const lanzarError = async (response, mensaje) => {
  const data = await response.json().catch(() => ({}));
  const error = new Error(data.error || data.message || mensaje);
  error.status = response.status;
  throw error;
};

export const getShelters = async (
  { ordenarPor = "name", orden = "asc", pagina = 1, perPage = 5 } = {},
  filters = {},
) => {
  const params = new URLSearchParams({
    sort_by: ordenarPor,
    dir: orden,
    page: pagina,
    per_page: perPage,
  });

  const { nombre, phone, shelterTypeId, hasUrgent, hasAnimals } = filters;

  if (nombre && nombre.trim() !== "") params.set("name", nombre.trim());
  if (phone && phone.trim() !== "") params.set("phone", phone.trim());
  if (shelterTypeId) params.set("shelter_type_id", shelterTypeId);
  if (hasUrgent) params.set("has_urgent", "true");
  if (hasAnimals) params.set("has_animals", "true");

  const response = await fetch(`${backendUrl}/api/shelters?${params.toString()}`);

  if (!response.ok) await lanzarError(response, "No se han podido obtener las protectoras");
  return response.json();
};

export const getShelterById = async (shelter_id) => {
  const response = await fetch(`${backendUrl}/api/shelters/${shelter_id}`);
  if (!response.ok) await lanzarError(response, "No se ha podido cargar la protectora");
  return response.json();
};

export const getShelterProfile = async () => {
  const response = await fetch(`${backendUrl}/api/shelter/profile`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!response.ok) await lanzarError(response, "No se ha podido cargar tu perfil");
  return response.json();
};

export const updateShelterProfile = async (datos) => {
  const response = await fetch(`${backendUrl}/api/shelter/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(datos),
  });
  if (!response.ok) await lanzarError(response, "No se han podido guardar los cambios");
  return response.json();
};

// sube (o reemplaza) el logo de la protectora del usuario logueado
export const uploadShelterLogo = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${backendUrl}/api/shelter/logo`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  });
  if (!response.ok) await lanzarError(response, "No se ha podido subir el logo");
  return response.json();
};

// quita el logo de la protectora del usuario logueado
export const deleteShelterLogo = async () => {
  const response = await fetch(`${backendUrl}/api/shelter/logo`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!response.ok) await lanzarError(response, "No se ha podido quitar el logo");
  return response.json();
};