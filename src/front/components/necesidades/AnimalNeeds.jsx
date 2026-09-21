import React from "react";
import { NecesidadCard } from "../NecesidadCard";

// necesidades asociadas a este animal, bloque para poner bajo de la columna de galería de la ficha
export const AnimalNeeds = ({ animal }) => {
  const necesidades = animal?.necesidades || [];

  if (necesidades.length === 0) return null;

  return (
    <div className="mt-4">
      <p className="rp-eyebrow mb-2">Necesita tu ayuda</p>
      <div className="row row-cols-1 row-cols-sm-2 g-3">
        {necesidades.map((necesidad) => (
          <div className="col" key={necesidad.request_id}>
            <NecesidadCard necesidad={necesidad} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnimalNeeds;
