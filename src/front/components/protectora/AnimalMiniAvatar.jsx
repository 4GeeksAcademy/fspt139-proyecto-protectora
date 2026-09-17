import React from "react";
import { cargarMediaUrl } from "../../services/animalsService";

//avatar del animal: usado de momento solo en el formulario de necesidad al vincular con un animal
export const AnimalMiniAvatar = ({ animal, size = 18, backgroundColor = "var(--rp-verde-cl)" }) => (
  <span
    className="d-inline-flex align-items-center justify-content-center flex-shrink-0 rounded-circle overflow-hidden"
    style={{ width: `${size}px`, height: `${size}px`, backgroundColor }}
  >
    {animal?.cover_image ? (
      <img className="w-100 h-100" style={{ objectFit: "cover" }} src={cargarMediaUrl(animal.cover_image)} />
    ) : (
      animal?.name?.charAt(0)?.toUpperCase() || "?"
    )}
  </span>
);
