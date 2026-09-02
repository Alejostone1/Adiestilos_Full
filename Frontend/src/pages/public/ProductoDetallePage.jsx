/**
 * @file ProductoDetallePage.jsx
 * @brief Detalle de producto ADI Estilos — editorial, responsive, sin romper lógica.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { obtenerProductoDetalle } from '../../api/publicApi';
import { useCarrito } from '../../context/CarritoContext';
import { useFavoritos } from '../../context/FavoritosContext';
import { getImagenURL } from '../../utils/imageUrl';
import GaleriaImagenes from '../../components/producto/GaleriaImagenes';
import SelectorColores from '../../components/producto/SelectorColores';
import SelectorTallas from '../../components/producto/SelectorTallas';

const ProductoDetallePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { agregarAlCarrito, estaEnCarrito, obtenerCantidadItem } = useCarrito();
  const { estaEnFavoritos, toggleFavorito } = useFavoritos();

  const [producto, setProducto] = useState(null);
  const [variantes, setVariantes] = useState([]);
  const [colores, setColores] = useState([]);
  const [tallas, setTallas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedTalla, setSelectedTalla] = useState(null);
  const [activeImage, setActiveImage] = useState('');
  const [currentStock, setCurrentStock] = useState(0);

  const availableColors = useMemo(() => colores.filter(color =>
    variantes.some(v => v.color?.idColor === color.id)
  ), [colores, variantes]);

  const availableTallas = useMemo(() => tallas.filter(talla =>
    variantes.some(v =>
      v.talla?.idTalla === talla.id &&
      (!selectedColor || v.color?.idColor === selectedColor.id)
    )
  ), [tallas, variantes, selectedColor]);

  const imagenesGaleria = useMemo(() => {
    const collectVariantImages = (variantsToScan) => {
      const collected = [];
      (variantsToScan || []).forEach(v => {
        if (v.imagenVariante) {
          const url = getImagenURL(v.imagenVariante);
          if (url && !collected.find(i => i.url === url)) {
            collected.push({ id: `var-main-${v.idVariante}`, url, esPrincipal: false, tipo: 'variante', color: v.color?.nombreColor, talla: v.talla?.nombreTalla });
          }
        }
        (v.imagenesVariantes || []).forEach(img => {
          const url = getImagenURL(img.rutaImagen);
          if (url && !collected.find(i => i.url === url)) {
            collected.push({ id: `var-img-${img.idImagenVariante}`, url, esPrincipal: img.esPrincipal, tipo: 'variante', color: v.color?.nombreColor, talla: v.talla?.nombreTalla });
          }
        });
      });
      return collected;
    };

    if (selectedColor) {
      const variantsForColor = variantes.filter(v => v.color?.idColor === selectedColor.id);
      const variantImages = collectVariantImages(variantsForColor);
      if (variantImages.length > 0) return variantImages;
    }

    const productImages = (producto?.imagenesProductos || []).map(img => ({
      id: `prod-${img.idImagen}`,
      url: getImagenURL(img.rutaImagen),
      esPrincipal: img.esPrincipal,
      tipo: 'producto'
    }));
    const allVariantImages = collectVariantImages(variantes);
    const combined = [...productImages, ...allVariantImages];
    return combined.filter((v, i, a) => a.findIndex(t => t.url === v.url) === i);
  }, [selectedColor, variantes, producto]);

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
        setColores((productoData.coloresDisponibles || []).map(c => ({ id: c.idColor, nombre: c.nombreColor, hex: c.codigoHex })));
        setTallas((productoData.tallasDisponibles || []).map(t => ({ id: t.idTalla, nombre: t.nombreTalla })));
        setActiveImage(getImagenURL(productoData.imagenPrincipal));

        if (productoData.tieneColores && productoData.variantes?.length > 0) {
          const firstVariantWithColor = productoData.variantes.find(v => v.color);
          if (firstVariantWithColor?.color) {
            setSelectedColor({ id: firstVariantWithColor.color.idColor, nombre: firstVariantWithColor.color.nombreColor, hex: firstVariantWithColor.color.codigoHex });
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
    if (!producto) return;
    const variant = variantes.find(v => v.color?.idColor === selectedColor?.id);
    setActiveImage(variant?.imagenVariante ? getImagenURL(variant.imagenVariante) : getImagenURL(producto.imagenPrincipal));
  }, [selectedColor, variantes, producto]);

  useEffect(() => {
    let stock = 0;
    if (selectedColor && selectedTalla) {
      const variant = variantes.find(v => v.color?.idColor === selectedColor.id && v.talla?.idTalla === selectedTalla.id);
      stock = variant ? variant.cantidadStock : 0;
    } else if (selectedColor) {
      stock = variantes.filter(v => v.color?.idColor === selectedColor.id).reduce((acc, v) => acc + v.cantidadStock, 0);
    } else if (selectedTalla) {
      stock = variantes.filter(v => v.talla?.idTalla === selectedTalla.id).reduce((acc, v) => acc + v.cantidadStock, 0);
    } else if (!producto?.tieneColores && !producto?.tieneTallas) {
      stock = variantes[0]?.cantidadStock || 0;
    }
    setCurrentStock(stock);
  }, [selectedColor, selectedTalla, variantes, producto]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-[1280px] mx-auto px-5 md:px-16 py-12">
          <div className="grid md:grid-cols-2 gap-10">
            <div>
              <div className="bg-surface-container-low animate-pulse h-[500px] rounded-lg" />
              <div className="flex gap-3 mt-5">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-surface-container-low animate-pulse h-20 w-20 rounded-lg" />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="h-5 bg-surface-container-low animate-pulse rounded w-1/3" />
              <div className="h-9 bg-surface-container-low animate-pulse rounded w-2/3" />
              <div className="h-7 bg-surface-container-low animate-pulse rounded w-1/4" />
              <div className="h-24 bg-surface-container-low animate-pulse rounded-lg" />
              <div className="h-12 bg-surface-container-low animate-pulse rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <span className="material-symbols-outlined text-[64px] text-outline-variant mb-4">inventory_2</span>
        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">Producto no encontrado</h2>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-6 py-3 border border-outline-variant text-text-main font-label-caps text-label-caps rounded-lg hover:border-primary hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Volver
        </button>
      </div>
    );
  }

  const stockInfoForTallas = variantes.filter(v => !selectedColor || v.color?.idColor === selectedColor.id).map(v => ({ id_talla: v.talla?.idTalla, stock: v.cantidadStock }));
  const isInStock = currentStock > 0;

  const getPrecioMostrar = () => {
    if (selectedColor && selectedTalla) {
      const variant = variantes.find(v => v.color?.idColor === selectedColor.id && v.talla?.idTalla === selectedTalla.id);
      if (variant) return variant.precioVenta;
    } else if (selectedColor) {
      const variant = variantes.find(v => v.color?.idColor === selectedColor.id);
      if (variant) return variant.precioVenta;
    }
    return producto.precioVentaSugerido;
  };

  const getSelectedVariant = () => {
    if (selectedColor && selectedTalla) return variantes.find(v => v.color?.idColor === selectedColor.id && v.talla?.idTalla === selectedTalla.id);
    if (selectedColor && !producto?.tieneTallas) return variantes.find(v => v.color?.idColor === selectedColor.id);
    if (selectedTalla && !producto?.tieneColores) return variantes.find(v => v.talla?.idTalla === selectedTalla.id);
    if (!producto?.tieneColores && !producto?.tieneTallas) return variantes[0];
    return null;
  };

  const handleAgregarAlCarrito = () => {
    const variant = getSelectedVariant();
    if (!variant) return;
    agregarAlCarrito({
      idVariante: variant.idVariante,
      idProducto: producto.idProducto,
      nombreProducto: producto.nombreProducto,
      color: variant.color?.nombreColor || null,
      colorHex: variant.color?.codigoHex || null,
      talla: variant.talla?.nombreTalla || null,
      precio: variant.precioVenta,
      imagen: getImagenURL(variant.imagenVariante || producto.imagenPrincipal),
      cantidad: 1,
      stockDisponible: variant.cantidadStock,
      codigoSku: variant.codigoSku
    });
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

  const formatPrice = (p) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(p);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1280px] mx-auto px-5 md:px-16 py-8 md:py-12">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-outline hover:text-primary font-body-sm text-body-sm mb-8 transition-colors group"
        >
          <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
          Volver
        </button>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Galería */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="order-2 md:order-1"
          >
            <GaleriaImagenes
              imagenes={imagenesGaleria}
              imagenPrincipal={activeImage}
              nombreProducto={producto.nombreProducto}
            />
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="order-1 md:order-2 flex flex-col gap-6"
          >
            <div>
              <span className="font-label-caps text-label-caps text-primary tracking-[0.15em] mb-2 block uppercase">
                {producto.categoria?.nombreCategoria}
              </span>
              <h1 className="font-display-lg text-display-lg md:text-primary leading-tight">
                {producto.nombreProducto}
              </h1>
              <div className="mt-4">
                <span className="font-headline-md text-headline-md text-primary font-semibold">
                  {formatPrice(getPrecioMostrar())}
                </span>
              </div>
            </div>

            {producto.descripcion && (
              <p className="font-body-md text-body-md text-text-main leading-relaxed">
                {producto.descripcion}
              </p>
            )}

            {/* Selectores */}
            <div className="space-y-6">
              {producto.tieneColores && (
                <SelectorColores colores={availableColors} onSelectColor={setSelectedColor} selectedColor={selectedColor} />
              )}
              {producto.tieneTallas && (
                <SelectorTallas tallas={availableTallas} onSelectTalla={setSelectedTalla} selectedTalla={selectedTalla} stockInfo={stockInfoForTallas} />
              )}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              {isInStock ? (
                <>
                  <span className="w-2.5 h-2.5 bg-tertiary rounded-full" />
                  <span className="font-body-sm text-body-sm text-text-main">
                    En stock • <span className="font-semibold">{currentStock}</span> unidades
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 bg-outline-variant rounded-full" />
                  <span className="font-body-sm text-body-sm text-outline">Agotado</span>
                </>
              )}
            </div>

            {/* Add to cart */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleAgregarAlCarrito}
                disabled={!canAddToCart}
                className={`flex-1 py-4 px-6 rounded-lg font-label-caps text-label-caps flex items-center justify-center gap-2 transition-all duration-300 ${
                  canAddToCart
                    ? variantInCart
                      ? 'bg-tertiary text-on-tertiary hover:opacity-90'
                      : 'bg-primary text-on-primary hover:bg-tertiary hover:text-on-tertiary'
                    : 'bg-surface-container-low text-outline cursor-not-allowed'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {variantInCart ? 'check_circle' : 'shopping_bag'}
                </span>
                {getButtonText()}
              </button>

              <button
                onClick={() => {
                  if (!producto) return;
                  toggleFavorito({
                    idProducto: producto.idProducto,
                    nombreProducto: producto.nombreProducto,
                    precioVentaSugerido: producto.precioVentaSugerido,
                    imagenPrincipal: producto.imagenPrincipal,
                    coloresDisponibles: producto.coloresDisponibles || [],
                  });
                }}
                aria-label={producto && estaEnFavoritos(producto.idProducto) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                className={`shrink-0 w-[56px] h-[56px] rounded-lg border flex items-center justify-center transition-all duration-300 ${
                  producto && estaEnFavoritos(producto.idProducto)
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-outline-variant text-text-main hover:border-primary hover:text-primary'
                }`}
              >
                <span
                  className="material-symbols-outlined text-[24px]"
                  style={producto && estaEnFavoritos(producto.idProducto) ? { fontVariationSettings: "'FILL' 1, 'wght' 400" } : undefined}
                >
                  {producto && estaEnFavoritos(producto.idProducto) ? 'favorite' : 'favorite_border'}
                </span>
              </button>
            </div>

            {/* Technical details */}
            {producto.datosTecnicos && Object.keys(producto.datosTecnicos).length > 0 && (
              <div className="border-t border-outline-variant/30 pt-6">
                <h4 className="font-label-caps text-label-caps text-primary tracking-wider mb-4 uppercase">Detalles</h4>
                <ul className="space-y-2">
                  {Object.entries(producto.datosTecnicos).map(([key, value]) => (
                    <li key={key} className="flex justify-between border-b border-outline-variant/20 pb-2 last:border-0 font-body-sm text-body-sm">
                      <span className="text-outline capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="font-medium text-text-main">{value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProductoDetallePage;
