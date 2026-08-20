import React from 'react';
import { message } from 'antd';
import { ShoppingCartOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useCarrito } from '../../../context/CarritoContext';
import { getFileUrl } from '../../../utils/fileUtils';

const fallbackImage =
  'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=480&h=640&fit=crop';

const formatMoney = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const ClienteProductCard = ({ producto }) => {
  const navigate = useNavigate();
  const { agregarAlCarrito } = useCarrito();

  if (!producto) return null;

  const variantes = Array.isArray(producto.variantes) ? producto.variantes : [];
  const varianteDefecto = variantes[0] || null;

  const idProducto = producto.idProducto;
  const nombre = producto.nombreProducto || 'Producto';
  const descripcion = producto.descripcion || '';
  const precioBase = Number(producto.precioVentaSugerido) || 0;
  const precioVariante = Number(varianteDefecto?.precioVenta) || 0;
  const precio = precioVariante || precioBase;
  const stockDisponible = Number(varianteDefecto?.cantidadStock) || 0;

  const imagenRelativa =
    producto.imagenPrincipal || // Check for a direct main image path
    producto.rutaImagen || // Check for another possible direct path
    producto.imagenes?.find((img) => img.esPrincipal)?.rutaImagen ||
    producto.imagenes?.[0]?.rutaImagen;

  const imagenPrincipal = getFileUrl(imagenRelativa) || fallbackImage;

  const handleVerDetalles = () => {
    if (!idProducto) {
      message.warning('Producto no disponible');
      return;
    }
    navigate(`/cliente/producto/${idProducto}`);
  };

  const handleAgregarAlCarrito = () => {
    if (!varianteDefecto?.idVariante) {
      message.warning('Este producto no tiene variantes disponibles');
      return;
    }

    if (stockDisponible <= 0) {
      message.warning('Sin stock disponible');
      return;
    }

    agregarAlCarrito({
      idVariante: varianteDefecto.idVariante,
      idProducto,
      nombreProducto: nombre,
      color: varianteDefecto.color?.nombreColor || null,
      colorHex: varianteDefecto.color?.codigoHex || null,
      talla: varianteDefecto.talla?.nombreTalla || null,
      nombreColor: varianteDefecto.color?.nombreColor || null,
      nombreTalla: varianteDefecto.talla?.nombreTalla || null,
      precio,
      precioVenta: precio,
      imagen: imagenPrincipal,
      cantidad: 1,
      stockDisponible,
      codigoSku: varianteDefecto.codigoSku || null,
    });

    message.success('Producto agregado al carrito');
  };

  return (
    <article className="group overflow-hidden rounded-2xl bg-white shadow-sm">
      <button
        type="button"
        onClick={handleVerDetalles}
        className="relative block h-48 w-full overflow-hidden md:h-56"
      >
        <img
          src={imagenPrincipal}
          alt={nombre}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          onError={(event) => {
            event.currentTarget.src = fallbackImage;
          }}
        />
        {precioBase > precio && (
          <span className="absolute left-3 top-3 rounded-lg bg-red-500 px-2 py-1 text-xs font-semibold text-white">
            Oferta
          </span>
        )}
      </button>

      <div className="space-y-3 p-4">
        <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 md:text-base">{nombre}</h3>
        {descripcion ? (
          <p className="line-clamp-2 text-xs text-gray-600 md:text-sm">{descripcion}</p>
        ) : null}

        <div className="flex items-end gap-2">
          <p className="text-base font-semibold text-gray-900 md:text-lg">{formatMoney(precio)}</p>
          {precioBase > precio ? (
            <p className="text-xs text-gray-400 line-through md:text-sm">{formatMoney(precioBase)}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleVerDetalles}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 md:h-10"
          >
            <EyeOutlined />
            Ver detalles
          </button>
          <button
            type="button"
            onClick={handleAgregarAlCarrito}
            disabled={stockDisponible <= 0}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gray-900 px-3 text-sm font-medium text-white shadow-sm transition hover:bg-black disabled:cursor-not-allowed disabled:bg-gray-300 md:h-10"
          >
            <ShoppingCartOutlined />
            Agregar
          </button>
        </div>
      </div>
    </article>
  );
};

export default ClienteProductCard;
