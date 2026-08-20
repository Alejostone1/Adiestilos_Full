import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Tag, Search, Edit, Trash2, Plus, RefreshCcw, Filter, X,
  DollarSign, Calendar, Percent, Gift, Users, Package,
  Clock, CheckCircle, XCircle, AlertCircle, TrendingUp,
  BarChart3, Eye, EyeOff, Loader2, ChevronDown, ToggleLeft,
  ToggleRight, MoreVertical, ShoppingBag, ChevronRight,
  ChevronLeft, Info, Settings, Target, ShieldCheck
} from 'lucide-react';
import { descuentosApi } from '../../../api/descuentosApi';
import { categoriasApi } from '../../../api/categoriasApi';
import { productosApi } from '../../../api/productosApi';
import PrecioFormateado from '../../../components/common/PrecioFormateado';
import { useAuth } from "../../../context/AuthContext";
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';

export default function DescuentosPage() {
  const navigate = useNavigate();
  const { token } = useAuth();

  // Estados principales
  const [descuentos, setDescuentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);

  // Estados de paginación y filtros
  const [pagination, setPagination] = useState({
    page: 1, limit: 10, total: 0, totalPages: 0
  });
  const [filters, setFilters] = useState({
    estado: '', tipoDescuento: '', aplicaA: '', buscar: ''
  });

  // Estados de UI
  const [showFilters, setShowFilters] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDescuento, setSelectedDescuento] = useState(null);

  // Form Data
  const [formData, setFormData] = useState({
    nombreDescuento: '',
    descripcion: '',
    tipoDescuento: 'porcentaje',
    valorDescuento: '',
    aplicaA: 'total_venta',
    idCategoria: '',
    idProducto: '',
    montoMinimoCompra: 0,
    cantidadMaximaUsos: '',
    usoPorCliente: 1,
    fechaInicio: '',
    fechaFin: '',
    requiereCodigo: false,
    codigoDescuento: ''
  });

  // Estados para datos auxiliares
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);

  // Cargar datos
  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [descuentosRes, categoriasRes, productosRes, estadisticasRes] = await Promise.all([
        descuentosApi.obtenerDescuentos({
          page: pagination.page,
          limit: pagination.limit,
          ...filters
        }),
        categoriasApi.obtenerTodasLasCategorias(),
        productosApi.obtenerProductos({ estado: 'activo', limit: 300 }),
        descuentosApi.obtenerEstadisticasDescuentos()
      ]);

      setDescuentos(descuentosRes.descuentos || []);
      setPagination(prev => ({
        ...prev,
        total: descuentosRes.total || 0,
        totalPages: descuentosRes.totalPages || 0
      }));
      setCategorias(categoriasRes.categorias || []);
      setProductos(productosRes.productos || []);
      setEstadisticas(estadisticasRes.estadisticas || {});
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError(err.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ estado: '', tipoDescuento: '', aplicaA: '', buscar: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setFormData({
      nombreDescuento: '',
      descripcion: '',
      tipoDescuento: 'porcentaje',
      valorDescuento: '',
      aplicaA: 'total_venta',
      idCategoria: '',
      idProducto: '',
      montoMinimoCompra: 0,
      cantidadMaximaUsos: '',
      usoPorCliente: 1,
      fechaInicio: '',
      fechaFin: '',
      requiereCodigo: false,
      codigoDescuento: ''
    });
    setWizardStep(1);
    setIsEditing(false);
    setSelectedDescuento(null);
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.nombreDescuento.length >= 3;
      case 2:
        const hasValue = formData.valorDescuento > 0;
        const targetValid = formData.aplicaA === 'total_venta' || 
                           (formData.aplicaA === 'categoria' && formData.idCategoria) ||
                           (formData.aplicaA === 'producto' && formData.idProducto);
        return hasValue && targetValid;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(wizardStep)) setWizardStep(prev => prev + 1);
    else Swal.fire({ icon: 'warning', title: 'Datos incompletos', text: 'Por favor completa los campos requeridos.', timer: 2000, showConfirmButton: false });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const dataToSend = { ...formData };
      
      // Sanitización
      if (dataToSend.valorDescuento) dataToSend.valorDescuento = parseFloat(dataToSend.valorDescuento);
      if (dataToSend.montoMinimoCompra) dataToSend.montoMinimoCompra = parseFloat(dataToSend.montoMinimoCompra);
      if (dataToSend.cantidadMaximaUsos) dataToSend.cantidadMaximaUsos = parseInt(dataToSend.cantidadMaximaUsos);
      if (dataToSend.usoPorCliente) dataToSend.usoPorCliente = parseInt(dataToSend.usoPorCliente);
      
      dataToSend.idCategoria = dataToSend.idCategoria ? parseInt(dataToSend.idCategoria) : null;
      dataToSend.idProducto = dataToSend.idProducto ? parseInt(dataToSend.idProducto) : null;

      if (isEditing) {
        await descuentosApi.actualizarDescuento(selectedDescuento.idDescuento, dataToSend);
      } else {
        await descuentosApi.crearDescuento(dataToSend);
      }

      Swal.fire({ icon: 'success', title: '¡Éxito!', text: `Promoción ${isEditing ? 'actualizada' : 'creada'} correctamente.`, timer: 1500, showConfirmButton: false });
      setShowWizard(false);
      resetForm();
      cargarDatos();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.msg || err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const openEditWizard = (descuento) => {
    setSelectedDescuento(descuento);
    setIsEditing(true);
    setFormData({
      nombreDescuento: descuento.nombreDescuento,
      descripcion: descuento.descripcion || '',
      tipoDescuento: descuento.tipoDescuento,
      valorDescuento: descuento.valorDescuento,
      aplicaA: descuento.aplicaA,
      idCategoria: descuento.idCategoria || '',
      idProducto: descuento.idProducto || '',
      montoMinimoCompra: descuento.montoMinimoCompra,
      cantidadMaximaUsos: descuento.cantidadMaximaUsos || '',
      usoPorCliente: descuento.usoPorCliente,
      fechaInicio: descuento.fechaInicio ? new Date(descuento.fechaInicio).toISOString().split('T')[0] : '',
      fechaFin: descuento.fechaFin ? new Date(descuento.fechaFin).toISOString().split('T')[0] : '',
      requiereCodigo: descuento.requiereCodigo,
      codigoDescuento: descuento.codigoDescuento || ''
    });
    setWizardStep(1);
    setShowWizard(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción marcará el descuento como inactivo.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4F46E5',
      cancelButtonColor: '#EF4444',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await descuentosApi.eliminarDescuento(id);
        Swal.fire('Eliminado', 'El descuento ha sido desactivado.', 'success');
        cargarDatos();
      } catch (err) {
        Swal.fire('Error', 'No se pudo eliminar el descuento.', 'error');
      }
    }
  };

  const handleToggleEstado = async (id, estadoActual) => {
    const nuevoEstado = estadoActual === 'activo' ? 'inactivo' : 'activo';
    try {
      await descuentosApi.actualizarEstadoDescuento(id, nuevoEstado);
      cargarDatos();
    } catch (err) {
      Swal.fire('Error', 'No se pudo cambiar el estado.', 'error');
    }
  };

  // Components
  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between group overflow-hidden relative">
      <div className={`absolute -right-4 -bottom-4 opacity-5 text-indigo-500 group-hover:scale-110 transition-transform duration-500`}>
        <Icon size={120} />
      </div>
      <div className="relative z-10">
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">{title}</p>
        <h3 className="text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">{value}</h3>
      </div>
      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400`}>
        <Icon className="h-7 w-7" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 space-y-8 animate-in fade-in duration-500 text-slate-900 dark:text-slate-100">
      
      {/* Header Premium */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-6">
          <div className="h-16 w-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none rotate-3">
            <Tag className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-white tracking-tight uppercase">Promociones</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Gestiona incentivos y campañas de fidelización.</p>
          </div>
        </div>
        
        <button 
          onClick={() => { resetForm(); setShowWizard(true); }}
          className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl flex items-center gap-2 shadow-xl shadow-indigo-200 dark:shadow-none transition-all active:scale-95 uppercase tracking-wide text-sm"
        >
          <Plus className="h-5 w-5" />
          Crear Promo
        </button>
      </div>

      {/* Grid de Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Campañas" value={estadisticas.totalDescuentos} icon={Tag} />
          <StatCard title="Desc. Activos" value={estadisticas.descuentosActivos} icon={CheckCircle} />
          <StatCard title="Usos Realizados" value={estadisticas.totalUsos} icon={Users} />
          <StatCard title="Ahorro Total" value={<PrecioFormateado precio={estadisticas.ahorroTotal} />} icon={DollarSign} />
        </div>
      )}

      {/* Toolbar & Filters */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text"
              placeholder="Buscar por nombre o código..."
              value={filters.buscar}
              onChange={(e) => handleFilterChange('buscar', e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all text-sm font-medium"
            />
          </div>
          <div className="flex items-center gap-3">
             <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3.5 rounded-2xl transition-all ${showFilters ? 'bg-indigo-600 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-slate-100'}`}
             >
               <Filter className="h-5 w-5" />
             </button>
             <button 
               onClick={cargarDatos}
               className="p-3.5 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-2xl hover:text-indigo-600 transition-all"
             >
               <RefreshCcw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
             </button>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-slate-50 dark:border-slate-800"
            >
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide ml-2">Estado</label>
                <select 
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border-none text-xs font-semibold dark:text-white cursor-pointer"
                  value={filters.estado}
                  onChange={(e) => handleFilterChange('estado', e.target.value)}
                >
                  <option value="">Todos los Estados</option>
                  <option value="activo">Activos</option>
                  <option value="inactivo">Inactivos</option>
                  <option value="vencido">Vencidos</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide ml-2">Tipo</label>
                <select 
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border-none text-xs font-semibold dark:text-white cursor-pointer"
                  value={filters.tipoDescuento}
                  onChange={(e) => handleFilterChange('tipoDescuento', e.target.value)}
                >
                  <option value="">Todos los Tipos</option>
                  <option value="porcentaje">Porcentaje %</option>
                  <option value="valor_fijo">Valor Fijo $</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide ml-2">Aplicación</label>
                <select 
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border-none text-xs font-semibold dark:text-white cursor-pointer"
                  value={filters.aplicaA}
                  onChange={(e) => handleFilterChange('aplicaA', e.target.value)}
                >
                  <option value="">Aplica a Todo</option>
                  <option value="total_venta">Total de Venta</option>
                  <option value="categoria">Categorías</option>
                  <option value="producto">Productos</option>
                </select>
              </div>
              <div className="flex items-end">
                <button 
                  onClick={clearFilters}
                  className="w-full py-2.5 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-xs font-semibold uppercase rounded-xl hover:bg-red-100 transition-all"
                >
                  Limpiar Filtros
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tabla Premium */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50">
                <th className="px-8 py-5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Información</th>
                <th className="px-6 py-5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Beneficio</th>
                <th className="px-6 py-5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Alcance</th>
                <th className="px-6 py-5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Uso</th>
                <th className="px-6 py-5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {loading && !descuentos.length ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <Loader2 className="h-8 w-8 text-indigo-500 animate-spin mx-auto mb-4" />
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Consultando promociones...</span>
                  </td>
                </tr>
              ) : !descuentos.length ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="h-16 w-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Tag className="h-8 w-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-semibold dark:text-white uppercase">No hay promociones</h3>
                    <p className="text-slate-500 text-sm mt-1">Intenta ajustando los filtros o crea una nueva.</p>
                  </td>
                </tr>
              ) : (
                descuentos.map((d) => (
                  <tr key={d.idDescuento} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${d.estado === 'activo' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>
                          <Gift className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                             <h4 className="text-sm font-semibold dark:text-white uppercase tracking-tight">{d.nombreDescuento}</h4>
                             <span className={`px-2 py-0.5 rounded-md text-[8px] font-semibold uppercase tracking-tighter ${
                               d.estado === 'activo' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 
                               d.estado === 'vencido' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20' :
                               'bg-slate-50 text-slate-400 dark:bg-slate-800'
                             }`}>
                               {d.estado}
                             </span>
                          </div>
                          {d.codigoDescuento && (
                            <div className="flex items-center gap-1 mt-1 font-mono text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                               <Tag className="h-3 w-3" />
                               {d.codigoDescuento}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                       <div className="flex flex-col">
                          <span className="text-base font-semibold dark:text-white">
                            {d.tipoDescuento === 'porcentaje' ? `${d.valorDescuento}%` : <PrecioFormateado precio={d.valorDescuento} />}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                            {d.tipoDescuento === 'porcentaje' ? 'De descuento' : 'Monto Fijo'}
                          </span>
                       </div>
                    </td>
                    <td className="px-6 py-6 font-semibold text-xs">
                        <div className="flex flex-col gap-1">
                          <span className="dark:text-slate-300 capitalize">{d.aplicaA.replace('_', ' ')}</span>
                          {d.categoria && <span className="text-[11px] text-slate-400">Cat: {d.categoria.nombreCategoria}</span>}
                          {d.producto && <span className="text-[11px] text-slate-400">Prod: {d.producto.nombreProducto}</span>}
                        </div>
                    </td>
                    <td className="px-6 py-6">
                        <div className="flex flex-col">
                           <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold dark:text-white">{d.usosActuales}</span>
                              <span className="text-[11px] text-slate-400">usados</span>
                           </div>
                           <div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                                style={{ width: d.cantidadMaximaUsos ? `${(d.usosActuales / d.cantidadMaximaUsos) * 100}%` : '100%' }}
                              />
                           </div>
                        </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleToggleEstado(d.idDescuento, d.estado)}
                            className={`w-10 h-10 flex items-center justify-center rounded-xl border shadow-sm hover:-translate-y-0.5 active:scale-95 transition-all ${
                              d.estado === 'activo'
                                ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-600 hover:text-white border-emerald-100 dark:border-emerald-800/60 hover:border-emerald-600 hover:shadow-emerald-500/20'
                                : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-700 hover:text-white border-slate-200 dark:border-slate-600/60 hover:border-slate-700 hover:shadow-slate-500/20'
                            }`}
                            title={d.estado === 'activo' ? 'Desactivar promo' : 'Activar promo'}
                          >
                            {d.estado === 'activo' ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                          </button>
                          <button 
                            onClick={() => openEditWizard(d)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white border border-indigo-100 dark:border-indigo-800/60 hover:border-indigo-600 shadow-sm hover:shadow-md hover:shadow-indigo-500/20 hover:-translate-y-0.5 active:scale-95 transition-all"
                            title="Editar promo"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(d.idDescuento)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-100 dark:border-rose-800/60 hover:border-rose-600 shadow-sm hover:shadow-md hover:shadow-rose-500/20 hover:-translate-y-0.5 active:scale-95 transition-all"
                            title="Eliminar promo"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Wizard Modal */}
      <AnimatePresence>
        {showWizard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWizard(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" 
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh]"
            >
              {/* Header Wizard */}
              <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
                      <Gift className="h-6 w-6" />
                   </div>
                   <div>
                      <h2 className="text-2xl font-semibold dark:text-white uppercase leading-tight">Configurar Promo</h2>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Paso {wizardStep} de 4: {
                        wizardStep === 1 ? 'Concepto' : wizardStep === 2 ? 'Beneficio' : wizardStep === 3 ? 'Límites' : 'Vigencia'
                      }</p>
                   </div>
                </div>
                <button onClick={() => setShowWizard(false)} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-red-500 transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="flex w-full h-1.5 bg-slate-50 dark:bg-slate-800">
                {[1,2,3,4].map(s => (
                  <div key={s} className={`flex-1 transition-all duration-500 ${s <= wizardStep ? 'bg-indigo-600' : ''}`} />
                ))}
              </div>

              {/* Body Wizard */}
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <AnimatePresence mode='wait'>
                  {wizardStep === 1 && (
                    <motion.div 
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="space-y-2">
                         <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide ml-2">Nombre de la Campaña</label>
                         <input 
                           type="text"
                           name="nombreDescuento"
                           value={formData.nombreDescuento}
                           onChange={handleInputChange}
                           className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all font-semibold placeholder:text-slate-300"
                           placeholder="Ej: Black Friday 2026"
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide ml-2">Descripción Interna</label>
                         <textarea 
                           rows="3"
                           name="descripcion"
                           value={formData.descripcion}
                           onChange={handleInputChange}
                           className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all font-semibold placeholder:text-slate-300 resize-none"
                           placeholder="Notas sobre el objetivo de esta promoción..."
                         />
                      </div>
                      <div className="p-6 bg-indigo-50 dark:bg-indigo-900/10 rounded-3xl border-2 border-dashed border-indigo-200 dark:border-indigo-800/40">
                         <div className="flex items-center gap-3 mb-4">
                            <Tag className="h-5 w-5 text-indigo-600" />
                            <h4 className="text-sm font-semibold text-indigo-900 dark:text-indigo-400 uppercase">¿Requiere Código de Cupón?</h4>
                         </div>
                         <div className="flex items-center gap-6">
                            <label className="flex items-center gap-2 cursor-pointer group">
                               <input 
                                 type="checkbox" 
                                 className="hidden" 
                                 checked={formData.requiereCodigo}
                                 onChange={(e) => setFormData({...formData, requiereCodigo: e.target.checked})}
                               />
                               <div className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.requiereCodigo ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                                 {formData.requiereCodigo && <CheckCircle className="h-4 w-4 text-white" />}
                               </div>
                               <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Sí, crear cupón</span>
                            </label>
                            {formData.requiereCodigo && (
                              <input 
                                type="text"
                                name="codigoDescuento"
                                value={formData.codigoDescuento}
                                onChange={handleInputChange}
                                className="flex-1 px-4 py-2 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800/50 rounded-xl font-mono text-sm uppercase font-semibold tracking-wide text-indigo-600 dark:text-indigo-400"
                                placeholder="CUPONVIP20"
                              />
                            )}
                         </div>
                      </div>
                    </motion.div>
                  )}

                  {wizardStep === 2 && (
                    <motion.div 
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      <div className="grid grid-cols-2 gap-4">
                         <button 
                           onClick={() => setFormData({...formData, tipoDescuento: 'porcentaje'})}
                           className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 ${formData.tipoDescuento === 'porcentaje' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600' : 'border-slate-50 dark:border-slate-800 text-slate-400'}`}
                         >
                           <Percent size={32} />
                           <span className="text-xs font-semibold uppercase">Porcentaje</span>
                         </button>
                         <button 
                           onClick={() => setFormData({...formData, tipoDescuento: 'valor_fijo'})}
                           className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 ${formData.tipoDescuento === 'valor_fijo' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600' : 'border-slate-50 dark:border-slate-800 text-slate-400'}`}
                         >
                           <DollarSign size={32} />
                           <span className="text-xs font-semibold uppercase">Monto Fijo</span>
                         </button>
                      </div>

                      <div className="space-y-4">
                         <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide ml-2">Magnitud del Descuento</label>
                         <input 
                           type="number"
                           name="valorDescuento"
                           value={formData.valorDescuento}
                           onChange={handleInputChange}
                           className="w-full px-8 py-6 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl text-4xl font-semibold text-center text-indigo-600 focus:ring-0 placeholder:text-slate-200"
                           placeholder={formData.tipoDescuento === 'porcentaje' ? '0%' : '$ 0.00'}
                         />
                      </div>

                      <div className="space-y-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                         <div className="flex items-center gap-3 mb-2">
                            <Target size={18} className="text-slate-400" />
                            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">¿A quién se aplica?</h4>
                         </div>
                         <div className="grid grid-cols-3 gap-3">
                           {['total_venta', 'categoria', 'producto'].map((tipo) => (
                             <button 
                               key={tipo}
                               onClick={() => setFormData({...formData, aplicaA: tipo})}
                               className={`py-3 px-2 rounded-2xl text-[11px] font-semibold uppercase tracking-tight transition-all border-2 ${formData.aplicaA === tipo ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-lg' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-transparent'}`}
                             >
                               {tipo.replace('_', ' ')}
                             </button>
                           ))}
                         </div>
                         
                         <AnimatePresence>
                            {formData.aplicaA === 'categoria' && (
                              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="pt-2">
                                <select 
                                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-semibold text-sm dark:text-white"
                                  value={formData.idCategoria}
                                  onChange={(e) => setFormData({...formData, idCategoria: e.target.value})}
                                >
                                  <option value="">Seleccionar Categoría...</option>
                                  {categorias.map(c => <option key={c.idCategoria} value={c.idCategoria}>{c.nombreCategoria}</option>)}
                                </select>
                              </motion.div>
                            )}
                            {formData.aplicaA === 'producto' && (
                              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="pt-2">
                                <select 
                                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-semibold text-sm dark:text-white"
                                  value={formData.idProducto}
                                  onChange={(e) => setFormData({...formData, idProducto: e.target.value})}
                                >
                                  <option value="">Seleccionar Producto...</option>
                                  {productos.map(p => <option key={p.idProducto} value={p.idProducto}>{p.nombreProducto}</option>)}
                                </select>
                              </motion.div>
                            )}
                         </AnimatePresence>
                      </div>
                    </motion.div>
                  )}

                  {wizardStep === 3 && (
                    <motion.div 
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] flex items-center gap-6">
                         <div className="h-14 w-14 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-slate-400">
                             <ShieldCheck size={28} />
                         </div>
                         <div className="flex-1">
                            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide block mb-1">Monto Mínimo de Compra</label>
                            <input 
                              type="number"
                              name="montoMinimoCompra"
                              value={formData.montoMinimoCompra}
                              onChange={handleInputChange}
                              className="w-full bg-transparent border-none p-0 text-xl font-semibold focus:ring-0 dark:text-white"
                              placeholder="Sin mínimo ($0)"
                            />
                         </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] space-y-3">
                            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide block">Límite Global de Usos</label>
                            <div className="flex items-center gap-4">
                               <input 
                                 type="number"
                                 name="cantidadMaximaUsos"
                                 value={formData.cantidadMaximaUsos}
                                 onChange={handleInputChange}
                                 className="flex-1 bg-transparent border-none p-0 text-xl font-semibold focus:ring-0 dark:text-white"
                                 placeholder="Ilimitado"
                               />
                               <Users className="text-slate-300" />
                            </div>
                         </div>
                         <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] space-y-3">
                            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide block">Máx. Usos por Cliente</label>
                            <div className="flex items-center gap-4">
                               <input 
                                 type="number"
                                 name="usoPorCliente"
                                 value={formData.usoPorCliente}
                                 onChange={handleInputChange}
                                 className="flex-1 bg-transparent border-none p-0 text-xl font-semibold focus:ring-0 dark:text-white"
                                 placeholder="1"
                               />
                               <Settings className="text-slate-300" />
                            </div>
                         </div>
                      </div>
                      <div className="p-6 bg-amber-50 dark:bg-amber-900/10 rounded-3xl flex items-start gap-4">
                         <Info className="h-5 w-5 text-amber-500 mt-1 shrink-0" />
                         <p className="text-xs font-semibold text-amber-700 dark:text-amber-500 leading-relaxed">
                            Los límites por cliente requieren que el usuario esté identificado al momento de la venta. Si dejas el campo en blanco para el límite global, la promoción no tendrá restricción de cantidad.
                         </p>
                      </div>
                    </motion.div>
                  )}

                  {wizardStep === 4 && (
                    <motion.div 
                      key="step4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                             <div className="flex items-center gap-3 ml-2">
                                <Calendar size={18} className="text-indigo-500" />
                                <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Inicia el día</h4>
                             </div>
                             <input 
                               type="date"
                               name="fechaInicio"
                               value={formData.fechaInicio}
                               onChange={handleInputChange}
                               className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl font-semibold text-indigo-600 dark:text-indigo-400 transition-all focus:ring-2 focus:ring-indigo-500"
                             />
                          </div>
                          <div className="space-y-4">
                             <div className="flex items-center gap-3 ml-2">
                                <Clock size={18} className="text-red-500" />
                                <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Finaliza el día</h4>
                             </div>
                             <input 
                               type="date"
                               name="fechaFin"
                               value={formData.fechaFin}
                               onChange={handleInputChange}
                               className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl font-semibold text-red-600 dark:text-red-400 transition-all focus:ring-2 focus:ring-red-500"
                             />
                          </div>
                       </div>

                       <div className="bg-slate-900 text-white p-10 rounded-[3.5rem] flex flex-col items-center text-center gap-4 relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl group-hover:bg-indigo-500/40 transition-all" />
                          <Gift size={48} className="text-indigo-400 animate-bounce" />
                          <h3 className="text-2xl font-semibold uppercase tracking-tight">¡Todo Listo!</h3>
                          <p className="text-slate-400 text-sm font-medium max-w-xs">Verifica que los datos sean correctos antes de activar tu nueva campaña promocional.</p>
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer Wizard */}
              <div className="p-8 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
                 <button 
                  onClick={() => setWizardStep(prev => prev - 1)}
                  disabled={wizardStep === 1}
                  className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 hover:text-slate-600 disabled:opacity-0 transition-all flex items-center gap-2"
                 >
                   <ChevronLeft size={16} /> Volver
                 </button>
                 
                 {wizardStep < 4 ? (
                   <button 
                    onClick={handleNext}
                    className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl flex items-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95 uppercase tracking-wide text-xs"
                   >
                     Continuar <ChevronRight size={16} />
                   </button>
                 ) : (
                   <button 
                    onClick={handleSave}
                    disabled={loading}
                    className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl flex items-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95 uppercase tracking-wide text-xs"
                   >
                     {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />} 
                     {isEditing ? 'Guardar Cambios' : 'Lanzar Promoción'}
                   </button>
                 )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
