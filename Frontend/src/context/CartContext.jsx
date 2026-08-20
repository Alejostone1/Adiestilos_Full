/**
 * @file CartContext.jsx
 * @brief Proveedor de contexto para la gestión del carrito de compras en toda la aplicación.
 *
 * Expone el estado del carrito, funciones para agregar, remover y actualizar productos,
 * y calcular el total del carrito.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

// Crear el contexto del carrito
const CartContext = createContext();

// Hook personalizado para usar el contexto del carrito de forma sencilla
export const useCart = () => {
  return useContext(CartContext);
};

// Componente Proveedor del contexto
export const CartProvider = ({ children }) => {
  const [carrito, setCarrito] = useState([]);

  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
      setCarrito(JSON.parse(carritoGuardado));
    }
  }, []);

  // Guardar carrito en localStorage cada vez que cambie
  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(carrito));
  }, [carrito]);

  /**
   * Agrega un producto al carrito. Si ya existe, incrementa la cantidad.
   * @param {object} producto - El producto a agregar.
   */
  const agregarAlCarrito = (producto) => {
    setCarrito((prevCarrito) => {
      const productoExistente = prevCarrito.find((item) => item.id === producto.id);
      if (productoExistente) {
        return prevCarrito.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      } else {
        return [...prevCarrito, { ...producto, cantidad: 1 }];
      }
    });
  };

  /**
   * Remueve un producto del carrito.
   * @param {number} id - El ID del producto a remover.
   */
  const removerDelCarrito = (id) => {
    setCarrito((prevCarrito) => prevCarrito.filter((item) => item.id !== id));
  };

  /**
   * Actualiza la cantidad de un producto en el carrito.
   * @param {number} id - El ID del producto.
   * @param {number} cantidad - La nueva cantidad.
   */
  const actualizarCantidad = (id, cantidad) => {
    if (cantidad <= 0) {
      removerDelCarrito(id);
      return;
    }
    setCarrito((prevCarrito) =>
      prevCarrito.map((item) =>
        item.id === id ? { ...item, cantidad } : item
      )
    );
  };

  /**
   * Vacía el carrito completamente.
   */
  const vaciarCarrito = () => {
    setCarrito([]);
  };

  /**
   * Calcula el total del carrito.
   * @returns {number} El total del carrito.
   */
  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + item.precio * item.cantidad, 0);
  };

  // El valor que se pasará a los componentes consumidores del contexto
  const value = {
    carrito,
    agregarAlCarrito,
    removerDelCarrito,
    actualizarCantidad,
    vaciarCarrito,
    calcularTotal,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
