import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const GaleriaImagenes = ({ imagenes = [], imagenPrincipal, nombreProducto }) => {
  const [imagenActiva, setImagenActiva] = useState(imagenPrincipal);
  const [indexActivo, setIndexActivo] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    setImagenActiva(imagenPrincipal);
    setIndexActivo(0);
  }, [imagenPrincipal]);

  const todasLasImagenes = [
    { id: 'main', url: imagenPrincipal, tipo: 'principal' },
    ...imagenes.filter(img => img.url !== imagenPrincipal)
  ].filter(img => img.url);

  const handleImageError = (e) => {
    e.target.src = 'https://placehold.co/600x800/f3f4f6/9ca3af?text=Sin+imagen';
  };

  const handleSelectImage = (img, index) => {
    setImagenActiva(img.url);
    setIndexActivo(index);
  };

  const handlePrev = () => {
    const newIndex = indexActivo === 0 ? todasLasImagenes.length - 1 : indexActivo - 1;
    setIndexActivo(newIndex);
    setImagenActiva(todasLasImagenes[newIndex].url);
  };

  const handleNext = () => {
    const newIndex = indexActivo === todasLasImagenes.length - 1 ? 0 : indexActivo + 1;
    setIndexActivo(newIndex);
    setImagenActiva(todasLasImagenes[newIndex].url);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Imagen principal con controles */}
      <div className="relative group">
        <motion.div 
          className="relative bg-gray-50 rounded-2xl overflow-hidden flex justify-center items-center aspect-[3/4] cursor-zoom-in"
          onClick={() => setIsZoomed(!isZoomed)}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.3 }}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={imagenActiva}
              src={imagenActiva || 'https://placehold.co/600x800/f3f4f6/9ca3af?text=Sin+imagen'}
              alt={`Imagen de ${nombreProducto}`}
              className="w-full h-full object-cover"
              onError={handleImageError}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.3 }}
            />
          </AnimatePresence>

          {/* Badge de tipo de imagen */}
          {todasLasImagenes[indexActivo]?.tipo === 'variante' && (
            <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full">
              <span className="text-xs text-white font-medium">
                {todasLasImagenes[indexActivo]?.color && `Color: ${todasLasImagenes[indexActivo].color}`}
                {todasLasImagenes[indexActivo]?.talla && ` • Talla: ${todasLasImagenes[indexActivo].talla}`}
              </span>
            </div>
          )}

          {/* Contador */}
          {todasLasImagenes.length > 1 && (
            <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm">
              <span className="text-xs text-gray-700 font-medium">
                {indexActivo + 1} / {todasLasImagenes.length}
              </span>
            </div>
          )}

          {/* Icono de zoom */}
          <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </div>
        </motion.div>

        {/* Botones de navegación */}
        {todasLasImagenes.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-110"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-110"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Miniaturas */}
      {todasLasImagenes.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300">
          {todasLasImagenes.map((imagen, index) => (
            <motion.button
              key={imagen.id || `thumb-${index}`}
              onClick={() => handleSelectImage(imagen, index)}
              className={`
                relative flex-shrink-0 w-20 h-24 rounded-xl overflow-hidden transition-all
                ${index === indexActivo 
                  ? 'ring-2 ring-gray-900 ring-offset-2' 
                  : 'ring-1 ring-gray-200 hover:ring-gray-400 opacity-70 hover:opacity-100'
                }
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <img
                src={imagen.url || 'https://placehold.co/100x120/f3f4f6/9ca3af?text=...'}
                alt={`Miniatura ${index + 1} de ${nombreProducto}`}
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
              
              {/* Indicador de tipo */}
              {imagen.tipo === 'variante' && (
                <div className="absolute bottom-1 left-1 right-1">
                  <div className="bg-black/60 backdrop-blur-sm rounded px-1.5 py-0.5">
                    <span className="text-[11px] text-white truncate block">
                      {imagen.color || imagen.talla || 'Variante'}
                    </span>
                  </div>
                </div>
              )}
            </motion.button>
          ))}
        </div>
      )}

      {/* Modal de zoom (opcional) */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center cursor-zoom-out"
            onClick={() => setIsZoomed(false)}
          >
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={imagenActiva}
              alt={nombreProducto}
              className="max-w-[90vw] max-h-[90vh] object-contain"
              onError={handleImageError}
            />
            
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Navegación en modal */}
            {todasLasImagenes.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                  className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                >
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleNext(); }}
                  className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                >
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Contador en modal */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 rounded-full">
              <span className="text-sm text-white">
                {indexActivo + 1} / {todasLasImagenes.length}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GaleriaImagenes;
