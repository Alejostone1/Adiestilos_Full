import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ producto }) => {
  return (
    <div className="group relative border rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
      <Link to={`/producto/${producto.id}`}>
        <div className="overflow-hidden">
          <img
            src={producto.imagen_principal || 'https://via.placeholder.com/300'}
            alt={producto.nombre}
            className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>
        <div className="p-4 bg-white">
          <h3 className="text-lg font-semibold text-gray-800 truncate">{producto.nombre}</h3>
          <p className="text-sm text-gray-500">{producto.categoria.nombre}</p>
          <p className="text-xl font-bold text-gray-900 mt-2">${producto.precio_venta}</p>
        </div>
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-white text-lg font-bold border-2 border-white px-4 py-2 rounded-full">
            Ver Detalle
          </span>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
