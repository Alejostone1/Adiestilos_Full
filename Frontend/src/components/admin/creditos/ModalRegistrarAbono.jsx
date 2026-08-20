import React, { useState, useEffect } from 'react';
import { 
  FiX, FiDollarSign, FiCreditCard, FiCheckCircle, FiAlertCircle, 
  FiPlus, FiTrash2, FiInfo, FiActivity 
} from 'react-icons/fi';
import { creditosApi } from '../../../api/creditosApi';
import { metodosPagoApi } from '../../../api/metodosPagoApi';
import Swal from 'sweetalert2';

const ModalRegistrarAbono = ({ isOpen, onClose, credito, onAbonoRegistrado }) => {
  const [pagosMultimetodo, setPagosMultimetodo] = useState({});
  const [notas, setNotas] = useState('');
  
  const [metodosPago, setMetodosPago] = useState([]);
  const [cargandoMetodos, setCargandoMetodos] = useState(true);
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    if (isOpen) {
      cargarMetodosPago();
      resetForm();
    }
  }, [isOpen]);

  const cargarMetodosPago = async () => {
    try {
      setCargandoMetodos(true);
      const res = await metodosPagoApi.getMetodosPago();
      setMetodosPago(res.datos || res || []);
    } catch (error) {
      console.error('Error cargando métodos de pago', error);
    } finally {
      setCargandoMetodos(false);
    }
  };

  const resetForm = () => {
    setPagosMultimetodo({});
    setNotas('');
  };

  const toggleMetodo = (metodo) => {
    const idKey = metodo.idMetodoPago.toString();
    
    // Lógica para métodos mixtos (ej: "Efectivo + Tarjeta")
    if (metodo.nombreMetodo.includes('+')) {
      const partes = metodo.nombreMetodo.split('+').map(s => s.trim());
      const idsActivados = {};
      
      partes.forEach(parte => {
        // Buscar coincidencia exacta primero, luego parcial
        let match = metodosPago.find(m => 
          m.nombreMetodo.toLowerCase() === parte.toLowerCase() && 
          !m.nombreMetodo.includes('+')
        );
        
        // Mapeo de alias comunes si no hay match directo
        if (!match) {
          const pLower = parte.toLowerCase();
          if (pLower.includes('crédito')) match = metodosPago.find(m => m.nombreMetodo.toLowerCase().includes('crédito tienda'));
          if (pLower === 'tarjeta') match = metodosPago.find(m => m.nombreMetodo.toLowerCase().includes('tarjeta crédito'));
          if (pLower === 'transferencia') match = metodosPago.find(m => m.nombreMetodo.toLowerCase().includes('transferencia') || m.nombreMetodo.toLowerCase().includes('pse'));
        }

        if (match) {
          idsActivados[match.idMetodoPago.toString()] = 0;
        }
      });

      if (Object.keys(idsActivados).length > 0) {
        setPagosMultimetodo(prev => ({ ...prev, ...idsActivados }));
        return;
      }
    }

    // Lógica estándar para métodos simples
    setPagosMultimetodo(prev => {
      const newState = { ...prev };
      if (newState[idKey] !== undefined) {
        delete newState[idKey];
        delete newState[`referencia_${idKey}`];
      } else {
        newState[idKey] = 0;
      }
      return newState;
    });
  };

  const updateMonto = (idKey, monto) => {
    setPagosMultimetodo(prev => ({
      ...prev,
      [idKey]: Math.max(0, Number(monto))
    }));
  };

  const updateReferencia = (idKey, ref) => {
    setPagosMultimetodo(prev => ({
      ...prev,
      [`referencia_${idKey}`]: ref
    }));
  };

  const totalAbono = Object.entries(pagosMultimetodo)
    .filter(([k]) => !k.includes('referencia'))
    .reduce((acc, [_, v]) => acc + (Number(v) || 0), 0);

  const saldoRestante = Number(credito?.saldoPendiente || 0) - totalAbono;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (totalAbono <= 0) {
      return Swal.fire('Error', 'Debe ingresar un monto válido para abonar.', 'warning');
    }

    if (totalAbono > Number(credito.saldoPendiente) + 10) { // Margen pequeño por decimales
      return Swal.fire('Error', 'El monto total no puede exceder el saldo pendiente.', 'error');
    }

    try {
      setProcesando(true);
      
      const payload = {
        pagos: Object.entries(pagosMultimetodo)
          .filter(([k, v]) => !k.includes('referencia') && Number(v) > 0)
          .map(([idKey, monto]) => ({
            idMetodoPago: parseInt(idKey),
            monto: Number(monto),
            referencia: pagosMultimetodo[`referencia_${idKey}`] || null
          })),
        notas: notas || null
      };

      await creditosApi.agregarAbono(credito.idCredito, payload);
      
      Swal.fire({
        icon: 'success',
        title: '¡Abono Exitoso!',
        text: `Se han registrado pagos por un total de ${formatearPrecio(totalAbono)}`,
        confirmButtonColor: '#4F46E5',
        customClass: {
          popup: 'rounded-[2rem]',
          confirmButton: 'rounded-xl font-black px-8 py-3'
        }
      });

      onClose();
      if (onAbonoRegistrado) onAbonoRegistrado();
    } catch (error) {
      console.error('Error registrando abono', error);
      Swal.fire('Error', error.mensaje || 'No se pudo registrar el abono', 'error');
    } finally {
      setProcesando(false);
    }
  };

  const formatearPrecio = (valor) => {
    return Number(valor).toLocaleString('es-CO', { 
      style: 'currency', 
      currency: 'COP', 
      minimumFractionDigits: 0 
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-white/20 animate-in zoom-in-95 duration-500">
        
        {/* Header Premium */}
        <div className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-blue-600 p-8 text-white relative overflow-hidden">
           {/* Decoración fondo */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse" />
           <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/10 rounded-full -ml-20 -mb-20 blur-2xl" />

           <div className="relative z-10 flex justify-between items-center">
              <div className="flex items-center gap-5">
                 <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-xl border border-white/30">
                    <FiActivity className="h-8 w-8 text-white" />
                 </div>
                 <div>
                    <h2 className="text-2xl font-black tracking-tight leading-none mb-1">Registrar Abono</h2>
                    <p className="text-white/70 font-bold uppercase text-[10px] tracking-[0.2em]">Expediente de Crédito #{credito.idCredito}</p>
                 </div>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl transition-all">
                <FiX className="h-7 w-7" />
              </button>
           </div>
        </div>

        {/* Resumen de Estado */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-gray-800 bg-gray-50/50 dark:bg-gray-800/20 border-b border-gray-100 dark:border-gray-800">
           <div className="p-6 flex flex-col items-center">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Deuda Pendiente</span>
              <p className="text-xl font-black text-rose-500">{formatearPrecio(credito.saldoPendiente)}</p>
           </div>
           <div className="p-6 flex flex-col items-center bg-indigo-50/30 dark:bg-indigo-900/5">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Total a Abonar</span>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{formatearPrecio(totalAbono)}</p>
           </div>
           <div className="p-6 flex flex-col items-center">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Nuevo Saldo</span>
              <p className={`text-xl font-black ${saldoRestante <= 0 ? 'text-emerald-500' : 'text-gray-700 dark:text-gray-200'}`}>
                {formatearPrecio(Math.max(0, saldoRestante))}
              </p>
           </div>
        </div>

        {/* Cuerpo del Formulario */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
           
           {/* Selector de Métodos de Pago */}
           <section>
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                 <FiPlus className="text-indigo-500" /> Selecciona Formas de Pago
              </h3>
              <div className="flex flex-wrap gap-3">
                 {metodosPago
                   .filter(m => m.activo && !m.nombreMetodo.toLowerCase().includes('crédito tienda')) // Excluir crédito tienda como abono directo
                   .map(metodo => {
                    const idKey = metodo.idMetodoPago.toString();
                    const activo = pagosMultimetodo[idKey] !== undefined;
                    return (
                       <button
                          key={idKey}
                          onClick={() => toggleMetodo(metodo)}
                          className={`px-5 py-3 rounded-2xl border-2 font-black text-[11px] uppercase tracking-wider transition-all duration-300 flex items-center gap-3 ${
                             activo 
                             ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/30 -translate-y-1' 
                             : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-400 hover:border-indigo-200 hover:text-indigo-500 shadow-sm'
                          }`}
                       >
                          <FiCreditCard className={activo ? 'text-white' : 'text-gray-300'} />
                          {metodo.nombreMetodo}
                          {activo && <FiCheckCircle className="ml-1" />}
                       </button>
                    );
                 })}
              </div>
           </section>

           {/* Lista de Pagos Activos */}
           <section className="space-y-4">
              {Object.keys(pagosMultimetodo).filter(k => !k.includes('referencia')).length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.keys(pagosMultimetodo).filter(k => !k.includes('referencia')).map(idKey => {
                       const metodo = metodosPago.find(m => m.idMetodoPago.toString() === idKey);
                       if (!metodo) return null;
                       return (
                          <div 
                             key={idKey} 
                             className="bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:border-indigo-100 dark:hover:border-indigo-900/30 transition-all group animate-in slide-in-from-bottom-2"
                          >
                             <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">{metodo.nombreMetodo}</span>
                                <div className="flex items-center gap-2">
                                   <button 
                                      onClick={() => {
                                        const totalOtros = Object.entries(pagosMultimetodo)
                                          .filter(([k]) => k !== idKey && !k.includes('referencia'))
                                          .reduce((acc, [_, v]) => acc + (Number(v) || 0), 0);
                                        updateMonto(idKey, Math.max(0, Number(credito.saldoPendiente) - totalOtros));
                                      }}
                                      className="text-[9px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-lg hover:bg-indigo-100 transition-colors uppercase"
                                   >
                                      Saldar
                                   </button>
                                   <button onClick={() => toggleMetodo(metodo)} className="p-1.5 text-gray-300 hover:text-rose-500 transition-colors">
                                      <FiTrash2 className="h-4 w-4" />
                                   </button>
                                </div>
                             </div>

                             <div className="relative mb-3">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                   <span className="text-gray-400 font-black text-lg">$</span>
                                </div>
                                <input 
                                   type="number"
                                   value={pagosMultimetodo[idKey] || ''}
                                   onChange={(e) => updateMonto(idKey, e.target.value)}
                                   className="w-full bg-gray-50 dark:bg-gray-900/50 border-none rounded-2xl py-4 pl-10 pr-4 text-xl font-black text-gray-800 dark:text-white focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-gray-300"
                                   placeholder="0.00"
                                   autoFocus
                                />
                             </div>

                             <input 
                                type="text"
                                value={pagosMultimetodo[`referencia_${idKey}`] || ''}
                                onChange={(e) => updateReferencia(idKey, e.target.value)}
                                className="w-full bg-gray-50/50 dark:bg-gray-900/30 border-none rounded-xl py-3 px-4 text-xs font-bold text-gray-500 placeholder:text-gray-300"
                                placeholder={`Referencia ${metodo.nombreMetodo}...`}
                             />
                          </div>
                       );
                    })}
                 </div>
              ) : (
                 <div className="py-16 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/30 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
                    <div className="h-16 w-16 bg-white dark:bg-gray-800 rounded-3xl shadow-sm flex items-center justify-center text-gray-300 mb-4">
                       <FiCreditCard className="h-8 w-8" />
                    </div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Diligencia las formas de pago</p>
                 </div>
              )}
           </section>

           {/* Notas y Extras */}
           <section className="bg-gray-50/50 dark:bg-gray-800/20 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                 Observaciones Adicionales
              </h3>
              <textarea 
                 value={notas}
                 onChange={(e) => setNotas(e.target.value)}
                 rows="2"
                 className="w-full bg-white dark:bg-gray-900 border-none rounded-2xl p-4 text-sm font-medium text-gray-600 dark:text-gray-300 focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none shadow-sm"
                 placeholder="Escribe aquí cualquier detalle extra sobre este abono..."
              />
           </section>

        </div>

        {/* Footer con Acciones */}
        <div className="p-8 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex gap-4">
           <button
              onClick={onClose}
              className="flex-1 px-8 py-5 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-black rounded-3xl hover:bg-gray-100 transition-all uppercase text-xs tracking-widest"
           >
              Cancelar
           </button>
           <button
              onClick={handleSubmit}
              disabled={procesando || totalAbono <= 0}
              className="flex-[2] px-8 py-5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black rounded-3xl shadow-xl shadow-indigo-500/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3 uppercase text-xs tracking-widest"
           >
              {procesando ? (
                 <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                 <>
                    <FiCheckCircle className="h-5 w-5" />
                    Finalizar Abono
                 </>
              )}
           </button>
        </div>

      </div>
    </div>
  );
};

export default ModalRegistrarAbono;
