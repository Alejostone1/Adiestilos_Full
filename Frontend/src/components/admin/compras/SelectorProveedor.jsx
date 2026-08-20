import React, { useState, useEffect } from 'react';
import { proveedoresApi } from '../../../api/proveedoresApi';
import { FiChevronDown, FiCheck } from 'react-icons/fi';

const SelectorProveedor = ({ seleccionado, alSeleccionar }) => {
  const [consulta, setConsulta] = useState('');
  const [proveedores, setProveedores] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mostrarOpciones, setMostrarOpciones] = useState(false);

  useEffect(() => {
    const cargarProveedores = async () => {
      setCargando(true);
      try {
        const resultado = await proveedoresApi.listarProveedores(); 
        const lista = resultado.datos || resultado || [];
        setProveedores(lista);
      } catch (error) {
        console.error("Error al cargar proveedores", error);
      } finally {
        setCargando(false);
      }
    };
    cargarProveedores();
  }, []);

  const proveedoresFiltrados =
    consulta === ''
      ? proveedores
      : proveedores.filter((proveedor) => {
          return proveedor.nombreProveedor.toLowerCase().includes(consulta.toLowerCase()) ||
                 proveedor.nitCC.toLowerCase().includes(consulta.toLowerCase());
        });

  const handleSeleccionar = (proveedor) => {
    alSeleccionar(proveedor);
    setMostrarOpciones(false);
    setConsulta('');
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
        Proveedor
      </label>
      <div className="relative">
        <div className="relative w-full">
          <input
            type="text"
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 pl-3 pr-10"
            placeholder="Buscar proveedor..."
            value={mostrarOpciones ? consulta : (seleccionado?.nombreProveedor || '')}
            onChange={(e) => {
              setConsulta(e.target.value);
              setMostrarOpciones(true);
            }}
            onFocus={() => setMostrarOpciones(true)}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-2"
            onClick={() => setMostrarOpciones(!mostrarOpciones)}
          >
            <FiChevronDown className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {mostrarOpciones && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setMostrarOpciones(false)}
            />
            <div className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-20">
              {proveedoresFiltrados.length === 0 && consulta !== '' ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700 dark:text-gray-200">
                  No se encontraron proveedores.
                </div>
              ) : (
                proveedoresFiltrados.map((proveedor) => (
                  <div
                    key={proveedor.idProveedor}
                    className={`relative cursor-pointer select-none py-2 pl-10 pr-4 hover:bg-indigo-600 hover:text-white ${
                      seleccionado?.idProveedor === proveedor.idProveedor
                        ? 'bg-indigo-50 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-100'
                        : 'text-gray-900 dark:text-gray-100'
                    }`}
                    onClick={() => handleSeleccionar(proveedor)}
                  >
                    <span className={`block truncate ${
                      seleccionado?.idProveedor === proveedor.idProveedor ? 'font-medium' : 'font-normal'
                    }`}>
                      {proveedor.nombreProveedor}
                    </span>
                    {seleccionado?.idProveedor === proveedor.idProveedor && (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600 dark:text-indigo-400">
                        <FiCheck className="h-5 w-5" />
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SelectorProveedor;
