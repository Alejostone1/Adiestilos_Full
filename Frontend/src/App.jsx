/**
 * @file App.jsx
 * @brief Componente raíz de la aplicación.
 *
 * Este componente es el contenedor principal que renderiza el
 * sistema de rutas de la aplicación.
 */

import React from 'react';
import AppRoutes from './routes/AppRoutes';
import { ThemeProvider } from './context/ThemeContext';
import { CarritoProvider } from './context/CarritoContext';
import { CarritoDrawer } from './components/carrito';

function App() {
  return (
    <ThemeProvider>
      <CarritoProvider>
        <AppRoutes />
        <CarritoDrawer />
      </CarritoProvider>
    </ThemeProvider>
  );
}

export default App;
