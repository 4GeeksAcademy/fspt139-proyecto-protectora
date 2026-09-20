// unica fuente de verdad de las etiquetas de AddoptionProcess.status en el frontend
// (el backend valida/transiciona los valores en addoption_process_service.py)

export const ABIERTO = "abierto";
export const CERRADO = "cerrado";

export const ADDOPTION_PROCESS_STATUS_LABELS = {
  [ABIERTO]: { label: "Abierto", badgeClass: "bg-warning text-white" },
  [CERRADO]: { label: "Cerrado", badgeClass: "bg-success text-white" },
};

export const ADDOPTION_PROCESS_STATUS_OPTIONS = [
  { value: "", label: "Todos los estados" },
  { value: ABIERTO, label: "Abierto" },
  { value: CERRADO, label: "Cerrado" },
];
