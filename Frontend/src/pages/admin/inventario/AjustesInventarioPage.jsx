import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Archive,
  Search,
  Edit,
  Trash2,
  Plus,
  Minus,
  RefreshCcw,
  Filter,
  X,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Loader2,
  MoreVertical,
  Play,
  StopCircle,
  Eye,
  FileText,
  Package,
  Image as ImageIcon,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Users,
  Building,
  Calendar,
  StickyNote,
  Check,
  ChevronRight,
  ChevronLeft,
  Layers,
  ArrowRight
} from 'lucide-react';
import * as ajustesInventarioApi from '../../../api/ajustesInventarioApi';
import * as tiposMovimientoApi from '../../../api/tiposMovimientoApi';
import * as inventarioApi from '../../../api/inventarioApi';
import { useAuth } from "../../../context/AuthContext";
import { motion, AnimatePresence } from 'framer-motion';
import { Select, Tag, Input, Button, Table, InputNumber, message, Card, Avatar, Badge, Progress, Modal, Form, DatePicker, Divider, Row, Col, Space, Tooltip } from 'antd';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';
import getImagenURL from '../../../utils/imageUrl';

export default function AjustesInventarioPage() {
  const navigate = useNavigate();
  const { token } = useAuth();

  // Función helper para construir URLs de imágenes
  const getImagenUrl = (path) => {
    if (!path) return '/placeholder.png';
    return getImagenURL(path) || '/placeholder.png';
  };

  // Helpers para extraer rutas de imágenes desde la estructura de Prisma
  const getProductoImagen = (producto) => {
    if (!producto || !producto.imagenes || !Array.isArray(producto.imagenes)) return null;
    const principal = producto.imagenes.find(img => img.esPrincipal);
    return principal ? principal.rutaImagen : (producto.imagenes[0]?.rutaImagen || null);
  };

  const getVarianteImagen = (variante) => {
    if (!variante) return null;
    // Primero intentar imagen propia de la variante
    if (variante.imagenesVariantes && Array.isArray(variante.imagenesVariantes) && variante.imagenesVariantes.length > 0) {
      const principal = variante.imagenesVariantes.find(img => img.esPrincipal);
      return principal ? principal.rutaImagen : variante.imagenesVariantes[0].rutaImagen;
    }
    // Si no tiene, usar la del producto padre
    return getProductoImagen(variante.producto);
  };

  // Estados principales
  const [ajustes, setAjustes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados de paginación y filtros
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    estado: '',
    idTipoMovimiento: '',
    buscar: ''
  });

  // Estados de UI
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedAjuste, setSelectedAjuste] = useState(null);
  const [currentStep, setCurrentStep] = useState(1); // Para el flujo paso a paso

  // Estados para datos auxiliares
  const [tiposMovimiento, setTiposMovimiento] = useState([]);
  const [variantes, setVariantes] = useState([]);

  // Estados del formulario de ajuste (flujo paso a paso)
  const [ajusteForm, setAjusteForm] = useState({
    idTipoMovimiento: '',
    motivo: '',
    observaciones: '',
    fechaAjuste: dayjs()
  });
  const [detalleAjustes, setDetalleAjustes] = useState([]);
  const [selectedVariantes, setSelectedVariantes] = useState([]);
  const [searchStep2, setSearchStep2] = useState('');
  const [selectedProductForAjuste, setSelectedProductForAjuste] = useState(null);

  // Cargar datos iniciales
  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ajustesRes, tiposRes, variantesRes] = await Promise.all([
        ajustesInventarioApi.obtenerAjustes({
          page: pagination.page,
          limit: pagination.limit,
          ...filters
        }),
        tiposMovimientoApi.obtenerTodosLosTiposMovimiento(),
        inventarioApi.obtenerStockActual().catch(err => {
          console.error('Error cargando variantes:', err);
          console.error('Detalles del error:', err.response?.data);
          return { datos: { datos: [] } }; // fallback con estructura correcta
        })
      ]);


      setAjustes(Array.isArray(ajustesRes?.datos?.datos) ? ajustesRes.datos.datos : []);
      setPagination(prev => ({
        ...prev,
        total: ajustesRes?.datos?.paginacion?.totalRegistros || 0,
        totalPages: ajustesRes?.datos?.paginacion?.totalPaginas || 0
      }));
      setTiposMovimiento(Array.isArray(tiposRes?.datos?.datos) ? tiposRes.datos.datos :
                         Array.isArray(tiposRes?.datos) ? tiposRes.datos : []);
      setVariantes(Array.isArray(variantesRes?.datos?.datos) ? variantesRes.datos.datos : []);
    } catch (err) {
      console.error('Error al cargar ajustes de inventario:', err);
      setError(err.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Manejo de filtros
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      estado: '',
      idTipoMovimiento: '',
      buscar: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Manejo del formulario y modal
  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    resetAjusteFlow();
  };

  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
    resetAjusteFlow();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Funciones para el flujo de ajuste
  const resetAjusteFlow = () => {
    setAjusteForm({
      idTipoMovimiento: '',
      motivo: '',
      observaciones: '',
      fechaAjuste: dayjs()
    });
    setDetalleAjustes([]);
    setSelectedVariantes([]);
    setSearchStep2('');
    setSelectedProductForAjuste(null);
    setCurrentStep(1);
  };

  const getTipoActual = () => {
    return tiposMovimiento.find(t => t.idTipoMovimiento === ajusteForm.idTipoMovimiento)?.tipo || 'entrada';
  };

  const calcularNuevoStock = (stockAnterior, cantidadAjuste, tipo) => {
    const ant = Number(stockAnterior) || 0;
    const aju = Number(cantidadAjuste) || 0;
    
    if (tipo === 'entrada') return ant + aju;
    if (tipo === 'salida') return ant - aju;
    if (tipo === 'ajuste') return aju; // Conteo físico directo
    return ant + aju;
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Funciones para manejar variantes seleccionadas
  const toggleVarianteSeleccion = (variante) => {
    const exists = selectedVariantes.find(v => v.idVariante === variante.idVariante);
    if (exists) {
      setSelectedVariantes(prev => prev.filter(v => v.idVariante !== variante.idVariante));
      setDetalleAjustes(prev => prev.filter(d => d.idVariante !== variante.idVariante));
    } else {
      const nuevaVariante = {
        ...variante,
        cantidadAjuste: 0,
        observaciones: ''
      };
      setSelectedVariantes(prev => [...prev, nuevaVariante]);
      setDetalleAjustes(prev => [...prev, {
        idVariante: variante.idVariante,
        cantidadAjuste: 0,
        observaciones: ''
      }]);
    }
  };

  const actualizarCantidadAjuste = (idVariante, cantidad) => {
    setDetalleAjustes(prev => prev.map(detalle =>
      detalle.idVariante === idVariante
        ? { ...detalle, cantidadAjuste: cantidad }
        : detalle
    ));
  };

  const actualizarObservaciones = (idVariante, observaciones) => {
    setDetalleAjustes(prev => prev.map(detalle =>
      detalle.idVariante === idVariante
        ? { ...detalle, observaciones }
        : detalle
    ));
  };

  // CRUD Operations
  const handleCreate = async () => {
    try {
      // Validaciones del paso 4 (resumen)
      if (!ajusteForm.idTipoMovimiento || !ajusteForm.motivo) {
        message.error('Debe completar tipo de movimiento y motivo');
        return;
      }

      if (!detalleAjustes.length) {
        message.error('Debe seleccionar al menos un producto para ajustar');
        return;
      }

      // Validar que todos los detalles tienen cantidad diferente de cero
      const detallesInvalidos = detalleAjustes.filter(d =>
        d.cantidadAjuste === 0 || d.cantidadAjuste === null || d.cantidadAjuste === undefined
      );
      if (detallesInvalidos.length > 0) {
        message.error('Todos los productos seleccionados deben tener una cantidad de ajuste diferente de cero');
        return;
      }

      // Asegurar que los datos tienen el formato correcto
      const detalleAjustesFormateados = detalleAjustes.map(detalle => ({
        idVariante: Number(detalle.idVariante),
        cantidadAjuste: Number(detalle.cantidadAjuste)
      }));

      const dataToSend = {
        idTipoMovimiento: Number(ajusteForm.idTipoMovimiento),
        motivo: ajusteForm.motivo.trim(),
        detalleAjustes: detalleAjustesFormateados
      };

      console.log('Datos a enviar al backend:', JSON.stringify(dataToSend, null, 2));

      await ajustesInventarioApi.crearAjusteBorrador(dataToSend);
      setShowCreateModal(false);
      resetAjusteFlow();
      cargarDatos();
      
      Swal.fire({
        icon: 'success',
        title: 'Borrador Guardado',
        text: 'La operación ha sido registrada exitosamente para auditoría.',
        timer: 2000,
        showConfirmButton: false,
        background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#fff',
        color: document.documentElement.classList.contains('dark') ? '#fff' : '#000'
      });
    } catch (err) {
      console.error('Error al crear ajuste borrador:', err);
      const errorMessage = err.response?.data?.mensaje || err.message || 'Error al crear el ajuste';
      Swal.fire({
        icon: 'error',
        title: 'Error en Creación',
        text: errorMessage,
        background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#fff',
        color: document.documentElement.classList.contains('dark') ? '#fff' : '#000'
      });
    }
  };

  const handleAplicarAjuste = async (idAjuste) => {
    const result = await Swal.fire({
      title: '¿Ejecutar Sincronización?',
      text: "Esta acción modificará el stock actual de forma definitiva en el inventario real.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Sí, sincronizar stock',
      cancelButtonText: 'Cancelar',
      background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#fff',
      color: document.documentElement.classList.contains('dark') ? '#fff' : '#000'
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        await ajustesInventarioApi.aplicarAjuste(idAjuste);
        await cargarDatos();
        
        Swal.fire({
          icon: 'success',
          title: '¡Operación Exitosa!',
          text: 'El inventario ha sido actualizado correctamente.',
          timer: 2000,
          showConfirmButton: false,
          background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#fff',
          color: document.documentElement.classList.contains('dark') ? '#fff' : '#000'
        });
      } catch (err) {
        console.error('Error al aplicar ajuste:', err);
        const errorMessage = err.response?.data?.mensaje || err.message || 'Error al aplicar el ajuste';
        Swal.fire({
          icon: 'error',
          title: 'Error de Sincronización',
          text: errorMessage,
          background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#fff',
          color: document.documentElement.classList.contains('dark') ? '#fff' : '#000'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCancelarAjuste = async (idAjuste) => {
    const result = await Swal.fire({
      title: '¿Anular Operación?',
      text: "El borrador será cancelado y no podrá ser utilizado para futuras sincronizaciones.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, anular borrador',
      cancelButtonText: 'Volver',
      background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#fff',
      color: document.documentElement.classList.contains('dark') ? '#fff' : '#000'
    });

    if (result.isConfirmed) {
      try {
        await ajustesInventarioApi.cancelarAjuste(idAjuste);
        cargarDatos();
        Swal.fire({
          icon: 'success',
          title: 'Ajuste Anulado',
          text: 'El borrador ha sido cancelado correctamente.',
          timer: 1500,
          showConfirmButton: false,
          background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#fff',
          color: document.documentElement.classList.contains('dark') ? '#fff' : '#000'
        });
      } catch (err) {
        console.error('Error al cancelar ajuste:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error al anular',
          text: err.response?.data?.mensaje || err.message,
          background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#fff',
          color: document.documentElement.classList.contains('dark') ? '#fff' : '#000'
        });
      }
    }
  };

  const handleViewAjuste = async (ajuste) => {
    setSelectedAjuste(ajuste);
    setShowEditModal(true);
  };

  // UI Helpers
  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'borrador':
        return { color: 'yellow', icon: Clock, text: 'Borrador' };
      case 'aplicado':
        return { color: 'green', icon: CheckCircle, text: 'Aplicado' };
      case 'cancelado':
        return { color: 'red', icon: XCircle, text: 'Cancelado' };
      default:
        return { color: 'gray', icon: FileText, text: estado };
    }
  };

  const Badge = ({ children, className, color = 'blue' }) => (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-${color}-50 text-${color}-700 border border-${color}-100 ${className}`}>
      {children}
    </span>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 p-4 md:p-8 lg:p-10 space-y-8 transition-colors duration-300">

      {/* Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Ajustes de Inventario</h1>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400 rounded-full text-[10px] font-bold uppercase tracking-widest border border-indigo-200 dark:border-indigo-800">Control de Stock</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-base font-medium">Gestiona ajustes de stock con control de versiones borrador/aplicado.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleOpenCreateModal}
          className="bg-indigo-600 text-white px-8 py-4 rounded-[1.5rem] hover:bg-indigo-700 shadow-xl shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-3 font-bold text-base"
        >
          <Plus className="w-5 h-5" />
          Nuevo Ajuste en Borrador
        </motion.button>
      </div>

      {/* Toolbar & Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-300">
        <div className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-gray-50 dark:border-gray-800">
          <div className="flex items-center gap-3 w-full lg:w-auto flex-1">
            <div className="relative flex-1 max-w-lg group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder="Buscar por número, motivo..."
                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium dark:text-gray-200"
                value={filters.buscar}
                onChange={(e) => handleFilterChange('buscar', e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 rounded-xl border transition-all duration-300 ${showFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-400' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:hover:bg-gray-800'}`}
            >
              <Filter className="w-4 h-4" />
            </button>
            {(filters.estado || filters.idTipoMovimiento || filters.buscar) && (
              <button onClick={clearFilters} className="text-xs text-rose-500 hover:text-rose-600 font-bold uppercase tracking-wider ml-2">
                Limpiar
              </button>
            )}
          </div>
          <button
            onClick={cargarDatos}
            className="p-3 bg-gray-50 dark:bg-gray-800/50 text-gray-400 hover:text-indigo-600 rounded-xl transition-all border border-gray-100 dark:border-gray-700"
            title="Actualizar tabla"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-6 bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-50 dark:border-gray-800"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Estado del Ajuste</span>
                  <Select
                    placeholder="Filtrar por estado"
                    value={filters.estado || undefined}
                    onChange={(value) => handleFilterChange('estado', value)}
                    className="w-full dark-select"
                    size="large"
                    allowClear
                  >
                    <Select.Option value="borrador">Borrador</Select.Option>
                    <Select.Option value="aplicado">Aplicado</Select.Option>
                    <Select.Option value="cancelado">Cancelado</Select.Option>
                  </Select>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Tipo de Movimiento</span>
                  <Select
                    placeholder="Filtrar por movimiento"
                    value={filters.idTipoMovimiento || undefined}
                    onChange={(value) => handleFilterChange('idTipoMovimiento', value)}
                    className="w-full dark-select"
                    size="large"
                    allowClear
                    showSearch
                    optionFilterProp="children"
                  >
                    {Array.isArray(tiposMovimiento) ? tiposMovimiento.filter(tipo => tipo.activo).map(tipo => (
                      <Select.Option key={tipo.idTipoMovimiento} value={tipo.idTipoMovimiento}>
                        <div className="flex items-center justify-between w-full">
                          <span className="font-semibold">{tipo.nombreTipo}</span>
                          <Tag
                            color={tipo.tipo === 'entrada' ? 'green' : 'orange'}
                            className="text-[10px] font-bold uppercase rounded-md m-0"
                          >
                            {tipo.tipo}
                          </Tag>
                        </div>
                      </Select.Option>
                    )) : null}
                  </Select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-0 overflow-hidden dark-table-container">
          <Table
            dataSource={Array.isArray(ajustes) ? ajustes : []}
            loading={loading}
            rowKey="idAjuste"
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => (
                <span className="text-gray-500 dark:text-gray-400 text-xs font-medium">
                  {range[0]}-{range[1]} de {total} ajustes
                </span>
              ),
              onChange: (page, pageSize) => {
                setPagination(prev => ({ ...prev, page, limit: pageSize }));
              }
            }}
            columns={[
              {
                title: 'Expediente',
                dataIndex: 'numeroAjuste',
                key: 'numeroAjuste',
                render: (numero, record) => (
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                      <FileText size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-gray-900 dark:text-gray-100">{numero}</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
                        <Package size={10} />
                        {record.detalleAjustes?.length || 0} variante{(record.detalleAjustes?.length || 0) !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                ),
                width: 220
              },
              {
                title: 'Tipo de Operación',
                dataIndex: ['tipoMovimiento', 'nombreTipo'],
                key: 'tipoMovimiento',
                render: (nombre, record) => (
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{nombre}</span>
                    <Tag
                      color={record.tipoMovimiento?.tipo === 'entrada' ? 'green' : 'orange'}
                      className="w-fit text-[9px] font-bold uppercase rounded-md px-1.5 border-none dark:bg-opacity-20"
                      icon={record.tipoMovimiento?.tipo === 'entrada' ? <TrendingUp size={10} className="mb-0.5" /> : <TrendingDown size={10} className="mb-0.5" />}
                    >
                      {record.tipoMovimiento?.tipo}
                    </Tag>
                  </div>
                ),
                width: 180
              },
              {
                title: 'Estado',
                dataIndex: 'estado',
                key: 'estado',
                render: (estado) => {
                  const CONFIG = {
                    borrador: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-100 dark:border-amber-800', icon: Clock, label: 'Borrador' },
                    aplicado: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-800', icon: CheckCircle, label: 'Aplicado' },
                    cancelado: { bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-100 dark:border-rose-800', icon: XCircle, label: 'Cancelado' }
                  };
                  const cfg = CONFIG[estado] || CONFIG.borrador;
                  const Icon = cfg.icon;
  
                  return (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${cfg.bg} ${cfg.text} ${cfg.border} text-[10px] font-bold uppercase tracking-wider`}>
                      <Icon size={12} />
                      {cfg.label}
                    </span>
                  );
                },
                width: 140
              },
              {
                title: 'Fecha Registro',
                dataIndex: 'fechaAjuste',
                key: 'fechaAjuste',
                render: (fecha) => (
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{dayjs(fecha).format('DD/MM/YYYY')}</span>
                    <span className="text-[10px] text-gray-400 font-bold">{dayjs(fecha).format('HH:mm A')}</span>
                  </div>
                ),
                width: 160
              },
              {
                title: 'Autorizado Por',
                dataIndex: ['usuarioRegistroRef', 'nombres'],
                key: 'usuario',
                render: (nombres, record) => (
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-500 font-bold text-xs border border-gray-200 dark:border-gray-700">
                      {nombres?.charAt(0)}
                    </div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{nombres} {record.usuarioRegistroRef?.apellidos}</span>
                  </div>
                ),
                width: 180
              },
              {
                title: 'Motivo',
                dataIndex: 'motivo',
                key: 'motivo',
                ellipsis: true,
                render: (motivo) => (
                  <Tooltip title={motivo}>
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium italic">"{motivo}"</span>
                  </Tooltip>
                )
              },
              {
                title: 'Acciones',
                key: 'acciones',
                render: (_, record) => (
                  <div className="flex items-center gap-1">
                    <Tooltip title="Explorar detalles">
                      <button
                        onClick={() => handleViewAjuste(record)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 rounded-xl transition-all"
                      >
                        <Eye size={18} />
                      </button>
                    </Tooltip>
  
                    {record.estado === 'borrador' && (
                      <>
                        <Tooltip title="Ejecutar Ajuste">
                          <button
                            onClick={() => handleAplicarAjuste(record.idAjuste)}
                            className="p-2 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 rounded-xl transition-all"
                          >
                            <Play size={18} />
                          </button>
                        </Tooltip>
  
                        <Tooltip title="Anular Operación">
                          <button
                            onClick={() => handleCancelarAjuste(record.idAjuste)}
                            className="p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/40 rounded-xl transition-all"
                          >
                            <StopCircle size={18} />
                          </button>
                        </Tooltip>
                      </>
                    )}
  
                    {record.estado === 'aplicado' && (
                      <Tooltip title="Rastreo de Movimientos">
                        <button
                          onClick={() => navigate(`/admin/inventario/movimientos?idAjuste=${record.idAjuste}`)}
                          className="p-2 text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 rounded-xl transition-all"
                        >
                          <BarChart3 size={18} />
                        </button>
                      </Tooltip>
                    )}
                  </div>
                ),
                width: 160,
                fixed: 'right'
              }
            ]}
            scroll={{ x: 1200 }}
            size="large"
            className="premium-table"
          />
        </div>
      </div>

        {/* Estado vacío */}
        {Array.isArray(ajustes) && ajustes.length === 0 && !loading && (
          <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-[3rem] border-4 border-dashed border-gray-100 dark:border-gray-800 mx-auto max-w-4xl">
            <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300 dark:text-gray-600">
               <Archive size={48} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Sin ajustes registrados</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-sm mx-auto font-medium leading-relaxed">
              Los ajustes de inventario te permiten sincronizar el stock real con el sistema de manera auditada.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOpenCreateModal}
              className="mt-8 px-8 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Crear primer ajuste
            </motion.button>
          </div>
        )}

        {/* Modal de detalles del ajuste */}
        <Modal
          title={
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                 <Eye size={22} />
              </div>
              <span className="font-bold text-gray-900 dark:text-white">Expediente de Ajuste</span>
            </div>
          }
          open={showEditModal}
          onCancel={() => setShowEditModal(false)}
          footer={null}
          width={850}
          className="premium-modal dark:bg-gray-900"
          centered
        >
          {selectedAjuste && (
            <div className="space-y-8 py-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-gray-50 dark:bg-gray-800/40 rounded-3xl border border-gray-100 dark:border-gray-800">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Número de Ajuste</label>
                  <div className="text-base font-bold text-indigo-600 dark:text-indigo-400">{selectedAjuste.numeroAjuste}</div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Estado Operativo</label>
                  <div className="mt-1">
                    {(() => {
                        const CONFIG = {
                            borrador: { bg: 'bg-amber-100/50 text-amber-600', label: 'Borrador' },
                            aplicado: { bg: 'bg-emerald-100/50 text-emerald-600', label: 'Aplicado' },
                            cancelado: { bg: 'bg-rose-100/50 text-rose-600', label: 'Anulado' }
                        };
                        const cfg = CONFIG[selectedAjuste.estado] || CONFIG.borrador;
                        return (
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${cfg.bg}`}>
                                {cfg.label}
                            </span>
                        );
                    })()}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Tipo de Movimiento</label>
                  <div className="mt-1">
                    <Tag color={selectedAjuste.tipoMovimiento?.tipo === 'entrada' ? 'green' : 'orange'} className="rounded-md border-none font-bold text-[10px] uppercase m-0">
                      {selectedAjuste.tipoMovimiento?.nombreTipo}
                    </Tag>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Fecha Registro</label>
                  <div className="text-sm font-semibold dark:text-gray-300">{dayjs(selectedAjuste.fechaAjuste).format('DD/MM/YYYY HH:mm')}</div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1 ml-4">Justificación de la Operación</label>
                <div className="mt-1 p-5 bg-gray-50 dark:bg-gray-800/40 rounded-3xl border border-gray-100 dark:border-gray-800 text-sm font-medium text-gray-600 dark:text-gray-400 italic">
                  "{selectedAjuste.motivo}"
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block ml-4">Matriz de Productos Ajustados</label>
                <Table
                  dataSource={selectedAjuste.detalleAjustes?.map(detalle => {
                    const tipo = selectedAjuste.tipoMovimiento?.tipo || 'entrada';
                    const stockAnterior = Number(detalle.stockAnterior) || 0;
                    
                    // Si ya está aplicado, usamos stockNuevo guardado. 
                    // Si es borrador, proyectamos según el tipo.
                    let stockNuevo = Number(detalle.stockNuevo) || 0;
                    if (selectedAjuste.estado === 'borrador') {
                      stockNuevo = calcularNuevoStock(stockAnterior, detalle.cantidadAjuste, tipo);
                    }
                    
                    const delta = tipo === 'ajuste' ? (stockNuevo - stockAnterior) : 
                                 tipo === 'salida' ? -Number(detalle.cantidadAjuste) : 
                                 Number(detalle.cantidadAjuste);

                    return {
                      key: detalle.idDetalleAjuste,
                      producto: detalle.variante?.producto?.nombreProducto,
                      variante: `${detalle.variante?.color?.nombreColor} - ${detalle.variante?.talla?.nombreTalla}`,
                      sku: detalle.variante?.codigoSku,
                      delta,
                      stockAnterior,
                      stockNuevo,
                      observaciones: detalle.observaciones,
                      varianteData: detalle.variante
                    };
                  })}
                  columns={[
                    {
                      title: 'Producto',
                      dataIndex: 'producto',
                      render: (producto, record) => (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 dark:border-gray-700">
                             <img 
                                src={getImagenUrl(getVarianteImagen(record.varianteData))} 
                                alt="P" 
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.src = '/placeholder.png'; }}
                             />
                          </div>
                          <div>
                            <div className="font-bold text-xs text-gray-900 dark:text-white leading-tight">{producto}</div>
                            <div className="text-[10px] text-gray-400 font-bold">{record.variante}</div>
                          </div>
                        </div>
                      )
                    },
                    { 
                        title: 'SKU', 
                        dataIndex: 'sku', 
                        width: 120,
                        render: (sku) => <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/40 px-2 py-0.5 rounded-md">{sku}</span>
                    },
                    {
                      title: 'Impacto',
                      dataIndex: 'delta',
                      render: (value) => (
                        <span className={`text-xs font-bold ${value > 0 ? 'text-emerald-500' : value < 0 ? 'text-rose-500' : 'text-gray-400'}`}>
                          {value > 0 ? '+' : ''}{value}
                        </span>
                      ),
                      width: 80
                    },
                    { 
                        title: 'Ant / Proyectado', 
                        key: 'stocks', 
                        render: (_, record) => (
                            <div className="flex items-center gap-2 text-[10px] font-bold">
                                <span className="text-gray-400">{record.stockAnterior}</span>
                                <ArrowRight size={10} className="text-gray-300" />
                                <span className={record.stockNuevo < 0 ? 'text-rose-500' : 'text-gray-900 dark:text-white'}>
                                  {record.stockNuevo}
                                </span>
                            </div>
                        ),
                        width: 120 
                    },
                    { 
                        title: 'Nota', 
                        dataIndex: 'observaciones', 
                        ellipsis: true,
                        render: (obs) => obs ? <Tooltip title={obs}><span className="text-[10px] italic text-gray-400">{obs}</span></Tooltip> : <span className="text-[10px] text-gray-300">-</span>
                    }
                  ]}
                  pagination={false}
                  size="small"
                  className="premium-table-compact"
                />
              </div>

              {selectedAjuste.estado === 'borrador' && (
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-200"
                  >
                    Salir
                  </button>
                  <button
                    onClick={() => {
                        handleCancelarAjuste(selectedAjuste.idAjuste);
                        setShowEditModal(false);
                    }}
                    className="px-6 py-2.5 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl font-bold text-sm hover:bg-rose-100"
                  >
                    Anular Ajuste
                  </button>
                  <button
                    onClick={() => {
                        handleAplicarAjuste(selectedAjuste.idAjuste);
                        setShowEditModal(false);
                    }}
                    className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-100 dark:shadow-none"
                  >
                    Ejecutar y Sincronizar Stock
                  </button>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Modal Crear Ajuste - Flujo Paso a Paso */}
        <Modal
          title={
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                 <Archive size={22} />
              </div>
              <span className="font-bold text-gray-900 dark:text-white">Nueva Operación de Stock</span>
            </div>
          }
          open={showCreateModal}
          onCancel={handleCloseCreateModal}
          footer={null}
          width={950}
          className="premium-modal dark:bg-gray-950"
          centered
          destroyOnHidden
        >
          {/* Indicador de progreso */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step}
                  </div>
                  {step < 4 && (
                    <div className={`w-12 h-0.5 mx-2 ${
                      currentStep > step ? 'bg-indigo-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>Información General</span>
              <span>Seleccionar Productos</span>
              <span>Configurar Cantidades</span>
              <span>Resumen y Confirmación</span>
            </div>
          </div>

          {/* Contenido del paso actual */}
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="p-8 bg-gray-50 dark:bg-gray-800/40 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 space-y-8">
                  <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                     <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                     <h3 className="font-bold text-lg text-gray-900 dark:text-white tracking-tight">Parámetros de Auditoría</h3>
                  </div>

                  <Row gutter={[24, 24]}>
                    <Col span={24} md={14}>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block ml-2">
                          Tipo de Movimiento <span className="text-rose-500">*</span>
                        </label>
                        <Select
                          placeholder="Fines de la operación..."
                          value={ajusteForm.idTipoMovimiento || undefined}
                          onChange={(value) => setAjusteForm(prev => ({ ...prev, idTipoMovimiento: value }))}
                          className="w-full premium-select dark-select"
                          size="large"
                          showSearch
                          optionFilterProp="children"
                        >
                          {Array.isArray(tiposMovimiento) ? tiposMovimiento.filter(tipo => tipo.activo).map(tipo => (
                            <Select.Option key={tipo.idTipoMovimiento} value={tipo.idTipoMovimiento}>
                              <div className="flex flex-col py-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-sm text-gray-800 dark:text-gray-200">{tipo.nombreTipo}</span>
                                  <Tag
                                    color={tipo.tipo === 'entrada' ? 'green' : 'orange'}
                                    className="rounded-md font-bold text-[9px] uppercase border-none"
                                  >
                                    {tipo.tipo}
                                  </Tag>
                                </div>
                                <span className="text-[10px] text-gray-400 font-medium italic mt-0.5 leading-none">
                                  {tipo.descripcion}
                                </span>
                              </div>
                            </Select.Option>
                          )) : null}
                        </Select>
                      </div>
                    </Col>
                    <Col span={24} md={10}>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block ml-2">
                          Fecha Programada
                        </label>
                        <DatePicker
                          value={ajusteForm.fechaAjuste}
                          onChange={(date) => setAjusteForm(prev => ({ ...prev, fechaAjuste: date }))}
                          className="w-full premium-datepicker shadow-sm dark:bg-gray-800 dark:border-gray-700"
                          size="large"
                          format="DD [de] MMMM, YYYY"
                          allowClear={false}
                        />
                      </div>
                    </Col>
                  </Row>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block ml-2">
                      Justificación de la Operación <span className="text-rose-500">*</span>
                    </label>
                    <Input.TextArea
                      value={ajusteForm.motivo}
                      onChange={(e) => setAjusteForm(prev => ({ ...prev, motivo: e.target.value }))}
                      rows={3}
                      placeholder="Ej: Corrección de stock físico tras inventario cíclico o detección de merma..."
                      className="resize-none !rounded-3xl !p-5 !bg-white dark:!bg-gray-800 !border-gray-100 dark:!border-gray-700 shadow-sm focus:!ring-4 focus:!ring-indigo-500/10 transition-all font-medium text-sm"
                    />
                  </div>

                  <div className="space-y-2 opacity-70">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block ml-2">
                      Notas de Seguimiento Interno
                    </label>
                    <Input.TextArea
                      value={ajusteForm.observaciones}
                      onChange={(e) => setAjusteForm(prev => ({ ...prev, observaciones: e.target.value }))}
                      rows={2}
                      placeholder="Detalles técnicos u observaciones de auditoría (opcional)..."
                      className="resize-none !rounded-[1.5rem] !p-4 !bg-white dark:!bg-gray-800 !border-gray-100 dark:!border-gray-700 shadow-sm transition-all text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="primary"
                    onClick={nextStep}
                    disabled={!ajusteForm.idTipoMovimiento || !ajusteForm.motivo}
                    size="large"
                  >
                    Siguiente <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="p-6 bg-gray-50 dark:bg-gray-800/40 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700/50 pb-4">
                    <div className="flex items-center gap-3">
                      {selectedProductForAjuste ? (
                        <button 
                          onClick={() => setSelectedProductForAjuste(null)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl border border-gray-200 dark:border-gray-600 text-[10px] font-bold uppercase transition-all hover:bg-gray-50"
                        >
                          <ChevronLeft size={14} /> Volver
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                           <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                           <h3 className="font-bold text-lg text-gray-900 dark:text-white tracking-tight">Seleccionar Productos</h3>
                        </div>
                      )}
                      {selectedProductForAjuste && (
                        <span className="text-indigo-500 dark:text-indigo-400 font-bold text-sm tracking-tight">/ {selectedProductForAjuste.nombreProducto}</span>
                      )}
                    </div>
                    <div className="relative group">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                      <input
                        placeholder="Filtrar catálogo..."
                        className="pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-[1rem] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs font-medium dark:text-gray-200"
                        value={searchStep2}
                        onChange={(e) => setSearchStep2(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[480px] overflow-y-auto pr-2 premium-scrollbar p-2">
                    {!selectedProductForAjuste ? (
                      // Vista de Productos Agrupados
                      (() => {
                        const productosUnicos = Array.isArray(variantes) ? Array.from(
                          variantes.reduce((map, v) => {
                            if (!v.producto) return map;
                            if (!map.has(v.idProducto)) {
                              map.set(v.idProducto, v.producto);
                            }
                            return map;
                          }, new Map()).values()
                        ) : [];

                        const filteredProductos = productosUnicos.filter(p => 
                          p.nombreProducto?.toLowerCase().includes(searchStep2.toLowerCase()) ||
                          p.codigoReferencia?.toLowerCase().includes(searchStep2.toLowerCase())
                        );

                        return filteredProductos.length > 0 ? filteredProductos.map((prod) => (
                          <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            key={prod.idProducto}
                            className="group cursor-pointer bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all"
                            onClick={() => {
                              setSelectedProductForAjuste(prod);
                              setSearchStep2('');
                            }}
                          >
                            <div className="flex items-center gap-4">
                              <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 flex-shrink-0">
                                <img
                                  src={getImagenUrl(getProductoImagen(prod))}
                                  alt={prod.nombreProducto}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                  onError={(e) => { e.target.src = '/placeholder.png'; }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate group-hover:text-indigo-600 transition-colors leading-tight">
                                  {prod.nombreProducto}
                                </h4>
                                <div className="flex flex-col gap-1.5 mt-2">
                                  <span className="text-[9px] font-bold text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-lg w-fit uppercase border border-indigo-100 dark:border-indigo-800">
                                    REF: {prod.codigoReferencia}
                                  </span>
                                  <div className="flex items-center gap-1.5 text-gray-400">
                                     <Layers size={10} />
                                     <span className="text-[10px] font-bold uppercase tracking-tighter">
                                        {variantes.filter(v => v.idProducto === prod.idProducto).length} variantes
                                     </span>
                                  </div>
                                </div>
                              </div>
                              <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-indigo-500 transform group-hover:translate-x-1 transition-all" />
                            </div>
                          </motion.div>
                        )) : (
                          <div className="col-span-full py-20 text-center">
                            <Package className="w-16 h-16 mx-auto mb-4 text-gray-200 dark:text-gray-700" />
                            <p className="font-bold text-gray-400 dark:text-gray-600 uppercase text-xs tracking-widest">No se encontraron productos en el catálogo</p>
                          </div>
                        );
                      })()
                    ) : (
                      // Vista de Variantes de un Producto
                      (() => {
                        const variantesDelProducto = variantes.filter(v => 
                          v.idProducto === selectedProductForAjuste.idProducto &&
                          (
                            v.codigoSku?.toLowerCase().includes(searchStep2.toLowerCase()) ||
                            v.color?.nombreColor?.toLowerCase().includes(searchStep2.toLowerCase()) ||
                            v.talla?.nombreTalla?.toLowerCase().includes(searchStep2.toLowerCase())
                          )
                        );

                        return variantesDelProducto.length > 0 ? variantesDelProducto.map((variante) => {
                          const isSelected = selectedVariantes.some(v => v.idVariante === variante.idVariante);
                          const imagenUrl = getImagenUrl(getVarianteImagen(variante));

                          return (
                            <motion.div
                              layout
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              key={variante.idVariante}
                              className={`cursor-pointer group bg-white dark:bg-gray-800 p-4 rounded-3xl border-2 transition-all ${
                                isSelected 
                                  ? 'border-indigo-500 ring-4 ring-indigo-500/10' 
                                  : 'border-gray-50 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-500/30'
                              }`}
                              onClick={() => toggleVarianteSeleccion(variante)}
                            >
                              <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                  <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 shadow-inner">
                                    <img 
                                      src={imagenUrl} 
                                      alt="V" 
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                      onError={(e) => { e.target.src = '/placeholder.png'; }}
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0 pt-1">
                                    <div className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-1 leading-none">
                                      {variante.codigoSku}
                                    </div>
                                    <h5 className="font-bold text-gray-900 dark:text-white text-sm truncate leading-tight">
                                       {selectedProductForAjuste.nombreProducto}
                                    </h5>
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-slate-700 rounded-lg text-[10px] font-bold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                                        Color: {variante.color?.nombreColor}
                                      </span>
                                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-slate-700 rounded-lg text-[10px] font-bold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                                        Talla: {variante.talla?.nombreTalla}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-700/50">
                                  <div className="flex flex-col">
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mb-1">Stock Actual</span>
                                    <span className={`text-base font-bold ${variante.cantidadStock <= (variante.stockMinimo || 0) ? 'text-rose-500' : 'text-emerald-500'}`}>
                                      {variante.cantidadStock || 0} <span className="text-[10px] uppercase opacity-60">u.</span>
                                    </span>
                                  </div>
                                  {isSelected ? (
                                    <motion.div 
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200"
                                    >
                                      <Check size={18} />
                                    </motion.div>
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 flex items-center justify-center text-gray-300 dark:text-gray-500 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/40 group-hover:text-indigo-400 transition-colors">
                                        <Plus size={18} />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        }) : (
                          <div className="col-span-full py-20 text-center">
                            <Plus className="w-16 h-16 mx-auto mb-4 text-gray-200 dark:text-gray-700 rotate-45" />
                            <p className="font-bold text-gray-400 dark:text-gray-600 uppercase text-xs tracking-widest">No se encontraron variantes disponibles</p>
                          </div>
                        );
                      })()
                    )}
                  </div>

                  <AnimatePresence>
                  {selectedVariantes.length > 0 && (
                    <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 20, opacity: 0 }}
                        className="mt-6 flex items-center justify-between p-5 bg-indigo-600 rounded-[2rem] text-white shadow-2xl shadow-indigo-500/30"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-[1rem] flex items-center justify-center backdrop-blur-md">
                          <Package className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-base font-bold leading-none">{selectedVariantes.length} Variantes en Selección</p>
                          <p className="text-[10px] opacity-80 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                             <Check size={10} /> Listas para configuración técnica
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={nextStep} 
                        className="px-8 py-3 bg-white text-indigo-600 rounded-2xl font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10 flex items-center gap-2"
                      >
                        Continuar <ChevronRight size={18} />
                      </button>
                    </motion.div>
                  )}
                  </AnimatePresence>
                </div>

                {!selectedVariantes.length && (
                  <div className="flex justify-between">
                    <Button onClick={prevStep} size="large" className="rounded-xl font-bold">
                      <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
                    </Button>
                    <Button
                      type="primary"
                      disabled
                      size="large"
                      className="rounded-xl font-bold opacity-50"
                    >
                      Selecciona para continuar
                    </Button>
                  </div>
                )}
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                     <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                     <h3 className="font-bold text-lg text-gray-900 dark:text-white tracking-tight">Magnitud de los Ajustes Técnicos</h3>
                  </div>

                  <div className="space-y-4 max-h-[480px] overflow-y-auto pr-2 premium-scrollbar p-1">
                    {selectedVariantes.map(variante => {
                      const detalle = detalleAjustes.find(d => d.idVariante === variante.idVariante);
                      const cantidadActual = Number(variante.cantidadStock) || 0;
                      const cantidadAjuste = Number(detalle?.cantidadAjuste) || 0;
                      const tipo = getTipoActual();
                      const cantidadFinal = calcularNuevoStock(cantidadActual, cantidadAjuste, tipo);

                      const imagenUrl = getImagenUrl(getVarianteImagen(variante));

                      return (
                        <div 
                          key={variante.idVariante} 
                          className="group bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-500/40 transition-all shadow-sm overflow-hidden"
                        >
                          <div className="flex flex-col xl:flex-row">
                            {/* Visual y Specs */}
                            <div className="bg-gray-50/50 dark:bg-gray-900/40 p-6 flex flex-row xl:flex-col items-center gap-6 xl:w-48 border-b xl:border-b-0 xl:border-r border-gray-100 dark:border-gray-700/50">
                              <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xl shadow-black/5">
                                <img 
                                  src={imagenUrl} 
                                  alt="V" 
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                  onError={(e) => { e.target.src = '/placeholder.png'; }}
                                />
                              </div>
                              <div className="flex-1 xl:text-center min-w-0">
                                <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm truncate">{variante.producto?.nombreProducto}</h4>
                                <div className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 mt-1 uppercase tracking-widest">{variante.codigoSku}</div>
                                <div className="mt-3 flex flex-wrap gap-1.5 justify-start xl:justify-center">
                                   <span className="px-2 py-0.5 bg-white dark:bg-gray-800 rounded-lg text-[9px] font-bold text-gray-400 border border-gray-100 dark:border-gray-700 uppercase">{variante.color?.nombreColor}</span>
                                   <span className="px-2 py-0.5 bg-white dark:bg-gray-800 rounded-lg text-[9px] font-bold text-gray-400 border border-gray-100 dark:border-gray-700 uppercase">T:{variante.talla?.nombreTalla}</span>
                                </div>
                              </div>
                            </div>

                            {/* Panel de Control de Cantidades */}
                            <div className="flex-1 p-6 lg:p-8 space-y-6">
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                {/* Nodo Stock Actual */}
                                <div className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900/30 rounded-3xl border border-gray-100 dark:border-gray-800/50">
                                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">Stock en Libros</span>
                                  <span className="text-2xl font-bold text-gray-700 dark:text-gray-300">{Number(cantidadActual).toLocaleString()}</span>
                                </div>

                                {/* Centro de Acción: Input */}
                                <div className="space-y-2">
                                  <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest block text-center mb-1">Magnitud del Ajuste</span>
                                  <div className="relative group/input">
                                    <InputNumber
                                      value={cantidadAjuste}
                                      onChange={(value) => actualizarCantidadAjuste(variante.idVariante, value || 0)}
                                      size="large"
                                      className="w-full premium-input-number border-2 !border-indigo-100 dark:!border-indigo-900/50 focus:!border-indigo-500 !rounded-2xl dark:!bg-gray-800 transition-all font-bold text-center !text-lg"
                                      style={{ height: '56px' }}
                                      placeholder="±0"
                                      controls={{ 
                                          upIcon: <Plus className="text-indigo-500" size={14} />, 
                                          downIcon: <Minus className="text-indigo-500" size={14} /> 
                                      }}
                                    />
                                    <div className="flex justify-between mt-2 px-1">
                                       <button onClick={() => actualizarCantidadAjuste(variante.idVariante, (detalle?.cantidadAjuste || 0) - 1)} className="text-[10px] font-bold text-indigo-400 hover:text-indigo-600">-1</button>
                                       <button onClick={() => actualizarCantidadAjuste(variante.idVariante, (detalle?.cantidadAjuste || 0) + 1)} className="text-[10px] font-bold text-indigo-400 hover:text-indigo-600">+1</button>
                                    </div>
                                  </div>
                                </div>

                                {/* Nodo Resultado Final */}
                                <div className={`flex flex-col items-center justify-center p-4 rounded-3xl border transition-all duration-500 ${
                                  cantidadFinal < 0 ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800 text-rose-600' : 
                                  cantidadAjuste !== 0 ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800 text-emerald-600' : 
                                  'bg-gray-50 dark:bg-gray-900/30 border-gray-100 dark:border-gray-800/50 text-gray-400'
                                }`}>
                                  <span className="text-[9px] font-bold uppercase tracking-widest mb-2 opacity-70">Proyección Final</span>
                                  <span className="text-2xl font-bold">{Number(cantidadFinal).toLocaleString()}</span>
                                  {cantidadFinal < 0 && <span className="text-[8px] font-bold uppercase mt-1 animate-pulse">Inválido</span>}
                                </div>
                              </div>

                              <div className="relative">
                                <StickyNote size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                  type="text"
                                  placeholder="Nota técnica para este ajuste específico..."
                                  value={detalle?.observaciones || ''}
                                  onChange={(e) => actualizarObservaciones(variante.idVariante, e.target.value)}
                                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-2xl text-[11px] font-medium text-gray-600 dark:text-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-400 transition-all"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-start gap-4 p-5 bg-indigo-50 dark:bg-indigo-900/20 rounded-[2rem] border border-indigo-100 dark:border-indigo-800/50">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center text-indigo-600 flex-shrink-0">
                       <AlertTriangle size={20} />
                    </div>
                    <div className="pt-1">
                      <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-300">Resumen de Auditoría Crítica</h4>
                      <p className="text-xs text-indigo-700/80 dark:text-indigo-400/80 mt-1 font-medium leading-relaxed">
                        Los valores ingresados sincronizarán el stock real. Un valor <span className="font-bold text-indigo-600 dark:text-indigo-300 underline underline-offset-2">positivo</span> representa entrada de mercancía, un valor <span className="font-bold text-indigo-600 dark:text-indigo-300 underline underline-offset-2">negativo</span> representa salida o merma.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button onClick={prevStep} size="large">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
                  </Button>
                  <Button
                    type="primary"
                    onClick={nextStep}
                    disabled={detalleAjustes.some(d => d.cantidadAjuste === 0)}
                    size="large"
                  >
                    Siguiente <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-gray-50 dark:bg-gray-800/40 rounded-[2rem] border border-gray-100 dark:border-gray-700">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Tipo de Operación</span>
                      <div className="flex items-center gap-2">
                         <Tag color={tiposMovimiento.find(t => t.idTipoMovimiento === ajusteForm.idTipoMovimiento)?.tipo === 'entrada' ? 'green' : 'orange'} className="font-bold text-[10px] uppercase rounded-md border-none m-0">
                            {tiposMovimiento.find(t => t.idTipoMovimiento === ajusteForm.idTipoMovimiento)?.nombreTipo || 'No definido'}
                         </Tag>
                      </div>
                    </div>
                    <div className="p-6 bg-gray-50 dark:bg-gray-800/40 rounded-[2rem] border border-gray-100 dark:border-gray-700">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Fecha Programada</span>
                      <div className="text-sm font-bold text-gray-700 dark:text-gray-200">
                         {ajusteForm.fechaAjuste ? ajusteForm.fechaAjuste.format('DD [de] MMMM, YYYY') : 'Hoy'}
                      </div>
                    </div>
                    <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-[2rem] border border-indigo-100 dark:border-indigo-800/50">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-2">Variantes a Sincronizar</span>
                      <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                         {selectedVariantes.length} <span className="text-xs font-medium opacity-70">unidades</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
                    <div className="flex items-center gap-3">
                       <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                       <h3 className="font-bold text-lg text-gray-900 dark:text-white tracking-tight">Manifiesto de Ajuste</h3>
                    </div>

                    <div className="dark-table-container">
                      <Table
                        dataSource={selectedVariantes.map(variante => {
                          const detalle = detalleAjustes.find(d => d.idVariante === variante.idVariante);
                          const cantidadActual = Number(variante.cantidadStock) || 0;
                          const cantidadAjuste = Number(detalle?.cantidadAjuste) || 0;
                          const tipo = getTipoActual();
                          const cantidadFinal = calcularNuevoStock(cantidadActual, cantidadAjuste, tipo);
                          const imagenUrl = getImagenUrl(getVarianteImagen(variante));

                          return {
                            key: variante.idVariante,
                            imagen: imagenUrl,
                            producto: variante.producto?.nombreProducto,
                            variante: `${variante.color?.nombreColor} - ${variante.talla?.nombreTalla}`,
                            sku: variante.codigoSku,
                            stockActual: cantidadActual,
                            ajuste: cantidadAjuste,
                            stockFinal: cantidadFinal,
                            observaciones: detalle?.observaciones
                          };
                        })}
                        columns={[
                          {
                            title: 'Producto',
                            dataIndex: 'producto',
                            render: (text, record) => (
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700 flex-shrink-0">
                                   <img src={record.imagen} alt="P" className="w-full h-full object-cover" onError={(e) => { e.target.src = '/placeholder.png'; }} />
                                </div>
                                <div>
                                  <div className="font-bold text-xs text-gray-900 dark:text-white leading-tight">{text}</div>
                                  <div className="text-[10px] text-gray-400 font-bold">{record.variante}</div>
                                </div>
                              </div>
                            )
                          },
                          {
                            title: 'SKU',
                            dataIndex: 'sku',
                            render: (sku) => <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md">{sku}</span>
                          },
                          {
                            title: 'En Libros',
                            dataIndex: 'stockActual',
                            align: 'center',
                            render: (val) => <span className="font-bold text-gray-500 text-xs">{val}</span>
                          },
                          {
                            title: 'Diferencia',
                            dataIndex: 'ajuste',
                            align: 'center',
                            render: (val) => (
                              <span className={`font-bold text-xs ${val > 0 ? 'text-emerald-500' : val < 0 ? 'text-rose-500' : 'text-gray-300'}`}>
                                {val > 0 ? '+' : ''}{val}
                              </span>
                            )
                          },
                          {
                            title: 'Proyectado',
                            dataIndex: 'stockFinal',
                            align: 'center',
                            render: (val) => (
                              <span className={`font-bold text-xs ${val < 0 ? 'text-rose-600 underline' : 'text-gray-900 dark:text-white'}`}>
                                {val}
                              </span>
                            )
                          }
                        ]}
                        pagination={false}
                        size="small"
                        className="premium-table-compact"
                      />
                    </div>

                    <div className="mt-8 p-6 bg-amber-50 dark:bg-amber-900/10 rounded-[2rem] border border-amber-100 dark:border-amber-800/40">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-600 flex-shrink-0">
                           <AlertTriangle size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-amber-900 dark:text-amber-400">Declaración de Impacto</h4>
                          <p className="text-xs text-amber-700/80 dark:text-amber-500/80 mt-1 font-medium leading-relaxed">
                             Esta operación se guardará como <strong>BORRADOR</strong>. No afectará el inventario real hasta que un supervisor autorice y ejecute la aplicación definitiva de la misma.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center px-4">
                    <button
                      onClick={prevStep}
                      className="px-8 py-3.5 text-gray-400 hover:text-indigo-600 font-bold text-sm transition-all flex items-center gap-2"
                    >
                      <ChevronLeft size={20} /> Retroceder
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCreate}
                      disabled={loading}
                      className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-base shadow-2xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all flex items-center gap-3"
                    >
                      {loading ? 'Procesando...' : (
                        <>
                          Confirmar y Guardar Borrador
                          <Check size={20} />
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Modal>
    </div>
  );
}

