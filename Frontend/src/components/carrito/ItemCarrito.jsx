import React from 'react';
import { useCarrito } from '../../context/CarritoContext';

const ItemCarrito = ({ item }) => {
  const { actualizarCantidad, removerDelCarrito } = useCarrito();

  const subtotal = item.precio * item.cantidad;

  const handleIncrement = () => {
    if (item.cantidad < (item.stockDisponible || 999)) {
      actualizarCantidad(item.idVariante, item.cantidad + 1);
    }
  };

  const handleDecrement = () => {
    if (item.cantidad > 1) {
      actualizarCantidad(item.idVariante, item.cantidad - 1);
    }
  };

  const handleRemove = () => {
    removerDelCarrito(item.idVariante);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="flex gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Imagen */}
      <div className="flex-shrink-0 w-20 h-24 rounded-lg overflow-hidden bg-gray-100">
        <img
          src={item.imagen || '/placeholder-product.jpg'}
          alt={item.nombreProducto}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = '/placeholder-product.jpg';
          }}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 text-sm truncate">
          {item.nombreProducto}
        </h4>
        
        <div className="flex flex-wrap gap-2 mt-1">
          {item.color && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-600">
              <span
                className="w-3 h-3 rounded-full border border-gray-300"
                style={{ backgroundColor: item.colorHex || '#ccc' }}
              />
              {item.color}
            </span>
          )}
          {item.talla && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-xs font-medium text-gray-700">
              Talla: {item.talla}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-3">
          {/* Controles de cantidad */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={handleDecrement}
              disabled={item.cantidad <= 1}
              className="w-7 h-7 flex items-center justify-center rounded-md text-gray-600 hover:bg-white hover:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            
            <span className="w-8 text-center font-semibold text-sm text-gray-900">
              {item.cantidad}
            </span>
            
            <button
              onClick={handleIncrement}
              disabled={item.cantidad >= (item.stockDisponible || 999)}
              className="w-7 h-7 flex items-center justify-center rounded-md text-gray-600 hover:bg-white hover:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* Precio y subtotal */}
          <div className="text-right">
            <p className="text-sm font-bold text-gray-900">
              {formatPrice(subtotal)}
            </p>
            {item.cantidad > 1 && (
              <p className="text-xs text-gray-500">
                {formatPrice(item.precio)} c/u
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Botón eliminar */}
      <button
        onClick={handleRemove}
        className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors self-start"
        title="Eliminar"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
};

export default ItemCarrito;
