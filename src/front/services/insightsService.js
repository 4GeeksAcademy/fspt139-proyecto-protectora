const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const getHomeInsights = async () => {
  const response = await fetch(backendUrl + "/api/data/insights");

  if (!response.ok) {
    throw new Error("No se han podido obtener los datos de la home");
  }

  return response.json();
};