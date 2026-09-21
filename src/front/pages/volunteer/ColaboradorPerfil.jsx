import React, { useState } from "react";

export const ColaboradorPerfil = () => {
  const [perfil, setPerfil] = useState({
    nombre: "Carlos José",
    apellidos: "Contreras",
    email: "carlos.contreras@email.com",
    telefono: "",
    direccion: "",
    ciudad: "",
    codigoPostal: "",
    foto: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
  });

  const [editando, setEditando] = useState(false);
  const [cambiarPass, setCambiarPass] = useState(false);
  const [passwords, setPasswords] = useState({
    actual: "",
    nueva: "",
    confirmar: ""
  });

  const handleChange = (e) => {
    setPerfil({
      ...perfil,
      [e.target.name]: e.target.value
    });
  };

  const handlePassChange = (e) => {
    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPerfil({
        ...perfil,
        foto: imageUrl
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Datos a guardar:", perfil);
    if (cambiarPass) {
      console.log("Nuevas contraseñas:", passwords);
    }
    setEditando(false);
    setCambiarPass(false);
  };

  return (
    <div className="container py-5" style={{ maxWidth: "900px" }}>
      <div 
        className="card shadow-sm border p-4 p-md-5" 
        style={{ 
          borderRadius: "12px", 
          backgroundColor: "#fcfbfa",
          borderColor: "#e0e0e0" 
        }}
      >
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 border-bottom pb-4">
          <div>
            <h2 className="fw-bold mb-1" style={{ color: "#0f3f2b" }}>Perfil del usuario</h2>
            <p className="text-muted mb-0">Panel de COLABORADOR</p>
          </div>
          
          <div className="mt-3 mt-md-0">
            {!editando ? (
              <button 
                className="btn px-4 rounded-pill fw-semibold shadow-sm"
                style={{ backgroundColor: "#1a5233", color: "white" }}
                onClick={() => setEditando(true)}
              >
                Editar Perfil
              </button>
            ) : (
              <button 
                className="btn btn-outline-secondary px-4 rounded-pill fw-semibold"
                onClick={() => {
                  setEditando(false);
                  setCambiarPass(false);
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          
          <div className="d-flex align-items-center mb-5">
            <div className="position-relative">
              <img 
                src={perfil.foto} 
                alt="Foto de perfil" 
                className="rounded-circle border shadow-sm"
                style={{ width: "120px", height: "120px", objectFit: "cover", backgroundColor: "white" }}
              />
              {editando && (
                <label 
                  className="position-absolute bottom-0 end-0 btn btn-sm rounded-circle shadow d-flex justify-content-center align-items-center"
                  style={{ backgroundColor: "#2e8b57", color: "white", cursor: "pointer", width: "35px", height: "35px" }}
                  title="Cambiar foto"
                >
                  <i className="fa-solid fa-camera"></i>
                  <input 
                    type="file" 
                    className="d-none" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                  />
                </label>
              )}
            </div>
            <div className="ms-4">
              <h4 className="fw-bold mb-1" style={{ color: "#1a5233" }}>{perfil.nombre} {perfil.apellidos}</h4>
              <p className="text-muted mb-0">{perfil.email}</p>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-md-6">
              <label className="form-label text-muted fw-semibold">Nombre</label>
              <input 
                type="text" 
                className="form-control form-control-lg bg-white" 
                name="nombre"
                value={perfil.nombre} 
                onChange={handleChange}
                disabled={!editando}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label text-muted fw-semibold">Apellidos</label>
              <input 
                type="text" 
                className="form-control form-control-lg bg-white" 
                name="apellidos"
                value={perfil.apellidos} 
                onChange={handleChange}
                disabled={!editando}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label text-muted fw-semibold">Correo Electrónico</label>
              <input 
                type="email" 
                className="form-control form-control-lg bg-white" 
                name="email"
                value={perfil.email} 
                onChange={handleChange}
                disabled={!editando}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label text-muted fw-semibold">Teléfono</label>
              <input 
                type="tel" 
                className="form-control form-control-lg bg-white" 
                name="telefono"
                value={perfil.telefono} 
                onChange={handleChange}
                disabled={!editando}
              />
            </div>

            <div className="col-12">
              <label className="form-label text-muted fw-semibold">Dirección</label>
              <input 
                type="text" 
                className="form-control form-control-lg bg-white" 
                name="direccion"
                value={perfil.direccion} 
                onChange={handleChange}
                disabled={!editando}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label text-muted fw-semibold">Ciudad</label>
              <input 
                type="text" 
                className="form-control form-control-lg bg-white" 
                name="ciudad"
                value={perfil.ciudad} 
                onChange={handleChange}
                disabled={!editando}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label text-muted fw-semibold">Código Postal</label>
              <input 
                type="text" 
                className="form-control form-control-lg bg-white" 
                name="codigoPostal"
                value={perfil.codigoPostal} 
                onChange={handleChange}
                disabled={!editando}
              />
            </div>

            {editando && (
              <div className="col-12 mt-4">
                <div className="p-4 rounded border" style={{ backgroundColor: "#f8f9fa" }}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0 fw-bold" style={{ color: "#0f3f2b" }}>Seguridad</h5>
                    <button 
                      type="button" 
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => setCambiarPass(!cambiarPass)}
                    >
                      {cambiarPass ? "Cancelar cambio" : "Cambiar Contraseña"}
                    </button>
                  </div>
                  
                  {cambiarPass && (
                    <div className="row g-3">
                      <div className="col-md-4">
                        <input 
                          type="password" 
                          className="form-control" 
                          placeholder="Contraseña actual" 
                          name="actual"
                          value={passwords.actual}
                          onChange={handlePassChange}
                          required={cambiarPass}
                        />
                      </div>
                      <div className="col-md-4">
                        <input 
                          type="password" 
                          className="form-control" 
                          placeholder="Nueva contraseña" 
                          name="nueva"
                          value={passwords.nueva}
                          onChange={handlePassChange}
                          required={cambiarPass}
                        />
                      </div>
                      <div className="col-md-4">
                        <input 
                          type="password" 
                          className="form-control" 
                          placeholder="Confirmar nueva" 
                          name="confirmar"
                          value={passwords.confirmar}
                          onChange={handlePassChange}
                          required={cambiarPass}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {editando && (
            <div className="d-flex justify-content-end mt-5 pt-3 border-top">
              <button 
                type="submit" 
                className="btn btn-lg px-5 rounded-pill fw-bold shadow"
                style={{ backgroundColor: "#2e8b57", color: "white", border: "none" }}
              >
                Guardar Cambios
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};