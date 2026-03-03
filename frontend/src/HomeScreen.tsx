import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomeScreen.css';

export const HomeScreen = () => {
  const navigate = useNavigate();

  const handleFirmarClick = () => {
    console.log('📝 [HOME] Navegando a escanear QR para firmar');
    navigate('/sign');
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Sistema de Firmas</h1>
        <p>Presiona el botón para generar un código QR y comenzar el proceso de firma</p>
        <button 
          className="btn-firmar" 
          onClick={handleFirmarClick}
        >
          Firmar y Completar
        </button>
      </div>
    </div>
  );
};
