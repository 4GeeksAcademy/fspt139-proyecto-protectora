import React from "react";

export const Privacidad = () => {
    return (
        <div className="min-vh-100 py-5" style={{ backgroundColor: "var(--rp-hueso)" }}>
            <div className="container py-4">
                <div className="card shadow-sm border-0 rounded-4 p-4 p-md-5" style={{ backgroundColor: "var(--rp-papel)" }}>
                    <h1 className="mb-4 rp-figure" style={{ color: "var(--rp-pino)" }}>Política de Privacidad</h1>

                    <div style={{ color: "var(--rp-tinta)", lineHeight: "1.7" }}>
                        <p className="text-muted mb-5">Última actualización: Septiembre 2026</p>

                        <h3 className="h4 mb-3" style={{ color: "var(--rp-verde)" }}>1. Información que Recopilamos</h3>
                        <p>
                            Recopilamos la información personal que nos proporcionas directamente al registrarte en la plataforma, 
                            tales como tu nombre, apellidos, correo electrónico, teléfono y datos relacionados con la protectora 
                            o entidad a la que representas.
                        </p>

                        <h3 className="h4 mb-3 mt-4" style={{ color: "var(--rp-verde)" }}>2. Uso de la Información</h3>
                        <p>
                            Utilizamos los datos recopilados exclusivamente para gestionar las cuentas de usuarios, facilitar la 
                            comunicación entre voluntarios y protectoras, coordinar procesos de adopción y asegurar el correcto 
                            funcionamiento de los servicios de la plataforma Cobijo.
                        </p>

                        <h3 className="h4 mb-3 mt-4" style={{ color: "var(--rp-verde)" }}>3. Protección de Datos</h3>
                        <p>
                            Implementamos medidas de seguridad técnicas y organizativas adecuadas para proteger tu información personal 
                            contra acceso no autorizado, alteración, divulgación o destrucción.
                        </p>

                        <h3 className="h4 mb-3 mt-4" style={{ color: "var(--rp-verde)" }}>4. Tus Derechos</h3>
                        <p>
                            Tienes derecho a acceder, rectificar o solicitar la eliminación de tus datos personales directamente 
                            desde la configuración de tu perfil o poniéndote en contacto con el equipo de administración.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};