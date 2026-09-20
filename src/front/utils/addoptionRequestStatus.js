// unica fuente de verdad de las etiquetas de AddoptionRequest.status en el frontend
// (el backend valida/transiciona los valores en addoption_request_service.py)

export const PENDIENTE = "pendiente";
export const ACEPTADA = "aceptada";
export const DESCARTADA = "descartada";

export const ADDOPTION_REQUEST_STATUS_LABELS = {
  [PENDIENTE]: { label: "Pendiente", badgeClass: "bg-warning text-white" },
  [ACEPTADA]: { label: "Aceptada", badgeClass: "bg-success" },
  [DESCARTADA]: { label: "Descartada", badgeClass: "bg-secondary" },
};

export const ADDOPTION_REQUEST_STATUS_OPTIONS = [
  { value: "", label: "Todas" },
  { value: PENDIENTE, label: "Pendientes" },
  { value: ACEPTADA, label: "Aceptadas" },
  { value: DESCARTADA, label: "Descartadas" },
];
