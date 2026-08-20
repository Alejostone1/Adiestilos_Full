import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiCheckCircle
} from 'react-icons/fi';
import { creditosApi } from '../../../api/creditosApi';
import Swal from 'sweetalert2';

const GestionCreditosPage = () => {
  const navigate = useNavigate();
  const [creditos, setCreditos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarCreditosActivos();
  }, []);

  const cargarCreditosActivos = async () => {
    setCargando(true);
    try {
      const res = await creditosApi.getCreditos({ estado: 'activo' });
      setCreditos(res.datos || []);
    } catch (error) {
      console.error('Error cargando gestión', error);
      Swal.fire('Error', 'No se pudo cargar la gestión de cartera', 'error');
    } finally {
      setCargando(false);
    }
  };

  const formatearPrecio = (valor) => {
    return Number(valor).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
  };

  const totalPorCobrar = creditos.reduce((acc, c) => acc + Number(c.saldoPendiente), 0);

  return (
    <div className="p-4 md:p-10 bg-gray-50 dark:bg-gray-950 min-h-screen animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Dashboard Header */}
        <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-500/30 relative overflow-hidden">
           <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                 <h1 className="text-3xl font-black tracking-tight">Gestión de Cobranza</h1>
                 <p className="text-indigo-200 font-medium">Panel de control de créditos activos</p>
              </div>
              <div className="text-center md:text-right">
                 <p className="text-xs font-bold uppercase tracking-widest text-indigo-200 mb-1">Total por Cobrar</p>
                 <p className="text-4xl font-black">{formatearPrecio(totalPorCobrar)}</p>
              </div>
           </div>
           
           {/* Decorativo */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
           <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-900/20 rounded-full -ml-12 -mb-12 blur-2xl" />
        </div>

        {/* Grid de Créditos Activos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {cargando ? (
             <p className="col-span-full text-center text-gray-400 py-10">Cargando cartera activa...</p>
           ) : creditos.length === 0 ? (
             <div className="col-span-full text-center py-20 bg-white dark:bg-gray-900 rounded-[2.5rem]">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                   <FiCheckCircle className="text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">¡Todo al día!</h3>
                <p className="text-gray-500">No hay créditos activos pendientes de cobro.</p>
             </div>
           ) : (
             creditos.map(credito => (
               <div key={credito.idCredito} 
                 onClick={() => navigate(`/admin/creditos/detalle/${credito.idCredito}`)}
                 className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] shadow-lg shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 hover:scale-[1.02] transition-all cursor-pointer group"
               >
                  <div className="flex justify-between items-start mb-4">
                     <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">{credito.usuarioCliente?.nombres}</h4>
                        <p className="text-xs text-gray-400 font-medium">{credito.usuarioCliente?.apellidos}</p>
                     </div>
                     <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black uppercase rounded-lg border border-amber-100">
                        Por Cobrar
                     </span>
                  </div>
                  
                  <div className="space-y-4">
                     <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Deuda Original</span>
                        <span className="font-bold text-gray-600 dark:text-gray-300">{formatearPrecio(credito.montoTotal)}</span>
                     </div>
                     <div className="flex justify-between text-lg font-black text-indigo-600 border-t border-gray-100 dark:border-gray-800 pt-4">
                        <span>Saldo</span>
                        <span>{formatearPrecio(credito.saldoPendiente)}</span>
                     </div>
                     
                     <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                        <div 
                           className="bg-indigo-500 h-full rounded-full" 
                           style={{ width: `${Math.round(((credito.montoTotal - credito.saldoPendiente) / credito.montoTotal) * 100)}%` }} 
                        />
                     </div>
                     <p className="text-[10px] text-gray-400 text-center uppercase font-bold">
                        {Math.round(((credito.montoTotal - credito.saldoPendiente) / credito.montoTotal) * 100)}% Pagado
                     </p>
                  </div>
               </div>
             ))
           )}
        </div>

      </div>
    </div>
  );
};

export default GestionCreditosPage;
