// etiquetas que salen de los campos booleanos del animal.
// cuando el texto concuerda con el sexo se escribe [masculino, femenino]
const TAGS_BOOLEANOS = {
  is_sterilized: ["Esterilizado", "Esterilizada"],
  has_microchip: "Con microchip",
  lives_with_kids: "Con niños",
  lives_with_dogs: "Con perros",
  lives_with_cats: "Con gatos",
};

const resolverTexto = (texto, sex) => {
  if (!Array.isArray(texto)) return texto;

  const [masculino, femenino] = texto;
  if (sex === "hembra") return femenino;
  if (sex === "macho") return masculino;
  return `${masculino}/a`;
};

export const construirTags = (animal) => {
  if (!animal) return [];

  const desdeTraits = (animal.traits || "")
    .split(",")
    .map((trait) => trait.trim())
    .filter(Boolean);

  const desdeBooleanos = Object.entries(TAGS_BOOLEANOS)
    .filter(([campo]) => animal[campo] === true)
    .map(([, texto]) => resolverTexto(texto, animal.sex));

  const vistas = new Set();
  return [...desdeTraits, ...desdeBooleanos].filter((tag) => {
    const clave = tag.toLowerCase();
    if (vistas.has(clave)) return false;
    vistas.add(clave);
    return true;
  });
};