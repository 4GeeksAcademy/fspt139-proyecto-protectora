// paginas a las que nunca queremos volver tras el login/registro para evitar loops internos de redirect
const RUTAS_NO_REDIRIGIBLES = ["/login", "/signup", "/logout"];

// valida que el "from" recibido en location.state sea una ruta interna
export const soloRedirectsInternos = (target) => {
  if (typeof target !== "string" || !target.startsWith("/") || target.startsWith("//")) {
    return "/";
  }
  const pathname = target.split(/[?#]/)[0];
  if (RUTAS_NO_REDIRIGIBLES.includes(pathname)) {
    return "/";
  }
  return target;
};
