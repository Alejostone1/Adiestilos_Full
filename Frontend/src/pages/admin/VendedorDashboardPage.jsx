import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCartOutlined,
  DollarOutlined,
  CarOutlined,
  TagsOutlined,
  FileTextOutlined,
  TeamOutlined,
  CreditCardOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { ventasApi } from '../../api/ventasApi';

const money = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const esHoy = (fecha) => {
  if (!fecha) return false;
  try {
    const d = new Date(fecha);
    const hoy = new Date();
    return (
      d.getFullYear() === hoy.getFullYear() &&
      d.getMonth() === hoy.getMonth() &&
      d.getDate() === hoy.getDate()
    );
  } catch {
    return false;
  }
};

const VendedorDashboardPage = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [metricas, setMetricas] = useState({
    ventasHoy: 0,
    ingresosHoy: 0,
    ventasTotales: 0,
    ingresosTotales: 0,
  });

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        const res = await ventasApi.getVentas({ limite: 200 });
        const ventas = Array.isArray(res?.datos) ? res.datos : [];

        const hoy = ventas.filter((v) => esHoy(v.creadoEn));
        setMetricas({
          ventasHoy: hoy.length,
          ingresosHoy: hoy.reduce((acc, v) => acc + (Number(v.total) || 0), 0),
          ventasTotales: ventas.length,
          ingresosTotales: ventas.reduce((acc, v) => acc + (Number(v.total) || 0), 0),
        });
      } catch (error) {
        console.error('Error cargando métricas de ventas:', error);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const kpis = [
    {
      title: 'Ventas de hoy',
      value: metricas.ventasHoy,
      icon: <ShoppingCartOutlined className="text-blue-600 text-lg" />,
    },
    {
      title: 'Ingresos de hoy',
      value: money(metricas.ingresosHoy),
      icon: <DollarOutlined className="text-emerald-600 text-lg" />,
    },
    {
      title: 'Ventas totales',
      value: metricas.ventasTotales,
      icon: <FileTextOutlined className="text-indigo-600 text-lg" />,
    },
    {
      title: 'Ingresos totales',
      value: money(metricas.ingresosTotales),
      icon: <CreditCardOutlined className="text-amber-600 text-lg" />,
    },
  ];

  const accesos = [
    {
      label: 'Registrar / Ver ventas',
      path: '/admin/ventas',
      icon: <ShoppingCartOutlined />,
      color: 'bg-indigo-50 text-indigo-600',
      desc: 'Punto de venta y detalle de pedidos',
    },
    {
      label: 'Créditos y cobros',
      path: '/admin/creditos/gestion',
      icon: <TagsOutlined />,
      color: 'bg-amber-50 text-amber-600',
      desc: 'Abonos y saldos de clientes',
    },
    {
      label: 'Devoluciones',
      path: '/admin/devoluciones',
      icon: <UndoOutlined />,
      color: 'bg-rose-50 text-rose-600',
      desc: 'Notas crédito y retornos',
    },
    {
      label: 'Catálogo de productos',
      path: '/admin/productos',
      icon: <CarOutlined />,
      color: 'bg-emerald-50 text-emerald-600',
      desc: 'Consulta stock y variantes',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900/40 px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <header className="rounded-2xl bg-white dark:bg-slate-800/60 p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Panel de ventas</p>
          <h1 className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
            Hola, {usuario?.nombres?.split(' ')[0] || 'vendedor'}
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Gestiona tu punto de venta y consulta tu desempeño del día.
          </p>
        </header>

        <section className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {kpis.map((metric) => (
            <article
              key={metric.title}
              className="rounded-2xl bg-white dark:bg-slate-800/60 p-4 shadow-sm"
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-slate-700/60">
                {metric.icon}
              </div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {metric.title}
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white md:text-lg">
                {loading ? '...' : metric.value}
              </p>
            </article>
          ))}
        </section>

        <section className="rounded-2xl bg-white dark:bg-slate-800/60 p-4 shadow-sm md:p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Accesos rápidos
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Herramientas de tu jornada de venta
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {accesos.map((item) => (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                className="group rounded-2xl border border-gray-100 dark:border-slate-700/50 p-4 text-left transition hover:border-indigo-300 hover:shadow-md"
              >
                <div className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl ${item.color}`}>
                  {item.icon}
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.label}</p>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-white dark:bg-slate-800/60 p-4 shadow-sm md:p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-slate-700/60">
              <TeamOutlined className="text-gray-600 dark:text-gray-300" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Perfil y atención al cliente
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Mis datos y herramientas del puesto
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin/ventas')}
              className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Nueva venta
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/metodos-pago')}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-700/50"
            >
              Métodos de pago
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default VendedorDashboardPage;