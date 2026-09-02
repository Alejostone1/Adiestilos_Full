import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCarrito } from '../../context/CarritoContext';

const ResumenCarrito = ({ onClose }) => {
  const navigate = useNavigate();
  const { obtenerSubtotal, obtenerCantidadTotal, items } = useCarrito();

  const subtotal = obtenerSubtotal();
  const cantidadTotal = obtenerCantidadTotal();

  const formatPrice = (price) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);

  const handleCheckoutWhatsApp = () => {
    if (onClose) onClose();
    navigate('/checkout-whatsapp');
  };

  const handleCheckoutRegistro = () => {
    if (onClose) onClose();
    navigate('/login', { state: { fromCheckout: true } });
  };

  if (items.length === 0) return null;

  return (
    <div className="border-t border-outline-variant/30 bg-surface p-5 space-y-4">
      {/* Price summary */}
      <div className="space-y-2">
        <div className="flex justify-between font-body-sm text-body-sm text-text-main">
          <span>Productos ({cantidadTotal})</span>
          <span className="tabular-nums font-medium">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between font-body-sm text-body-sm text-text-main">
          <span>Envío</span>
          <span className="text-tertiary font-medium">Por definir</span>
        </div>
        <div className="border-t border-outline-variant/30 pt-2 mt-1 flex justify-between items-baseline">
          <span className="font-body-md text-body-md text-on-surface font-semibold uppercase tracking-wide">Total</span>
          <span className="text-lg md:text-xl text-primary font-semibold tabular-nums tracking-tight">{formatPrice(subtotal)}</span>
        </div>
      </div>

      {/* WhatsApp */}
      <button
        onClick={handleCheckoutWhatsApp}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-[#25d366] hover:bg-[#1da851] text-white font-label-caps text-label-caps rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        Comprar por WhatsApp
      </button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-outline-variant/30" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-3 bg-surface text-outline font-body-sm">o</span>
        </div>
      </div>

      {/* Registro */}
      <button
        onClick={handleCheckoutRegistro}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-on-surface text-pure-white font-label-caps text-label-caps rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <span className="material-symbols-outlined text-[20px]">person</span>
        Comprar con Registro
      </button>

      <p className="text-xs text-center text-outline font-body-sm">
        Crea tu cuenta para seguir tu pedido y acceder a beneficios exclusivos
      </p>
    </div>
  );
};

export default ResumenCarrito;
