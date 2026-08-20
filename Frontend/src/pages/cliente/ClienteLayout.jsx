import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import BottomNav from '../../components/cliente/BottomNav';

const ClienteLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="w-full bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-semibold text-lg">ADI ESTILOS</Link>
          <nav className="space-x-3 hidden sm:flex">
            <Link to="/cliente/dashboard" className="text-sm opacity-80">Dashboard</Link>
            <Link to="/cliente/tienda" className="text-sm opacity-80">Tienda</Link>
            <Link to="/cliente/pedidos" className="text-sm opacity-80">Pedidos</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-4 py-4 w-full">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
};

export default ClienteLayout;
