export const getWhatsappUrl = (phone) => {
    if (!phone) return null;
    let clean = String(phone).replace(/\D/g, '');
    if (!clean) return null;
    if (clean.startsWith('0034')) {
        clean = clean.slice(2);
    } else if (!clean.startsWith('34')) {
        clean = `34${clean}`;
    }
    return `https://wa.me/${clean}`;
};

const MS_POR_MINUTO = 60 * 1000;
const MS_POR_HORA = 60 * MS_POR_MINUTO;
const MS_POR_DIA = 24 * MS_POR_HORA;

// "hace 5 minutos" / "hace 3 horas" / "hace 2 días" / "hace 3 semanas"
export const formatearFechaRelativa = (fechaString) => {
    if (!fechaString) return null;
    const fecha = new Date(fechaString);
    if (Number.isNaN(fecha.getTime())) return null;

    const diffMs = Date.now() - fecha.getTime();
    if (diffMs < MS_POR_MINUTO) return "hace un momento";

    const minutos = Math.floor(diffMs / MS_POR_MINUTO);
    if (minutos < 60) return `hace ${minutos} ${minutos === 1 ? "minuto" : "minutos"}`;

    const horas = Math.floor(diffMs / MS_POR_HORA);
    if (horas < 24) return `hace ${horas} ${horas === 1 ? "hora" : "horas"}`;

    const dias = Math.floor(diffMs / MS_POR_DIA);
    if (dias < 7) return `hace ${dias} ${dias === 1 ? "día" : "días"}`;

    const semanas = Math.floor(dias / 7);
    if (semanas < 5) return `hace ${semanas} ${semanas === 1 ? "semana" : "semanas"}`;

    return fecha.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
};


// fuente de etiquetas de Animal.status en el frontend (el backend tiene su equivalente y valida los valores en animals_service.py)
export const ACTIVADO = "activado";
export const DESACTIVADO = "desactivado";
export const BORRADOR = "borrador";

export const ANIMAL_STATUS_LABELS = {
    [ACTIVADO]: "Publicado",
    [DESACTIVADO]: "Desactivado",
    [BORRADOR]: "Borrador",
};

export const ANIMAL_STATUS_BADGE_CLASS = {
    [ACTIVADO]: "bg-success text-white",
    [DESACTIVADO]: "bg-danger text-white",
    [BORRADOR]: "bg-light text-dark border",
};

export const ANIMAL_STATUS_OPTIONS = [
    { value: "", label: "Todos los estados" },
    { value: ACTIVADO, label: "Publicado" },
    { value: DESACTIVADO, label: "Desactivado" },
    { value: BORRADOR, label: "Borrador" },
];

// version reducida para las vistas publicas: solo "activado" es visible ahi
export const ANIMAL_PUBLIC_STATUS_LABELS = {
    [ACTIVADO]: { texto: "Publicado", fondo: "var(--rp-verde)" },
};


export const formatearCantidad = (valor) => {
    const numero = Number(valor);
    if (!Number.isFinite(numero)) return null;
    return numero.toLocaleString("es-ES", { maximumFractionDigits: 2 });
};

