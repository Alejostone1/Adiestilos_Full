import React from 'react';
import { motion } from 'framer-motion';

const SelectorColores = ({ colores = [], onSelectColor, selectedColor }) => {
  if (!colores.length) return null;
  
  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
        Color: <span className="font-normal text-gray-900 normal-case">{selectedColor?.nombre || 'Selecciona'}</span>
      </h4>
      <div className="flex flex-wrap items-center gap-3">
        {colores.map(color => {
          const isSelected = selectedColor?.id === color.id;
          const colorHex = color.hex || color.codigoHex || '#cccccc';
          const isLight = isLightColor(colorHex);
          
          return (
            <motion.button
              key={color.id}
              type="button"
              onClick={() => onSelectColor(color)}
              className={`
                relative w-10 h-10 rounded-full transition-all duration-200
                ${isSelected 
                  ? 'ring-2 ring-offset-2 ring-gray-900 scale-110' 
                  : 'ring-1 ring-gray-300 hover:ring-gray-400 hover:scale-105'
                }
              `}
              style={{ backgroundColor: colorHex }}
              whileTap={{ scale: 0.9 }}
              aria-label={`Seleccionar color ${color.nombre}`}
              title={color.nombre}
            >
              {isSelected && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`absolute inset-0 flex items-center justify-center ${isLight ? 'text-gray-900' : 'text-white'}`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

const isLightColor = (hex) => {
  if (!hex) return true;
  const c = hex.replace('#', '');
  const r = parseInt(c.substr(0, 2), 16);
  const g = parseInt(c.substr(2, 2), 16);
  const b = parseInt(c.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 155;
};

export default SelectorColores;
