const backendUrl = import.meta.env.VITE_BACKEND_URL;

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

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || data.message || "No se han podido obtener las protectoras");
  }
  return response.json();
};