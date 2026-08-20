/**
 * @file ProductosPageIntegration.jsx
 * @description Ejemplo completo de integración del Wizard en ProductosPage
 * 
 * Este archivo muestra la implementación correcta del wizard
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { productosApi } from '../../../api/productosApi';
import ProductosWizard from '../../../components/admin/ProductosWizard';

// ... resto de imports ...

export default function ProductosPageIntegrationExample() {
  // Estado para controlar el wizard
  const [mostrarWizard, setMostrarWizard] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  
  // Estado para productos
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  /**
   * Obtiene la lista de productos
   */
  const fetchProductos = useCallback(async () => {
    try {
      setLoading(true);
      const response = await productosApi.obtenerProductos();
      setProductos(response.datos || response.data || response || []);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      alert('Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar productos al montar
  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  /**
   * Abre el wizard para crear nuevo producto
   */
  const handleCrearProducto = () => {
    setProductoEditando(null); // No hay producto a editar
    setMostrarWizard(true);
  };

  /**
   * Abre el wizard para editar un producto existente
   */
  const handleEditarProducto = (producto) => {
    setProductoEditando(producto); // Pasar el producto
    setMostrarWizard(true);
  };

  /**
   * Callback cuando se guarda exitosamente
   */
  const handleWizardSuccess = () => {
    // Recargar productos
    fetchProductos();
  };

  /**
   * Cierra el wizard
   */
  const handleCloseWizard = () => {
    setMostrarWizard(false);
    setProductoEditando(null);
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Gestión de Productos
        </h1>
        
        {/* Botón para crear producto */}
        <button
          onClick={handleCrearProducto}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Crear Producto
        </button>
      </div>

      {/* Lista de productos */}
      {loading ? (
        <div className="text-center text-gray-600 dark:text-gray-400">
          Cargando productos...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {productos.map(producto => (
            <div
              key={producto.idProducto}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {producto.nombreProducto}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {producto.codigoReferencia}
              </p>

              {/* Botones de acción */}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleEditarProducto(producto)}
                  className="flex-1 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors text-sm font-medium"
                >
                  Editar
                </button>
                <button
                  onClick={() => console.log('Eliminar:', producto.idProducto)}
                  className="flex-1 px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-sm font-medium"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🚀 WIZARD COMPONENT - Lo más importante */}
      <ProductosWizard
        isOpen={mostrarWizard}
        onClose={handleCloseWizard}
        producto={productoEditando}
        onSuccess={handleWizardSuccess}
      />
    </div>
  );
}

/**
 * EXPLICACIÓN DE LA INTEGRACIÓN:
 * 
 * 1. ESTADO
 *    - mostrarWizard: boolean para controlar visibilidad
 *    - productoEditando: null (crear) o producto existente (editar)
 * 
 * 2. FUNCIONES
 *    - handleCrearProducto(): Abre wizard para crear
 *    - handleEditarProducto(producto): Abre wizard para editar
 *    - handleCloseWizard(): Cierra el wizard
 *    - handleWizardSuccess(): Callback después de guardar
 * 
 * 3. PROPS DEL WIZARD
 *    - isOpen: Controla si está visible
 *    - onClose: Se ejecuta al cerrar
 *    - producto: El producto a editar (null si es crear)
 *    - onSuccess: Se ejecuta al guardar exitosamente
 * 
 * 4. FLUJO
 *    a) Usuario hace click en "Crear Producto"
 *    b) handleCrearProducto() se ejecuta
 *    c) setProductoEditando(null)
 *    d) setMostrarWizard(true)
 *    e) El wizard se abre
 *    f) Usuario completa los 5 pasos
 *    g) Al guardar, se llama handleWizardSuccess
 *    h) Se recargan los productos
 *    i) El wizard se cierra
 */

/**
 * CASOS DE USO
 */

// CASO 1: Crear Nuevo Producto
// ============================================
// Click en "Crear Producto"
// → handleCrearProducto()
// → setProductoEditando(null)
// → setMostrarWizard(true)
// → Wizard abre vacío
// → Usuario completa 5 pasos
// → Click en "Guardar Producto"
// → API: productosApi.createProducto(datos)
// → handleWizardSuccess()
// → fetchProductos()
// → Wizard se cierra
// → Lista se actualiza

// CASO 2: Editar Producto Existente
// ============================================
// Click en "Editar"
// → handleEditarProducto(producto)
// → setProductoEditando(producto)
// → setMostrarWizard(true)
// → Wizard abre con datos precargados
// → Usuario modifica datos
// → Click en "Guardar Producto"
// → API: productosApi.updateProducto(id, datos)
// → handleWizardSuccess()
// → fetchProductos()
// → Wizard se cierra
// → Lista se actualiza

// CASO 3: Cancelar
// ============================================
// En cualquier momento:
// Click en "X" o "Cancelar"
// → handleCloseWizard()
// → setMostrarWizard(false)
// → setProductoEditando(null)
// → Wizard se cierra sin guardar
