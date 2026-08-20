import React, { useState, useEffect } from 'react';
import { usuariosApi } from '../../../api/usuariosApi';
import { 
  FiUser, FiSearch, FiCheck, FiChevronDown, FiMail, 
  FiFileText, FiPhone, FiMapPin, FiX 
} from 'react-icons/fi';

const SelectorCliente = ({ seleccionado, alSeleccionar }) => {
  const [consulta, setConsulta] = useState('');
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mostrarOpciones, setMostrarOpciones] = useState(false);

  useEffect(() => {
    const cargarClientes = async () => {
      setCargando(true);
      try {
        const resultado = await usuariosApi.getUsuarios({ idRol: 2 }); 
        const lista = resultado.datos || resultado || [];
        setClientes(Array.isArray(lista) ? lista : []);
      } catch (error) {
        console.error("Error al cargar clientes", error);
      } finally {
        setCargando(false);
      }
    };
    cargarClientes();
  }, []);

  const clientesFiltrados = clientes.filter((cliente) => {
    const term = consulta.toLowerCase();
    const nombres = `${cliente.nombres} ${cliente.apellidos}`.toLowerCase();
    const documento = (cliente.usuario || '').toLowerCase();
    const correo = (cliente.correoElectronico || '').toLowerCase();
    return nombres.includes(term) || documento.includes(term) || correo.includes(term);
  });

  const handleSeleccionar = (cliente) => {
    alSeleccionar(cliente);
    setMostrarOpciones(false);
    setConsulta('');
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
            <FiUser className="h-5 w-5" />
          </div>
          Información del Cliente
        </h3>
        <p className="text-xs text-gray-500 font-medium ml-10">Busca y selecciona el cliente para esta venta</p>
      </div>

      <div className="relative">
        <div className="relative w-full group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FiSearch className={`h-5 w-5 transition-colors ${mostrarOpciones ? 'text-indigo-500' : 'text-gray-400'}`} />
          </div>
          <input
            type="text"
            className="w-full bg-white dark:bg-gray-800 border-2 border-transparent ring-1 ring-gray-100 dark:ring-gray-700/50 rounded-[1.5rem] py-4 pl-12 pr-12 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm font-medium"
            placeholder="Buscar por nombre, documento o correo comercial..."
            value={consulta}
            onChange={(e) => {
              setConsulta(e.target.value);
              if (!mostrarOpciones) setMostrarOpciones(true);
            }}
            onFocus={() => setMostrarOpciones(true)}
          />
          {consulta && (
            <button
              onClick={() => setConsulta('')}
              className="absolute inset-y-0 right-12 flex items-center pr-3 text-gray-400 hover:text-gray-600"
            >
              <FiX className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-4 border-l border-gray-100 dark:border-gray-700 ml-2"
            onClick={() => setMostrarOpciones(!mostrarOpciones)}
          >
            <FiChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${mostrarOpciones ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {mostrarOpciones && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setMostrarOpciones(false)}
            />
            <div className="absolute mt-3 max-h-80 w-full overflow-hidden rounded-[2rem] bg-white dark:bg-gray-800 shadow-2xl ring-1 ring-black/5 z-20 border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="overflow-auto max-h-80 custom-scrollbar py-2">
                {cargando ? (
                  <div className="py-12 text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Sincronizando Clientes</p>
                  </div>
                ) : clientesFiltrados.length === 0 ? (
                  <div className="py-10 text-center">
                    <div className="h-16 w-16 bg-gray-50 dark:bg-gray-700/30 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FiSearch className="h-8 w-8 text-gray-300" />
                    </div>
                    <p className="text-sm font-semibold text-gray-500">No hay coincidencias</p>
                    <p className="text-[11px] text-gray-400 mt-1">Intenta con otro término de búsqueda</p>
                  </div>
                ) : (
                  clientesFiltrados.map((cliente) => (
                    <div
                      key={cliente.idUsuario}
                      className={`relative cursor-pointer select-none py-4 px-6 mx-2 my-1 rounded-2xl transition-all duration-200 group ${
                        seleccionado?.idUsuario === cliente.idUsuario
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                      }`}
                      onClick={() => handleSeleccionar(cliente)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`h-11 w-11 rounded-xl flex items-center justify-center text-lg font-semibold shadow-sm ${
                          seleccionado?.idUsuario === cliente.idUsuario
                            ? 'bg-white/20 text-white'
                            : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600'
                        }`}>
                          {cliente.nombres[0]}{cliente.apellidos[0]}
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="block truncate font-semibold text-sm">
                            {cliente.nombres} {cliente.apellidos}
                          </span>
                          <div className={`flex items-center gap-4 mt-0.5 text-[11px] font-semibold uppercase tracking-wider ${
                             seleccionado?.idUsuario === cliente.idUsuario ? 'text-indigo-100' : 'text-gray-400'
                          }`}>
                            <span className="flex items-center gap-1">
                              <FiFileText className="h-3 w-3" />
                              {cliente.usuario || 'N/A'}
                            </span>
                            <span className="flex items-center gap-1 truncate">
                              <FiMail className="h-3 w-3" />
                              {cliente.correoElectronico}
                            </span>
                          </div>
                        </div>
                        {seleccionado?.idUsuario === cliente.idUsuario && (
                          <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center text-indigo-600">
                            <FiCheck className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {seleccionado && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 dark:from-indigo-600 dark:to-indigo-800 rounded-[2rem] p-6 text-white shadow-xl shadow-indigo-200 dark:shadow-none relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 h-40 w-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
            <div className="absolute -left-10 -bottom-10 h-32 w-32 bg-indigo-400/20 rounded-full blur-2xl" />
            
            <div className="relative flex flex-col md:flex-row items-center gap-6">
              <div className="h-20 w-20 rounded-[1.5rem] bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-semibold border border-white/30 shadow-inner">
                {seleccionado.nombres[0]}{seleccionado.apellidos[0]}
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h4 className="text-2xl font-semibold tracking-tight">{seleccionado.nombres} {seleccionado.apellidos}</h4>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3">
                  <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-white/10">
                    <FiFileText className="h-4 w-4 text-indigo-200" />
                    <span className="text-xs font-semibold uppercase tracking-wide">{seleccionado.usuario || 'ID: NO REGISTRADO'}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-white/10">
                    <FiMail className="h-4 w-4 text-indigo-200" />
                    <span className="text-xs font-semibold">{seleccionado.correoElectronico}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
                <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/10">
                  <p className="text-[11px] font-semibold uppercase text-indigo-200 mb-1">Teléfono</p>
                  <div className="flex items-center gap-2">
                    <FiPhone className="h-3 w-3" />
                    <span className="text-xs font-semibold">{seleccionado.telefono || 'Sin registro'}</span>
                  </div>
                </div>
                <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/10">
                  <p className="text-[11px] font-semibold uppercase text-indigo-200 mb-1">Ubicación</p>
                  <div className="flex items-center gap-2">
                    <FiMapPin className="h-3 w-3" />
                    <span className="text-xs font-semibold truncate max-w-[100px]">{seleccionado.direccion || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center relative">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[11px] font-semibold uppercase tracking-wide text-indigo-100">Cliente Verificado y Activo</span>
              </div>
              <button 
                onClick={() => alSeleccionar(null)}
                className="text-[11px] font-semibold uppercase tracking-wide bg-white text-indigo-600 px-4 py-2 rounded-xl shadow-lg hover:bg-gray-100 transition-colors"
              >
                Cambiar Cliente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectorCliente;
