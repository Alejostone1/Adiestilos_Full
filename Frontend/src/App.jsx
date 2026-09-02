/**
 * @file App.jsx
 * @brief Componente raíz de la aplicación.
 */

import React from 'react';
import { ConfigProvider } from 'antd';
import AppRoutes from './routes/AppRoutes';
import { ThemeProvider } from './context/ThemeContext';
import { CarritoProvider } from './context/CarritoContext';
import { CarritoDrawer } from './components/carrito';

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
        <CarritoProvider>
          <AppRoutes />
          <CarritoDrawer />
        </CarritoProvider>
      </ThemeProvider>
    </ConfigProvider>
  );
}

export default App;
