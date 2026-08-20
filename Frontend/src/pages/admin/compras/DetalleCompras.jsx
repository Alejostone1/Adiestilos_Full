import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FiArrowLeft, FiPackage, FiTruck, FiDollarSign,
  FiSearch, FiFilter, FiCalendar, FiUser,
  FiHash, FiTag, FiClock, FiActivity, FiLayers
} from 'react-icons/fi';
import comprasApi from '../../../api/comprasApi';

const formatearPrecioColombia = (valor) => {
  const numero = Math.round(Number(valor) || 0);
  return numero.toLocaleString('es-CO');
};

const DetalleComprasPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [compras, setCompras] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  const [estadisticas, setEstadisticas] = useState({
    totalInversion: 0,
    totalItems: 0,
    promedioItem: 0,
    proveedorTop: 'N/A'
  });

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      let data;
      if (id) {
        // Cargar una sola compra específica
        const res = await comprasApi.obtenerCompra(id);
        data = [res.datos || res];
      } else {
        // Cargar múltiples compras para auditoría global
        const res = await comprasApi.obtenerCompras({ limite: 50 });
        data = Array.isArray(res) ? res : res.datos || [];
      }

      setCompras(data);
      calcularEstadisticas(data);
    } catch (error) {
      console.error('Error cargando detalles de compras:', error);
    } finally {
      setCargando(false);
    }
  };

  const calcularEstadisticas = (lista) => {
    let totalItems = 0;
    let totalInversion = 0;
    const proveedores = {};

    lista.forEach(c => {
      const total = Number(c.total) || 0;
      totalInversion += total;
      c.detalleCompras?.forEach(d => {
        totalItems += Number(d.cantidad) || 0;
      });
      const pNombre = c.proveedor?.nombreProveedor;
      if (pNombre) {
        proveedores[pNombre] = (proveedores[pNombre] || 0) + total;
      }
    });

    const topProv = Object.entries(proveedores).sort((a, b) => b[1] - a[1])[0];

    setEstadisticas({
      totalInversion,
      totalItems,
      promedioItem: totalItems > 0 ? totalInversion / totalItems : 0,
      proveedorTop: topProv ? topProv[0] : 'N/A'
    });
  };

  // Aplatana todos los detalles de todas las compras cargadas
  const todosLosDetalles = compras.flatMap(c =>
    (c.detalleCompras || []).map(d => ({
      ...d,
      compraRef: c.numeroCompra || `#${c.idCompra}`,
      idCompra: c.idCompra,
      proveedor: c.proveedor?.nombreProveedor,
      fecha: c.fechaCompra,
      estadoPedido: c.estadoPedido
    }))
  );

  const detallesFiltrados = todosLosDetalles.filter(d =>
    d.variante?.producto?.nombreProducto?.toLowerCase().includes(filtroBusqueda.toLowerCase()) ||
    d.compraRef.toLowerCase().includes(filtroBusqueda.toLowerCase()) ||
    d.proveedor?.toLowerCase().includes(filtroBusqueda.toLowerCase())
  );

  return (
    <div className="p-4 md:p-10 bg-gray-50 dark:bg-gray-950 min-h-screen">
      {/* Header Estilizado */}
      <div className="max-w-[1600px] mx-auto space-y-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => navigate('/admin/compras')}
              className="p-4 bg-white dark:bg-gray-900 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none hover:scale-110 transition-all text-gray-500 hover:text-indigo-600 border border-gray-100 dark:border-gray-800"
            >
              <FiArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <nav className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-1">
                <Link to="/admin/compras" className="hover:underline">Abastecimiento</Link>
                <span>/</span>
                <span className="text-gray-400">Análisis Profundo</span>
              </nav>
              <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                {id ? `Resumen de Operación: ${compras[0]?.numeroCompra || id}` : "Dashboard de Auditoría de Compras"}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2 mt-1">
                <FiActivity className="text-emerald-500" />
                {id ? "Visualización detallada de la orden seleccionada." : "Análisis volumétrico de todos los productos ingresados al almacén."}
              </p>
            </div>
          </div>

          {!id && (
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-80">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={filtroBusqueda}
                  onChange={(e) => setFiltroBusqueda(e.target.value)}
                  placeholder="Buscar ítem, referencia o proveedor..."
                  className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-900 border-none rounded-[20px] shadow-xl shadow-gray-200/50 dark:shadow-none text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <button className="p-4 bg-white dark:bg-gray-900 rounded-[20px] shadow-xl shadow-gray-200/50 dark:shadow-none text-gray-400 hover:text-indigo-600 transition-all border border-gray-100 dark:border-gray-800">
                <FiFilter className="h-6 w-6" />
              </button>
            </div>
          )}
        </div>

        {/* KPIs Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <AnalyticsCard
            title="Suma Total Invertida"
            value={`$${formatearPrecioColombia(estadisticas.totalInversion)}`}
            subtitle="Basado en registros actuales"
            icon={<FiDollarSign />}
            color="indigo"
          />
          <AnalyticsCard
            title="Volumen de Mercancía"
            value={estadisticas.totalItems}
            subtitle="Unidades totales ingresadas"
            icon={<FiPackage />}
            color="blue"
          />
          <AnalyticsCard
            title="Proveedor Estratégico"
            value={estadisticas.proveedorTop}
            subtitle="Mayor volumen de compra"
            icon={<FiTruck />}
            color="emerald"
          />
          <AnalyticsCard
            title="Costo Promedio Unitario"
            value={`$${formatearPrecioColombia(estadisticas.promedioItem)}`}
            subtitle="Eficiencia de abastecimiento"
            icon={<FiLayers />}
            color="purple"
          />
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-gray-950 rounded-[40px] shadow-2xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="px-10 py-8 border-b border-gray-50 dark:border-gray-900 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/30">
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white">Desglose de Ítems</h2>
              <p className="text-sm text-gray-400 font-medium">Lista detallada de variantes y especificaciones</p>
            </div>
            <div className="bg-white dark:bg-gray-800 px-6 py-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <span className="text-xs font-black text-indigo-500 uppercase tracking-widest">{detallesFiltrados.length} Ítems</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            {cargando ? (
              <div className="py-32 flex flex-col items-center justify-center space-y-6">
                <div className="w-16 h-16 border-k border-indigo-200 border-t-indigo-600 rounded-full animate-spin border-4" />
                <p className="text-gray-400 font-black uppercase tracking-widest text-xs animate-pulse">Compilando datos maestros...</p>
              </div>
            ) : (
              <table className="min-w-full">
                <thead>
                  <tr className="bg-white dark:bg-gray-950 text-left">
                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Variante & Producto</th>
                    <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Referencia de Compra</th>
                    <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Proveedor / Propietario</th>
                    <th className="px-6 py-6 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Cantidad</th>
                    <th className="px-6 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Costo Unit.</th>
                    <th className="px-6 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Descuento</th>
                    <th className="px-10 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Línea</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-900">
                  {detallesFiltrados.map((detalle, idx) => {
                    const img = detalle.variante?.imagenesVariantes?.[0]?.rutaImagen ||
                                detalle.variante?.producto?.imagenesProductos?.[0]?.rutaImagen;

                    return (
                      <tr key={`${detalle.idDetalleCompra}-${idx}`} className="hover:bg-indigo-50/20 dark:hover:bg-indigo-900/10 transition-colors group">
                        <td className="px-10 py-6">
                          <div className="flex items-center space-x-5">
                            <div className="relative h-14 w-14 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm group-hover:scale-110 transition-transform">
                              {img ? (
                                <img src={img} alt="Variante" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                  <FiPackage className="h-6 w-6" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-black text-gray-900 dark:text-white leading-tight">
                                {detalle.variante?.producto?.nombreProducto}
                              </p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-lg">
                                  {detalle.variante?.color?.codigoHex && (
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: detalle.variante.color.codigoHex }} />
                                  )}
                                  <span className="text-[10px] font-bold text-gray-500 uppercase">{detalle.variante?.color?.nombreColor || 'N/A'}</span>
                                </div>
                                <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tighter ring-1 ring-indigo-500/20">
                                  {detalle.variante?.talla?.nombreTalla || 'Única'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <Link to={`/admin/compras`} className="flex items-center space-x-2 text-indigo-500 hover:underline">
                            <FiHash className="h-3 w-3" />
                            <span className="text-sm font-black tracking-tight">{detalle.compraRef}</span>
                          </Link>
                          <div className="flex items-center space-x-1.5 mt-1 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            <FiCalendar className="h-2.5 w-2.5" />
                            <span>{new Date(detalle.fecha).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-[10px] font-black">
                              {detalle.proveedor?.[0]}
                            </div>
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300 tracking-tight">{detalle.proveedor || 'S/N'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-6 text-center">
                          <span className="text-sm font-black text-gray-900 dark:text-gray-200">{detalle.cantidad}</span>
                        </td>
                        <td className="px-6 py-6 text-right font-medium text-sm text-gray-600 dark:text-gray-400">
                          ${formatearPrecioColombia(detalle.precioUnitario)}
                        </td>
                        <td className="px-6 py-6 text-right">
                          <span className={`text-[10px] font-black border px-2 py-1 rounded-lg ${Number(detalle.descuentoLinea) > 0 ? 'bg-red-50 text-red-500 border-red-100 dark:bg-red-900/20 dark:border-red-900' : 'text-gray-300 border-transparent'}`}>
                            {Number(detalle.descuentoLinea) > 0 ? `-$${formatearPrecioColombia(detalle.descuentoLinea)}` : '$0'}
                          </span>
                        </td>
                        <td className="px-10 py-6 text-right">
                          <span className="text-base font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">
                            ${formatearPrecioColombia(detalle.totalLinea)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* Componentes Visuales Privados */

const AnalyticsCard = ({ title, value, subtitle, icon, color }) => {
  const styles = {
    indigo: "from-indigo-600 to-blue-700 shadow-indigo-500/20",
    blue: "from-blue-500 to-indigo-600 shadow-blue-500/20",
    emerald: "from-emerald-500 to-teal-700 shadow-emerald-500/20",
    purple: "from-purple-600 to-indigo-800 shadow-purple-500/20"
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-8 rounded-[40px] shadow-2xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 relative overflow-hidden group hover:-translate-y-2 transition-all duration-300">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${styles[color]} opacity-[0.03] rounded-bl-[100px] translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-700`} />

      <div className="flex flex-col space-y-4">
        <div className={`h-14 w-14 bg-gradient-to-br ${styles[color]} rounded-2xl flex items-center justify-center text-white text-2xl shadow-xl`}>
          {icon}
        </div>
        <div>
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</h4>
          <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter mt-1">{value}</p>
          <div className="flex items-center space-x-2 mt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{subtitle}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleComprasPage;
