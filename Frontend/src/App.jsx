/**
 * @file App.jsx
 * @brief Componente raíz de la aplicación.
 *
 * Este componente es el contenedor principal que renderiza el
 * sistema de rutas de la aplicación.
 */

import React from 'react';
import { ConfigProvider } from 'antd';
import AppRoutes from './routes/AppRoutes';
import { ThemeProvider } from './context/ThemeContext';
import { CarritoProvider } from './context/CarritoContext';
import { CarritoDrawer } from './components/carrito';

const FONT_FAMILY =
  "'Inter', 'Segoe UI', system-ui, -apple-system, 'Helvetica Neue', sans-serif";

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: FONT_FAMILY,
          fontSize: 14,
          borderRadius: 10,
          colorPrimary: '#be185d',
        },
      }}
    >
      <ThemeProvider>
        <CarritoProvider>
          <AppRoutes />
          <CarritoDrawer />
        </CarritoProvider>
      </ThemeProvider>
    </ConfigProvider>
  );
}

export default App;
