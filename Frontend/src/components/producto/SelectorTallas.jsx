import React from 'react';
import { motion } from 'framer-motion';

const SelectorTallas = ({ tallas = [], onSelectTalla, selectedTalla, stockInfo = [] }) => {
  if (!tallas.length) return null;

  const getStockForTalla = (tallaId) => {
    const varianteConTalla = stockInfo.find(s => 
      s.id_talla === tallaId || 
      s.talla?.idTalla === tallaId ||
      s.idTalla === tallaId
    );
    return varianteConTalla?.stock ?? varianteConTalla?.cantidadStock ?? 0;
  };

  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
        Talla: <span className="font-normal text-gray-900 normal-case">{selectedTalla?.nombre || 'Selecciona'}</span>
      </h4>
      <div className="flex flex-wrap gap-2">
        {tallas.map(talla => {
          const isSelected = selectedTalla?.id === talla.id;
          const stock = getStockForTalla(talla.id);
          const isDisabled = stock === 0;
          const isLowStock = stock > 0 && stock <= 3;

          return (
            <motion.button
              key={talla.id}
              type="button"
              onClick={() => !isDisabled && onSelectTalla(talla)}
              disabled={isDisabled}
              whileHover={!isDisabled ? { scale: 1.05 } : {}}
              whileTap={!isDisabled ? { scale: 0.95 } : {}}
              className={`
                relative px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200
                ${isSelected 
                  ? 'bg-gray-900 text-white shadow-lg' 
                  : 'bg-white text-gray-800 border border-gray-300'
                }
                ${isDisabled 
                  ? 'opacity-40 cursor-not-allowed line-through decoration-gray-400' 
                  : 'hover:border-gray-900 hover:shadow-md'
                }
              `}
              aria-label={`Seleccionar talla ${talla.nombre}`}
            >
              {talla.nombre}
              
              {isLowStock && !isDisabled && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse" 
                      title={`Solo ${stock} disponibles`} />
              )}
            </motion.button>
          );
        })}
      </div>
      
      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
          <span>Pocas unidades</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="line-through text-gray-400">XL</span>
          <span>Agotado</span>
        </div>
      </div>
    </div>
  );
};

export default SelectorTallas;
