// palabras que no aportan identidad: el tipo de entidad y los conectores
const PALABRAS_VACIAS = new Set([
  "protectora", "refugio", "santuario", "asociacion", "asociación",
  "de", "del", "la", "las", "el", "los", "y",
]);

export const generarIniciales = (nombre) => {
  if (!nombre) return "?";

  const palabras = nombre
    .trim()
    .split(/\s+/)
    .filter((palabra) => !PALABRAS_VACIAS.has(palabra.toLowerCase()));

  const base = palabras.length > 0 ? palabras : nombre.trim().split(/\s+/);

  return base
    .slice(0, 2)
    .map((palabra) => palabra[0].toUpperCase())
    .join("");
};