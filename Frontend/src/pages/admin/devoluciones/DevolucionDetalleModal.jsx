import React, { useState } from 'react';
import { X, Calendar, User, Package, DollarSign, FileText, AlertCircle } from 'lucide-react';
import DevolucionEstadosBadge from './DevolucionEstadosBadge';

/**
 * Modal para mostrar el detalle completo de una devolución
 * @param {object} devolucion - Datos de la devolución a mostrar
 * @param {function} onClose - Función para cerrar el modal
 */
const DevolucionDetalleModal = ({ devolucion, onClose }) => {
  const [cargando, setCargando] = useState(false);

  // Formatear fecha
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Formatear moneda
  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(monto);
  };

  if (!devolucion) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Detalle de Devolución
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {devolucion.numeroDevolucion}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6">
          {/* Información General */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">Fecha de Devolución</span>
              </div>
              <p className="text-gray-900 font-medium">
                {formatearFecha(devolucion.fechaDevolucion)}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">Cliente</span>
              </div>
              <p className="text-gray-900 font-medium">
                {devolucion.usuarioCliente?.nombres} {devolucion.usuarioCliente?.apellidos}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium">Venta Referencia</span>
              </div>
              <p className="text-gray-900 font-medium">
                {devolucion.venta?.numeroFactura}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Package className="w-4 h-4" />
                <span className="text-sm font-medium">Tipo de Devolución</span>
              </div>
              <span className={`px-3 py-1 text-sm rounded-full font-medium ${
                devolucion.tipoDevolucion === 'total' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-orange-100 text-orange-800'
              }`}>
                {devolucion.tipoDevolucion === 'total' ? 'Total' : 'Parcial'}
              </span>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Estado</span>
              </div>
              <DevolucionEstadosBadge estado={devolucion.estado} />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">Registrado por</span>
              </div>
              <p className="text-gray-900 font-medium">
                {devolucion.usuarioRegistroRef?.nombres} {devolucion.usuarioRegistroRef?.apellidos}
              </p>
            </div>
          </div>

          {/* Motivo y Observaciones */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Motivo de Devolución</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-gray-800">{devolucion.motivo}</p>
              </div>
            </div>

            {devolucion.observaciones && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Observaciones</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-gray-800">{devolucion.observaciones}</p>
                </div>
              </div>
            )}
          </div>

          {/* Detalles de Productos Devueltos */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Productos Devueltos</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Variante
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio Unit.
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {devolucion.detalleDevoluciones?.map((detalle, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {detalle.variante?.producto?.nombreProducto}
                          </p>
                          <p className="text-xs text-gray-500">
                            {detalle.variante?.producto?.codigoReferencia}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">
                          {detalle.variante?.color?.nombreColor && (
                            <span className="mr-2">
                              Color: {detalle.variante.color.nombreColor}
                            </span>
                          )}
                          {detalle.variante?.talla?.nombreTalla && (
                            <span>
                              Talla: {detalle.variante.talla.nombreTalla}
                            </span>
                          )}
                          {!detalle.variante?.color?.nombreColor && !detalle.variante?.talla?.nombreTalla && (
                            <span className="text-gray-500">Estándar</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          SKU: {detalle.variante?.codigoSku}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-sm font-medium text-gray-900">
                          {detalle.cantidadDevuelta}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-sm text-gray-900">
                          {formatearMoneda(detalle.precioUnitario)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-sm font-medium text-gray-900">
                          {formatearMoneda(detalle.subtotal)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Resumen Financiero */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen Financiero</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium text-gray-900">
                  {formatearMoneda(devolucion.subtotalDevolucion)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Impuestos:</span>
                <span className="font-medium text-gray-900">
                  {formatearMoneda(devolucion.impuestosDevolucion || 0)}
                </span>
              </div>
              <div className="border-t border-gray-300 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total Devolución:</span>
                  <span className="text-lg font-bold text-blue-600">
                    {formatearMoneda(devolucion.totalDevolucion)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DevolucionDetalleModal;
