import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { proveedoresApi } from '../../../api/proveedoresApi';

const WizardStep2 = ({ formData, onUpdateFormData }) => {
  const [proveedores, setProveedores] = useState([]);
  const [loadingProveedores, setLoadingProveedores] = useState(false);
  const [searchProveedor, setSearchProveedor] = useState('');

  useEffect(() => {
    const fetchProveedores = async () => {
      try {
        setLoadingProveedores(true);
        const response = await proveedoresApi.listarProveedores();
        const proveedoresArray = response.datos || response.data || response || [];
        setProveedores(Array.isArray(proveedoresArray) ? proveedoresArray : []);
      } catch (error) {
        console.error('Error al cargar proveedores:', error);
        setProveedores([]);
      } finally {
        setLoadingProveedores(false);
      }
    };

    fetchProveedores();
  }, []);

  const proveedoresFiltrados = proveedores.filter(prov =>
    prov.nombreProveedor?.toLowerCase().includes(searchProveedor.toLowerCase())
  );

  const proveedorSeleccionado = proveedores.find(prov => prov.idProveedor === parseInt(formData.idProveedor));

  const unidadesMedida = ['unidades', 'metros', 'kilogramos', 'litros', 'docenas', 'pares', 'sets'];

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
        <div className="text-blue-600 dark:text-blue-400 text-sm">
          ℹ️ Completa la descripción y selecciona un proveedor (opcional). Elige la unidad de medida correcta.
        </div>
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Descripción *
        </label>
        <textarea
          value={formData.descripcion}
          onChange={(e) => onUpdateFormData({ descripcion: e.target.value })}
          placeholder="Describe los detalles del producto, características especiales, material, etc..."
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {formData.descripcion.length}/500 caracteres
        </p>
      </div>

      {/* Proveedor */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Proveedor (Opcional)
        </label>
        <div className="relative">
          {/* Search Input */}
          <div className="relative mb-2">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchProveedor}
              onChange={(e) => setSearchProveedor(e.target.value)}
              placeholder="Buscar proveedor..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
            />
          </div>

          {/* Proveedor Seleccionado */}
          {formData.idProveedor && (
            <div className="mb-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm font-medium text-green-900 dark:text-green-300">
                ✓ {proveedorSeleccionado?.nombreProveedor}
              </p>
            </div>
          )}

          {/* Lista de Proveedores */}
          {loadingProveedores ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              Cargando proveedores...
            </div>
          ) : proveedoresFiltrados.length > 0 ? (
            <div className="max-h-64 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
              <button
                onClick={() => {
                  onUpdateFormData({ idProveedor: '' });
                  setSearchProveedor('');
                }}
                className={`
                  w-full text-left px-4 py-3 border-b border-gray-200 dark:border-gray-700
                  transition-colors hover:bg-gray-50 dark:hover:bg-gray-700
                  text-gray-900 dark:text-white
                `}
              >
                <span>Sin Proveedor</span>
              </button>
              {proveedoresFiltrados.map((proveedor) => (
                <button
                  key={proveedor.idProveedor}
                  onClick={() => {
                    onUpdateFormData({ idProveedor: proveedor.idProveedor });
                    setSearchProveedor('');
                  }}
                  className={`
                    w-full text-left px-4 py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0
                    transition-colors hover:bg-gray-50 dark:hover:bg-gray-700
                    ${formData.idProveedor === proveedor.idProveedor
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                      : 'text-gray-900 dark:text-white'
                    }
                  `}
                >
                  <span className="flex items-center justify-between">
                    <span>{proveedor.nombreProveedor}</span>
                    {formData.idProveedor === proveedor.idProveedor && (
                      <span className="text-green-500">✓</span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg">
              No se encontraron proveedores
            </div>
          )}
        </div>
      </div>

      {/* Unidad de Medida */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Unidad de Medida *
        </label>
        <div className="grid grid-cols-2 gap-2">
          {unidadesMedida.map((unidad) => (
            <button
              key={unidad}
              onClick={() => onUpdateFormData({ unidadMedida: unidad })}
              className={`
                px-4 py-2.5 rounded-lg font-medium transition-all border-2
                ${formData.unidadMedida === unidad
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-blue-400'
                }
              `}
            >
              {unidad.charAt(0).toUpperCase() + unidad.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Variantes */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">Variantes de Producto</h3>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => onUpdateFormData({ tieneColores: !formData.tieneColores })}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all border-2
              ${formData.tieneColores
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-blue-400'
              }
            `}
          >
            {formData.tieneColores ? '✓' : '◯'} Tiene Colores
          </button>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {formData.tieneColores ? 'Este producto tiene diferentes colores' : 'Marcar si el producto tiene variantes por color'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onUpdateFormData({ tieneTallas: !formData.tieneTallas })}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all border-2
              ${formData.tieneTallas
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-blue-400'
              }
            `}
          >
            {formData.tieneTallas ? '✓' : '◯'} Tiene Tallas
          </button>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {formData.tieneTallas ? 'Este producto tiene diferentes tallas' : 'Marcar si el producto tiene variantes por talla'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WizardStep2;
