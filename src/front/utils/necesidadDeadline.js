const MS_POR_DIA = 1000 * 60 * 60 * 24;
// marca cuando se muestra como urgente (rojo)
export const UMBRAL_DIAS_URGENTE = 2;
// a partir de aqui solo se avisa, sin urgencia (naranja)
export const UMBRAL_DIAS_AVISO = 7;

// dias enteros entre hoy y la fecha limite
const diasHastaLimite = (deadline) => {
  const fecha = new Date(deadline);
  if (Number.isNaN(fecha.getTime())) return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  fecha.setHours(0, 0, 0, 0);
  return Math.round((fecha.getTime() - hoy.getTime()) / MS_POR_DIA);
};

export const calcularDeadlineLabel = (deadline) => {
  if (!deadline) return "Sin fecha límite";
  const dias = diasHastaLimite(deadline);
  if (dias === null) return "Sin fecha límite";
  if (dias < 0) return "Fuera de plazo";
  if (dias === 0) return "Termina hoy!";
  if (dias === 1) return "Termina mañana";
  return `En ${dias} días`;
};

export const esUrgente = (deadline) => {
  if (!deadline) return false;
  const dias = diasHastaLimite(deadline);
  return dias !== null && dias >= 0 && dias <= UMBRAL_DIAS_URGENTE;
};

// true si la fecha límite ya ha pasado (sin fecha = nunca fuera de plazo)
export const esFueraDePlazo = (deadline) => {
  if (!deadline) return false;
  const dias = diasHastaLimite(deadline);
  return dias !== null && dias < 0;
};

// decide el badge de la tarjeta: texto + color, o null si no hay nada que mostrar
export const construirBadge = (necesidad) => {
  if (!necesidad) return null;

  if (necesidad.status === "cerrada") {
    return { texto: "Cubierta", fondo: "var(--rp-verde)" };
  }

  const deadline = necesidad.request_deadline;
  if (!deadline) return null;

  const dias = diasHastaLimite(deadline);
  if (dias === null) return null;

  if (dias < 0) return { texto: "Fuera de plazo", fondo: "var(--rp-gris)" };
  if (dias <= UMBRAL_DIAS_URGENTE) return { texto: calcularDeadlineLabel(deadline), fondo: "var(--rp-arcilla)" };
  if (dias <= UMBRAL_DIAS_AVISO) return { texto: calcularDeadlineLabel(deadline), fondo: "var(--rp-miel)" };

  return null;
};