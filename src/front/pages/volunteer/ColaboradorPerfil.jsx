import React, {useEffect, useRef, useState} from "react";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { SectionCard } from "../../components/protectora/SectionCard";
import { fetchProfile, updateProfile } from "../../services/authServices";
import { generarIniciales } from "../../utils/iniciales";
import {usePageTitle} from "../../hooks/usePageTitle";
import { calcularFuerzaPassword, PASSWORD_MIN_LENGTH } from "../../utils/format";


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

  const [passwordForm, setPasswordForm] = useState({ current_password: "", password: "", password2: "" });
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const fuerzaPassword = calcularFuerzaPassword(passwordForm.password);


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

  const handlePasswordField = (campo, valor) => {
    setPasswordForm((prev) => ({ ...prev, [campo]: valor }));
    setAviso("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError("");
    try {
      const nuevaPassword = passwordForm.password;

      if (nuevaPassword) {
        if (!passwordForm.current_password) {
          throw new Error("Debes indicar tu contraseña actual.");
        }
        if (nuevaPassword.length < PASSWORD_MIN_LENGTH) {
          throw new Error(`La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`);
        }
        if (nuevaPassword !== passwordForm.password2) {
          throw new Error("Las contraseñas no coinciden.");
        }
      }

      const payload = nuevaPassword
        ? { ...form, current_password: passwordForm.current_password, password: nuevaPassword, password2: passwordForm.password2 }
        : form;

      const datos = await updateProfile(payload);
      setForm(aFormulario(datos));
      setPasswordForm({ current_password: "", password: "", password2: "" });
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

          <SectionCard number={3} title="Cambiar contraseña" subtitle="Déjalo en blanco si no quieres cambiarla." unlocked>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label" htmlFor="current_password">Contraseña actual</label>
                <input
                  id="current_password"
                  type={mostrarPassword ? "text" : "password"}
                  className="form-control"
                  value={passwordForm.current_password}
                  onChange={(e) => handlePasswordField("current_password", e.target.value)}
                  autoComplete="current-password"
                />
              </div>

              <div className="col-12 col-sm-6">
                <label className="form-label" htmlFor="password">Nueva contraseña</label>
                <div className="input-group">
                  <input
                    id="password"
                    type={mostrarPassword ? "text" : "password"}
                    className="form-control"
                    placeholder={`Mínimo ${PASSWORD_MIN_LENGTH} caracteres`}
                    value={passwordForm.password}
                    onChange={(e) => handlePasswordField("password", e.target.value)}
                    minLength={PASSWORD_MIN_LENGTH}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="btn btn-light border text-secondary"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    <i className={`fa-solid ${mostrarPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                  </button>
                </div>
                {passwordForm.password && (
                  <div className="mt-2">
                    <div className="progress" style={{ height: "6px" }}>
                      <div
                        className={`progress-bar ${fuerzaPassword.colorClass}`}
                        style={{ width: `${(fuerzaPassword.nivel / 3) * 100}%` }}
                      />
                    </div>
                    <small className="text-muted">{fuerzaPassword.label}</small>
                  </div>
                )}
              </div>

              <div className="col-12 col-sm-6">
                <label className="form-label" htmlFor="password2">Repite la contraseña</label>
                <input
                  id="password2"
                  type={mostrarPassword ? "text" : "password"}
                  className="form-control"
                  value={passwordForm.password2}
                  onChange={(e) => handlePasswordField("password2", e.target.value)}
                  minLength={PASSWORD_MIN_LENGTH}
                  autoComplete="new-password"
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