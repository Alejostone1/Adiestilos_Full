import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layout and pages
import ClienteLayout from '../components/cliente/layout/ClienteLayout';
import ClienteDashboardPage from '../pages/cliente/dashboard';
import TiendaPage from '../pages/cliente/compras';
import ProductoPage from '../pages/cliente/ProductoPage';
import PedidosPage from '../pages/cliente/PedidosPage';
import PerfilPage from '../pages/cliente/perfil';
import CarritoPage from '../pages/cliente/carrito';

const ProtectedCliente = ({ children }) => {
  const { usuario } = useAuth();
  // Si no es cliente (idRol === 2) redirigir al home
  if (!usuario || usuario.idRol !== 2) return <Navigate to="/" replace />;
  return children;
};

const ClienteRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<ProtectedCliente><ClienteLayout /></ProtectedCliente>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<ClienteDashboardPage />} />
        <Route path="compras" element={<TiendaPage />} />
        <Route path="carrito" element={<CarritoPage />} />
        <Route path="pedidos" element={<PedidosPage />} />
        <Route path="perfil" element={<PerfilPage />} />
        {/* Producto (ruta relativa) */}
        <Route path="producto/:id" element={<ProductoPage />} />
      </Route>
    </Routes>
  );
};

export default ClienteRoutes;
