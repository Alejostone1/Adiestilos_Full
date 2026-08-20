import React from 'react';
import { useCarrito } from '../../context/CarritoContext';

const BotonCarrito = ({ className = '' }) => {
  const { toggleCarrito, obtenerCantidadTotal } = useCarrito();
  const cantidad = obtenerCantidadTotal();

  return (
    <button
      onClick={toggleCarrito}
      className={`relative p-2 rounded-lg hover:bg-gray-100 transition-colors ${className}`}
      aria-label="Abrir carrito"
    >
      <svg
        className="w-6 h-6 text-gray-700"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
      
      {cantidad > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center px-1.5 text-xs font-bold text-white bg-orange-500 rounded-full animate-pulse">
          {cantidad > 99 ? '99+' : cantidad}
        </span>
      )}
    </button>
  );
};

export default BotonCarrito;
