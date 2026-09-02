import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { useFavoritos } from '../../context/FavoritosContext';

const TarjetaProducto = ({
  id,
  nombre,
  precio,
  imagenPrincipal,
  imagenes = [],
  coloresDisponibles = [],
  esNuevo = false,
  descuento = null,
  slug
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { estaEnFavoritos, toggleFavorito } = useFavoritos();

  const isFavorito = estaEnFavoritos(id);

  const formatearCantidad = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
  };

  const formatearPrecio = (valor) => {
    return formatearCantidad(valor);
  };

  const handleImageError = (e) => {
    e.target.src =
      'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&h=600&fit=crop';
  };

  const linkDestino = slug ? `/producto/${slug}` : `/producto/${id}`;

  const imagenPrimaria = imagenPrincipal;
  const imagenSecundaria = imagenes.length > 0
    ? (imagenes.find(img => !img.esPrincipal)?.rutaImagen || imagenes[0]?.rutaImagen)
    : null;

  const handleToggleFavorito = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorito({
      idProducto: id,
      nombreProducto: nombre,
      precioVentaSugerido: precio,
      imagenPrincipal,
      coloresDisponibles,
      esNuevo,
      descuento,
      slug,
    });
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className={`group relative flex flex-col bg-pure-white rounded-lg overflow-hidden border transition-all duration-300 ${
        isHovered
          ? 'border-primary/60 shadow-card-hover -translate-y-1'
          : 'border-outline-variant hover:border-primary/40 shadow-card'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={linkDestino} className="block relative">
        {/* Image container */}
        <div className="relative m-2 aspect-[3/4] bg-surface-container-low overflow-hidden rounded-md">
          {/* Primary image */}
          <img
            src={imagenPrimaria}
            alt={nombre}
            onError={handleImageError}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
              isHovered && imagenSecundaria
                ? 'opacity-0 scale-105'
                : 'opacity-100 scale-100'
            }`}
            loading="lazy"
          />

          {/* Secondary image */}
          {imagenSecundaria && (
            <img
              src={imagenSecundaria}
              alt={`${nombre} - vista alternativa`}
              onError={handleImageError}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
                isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
              loading="lazy"
            />
          )}

          {/* Badge NEW */}
          {esNuevo && (
            <div className="absolute top-2 left-2 z-20">
              <span className="bg-tertiary-container text-on-tertiary-container font-label-caps text-label-caps px-2 py-1 rounded-full">
                Nuevo
              </span>
            </div>
          )}

          {/* Badge SALE */}
          {descuento && (
            <div className="absolute top-2 left-2 z-20">
              <span className="bg-tertiary text-on-tertiary font-label-caps text-label-caps px-2 py-1 rounded-full">
                -{descuento}%
              </span>
            </div>
          )}

          {/* Favorite button */}
          <button
            onClick={handleToggleFavorito}
            aria-label={isFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            className={`absolute top-2 right-2 transition-all duration-300 p-1.5 rounded-full backdrop-blur-sm z-20 ${
              isFavorito
                ? 'bg-primary/10 text-primary'
                : 'bg-pure-white/80 text-text-main hover:text-primary'
            }`}
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={isFavorito ? { fontVariationSettings: "'FILL' 1, 'wght' 400" } : undefined}
            >
              {isFavorito ? 'favorite' : 'favorite_border'}
            </span>
          </button>

          {/* Hover Add to Cart */}
          <div className={`absolute bottom-0 left-0 w-full p-4 transition-transform duration-300 ${
            isHovered ? 'translate-y-0' : 'translate-y-full'
          }`}>
            <span className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary font-body-sm text-body-sm font-medium py-3 rounded-lg">
              <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
              Agregar al carrito
            </span>
          </div>
        </div>

        {/* Product info */}
        <div className="px-5 pb-5 pt-4">
          {/* Name */}
          <h4 className="font-body-md text-body-md text-on-surface mb-2.5 line-clamp-2 text-center font-medium">
            {nombre}
          </h4>

          {/* Divider */}
          <div className="w-8 h-px bg-primary/25 mx-auto mb-2.5" />

          {/* Price */}
          <div className="flex items-baseline justify-center gap-2">
            <p className="font-body-md text-[15px] text-primary font-semibold tabular-nums tracking-tight">
              <span className="text-[11px] font-medium mr-px">$</span>
              {formatearPrecio(precio)}
            </p>
            {descuento && (
              <p className="text-[12px] text-outline line-through font-medium tabular-nums">
                ${formatearPrecio(precio * (1 + descuento / 100))}
              </p>
            )}
          </div>

          {/* Color swatches */}
          {coloresDisponibles.length > 0 && (
            <div className="flex items-center justify-center gap-1.5 mt-3">
              {coloresDisponibles.slice(0, 5).map((color) => (
                <span
                  key={color.idColor}
                  title={color.nombreColor}
                  className="w-3 h-3 rounded-full border border-outline-variant/30 shadow-sm cursor-pointer"
                  style={{ backgroundColor: color.codigoHex || '#ccc' }}
                />
              ))}
              {coloresDisponibles.length > 5 && (
                <span className="text-[10px] text-outline ml-1">
                  +{coloresDisponibles.length - 5}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.article>
  );
};

TarjetaProducto.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  nombre: PropTypes.string.isRequired,
  precio: PropTypes.number.isRequired,
  imagenPrincipal: PropTypes.string.isRequired,
  imagenes: PropTypes.arrayOf(
    PropTypes.shape({
      idImagen: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      rutaImagen: PropTypes.string,
      esPrincipal: PropTypes.bool,
    })
  ),
  coloresDisponibles: PropTypes.arrayOf(
    PropTypes.shape({
      idColor: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      nombreColor: PropTypes.string,
      codigoHex: PropTypes.string,
    })
  ),
  esNuevo: PropTypes.bool,
  descuento: PropTypes.number,
  slug: PropTypes.string,
};

export default TarjetaProducto;
