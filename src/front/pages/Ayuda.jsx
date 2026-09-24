import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CategoryCard } from "../components/CategoryCard";
import { FaqItem } from "../components/FaqItem";
import { usePageTitle } from "../hooks/usePageTitle";
import useGlobalReducer from "../hooks/useGlobalReducer";

// Cada perfil tiene su tarjeta, su pestaña de guia y su categoria de preguntas (mismo id).
const PERFILES = [
    { id: "colaborar", titulo: "Quiero colaborar", corto: "Colaborar", bgClass: "bg-success", descripcion: "Cómo comprometerte con una necesidad y seguir tu aportación." },
    { id: "adoptar", titulo: "Quiero adoptar", corto: "Adoptar", bgClass: "bg-warning", descripcion: "Cómo solicitar una adopción y saber en qué estado está." },
    { id: "protectora", titulo: "Soy una protectora", corto: "Protectoras", bgClass: "bg-info", descripcion: "Registro, panel, necesidades, animales y adopciones." },
    { id: "cuenta", titulo: "Mi cuenta", corto: "Cuenta", bgClass: "bg-danger", descripcion: "Qué puedes hacer sin cuenta, cómo registrarte y tus ajustes." },
];

const PASOS_GENERALES = [
    { titulo: "La protectora publica", texto: "Sube lo que necesita (qué, cuánto y hasta cuándo) y los animales que buscan hogar." },
    { titulo: "Tú eliges cómo ayudar", texto: "Te comprometes con la parte que puedes cubrir o solicitas la adopción de un animal." },
    { titulo: "La protectora responde", texto: "Confirma lo que ha recibido o revisa tu solicitud. Tú lo sigues desde Mi actividad." },
];

// soloSinSesion: el boton final de la guia solo se ensena a quien no ha iniciado sesion
const GUIAS = {
    colaborar: {
        intro: "Las protectoras piden cosas concretas: pienso, mantas, dinero para una operación, alguien que lleve a un animal al veterinario... Tú eliges la parte que puedes cubrir.",
        pasos: [
            { titulo: "Crea tu cuenta de voluntario", texto: "Al registrarte, elige «Soy voluntario». Sin cuenta puedes verlo todo, pero para colaborar necesitas iniciar sesión." },
            { titulo: "Elige una necesidad", texto: "En Necesidades puedes filtrar por tipo (ayuda económica, recursos, tiempo voluntario u otros) y ver en el mapa las que tienes cerca. Cada una indica qué hace falta, cuánto y hasta cuándo." },
            { titulo: "Comprométete con tu parte", texto: "Pulsa «Colaborar», indica cuánto aportas y cómo o cuándo lo vas a entregar, y confirma. Es un compromiso: la protectora cuenta con tu aportación para llegar al objetivo." },
            { titulo: "Entrégalo y recibe respuesta", texto: "Coordina la entrega con la protectora usando el contacto de su ficha. Cuando lo reciba te responderá, y puede dejarte una valoración. Lo ves todo en Mi actividad." },
        ],
        enlace: { to: "/necesidades", texto: "Ver necesidades" },
    },
    adoptar: {
        intro: "Cada protectora decide cuándo abre la adopción de un animal y qué requisitos pide. Así funciona:",
        pasos: [
            { titulo: "Encuentra a tu animal", texto: "En Adoptar usa los filtros para encontrarlo. Los que llevan la etiqueta «En adopción» tienen el proceso abierto." },
            { titulo: "Lee su ficha", texto: "Su historia, su salud, cómo convive con niños y otros animales, y el hogar ideal que busca la protectora." },
            { titulo: "Envía tu solicitud", texto: "Con la sesión iniciada, pulsa «Adoptar». Verás los requisitos de la protectora y unas preguntas: contéstalas todas y confirma." },
            { titulo: "Sigue su estado", texto: "En Mi actividad verás si tu solicitud está pendiente, aceptada o descartada. Cuando la protectora acepta una solicitud, el proceso se cierra y el resto se descartan." },
        ],
        enlace: { to: "/adoptar", texto: "Ver animales en adopción" },
    },
    protectora: {
        intro: "Red Protectora es vuestro escaparate: publicáis lo que necesitáis, dais visibilidad a vuestros animales y la comunidad responde.",
        pasos: [
            { titulo: "Registra tu protectora", texto: "Al crear la cuenta, elige «Soy protectora» y rellena tus datos y los de la entidad: nombre, tipo, dirección, y el correo y teléfono públicos, que son los que verán los colaboradores." },
            { titulo: "Completa vuestro perfil", texto: "En Perfil Protectora añade logo, descripción, web e Instagram. Es lo que la gente verá en vuestra ficha pública." },
            { titulo: "Publica necesidades", texto: "Indica el tipo, la cantidad (o sin límite), la unidad y la fecha límite. Puedes asociarla a un animal concreto. Al alcanzar la cantidad, se marca como cubierta sola." },
            { titulo: "Gestiona tus animales", texto: "Cada animal puede estar en borrador (solo lo ves tú), publicado (visible para todos) o desactivado (oculto)." },
            { titulo: "Abre procesos de adopción", texto: "Define los requisitos y las preguntas para el animal. En Adopciones revisas las solicitudes y aceptas la que encaje; el resto se descartan." },
            { titulo: "Responde a quien colabora", texto: "En el detalle de cada necesidad verás las colaboraciones. Confírmalas con un mensaje y, si quieres, una valoración de 1 a 5." },
        ],
        enlace: { to: "/signup", texto: "Registrar mi protectora", soloSinSesion: true },
    },
    cuenta: {
        intro: "Puedes navegar sin registrarte. La cuenta te hace falta para colaborar, adoptar o gestionar una protectora.",
        pasos: [
            { titulo: "Sin cuenta", texto: "Puedes ver las necesidades, los animales en adopción, las protectoras y el mapa." },
            { titulo: "Crea tu cuenta", texto: "Elige si eres voluntario o protectora. Cada cuenta tiene un solo rol." },
            { titulo: "Inicia sesión", texto: "Con tu correo y contraseña. Al entrar verás tu menú: Mi actividad si eres voluntario, o tu panel si eres protectora." },
            { titulo: "Cambia tus datos", texto: "En Ajustes puedes editar tu nombre, apellidos, correo, teléfono y dirección, y cambiar tu contraseña indicando la actual." },
        ],
        enlace: { to: "/signup", texto: "Crear cuenta", soloSinSesion: true },
    },
};

