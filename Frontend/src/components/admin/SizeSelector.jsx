import React from 'react';

const SizeSelector = ({ 
  sizes = [], 
  selectedSizeId, 
  onChange,
  className = '' 
}) => {
  // Optional: distinct visual styles based on size type if we wanted to get fancy
  // For now, a clean pill/chip design works best universally.

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Talla <span className="text-red-500">*</span>
      </label>

      {sizes.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 italic">No hay tallas disponibles.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => {
            const isSelected = selectedSizeId === size.idTalla;
            
            return (
              <button
                key={size.idTalla}
                type="button"
                onClick={() => onChange(size.idTalla)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border
                  focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900
                  ${isSelected
                    ? 'bg-purple-600 text-white border-purple-600 shadow-md transform scale-105'
                    : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-500 hover:bg-gray-50 dark:hover:bg-slate-700'
                  }
                `}
              >
                {size.nombreTalla}
              </button>
            );
          })}
        </div>
      )}
      
      {/* Helper text for selection */}
      <div className="h-5">
        {selectedSizeId && (
          <p className="text-sm text-gray-600 dark:text-gray-400 animate-fade-in">
             Seleccionada: <span className="font-medium text-gray-900 dark:text-white">
              {sizes.find(s => s.idTalla === selectedSizeId)?.nombreTalla}
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default SizeSelector;
