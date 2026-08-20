import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { message } from 'antd';
import { ArrowLeftOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useCarrito } from '../../context/CarritoContext';
import publicApi from '../../api/publicApi';
import ClienteProductCard from '../../components/cliente/cards/ClienteProductCard';
import { getFileUrl } from '../../utils/fileUtils';

const fallbackImage =
  'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=480&h=640&fit=crop';

const formatMoney = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const ProductoPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { agregarAlCarrito } = useCarrito();

  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [colorId, setColorId] = useState(null);
  const [tallaId, setTallaId] = useState(null);
  const [productosRelacionados, setProductosRelacionados] = useState([]);
  const [activeImage, setActiveImage] = useState('');

  useEffect(() => {
    const cargarProducto = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await publicApi.obtenerProductoDetalle(id);
        setProducto(data);

        const variantes = Array.isArray(data?.variantes) ? data.variantes : [];
        const primeraVariante = variantes[0];

        if (primeraVariante?.color?.idColor) setColorId(primeraVariante.color.idColor);
        if (primeraVariante?.talla?.idTalla) setTallaId(primeraVariante.talla.idTalla);

        const imagenPrincipalRelativa =
          data?.imagenes?.find((img) => img.esPrincipal)?.rutaImagen ||
          data?.imagenes?.[0]?.rutaImagen;
        setActiveImage(getFileUrl(imagenPrincipalRelativa) || fallbackImage);
      } catch (requestError) {
        setError(requestError?.mensaje || 'No se pudo cargar el producto');
      } finally {
        setLoading(false);
      }
    };

    cargarProducto();
  }, [id]);

  useEffect(() => {
    if (!producto) return;

    // Prioritize variant image if available
    const variante = variantes.find(v => v.color?.idColor === colorId);
    if (variante && (variante.imagenVariante || variante.imagenesVariantes?.length > 0)) {
        const imagenVariantePrincipal = variante.imagenVariante || variante.imagenesVariantes.find(img => img.esPrincipal)?.rutaImagen || variante.imagenesVariantes[0]?.rutaImagen;
        if(imagenVariantePrincipal) setActiveImage(getFileUrl(imagenVariantePrincipal));
    } else {
        // Fallback to main product image
        const imagenPrincipalRelativa =
          producto.imagenes?.find((img) => img.esPrincipal)?.rutaImagen ||
          producto.imagenes?.[0]?.rutaImagen;
        setActiveImage(getFileUrl(imagenPrincipalRelativa) || fallbackImage);
    }
  }, [colorId, producto]);
  
  useEffect(() => {
    const cargarRelacionados = async () => {
      if (!producto?.categoria?.idCategoria) return;

      try {
        const response = await publicApi.obtenerProductosPorCategoria(producto.categoria.idCategoria, {
          pagina: 1,
          limite: 8,
        });
        const lista = Array.isArray(response?.datos)
          ? response.datos
          : Array.isArray(response)
            ? response
            : [];
        setProductosRelacionados(lista.filter((item) => item.idProducto !== producto.idProducto).slice(0, 4));
      } catch {
        setProductosRelacionados([]);
      }
    };

    cargarRelacionados();
  }, [producto?.categoria?.idCategoria, producto?.idProducto]);

  const variantes = Array.isArray(producto?.variantes) ? producto.variantes : [];

  const colores = useMemo(() => {
    const map = new Map();
    variantes.forEach((variant) => {
      const color = variant?.color;
      if (color?.idColor && !map.has(color.idColor)) {
        map.set(color.idColor, color);
      }
    });
    return Array.from(map.values());
  }, [variantes]);

  const tallas = useMemo(() => {
    const map = new Map();
    variantes.forEach((variant) => {
      const talla = variant?.talla;
      const colorMatches = !colorId || variant?.color?.idColor === colorId;
      if (talla?.idTalla && colorMatches && !map.has(talla.idTalla)) {
        map.set(talla.idTalla, talla);
      }
    });
    return Array.from(map.values());
  }, [variantes, colorId]);

  const varianteSeleccionada = useMemo(
    () =>
      variantes.find((variant) => {
        const colorMatches = !producto?.tieneColores || !colorId || variant?.color?.idColor === colorId;
        const tallaMatches = !producto?.tieneTallas || !tallaId || variant?.talla?.idTalla === tallaId;
        return colorMatches && tallaMatches;
      }) || null,
    [variantes, colorId, tallaId, producto?.tieneColores, producto?.tieneTallas]
  );

  const precio = Number(varianteSeleccionada?.precioVenta || producto?.precioVentaSugerido || 0);
  const stock = Number(varianteSeleccionada?.cantidadStock || 0);

  const imagenes = useMemo(() => {
    const productImages = (producto?.imagenes || [])
      .map(img => ({ ...img, rutaImagen: getFileUrl(img.rutaImagen) }))
      .filter(img => img.rutaImagen);

    if (colorId) {
      const variante = variantes.find(v => v.color?.idColor === colorId);
      if (variante) {
        const variantImages = [];
        if (variante.imagenVariante) {
          variantImages.push({
            idImagen: `var-main-${variante.idVariante}`,
            rutaImagen: getFileUrl(variante.imagenVariante),
          });
        }
        (variante.imagenesVariantes || []).forEach(img => {
          const url = getFileUrl(img.rutaImagen);
          if (url && !variantImages.find(i => i.rutaImagen === url)) {
            variantImages.push({
              idImagen: `var-img-${img.idImagenVariante}`,
              rutaImagen: url,
            });
          }
        });
        
        if (variantImages.length > 0) {
          return variantImages;
        }
      }
    }

    if (productImages.length > 0) {
      return productImages;
    }
    
    return [{ idImagen: 'fallback', rutaImagen: fallbackImage, esPrincipal: true }];
  }, [producto?.imagenes, variantes, colorId]);

  const handleAgregar = () => {
    if (!producto) return;

    if (producto.tieneColores && !colorId) {
      message.warning('Selecciona un color');
      return;
    }

    if (producto.tieneTallas && !tallaId) {
      message.warning('Selecciona una talla');
      return;
    }

    if (!varianteSeleccionada?.idVariante) {
      message.warning('Variante no disponible');
      return;
    }

    if (stock <= 0) {
      message.warning('Sin stock disponible');
      return;
    }

    agregarAlCarrito({
      idVariante: varianteSeleccionada.idVariante,
      idProducto: producto.idProducto,
      nombreProducto: producto.nombreProducto,
      color: varianteSeleccionada?.color?.nombreColor || null,
      colorHex: varianteSeleccionada?.color?.codigoHex || null,
      talla: varianteSeleccionada?.talla?.nombreTalla || null,
      nombreColor: varianteSeleccionada?.color?.nombreColor || null,
      nombreTalla: varianteSeleccionada?.talla?.nombreTalla || null,
      precio,
      precioVenta: precio,
      imagen: activeImage || fallbackImage,
      cantidad,
      stockDisponible: stock,
      codigoSku: varianteSeleccionada.codigoSku || null,
    });

    message.success('Producto agregado al carrito');
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] bg-gray-50 px-4 py-6 md:px-6">
        <div className="mx-auto max-w-7xl animate-pulse space-y-6">
          <div className="h-8 w-40 rounded bg-gray-200" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="h-[360px] rounded-2xl bg-gray-200 md:h-[520px]" />
            <div className="space-y-4">
              <div className="h-8 rounded bg-gray-200" />
              <div className="h-20 rounded bg-gray-200" />
              <div className="h-12 rounded bg-gray-200" />
              <div className="h-12 rounded bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div className="min-h-[60vh] bg-gray-50 px-4 py-10 md:px-6">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 text-center shadow-sm">
          <p className="text-base font-medium text-gray-900">Producto no disponible</p>
          <p className="mt-2 text-sm text-gray-600">{error || 'No se encontro el producto solicitado.'}</p>
          <button
            type="button"
            onClick={() => navigate('/cliente/compras')}
            className="mt-5 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Volver a tienda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <button
          type="button"
          onClick={() => navigate('/cliente/compras')}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm"
        >
          <ArrowLeftOutlined />
          Volver a tienda
        </button>

        <div className="grid grid-cols-1 gap-6 rounded-2xl bg-white p-4 shadow-sm md:grid-cols-2 md:gap-8 md:p-6">
          <section className="space-y-4">
            <div className="overflow-hidden rounded-2xl bg-gray-100">
              <img
                src={activeImage || fallbackImage}
                alt={producto.nombreProducto}
                className="h-[380px] w-full object-cover md:h-[520px]"
                onError={(event) => {
                  event.currentTarget.src = fallbackImage;
                }}
              />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {imagenes.slice(0, 4).map((imagen) => (
                <button
                  key={imagen.idImagen}
                  type="button"
                  onClick={() => setActiveImage(imagen.rutaImagen)}
                  className={`overflow-hidden rounded-xl border-2 ${
                    activeImage === imagen.rutaImagen ? 'border-gray-900' : 'border-transparent'
                  }`}
                >
                  <img
                    src={imagen.rutaImagen}
                    alt={producto.nombreProducto}
                    className="h-20 w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.src = fallbackImage;
                    }}
                  />
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-5">
            <div>
              <p className="text-sm font-medium text-gray-500">{producto.categoria?.nombreCategoria || 'Categoria'}</p>
              <h1 className="mt-1 text-2xl font-semibold text-gray-900 md:text-3xl">{producto.nombreProducto}</h1>
              <p className="mt-2 text-sm text-gray-600">{producto.descripcion || 'Sin descripcion disponible.'}</p>
            </div>

            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Precio</p>
              <p className="text-2xl font-semibold text-gray-900">{formatMoney(precio)}</p>
              <p className={`mt-1 text-sm font-medium ${stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {stock > 0 ? `Stock disponible: ${stock}` : 'Agotado'}
              </p>
            </div>

            {producto.tieneColores && colores.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Color</p>
                <div className="flex flex-wrap gap-2">
                  {colores.map((color) => (
                    <button
                      type="button"
                      key={color.idColor}
                      onClick={() => setColorId(color.idColor)}
                      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                        colorId === color.idColor
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-200 bg-white text-gray-700'
                      }`}
                    >
                      <span
                        className="h-4 w-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: color.codigoHex || '#ccc' }}
                      />
                      {color.nombreColor}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {producto.tieneTallas && tallas.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Talla</p>
                <div className="flex flex-wrap gap-2">
                  {tallas.map((talla) => (
                    <button
                      type="button"
                      key={talla.idTalla}
                      onClick={() => setTallaId(talla.idTalla)}
                      className={`rounded-xl border px-3 py-2 text-sm font-medium ${
                        tallaId === talla.idTalla
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-200 bg-white text-gray-700'
                      }`}
                    >
                      {talla.nombreTalla}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-3 md:max-w-xs">
              <button
                type="button"
                onClick={() => setCantidad((prev) => Math.max(prev - 1, 1))}
                className="h-12 rounded-xl border border-gray-200 bg-white text-lg font-semibold text-gray-700"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => setCantidad((prev) => Math.min(prev + 1, stock || 1))}
                className="h-12 rounded-xl border border-gray-200 bg-white text-lg font-semibold text-gray-700"
              >
                +
              </button>
              <p className="col-span-2 text-center text-sm text-gray-600">Cantidad: {cantidad}</p>
            </div>

            <button
              type="button"
              onClick={handleAgregar}
              disabled={!varianteSeleccionada || stock <= 0}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 px-4 text-base font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              <ShoppingCartOutlined />
              Agregar al carrito
            </button>
          </section>
        </div>

        <section className="rounded-2xl bg-white p-4 shadow-sm md:p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Productos relacionados</h2>
          {productosRelacionados.length === 0 ? (
            <p className="text-sm text-gray-600">No hay productos relacionados para mostrar.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 md:gap-6">
              {productosRelacionados.map((item) => (
                <ClienteProductCard key={item.idProducto} producto={item} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProductoPage;
