import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {login} from "../services/authServices";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Login = () => {
    const navigate = useNavigate()

    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({ user: "", password: "" });
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };
    const { store, dispatch } = useGlobalReducer()

    //prevenimos si ya estas identificado, redirigir a home
    useEffect(() => {
        if (store.token) {
            navigate("/");
        }
    }, [store.token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const { token, user } = await login(form.user, form.password);
            dispatch({ type: "LOGIN", payload: {token, user} });
            navigate("/")


        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="container py-5 d-flex justify-content-center">
            <div className="card shadow-sm border-0" style={{ maxWidth: "420px", width: "100%" }}>
                <div className="card-body p-4 p-md-5">

                    {error && (
                        <div className="alert alert-danger alert-dismissible fade show" role="alert">
                            <p className="mb-0">{error}</p>
                            <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
                        </div>

                    )}

                    <h1 className="text-center fs-3 fw-bold mb-2 text-primary">Inicia sesión</h1>
                    <p className="text-center mb-4 text-secondary">Accede para colaborar o gestionar tu protectora.</p>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="user" className="form-label">Correo electrónico</label>
                            <input
                                type="email"
                                id="user"
                                name="user"
                                className="form-control"
                                placeholder="tu@correo.com"
                                value={form.user}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="mb-2">
                            <div className="d-flex justify-content-between align-items-center">
                                <label htmlFor="password" className="form-label">Contraseña</label>
                            </div>
                            <div className="input-group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    className="form-control"
                                    placeholder="Tu contraseña"
                                    value={form.password}
                                    onChange={handleChange}
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

                        <div className="d-flex justify-content-between align-items-center mb-4 mt-3">
                            <Link to="/recovery" className="small text-primary">¿Has olvidado tu contraseña?</Link>
                        </div>

                        <button onClick={handleSubmit} className="btn btn-primary w-100 mb-4">Entrar</button>
                    </form>

                    <p className="text-center small mb-0 text-secondary">
                        ¿Todavía no tienes cuenta? <Link to="/signup" className="fw-semibold text-primary">Créala aquí</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
