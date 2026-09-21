import React, { useState } from 'react';

const BotonCompartir = () => {
    const [mensajeCopiado, setMensajeCopiado] = useState(false);

    const handleCompartir = async () => {
        // Datos que se enviarán al menú nativo del sistema
        const datosCompartir = {
            title: document.title,              // Captura el título de tu web actual
            text: '¡Echa un vistazo a esta página!',
            url: window.location.href,          // Captura la URL actual automáticamente
        };

        // 1. Validamos si el navegador soporta la Web Share API
        if (navigator.share) {
            try {
                await navigator.share(datosCompartir);
                console.log('Contenido compartido con éxito');
            } catch (error) {
                // El error suele ocurrir si el usuario cancela la acción
                console.log('Acción cancelada o fallida:', error);
            }
        } else {
            // 2. Alternativa: Si no es compatible, copiamos la URL al portapapeles
            try {
                await navigator.clipboard.writeText(window.location.href);
                setMensajeCopiado(true);

                // Ocultar el mensaje de éxito después de 2 segundos
                setTimeout(() => setMensajeCopiado(false), 2000);
            } catch (err) {
                console.error('No se pudo copiar el enlace automáticamente', err);
            }
        }
    };

    return (
        <div style={{ display: 'inline-block', textAlign: 'center' }} className="py-3">
            <button
                onClick={handleCompartir}
                className="boton-compartir btn btn-primary"
            >
                <i className="fas fa-share-alt fw-2 me-2"></i>
                Compartir esta página
            </button>

            {/* Alerta visual solo si se activó la copia en el portapapeles */}
            {mensajeCopiado && (
                <p style={{ color: 'green', fontSize: '14px', marginTop: '5px' }}>
                    ¡Enlace copiado al portapapeles!
                </p>
            )}
        </div>
    );
};

export default BotonCompartir;