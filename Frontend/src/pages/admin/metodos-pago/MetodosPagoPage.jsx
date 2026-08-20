import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Info,
  Layers,
  Search,
  RefreshCcw,
  ShieldCheck,
  Settings2,
  AlertCircle
} from 'lucide-react';
import { metodosPagoApi } from '../../../api/metodosPagoApi';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';

const MetodosPagoPage = () => {
  const [metodos, setMetodos] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMetodo, setEditingMetodo] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  
  const [formData, setFormData] = useState({
    nombreMetodo: '',
    descripcion: '',
    idTipoMetodo: '',
    requiereReferencia: false
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [resMetodos, resTipos] = await Promise.all([
        metodosPagoApi.obtenerTodos(),
        metodosPagoApi.obtenerTipos()
      ]);
      setMetodos(resMetodos.datos || []);
      setTipos(resTipos.datos || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      Swal.fire('Error', 'No se pudieron cargar los métodos de pago', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (metodo = null) => {
    if (metodo) {
      setEditingMetodo(metodo);
      setFormData({
        nombreMetodo: metodo.nombreMetodo,
        descripcion: metodo.descripcion || '',
        idTipoMetodo: metodo.idTipoMetodo,
        requiereReferencia: metodo.requiereReferencia
      });
    } else {
      setEditingMetodo(null);
      setFormData({
        nombreMetodo: '',
        descripcion: '',
        idTipoMetodo: '',
        requiereReferencia: false
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMetodo) {
        await metodosPagoApi.actualizar(editingMetodo.idMetodoPago, formData);
        Swal.fire({
            title: 'Actualizado',
            text: 'Método de pago actualizado correctamente',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
        });
      } else {
        await metodosPagoApi.crear(formData);
        Swal.fire({
            title: 'Creado',
            text: 'Nuevo método de pago registrado',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
        });
      }
      setShowModal(false);
      cargarDatos();
    } catch (error) {
      console.error('Error al guardar:', error);
      Swal.fire('Error', error.response?.data?.msg || 'Error al procesar la solicitud', 'error');
    }
  };

  const confirmarEliminacion = (id) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "El método de pago será desactivado del sistema.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4F46E5',
      cancelButtonColor: '#EF4444',
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar',
      borderRadius: '20px'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await metodosPagoApi.eliminar(id);
          Swal.fire('¡Desactivado!', 'El método de pago ha sido desactivado.', 'success');
          cargarDatos();
        } catch (error) {
          Swal.fire('Error', 'No se pudo desactivar el método.', 'error');
        }
      }
    });
  };

  const metodosFiltrados = metodos.filter(m => 
    m.nombreMetodo.toLowerCase().includes(busqueda.toLowerCase()) ||
    m.tipoMetodo?.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Header Premium */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-6">
          <div className="h-16 w-16 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none rotate-3 hover:rotate-0 transition-transform duration-300">
            <CreditCard className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-white tracking-tight uppercase">Pasarelas de Pago</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Configura los canales de recepción de dinero para tu negocio.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Buscar pasarela..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all text-sm font-medium"
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl flex items-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95"
          >
            <Plus className="h-5 w-5" />
            Nueva Pasarela
          </button>
        </div>
      </div>

      {/* Grid de Tarjetas de Métodos de Pago */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <RefreshCcw className="h-10 w-10 text-indigo-500 animate-spin" />
          <p className="text-slate-400 font-semibold uppercase tracking-wide text-xs">Sincronizando pasarelas...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode='popLayout'>
            {metodosFiltrados.map((metodo) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={metodo.idMetodoPago}
                className="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all border border-slate-100 dark:border-slate-800 overflow-hidden"
              >
                {/* Decoración Fondo */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors" />
                
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-4 rounded-2xl ${
                    metodo.tipoMetodo?.codigo === 'efectivo' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' :
                    metodo.tipoMetodo?.codigo === 'tarjeta_credito' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' :
                    metodo.tipoMetodo?.codigo === 'transferencia' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20' :
                    'bg-slate-50 text-slate-600 dark:bg-slate-800'
                  }`}>
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleOpenModal(metodo)}
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white border border-indigo-100 dark:border-indigo-800/60 hover:border-indigo-600 shadow-sm hover:shadow-md hover:shadow-indigo-500/20 hover:-translate-y-0.5 active:scale-95 transition-all"
                      title="Editar pasarela"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => confirmarEliminacion(metodo.idMetodoPago)}
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-100 dark:border-rose-800/60 hover:border-rose-600 shadow-sm hover:shadow-md hover:shadow-rose-500/20 hover:-translate-y-0.5 active:scale-95 transition-all"
                      title="Eliminar pasarela"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-[11px] font-semibold text-indigo-500 dark:text-indigo-400 uppercase tracking-wide mb-1 block">Pasarela</span>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white truncate uppercase">{metodo.nombreMetodo}</h3>
                  </div>

                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium line-clamp-2 min-h-[2.5rem]">
                    {metodo.descripcion || 'Sin descripción detallada.'}
                  </p>

                  <div className="pt-6 border-t border-slate-50 dark:border-slate-800 grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide block">Tipo</span>
                      <div className="flex items-center gap-2">
                        <Layers className="h-3 w-3 text-slate-400" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{metodo.tipoMetodo?.nombre}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide block">Referencia</span>
                      <div className="flex items-center gap-2">
                        {metodo.requiereReferencia ? (
                          <>
                            <ShieldCheck className="h-3 w-3 text-emerald-500" />
                            <span className="text-xs font-semibold text-emerald-600">Requerida</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-3 w-3 text-slate-400" />
                            <span className="text-xs font-semibold text-slate-400">Opcional</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {metodosFiltrados.length === 0 && !loading && (
             <div className="col-span-full py-20 text-center">
                <div className="h-20 w-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white uppercase tracking-tight">Sin resultados</h3>
                <p className="text-slate-500 mt-2">No encontramos ninguna pasarela con ese nombre.</p>
             </div>
          )}
        </div>
      )}

      {/* Modal Premium */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" 
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
            >
              <div className="p-10">
                <div className="flex justify-between items-center mb-10">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600">
                      <Settings2 className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold text-slate-900 dark:text-white uppercase leading-tight">
                        {editingMetodo ? 'Editar Pasarela' : 'Nueva Pasarela'}
                      </h2>
                      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Configuración de recepción</p>
                    </div>
                  </div>
                  <button onClick={() => setShowModal(false)} className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-2xl hover:text-red-500 transition-colors">
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.1em] ml-2">Nombre Comercial</label>
                    <input 
                      required
                      type="text"
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all font-semibold placeholder:text-slate-300"
                      placeholder="Ej. Nequi, Tarjeta Visa..."
                      value={formData.nombreMetodo}
                      onChange={(e) => setFormData({...formData, nombreMetodo: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.1em] ml-2">Tipo de Pasarela</label>
                      <select 
                        required
                        className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all font-semibold appearance-none cursor-pointer"
                        value={formData.idTipoMetodo}
                        onChange={(e) => setFormData({...formData, idTipoMetodo: e.target.value})}
                      >
                        <option value="">Seleccionar...</option>
                        {tipos.map(t => (
                          <option key={t.idTipoMetodo} value={t.idTipoMetodo}>{t.nombre}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col justify-end pb-4 pl-2">
                       <label className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="checkbox"
                            className="hidden"
                            checked={formData.requiereReferencia}
                            onChange={(e) => setFormData({...formData, requiereReferencia: e.target.checked})}
                          />
                          <div className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                            formData.requiereReferencia ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-200' : 'border-slate-200 dark:border-slate-700'
                          }`}>
                            {formData.requiereReferencia && <CheckCircle className="h-4 w-4 text-white" />}
                          </div>
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">¿Pedir Referencia?</span>
                       </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.1em] ml-2">Instrucciones / Notas</label>
                    <textarea 
                      rows="3"
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all font-semibold placeholder:text-slate-300 resize-none"
                      placeholder="Indica al vendedor qué datos pedir..."
                      value={formData.descripcion}
                      onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                    />
                  </div>

                  <div className="pt-6">
                    <button 
                      type="submit"
                      className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-3xl flex items-center justify-center gap-3 shadow-2xl shadow-indigo-500/20 transition-all active:scale-95 text-lg uppercase tracking-wide"
                    >
                      {editingMetodo ? 'Guardar Cambios' : 'Activar Pasarela'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MetodosPagoPage;
