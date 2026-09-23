import React, {useEffect, useRef, useState} from "react";
import { Link } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { SectionCard } from "../../components/protectora/SectionCard";
import { getShelterProfile, updateShelterProfile } from "../../services/sheltersService";
import { cargarMediaUrl } from "../../services/animalsService";
import { generarIniciales } from "../../utils/iniciales";
import { usePageTitle } from "../../hooks/usePageTitle";

// campos de texto editables (el tipo va aparte porque llega anidado)
const CAMPOS = ["name", "description", "logo_url", "email", "phone", "website", "instagram", "address"];

// protectora del backend -> valores del formulario (null -> "" para que los inputs sean controlados)
const aFormulario = (protectora) => ({
  ...Object.fromEntries(CAMPOS.map((campo) => [campo, protectora[campo] ?? ""])),
  // el PUT espera el UUID del tipo, no el id entero que viene en protectora.shelter_type_id
  shelter_type_id: protectora.shelter_type.shelter_type_id,
});

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

export const ProtectoraPerfil = () => {
  const { store, dispatch } = useGlobalReducer();

  const [protectora, setProtectora] = useState(null);
  const [form, setForm] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [logoRoto, setLogoRoto] = useState(false);
  const errorRef = useRef(null);

  usePageTitle("Panel · Perfil");

  useEffect(() => {
    getShelterProfile()
      .then((datos) => {
        setProtectora(datos);
        setForm(aFormulario(datos));
      })
      .catch((err) => setErrorCarga(err.message))
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => {
    if (error || aviso) errorRef.current?.focus();
  }, [error, aviso]);

  const handleField = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setAviso("");
    if (campo === "logo_url") setLogoRoto(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError("");
    try {
      const datos = await updateShelterProfile(form);
      setProtectora(datos);
      setForm(aFormulario(datos));
      if (datos.map_positioning) {
        dispatch({ type: "set_user_location", payload: datos.map_positioning });
      }
      setAviso("Cambios guardados");
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-2">Perfil de la protectora</h2>
          <p className="mb-0">Estos son los datos que aparecen en vuestra ficha pública.</p>
        </div>
        {protectora && (
          <Link to={`/protectoras/${protectora.shelter_id}`} className="btn btn-outline-secondary rounded-pill px-4">
            Ver perfil público
          </Link>
        )}
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

          <SectionCard number={1} title="Identidad de la Protectora" subtitle="Cómo os reconocen las personas colaboradoras." unlocked>
            <div className="d-flex align-items-center gap-3 mb-3">
              <div
                className="rounded-circle overflow-hidden d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: "72px", height: "72px", backgroundColor: "var(--rp-verde-cl)" }}
              >
                {form.logo_url && !logoRoto ? (
                  <img
                    src={cargarMediaUrl(form.logo_url)}
                    alt=""
                    className="w-100 h-100"
                    style={{ objectFit: "cover" }}
                    onError={() => setLogoRoto(true)}
                  />
                ) : (
                  <span className="fw-bold fs-4" style={{ color: "var(--rp-verde)" }}>
                    {generarIniciales(form.name)}
                  </span>
                )}
              </div>
              <div className="flex-grow-1">
                <label className="form-label" htmlFor="logo_url">
                  URL del logo
                </label>
                <input
                  id="logo_url"
                  type="url"
                  className="form-control"
                  value={form.logo_url}
                  placeholder="https://…"
                  onChange={(e) => handleField("logo_url", e.target.value)}
                />
              </div>
            </div>

            <div className="row g-3">
              <Campo id="name" label="Nombre" value={form.name} onChange={handleField} required />
              <div className="col-12 col-sm-6">
                <label className="form-label" htmlFor="shelter_type_id">
                  Tipo de entidad
                </label>
                <select
                  id="shelter_type_id"
                  className="form-select"
                  value={form.shelter_type_id}
                  onChange={(e) => handleField("shelter_type_id", e.target.value)}
                >
                  {store.shelterTypes.map((tipo) => (
                    <option key={tipo.shelter_type_id} value={tipo.shelter_type_id}>
                      {tipo.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12">
                <label className="form-label" htmlFor="description">
                  Descripción
                </label>
                <textarea
                  id="description"
                  className="form-control"
                  rows={4}
                  value={form.description}
                  onChange={(e) => handleField("description", e.target.value)}
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard number={2} title="Contacto" subtitle="Dónde pueden encontraros y escribiros." unlocked>
            <div className="row g-3">
              <Campo id="email" label="Email" type="email" value={form.email} onChange={handleField} required />
              <Campo id="phone" label="Teléfono" type="tel" value={form.phone} onChange={handleField} required />
              <Campo id="website" label="Web" type="url" value={form.website} onChange={handleField} placeholder="https://…" />
              <Campo id="instagram" label="Instagram" value={form.instagram} onChange={handleField} placeholder="@vuestracuenta" />
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