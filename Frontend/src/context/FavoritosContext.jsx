/**
 * @file FavoritosContext.jsx
 * @brief Contexto de favoritos (wishlist) - persistencia en localStorage
 * No requiere backend ni autenticación: guarda productos favoritos en el navegador.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const FavoritosContext = createContext(null);

const STORAGE_KEY = 'adi_favoritos';

export const useFavoritos = () => {
  const context = useContext(FavoritosContext);
  if (!context) {
    throw new Error('useFavoritos debe usarse dentro de FavoritosProvider');
  }
  return context;
};

/**
 * Normaliza un producto favorito
 * ids: idProducto o id
 * nombre: nombreProducto o nombre
 * imagenPrincipal / imagen
 * precio, coloresDisponibles, esNuevo, descuento, slug
 */
const normalizarProducto = (prod = {}) => ({
  id: prod.idProducto ?? prod.id,
  nombre: prod.nombreProducto ?? prod.nombre,
  precio: Number(prod.precio ?? prod.precioVentaSugerido ?? prod.precioMinimo ?? 0),
  imagen: prod.imagenPrincipal ?? prod.imagen ?? prod.imagenProducto ?? '',
  coloresDisponibles: prod.coloresDisponibles ?? prod.colores ?? [],
  esNuevo: prod.esNuevo ?? false,
  descuento: prod.descuento ?? null,
  slug: prod.slug,
});

export const FavoritosProvider = ({ children }) => {
  const [favoritos, setFavoritos] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // Cargar desde localStorage al iniciar
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setFavoritos(parsed.map((p) => normalizarProducto(p)));
        }
      }
    } catch (error) {
      console.error('Error cargando favoritos:', error);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Guardar en localStorage cuando cambie
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favoritos));
    } catch (error) {
      console.error('Error guardando favoritos:', error);
    }
  }, [favoritos]);

  /**
   * Agrega un producto a favoritos
   */
  const agregarFavorito = useCallback((producto) => {
    const normalizado = normalizarProducto(producto);
    if (!normalizado.id) return;
    setFavoritos(prev => {
      if (prev.some(f => f.id === normalizado.id)) return prev;
      return [normalizado, ...prev];
    });
  }, []);

  /**
   * Elimina un producto de favoritos por id
   */
  const eliminarFavorito = useCallback((idProducto) => {
    setFavoritos(prev => prev.filter(f => f.id !== idProducto));
  }, []);

  /**
   * Alterna el estado de favorito de un producto
   */
  const toggleFavorito = useCallback((producto) => {
    const id = producto.idProducto ?? producto.id;
    setFavoritos(prev => {
      const existe = prev.some(f => f.id === id);
      if (existe) return prev.filter(f => f.id !== id);
      const normalizado = normalizarProducto(producto);
      if (!normalizado.id) return prev;
      return [normalizado, ...prev];
    });
  }, []);

  /**
   * Verifica si un producto está en favoritos
   */
  const estaEnFavoritos = useCallback((idProducto) => {
    return favoritos.some(f => f.id === idProducto);
  }, [favoritos]);

  /**
   * Limpia todos los favoritos
   */
  const limpiarFavoritos = useCallback(() => {
    setFavoritos([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Control del drawer
  const abrirFavoritos = useCallback(() => setIsOpen(true), []);
  const cerrarFavoritos = useCallback(() => setIsOpen(false), []);
  const toggleFavoritos = useCallback(() => setIsOpen(prev => !prev), []);

  const value = {
    favoritos,
    isOpen,
    agregarFavorito,
    eliminarFavorito,
    toggleFavorito,
    estaEnFavoritos,
    limpiarFavoritos,
    abrirFavoritos,
    cerrarFavoritos,
    toggleFavoritos,
  };

  return (
    <FavoritosContext.Provider value={value}>
      {children}
    </FavoritosContext.Provider>
  );
};

export default FavoritosContext;
