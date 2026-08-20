/**
 * Componente de formulario para crear y editar productos.
 */
import React, { useState, useEffect } from 'react';
import { categoriasApi } from '../../api/categoriasApi';
import { proveedoresApi } from '../../api/proveedoresApi';
import ButtonComponent from '../common/ButtonComponent';
import LoaderComponent from '../common/LoaderComponent';

const ProductoForm = ({ producto, onGuardar, onCancelar, errorApi }) => {
  // Estado inicial del formulario
  const estadoInicial = {
    codigoReferencia: '',
    nombreProducto: '',
    descripcion: '',
    idCategoria: '',
    idProveedor: '',
    precioVentaSugerido: 0,
    estado: 'activo',
    // ... otros campos del modelo Producto
  };

  const [datosForm, setDatosForm] = useState(estadoInicial);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Efecto para cargar datos iniciales (categorías, proveedores) y popular el form si es para editar
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        setCargando(true);
        // Cargar categorías y proveedores para los dropdowns
        const [resCategorias, resProveedores] = await Promise.all([
          categoriasApi.obtenerTodasLasCategorias(),
          proveedoresApi.obtenerProveedores() // Asumiendo que existe esta API
        ]);
        setCategorias(resCategorias.datos || []);
        setProveedores(resProveedores.datos || []);

        // Si se está editando un producto, rellenar el formulario
        if (producto) {
          setDatosForm({
            codigoReferencia: producto.codigoReferencia || '',
            nombreProducto: producto.nombreProducto || '',
            descripcion: producto.descripcion || '',
            idCategoria: producto.idCategoria || '',
            idProveedor: producto.idProveedor || '',
            precioVentaSugerido: producto.precioVentaSugerido || 0,
            estado: producto.estado || 'activo',
          });
        } else {
          setDatosForm(estadoInicial);
        }
      } catch (error) {
        console.error("Error al cargar datos para el formulario:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatosIniciales();
  }, [producto]);

  // Manejador de cambios en los inputs del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setDatosForm(prev => ({ ...prev, [name]: value }));
  };

  // Manejador del envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    // Realizar validaciones básicas antes de guardar
    if (!datosForm.nombreProducto || !datosForm.codigoReferencia || !datosForm.idCategoria) {
      alert('Nombre, Código de Referencia y Categoría son obligatorios.');
      return;
    }
    onGuardar(datosForm);
  };

  if (cargando) {
    return <LoaderComponent />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorApi && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{errorApi}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="nombreProducto" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre del Producto</label>
          <input
            type="text"
            name="nombreProducto"
            id="nombreProducto"
            value={datosForm.nombreProducto}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white"
            required
          />
        </div>
        <div>
          <label htmlFor="codigoReferencia" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Código de Referencia</label>
          <input
            type="text"
            name="codigoReferencia"
            id="codigoReferencia"
            value={datosForm.codigoReferencia}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label>
        <textarea
          name="descripcion"
          id="descripcion"
          value={datosForm.descripcion}
          onChange={handleChange}
          rows="3"
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white"
        ></textarea>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="idCategoria" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoría</label>
          <select
            name="idCategoria"
            id="idCategoria"
            value={datosForm.idCategoria}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white"
            required
          >
            <option value="">Seleccione una categoría</option>
            {categorias.map(cat => (
              <option key={cat.idCategoria} value={cat.idCategoria}>{cat.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="idProveedor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Proveedor</label>
          <select
            name="idProveedor"
            id="idProveedor"
            value={datosForm.idProveedor}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white"
          >
            <option value="">Seleccione un proveedor</option>
            {proveedores.map(prov => (
              <option key={prov.idProveedor} value={prov.idProveedor}>{prov.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="precioVentaSugerido" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Precio de Venta</label>
          <input
            type="number"
            name="precioVentaSugerido"
            id="precioVentaSugerido"
            value={datosForm.precioVentaSugerido}
            onChange={handleChange}
            step="0.01"
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label htmlFor="estado" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Estado</label>
          <select
            name="estado"
            id="estado"
            value={datosForm.estado}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white"
          >
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
            <option value="descontinuado">Descontinuado</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <ButtonComponent
          type="button"
          onClick={onCancelar}
          variant="secondary"
        >
          Cancelar
        </ButtonComponent>
        <ButtonComponent type="submit" variant="primary">
          Guardar Producto
        </ButtonComponent>
      </div>
    </form>
  );
};

export default ProductoForm;
