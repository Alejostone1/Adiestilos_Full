/**
 * @file HeroSection.jsx
 * @brief Componente de la sección hero de la página principal.
 *
 * Esta sección presenta un banner atractivo con un mensaje principal y un botón de acción.
 */

import React from 'react';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <div className="hero-section">
      <div
        className="hero-background"
        style={{
          backgroundImage: `url('https://placehold.co/1920x600/cccccc/ffffff?text=Adi+Estilos')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: '10rem 1rem',
          textAlign: 'center',
          color: 'white'
        }}
      >
        <h1 className="display-4 fw-bold" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
          Tu Look, Tu Esencia
        </h1>
        <p className="lead fw-normal" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
          Descubre las últimas tendencias y encuentra el estilo que te define.
        </p>
        <Button as={Link} to="/catalogo" variant="primary" size="lg">
          Explorar Colección
        </Button>
      </div>
    </div>
  );
};

export default HeroSection;
