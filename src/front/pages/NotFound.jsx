import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

export const NotFound = () => {
  return (
    <div className="not-found-animal-wrapper">
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
          Parece que la página que buscas no existe... o alguno de los peludos de <strong>Red Protectora </strong> se llevó el cable para jugar.
        </p>
        
        <Link to="/" className="btn-animal-cobijo">
          Volver al refugio
        </Link>
      </div>
    </div>
  );
};