import React from 'react';
import { Link } from 'react-router-dom';

export const NotFound = () => {
  return (
    <div className="not-found-animal-wrapper">
      {/* Estilos y animaciones CSS integrados directamente en el componente */}
      <style>{`
        .not-found-animal-wrapper {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: #f1f8f5;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 999999;
        }

        .not-found-animal-content {
          text-align: center;
          padding: 40px 20px;
          max-width: 500px;
          width: 90%;
          display: flex;
          flex-direction: column;
          align-items: center;
          animation: aparecer 0.6s ease-out;
        }

        .animated-dog {
          width: 100%;
          max-width: 300px;
          height: auto;
          margin-bottom: 20px;
          filter: drop-shadow(0px 10px 15px rgba(0,0,0,0.1));
        }

        .dog-tail {
          transform-origin: 200px 220px;
          animation: moverCola 0.3s infinite alternate ease-in-out;
        }

        .dog-eye {
          transform-origin: center;
          animation: parpadear 4s infinite;
        }

        .dog-ear-left {
          transform-origin: 100px 90px;
          animation: moverOrejaIzq 3s infinite;
        }

        .dog-ear-right {
          transform-origin: 200px 90px;
          animation: moverOrejaDer 3s infinite alternate;
        }

        .title-animal {
          color: #1a5233;
          font-size: 2.2rem;
          font-weight: 900;
          margin-bottom: 10px;
        }

        .text-animal {
          color: #4d4d4d;
          font-size: 1.1rem;
          margin-bottom: 30px;
          line-height: 1.5;
        }

        .btn-animal-cobijo {
          background-color: #2e8b57;
          color: white;
          text-decoration: none;
          padding: 15px 40px;
          border-radius: 50px;
          font-weight: bold;
          font-size: 1.2rem;
          transition: all 0.3s ease;
          box-shadow: 0 10px 20px rgba(46, 139, 87, 0.2);
        }

        .btn-animal-cobijo:hover {
          background-color: #1a5233;
          color: white;
          transform: translateY(-5px);
          box-shadow: 0 15px 25px rgba(46, 139, 87, 0.3);
        }

        @keyframes aparecer {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes moverCola {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(20deg); }
        }

        @keyframes parpadear {
          0%, 48%, 52%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.1); }
        }

        @keyframes moverOrejaIzq {
          0%, 90%, 100% { transform: rotate(0deg); }
          95% { transform: rotate(-8deg); }
        }

        @keyframes moverOrejaDer {
          0%, 90%, 100% { transform: rotate(0deg); }
          95% { transform: rotate(8deg); }
        }
      `}</style>

      <div className="not-found-animal-content">
        {/* SVG del perrito interactivo */}
        <svg viewBox="0 0 300 300" className="animated-dog" xmlns="http://www.w3.org/2000/svg">
          {/* Cola animada */}
          <path className="dog-tail" d="M 200 220 Q 260 240 250 180" stroke="#C39B57" strokeWidth="20" strokeLinecap="round" fill="none" />
          
          {/* Cuerpo */}
          <path d="M 90 140 Q 90 260 210 260 L 210 140 Z" fill="#E2C792" />
          
          {/* Orejas */}
          <g className="dog-ear-left">
            <ellipse cx="100" cy="90" rx="20" ry="45" fill="#C39B57" transform="rotate(-20 100 90)" />
          </g>
          <g className="dog-ear-right">
            <ellipse cx="200" cy="90" rx="20" ry="45" fill="#C39B57" transform="rotate(20 200 90)" />
          </g>
          
          {/* Cabeza */}
          <circle cx="150" cy="130" r="60" fill="#E2C792" />
          
          {/* Ojos animados */}
          <circle cx="125" cy="115" r="8" fill="#333" className="dog-eye" />
          <circle cx="175" cy="115" r="8" fill="#333" className="dog-eye" />
          
          {/* Hocico */}
          <ellipse cx="150" cy="140" rx="15" ry="10" fill="#333" />
          
          {/* Cartel 404 */}
          <rect x="65" y="170" width="170" height="70" rx="10" fill="#ffffff" stroke="#2e8b57" strokeWidth="5" />
          <text x="150" y="222" fontSize="55" fontWeight="900" fill="#2e8b57" textAnchor="middle" fontFamily="Nunito, sans-serif">404</text>
          
          {/* Patitas sosteniendo el cartel */}
          <circle cx="75" cy="180" r="15" fill="#C39B57" />
          <circle cx="225" cy="180" r="15" fill="#C39B57" />
        </svg>

        <h2 className="title-animal">¡Guau! Te has perdido</h2>
        <p className="text-animal">
          Parece que la página que buscas no existe... o alguno de los peludos de <strong>Red Protectora</strong> se llevó el cable para jugar.
        </p>
        
        <Link to="/" className="btn-animal-cobijo">
          Volver al refugio
        </Link>
      </div>
    </div>
  );
};