// mismos colores que construirBadge (necesidadDeadline.js) y los badges de AnimalCard
const ETIQUETAS = [
    { texto: "En 2 días", fondo: "var(--rp-arcilla)", descripcion: "Urgente: a la necesidad le quedan 2 días o menos. También verás «Termina hoy» o «Termina mañana»." },
    { texto: "En 5 días", fondo: "var(--rp-miel)", descripcion: "Próxima a vencer: le queda una semana o menos." },
    { texto: "Fuera de plazo", fondo: "var(--rp-gris)", descripcion: "Su fecha límite ya pasó y no admite más colaboraciones." },
    { texto: "Cubierta", fondo: "var(--rp-verde)", descripcion: "Ya se ha conseguido lo que se pedía." },
    { texto: "En adopción", fondo: "var(--rp-miel)", descripcion: "El animal tiene un proceso de adopción abierto: puedes solicitarla." },
    { texto: "Te necesita", fondo: "var(--rp-arcilla)", descripcion: "El animal tiene necesidades asociadas con las que puedes colaborar." },
];

const PREGUNTAS = [
    { categoria: "colaborar", pregunta: "¿Qué significa comprometerme con una necesidad?", respuesta: "Que reservas la parte que vas a aportar. Si una protectora necesita 20 kg de pienso y te comprometes con 5 kg, esos 5 kg cuentan para el objetivo y el resto de la comunidad ve lo que falta." },
    { categoria: "colaborar", pregunta: "¿Puedo cancelar una colaboración?", respuesta: "Desde la web no, porque es un compromiso con la protectora. Si te surge un imprevisto, avísales cuanto antes con el correo o el teléfono de su ficha." },
    { categoria: "colaborar", pregunta: "¿Puedo donar dinero a través de Red Protectora?", respuesta: "No, la web no gestiona pagos. En las necesidades de ayuda económica indicas cuánto aportas y cómo (transferencia, Bizum...), y lo acuerdas directamente con la protectora." },
    { categoria: "colaborar", pregunta: "¿Por qué no puedo colaborar con una necesidad?", respuesta: "Porque ya está cubierta o ha pasado su fecha límite. En esos casos el botón cambia a «Ver detalle»." },
    { categoria: "adoptar", pregunta: "¿Por qué no me sale el botón de Adoptar?", respuesta: "Porque ese animal no tiene ahora un proceso de adopción abierto. Puedes visitar la ficha de su protectora para conocer al resto de sus animales." },
    { categoria: "adoptar", pregunta: "¿Necesito cuenta para adoptar?", respuesta: "Sí. Si pulsas «Adoptar» sin sesión, te pedirá iniciarla y te devolverá a la ficha del animal para seguir con la solicitud." },
    { categoria: "adoptar", pregunta: "¿Qué pasa si la protectora elige otra solicitud?", respuesta: "Tu solicitud pasa a «Descartada». Cuando se acepta una, el proceso de adopción de ese animal se cierra." },
    { categoria: "adoptar", pregunta: "¿Dónde veo cómo va mi solicitud?", respuesta: "En Mi actividad, junto con tus colaboraciones." },
    { categoria: "protectora", pregunta: "¿Qué datos de mi protectora son públicos?", respuesta: "El nombre, tipo, descripción, logo, web, Instagram, dirección y ubicación en el mapa, y el correo y teléfono de la entidad. Tus datos personales no se muestran." },
    { categoria: "protectora", pregunta: "¿Puedo preparar la ficha de un animal sin publicarla?", respuesta: "Sí, guárdala como borrador. Solo tú la ves hasta que la publiques." },
    { categoria: "protectora", pregunta: "¿Qué pasa cuando una necesidad llega a su objetivo?", respuesta: "Se marca como «Cubierta» automáticamente y deja de aceptar colaboraciones. Si la creaste sin límite de cantidad, no se cierra sola." },
    { categoria: "protectora", pregunta: "¿Puedo responder a varias colaboraciones a la vez?", respuesta: "Sí. En el detalle de la necesidad puedes seleccionar varias y enviarles la misma respuesta." },
    { categoria: "cuenta", pregunta: "¿Puedo ser voluntario y protectora con la misma cuenta?", respuesta: "No. Cada cuenta tiene un solo rol. Si necesitas los dos, crea otra cuenta con un correo distinto." },
    { categoria: "cuenta", pregunta: "¿Cómo cambio mi contraseña?", respuesta: "En Ajustes: escribe tu contraseña actual y la nueva." },
    { categoria: "cuenta", pregunta: "¿Qué puedo ver sin registrarme?", respuesta: "Todo el contenido público: necesidades, animales, protectoras y el mapa. Solo necesitas cuenta para colaborar, adoptar o publicar." },
];

