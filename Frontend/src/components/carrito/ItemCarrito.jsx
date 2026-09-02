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

  const formatPrice = (price) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);

  return (
    <div className="flex gap-3 p-3 bg-pure-white rounded-lg border border-outline-variant/20 hover:shadow-sm transition-shadow duration-200">
      {/* Image */}
      <div className="flex-shrink-0 w-20 h-24 rounded-lg overflow-hidden bg-surface-container-low">
        <img
          src={item.imagen || '/placeholder-product.jpg'}
          alt={item.nombreProducto}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = '/placeholder-product.jpg'; }}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-body-md text-body-md text-text-main truncate pr-6">{item.nombreProducto}</h4>

        <div className="flex flex-wrap gap-2 mt-1">
          {item.color && (
            <span className="inline-flex items-center gap-1 text-xs text-outline font-body-sm">
              <span className="w-3 h-3 rounded-full border border-outline-variant/50" style={{ backgroundColor: item.colorHex || '#ccc' }} />
              {item.color}
            </span>
          )}
          {item.talla && (
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-surface-container text-xs font-body-sm text-text-main">
              Talla: {item.talla}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-3">
          {/* Quantity controls */}
          <div className="flex items-center gap-0 border border-outline-variant/50 rounded-lg overflow-hidden">
            <button
              onClick={handleDecrement}
              disabled={item.cantidad <= 1}
              className="w-8 h-8 flex items-center justify-center text-outline hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">remove</span>
            </button>
            <span className="w-8 text-center font-body-sm text-body-sm text-on-surface font-medium">{item.cantidad}</span>
            <button
              onClick={handleIncrement}
              disabled={item.cantidad >= (item.stockDisponible || 999)}
              className="w-8 h-8 flex items-center justify-center text-outline hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
            </button>
          </div>

          <div className="text-right">
            <p className="font-body-sm text-body-sm text-on-surface font-semibold">{formatPrice(subtotal)}</p>
            {item.cantidad > 1 && (
              <p className="text-xs text-outline">{formatPrice(item.precio)} c/u</p>
            )}
          </div>
        </div>
      </div>

      {/* Remove */}
      <button
        onClick={() => removerDelCarrito(item.idVariante)}
        className="flex-shrink-0 p-1 text-outline-variant hover:text-tertiary rounded transition-colors self-start"
        title="Eliminar"
      >
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
  );
};

export default ItemCarrito;
