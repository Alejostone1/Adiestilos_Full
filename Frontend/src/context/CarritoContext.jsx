/**
 * @file CarritoContext.jsx
 * @brief Contexto para manejo del carrito de compras con VARIANTES
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CarritoContext = createContext(null);

const STORAGE_KEY = 'adi_carrito';

export const useCarrito = () => {
  const context = useContext(CarritoContext);
  if (!context) {
    throw new Error('useCarrito debe usarse dentro de CarritoProvider');
  }
  return context;
};

export const CarritoProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const normalizarItem = useCallback((item = {}) => ({
    ...item,
    precio: Number(item.precio ?? item.precioVenta ?? 0),
    precioVenta: Number(item.precioVenta ?? item.precio ?? 0),
    cantidad: Number(item.cantidad || 1),
  }), []);

  // Cargar desde localStorage al iniciar
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setItems(parsed.map((item) => normalizarItem(item)));
        }
      }
    } catch (error) {
      console.error('Error cargando carrito:', error);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [normalizarItem]);

  // Guardar en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  /**
   * Agrega una variante al carrito
   * @param {Object} nuevoItem - Item con estructura de variante
   * Estructura esperada:
   * {
   *   idVariante: number,
   *   idProducto: number,
   *   nombreProducto: string,
   *   color: string,
   *   colorHex: string,
   *   talla: string,
   *   precio: number,
   *   imagen: string,
   *   cantidad: number,
   *   stockDisponible: number,
   *   codigoSku: string
   * }
   */
  const agregarAlCarrito = useCallback((nuevoItem) => {
    if (!nuevoItem.idVariante) {
      console.error('El item debe tener idVariante');
      return;
    }

    const itemNormalizado = normalizarItem(nuevoItem);

    setItems(prev => {
      const existente = prev.find(item => item.idVariante === itemNormalizado.idVariante);
      
      if (existente) {
        const nuevaCantidad = Math.min(
          existente.cantidad + (itemNormalizado.cantidad || 1),
          itemNormalizado.stockDisponible || 999
        );
        return prev.map(item =>
          item.idVariante === itemNormalizado.idVariante
            ? { ...item, cantidad: nuevaCantidad }
            : item
        );
      }
      
      return [...prev, { 
        ...itemNormalizado, 
        cantidad: itemNormalizado.cantidad || 1 
      }];
    });
    
    setIsOpen(true);
  }, [normalizarItem]);

  /**
   * Elimina una variante del carrito
   */
  const removerDelCarrito = useCallback((idVariante) => {
    setItems(prev => prev.filter(item => item.idVariante !== idVariante));
  }, []);

  /**
   * Actualiza la cantidad de una variante
   */
  const actualizarCantidad = useCallback((idVariante, cantidad) => {
    if (cantidad <= 0) {
      removerDelCarrito(idVariante);
      return;
    }
    
    setItems(prev => prev.map(item => {
      if (item.idVariante !== idVariante) return item;
      
      const cantidadFinal = Math.min(cantidad, item.stockDisponible || 999);
      return { ...item, cantidad: cantidadFinal };
    }));
  }, [removerDelCarrito]);

  /**
   * Vacía completamente el carrito
   */
  const vaciarCarrito = useCallback(() => {
    setItems([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  /**
   * Obtiene la suma de todas las cantidades
   */
  const obtenerCantidadTotal = useCallback(() => {
    return items.reduce((total, item) => total + item.cantidad, 0);
  }, [items]);

  /**
   * Obtiene el subtotal (suma de precio * cantidad)
   */
  const obtenerSubtotal = useCallback(() => {
    return items.reduce((total, item) => {
      const precio = Number(item.precio ?? item.precioVenta ?? 0);
      return total + (precio * item.cantidad);
    }, 0);
  }, [items]);

  /**
   * Obtiene un item específico por idVariante
   */
  const obtenerItem = useCallback((idVariante) => {
    return items.find(item => item.idVariante === idVariante);
  }, [items]);

  /**
   * Verifica si una variante está en el carrito
   */
  const estaEnCarrito = useCallback((idVariante) => {
    return items.some(item => item.idVariante === idVariante);
  }, [items]);

  /**
   * Obtiene la cantidad de una variante en el carrito
   */
  const obtenerCantidadItem = useCallback((idVariante) => {
    const item = items.find(i => i.idVariante === idVariante);
    return item ? item.cantidad : 0;
  }, [items]);

  // Funciones para el drawer
  const abrirCarrito = useCallback(() => setIsOpen(true), []);
  const cerrarCarrito = useCallback(() => setIsOpen(false), []);
  const toggleCarrito = useCallback(() => setIsOpen(prev => !prev), []);

  const value = {
    items,
    carrito: items, // alias para compatibilidad
    isOpen,
    agregarAlCarrito,
    removerDelCarrito,
    eliminarDelCarrito: removerDelCarrito, // alias
    actualizarCantidad,
    vaciarCarrito,
    limpiarCarrito: vaciarCarrito, // alias
    obtenerCantidadTotal,
    getTotalItems: obtenerCantidadTotal, // alias
    obtenerSubtotal,
    getTotalPrice: obtenerSubtotal, // alias
    obtenerItem,
    estaEnCarrito,
    obtenerCantidadItem,
    abrirCarrito,
    cerrarCarrito,
    toggleCarrito,
  };

  return (
    <CarritoContext.Provider value={value}>
      {children}
    </CarritoContext.Provider>
  );
};

export default CarritoContext;
