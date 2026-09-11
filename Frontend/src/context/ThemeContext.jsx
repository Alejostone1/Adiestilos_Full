import React, { createContext, useContext, useEffect, useState } from 'react';

// Crear el contexto
const ThemeContext = createContext();

// Hook personalizado para usar el tema
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
  }
  return context;
};

// Provider del tema
export const ThemeProvider = ({ children }) => {
  // El modo oscuro quedo deshabilitado (decision de producto): siempre claro,
  // sin importar el sistema o una preferencia oscura guardada de antes.
  const [theme, setTheme] = useState('light');

  // Aplicar tema al DOM y limpiar cualquier 'dark' que haya quedado guardado
  // de una version anterior de la app.
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('theme');
  }, [theme]);

  // Funcion para cambiar tema (deshabilitada; se mantiene por compatibilidad
  // con componentes que la invocan, pero no hace nada).
  const toggleTheme = () => {};

  const value = {
    theme,
    toggleTheme,
    isDark: theme === 'dark'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
