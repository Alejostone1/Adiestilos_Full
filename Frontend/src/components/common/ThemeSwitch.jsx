import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeSwitch = ({ className = '' }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex h-8 w-14 items-center rounded-full
        transition-all duration-300 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${isDark 
          ? 'bg-gradient-to-r from-slate-700 to-slate-600 focus:ring-slate-500' 
          : 'bg-gradient-to-r from-amber-300 to-orange-300 focus:ring-orange-400'
        }
        ${className}
      `}
      aria-label="Cambiar tema"
    >
      {/* Fondo con efecto de brillo */}
      <div 
        className={`
          absolute inset-0 rounded-full opacity-0 transition-opacity duration-300
          ${isDark ? 'bg-blue-400 opacity-20' : 'bg-yellow-400 opacity-30'}
        `}
      />
      
      {/* Botón deslizante */}
      <span
        className={`
          inline-block h-6 w-6 transform rounded-full
          transition-all duration-300 ease-in-out
          flex items-center justify-center
          ${isDark 
            ? 'translate-x-7 bg-slate-800 shadow-lg' 
            : 'translate-x-1 bg-white shadow-lg'
          }
        `}
      >
        {/* Icono animado */}
        <div className="relative">
          <Sun 
            className={`
              absolute h-4 w-4 transition-all duration-300
              ${isDark 
                ? 'opacity-0 rotate-180 scale-0' 
                : 'opacity-100 rotate-0 scale-100 text-amber-500'
              }
            `}
          />
          <Moon 
            className={`
              h-4 w-4 transition-all duration-300
              ${isDark 
                ? 'opacity-100 rotate-0 scale-100 text-blue-400' 
                : 'opacity-0 -rotate-180 scale-0'
              }
            `}
          />
        </div>
      </span>

      {/* Efectos de luz */}
      <div 
        className={`
          absolute left-1 h-6 w-6 rounded-full
          transition-all duration-300
          ${isDark 
            ? 'opacity-0' 
            : 'opacity-100 bg-gradient-to-br from-yellow-200 to-orange-200'
          }
        `}
      />
      <div 
        className={`
          absolute right-1 h-6 w-6 rounded-full
          transition-all duration-300
          ${isDark 
            ? 'opacity-100 bg-gradient-to-br from-blue-500 to-purple-500' 
            : 'opacity-0'
          }
        `}
      />

      {/* Indicadores de posición */}
      <div className="absolute left-1.5 top-1/2 -translate-y-1/2">
        <div className={`
          h-1 w-1 rounded-full transition-all duration-300
          ${isDark ? 'bg-slate-400 opacity-50' : 'bg-amber-600 opacity-70'}
        `} />
      </div>
      <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
        <div className={`
          h-1 w-1 rounded-full transition-all duration-300
          ${isDark ? 'bg-blue-400 opacity-70' : 'bg-orange-600 opacity-50'}
        `} />
      </div>
    </button>
  );
};

export default ThemeSwitch;
