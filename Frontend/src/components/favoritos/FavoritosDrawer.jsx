/**
 * @file FavoritosDrawer.jsx
 * @brief Drawer lateral de favoritos (wishlist) ADI ESTILOS
 */

import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useFavoritos } from '../../context/FavoritosContext';
import { getImagenURL } from '../../utils/imageUrl';

const FavoritosDrawer = () => {
  const navigate = useNavigate();
  const { favoritos, isOpen, eliminarFavorito, limpiarFavoritos, cerrarFavoritos: onClose } = useFavoritos();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => { if (e.key === 'Escape' && isOpen) onClose(); };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const formatPrice = (p) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(p || 0);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-pure-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/30">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[24px]">favorite</span>
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Mis Favoritos</h2>
              <p className="font-body-sm text-body-sm text-outline">
                {favoritos.length} {favoritos.length === 1 ? 'artículo' : 'artículos'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-container rounded-lg transition-colors text-outline"
            aria-label="Cerrar favoritos"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        {favoritos.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
            <div className="w-20 h-20 mb-6 bg-surface-container rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-[40px] text-outline-variant">favorite_border</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">Aún no tienes favoritos</h3>
            <p className="font-body-sm text-body-sm text-outline mb-6">
              Toca el corazón en un producto para guardarlo aquí
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-primary text-on-primary font-label-caps text-label-caps rounded-lg hover:bg-tertiary transition-colors"
            >
              Explorar tienda
            </button>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {favoritos.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 bg-pure-white rounded-lg border border-outline-variant/20 hover:shadow-sm transition-shadow duration-200"
                >
                  <Link
                    to={`/producto/${item.slug || item.id}`}
                    onClick={onClose}
                    className="flex-shrink-0 w-20 h-24 rounded-lg overflow-hidden bg-surface-container-low"
                  >
                    <img
                      src={getImagenURL(item.imagen) || '/placeholder.png'}
                      alt={item.nombre}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = '/placeholder.png'; }}
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/producto/${item.slug || item.id}`}
                      onClick={onClose}
                      className="block"
                    >
                      <h4 className="font-body-md text-body-md text-text-main truncate pr-4 hover:text-primary transition-colors">
                        {item.nombre}
                      </h4>
                    </Link>

                    <p className="mt-1 font-headline-sm text-[15px] text-primary font-semibold">
                      {formatPrice(item.precio)}
                    </p>

                    <div className="mt-3">
                      <button
                        onClick={() => { onClose(); navigate(`/producto/${item.slug || item.id}`); }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 text-primary font-label-caps text-label-caps rounded-lg hover:bg-primary hover:text-on-primary transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
                        Lo quiero
                      </button>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => eliminarFavorito(item.id)}
                    className="flex-shrink-0 p-1 text-outline-variant hover:text-tertiary rounded transition-colors self-start"
                    title="Quitar de favoritos"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-outline-variant/30">
              <button
                onClick={limpiarFavoritos}
                className="w-full text-sm text-outline hover:text-tertiary py-2 transition-colors flex items-center justify-center gap-2 font-body-sm"
              >
                <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
                Limpiar favoritos
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default FavoritosDrawer;
