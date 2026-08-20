import React from 'react';
import { CheckCircle2, Eye, Package, Tag, DollarSign, Image as ImageIcon } from 'lucide-react';

const WizardStep5 = ({ formData, producto }) => {
  const margenActual = parseFloat(formData.precioVenta) - parseFloat(formData.precioCompra);
  const precioCompra = parseFloat(formData.precioCompra) || 0;
  const porcentajeGanancia = precioCompra > 0 
    ? (((parseFloat(formData.precioVenta) - precioCompra) / precioCompra) * 100).toFixed(2)
    : 0;

  const getImagenPreview = () => {
    if (formData.imagenPrincipal) {
      if (formData.imagenPrincipal instanceof File) {
        return URL.createObjectURL(formData.imagenPrincipal);
      }
      return formData.imagenPrincipal;
    }
    return '/placeholder.png';
  };

  return (
    <div className="space-y-6">
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
        <div className="text-green-700 dark:text-green-300 text-sm">
          Revisa los datos antes de guardar. Asegúrate de que toda la información sea correcta.
        </div>
      </div>

      {/* Preview de Imagen */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          Imagen Principal
        </h4>

        <div className="flex gap-4">
          <img
            src={getImagenPreview()}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700"
          />

          <div className="flex-1">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {formData.imagenPrincipal
                ? formData.imagenPrincipal instanceof File
                  ? formData.imagenPrincipal.name
                  : 'Imagen actual'
                : 'Sin imagen seleccionada'}
            </p>

            {formData.imagenes && formData.imagenes.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-900 dark:text-white mb-2">
                  {formData.imagenes.length} imagen(es) adicional(es)
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {formData.imagenes.slice(0, 4).map((img, idx) => (
                    <img
                      key={idx}
                      src={
                        img instanceof File ? URL.createObjectURL(img) : typeof img === 'string' ? img : img.imagenUrl
                      }
                      alt={`Thumb ${idx}`}
                      className="w-12 h-12 object-cover rounded border border-gray-200 dark:border-gray-700"
                    />
                  ))}
                  {formData.imagenes.length > 4 && (
                    <div className="w-12 h-12 rounded border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-semibold text-gray-700 dark:text-gray-300">
                      +{formData.imagenes.length - 4}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Información Básica */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-3 border border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Package className="w-4 h-4" />
          Información Básica
        </h4>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest">
              Nombre
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
              {formData.nombreProducto}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest">
              Código
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-white mt-1 font-mono">
              {formData.codigoReferencia}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest">
            Descripción
          </p>
          <p className="text-sm text-gray-900 dark:text-white mt-1">
            {formData.descripcion}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest">
              Categoría
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
              {formData.idCategoria ? `ID: ${formData.idCategoria}` : 'No seleccionada'}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest">
              Unidad
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
              {formData.unidadMedida}
            </p>
          </div>
        </div>

        {formData.idProveedor && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest">
              Proveedor
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
              ID: {formData.idProveedor}
            </p>
          </div>
        )}
      </div>

      {/* Precios y Márgenes */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-3 border border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          Precios y Márgenes
        </h4>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 border border-orange-200 dark:border-orange-800">
            <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-widest">
              Costo
            </p>
            <p className="text-lg font-bold text-orange-700 dark:text-orange-300 mt-1">
              ${parseFloat(formData.precioCompra).toFixed(2)}
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
              Margen
            </p>
            <p className="text-lg font-bold text-blue-700 dark:text-blue-300 mt-1">
              ${margenActual.toFixed(2)}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              {porcentajeGanancia}%
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
            <p className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-widest">
              Venta
            </p>
            <p className="text-lg font-bold text-green-700 dark:text-green-300 mt-1">
              ${parseFloat(formData.precioVenta).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Ganancia por unidad
            </p>
            <span className={`
              px-3 py-1 rounded-full text-sm font-bold
              ${porcentajeGanancia >= 30
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                : porcentajeGanancia >= 15
                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
              }
            `}>
              {porcentajeGanancia}%
            </span>
          </div>
        </div>
      </div>

      {/* Acción Final */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center">
        <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">
          ✓ {producto ? 'El producto será actualizado' : 'El producto será creado'} cuando hagas clic en "Guardar"
        </p>
      </div>
    </div>
  );
};

export default WizardStep5;
