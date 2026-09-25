import { getToken } from "./authServices.js";

const backendUrl = (
  import.meta.env.VITE_BACKEND_URL || ""
).replace(/\/+$/, "");

// Enviar el archivo a nuestro backend.
export const uploadToCloudinary = async (file) => {
  if (!backendUrl) {
    throw new Error("Falta configurar VITE_BACKEND_URL.");
  }

  if (!file) {
    throw new Error("Selecciona un archivo.");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${backendUrl}/api/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    body: formData,
  });

  // El navegador configura el Content-Type de FormData.
  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      "El servidor no devolvió JSON. Revisa la URL del backend."
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.error?.message ||
      data?.message ||
      data?.msg ||
      "No se pudo subir el archivo."
    );
  }

  return data;
};