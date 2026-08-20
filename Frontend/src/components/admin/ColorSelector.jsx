import React from 'react';
import { Check } from 'lucide-react';

const ColorSelector = ({ 
  colors = [], 
  selectedColorId, 
  onChange,
  className = '' 
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Color <span className="text-red-500">*</span>
      </label>
      
      {colors.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 italic">No hay colores disponibles.</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {colors.map((color) => {
            const isSelected = selectedColorId === color.idColor;
            const hexColor = color.codigoHex || '#cccccc';
            
            // Calculate contrast for checkmark
            const r = parseInt(hexColor.slice(1, 3), 16);
            const g = parseInt(hexColor.slice(3, 5), 16);
            const b = parseInt(hexColor.slice(5, 7), 16);
            const isDark = (r * 299 + g * 587 + b * 114) / 1000 < 128;

            return (
              <button
                key={color.idColor}
                type="button"
                onClick={() => onChange(color.idColor)}
                className={`
                  group relative flex items-center justify-center w-10 h-10 rounded-full 
                  border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900
                  ${isSelected 
                    ? 'border-purple-600 scale-110 shadow-md' 
                    : 'border-transparent hover:border-gray-300 dark:hover:border-slate-500 hover:scale-105'
                  }
                `}
                style={{ backgroundColor: hexColor }}
                title={color.nombreColor}
              >
                {/* Checkmark indicator */}
                {isSelected && (
                  <Check 
                    className={`w-5 h-5 ${isDark ? 'text-white' : 'text-black'}`}
                    strokeWidth={3}
                  />
                )}
                
                {/* Tooltip on hover */}
                <span className="absolute bottom-full mb-2 hidden group-hover:block whitespace-nowrap bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg z-10 pointer-events-none">
                  {color.nombreColor}
                </span>
                
                {/* Selection ring for accessibility/visibility on similar backgrounds */}
                {isSelected && (
                  <span className="absolute inset-0 rounded-full border-2 border-white dark:border-gray-900 opacity-50 pointer-events-none" />
                )}
              </button>
            );
          })}
        </div>
      )}
      
      {/* Selected Value Text Helper */}
      <div className="h-5">
        {selectedColorId && (
          <p className="text-sm text-gray-600 dark:text-gray-400 animate-fade-in">
            Seleccionado: <span className="font-medium text-gray-900 dark:text-white">
              {colors.find(c => c.idColor === selectedColorId)?.nombreColor}
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default ColorSelector;
