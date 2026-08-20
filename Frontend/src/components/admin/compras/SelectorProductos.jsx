import React, { useState, useEffect } from 'react';
import comprasApi from '../../../api/comprasApi';
import { FiPlus } from 'react-icons/fi';

const SelectorProductos = ({ idProveedor, alAgregarProducto }) => {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');

  useEffect(() => {
    if (idProveedor) {
      cargarProductos();
    } else {
      setProductos([]);
    }
  }, [idProveedor]);

  const cargarProductos = async () => {
    setCargando(true);
    try {
      const data = await comprasApi.obtenerProductosPorProveedor(idProveedor);
      // Ensure we handle the response structure correctly
      setProductos(Array.isArray(data) ? data : data.datos || []);
    } catch (error) {
      console.error("Error cargando productos", error);
    } finally {
      setCargando(false);
    }
  };

  const productosFiltrados = productos.filter(p => 
    p.nombreProducto.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
    p.codigoReferencia.toLowerCase().includes(terminoBusqueda.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 h-full flex flex-col">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Productos del Proveedor</h3>
      
      {/* Buscador */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar producto..."
          className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={terminoBusqueda}
          onChange={(e) => setTerminoBusqueda(e.target.value)}
          disabled={!idProveedor}
        />
      </div>

      {/* Lista de Productos */}
      <div className="flex-1 overflow-y-auto min-h-[300px]">
        {cargando ? (
          <div className="flex justify-center items-center h-full text-gray-500">Cargando productos...</div>
        ) : !idProveedor ? (
          <div className="flex justify-center items-center h-full text-gray-500">Seleccione un proveedor para ver sus productos.</div>
        ) : productosFiltrados.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-500">No se encontraron productos.</div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {productosFiltrados.map((producto) => (
              <div key={producto.idProducto} className="border dark:border-gray-700 rounded-md p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">{producto.nombreProducto}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Ref: {producto.codigoReferencia}</p>
                  </div>
                </div>
                
                {/* Variantes */}
                <div className="mt-3 space-y-2">
                  {producto.variantes && producto.variantes.length > 0 ? (
                    producto.variantes.map(variante => (
                      <div key={variante.idVariante} className="flex justify-between items-center text-sm bg-gray-100 dark:bg-gray-600 p-2 rounded">
                        <span className="text-gray-700 dark:text-gray-200">
                          {variante.color?.nombreColor || 'N/A'} - {variante.talla?.nombreTalla || 'N/A'}
                        </span>
                        <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500 dark:text-gray-300">Stock: {variante.cantidadStock}</span>
                            <button
                            onClick={() => alAgregarProducto(variante)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            title="Agregar a la compra"
                            >
                            <FiPlus className="h-4 w-4" />
                            </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-red-500">Sin variantes disponibles</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectorProductos;
