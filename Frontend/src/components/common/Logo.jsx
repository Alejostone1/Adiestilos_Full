/**
 * @file Logo.jsx
 * @brief Logo de marca ADI ESTILOS - reutilizable en Header/Footer
 * Se muestra como un círculo con borde de marca para integrarse visualmente.
 */

import React from 'react';
import { Link } from 'react-router-dom';

const Logo = ({ size = 'md', to = '/', className = '', onClick, ring = true }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14',
  };

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`inline-flex items-center justify-center shrink-0 rounded-full bg-pure-white ${
        ring ? 'ring-2 ring-primary/30' : ''
      } shadow-soft-primary ${className}`}
      aria-label="Adi Estilos - Inicio"
    >
      <img
        src="/logo-adi-estilos.jpg"
        alt="Adi Estilos"
        className={`${sizes[size] || sizes.md} rounded-full object-cover`}
      />
    </Link>
  );
};

export default Logo;
