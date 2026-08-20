import React, { useEffect, useState } from 'react';
import ProductCard from '../../components/cliente/ProductCard';
import clienteService from './clienteService';

const TiendaPage = () => {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    let mounted = true;
    clienteService.getProductos().then(res => {
      if (mounted) setProductos(res || []);
    }).catch(console.error);
    return () => { mounted = false };
  }, []);

  return (
    <div>
      <h1 className="font-semibold text-xl mb-3">Tienda</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {productos.map(p => (
          <ProductCard key={p.idProducto} producto={p} />
        ))}
      </div>
    </div>
  );
};

export default TiendaPage;
