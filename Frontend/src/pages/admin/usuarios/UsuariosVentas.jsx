import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ShoppingBag, Calendar, DollarSign, 
  ChevronRight, Search, Activity, CornerDownRight,
  Filter, RotateCcw, User, ExternalLink, TrendingUp,
  Receipt, CreditCard, Clock, Tag, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usuariosApi } from "../../../api/usuariosApi";
import PrecioFormateado from '../../../components/common/PrecioFormateado';

export default function UsuariosVentas() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [paginacion, setPaginacion] = useState({ paginaActual: 1, totalPaginas: 1 });

  const fetchDatos = useCallback(async (pagina = 1) => {
    try {
      setLoading(true);
      const [usuarioData, ventasData] = await Promise.all([
        usuariosApi.getUsuarioById(id),
        usuariosApi.getHistorialVentasUsuario(id, { pagina, limite: 10 })
      ]);
      setUsuario(usuarioData.datos || usuarioData);
      setVentas(ventasData.datos || []);
      setPaginacion(ventasData.paginacion || { paginaActual: 1, totalPaginas: 1 });
    } catch (err) {
      console.error('Error fetching ventas usuario:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDatos();
  }, [fetchDatos]);

  const getEstadoEstilo = (estado) => {
    const s = estado?.toLowerCase();
    if (s === 'completado' || s === 'entregado') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200';
    if (s === 'pendiente') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200';
    if (s === 'cancelado') return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200';
    return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200';
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 p-4 md:p-10 space-y-10 transition-colors duration-300">
      
      {/* Header & Profiler */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
           <motion.button 
             whileHover={{ scale: 1.1, x: -5 }}
             whileTap={{ scale: 0.9 }}
             onClick={() => navigate('/admin/usuarios')}
             className="p-4 bg-white dark:bg-gray-900 rounded-3xl text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-xl shadow-gray-200/50 dark:shadow-none transition-all"
           >
             <ArrowLeft size={28} />
           </motion.button>
           
           <div>
              <div className="flex items-center gap-3 mb-2">
                 <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Historial de Ventas</h1>
                 <span className="px-3 py-1 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400 rounded-full text-[10px] font-bold uppercase tracking-widest">Auditoría Cliente</span>
              </div>
              <div className="flex items-center gap-4">
                 {usuario && (
                    <div className="flex items-center gap-3 bg-white dark:bg-gray-900 px-5 py-2.5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                       <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white font-bold">
                          {usuario.nombres?.charAt(0)}
                       </div>
                       <div>
                          <p className="text-sm font-bold text-gray-800 dark:text-gray-200 leading-tight">{usuario.nombres} {usuario.apellidos}</p>
                          <p className="text-xs font-bold text-gray-400">@{usuario.usuario}</p>
                       </div>
                    </div>
                 )}
                 <div className="hidden md:flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Acuñado</span>
                    <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400 leading-tight">
                        <PrecioFormateado precio={ventas.reduce((acc, v) => acc + parseFloat(v.total), 0)} />
                    </span>
                 </div>
              </div>
           </div>
        </div>

        <div className="flex items-center gap-4 w-full xl:w-auto">
           <div className="relative flex-1 xl:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Nº Factura..."
                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 focus:border-indigo-500 dark:text-white transition-all shadow-sm font-bold"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
           </div>
           <button 
             onClick={() => fetchDatos()}
             className="p-4 bg-white dark:bg-gray-900 text-gray-400 hover:text-indigo-500 rounded-2xl border border-gray-100 dark:border-gray-800 transition-all shadow-sm"
           >
             <RotateCcw size={24} className={loading ? 'animate-spin' : ''} />
           </button>
        </div>
      </div>

      {/* Stats QuickView */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-5">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl">
               <Receipt size={24} />
            </div>
            <div>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">T. Transacciones</p>
               <h4 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{paginacion.totalRegistros || 0}</h4>
            </div>
         </div>
         <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-5">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl">
               <DollarSign size={24} />
            </div>
            <div>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Recaudado</p>
               <h4 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                  <PrecioFormateado precio={ventas.filter(v => v.estadoPago === 'pagado').reduce((acc, v) => acc + parseFloat(v.total), 0)} />
               </h4>
            </div>
         </div>
         <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-5">
            <div className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-2xl">
               <Activity size={24} />
            </div>
            <div>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Por Cobrar</p>
               <h4 className="text-xl font-bold text-rose-600 leading-tight">
                  <PrecioFormateado precio={ventas.reduce((acc, v) => acc + parseFloat(v.saldoPendiente || 0), 0)} />
               </h4>
            </div>
         </div>
         <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-5">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-2xl">
               <Clock size={24} />
            </div>
            <div>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Promedio Mes</p>
               <h4 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                  <PrecioFormateado precio={ventas.length > 0 ? (ventas.reduce((acc, v) => acc + parseFloat(v.total), 0) / (ventas.length || 1)) : 0} />
               </h4>
            </div>
         </div>
      </div>

      {/* Main List */}
      <div className="space-y-6">
         <AnimatePresence>
            {ventas.length === 0 && !loading ? (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="bg-white dark:bg-gray-900 rounded-[3rem] p-20 border-4 border-dashed border-gray-100 dark:border-gray-800 text-center"
               >
                  <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                     <ShoppingBag size={48} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Sin historial registrado</h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm mx-auto font-medium">Este usuario aún no ha concretado transacciones comerciales en el sistema.</p>
               </motion.div>
            ) : (
               <div className="grid grid-cols-1 gap-6">
                  {ventas.filter(v => v.numeroFactura.toLowerCase().includes(busqueda.toLowerCase())).map((venta, idx) => (
                    <motion.div 
                        key={venta.idVenta}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/5 dark:hover:shadow-none transition-all group overflow-hidden"
                    >
                        <div className="p-8 flex flex-col lg:flex-row lg:items-center gap-8">
                           {/* Icon & Factura */}
                           <div className="flex items-center gap-5 min-w-[280px]">
                               <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all ${venta.estadoPago === 'pagado' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-none' : 'bg-amber-500 text-white shadow-lg shadow-amber-200 dark:shadow-none'}`}>
                                 <Receipt size={32} />
                              </div>
                              <div>
                                 <div className="flex items-center gap-3 mb-1">
                                    <span className="text-lg font-bold text-gray-900 dark:text-white uppercase">{venta.numeroFactura}</span>
                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${getEstadoEstilo(venta.estadoPedido?.nombreEstado)}`}>
                                       {venta.estadoPedido?.nombreEstado || 'Completada'}
                                    </span>
                                 </div>
                                 <div className="flex items-center gap-3 text-xs font-bold text-gray-400">
                                    <span className="flex items-center gap-1"><Calendar size={14}/> {new Date(venta.creadoEn).toLocaleDateString()}</span>
                                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                    <span className="flex items-center gap-1 uppercase tracking-tighter"><Tag size={14} /> {venta.tipoVenta}</span>
                                 </div>
                              </div>
                           </div>

                           {/* Financial Details */}
                           <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-6 px-10 border-x border-gray-100 dark:border-gray-800">
                               <div>
                                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 leading-none">Subtotal</p>
                                 <p className="text-sm font-bold text-gray-600 dark:text-gray-400 leading-none truncate">
                                    <PrecioFormateado precio={venta.subtotal} />
                                 </p>
                              </div>
                              <div>
                                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 leading-none">Impuestos</p>
                                 <p className="text-sm font-bold text-gray-600 dark:text-gray-400 leading-none truncate">
                                    <PrecioFormateado precio={venta.impuestos} />
                                 </p>
                              </div>
                              <div>
                                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 leading-none">Descuento</p>
                                 <p className="text-sm font-bold text-rose-500 dark:text-rose-400 leading-none truncate">
                                    - <PrecioFormateado precio={venta.descuentoTotal} />
                                 </p>
                              </div>
                              <div>
                                 <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1 leading-none">Total Neto</p>
                                 <p className="text-lg font-bold text-gray-900 dark:text-white leading-none truncate">
                                    <PrecioFormateado precio={venta.total} />
                                 </p>
                              </div>
                           </div>

                           {/* Summary Expansion / Actions */}
                           <div className="flex items-center gap-6">
                               <div className="hidden sm:block text-right">
                                 <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Estado Financiero</div>
                                 {Number(venta.saldoPendiente) > 0 ? (
                                    <span className="px-4 py-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl text-[10px] font-bold uppercase ring-1 ring-rose-200 dark:ring-0">
                                       Deuda: <PrecioFormateado precio={venta.saldoPendiente} />
                                    </span>
                                 ) : (
                                    <span className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-[10px] font-bold uppercase ring-1 ring-emerald-200 dark:ring-0">
                                       Saldado
                                    </span>
                                 )}
                              </div>
                              
                              <motion.button 
                                whileHover={{ scale: 1.1, x: 5 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => navigate(`/admin/usuarios/${id}/ventas/${venta.idVenta}`)}
                                className="p-4 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-2xl border border-gray-100 dark:border-gray-800 transition-all shadow-sm"
                              >
                                 <ChevronRight size={24} />
                              </motion.button>
                           </div>
                        </div>

                        {/* Extra Trace Info */}
                        <div className="px-10 py-4 bg-gray-50 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-8 items-center text-[10px] font-black text-gray-400 uppercase tracking-wider">
                           <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                              ID Operación: <span className="text-gray-600 dark:text-gray-300 ml-1">#VNT-{venta.idVenta}</span>
                           </div>
                           {venta.usuarioVendedor && (
                              <div className="flex items-center gap-2">
                                 <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                 Vendedor: <span className="text-gray-600 dark:text-gray-300 ml-1">{venta.usuarioVendedor.nombres}</span>
                              </div>
                           )}
                           <div className="flex items-center gap-2 ml-auto text-indigo-500 hover:text-indigo-600 cursor-pointer transition-colors" onClick={() => navigate(`/admin/usuarios/${id}/ventas/${venta.idVenta}`)}>
                              Ver Detalles Completos <ExternalLink size={12} />
                           </div>
                        </div>
                    </motion.div>
                  ))}
               </div>
            )}
         </AnimatePresence>

         {/* Paginación Ultra Moderna */}
         {paginacion.totalPaginas > 1 && (
            <div className="flex justify-center items-center gap-4 py-10">
               <button 
                  disabled={paginacion.paginaActual === 1}
                  onClick={() => fetchDatos(paginacion.paginaActual - 1)}
                  className="px-6 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm font-black text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm"
               > Anterior </button>
               
               <div className="flex items-center gap-2">
                  {Array.from({ length: paginacion.totalPaginas }).map((_, i) => (
                    <button 
                        key={i}
                        onClick={() => fetchDatos(i + 1)}
                        className={`w-12 h-12 rounded-2xl text-sm font-black transition-all ${paginacion.paginaActual === i + 1 ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 dark:shadow-none' : 'bg-white dark:bg-gray-900 text-gray-400 border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    > {i + 1} </button>
                  ))}
               </div>

               <button 
                  disabled={paginacion.paginaActual === paginacion.totalPaginas}
                  onClick={() => fetchDatos(paginacion.paginaActual + 1)}
                  className="px-6 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm font-black text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm"
               > Siguiente </button>
            </div>
         )}
      </div>

    </div>
  );
}
