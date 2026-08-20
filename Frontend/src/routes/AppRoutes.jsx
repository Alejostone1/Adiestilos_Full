import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// --- Layouts ---
import MainLayout from '../components/layout/MainLayout';

// --- Páginas ---
import ProductosDestacadosSection from '../pages/public/ProductosDestacadosSection';
import HomePage from '../pages/public/HomePage';
import LoginPage from '../pages/public/LoginPage';
import RegistroPage from '../pages/public/RegistroPage';
import CatalogoPage from '../pages/public/CatalogoPage';
import ContactoPage from '../pages/public/ContactoPage';
import ProductoDetallePage from '../pages/public/ProductoDetallePage';
import CategoriaPage from '../pages/public/CategoriaPage';
import CheckoutWhatsappPage from '../pages/public/CheckoutWhatsappPage';
import NosotrosPage from '../pages/public/NosotrosPage';
import DetallesVentasPage from '../pages/admin/ventas/DetallesVentasPage';

// --- Routes ---
import AdminRoutes from './AdminRoutes';
import ClienteRoutes from './ClienteRoutes';

// --- Placeholders para otras páginas ---
const PerfilPage = () => <div>Página de Perfil de Usuario</div>;
const NotFoundPage = () => <div className="text-center mt-5"><h2>404 - Página No Encontrada</h2></div>;

/**
 * @component AuthRedirect
 * @brief Redirige a los usuarios autenticados fuera de las páginas de login/registro.
 */
const AuthRedirect = () => {
  const { estaAutenticado, usuario } = useAuth();


  if (estaAutenticado) {
    const userRole = usuario?.idRol;

    if (userRole === 1) {
      return <Navigate to="/admin/dashboard" replace />;
    }

    if (userRole === 2) {
      return <Navigate to="/cliente/dashboard" replace />;
    }

    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

/**
 * @component ProtectedRoute
 * @brief Protege rutas que requieren autenticación.
 */
const ProtectedRoute = () => {
  const { estaAutenticado } = useAuth();

  return estaAutenticado ? <Outlet /> : <Navigate to="/login" />;
};


const AppRoutes = () => {

  return (
    <Routes>
      {/* --- Rutas Públicas y de Autenticación --- */}
      {/* Estas rutas están envueltas en el layout principal con Navbar y Footer */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="tienda" element={<CatalogoPage />} />
        <Route path="categoria/:id" element={<CategoriaPage />} />
        <Route path="producto/:id" element={<ProductoDetallePage />} />
        <Route path="ProductosDestacadosSection" element={<ProductosDestacadosSection />} />
        <Route path="contacto" element={<ContactoPage />} />
        <Route path="nosotros" element={<NosotrosPage />} />
        <Route path="checkout-whatsapp" element={<CheckoutWhatsappPage />} />

        {/* Rutas de autenticación anidadas para compartir layout */}
        <Route element={<AuthRedirect />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="registro" element={<RegistroPage />} />
        </Route>
      </Route>

      {/* --- Rutas Protegidas --- */}
      {/* Si el usuario no está logueado, se le redirige a /login */}
      {/* Estas rutas también pueden usar un layout específico de "Dashboard" o el MainLayout */}
      <Route element={<ProtectedRoute />}>
         <Route path="/perfil" element={<MainLayout><PerfilPage /></MainLayout>} />

         {/* Rutas específicas para Detalles de Ventas */}
         <Route path="/admin/ventas/detalles" element={<DetallesVentasPage />} />
         <Route path="/admin/ventas/detalles/:id" element={<DetallesVentasPage />} />

         <Route path="/admin/*" element={<AdminRoutes />} />
         <Route path="/cliente/*" element={<ClienteRoutes />} />
      </Route>

      {/* --- Ruta para páginas no encontradas --- */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
