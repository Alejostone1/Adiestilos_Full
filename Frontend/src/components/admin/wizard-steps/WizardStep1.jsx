import React, { useState, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { categoriasApi } from '../../../api/categoriasApi';

const WizardStep1 = ({ formData, onUpdateFormData }) => {
  const [categorias, setCategorias] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(false);
  const [searchCategoria, setSearchCategoria] = useState('');

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        setLoadingCategorias(true);
        const response = await categoriasApi.obtenerTodasLasCategorias();
        const categoriasArray = response.datos || response.data || response || [];
        setCategorias(Array.isArray(categoriasArray) ? categoriasArray : []);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
        setCategorias([]);
      } finally {
        setLoadingCategorias(false);
      }
    };

    fetchCategorias();
  }, []);

  const categoriasFiltradas = categorias.filter(cat =>
    cat.nombreCategoria?.toLowerCase().includes(searchCategoria.toLowerCase())
  );

  const categoriaSeleccionada = categorias.find(cat => cat.idCategoria === parseInt(formData.idCategoria));

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
        <div className="text-blue-600 dark:text-blue-400 text-sm">
          ℹ️ Ingresa los datos básicos de tu producto. Asegúrate de que el código de referencia sea único.
        </div>
      </div>

      {/* Nombre del Producto */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Nombre del Producto *
        </label>
        <input
          type="text"
          value={formData.nombreProducto}
          onChange={(e) => onUpdateFormData({ nombreProducto: e.target.value })}
          placeholder="Ej: Camiseta Estampada Blanca"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Código de Referencia */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Código de Referencia *
        </label>
        <input
          type="text"
          value={formData.codigoReferencia}
          onChange={(e) => onUpdateFormData({ codigoReferencia: e.target.value.toUpperCase() })}
          placeholder="Ej: CAMISETA-BL-001"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all uppercase"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Este código debe ser único en el sistema
        </p>
      </div>

      {/* Categoría */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Categoría *
        </label>
        <div className="relative">
          {/* Search Input */}
          <div className="relative mb-2">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchCategoria}
              onChange={(e) => setSearchCategoria(e.target.value)}
              placeholder="Buscar categoría..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
            />
          </div>

          {/* Categoría Seleccionada */}
          {formData.idCategoria && (
            <div className="mb-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm font-medium text-green-900 dark:text-green-300">
                ✓ {categoriaSeleccionada?.nombreCategoria}
              </p>
            </div>
          )}

          {/* Lista de Categorías */}
          {loadingCategorias ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              Cargando categorías...
            </div>
          ) : categoriasFiltradas.length > 0 ? (
            <div className="max-h-64 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
              {categoriasFiltradas.map((categoria) => (
                <button
                  key={categoria.idCategoria}
                  onClick={() => {
                    onUpdateFormData({ idCategoria: categoria.idCategoria });
                    setSearchCategoria('');
                  }}
                  className={`
                    w-full text-left px-4 py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0
                    transition-colors hover:bg-gray-50 dark:hover:bg-gray-700
                    ${formData.idCategoria === categoria.idCategoria
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                      : 'text-gray-900 dark:text-white'
                    }
                  `}
                >
                  <span className="flex items-center justify-between">
                    <span>{categoria.nombreCategoria}</span>
                    {formData.idCategoria === categoria.idCategoria && (
                      <span className="text-green-500">✓</span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg">
              No se encontraron categorías
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WizardStep1;
