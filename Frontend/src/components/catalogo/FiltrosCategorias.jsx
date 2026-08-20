import React from 'react';

const FiltrosCategorias = ({ categorias, onSelectCategoria }) => {
  return (
    <div className="w-full bg-gray-100 p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-bold mb-4">Categorías</h3>
      <ul className="space-y-2">
        <li>
          <button
            onClick={() => onSelectCategoria(null)}
            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Todas
          </button>
        </li>
        {categorias.map((categoria) => (
          <li key={categoria.id}>
            <button
              onClick={() => onSelectCategoria(categoria.id)}
              className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {categoria.nombre}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FiltrosCategorias;
