import { useEffect, useState } from "react";
import useGlobalReducer from "./useGlobalReducer";
import { getShelterProfile } from "../services/sheltersService";

// Devuelve la protectora del usuario logueado (null si no hay sesion o no es una protectora).
// Lo usan las vistas publicas (Adoptar, Necesidades) para saber que tarjetas son "vuestras"
// y poder pintar el boton de editar solo en esas.
export const useMiProtectora = () => {
  const { store } = useGlobalReducer();
  const esProtectora = store.user?.rol === "shelter_admin";

  const [miProtectora, setMiProtectora] = useState(null);

  useEffect(() => {
    if (!esProtectora) {
      setMiProtectora(null);
      return;
    }

    let cancelado = false;

    getShelterProfile()
      .then((datos) => {
        if (!cancelado) setMiProtectora(datos);
      })
      .catch(() => {
        if (!cancelado) setMiProtectora(null);
      });

    return () => {
      cancelado = true;
    };
  }, [esProtectora]);

  // ojo: el backend no serializa igual las dos entidades.
  // animal.shelter_id  -> UUID publico de la protectora  (shelter.shelter_id)
  // necesidad.shelter_id -> id interno de la protectora  (shelter.id)
  const esMiAnimal = (animal) =>
    Boolean(miProtectora) && animal?.shelter_id === miProtectora.shelter_id;

  const esMiNecesidad = (necesidad) =>
    Boolean(miProtectora) && necesidad?.shelter_id === miProtectora.shelter_id;

  return { miProtectora, esProtectora, esMiAnimal, esMiNecesidad };
};
