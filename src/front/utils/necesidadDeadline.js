const MS_POR_DIA = 1000 * 60 * 60 * 24;
//marca cuando se muestra como urgente
export const UMBRAL_DIAS_URGENTE = 7;

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
  if (dias === 1) return "Termina Mañana";
  return `En ${dias} días`;
};

export const esUrgente = (deadline) => {
  if (!deadline) return false;
  const dias = diasHastaLimite(deadline);
  return dias !== null && dias <= UMBRAL_DIAS_URGENTE;
};
