import React from 'react';

const ResumenCompra = ({ subtotal, impuestos, total, alConfirmar, procesando, valido }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Resumen de Compra</h3>
      
      <dl className="space-y-3 dark:text-gray-300">
        <div className="flex justify-between">
          <dt className="text-sm text-gray-500 dark:text-gray-400">Subtotal</dt>
          <dd className="text-sm font-medium text-gray-900 dark:text-white">${subtotal.toFixed(2)}</dd>
        </div>
        
        {/* Aquí se podrían agregar inputs para impuestos si fueran variables, o solo visualización */}
        {/* <div className="flex justify-between">
          <dt className="text-sm text-gray-500">Impuestos</dt>
          <dd className="text-sm font-medium text-gray-900">${impuestos.toFixed(2)}</dd>
        </div> */}

        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between">
          <dt className="text-base font-medium text-gray-900 dark:text-white">Total</dt>
          <dd className="text-base font-medium text-indigo-600 dark:text-indigo-400">${total.toFixed(2)}</dd>
        </div>
      </dl>

      <div className="mt-6">
        <button
          onClick={alConfirmar}
          disabled={!valido || procesando}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
            ${valido && !procesando 
              ? 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500' 
              : 'bg-indigo-300 cursor-not-allowed'}`}
        >
          {procesando ? 'Procesando...' : 'Confirmar Compra'}
        </button>
      </div>
    </div>
  );
};

export default ResumenCompra;
