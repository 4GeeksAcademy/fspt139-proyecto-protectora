import { getToken } from "./authServices.js";

const backendUrl = import.meta.env.VITE_BACKEND_URL;


// recibe la url de una foto o video y devuelve la url completa para cargarla (si no es externa)
export const cargarMediaUrl = (url) => {
  if (!url) return '';
  return /^https?:\/\//i.test(url) ? url : `${backendUrl}${url}`;
};

// listado publico de animales
export const getAnimals = async (
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

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error("No se han podido obtener los animales");
  }
  return response.json();
};




// Lista solo los animales de la protectora del usuario logueado como protectora
export const getShelterAnimals = async (
  { ordenarPor = "created_at", orden = "desc", pagina = 1, perPage = 12 } = {},
  filters = {},
) => {
  const params = new URLSearchParams({
    sort_by: ordenarPor,
    dir: orden,
    page: pagina,
    per_page: perPage,
  });

  const { nombre, animal_type_id, status } = filters;

  if (nombre && nombre.trim() !== "") params.set("name", nombre.trim());
  if (animal_type_id) params.set("animal_type_id", animal_type_id);
  if (status) params.set("status", status);

  const response = await fetch(`${backendUrl}/api/shelter/animals?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || data.message || "No se han podido obtener tus animales");
  }
  return response.json();
};




// Trae un animal de la protectora del usuario logueado (para precargar el formulario de edición)
export const getShelterAnimal = async (animal_id) => {
  const response = await fetch(`${backendUrl}/api/shelter/animals/${animal_id}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || data.message || "No se ha podido cargar el animal");
  }
  return response.json();
};



// Genera el animal_id y hace PUT sobre ese recurso, aprovechamos el uuid
export const createAnimal = async (animal) => {
  const animal_id = animal.animal_id || crypto.randomUUID();

  const response = await fetch(`${backendUrl}/api/shelter/animals/${animal_id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ ...animal, animal_id }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || data.message || "No se ha podido publicar el animal");
  }

  const data = await response.json();
  const location = response.headers.get("Location") || `/panel/animales`;

  return { ...data, animal_id, location };
}

// Sube una foto o vídeo a la ficha del animal recien creadoo editado
export const uploadAnimalMedia = async (animal_id, file, isCover) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("is_cover", isCover ? "true" : "false");

  const response = await fetch(`${backendUrl}/api/shelter/animals/${animal_id}/media`, {
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

// elimina una foto o vídeo a la ficha del animal
export const deleteAnimalMedia = async (animal_id, media_id) => {
  const response = await fetch(`${backendUrl}/api/shelter/animals/${animal_id}/media/${media_id}`, {
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

//define como portada una foto o vídeo a la ficha del animal
export const setAnimalMediaCover = async (animal_id, media_id) => {
  const response = await fetch(`${backendUrl}/api/shelter/animals/${animal_id}/media/${media_id}/cover`, {
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