const CATEGORIAS_FAQ = [{ id: "", texto: "Todas" }, ...PERFILES.map((p) => ({ id: p.id, texto: p.corto }))];

// circulo verde con numero, lo usan los pasos generales y los de cada guia
const NumeroPaso = ({ numero }) => (
    <span
        className="rounded-circle d-inline-flex align-items-center justify-content-center fw-bold flex-shrink-0"
        style={{ width: "36px", height: "36px", backgroundColor: "var(--rp-verde-cl)", color: "var(--rp-verde)" }}
    >
        {numero}
    </span>
);

export const Ayuda = () => {
    usePageTitle("Ayuda");
    const { store } = useGlobalReducer();

    const [perfilActivo, setPerfilActivo] = useState("colaborar");
    const [categoria, setCategoria] = useState("");
    const guiasRef = useRef(null);

    // al pulsar una tarjeta: abre su guia, filtra las preguntas de su tema y baja hasta la guia
    const seleccionarPerfil = (id) => {
        setPerfilActivo(id);
        setCategoria(id);
        guiasRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const guia = GUIAS[perfilActivo];
    const mostrarEnlace = !(guia.enlace.soloSinSesion && store.token);
    const preguntasVisibles = categoria ? PREGUNTAS.filter((p) => p.categoria === categoria) : PREGUNTAS;

    return (
        <div className="container py-4">

            <div className="bg-success bg-opacity-10 rounded-4 p-4 p-md-5 text-center mb-5">
                <p className="rp-eyebrow text-success mb-2">Centro de ayuda</p>
                <h1 className="fw-bold display-6 mb-3" style={{ color: "var(--rp-pino)" }}>¿Cómo funciona Red Protectora?</h1>
                <p className="text-secondary mb-0 mx-auto" style={{ maxWidth: "620px" }}>
                    Las protectoras publican lo que necesitan de forma concreta: qué, cuánto y hasta cuándo.
                    Tú eliges con qué ayudar o a qué animal quieres dar un hogar.
                </p>
            </div>

            <h2 className="fw-bold mb-1">Cómo funciona</h2>
            <p className="text-secondary mb-4">Tres pasos, sin intermediarios.</p>

            <div className="row g-3 mb-5">
                {PASOS_GENERALES.map((paso, index) => (
                    <div className="col-12 col-md-4" key={paso.titulo}>
                        <div className="card h-100 border-0 shadow-sm p-3">
                            <div className="mb-3"><NumeroPaso numero={index + 1} /></div>
                            <h5 className="fw-bold mb-2">{paso.titulo}</h5>
                            <p className="text-secondary small mb-0">{paso.texto}</p>
                        </div>
                    </div>
                ))}
            </div>

            <h2 className="fw-bold mb-1">¿Qué necesitas?</h2>
            <p className="text-secondary mb-4">Elige tu caso y te llevamos a su guía.</p>

            <div className="row g-4 mb-5">
                {PERFILES.map((perfil) => (
                    <CategoryCard
                        key={perfil.id}
                        bgClass={perfil.bgClass}
                        title={perfil.titulo}
                        description={perfil.descripcion}
                        onSelect={() => seleccionarPerfil(perfil.id)}
                        activa={perfilActivo === perfil.id}
                        cta="Ver guía →"
                    />
                ))}
            </div>

            <section ref={guiasRef} className="mb-5" style={{ scrollMarginTop: "90px" }}>
                <h2 className="fw-bold mb-1">Guías paso a paso</h2>
                <p className="text-secondary mb-3">Todo lo que puedes hacer según tu perfil.</p>

                <div className="d-flex flex-wrap gap-2 mb-4" role="tablist">
                    {PERFILES.map((perfil) => (
                        <button
                            key={perfil.id}
                            type="button"
                            role="tab"
                            aria-selected={perfilActivo === perfil.id}
                            onClick={() => setPerfilActivo(perfil.id)}
                            className={`btn btn-sm rounded-pill ${perfilActivo === perfil.id ? "btn-success" : "btn-outline-secondary"}`}
                        >
                            {perfil.titulo}
                        </button>
                    ))}
                </div>

                <div className="card border-0 shadow-sm p-4" role="tabpanel">
                    <p className="text-secondary mb-4">{guia.intro}</p>

                    <ol className="list-unstyled mb-0">
                        {guia.pasos.map((paso, index) => (
                            <li key={paso.titulo} className="d-flex gap-3 mb-3">
                                <NumeroPaso numero={index + 1} />
                                <div>
                                    <h6 className="fw-bold mb-1">{paso.titulo}</h6>
                                    <p className="text-secondary small mb-0">{paso.texto}</p>
                                </div>
                            </li>
                        ))}
                    </ol>

                    {mostrarEnlace && (
                        <Link to={guia.enlace.to} className="btn btn-success rounded-pill px-4 mt-2 align-self-start">
                            {guia.enlace.texto}
                        </Link>
                    )}
                </div>
            </section>

            <h2 className="fw-bold mb-1">Qué significa cada etiqueta</h2>
            <p className="text-secondary mb-4">Las verás en las tarjetas de necesidades y de animales.</p>

            <div className="row g-3 mb-5">
                {ETIQUETAS.map((etiqueta) => (
                    <div className="col-12 col-md-6" key={etiqueta.texto}>
                        <div className="d-flex align-items-start gap-3 p-3 rounded-3 h-100 shadow-sm" style={{ backgroundColor: "var(--rp-papel)" }}>
                            <span className="badge flex-shrink-0" style={{ backgroundColor: etiqueta.fondo, color: "var(--rp-papel)" }}>
                                {etiqueta.texto}
                            </span>
                            <p className="small text-secondary mb-0">{etiqueta.descripcion}</p>
                        </div>
                    </div>
                ))}
            </div>

            <h2 className="fw-bold mb-1">Preguntas frecuentes</h2>
            <p className="text-secondary mb-3">Las dudas más habituales, por tema.</p>

            <div className="d-flex gap-2 flex-wrap mb-4">
                {CATEGORIAS_FAQ.map((cat) => (
                    <button
                        key={cat.id || "todas"}
                        type="button"
                        onClick={() => setCategoria(cat.id)}
                        className={`btn btn-sm rounded-pill ${categoria === cat.id ? "btn-success" : "btn-outline-secondary"}`}
                    >
                        {cat.texto}
                    </button>
                ))}
            </div>

            <div className="mb-5">
                {preguntasVisibles.map((item) => (
                    <FaqItem key={item.pregunta} question={item.pregunta} answer={item.respuesta} />
                ))}
            </div>

            <div className="bg-success bg-opacity-10 rounded-4 p-4 p-md-5 text-center">
                <h2 className="fw-bold mb-2">¿Empezamos?</h2>
                <p className="text-secondary mb-4">Echa un vistazo a lo que necesitan hoy las protectoras de la red.</p>
                <div className="d-flex flex-wrap justify-content-center gap-2">
                    <Link to="/necesidades" className="btn btn-success">Ver necesidades</Link>
                    <Link to="/adoptar" className="btn btn-outline-success">Ver animales</Link>
                    <Link to="/protectoras" className="btn btn-outline-success">Ver protectoras</Link>
                    {!store.token && <Link to="/signup" className="btn btn-outline-success">Crear cuenta</Link>}
                </div>
            </div>

        </div>
    );
};