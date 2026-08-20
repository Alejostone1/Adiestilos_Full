import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import {
  ShoppingCartOutlined,
  DollarOutlined,
  FileTextOutlined,
  CalendarOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../../context/AuthContext';
import { usuariosApi } from '../../../api/usuariosApi';
import publicApi from '../../../api/publicApi';
import ClienteProductCard from '../../../components/cliente/cards/ClienteProductCard';

const money = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatDate = (value) => {
  if (!value) return 'Sin compras';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin compras';
  return date.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const ClienteDashboard = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [metricas, setMetricas] = useState({
    totalCompras: 0,
    totalGastado: 0,
    cantidadPedidos: 0,
    ultimaCompra: null,
  });
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    const cargarDashboard = async () => {
      if (!usuario?.idUsuario) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const [metricasResponse, historial] = await Promise.all([
          usuariosApi.getMetricasUsuario(usuario.idUsuario).catch(() => null),
          usuariosApi.getHistorialVentasUsuario(usuario.idUsuario).catch(() => []),
        ]);

        const ventas = Array.isArray(historial)
          ? historial
          : Array.isArray(historial?.datos)
            ? historial.datos
            : [];

        const totalPedidos = Number(metricasResponse?.cantidadPedidos ?? ventas.length ?? 0);
        const totalGastado =
          Number(metricasResponse?.totalGastado) ||
          ventas.reduce((acc, venta) => acc + (Number(venta.total) || 0), 0);
        const ultimaCompra =
          metricasResponse?.ultimaCompra ||
          ventas.sort((a, b) => new Date(b.creadoEn) - new Date(a.creadoEn))[0]?.creadoEn ||
          null;

        setMetricas({
          totalCompras: totalPedidos,
          totalGastado,
          cantidadPedidos: totalPedidos,
          ultimaCompra,
        });
      } catch (error) {
        message.error(error?.mensaje || 'No se pudo cargar tu dashboard');
      } finally {
        setLoading(false);
      }
    };

    cargarDashboard();
  }, [usuario?.idUsuario]);

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        setLoadingProducts(true);
        const response = await publicApi.obtenerProductosDestacados(8);
        const lista = Array.isArray(response?.datos)
          ? response.datos
          : Array.isArray(response)
            ? response
            : [];
        setProductos(lista);
      } catch (error) {
        const fallback = await publicApi.obtenerProductosPublicos({ pagina: 1, limite: 8 }).catch(() => null);
        const lista = Array.isArray(fallback?.datos)
          ? fallback.datos
          : Array.isArray(fallback)
            ? fallback
            : [];
        setProductos(lista);
      } finally {
        setLoadingProducts(false);
      }
    };

    cargarProductos();
  }, []);

  const metricCards = useMemo(
    () => [
      {
        title: 'Total compras',
        value: metricas.totalCompras,
        icon: <ShoppingCartOutlined className="text-blue-600 text-lg" />,
      },
      {
        title: 'Total gastado',
        value: money(metricas.totalGastado),
        icon: <DollarOutlined className="text-emerald-600 text-lg" />,
      },
      {
        title: 'Pedidos',
        value: metricas.cantidadPedidos,
        icon: <FileTextOutlined className="text-indigo-600 text-lg" />,
      },
      {
        title: 'Ultima compra',
        value: formatDate(metricas.ultimaCompra),
        icon: <CalendarOutlined className="text-amber-600 text-lg" />,
      },
    ],
    [metricas]
  );

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <header className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Dashboard cliente</p>
          <h1 className="mt-1 text-2xl font-semibold text-gray-900">
            Hola, {usuario?.nombres?.split(' ')[0] || 'cliente'}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Revisa tus compras y continua comprando con una experiencia rapida.
          </p>
        </header>

        <section className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {metricCards.map((metric) => (
            <article
              key={metric.title}
              className="rounded-2xl bg-white p-4 shadow-sm"
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                {metric.icon}
              </div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                {metric.title}
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-900 md:text-lg">
                {loading ? '...' : metric.value}
              </p>
            </article>
          ))}
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm md:p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Productos para ti</h2>
              <p className="text-sm text-gray-600">Seleccionados desde el inventario real</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/cliente/compras')}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Ver tienda
            </button>
          </div>

          {loadingProducts ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-64 animate-pulse rounded-2xl bg-gray-100" />
              ))}
            </div>
          ) : productos.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center">
              <p className="text-sm text-gray-600">No hay productos disponibles por ahora.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 md:gap-6">
              {productos.map((producto) => (
                <ClienteProductCard key={producto.idProducto} producto={producto} />
              ))}
            </div>
          )}
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          <button
            type="button"
            onClick={() => navigate('/cliente/compras')}
            className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-gray-900 px-4 text-base font-semibold text-white shadow-sm"
          >
            <ShoppingCartOutlined />
            Ir a la tienda
          </button>
          <button
            type="button"
            onClick={() => navigate('/cliente/pedidos')}
            className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-white px-4 text-base font-semibold text-gray-900 shadow-sm"
          >
            <FileTextOutlined />
            Mis pedidos
          </button>
          <button
            type="button"
            onClick={() => navigate('/cliente/perfil')}
            className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-white px-4 text-base font-semibold text-gray-900 shadow-sm"
          >
            <UserOutlined />
            Mi perfil
          </button>
        </section>
      </div>
    </div>
  );
};

export default ClienteDashboard;
