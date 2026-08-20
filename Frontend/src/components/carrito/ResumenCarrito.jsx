import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCarrito } from '../../context/CarritoContext';

const ResumenCarrito = ({ onClose }) => {
  const navigate = useNavigate();
  const { obtenerSubtotal, obtenerCantidadTotal, items } = useCarrito();

  const subtotal = obtenerSubtotal();
  const cantidadTotal = obtenerCantidadTotal();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleCheckoutWhatsApp = () => {
    if (onClose) onClose();
    navigate('/checkout-whatsapp');
  };

  const handleCheckoutRegistro = () => {
    if (onClose) onClose();
    navigate('/login', { state: { fromCheckout: true } });
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-gray-200 bg-gray-50 p-5 space-y-4">
      {/* Resumen de precios */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Productos ({cantidadTotal})</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Envío</span>
          <span className="text-green-600 font-medium">Por definir</span>
        </div>
        <div className="border-t border-gray-200 pt-2 flex justify-between">
          <span className="text-base font-bold text-gray-900">Total</span>
          <span className="text-lg font-bold text-gray-900">{formatPrice(subtotal)}</span>
        </div>
      </div>

      {/* Botón WhatsApp */}
      <button
        onClick={handleCheckoutWhatsApp}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        Comprar por WhatsApp
      </button>

      {/* Divisor */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-3 bg-gray-50 text-gray-500">o</span>
        </div>
      </div>

      {/* Botón Registro */}
      <button
        onClick={handleCheckoutRegistro}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        Comprar con Registro
      </button>

      <p className="text-xs text-center text-gray-500">
        Crea tu cuenta para seguir tu pedido y acceder a beneficios exclusivos
      </p>
    </div>
  );
};

export default ResumenCarrito;
