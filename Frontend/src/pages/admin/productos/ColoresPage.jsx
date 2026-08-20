// ======================================================
// ColoresPage.jsx
// Panel administrativo para gestión de colores
// Compatible con backend Prisma
// Soporte modo claro / oscuro
// ======================================================

import { useState, useEffect, useCallback } from "react";
import {
  FiEdit,
  FiTrash2,
  FiPlus,
  FiRefreshCcw,
  FiSearch,
} from "react-icons/fi";
import { MdPalette } from "react-icons/md";

import { AdminPageLayout } from "../../../components/common/AdminPagePlaceholder";
import { coloresApi } from "../../../api/coloresApi";

// ======================================================
// Componente principal
// ======================================================
export default function ColoresPage() {
  // ----------------------
  // Estados principales
  // ----------------------
  const [colores, setColores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ----------------------
  // Estados de búsqueda
  // ----------------------
  const [busqueda, setBusqueda] = useState("");

  // ----------------------
  // Estados de formulario
  // ----------------------
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [colorEditando, setColorEditando] = useState(null);

  // ----------------------
  // Obtener colores
  // ----------------------
  const fetchColores = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await coloresApi.getColores();
      setColores(response?.datos || []);
    } catch (err) {
      setError(err?.message || "Error al obtener colores");
    } finally {
      setLoading(false);
    }
  }, []);

  // ----------------------
  // Filtrado por búsqueda
  // ----------------------
  const coloresFiltrados = colores.filter((color) => {
    const texto = busqueda.toLowerCase();
    return (
      color.nombreColor.toLowerCase().includes(texto) ||
      (color.codigoHex && color.codigoHex.toLowerCase().includes(texto))
    );
  });

  // ----------------------
  // Cargar al iniciar
  // ----------------------
  useEffect(() => {
    fetchColores();
  }, [fetchColores]);

  // ======================================================
  // Render
  // ======================================================
  return (
    <AdminPageLayout
      title="Gestión de Colores"
      icon={<MdPalette />}
      description="Administración completa de colores utilizados en productos"
    >
      {/* Barra superior */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        {/* Búsqueda */}
        <div className="relative w-full sm:w-80">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o código HEX..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-gray-500"
          />
        </div>

        {/* Acciones */}
        <div className="flex gap-3">
          <button
            onClick={fetchColores}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <FiRefreshCcw />
            Actualizar
          </button>

          <button
            onClick={() => setMostrarFormulario(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
          >
            <FiPlus />
            Nuevo Color
          </button>
        </div>
      </div>

      {/* Estados */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100 rounded-full" />
          <span className="ml-3 text-gray-500">Cargando colores...</span>
        </div>
      )}

      {error && (
        <div className="p-4 mb-6 border border-red-300 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && coloresFiltrados.length === 0 && (
        <div className="text-center py-12">
          <MdPalette className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-gray-500">
            {busqueda
              ? "No se encontraron colores"
              : "No hay colores registrados"}
          </p>
        </div>
      )}

      {/* Grid */}
      {!loading && !error && coloresFiltrados.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {coloresFiltrados.map((color) => (
            <ColorCard
              key={color.idColor}
              color={color}
              onEdit={() => {
                setColorEditando(color);
                setMostrarFormulario(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Modal de formulario */}
      {mostrarFormulario && (
        <ColorFormModal
          color={colorEditando}
          onClose={() => {
            setMostrarFormulario(false);
            setColorEditando(null);
          }}
          onSave={async (colorData) => {
            try {
              if (colorEditando) {
                await coloresApi.updateColor(colorEditando.idColor, colorData);
              } else {
                await coloresApi.createColor(colorData);
              }
              await fetchColores();
              setMostrarFormulario(false);
              setColorEditando(null);
            } catch (error) {
              console.error('Error al guardar color:', error);
              // Aquí podrías mostrar un toast de error
            }
          }}
        />
      )}
    </AdminPageLayout>
  );
}

// ======================================================
// Tarjeta de color
// ======================================================
function ColorCard({ color, onEdit }) {
  const getContrastColor = (hex) => {
    if (!hex) return "#000";
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5
      ? "#000"
      : "#fff";
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white dark:bg-gray-800">
      <div
        className="h-24 flex items-center justify-center"
        style={{
          backgroundColor: color.codigoHex || "#ccc",
          color: getContrastColor(color.codigoHex),
        }}
      >
        <div className="text-center font-semibold">
          {color.nombreColor}
          <div className="text-xs font-mono opacity-80">
            {color.codigoHex}
          </div>
        </div>
      </div>

      <div className="p-4 flex justify-end gap-2 border-t">
        <IconButton title="Editar" onClick={onEdit}>
          <FiEdit />
        </IconButton>
        <IconButton title="Eliminar" danger>
          <FiTrash2 />
        </IconButton>
      </div>
    </div>
  );
}

// ======================================================
// Componentes auxiliares
// ======================================================
function IconButton({ children, danger, ...props }) {
  return (
    <button
      {...props}
      className={`p-2 rounded-lg ${
        danger
          ? "text-red-600 hover:bg-red-100"
          : "text-gray-600 hover:bg-gray-200"
      }`}
    >
      {children}
    </button>
  );
}

// ======================================================
// Modal de formulario de color
// ======================================================
function ColorFormModal({ color, onClose, onSave }) {
  const [formData, setFormData] = useState({
    nombreColor: color?.nombreColor || '',
    codigoHex: color?.codigoHex || '#000000',
    estado: color?.estado || 'activo'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombreColor.trim()) return;

    setLoading(true);
    try {
      await onSave(formData);
    } finally {
      setLoading(false);
    }
  };

  const coloresPredefinidos = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
    '#FFC0CB', '#A52A2A', '#808080', '#000080', '#008000',
    '#FF4500', '#DC143C', '#4169E1', '#32CD32', '#FFD700'
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-gray-100">
            {color ? "Editar Color" : "Nuevo Color"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre del color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre del Color *
              </label>
              <input
                type="text"
                value={formData.nombreColor}
                onChange={(e) => setFormData(prev => ({ ...prev, nombreColor: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500"
                placeholder="Ej: Rojo Carmín"
                required
              />
            </div>

            {/* Selector de color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Color
              </label>

              {/* Input de color HTML5 */}
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="color"
                  value={formData.codigoHex}
                  onChange={(e) => setFormData(prev => ({ ...prev, codigoHex: e.target.value }))}
                  className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.codigoHex}
                  onChange={(e) => setFormData(prev => ({ ...prev, codigoHex: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm"
                  placeholder="#000000"
                />
              </div>

              {/* Paleta de colores predefinidos */}
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Colores populares:</p>
                <div className="grid grid-cols-10 gap-1">
                  {coloresPredefinidos.map((colorHex) => (
                    <button
                      key={colorHex}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, codigoHex: colorHex }))}
                      className="w-6 h-6 rounded border-2 border-white dark:border-gray-600 shadow-sm hover:scale-110 transition-transform"
                      style={{ backgroundColor: colorHex }}
                      title={colorHex}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estado
              </label>
              <select
                value={formData.estado}
                onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500"
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>

            {/* Vista previa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Vista Previa
              </label>
              <div
                className="w-full h-16 rounded-lg border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center text-white font-semibold"
                style={{ backgroundColor: formData.codigoHex }}
              >
                {formData.nombreColor || 'Nombre del Color'}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || !formData.nombreColor.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-gray-100 dark:text-gray-900 rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}
