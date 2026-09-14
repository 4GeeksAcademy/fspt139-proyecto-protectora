const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const getShelterTypes = async () => {
    const response = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/api/shelter-types`);

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || data.message || "No se han podido cargar los tipos");
    }

    return data.items;
};