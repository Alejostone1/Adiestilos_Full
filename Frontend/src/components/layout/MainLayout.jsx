/**
 * @file MainLayout.jsx
 * @brief Componente de diseño principal que envuelve las páginas públicas.
 *
 * Este componente proporciona una estructura consistente con un encabezado
 * (Header) y un pie de página (Footer) para todas las páginas que renderiza
 * a través de un <Outlet> de react-router-dom.
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const MainLayout = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <main style={{ flex: '1' }}>
        {/* Outlet renderiza el componente de la ruta hija activa */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
