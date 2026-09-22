import React from 'react';
import { Link } from 'react-router-dom';

export const TerminosyPrivacidad = () => {
  return (
    <div className="container mt-4 mb-5" style={{ maxWidth: '900px' }}>
      
      {/* Migas de pan (Breadcrumbs) */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/" className="text-decoration-none text-muted">Inicio</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">Términos y Privacidad</li>
        </ol>
      </nav>

      {/* Tarjeta principal blanca */}
      <div className="bg-white p-4 p-md-5 rounded-4 shadow-sm">
        
        {/* Cabecera */}
        <div className="text-center mb-5">
          <h2 className="fw-bold mb-2" style={{ color: '#2e8b57' }}>
            Términos de Servicio y Política de Privacidad
          </h2>
          <p className="text-muted">Última actualización: Septiembre 2026</p>
        </div>

        {/* Sección 1: Términos y Condiciones */}
        <div className="mb-5">
          <div 
            className="p-2 mb-3 rounded" 
            style={{ backgroundColor: '#3b8640', color: 'white' }}
          >
            <h4 className="m-0 fs-5">1. Términos y Condiciones</h4>
          </div>
          
          <ul className="text-secondary" style={{ lineHeight: '1.8' }}>
            <li><strong>El acceso y uso</strong> de la plataforma RED PROTECTORA implica la aceptación plena de estos términos.</li>
            <li><strong>Modificaciones:</strong> Nos reservamos el derecho de modificar estos términos en cualquier momento notificando en la plataforma.</li>
            <li><strong>Uso de la Plataforma:</strong> El usuario se compromete a utilizar la plataforma conforme a la ley y las buenas costumbres.</li>
            <li><strong>Conducta de Usuario:</strong> Cualquier conducta que vulnere a las protectoras o los animales resultará en la expulsión de la plataforma.</li>
            <li><strong>Propiedad Intelectual:</strong> Todo el contenido de la plataforma está protegido por las leyes de propiedad intelectual y no puede usarse sin permiso.</li>
          </ul>
        </div>

        {/* Sección 2: Política de Privacidad */}
        <div className="mb-4">
          <div 
            className="p-2 mb-3 rounded" 
            style={{ backgroundColor: '#3b8640', color: 'white' }}
          >
            <h4 className="m-0 fs-5">2. Política de Privacidad</h4>
          </div>
          
          <ul className="text-secondary" style={{ lineHeight: '1.8' }}>
            <li><strong>Recolección de Información:</strong> Recopilamos información personal básica como nombre y correo electrónico para gestionar adopciones, teléfono relacionado de la protectora o entidad a la que representa.</li>
            <li><strong>Uso de Datos:</strong> Los datos se utilizarán exclusivamente para facilitar los procesos de adopción, donación o voluntariado.</li>
            <li><strong>Compartir de Información:</strong> No compartimos información personal con terceros ajenos a la gestión directa del refugio.</li>
            <li><strong>Seguridad de Datos:</strong> Implementamos medidas de seguridad para evitar el acceso no autorizado a tus datos.</li>
            <li><strong>Cookies:</strong> La plataforma utiliza cookies para mejorar la experiencia de navegación del usuario.</li>
            <li><strong>Derechos de Usuarios:</strong> Tienes derecho a solicitar la eliminación, modificación o revisión de tus datos en nuestra base de datos en cualquier momento.</li>
          </ul>
        </div>

      </div>
    </div>
  );
};