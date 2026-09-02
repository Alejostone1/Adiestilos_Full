/**
 * @file Logo.jsx
 * @brief Logo de marca ADI ESTILOS - reutilizable en Header/Footer
 */

import React from 'react';
import { Link } from 'react-router-dom';

const Logo = ({ size = 'md', to = '/', className = '', onClick }) => {
  const sizes = {
    sm: 'h-8',
    md: 'h-9',
    lg: 'h-10',
    xl: 'h-12',
  };

  return (
    <Link to={to} onClick={onClick} className={`inline-flex items-center shrink-0 ${className}`} aria-label="Adi Estilos - Inicio">
      <img
        src="/logo-adi-estilos.jpg"
        alt="Adi Estilos"
        className={`${sizes[size] || sizes.md} w-auto object-contain`}
      />
    </Link>
  );
};

export default Logo;
