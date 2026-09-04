import React, { useState, useEffect } from "react";
import { AnimalCard } from "../components/AnimalCard";
import { Footer } from "../components/Footer";

export const Adoptar = () => {
  const [animales, setAnimales] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  const [filtroEspecie, setFiltroEspecie] = useState("todos");
  const [filtroEdad, setFiltroEdad] = useState("todas");
  const [filtroTamano, setFiltroTamano] = useState("todos");
  
  const [animalSeleccionado, setAnimalSeleccionado] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const mockData = [
    {
      id: 1,
      nombre: "Nala",
      especie: "perro",
      tipo: "Mestiza",
      edad: "2 años",
      rangoEdad: "adulto",
      peso: "14 kg",
      tamano: "mediano",
      descripcion: "Tranquila y muy buena con otros perros. Necesita una casa sin escaleras donde poder descansar plácidamente.",
      estado: "Disponible",
      urgente: false,
      protectora: "Protectora Huellas",
      caracteristicas: ["Sociable", "Esterilizada", "Con niños"],
      cssClass: "img-nala"
    },
    {
      id: 2,
      nombre: "Trufa",
      especie: "gato",
      tipo: "Común europea",
      edad: "7 meses",
      rangoEdad: "cachorro",
      peso: "2.5 kg",
      tamano: "pequeno",
      descripcion: "Muy activa y sociable. Le encanta jugar con cualquier cosa que se mueva. Ya tiene candidatos.",
      estado: "En proceso",
      urgente: false,
      protectora: "Protectora Huellas",
      caracteristicas: ["Juguetona", "Vacunada", "Piso"],
      cssClass: "img-trufa"
    },
    {
      id: 3,
      nombre: "Bruno",
      especie: "perro",
      tipo: "Podenco",
      edad: "5 años",
      rangoEdad: "adulto",
      peso: "22 kg",
      tamano: "grande",
      descripcion: "Lleva dos años esperando. Es un perro noble, ideal para una casa con jardín y familia paciente.",
      estado: "Disponible",
      urgente: true,
      protectora: "Colonia Felina Vallecas",
      caracteristicas: ["Tranquilo", "Jardín", "Sin gatos"],
      cssClass: "img-bruno"
    },
    {
      id: 4,
      nombre: "Luna",
      especie: "gato",
      tipo: "Siamesa",
      edad: "1 año",
      rangoEdad: "adulto",
      peso: "3.5 kg",
      tamano: "pequeno",
      descripcion: "Cariñosa y curiosa. Le gusta dormir al sol junto a la ventana. Un amor de compañera.",
      estado: "Disponible",
      urgente: false,
      protectora: "Gatos del Sur",
      caracteristicas: ["Cariñosa", "Esterilizada", "Piso"],
      cssClass: "img-cat"
    },
    {
      id: 5,
      nombre: "Rex",
      especie: "perro",
      tipo: "Golden Retriever mix",
      edad: "3 años",
      rangoEdad: "adulto",
      peso: "28 kg",
      tamano: "grande",
      descripcion: "Muy obediente, sabe pasear con correa suelta. Busca una familia activa para hacer rutas de montaña.",
      estado: "Disponible",
      urgente: false,
      protectora: "Refugio Els Amics",
      caracteristicas: ["Adiestrado", "Vacunado", "Activo"],
      cssClass: "img-walk"
    },
    {
      id: 6,
      nombre: "Toby",
      especie: "perro",
      tipo: "Bulldog Francés",
      edad: "4 años",
      rangoEdad: "adulto",
      peso: "11 kg",
      tamano: "pequeno",
      descripcion: "Pequeño y tranquilo, ideal para un piso. Tiene dos candidatos en revisión en este momento.",
      estado: "En proceso",
      urgente: false,
      protectora: "Protectora Huellas",
      caracteristicas: ["Tranquilo", "Piso", "Mimoso"],
      cssClass: "img-puppies"
    },
    {
      id: 7,
      nombre: "Mia",
      especie: "gato",
      tipo: "Común tricolor",
      edad: "6 meses",
      rangoEdad: "cachorro",
      peso: "2 kg",
      tamano: "pequeno",
      descripcion: "Recién destetada, muy juguetona. Es mejor que conviva con otro gato o tenga mucha atención.",
      estado: "Disponible",
      urgente: true,
      protectora: "Colonia Felina Vallecas",
      caracteristicas: ["Cachorro", "Sociable", "Interior"],
      cssClass: "img-kitten"
    },
    {
      id: 8,
      nombre: "Simba",
      especie: "gato",
      tipo: "Gato naranja",
      edad: "2 años",
      rangoEdad: "adulto",
      peso: "4.8 kg",
      tamano: "mediano",
      descripcion: "Un gato muy bonachón y glotón. Le encantan los mimos y ronronea muy fuerte cuando le rascas.",
      estado: "Disponible",
      urgente: false,
      protectora: "Gatos del Sur",
      caracteristicas: ["Tranquilo", "Comilón", "Cariñoso"],
      cssClass: "img-cat"
    },
    {
      id: 9,
      nombre: "Rocky",
      especie: "perro",
      tipo: "Pastor Alemán",
      edad: "1 año",
      rangoEdad: "cachorro",
      peso: "25 kg",
      tamano: "grande",
      descripcion: "Joven y lleno de energía. Necesita espacio para correr y una familia que le dedique tiempo de juego.",
      estado: "Disponible",
      urgente: false,
      protectora: "Refugio Els Amics",
      caracteristicas: ["Juguetón", "Protector", "Jardín"],
      cssClass: "img-vet"
    },
    {
      id: 10,
      nombre: "Kira",
      especie: "perro",
      tipo: "Husky Siberiano",
      edad: "8 años",
      rangoEdad: "senior",
      peso: "24 kg",
      tamano: "mediano",
      descripcion: "Rescatada recientemente. Es muy inteligente pero necesita dueños con experiencia y mucha energía.",
      estado: "Disponible",
      urgente: true,
      protectora: "Protectora Huellas",
      caracteristicas: ["Activa", "Inteligente", "Jardín"],
      cssClass: "img-social"
    },
    {
      id: 11,
      nombre: "Oreo",
      especie: "gato",
      tipo: "Blanco y negro",
      edad: "3 años",
      rangoEdad: "adulto",
      peso: "5 kg",
      tamano: "mediano",
      descripcion: "Gato muy casero. Fue abandonado y al principio es un poco tímido, pero luego es un amor.",
      estado: "En proceso",
      urgente: false,
      protectora: "Colonia Felina Vallecas",
      caracteristicas: ["Tímido", "Esterilizado", "Tranquilo"],
      cssClass: "img-cat"
    },
    {
      id: 12,
      nombre: "Milo",
      especie: "gato",
      tipo: "Gato Persa",
      edad: "10 años",
      rangoEdad: "senior",
      peso: "4.2 kg",
      tamano: "mediano",
      descripcion: "Es un señor gato, muy tranquilo y dormilón. Necesita cepillado constante para mantener su pelaje.",
      estado: "Disponible",
      urgente: false,
      protectora: "Refugio Els Amics",
      caracteristicas: ["Tranquilo", "Pelo largo", "Piso"],
      cssClass: "img-kitten"
    }
  ];

  useEffect(() => {
    setAnimales(mockData);
    setCargando(false);
  }, []);

  const abrirModal = (animal) => {
    setAnimalSeleccionado(animal);
    setShowModal(true);
    document.body.style.overflow = "hidden";
  };

  const cerrarModal = () => {
    setShowModal(false);
    setAnimalSeleccionado(null);
    document.body.style.overflow = "auto";
  };

  const animalesFiltrados = animales.filter((animal) => {
    const coincideEspecie = 
      filtroEspecie === "todos" || 
      (filtroEspecie === "perros" && animal.especie === "perro") || 
      (filtroEspecie === "gatos" && animal.especie === "gato");

    const coincideEdad = 
      filtroEdad === "todas" || 
      animal.rangoEdad === filtroEdad;

    const coincideTamano = 
      filtroTamano === "todos" || 
      animal.tamano === filtroTamano;

    return coincideEspecie && coincideEdad && coincideTamano;
  });

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: "var(--rp-hueso)" }}>
      <div className="bg-principal border-bottom py-5" style={{ borderColor: "var(--rp-linea) !important" }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <span className="badge mb-3 rp-eyebrow" style={{ backgroundColor: "var(--rp-papel)", color: "var(--rp-pino)", padding: "0.5rem 1rem" }}>
                ENCUENTRA A TU MEJOR AMIGO
              </span>
              <h1 className="display-5 mb-3">
                Buscan un <span style={{ color: "var(--rp-verde)" }}>hogar</span>
              </h1>
              <p className="fs-5 mb-0" style={{ color: "var(--rp-pino)" }}>
                Descubre a los animales que están esperando una segunda oportunidad en las protectoras de tu zona.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid py-5 flex-grow-1">
        <div className="container">
          <div className="p-3 p-md-4 mb-5" style={{ backgroundColor: "var(--rp-papel)", borderRadius: "var(--bs-border-radius-xl)", border: "1px solid var(--rp-linea)" }}>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
              <div className="d-flex flex-nowrap gap-2 w-100 w-md-auto overflow-auto pb-1 pb-md-0">
                <button 
                  className={`btn rounded-pill px-4 text-nowrap ${filtroEspecie === "todos" ? "btn-primary" : "btn-light"}`}
                  onClick={() => setFiltroEspecie("todos")}
                >
                  🐶 Todos
                </button>
                <button 
                  className={`btn rounded-pill px-4 text-nowrap ${filtroEspecie === "perros" ? "btn-primary" : "btn-light"}`}
                  onClick={() => setFiltroEspecie("perros")}
                >
                  Perros
                </button>
                <button 
                  className={`btn rounded-pill px-4 text-nowrap ${filtroEspecie === "gatos" ? "btn-primary" : "btn-light"}`}
                  onClick={() => setFiltroEspecie("gatos")}
                >
                  Gatos
                </button>
              </div>
              
              <div className="d-flex flex-nowrap gap-2 w-100 w-md-auto justify-content-start justify-content-md-end">
                <select 
                  className="form-select form-select-sm rounded-pill text-secondary" 
                  style={{ width: "130px", borderColor: "var(--rp-linea)", backgroundColor: "var(--rp-hueso)" }}
                  value={filtroEdad}
                  onChange={(e) => setFiltroEdad(e.target.value)}
                >
                  <option value="todas">Edad</option>
                  <option value="cachorro">Cachorro</option>
                  <option value="adulto">Adulto</option>
                  <option value="senior">Senior</option>
                </select>

                <select 
                  className="form-select form-select-sm rounded-pill text-secondary" 
                  style={{ width: "130px", borderColor: "var(--rp-linea)", backgroundColor: "var(--rp-hueso)" }}
                  value={filtroTamano}
                  onChange={(e) => setFiltroTamano(e.target.value)}
                >
                  <option value="todos">Tamaño</option>
                  <option value="pequeno">Pequeño</option>
                  <option value="mediano">Mediano</option>
                  <option value="grande">Grande</option>
                </select>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="fw-bold mb-0" style={{ color: "var(--rp-pino)" }}>Mostrando {animalesFiltrados.length} animales</h5>
          </div>

          {cargando ? (
            <div className="d-flex justify-content-center py-5 my-5">
              <div className="spinner-grow" style={{ color: "var(--rp-verde)" }} role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : (
            <>
              {animalesFiltrados.length > 0 ? (
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 row-cols-xl-4">
                  {animalesFiltrados.map((item) => (
                    <div className="col" key={item.id}>
                      <AnimalCard animal={item} onConocemeClick={() => abrirModal(item)} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5 my-5">
                  <h4 style={{ color: "var(--rp-gris)" }}>No se encontraron animales con los filtros seleccionados 🐾</h4>
                  <button 
                    className="btn btn-outline-primary rounded-pill mt-3 px-4"
                    onClick={() => { setFiltroEspecie("todos"); setFiltroEdad("todas"); setFiltroTamano("todos"); }}
                  >
                    Restablecer filtros
                  </button>
                </div>
              )}
              
              {animalesFiltrados.length > 0 && (
                <div className="d-flex justify-content-center mt-5 pt-4">
                  <button className="btn btn-outline-primary rounded-pill px-5 py-3 d-flex align-items-center gap-2">
                    Cargar más animales
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />

      {showModal && animalSeleccionado && (
        <>
          <div className="modal-backdrop fade show" style={{ backgroundColor: "var(--rp-tinta)", opacity: 0.65 }}></div>
          <div className="modal fade show d-block" tabIndex="-1" onClick={cerrarModal}>
            <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content shadow-lg border-0" style={{ backgroundColor: "var(--rp-papel)", borderRadius: "var(--bs-border-radius-xl)" }}>
                <div className="modal-header border-bottom-0 pb-0 pt-4 px-4">
                  <h2 className="modal-title rp-figure mb-0" style={{ color: "var(--rp-pino)" }}>
                    {animalSeleccionado.nombre}
                  </h2>
                  <button type="button" className="btn-close" onClick={cerrarModal}></button>
                </div>

                <div className="modal-body p-4">
                  <div className="row g-4">
                    <div className="col-md-5">
                      <div className="position-relative h-100">
                        <div 
                          className={`card-placeholder ${animalSeleccionado.cssClass} w-100 rounded-4`}
                          style={{ minHeight: "280px" }}
                        ></div>
                        <div className="position-absolute top-0 start-0 p-3">
                           <span className="badge" style={{ backgroundColor: "var(--rp-verde)", color: "var(--rp-papel)" }}>
                             {animalSeleccionado.estado}
                           </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-7 d-flex flex-column">
                      <div className="mb-3 d-flex justify-content-between align-items-center">
                        <h4 className="mb-0 text-capitalize" style={{ color: "var(--rp-gris)" }}>{animalSeleccionado.tipo}</h4>
                      </div>

                      <div className="d-flex gap-3 mb-4">
                        <div className="p-3 rounded-3 flex-fill text-center" style={{ backgroundColor: "var(--rp-hueso)", border: "1px solid var(--rp-linea)" }}>
                           <span className="rp-eyebrow d-block mb-1">Edad</span>
                           <strong className="fs-5" style={{ color: "var(--rp-pino)" }}>{animalSeleccionado.edad}</strong>
                        </div>
                        <div className="p-3 rounded-3 flex-fill text-center" style={{ backgroundColor: "var(--rp-hueso)", border: "1px solid var(--rp-linea)" }}>
                           <span className="rp-eyebrow d-block mb-1">Peso</span>
                           <strong className="fs-5" style={{ color: "var(--rp-pino)" }}>{animalSeleccionado.peso}</strong>
                        </div>
                      </div>

                      <p className="fs-6" style={{ color: "var(--rp-tinta)", lineHeight: "1.6" }}>
                        {animalSeleccionado.descripcion}
                      </p>

                      <div className="mb-4">
                        <h6 className="mb-3 rp-eyebrow">Características</h6>
                        <div className="d-flex flex-wrap gap-2">
                          {animalSeleccionado.caracteristicas.map((caract, idx) => (
                            <span key={idx} className="badge" style={{ backgroundColor: "var(--rp-verde-cl)", color: "var(--rp-pino)", fontSize: "0.85rem", padding: "0.5rem 0.8rem" }}>
                              ✓ {caract}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-auto p-3 rounded-3 d-flex align-items-center gap-3" style={{ backgroundColor: "var(--rp-hueso)" }}>
                        <div className="rp-thumb" style={{ backgroundColor: "var(--rp-verde)", fontSize: "1.2rem", color: "var(--rp-papel)" }}>📍</div>
                        <div>
                          <span className="rp-eyebrow d-block mb-1">Se encuentra en</span>
                          <strong style={{ color: "var(--rp-pino)" }}>{animalSeleccionado.protectora}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top-0 pt-0 px-4 pb-4">
                  <button className="btn btn-light" onClick={cerrarModal}>Cerrar</button>
                  <button className="btn btn-primary px-5">Adoptar a {animalSeleccionado.nombre}</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Adoptar;