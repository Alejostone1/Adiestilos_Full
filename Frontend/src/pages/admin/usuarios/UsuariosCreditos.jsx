import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Wallet, CreditCard, Clock, 
  TrendingUp, Activity, CheckCircle2, AlertCircle,
  Calendar, DollarSign, ChevronRight, RefreshCcw,
  Plus, History, Search, Filter, ArrowUpRight,
  ShieldCheck, Banknote, ListFilter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usuariosApi } from "../../../api/usuariosApi";
import PrecioFormateado from '../../../components/common/PrecioFormateado';

export default function UsuariosCreditos() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [creditos, setCreditos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState({
      saldoTotal: 0,
      cuotasPendientes: 0,
      totalPagado: 0
  });

  const fetchDatos = useCallback(async () => {
    try {
      setLoading(true);
      const [usuarioData, creditosData] = await Promise.all([
        usuariosApi.getUsuarioById(id),
        usuariosApi.getHistorialCreditosUsuario(id)
      ]);
      setUsuario(usuarioData.datos || usuarioData);
      setCreditos(creditosData.datos || []);
      
      // Calcular estadísticas rápidas
      const stats = (creditosData.datos || []).reduce((acc, c) => {
          acc.saldoTotal += parseFloat(c.saldoPendiente || 0);
          acc.totalPagado += parseFloat(c.montoPagado || 0);
          acc.cuotasPendientes += (c.cuotas?.filter(q => q.estado === 'pendiente').length || 0);
          return acc;
      }, { saldoTotal: 0, cuotasPendientes: 0, totalPagado: 0 });
      setEstadisticas(stats);

    } catch (err) {
      console.error('Error fetching creditos usuario:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDatos();
  }, [fetchDatos]);

  const getEstadoEstilo = (estado) => {
    const s = estado?.toLowerCase();
    if (s === 'al_dia' || s === 'pagado') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200';
    if (s === 'atrasado' || s === 'mora') return 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 border-rose-200';
    return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border-amber-200';
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 p-6 md:p-10 space-y-10 transition-colors duration-300">
      
      {/* Dynamic Header */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-10">
         <div className="flex items-center gap-8">
            <motion.button 
              whileHover={{ scale: 1.1, x: -5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/admin/usuarios')}
              className="p-5 bg-white dark:bg-gray-900 rounded-[2rem] text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-xl shadow-gray-200/50 dark:shadow-none transition-all border border-gray-50 dark:border-gray-800"
            >
              <ArrowLeft size={32} />
            </motion.button>
            
            <div>
               <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight leading-none text-balance">Gestión de Carteras</h1>
                  <div className="flex items-center gap-1 px-3 py-1 bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400 rounded-full text-[10px] font-bold uppercase tracking-widest">
                     <ShieldCheck size={12} /> Cliente VIP
                  </div>
               </div>
               
               {usuario && (
                  <div className="flex items-center gap-4 group">
                     <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">Analizando créditos de <span className="text-gray-900 dark:text-white font-bold border-b-2 border-indigo-500/30 group-hover:border-indigo-500 transition-all">{usuario.nombres} {usuario.apellidos}</span></p>
                     <p className="hidden md:block text-xs font-mono bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg text-gray-400">ID-SYS: {usuario.idUsuario}</p>
                  </div>
               )}
            </div>
         </div>

         <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
            <motion.button 
               whileHover={{ scale: 1.02 }}
               whileTap={{ scale: 0.98 }}
               onClick={() => navigate('/admin/creditos/gestion')}
               className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-bold shadow-2xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all text-lg"
            >
               <Plus size={24} /> Nueva Obligación
            </motion.button>
            <button 
               onClick={fetchDatos}
               className="p-4 bg-white dark:bg-gray-900 text-gray-400 hover:text-indigo-500 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all"
            >
               <RefreshCcw size={24} className={loading ? 'animate-spin' : ''} />
            </button>
         </div>
      </div>

      {/* Financial Health Score (Stat Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group"
         >
            <div className="absolute top-0 right-0 p-8 text-indigo-500/5 group-hover:text-indigo-500/10 transition-all group-hover:scale-150 duration-500">
               <Wallet size={120} />
            </div>
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl w-fit mb-6">
               <Banknote size={32} />
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 leading-none">Deuda Global Vigente</p>
            <h4 className="text-3xl font-bold text-gray-900 dark:text-white leading-none">
               <PrecioFormateado precio={estadisticas.saldoTotal} />
            </h4>
            <div className="mt-6 flex items-center gap-2 text-xs font-bold text-gray-400">
               <TrendingUp size={14} className="text-emerald-500" />
               Capacidad de pago estable
            </div>
         </motion.div>

         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group"
         >
            <div className="absolute top-0 right-0 p-8 text-amber-500/5 group-hover:text-amber-500/10 transition-all group-hover:scale-150 duration-500">
               <Clock size={120} />
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-2xl w-fit mb-6">
               <Activity size={32} />
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 leading-none">Cuotas por Recaudar</p>
            <h4 className="text-3xl font-bold text-gray-900 dark:text-white leading-none">
               {estadisticas.cuotasPendientes} <span className="text-lg text-gray-400 font-bold tracking-tight">Vencimientos</span>
            </h4>
            <div className="mt-6 flex items-center gap-2 text-xs font-bold text-gray-400">
               <Calendar size={14} className="text-amber-500" />
               Vigencia promedio de 30 días
            </div>
         </motion.div>

         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group"
         >
            <div className="absolute top-0 right-0 p-8 text-emerald-500/5 group-hover:text-emerald-500/10 transition-all group-hover:scale-150 duration-500">
               <CheckCircle2 size={120} />
            </div>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl w-fit mb-6">
               <ArrowUpRight size={32} />
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 leading-none">Capital Recuperado</p>
            <h4 className="text-3xl font-bold text-gray-900 dark:text-white leading-none">
               <PrecioFormateado precio={estadisticas.totalPagado} />
            </h4>
            <div className="mt-6 flex items-center gap-2 text-xs font-bold text-gray-400">
               <History size={14} className="text-indigo-500" />
               {creditos.length} Créditos otorgados
            </div>
         </motion.div>
      </div>

      {/* Credit Ledger Area */}
      <div className="bg-white dark:bg-gray-900 rounded-[3rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 overflow-hidden">
         <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-6 bg-gray-50/20 dark:bg-gray-800/10">
            <h5 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-3">
               <ListFilter size={24} className="text-indigo-600" /> Listado Detallado de Obligaciones
            </h5>
            <div className="flex gap-4 w-full md:w-auto">
               <div className="relative flex-1 md:w-64 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500" size={18} />
                  <input type="text" placeholder="Buscar Nº Crédito..." className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all outline-none" />
               </div>
               <button className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-400 hover:text-indigo-600 transition-all">
                  <Filter size={20} />
               </button>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full">
               <thead>
                  <tr className="bg-gray-50/50 dark:bg-gray-800/50 text-left border-b border-gray-100 dark:border-gray-800 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                     <th className="px-8 py-6">ID Obligación / Origen</th>
                     <th className="px-8 py-6">Estructura de Capital</th>
                     <th className="px-8 py-6">Amortización</th>
                     <th className="px-8 py-6">Saldo Actual</th>
                     <th className="px-8 py-6">Estado Cartera</th>
                     <th className="px-8 py-6 text-right">Acciones</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                  <AnimatePresence>
                    {creditos.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-24 text-center">
                           <div className="flex flex-col items-center gap-5 opacity-40">
                              <History size={64} className="text-gray-300" />
                              <p className="text-lg font-bold text-gray-500">No se registran créditos en esta cuenta.</p>
                           </div>
                        </td>
                      </tr>
                    ) : (
                      creditos.map((c, idx) => (
                        <motion.tr 
                          key={c.idCredito}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="hover:bg-indigo-50/20 dark:hover:bg-indigo-900/5 transition-colors group cursor-pointer"
                          onClick={() => navigate(`/admin/creditos/detalle/${c.idCredito}`)}
                        >
                           <td className="px-8 py-7">
                              <div className="flex items-center gap-4">
                                 <div className="p-3 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400 rounded-2xl shadow-inner">
                                    <CreditCard size={20} />
                                 </div>
                                 <div>
                                    <div className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase">Oblig. #{c.idCredito}</div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Ref: {c.venta?.numeroFactura || 'Préstamo Directo'}</div>
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-7">
                              <div className="space-y-1">
                                 <div className="text-sm font-bold text-gray-800 dark:text-gray-200"><PrecioFormateado precio={c.montoTotal} /></div>
                                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter italic">Interés incluido en capital</p>
                              </div>
                           </td>
                           <td className="px-8 py-7">
                              <div className="space-y-2">
                                 <div className="flex justify-between items-center text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
                                    <span>Progreso</span>
                                    <span>{Math.round((parseFloat(c.montoPagado) / parseFloat(c.montoTotal)) * 100)}%</span>
                                 </div>
                                 <div className="w-32 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                     <div 
                                        className="h-full bg-indigo-500 rounded-full" 
                                        style={{ width: `${(parseFloat(c.montoPagado) / parseFloat(c.montoTotal)) * 100}%` }}
                                     />
                                 </div>
                                 <p className="text-[10px] font-bold text-gray-400 uppercase leading-none">Pagado: <PrecioFormateado precio={c.montoPagado} /></p>
                              </div>
                           </td>
                           <td className="px-8 py-7">
                              <div className="text-lg font-bold text-gray-900 dark:text-white leading-none"><PrecioFormateado precio={c.saldoPendiente} /></div>
                              <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mt-1.5 animate-pulse">Carga Pendiente</p>
                           </td>
                           <td className="px-8 py-7">
                              <span className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] border transition-all ${getEstadoEstilo(c.estado)}`}>
                                 {c.estado === 'al_dia' ? 'Vigente / Al día' : c.estado}
                              </span>
                           </td>
                           <td className="px-8 py-7 text-right">
                              <button className="p-3 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-2xl hover:scale-110 transition-all border border-transparent hover:border-indigo-100">
                                 <ChevronRight size={24} />
                              </button>
                           </td>
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
               </tbody>
            </table>
         </div>

         {/* Ledger Footer */}
         <div className="p-8 bg-gray-50/40 dark:bg-gray-800/20 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
             <div className="flex items-center gap-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <AlertCircle size={16} className="text-amber-500" />
                Los saldos mostrados se actualizan en tiempo real tras cada pago registrado.
             </div>
             <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
                Mostrando <span className="text-indigo-600">{creditos.length}</span> obligacione(s) activas
             </p>
         </div>
      </div>

    </div>
  );
}
