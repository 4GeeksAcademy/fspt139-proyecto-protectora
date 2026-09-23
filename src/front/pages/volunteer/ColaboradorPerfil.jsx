import React, {useEffect, useRef, useState} from "react";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { SectionCard } from "../../components/protectora/SectionCard";
import { fetchProfile, updateProfile } from "../../services/authServices";
import { generarIniciales } from "../../utils/iniciales";
import {usePageTitle} from "../../hooks/usePageTitle";
 
// campos editables del usuario (los mismos que acepta PUT /api/profile)
const CAMPOS = ["name", "last_name1", "last_name2", "email", "phone", "address"];
 
// usuario del backend -> valores del formulario (null -> "" para que los inputs sean controlados)
const aFormulario = (usuario) => Object.fromEntries(CAMPOS.map((campo) => [campo, usuario[campo] ?? ""]));
 
const Campo = ({ id, label, value, onChange, type = "text", required = false, placeholder = "" }) => (
  <div className="col-12 col-sm-6">
    <label className="form-label" htmlFor={id}>
      {label}
      {required && " *"}
    </label>
    <input id={id} type={type} className="form-control" value={value} required={required}
      placeholder={placeholder} onChange={(e) => onChange(id, e.target.value)} />
  </div>
);
 
export const ColaboradorPerfil = () => {
  const { dispatch } = useGlobalReducer();
 
  const [form, setForm] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [guardando, setGuardando] = useState(false);
  const errorRef = useRef(null);


  usePageTitle("Ajustes");

  useEffect(() => {
    fetchProfile()
      .then((datos) => setForm(aFormulario(datos)))
      .catch((err) => setErrorCarga(err.message))
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => {
    if (error || aviso) errorRef.current?.focus();
  }, [error, aviso]);


  const handleField = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setAviso("");
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError("");
    try {
      const datos = await updateProfile(form);
      setForm(aFormulario(datos));
      // el navbar pinta el nombre desde el store: sin esto seguiría mostrando el antiguo
      dispatch({ type: "set-user", payload: datos });
      setAviso("Cambios guardados");
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };
 
  return (
    <div className="container py-5">
      <div className="mb-4">
        <h2 className="fw-bold mb-2">Ajustes de usuario</h2>
        <p className="mb-0">Estos son los datos que ven las protectoras cuando colaboras o solicitas una adopción.</p>
      </div>
 
      {cargando ? (
        <div className="text-center text-muted py-5">Cargando perfil…</div>
      ) : errorCarga ? (
        <div className="alert alert-danger" role="alert" ref={errorRef} tabIndex={-1}>
          {errorCarga}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="col-md-8">
          {error && (
            <div className="alert alert-danger" role="alert" ref={errorRef} tabIndex={-1}>
              {error}
            </div>
          )}
          {aviso && (
            <div className="alert alert-success" role="alert" ref={errorRef} tabIndex={-1}>
              {aviso}
            </div>
          )}
 
          <SectionCard number={1} title="Datos personales" subtitle="Cómo te presentas ante las protectoras." unlocked>
            <div className="d-flex align-items-center gap-3 mb-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: "72px", height: "72px", backgroundColor: "var(--rp-verde-cl)" }}
              >
                <span className="fw-bold fs-4" style={{ color: "var(--rp-verde)" }}>
                  {generarIniciales(`${form.name} ${form.last_name1}`)}
                </span>
              </div>
              <div>
                <p className="fw-semibold mb-0">{`${form.name} ${form.last_name1} ${form.last_name2}`.trim()}</p>
                <p className="text-muted small mb-0">{form.email}</p>
              </div>
            </div>
 
            <div className="row g-3">
              <Campo id="name" label="Nombre" value={form.name} onChange={handleField} required />
              <Campo id="last_name1" label="Primer apellido" value={form.last_name1} onChange={handleField} required />
              <Campo id="last_name2" label="Segundo apellido" value={form.last_name2} onChange={handleField} />
            </div>
          </SectionCard>
 
          <SectionCard number={2} title="Contacto" subtitle="Cómo pueden escribirte las protectoras." unlocked>
            <div className="row g-3">
              <Campo id="email" label="Email" type="email" value={form.email} onChange={handleField} required />
              <Campo id="phone" label="Teléfono" type="tel" value={form.phone} onChange={handleField} required />
              <div className="col-12">
                <label className="form-label" htmlFor="address">
                  Dirección
                </label>
                <input
                  id="address"
                  className="form-control"
                  value={form.address}
                  onChange={(e) => handleField("address", e.target.value)}
                />
              </div>
            </div>
          </SectionCard>
 
          <button type="submit" className="btn btn-success rounded-pill px-4" disabled={guardando}>
            {guardando ? "Guardando…" : "Guardar cambios"}
          </button>
        </form>
      )}
    </div>
  );
};