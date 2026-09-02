/**
 * @file App.jsx
 * @brief Componente raíz de la aplicación.
 */

import React from 'react';
import { ConfigProvider } from 'antd';
import AppRoutes from './routes/AppRoutes';
import { ThemeProvider } from './context/ThemeContext';
import { CarritoProvider } from './context/CarritoContext';
import { FavoritosProvider } from './context/FavoritosContext';
import { CarritoDrawer } from './components/carrito';
import { FavoritosDrawer } from './components/favoritos';

const FONT_FAMILY =
  "'Montserrat', 'Segoe UI', system-ui, -apple-system, 'Helvetica Neue', sans-serif";

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: FONT_FAMILY,
          fontSize: 14,
          borderRadius: 8,
          colorPrimary: '#a73162',
          colorLink: '#a73162',
          colorSuccess: '#a73162',
        },
      }}
    >
      <ThemeProvider>
        <FavoritosProvider>
          <CarritoProvider>
            <AppRoutes />
            <CarritoDrawer />
            <FavoritosDrawer />
          </CarritoProvider>
        </FavoritosProvider>
      </ThemeProvider>
    </ConfigProvider>
  );
}

export default App;
