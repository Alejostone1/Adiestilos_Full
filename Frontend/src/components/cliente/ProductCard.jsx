import React from 'react';
import { useCarrito } from '../../context/CarritoContext';
import { Link } from 'react-router-dom';

const ProductCard = ({ producto }) => {
  const { agregarAlCarrito } = useCarrito();

  const handleAdd = () => {
    const variante = producto.variantes && producto.variantes[0];
    if (!variante) return alert('Sin variantes');

    agregarAlCarrito({
      idVariante: variante.idVariante,
      idProducto: producto.idProducto,
      nombreProducto: producto.nombreProducto,
      precio: parseFloat(variante.precioVenta || variante.precioVenta || 0),
      imagen: producto.imagenes?.[0]?.rutaImagen || '',
      cantidad: 1,
      stockDisponible: variante.cantidadStock || 0,
      codigoSku: variante.codigoSku,
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-2 rounded shadow-sm flex flex-col">
      <Link to={`/producto/${producto.idProducto}`} className="block h-36 bg-gray-100 dark:bg-gray-700 rounded mb-2 overflow-hidden">
        {producto.imagenes?.[0] ? (
          <img src={producto.imagenes[0].rutaImagen} alt={producto.nombreProducto} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm opacity-60">Sin imagen</div>
        )}
      </Link>

      <div className="flex-1">
        <div className="text-sm font-medium">{producto.nombreProducto}</div>
        <div className="text-xs opacity-80">${producto.precioVentaSugerido}</div>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <button onClick={handleAdd} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Agregar</button>
        <Link to={`/producto/${producto.idProducto}`} className="text-sm opacity-80">Ver</Link>
      </div>
    </div>
  );
};

export default ProductCard;
