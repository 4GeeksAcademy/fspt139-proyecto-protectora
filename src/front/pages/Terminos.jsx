import React from "react";

export const Terminos = () => {
    return (
        <div className="min-vh-100 py-5" style={{ backgroundColor: "var(--rp-hueso)" }}>
            <div className="container py-4">
                <div className="card shadow-sm border-0 rounded-4 p-4 p-md-5" style={{ backgroundColor: "var(--rp-papel)" }}>
                    <h1 className="mb-4 rp-figure" style={{ color: "var(--rp-pino)" }}>Términos y Condiciones de Uso</h1>

                    <div style={{ color: "var(--rp-tinta)", lineHeight: "1.7" }}>
                        <p className="text-muted mb-5">Última actualización: Septiembre 2026</p>

                        <h3 className="h4 mb-3" style={{ color: "var(--rp-verde)" }}>1. Uso adecuado</h3>
                        <p>
                            Te comprometes a proporcionar información veraz al crear tu cuenta y al interactuar con las protectoras de la plataforma.
                        </p>

                        <h3 className="h4 mb-3 mt-4" style={{ color: "var(--rp-verde)" }}>2. Responsabilidad</h3>
                        <p>
                            Las adopciones y donaciones son acuerdos directos entre el usuario y la protectora. La plataforma actúa como un medio de contacto y gestión, facilitando la visibilidad de los animales que necesitan un hogar.
                        </p>

                        <h3 className="h4 mb-3 mt-4" style={{ color: "var(--rp-verde)" }}>3. Prohibiciones</h3>
                        <p>
                            Queda estrictamente prohibido el uso de la plataforma para fines comerciales no autorizados, spam, suplantación de identidad o cualquier actividad que pueda perjudicar el bienestar de los animales o la seguridad de los usuarios.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};