import { useState } from "react";
import { Link } from "react-router-dom";
import { signup } from "../services/authServices";

export const Signup = () => {
    const [rol, setRol] = useState("volunteer");
    const [showPassword, setShowPassword] = useState(false);
    const [aceptaTerminos, setAceptaTerminos] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        name: "",
        last_name1: "",
        last_name2: "",
        email: "",
        phone: "",
        password: "",
        password2: "",
        shelter_name: "",
        shelter_type: "",
        shelter_address: "",
        shelter_phone: "",
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!aceptaTerminos) {
            setError("Debes aceptar los términos de uso para continuar.");
            return;
        }

        if (form.password !== form.password2) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        if (form.password.length < 8) {
            setError("La contraseña debe tener al menos 8 caracteres.");
            return;
        }

        try {
            const { token, user } = await signup({ ...form, rol });
            dispatch({ type: "LOGIN", payload: { token, user } });
            navigate("/")

        } catch (error) {
            setError(error.message);
        }
    };

    const claseRol = (valor) =>
        `w-100 h-100 text-start p-3 rounded-3 border ${rol === valor
            ? "bg-primary-subtle border-primary text-primary-emphasis"
            : "bg-white border-secondary-subtle text-body"
        }`;

    return (
        <div className="container py-5 d-flex justify-content-center">
            <div className="card shadow-sm border-0" style={{ maxWidth: "560px", width: "100%" }}>
                <div className="card-body p-4 p-md-5">

                    {error && (
                        <div className="alert alert-danger" role="alert">
                            <p className="mb-0">{error}</p>
                        </div>
                    )}

                    <h1 className="text-center fs-3 fw-bold mb-2 text-primary">Crea tu cuenta</h1>
                    <p className="text-center mb-4 text-secondary">
                        Elige cómo vas a usar Red Protectora.
                    </p>

                    <div className="row g-2 mb-4">
                        <div className="col-12 col-md-6">
                            <button
                                type="button"
                                onClick={() => setRol("volunteer")}
                                className={claseRol("volunteer")}
                            >
                                <span className="d-block fw-bold">Soy voluntario</span>
                                <span className="d-block small fw-normal mt-1">
                                    Colaboro con necesidades y puedo solicitar adopciones.
                                </span>
                            </button>
                        </div>
                        <div className="col-12 col-md-6">
                            <button
                                type="button"
                                onClick={() => setRol("shelter_admin")}
                                className={claseRol("shelter_admin")}
                            >
                                <span className="d-block fw-bold">Soy protectora</span>
                                <span className="d-block small fw-normal mt-1">
                                    Publico necesidades y gestiono los animales del refugio.
                                </span>
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <h2 className="fs-6 fw-bold mb-3">Tus datos</h2>

                        <div className="row g-3">
                            <div className="col-md-6">
                                <label htmlFor="name" className="form-label">Nombre</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    className="form-control"
                                    value={form.name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="col-md-6">
                                <label htmlFor="last_name1" className="form-label">Primer apellido</label>
                                <input
                                    type="text"
                                    id="last_name1"
                                    name="last_name1"
                                    className="form-control"
                                    value={form.last_name1}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="mt-3">
                            <label htmlFor="last_name2" className="form-label">
                                Segundo apellido <span className="text-secondary fw-normal">(opcional)</span>
                            </label>
                            <input
                                type="text"
                                id="last_name2"
                                name="last_name2"
                                className="form-control"
                                value={form.last_name2}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="row g-3 mt-0">
                            <div className="col-md-6">
                                <label htmlFor="email" className="form-label">Correo electrónico</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className="form-control"
                                    placeholder="tu@correo.com"
                                    value={form.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="col-md-6">
                                <label htmlFor="phone" className="form-label">Teléfono</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    className="form-control"
                                    placeholder="600 000 000"
                                    value={form.phone}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="mt-3">
                            <label htmlFor="password" className="form-label">Contraseña</label>
                            <div className="input-group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    className="form-control"
                                    placeholder="Mínimo 8 caracteres"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                    minLength={8}
                                />
                                <button
                                    type="button"
                                    className="btn btn-light border text-secondary"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? "Ocultar" : "Mostrar"}
                                </button>
                            </div>
                        </div>

                        <div className="mt-3">
                            <label htmlFor="password2" className="form-label">Repite la contraseña</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password2"
                                name="password2"
                                className="form-control"
                                placeholder="Vuelve a escribirla"
                                value={form.password2}
                                onChange={handleChange}
                            />
                        </div>

                        {rol === "shelter_admin" && (
                            <div className="border-top mt-4 pt-4">
                                <h2 className="fs-6 fw-bold mb-3">
                                    Datos de la protectora o entidad a la que representas
                                </h2>

                                <div className="mb-3">
                                    <label htmlFor="shelter_name" className="form-label">
                                        Nombre de la protectora
                                    </label>
                                    <input
                                        type="text"
                                        id="shelter_name"
                                        name="shelter_name"
                                        className="form-control"
                                        placeholder="Protectora Huellas"
                                        value={form.shelter_name}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="shelter_type" className="form-label">Tipo de entidad</label>
                                    <select
                                        id="shelter_type"
                                        name="shelter_type"
                                        className="form-select"
                                        value={form.shelter_type}
                                        onChange={handleChange}
                                    >
                                        <option value="">Selecciona una opción…</option>
                                        <option value="protectora">Protectora</option>
                                        <option value="asociacion">Asociación</option>
                                        <option value="rescatista">Rescatista independiente</option>
                                        <option value="colonia">Colonia felina</option>
                                        <option value="acogida">Casa de acogida</option>
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="shelter_address" className="form-label">Dirección</label>
                                    <input
                                        type="text"
                                        id="shelter_address"
                                        name="shelter_address"
                                        className="form-control"
                                        placeholder="Dirección completa"
                                        value={form.shelter_address}
                                        onChange={handleChange}
                                    />
                                    <p className="form-text">
                                        Si no tenéis refugio físico, pon el punto de recogida habitual.
                                    </p>
                                </div>

                                <div className="mb-0">
                                    <label htmlFor="shelter_phone" className="form-label">
                                        Teléfono de la protectora
                                    </label>
                                    <input
                                        type="tel"
                                        id="shelter_phone"
                                        name="shelter_phone"
                                        className="form-control"
                                        placeholder="918 00 00 00"
                                        value={form.shelter_phone}
                                        onChange={handleChange}
                                    />
                                    <p className="form-text mb-0">
                                        Este es el que ven los colaboradores, no tu teléfono personal.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="form-check mt-4">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id="terminos"
                                checked={aceptaTerminos}
                                onChange={(e) => setAceptaTerminos(e.target.checked)}
                                required
                            />
                            <label className="form-check-label" htmlFor="terminos">
                                Acepto los <Link to="/terminos">términos de uso</Link> y la{" "}
                                <Link to="/privacidad">política de privacidad</Link>.
                            </label>
                        </div>

                        <button type="submit" className="btn btn-primary w-100 mt-4">
                            {rol === "shelter_admin" ? "Registrar protectora" : "Crear cuenta"}
                        </button>
                    </form>

                    <p className="text-center small mb-0 mt-4 text-secondary">
                        ¿Ya tienes cuenta?{" "}
                        <Link to="/login" className="fw-semibold text-primary">Inicia sesión</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};