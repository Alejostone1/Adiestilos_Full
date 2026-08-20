import React, { useEffect, useState } from 'react';
import publicApi from '../../../api/publicApi';
import ClienteProductCard from '../cards/ClienteProductCard';

const ProductosCarrusel = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        const response = await publicApi.obtenerProductosDestacados(8);
        const lista = Array.isArray(response?.datos)
          ? response.datos
          : Array.isArray(response)
            ? response
            : [];
        setProductos(lista);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-64 animate-pulse rounded-2xl bg-gray-100" />
        ))}
      </div>
    );
  }

  if (productos.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-600">
        No hay productos disponibles.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 md:gap-6">
      {productos.map((producto) => (
        <ClienteProductCard key={producto.idProducto} producto={producto} />
      ))}
    </div>
  );
};

export default ProductosCarrusel;
