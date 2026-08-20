import React, { useState, useEffect } from 'react';
import { FiX, FiCheckCircle, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import comprasApi from '../../../api/comprasApi';
import Swal from 'sweetalert2';

const ModalCambiarEstadoCompra = ({ isOpen, onClose, compra, onEstadoActualizado }) => {
  const [estados, setEstados] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    if (isOpen) {
      cargarEstados();
    }
  }, [isOpen]);

  const cargarEstados = async () => {
    setCargando(true);
    try {
      // Intentamos cargar desde un endpoint de configuración, si falla usamos los específicos de compras
      const data = await comprasApi.obtenerEstadosPedido();
      const lista = Array.isArray(data) ? data : data.datos || [];
      // Filtramos solo los estados relevantes para compras (orden > 10 según la sugerencia del usuario)
      setEstados(lista.filter(e => e.orden >= 10 || e.idEstadoPedido === 1)); 
    } catch (error) {
      console.error('Error cargando estados:', error);
      // Fallback: estados básicos si el endpoint no existe aún
      setEstados([
        { idEstadoPedido: 1, nombreEstado: 'Pendiente', color: '#FFA500' },
        { idEstadoPedido: 8, nombreEstado: 'Recibido', color: '#8BC34A' },
        { idEstadoPedido: 9, nombreEstado: 'Pendiente de Pago', color: '#FF6F00' },
        { idEstadoPedido: 10, nombreEstado: 'Parcialmente Recibido', color: '#FFB300' },
        { idEstadoPedido: 11, nombreEstado: 'Completado', color: '#2E7D32' },
        { idEstadoPedido: 7, nombreEstado: 'Cancelado', color: '#F44336' }
      ]);
    } finally {
      setCargando(false);
    }
  };

  const handleCambiarEstado = async (idEstado) => {
    if (idEstado === compra.idEstadoPedido) {
       onClose();
       return;
    }

    setProcesando(true);
    try {
      // Si el estado es "Recibido" (idEstadoPedido: 8), llamar a recibirCompra para actualizar el inventario
      if (idEstado === 8) {
        await comprasApi.recibirCompra(compra.idCompra, {});
        Swal.fire({
          icon: 'success',
          title: 'Compra Recibida',
          text: 'La compra ha sido recibida y el inventario actualizado correctamente.',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        // Para otros estados, usar el método normal
        await comprasApi.actualizarEstado(compra.idCompra, idEstado);
        Swal.fire({
          icon: 'success',
          title: 'Estado Actualizado',
          text: 'El estado de la compra ha sido modificado correctamente.',
          timer: 2000,
          showConfirmButton: false
        });
      }
      onEstadoActualizado?.();
      onClose();
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.mensaje || 'No se pudo actualizar el estado de la compra.'
      });
    } finally {
      setProcesando(false);
    }
  };

  if (!isOpen || !compra) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-900/75 backdrop-blur-sm" onClick={onClose} />

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 flex justify-between items-center text-white">
            <div className="flex items-center space-x-3">
              <FiRefreshCw className={`h-6 w-6 ${procesando ? 'animate-spin' : ''}`} />
              <h3 className="text-xl font-bold">Cambiar Estado</h3>
            </div>
            <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
              <FiX className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6 bg-gray-50 dark:bg-gray-900">
            <p className="text-sm text-gray-500 mb-6">
              Selecciona el nuevo estado para la compra <span className="font-bold text-gray-900 dark:text-white">{compra.numeroCompra || `#${compra.idCompra}`}</span>:
            </p>

            {cargando ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {estados.map((estado) => (
                  <button
                    key={estado.idEstadoPedido}
                    onClick={() => handleCambiarEstado(estado.idEstadoPedido)}
                    disabled={procesando}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all hover:scale-102 ${
                      compra.idEstadoPedido === estado.idEstadoPedido
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-white dark:border-gray-800 bg-white dark:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: estado.color }}
                      />
                      <span className={`font-semibold ${
                        compra.idEstadoPedido === estado.idEstadoPedido
                          ? 'text-indigo-700 dark:text-indigo-400'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {estado.nombreEstado}
                      </span>
                    </div>
                    {compra.idEstadoPedido === estado.idEstadoPedido && (
                      <FiCheckCircle className="text-indigo-500 h-5 w-5" />
                    )}
                  </button>
                ))}
              </div>
            )}
            
            <div className="mt-8 p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl flex items-start space-x-3 border border-indigo-100 dark:border-indigo-800">
              <FiAlertCircle className="text-indigo-600 h-5 w-5 mt-0.5" />
              <p className="text-xs text-indigo-700 dark:text-indigo-400 italic">
                Cambiar el estado puede activar notificaciones automáticas o afectar el flujo de inventario dependiendo de la configuración.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalCambiarEstadoCompra;
