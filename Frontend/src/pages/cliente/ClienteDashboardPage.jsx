import React from 'react';
import { Link } from 'react-router-dom';

const ClienteDashboardPage = () => {
  const modules = [
    { name: 'Mi Perfil', path: '/cliente/perfil', icon: '👤' },
    { name: 'Tienda', path: '/cliente/tienda', icon: '🛍️' },
    { name: 'Mis Pedidos', path: '/cliente/pedidos', icon: '📦' },
    { name: 'Carrito', path: '/cliente/carrito', icon: '🛒' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Panel de Cliente</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Accede rápidamente a tus compras, perfil y pedidos.</p>
        </header>

        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {modules.map((module) => (
            <Link
              key={module.name}
              to={module.path}
              className="flex flex-col items-start bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-2xl mb-2">{module.icon}</div>
              <h2 className="font-semibold text-base text-gray-900 dark:text-gray-100">{module.name}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Entrar a {module.name.toLowerCase()}</p>
            </Link>
          ))}
        </section>

        <section className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <h3 className="font-medium text-lg">Pedidos recientes</h3>
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">No hay pedidos recientes.</div>
        </section>
      </div>
    </div>
  );
};

export default ClienteDashboardPage;
