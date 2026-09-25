import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle";

const SECCIONES = [
  {
    id: "uso",
    corto: "Uso",
    titulo: "1. Términos de uso",
    puntos: [
      { titulo: "Acceso y uso", texto: "El acceso y uso de la plataforma Red Protectora implica la aceptación plena de estos términos." },
      { titulo: "Modificaciones", texto: "Nos reservamos el derecho de modificar estos términos en cualquier momento, avisando en la plataforma." },
      { titulo: "Uso de la plataforma", texto: "El usuario se compromete a utilizar la plataforma conforme a la ley y las buenas costumbres." },
      { titulo: "Conducta", texto: "Cualquier conducta que perjudique a las protectoras o a los animales supondrá la expulsión de la plataforma." },
      { titulo: "Propiedad intelectual", texto: "Todo el contenido de la plataforma está protegido por las leyes de propiedad intelectual y no puede usarse sin permiso." },
    ],
  },
  {
    id: "privacidad",
    corto: "Privacidad",
    titulo: "2. Privacidad",
    puntos: [
      { titulo: "Qué datos recogemos", texto: "Datos personales básicos, como nombre y correo electrónico, para gestionar colaboraciones y adopciones, y el teléfono de la protectora o entidad que representas." },
      { titulo: "Para qué los usamos", texto: "Solo para facilitar los procesos de adopción, colaboración y voluntariado." },
      { titulo: "Con quién los compartimos", texto: "No compartimos tus datos personales con terceros ajenos a la gestión directa de cada protectora." },
      { titulo: "Seguridad", texto: "Aplicamos medidas de seguridad para evitar el acceso no autorizado a tus datos." },
      { titulo: "Tus derechos", texto: "Puedes pedir en cualquier momento que revisemos, modifiquemos o eliminemos tus datos." },
      { titulo: "Cookies", texto: "Lo explicamos en la sección «Cookies y almacenamiento local», más abajo." },
    ],
  },
  {
    id: "cookies",
    corto: "Cookies",
    titulo: "3. Cookies y almacenamiento local",
    puntos: [
      { titulo: "Cookies", texto: "No usamos cookies de analítica, publicidad ni seguimiento." },
      { titulo: "Almacenamiento local", texto: "Guardamos en tu navegador los datos de tu sesión, para que no tengas que iniciarla en cada página, y tu respuesta al aviso de cookies. Se borran al cerrar sesión o al limpiar los datos del navegador." },
      { titulo: "Ubicación", texto: "Para centrar el mapa estimamos tu zona aproximada a partir de tu dirección IP (servicio ip-api.com). Si das permiso al navegador, usamos tu ubicación para mayor precisión. No guardamos ninguna de las dos." },
      { titulo: "Servicios externos", texto: "El mapa se carga desde OpenStreetMap, y las direcciones de las protectoras se sitúan en el mapa con su servicio Nominatim. Estos servicios reciben datos técnicos, como tu IP." },
    ],
  },
];

export const TerminosyPrivacidad = () => {
  usePageTitle("Términos de uso, privacidad y cookies");
  const { hash } = useLocation();

  // si llegamos con #seccion (p. ej. desde el aviso de cookies), bajamos a ella.
  // va en un setTimeout porque ScrollToTop sube al inicio al cambiar de pagina y se ejecuta despues de este efecto
  useEffect(() => {
    if (!hash) return;
    const temporizador = setTimeout(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
    }, 0);
    return () => clearTimeout(temporizador);
  }, [hash]);

  return (
    <div className="container py-4" style={{ maxWidth: "900px" }}>

      <div className="bg-success bg-opacity-10 rounded-4 p-4 p-md-5 text-center mb-4">
        <p className="rp-eyebrow text-success mb-2">Información legal</p>
        <h1 className="fw-bold display-6 mb-2" style={{ color: "var(--rp-pino)" }}>
          Términos de uso, privacidad y cookies
        </h1>
        <p className="text-secondary mb-0">Última actualización: septiembre de 2026</p>
      </div>

      <nav aria-label="Secciones" className="d-flex flex-wrap justify-content-center gap-2 mb-5">
        {SECCIONES.map((seccion) => (
          <a key={seccion.id} href={`#${seccion.id}`} className="btn btn-outline-success btn-sm rounded-pill px-3">
            {seccion.corto}
          </a>
        ))}
      </nav>

      {SECCIONES.map((seccion) => (
        <section key={seccion.id} id={seccion.id} className="mb-5" style={{ scrollMarginTop: "90px" }}>
          <h2 className="fw-bold mb-3" style={{ color: "var(--rp-pino)" }}>{seccion.titulo}</h2>
          <div className="card border-0 shadow-sm p-3 p-md-4">
            <ul className="text-secondary mb-0" style={{ lineHeight: 1.8 }}>
              {seccion.puntos.map((punto) => (
                <li key={punto.titulo}>
                  <strong className="text-dark">{punto.titulo}:</strong> {punto.texto}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}

    </div>
  );
};