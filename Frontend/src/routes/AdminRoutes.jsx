import React from "react";
import { Routes, Route } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AdminLayout from "../components/layout/AdminLayout";

// Dashboard
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import VendedorDashboardPage from "../pages/admin/VendedorDashboardPage";

// Gestión principal
import UsuariosPage from "../pages/admin/usuarios/UsuariosPage";
import UsuariosVentas from "../pages/admin/usuarios/UsuariosVentas";
import UsuariosDetalleVenta from "../pages/admin/usuarios/UsuariosDetalleVenta";
import UsuariosCreditos from "../pages/admin/usuarios/UsuariosCreditos";
import RolesPage from "../pages/admin/usuarios/RolesPage";
import ProductosPage from "../pages/admin/productos/ProductosPage";
import VariantesPage from "../pages/admin/variantes/VariantesPage";
import VariantesProductoPage from "../pages/admin/variantes/VariantesProductoPage";
import CategoriasPage from "../pages/admin/productos/CategoriasPage";
import ColoresPage from "../pages/admin/productos/ColoresPage";
import TallasPage from "../pages/admin/productos/TallasPage";
import ProveedoresPage from "../pages/admin/productos/ProveedoresPage";
import GaleriaProductosPage from "../pages/admin/productos/GaleriaProductosPage";
import GalleryLayout from "../pages/admin/gallery/GalleryLayout";

// Ventas y pedidos
import VentasPage from "../pages/admin/ventas/VentasPage";
import DetallesVentasPage from "../pages/admin/ventas/DetallesVentasPage";
import EstadosPedidoPage from "../pages/admin/ventas/EstadosPedidoPage";
import MetodosPagoPage from "../pages/admin/metodos-pago/MetodosPagoPage";

// Compras e inventario
import ComprasPage from "../pages/admin/compras/ComprasPage";
import DetalleComprasPage from "../pages/admin/compras/DetalleCompras";
import InventarioPage from "../pages/admin/inventario/InventarioPage";
import AjustesInventarioPage from "../pages/admin/inventario/AjustesInventarioPage";
import MovimientosInventarioPage from "../pages/admin/inventario/MovimientosInventarioPage";
import TiposMovimientoPage from "../pages/admin/inventario/TiposMovimientoPage";

// Créditos, pagos y descuentos
import GestionCreditosPage from "../pages/admin/creditos/GestionCreditosPage";
import HistorialCreditosPage from "../pages/admin/creditos/HistorialCreditosPage";
import DetalleCreditoPage from "../pages/admin/creditos/DetalleCreditoPage";
import DescuentosPage from "../pages/admin/descuentos/DescuentosPage";
import HistorialDescuentosPage from "../pages/admin/descuentos/HistorialDescuentosPage";


// Devoluciones
import DevolucionesPage from "../pages/admin/devoluciones/DevolucionesPage";
import DetalleDevolucionPage from "../pages/admin/devoluciones/DetalleDevolucionPage";

// Reportes
import ReportesVentasPage from "../pages/admin/reportes/ReportesVentasPage";
import ReportesInventarioPage from "../pages/admin/reportes/ReportesInventarioPage";
import ReportesCreditosPage from "../pages/admin/reportes/ReportesCreditosPage";
import ReportesComprasPage from "../pages/admin/reportes/ReportesComprasPage";
import ReportesPagosPage from "../pages/admin/reportes/ReportesPagosPage";

// El Vendedor ve su panel de ventas; el resto, el panel de administración.
const DashboardPage = () => {
  const { usuario } = useAuth();
  const esVendedor = usuario?.rol?.nombreRol === 'Vendedor' || usuario?.idRol === 2;
  return esVendedor ? <VendedorDashboardPage /> : <AdminDashboardPage />;
};

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<AdminLayout />}>
        {/* Dashboard */}
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />

        {/* Gestión principal */}
        <Route path="usuarios" element={<UsuariosPage />} />
        <Route path="usuarios/:id/ventas" element={<UsuariosVentas />} />
        <Route path="usuarios/:id/ventas/:idVenta" element={<UsuariosDetalleVenta />} />
        <Route path="usuarios/:id/creditos" element={<UsuariosCreditos />} />
        <Route path="roles" element={<RolesPage />} />

        {/* Productos */}
        <Route path="productos" element={<ProductosPage />} />
        <Route path="productos/variantes" element={<VariantesPage />} />
        <Route path="productos/:idProducto/variantes" element={<VariantesProductoPage />} />
        <Route path="productos/:idProducto/variantes/nueva" element={<VariantesProductoPage />} />
        <Route path="variantes/:idVariante/editar" element={<VariantesProductoPage />} />
        <Route path="productos/galeria" element={<GalleryLayout />} />
        <Route path="categorias" element={<CategoriasPage />} />
        <Route path="colores" element={<ColoresPage />} />
        <Route path="tallas" element={<TallasPage />} />

        {/* Proveedores y compras */}
        <Route path="proveedores" element={<ProveedoresPage />} />
        <Route path="compras" element={<ComprasPage />} />
        <Route path="compras/detalle/:id?" element={<DetalleComprasPage />} />

        {/* Ventas */}
        <Route path="ventas" element={<VentasPage />} />
        <Route path="ventas/detalle/:id?" element={<DetallesVentasPage />} />
        <Route path="estados-pedido" element={<EstadosPedidoPage />} />

        {/* Inventario */}
        <Route path="inventario" element={<InventarioPage />} />
        <Route path="inventario/ajustes" element={<AjustesInventarioPage />} />
        <Route
          path="inventario/movimientos"
          element={<MovimientosInventarioPage />}
        />
        <Route
          path="inventario/tipos-movimiento"
          element={<TiposMovimientoPage />}
        />

        {/* Créditos y Cobranzas */}
        <Route path="ventas-credito" element={<HistorialCreditosPage />} /> {/* Legacy Redirect */}
        <Route path="creditos/gestion" element={<GestionCreditosPage />} />
        <Route path="creditos/historial" element={<HistorialCreditosPage />} />
        <Route path="creditos/detalle" element={<DetalleCreditoPage />} /> {/* Se encarga de mostrar buscador si no hay ID */}
        <Route path="creditos/detalle/:id" element={<DetalleCreditoPage />} />

        {/* Descuentos */}
        <Route path="descuentos" element={<DescuentosPage />} />
        <Route
          path="descuentos/historial"
          element={<HistorialDescuentosPage />}
        />

        {/* Métodos de pago */}
        <Route path="metodos-pago" element={<MetodosPagoPage />} />

        {/* Devoluciones */}
        <Route path="devoluciones" element={<DevolucionesPage />} />
        <Route path="devoluciones/detalle/:id?" element={<DetalleDevolucionPage />} />

        {/* Reportes */}
        <Route path="reportes/ventas" element={<ReportesVentasPage />} />
        <Route
          path="reportes/inventario"
          element={<ReportesInventarioPage />}
        />
        <Route
          path="reportes/creditos"
          element={<ReportesCreditosPage />}
        />
        <Route path="reportes/compras" element={<ReportesComprasPage />} />
        <Route path="reportes/pagos" element={<ReportesPagosPage />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
