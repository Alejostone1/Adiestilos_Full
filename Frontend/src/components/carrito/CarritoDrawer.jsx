import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCarrito } from '../../context/CarritoContext';
import ItemCarrito from './ItemCarrito';
import ResumenCarrito from './ResumenCarrito';

const CarritoDrawer = () => {
  const { items, isOpen, cerrarCarrito, vaciarCarrito, obtenerCantidadTotal } = useCarrito();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => { if (e.key === 'Escape' && isOpen) cerrarCarrito(); };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, cerrarCarrito]);

  const cantidadTotal = obtenerCantidadTotal();

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm z-40"
            onClick={cerrarCarrito}
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-pure-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/30">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[24px]">shopping_bag</span>
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Mi Carrito</h2>
              <p className="font-body-sm text-body-sm text-outline">
                {cantidadTotal} {cantidadTotal === 1 ? 'producto' : 'productos'}
              </p>
            </div>
          </div>
          <button
            onClick={cerrarCarrito}
            className="p-2 hover:bg-surface-container rounded-lg transition-colors text-outline"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
            <div className="w-20 h-20 mb-6 bg-surface-container rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-[40px] text-outline-variant">shopping_bag</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">Tu carrito está vacío</h3>
            <p className="font-body-sm text-body-sm text-outline mb-6">
              Explora nuestra colección y encuentra prendas increíbles
            </p>
            <button
              onClick={cerrarCarrito}
              className="px-6 py-2.5 bg-primary text-on-primary font-label-caps text-label-caps rounded-lg hover:bg-tertiary transition-colors"
            >
              Explorar tienda
            </button>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {items.map((item) => (
                <ItemCarrito key={item.idVariante} item={item} />
              ))}
            </div>

            {/* Vaciar */}
            <div className="px-4 py-2 border-t border-outline-variant/30">
              <button
                onClick={vaciarCarrito}
                className="w-full text-sm text-outline hover:text-tertiary py-2 transition-colors flex items-center justify-center gap-2 font-body-sm"
              >
                <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
                Vaciar carrito
              </button>
            </div>

            <ResumenCarrito onClose={cerrarCarrito} />
          </>
        )}
      </div>
    </>
  );
};

export default CarritoDrawer;
