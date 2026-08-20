import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { obtenerProductoDetalle } from '../../api/publicApi';
import { useCarrito } from '../../context/CarritoContext';
import { getFileUrl } from '../../utils/fileUtils';

import GaleriaImagenes from '../../components/producto/GaleriaImagenes';
import SelectorColores from '../../components/producto/SelectorColores';
import SelectorTallas from '../../components/producto/SelectorTallas';

const ProductoDetallePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { agregarAlCarrito, estaEnCarrito, obtenerCantidadItem } = useCarrito();

  const [producto, setProducto] = useState(null);
  const [variantes, setVariantes] = useState([]);
  const [colores, setColores] = useState([]);
  const [tallas, setTallas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedTalla, setSelectedTalla] = useState(null);
  const [activeImage, setActiveImage] = useState('');
  const [currentStock, setCurrentStock] = useState(0);

  // Filtrar colores que existen en variantes (independientemente del stock)
  const availableColors = useMemo(() => colores.filter(color =>
    variantes.some(v => v.color?.idColor === color.id)
  ), [colores, variantes]);

  // Filtrar tallas que existen para el color seleccionado (independientemente del stock)
  const availableTallas = useMemo(() => tallas.filter(talla =>
    variantes.some(v =>
      v.talla?.idTalla === talla.id &&
      (!selectedColor || v.color?.idColor === selectedColor.id) &&
      true // Mostrar talla aunque no haya stock, para que el usuario vea "Agotado"
    )
  ), [tallas, variantes, selectedColor]);

  const imagenesGaleria = useMemo(() => {
    const collectVariantImages = (variantsToScan) => {
      const collected = [];
      (variantsToScan || []).forEach(v => {
        // Imagen principal de la variante
        if (v.imagenVariante) {
          const url = getFileUrl(v.imagenVariante);
          if (url && !collected.find(i => i.url === url)) {
            collected.push({
              id: `var-main-${v.idVariante}`,
              url,
              esPrincipal: false,
              tipo: 'variante',
              color: v.color?.nombreColor,
              talla: v.talla?.nombreTalla
            });
          }
        }
        // Imágenes adicionales de la variante
        (v.imagenesVariantes || []).forEach(img => {
          const url = getFileUrl(img.rutaImagen);
          if (url && !collected.find(i => i.url === url)) {
            collected.push({
              id: `var-img-${img.idImagenVariante}`,
              url,
              esPrincipal: img.esPrincipal,
              tipo: 'variante',
              color: v.color?.nombreColor,
              talla: v.talla?.nombreTalla
            });
          }
        });
      });
      return collected;
    };

    // Si hay un color seleccionado, mostrar solo las imágenes de esa variante
    if (selectedColor) {
      const variantsForColor = variantes.filter(v => v.color?.idColor === selectedColor.id);
      const variantImages = collectVariantImages(variantsForColor);
      
      // Si la variante tiene imágenes, las muestra. Si no, la galería quedará vacía
      // y la imagen principal (activeImage) ya habrá vuelto a la del producto.
      if (variantImages.length > 0) {
        return variantImages;
      }
    }

    // Caso por defecto: no hay color seleccionado O la variante seleccionada no tiene imágenes.
    // Mostrar una galería completa con las imágenes del producto y de todas las variantes.
    const productImages = (producto?.imagenesProductos || []).map(img => ({
      id: `prod-${img.idImagen}`,
      url: getFileUrl(img.rutaImagen),
      esPrincipal: img.esPrincipal,
      tipo: 'producto'
    }));
    
    const allVariantImages = collectVariantImages(variantes);
    
    const combined = [...productImages, ...allVariantImages];
    // Eliminar duplicados por URL antes de retornar
    return combined.filter((v, i, a) => a.findIndex(t => t.url === v.url) === i);
    
  }, [selectedColor, variantes, producto]);

  // Resetear talla seleccionada si ya no está disponible para el color seleccionado
  useEffect(() => {
    if (selectedTalla && !availableTallas.some(t => t.id === selectedTalla.id)) {
      setSelectedTalla(null);
    }
  }, [availableTallas, selectedTalla]);

  useEffect(() => {
    const getProductData = async () => {
      setLoading(true);
      try {
        const productoData = await obtenerProductoDetalle(id);

        setProducto(productoData);
        setVariantes(productoData.variantes || []);

        // Mapear colores disponibles al formato esperado por SelectorColores
        const coloresMapeados = (productoData.coloresDisponibles || []).map(c => ({
          id: c.idColor,
          nombre: c.nombreColor,
          hex: c.codigoHex
        }));
        setColores(coloresMapeados);

        // Mapear tallas disponibles al formato esperado por SelectorTallas
        const tallasMapeadas = (productoData.tallasDisponibles || []).map(t => ({
          id: t.idTalla,
          nombre: t.nombreTalla
        }));
        setTallas(tallasMapeadas);

        setActiveImage(getFileUrl(productoData.imagenPrincipal));

        // Seleccionar color inicial si el producto tiene colores
        if (productoData.tieneColores && productoData.variantes?.length > 0) {
          const firstVariantWithColor = productoData.variantes.find(v => v.color);
          if (firstVariantWithColor && firstVariantWithColor.color) {
            const initialColor = {
              id: firstVariantWithColor.color.idColor,
              nombre: firstVariantWithColor.color.nombreColor,
              hex: firstVariantWithColor.color.codigoHex
            };
            setSelectedColor(initialColor);
          }
        }
      } catch (error) {
        console.error("Error fetching product data:", error);
      } finally {
        setLoading(false);
      }
    };
    getProductData();
  }, [id]);

  useEffect(() => {
    // Si no hay producto, no hacer nada
    if (!producto) return;

    const variant = variantes.find(v => v.color?.idColor === selectedColor?.id);
    
    // Si la variante seleccionada tiene imagen, usarla
    if (variant && variant.imagenVariante) {
      setActiveImage(getFileUrl(variant.imagenVariante));
    } else {
      // Si no, volver a la imagen principal del producto
      setActiveImage(getFileUrl(producto.imagenPrincipal));
    }
  }, [selectedColor, variantes, producto]);

  useEffect(() => {
    let stock = 0;
    if (selectedColor && selectedTalla) {
      const variant = variantes.find(
        v => v.color?.idColor === selectedColor.id && v.talla?.idTalla === selectedTalla.id
      );
      stock = variant ? variant.cantidadStock : 0;
    } else if (selectedColor) {
      stock = variantes
        .filter(v => v.color?.idColor === selectedColor.id)
        .reduce((acc, v) => acc + v.cantidadStock, 0);
    } else if (selectedTalla) {
      stock = variantes
        .filter(v => v.talla?.idTalla === selectedTalla.id)
        .reduce((acc, v) => acc + v.cantidadStock, 0);
    } else if (!producto?.tieneColores && !producto?.tieneTallas) {
      stock = variantes[0]?.cantidadStock || 0;
    }
    setCurrentStock(stock);
  }, [selectedColor, selectedTalla, variantes, producto]);

  // ================== RENDER ==================

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="mb-8">
          <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <div className="bg-gray-200 animate-pulse h-[500px] rounded-2xl"></div>
            <div className="flex gap-3 mt-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-200 animate-pulse h-20 w-20 rounded-xl"></div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="h-6 bg-gray-200 animate-pulse rounded w-1/3"></div>
            <div className="h-9 bg-gray-200 animate-pulse rounded w-2/3"></div>
            <div className="h-7 bg-gray-200 animate-pulse rounded w-1/4"></div>
            <div className="h-24 bg-gray-200 animate-pulse rounded-xl"></div>
            <div className="h-12 bg-gray-200 animate-pulse rounded-lg"></div>
            <div className="h-32 bg-gray-200 animate-pulse rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="container mx-auto text-center py-24 px-4">
        <h2 className="text-2xl font-semibold text-gray-800">Producto no encontrado</h2>
        <button
          onClick={() => navigate(-1)}
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 transition shadow-sm"
        >
          ← Volver
        </button>
      </div>
    );
  }

  const stockInfoForTallas = variantes
    .filter(v => !selectedColor || v.color?.idColor === selectedColor.id)
    .map(v => ({
      id_talla: v.talla?.idTalla,
      stock: v.cantidadStock
    }));

  const isInStock = currentStock > 0;

  // Obtener precio a mostrar (precio de variante seleccionada o precio sugerido)
  const getPrecioMostrar = () => {
    if (selectedColor && selectedTalla) {
      const variant = variantes.find(
        v => v.color?.idColor === selectedColor.id && v.talla?.idTalla === selectedTalla.id
      );
      if (variant) return variant.precioVenta;
    } else if (selectedColor) {
      const variant = variantes.find(v => v.color?.idColor === selectedColor.id);
      if (variant) return variant.precioVenta;
    }
    return producto.precioVentaSugerido;
  };

  const accentColor = '#c77833';

  const getSelectedVariant = () => {
    if (selectedColor && selectedTalla) {
      return variantes.find(
        v => v.color?.idColor === selectedColor.id && v.talla?.idTalla === selectedTalla.id
      );
    } else if (selectedColor && !producto?.tieneTallas) {
      return variantes.find(v => v.color?.idColor === selectedColor.id);
    } else if (selectedTalla && !producto?.tieneColores) {
      return variantes.find(v => v.talla?.idTalla === selectedTalla.id);
    } else if (!producto?.tieneColores && !producto?.tieneTallas) {
      return variantes[0];
    }
    return null;
  };

  const handleAgregarAlCarrito = () => {
    const variant = getSelectedVariant();
    if (!variant) return;

    const itemCarrito = {
      idVariante: variant.idVariante,
      idProducto: producto.idProducto,
      nombreProducto: producto.nombreProducto,
      color: variant.color?.nombreColor || null,
      colorHex: variant.color?.codigoHex || null,
      talla: variant.talla?.nombreTalla || null,
      precio: variant.precioVenta,
      imagen: getFileUrl(variant.imagenVariante || producto.imagenPrincipal),
      cantidad: 1,
      stockDisponible: variant.cantidadStock,
      codigoSku: variant.codigoSku
    };

    agregarAlCarrito(itemCarrito);
  };

  const selectedVariant = getSelectedVariant();
  const canAddToCart = isInStock && selectedVariant;
  const variantInCart = selectedVariant ? estaEnCarrito(selectedVariant.idVariante) : false;
  const cantidadEnCarrito = selectedVariant ? obtenerCantidadItem(selectedVariant.idVariante) : 0;

  const getButtonText = () => {
    if (!isInStock) return 'Agotado';
    if (!selectedVariant) {
      if (producto?.tieneColores && !selectedColor) return 'Selecciona un color';
      if (producto?.tieneTallas && !selectedTalla) return 'Selecciona una talla';
    }
    if (variantInCart) return `En el carrito (${cantidadEnCarrito})`;
    return 'Añadir al carrito';
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Botón de volver */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium mb-8 transition-colors group"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver
      </button>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Galería de imágenes */}
        <div className="order-2 md:order-1">
          <GaleriaImagenes
            imagenes={imagenesGaleria}
            imagenPrincipal={activeImage}
            nombreProducto={producto.nombreProducto}
          />
        </div>

        {/* Información del producto */}
        <div className="order-1 md:order-2 flex flex-col gap-7">
          <div>
            <span
              className="text-sm font-medium text-gray-500 uppercase tracking-wider"
              style={{ color: accentColor }}
            >
              {producto.categoria?.nombreCategoria}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-1 leading-tight">
              {producto.nombreProducto}
            </h1>
            <div className="flex items-baseline mt-3">
              <span className="text-2xl md:text-3xl font-bold text-gray-900">
                ${getPrecioMostrar().toFixed(2)}
              </span>
            </div>
          </div>

          <p className="text-gray-600 leading-relaxed text-base">
            {producto.descripcion}
          </p>

          {/* Selectores */}
          <div className="space-y-6">
            {producto.tieneColores && (
              <SelectorColores
                colores={availableColors}
                onSelectColor={setSelectedColor}
                selectedColor={selectedColor}
              />
            )}
            {producto.tieneTallas && (
              <SelectorTallas
                tallas={availableTallas}
                onSelectTalla={setSelectedTalla}
                selectedTalla={selectedTalla}
                stockInfo={stockInfoForTallas}
              />
            )}
          </div>

          {/* Disponibilidad */}
          <div className="flex items-center gap-2">
            {isInStock ? (
              <>
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
                <span className="text-green-700 font-medium">
                  En stock • <span className="font-bold">{currentStock}</span> unidades disponibles
                </span>
              </>
            ) : (
              <>
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                <span className="text-red-600 font-medium">Agotado</span>
              </>
            )}
          </div>

          {/* Botón de acción */}
          <button
            onClick={handleAgregarAlCarrito}
            disabled={!canAddToCart}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform flex items-center justify-center gap-2 ${
              canAddToCart
                ? 'hover:bg-opacity-90 active:scale-[0.98] shadow-md hover:shadow-lg'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
            style={{
              backgroundColor: canAddToCart ? (variantInCart ? '#059669' : accentColor) : undefined,
              opacity: canAddToCart ? 1 : 0.7
            }}
          >
            {variantInCart ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : canAddToCart ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            ) : null}
            {getButtonText()}
          </button>

          {/* Detalles técnicos */}
          {producto.datosTecnicos && Object.keys(producto.datosTecnicos).length > 0 && (
            <div className="border-t border-gray-100 pt-6 mt-4">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                Detalles
              </h4>
              <ul className="space-y-2.5 text-sm text-gray-600">
                {Object.entries(producto.datosTecnicos).map(([key, value]) => (
                  <li key={key} className="flex justify-between border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                    <span className="capitalize text-gray-500">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <span className="font-medium text-gray-800">{value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductoDetallePage;
