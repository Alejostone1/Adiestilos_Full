import React from 'react';

/**
 * Componente para formatear precios en pesos colombianos sin decimales
 * @param {Object} props - Props del componente
 * @param {number} props.precio - El precio a formatear
 * @param {string} props.className - Clases CSS adicionales (opcional)
 * @param {boolean} props.mostrarSimbolo - Si debe mostrar el símbolo $ (default: true)
 */
const PrecioFormateado = ({
  precio,
  className = '',
  mostrarSimbolo = true,
  moneda = 'COP'
}) => {
  // Validar que el precio sea un número válido
  if (precio === null || precio === undefined || isNaN(precio)) {
    return <span className={className}>$0</span>;
  }

  // Formatear sin decimales para pesos colombianos
  const formato = new Intl.NumberFormat('es-CO', {
    style: mostrarSimbolo ? 'currency' : 'decimal',
    currency: moneda,
    minimumFractionDigits: 0, // Sin decimales
    maximumFractionDigits: 0, // Sin decimales
  });

  const precioFormateado = formato.format(precio);

  return <span className={className}>{precioFormateado}</span>;
};

export default PrecioFormateado;
