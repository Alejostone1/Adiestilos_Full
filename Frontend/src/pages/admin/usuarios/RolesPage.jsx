import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  Users,
  Info,
  CheckCircle2,
  Eye,
  Search,
  Layout,
  UserCheck,
  Package,
  ShoppingCart,
  TrendingUp,
  Globe,
  RefreshCcw,
  X,
  Settings,
  Grid
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { rolesApi } from '../../../api/rolesApi';
import Swal from 'sweetalert2';

// Mapeo de iconos para categorias
const ICONOS_CATEGORIAS = {
  'Dashboard': <Layout size={16} />,
  'Usuarios y Seguridad': <Shield size={16} />,
  'Catálogo de Productos': <Package size={16} />,
  'Ventas y Cobranzas': <ShoppingCart size={16} />,
  'Compras e Inventario': <Grid size={16} />,
  'Reportes y Análisis': <TrendingUp size={16} />,
  'E-commerce (Cliente)': <Globe size={16} />
};

export default function RolesPage() {
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [viewingRole, setViewingRole] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    nombreRol: '',
    descripcion: '',
    activo: true,
    permisos: {}
  });

  // Cargar datos
  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      const [rolesRes, permisosRes] = await Promise.all([
        rolesApi.getRoles(),
        rolesApi.getAvailablePermissions()
      ]);
      setRoles(rolesRes.datos || []);
      setAvailablePermissions(permisosRes.datos || []);
    } catch (error) {
      console.error('Error cargando roles:', error);
      Swal.fire('Error', 'No se pudieron cargar los roles', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Agrupar permisos
  const permisosAgrupados = useMemo(() => {
    return availablePermissions.reduce((acc, curr) => {
      const cat = curr.categoria || 'Otros';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(curr);
      return acc;
    }, {});
  }, [availablePermissions]);

  // Handlers
  const handleOpenDrawer = (role = null) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        nombreRol: role.nombreRol,
        descripcion: role.descripcion || '',
        activo: role.activo,
        permisos: role.permisos || {}
      });
    } else {
      setEditingRole(null);
      setFormData({
        nombreRol: '',
        descripcion: '',
        activo: true,
        permisos: {}
      });
    }
    setIsDrawerOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingRole) {
        await rolesApi.updateRole(editingRole.idRol, formData);
        Swal.fire({
          icon: 'success',
          title: 'Perfil de Seguridad Actualizado',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      } else {
        await rolesApi.createRole(formData);
        Swal.fire({
          icon: 'success',
          title: 'Nuevo Perfil Creado',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      }
      setIsDrawerOpen(false);
      cargarDatos();
    } catch (error) {
      Swal.fire('Error', error.response?.data?.mensaje || 'Error al guardar el rol', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (role) => {
    const result = await Swal.fire({
      title: '¿Eliminar perfil?',
      text: `El rol "${role.nombreRol}" será eliminado permanentemente.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await rolesApi.deleteRole(role.idRol);
        cargarDatos();
        Swal.fire('Eliminado', 'El rol ha sido removido.', 'success');
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar. Verifique si hay usuarios asociados.', 'error');
      }
    }
  };

  const toggleStatus = async (role) => {
    try {
      await rolesApi.toggleRoleStatus(role.idRol, !role.activo);
      cargarDatos();
      Swal.fire({
        icon: 'success',
        title: `Perfil ${!role.activo ? 'Activado' : 'Suspendido'}`,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000
      });
    } catch (error) {
      Swal.fire('Error', 'No se pudo cambiar el estado', 'error');
    }
  };

  const grantFullAccess = () => {
    const allFull = {};
    availablePermissions.forEach(p => {
      allFull[p.clave] = p.tipo === 'boolean' ? true : 'full';
    });
    setFormData({ ...formData, permisos: allFull });
    Swal.fire({
        icon: 'info',
        title: 'Acceso Total Concedido',
        text: 'Se han marcado todos los módulos con privilegios máximos.',
        timer: 1500,
        showConfirmButton: false
    });
  };

  // El rol Administrador es privilegiado: su matriz no se puede modificar.
  const esAdministradorEditando = editingRole?.nombreRol === 'Administrador';

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-4 md:p-6 space-y-6 transition-colors duration-300">

      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-[11px] font-semibold uppercase tracking-wide">
            <Lock size={12} />
            Gobernanza de Datos
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">
            Roles y Seguridad
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl">
            Administra privilegios granulares. Define con precisión qué puede ver y hacer cada integrante de la organización.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={cargarDatos}
            className="card-3d p-2.5 bg-white dark:bg-slate-800/60 text-gray-500 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all border border-gray-100 dark:border-slate-700/50 shadow-sm"
            title="Recargar"
          >
            <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => handleOpenDrawer()}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm shadow-md shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
          >
            <Plus size={18} />
            Crear Nuevo Perfil
          </button>
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnimatePresence>
          {roles.map((role, idx) => (
            <motion.div
              key={role.idRol}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className={`card-3d card-elevated relative group bg-white dark:bg-slate-800/60 rounded-2xl p-5 border border-gray-100 dark:border-slate-700/50 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all overflow-hidden ${!role.activo ? 'grayscale' : ''}`}
            >
              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                {role.nombreRol === 'Administrador' ? (
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide cursor-default ${role.activo ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/30'}`}>
                    {role.activo ? 'Activo' : 'Suspendido'}
                  </span>
                ) : (
                  <button
                    onClick={() => toggleStatus(role)}
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide transition-all ${role.activo ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/30'}`}
                    title={role.activo ? 'Suspender perfil' : 'Activar perfil'}
                  >
                    {role.activo ? 'Activo' : 'Suspendido'}
                  </button>
                )}
              </div>

              {/* Icon & Title */}
              <div className="flex items-start gap-3 mb-4">
                <div className={`p-2.5 rounded-xl ${role.nombreRol === 'Administrador' ? 'bg-red-500 text-white' : 'bg-indigo-600 text-white shadow-md shadow-indigo-100 dark:shadow-none'}`}>
                  <Shield size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">{role.nombreRol}</h3>
                  <div className="flex items-center gap-1.5 text-gray-400 font-medium text-xs mt-0.5">
                    <Users size={12} />
                    {role._count?.usuarios || 0} Usuarios asignados
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 h-8 mb-4 font-medium italic">
                {role.descripcion || 'Sin descripción técnica del perfil.'}
              </p>

              {/* Progress Summary */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-end">
                  <span className="text-[11px] font-semibold text-indigo-500 uppercase tracking-wide">Cobertura de Privilegios</span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {Object.values(role.permisos || {}).filter(v => v !== false && v !== 'none').length} / {availablePermissions.length}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 dark:bg-slate-700/40 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(Object.values(role.permisos || {}).filter(v => v !== false && v !== 'none').length / availablePermissions.length) * 100}%` }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.3)]"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setViewingRole(role); setIsViewDrawerOpen(true); }}
                  className="flex-1 py-2 px-3 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white rounded-lg text-sm font-semibold hover:shadow-md hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-1.5 border border-indigo-100 dark:border-indigo-800/60 hover:border-indigo-600 active:scale-[0.98]"
                  title="Ver atribuciones del perfil"
                >
                  <Eye size={16} />
                  Ver
                </button>
                <button
                  onClick={() => handleOpenDrawer(role)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white border border-indigo-100 dark:border-indigo-800/60 hover:border-indigo-600 shadow-sm hover:shadow-md hover:shadow-indigo-500/20 hover:-translate-y-0.5 active:scale-95 transition-all"
                  title="Ajustar matriz de seguridad"
                >
                  <Edit2 size={16} />
                </button>
                {role.nombreRol !== 'Administrador' && (
                  <button
                    onClick={() => handleDelete(role)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-100 dark:border-rose-800/60 hover:border-rose-600 shadow-sm hover:shadow-md hover:shadow-rose-500/20 hover:-translate-y-0.5 active:scale-95 transition-all"
                    title="Eliminar perfil"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* --- MODAL EDITOR (Full Matrix) --- */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-end bg-black/50 dark:bg-black/80 backdrop-blur-md p-0 md:p-6">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 150 }}
              className="w-full max-w-3xl h-full bg-gray-50 dark:bg-slate-900 shadow-2xl overflow-hidden md:rounded-2xl flex flex-col border-l border-white/10"
            >
              {/* Header */}
              <div className="p-5 card-3d bg-white dark:bg-slate-800/60 border-b border-gray-100 dark:border-slate-700/50 flex items-center justify-between sticky top-0 z-10">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                    <div className="p-2 bg-indigo-600 text-white rounded-lg">
                      <Settings size={18} />
                    </div>
                    {editingRole ? 'Ajustar Matriz de Seguridad' : 'Nueva Configuración de Acceso'}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Define los límites y capacidades de este perfil en el ecosistema.</p>
                </div>
                <button onClick={() => setIsDrawerOpen(false)} className="card-3d p-2 hover:bg-gray-100 dark:hover:bg-slate-700/50 rounded-lg transition-all text-gray-400">
                  <X size={20} />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">

                {/* Basic Info */}
                <div className="card-3d bg-white dark:bg-slate-800/60 p-5 rounded-2xl border border-gray-100 dark:border-slate-700/50 space-y-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-indigo-500 flex items-center gap-1.5">
                    <Info size={14} /> Identidad del Perfil
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Nombre Descriptivo</label>
                      <input
                        required
                        disabled={editingRole?.nombreRol === 'Administrador'}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 focus:border-indigo-500 dark:text-white transition-all font-medium text-sm disabled:opacity-50"
                        placeholder="Ej: Operador de Punto de Venta"
                        value={formData.nombreRol}
                        onChange={(e) => setFormData({...formData, nombreRol: e.target.value})}
                      />
                    </div>
                    <div className="flex flex-col justify-end">
                      <label className="flex items-center gap-3 p-3 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl cursor-pointer border border-indigo-100/50 dark:border-indigo-800/20 group">
                        <input
                          type="checkbox"
                          disabled={editingRole?.nombreRol === 'Administrador'}
                          className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
                          checked={formData.activo}
                          onChange={(e) => setFormData({...formData, activo: e.target.checked})}
                        />
                        <div>
                          <span className="block text-sm font-semibold text-indigo-700 dark:text-indigo-400">Perfil Habilitado</span>
                          <span className="text-[11px] text-indigo-400 font-semibold uppercase tracking-tight">Estado de uso</span>
                        </div>
                      </label>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Descripción de Responsabilidades</label>
                    <textarea
                      rows="2"
                      className="card-3d w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-700/40 border-0 rounded-lg focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 focus:border-indigo-500 dark:text-white transition-all text-sm font-medium resize-none shadow-inner"
                      placeholder="Define para qué se usará este rol..."
                      value={formData.descripcion}
                      onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                    />
                  </div>
                </div>

                {/* Matrix Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Lock className="text-indigo-500" size={18} /> Matriz de Privilegios
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {esAdministradorEditando
                        ? 'El rol Administrador posee acceso total e inmutable sobre todos los módulos.'
                        : 'Configura el acceso granular módulo por módulo.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={grantFullAccess}
                    disabled={esAdministradorEditando}
                    className={`flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border-2 border-dashed border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 rounded-lg text-sm font-semibold transition-all ${esAdministradorEditando ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-solid hover:border-indigo-500'}`}
                  >
                    <Unlock size={16} /> Entregar Acceso Total
                  </button>
                </div>

                {/* Categories */}
                <div className="space-y-4 pb-8">
                  {Object.entries(permisosAgrupados).map(([cat, permisos], cIdx) => (
                    <motion.div
                      key={cat}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
                    >
                      <div className="px-5 py-3 bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2.5">
                        <div className="p-2 bg-white dark:bg-gray-800 rounded-lg text-indigo-500 shadow-sm">
                          {ICONOS_CATEGORIAS[cat]}
                        </div>
                        <h5 className="font-semibold text-gray-900 dark:text-white tracking-tight uppercase text-xs">{cat}</h5>
                      </div>

                      <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {permisos.map(p => (
                          <div key={p.clave} className="px-5 py-3 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                              <div className="flex-1">
                                <div className="text-sm font-semibold text-gray-800 dark:text-white">{p.modulo}</div>
                                <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mt-0.5">{p.descripcion || p.label}</p>
                              </div>

                              <div className="flex gap-2">
                                {p.tipo === 'boolean' ? (
                                  <label className={`flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg cursor-pointer ${esAdministradorEditando ? 'opacity-70 pointer-events-none' : ''}`}>
                                    <button
                                      type="button"
                                      onClick={() => setFormData({ ...formData, permisos: { ...formData.permisos, [p.clave]: true } })}
                                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${formData.permisos[p.clave] === true ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                                    >SÍ</button>
                                    <button
                                      type="button"
                                      onClick={() => setFormData({ ...formData, permisos: { ...formData.permisos, [p.clave]: false } })}
                                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${!formData.permisos[p.clave] ? 'bg-white dark:bg-gray-700 text-gray-700 dark:text-white shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                                    >NO</button>
                                  </label>
                                ) : (
                                  <div className={`flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg gap-1 ${esAdministradorEditando ? 'opacity-70 pointer-events-none' : ''}`}>
                                    {p.opciones.map(opt => {
                                      const isActive = formData.permisos[p.clave] === opt.value;
                                      return (
                                        <button
                                          key={opt.value}
                                          type="button"
                                          onClick={() => setFormData({ ...formData, permisos: { ...formData.permisos, [p.clave]: opt.value } })}
                                          className={`px-3 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-tight transition-all ${isActive ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                                        >
                                          {opt.label}
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </form>

              {/* Action Footer */}
              <div className="p-4 card-3d bg-white dark:bg-slate-800/60 border-t border-gray-100 dark:border-slate-700/50 flex gap-3 sticky bottom-0 z-10">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="card-3d flex-1 py-3 bg-gray-100 dark:bg-slate-700/40 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-200 dark:hover:bg-slate-600/60 transition-all"
                > Descartar </button>
                <button
                  type="submit"
                  onClick={handleSave}
                  disabled={submitting}
                  className="card-3d card-elevated flex-[2] py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-200 dark:shadow-indigo-900/20 hover:bg-indigo-700 dark:hover:bg-indigo-700 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? 'Procesando...' : (editingRole ? 'Guardar Cambios' : 'Finalizar Creación')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- QUICK VIEW DRAWER --- */}
      <AnimatePresence>
        {isViewDrawerOpen && viewingRole && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card-3d card-elevated w-full max-w-2xl bg-white dark:bg-slate-800/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-gray-100 dark:border-slate-700/50"
            >
              <div className="p-5 card-3d border-b border-gray-100 dark:border-slate-700/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500 text-white rounded-lg shadow-md">
                    <UserCheck size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white uppercase tracking-tight">{viewingRole.nombreRol}</h3>
                    <p className="text-gray-400 font-semibold text-[11px] uppercase tracking-wide">Resumen de Atribuciones</p>
                  </div>
                </div>
                <button onClick={() => setIsViewDrawerOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-900 rounded-lg transition-all">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {Object.entries(permisosAgrupados).map(([cat, permisos]) => (
                  <div key={cat} className="space-y-2">
                    <div className="flex items-center gap-1.5 text-indigo-500 mb-1">
                      {ICONOS_CATEGORIAS[cat]}
                      <span className="text-[11px] font-semibold uppercase tracking-wide">{cat}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {permisos.map(p => {
                        const valor = viewingRole.permisos[p.clave];
                        const active = valor && valor !== 'none' && valor !== false;
                        return (
                          <div key={p.clave} className={`p-3 rounded-xl border flex items-center justify-between gap-2 transition-all ${active ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-800' : 'bg-gray-50/30 dark:bg-gray-800/20 border-gray-100 dark:border-gray-800 opacity-50'}`}>
                            <div>
                              <div className={`text-xs font-semibold ${active ? 'text-indigo-700 dark:text-indigo-400' : 'text-gray-400'}`}>{p.modulo}</div>
                              <div className="text-[11px] font-semibold text-gray-400 dark:text-gray-500">{optLabel(p, valor)}</div>
                            </div>
                            {active ? (
                              <div className="bg-indigo-500 text-white p-1 rounded-md shrink-0">
                                <CheckCircle2 size={12} />
                              </div>
                            ) : (
                              <div className="text-gray-300 shrink-0">
                                <X size={12} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 card-3d bg-slate-700/30 dark:bg-slate-700/30 border-t border-gray-100 dark:border-slate-700/50">
                <button
                  onClick={() => { setIsViewDrawerOpen(false); handleOpenDrawer(viewingRole); }}
                  className="card-3d card-elevated w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-200 dark:shadow-indigo-900/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  <Edit2 size={16} />
                  Modificar Privilegios
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Helpers
function optLabel(meta, val) {
    if (!val || val === 'none' || val === false) return 'SIN ACCESO';
    if (val === true) return 'ACCESO TOTAL (B)';
    if (meta.tipo === 'radio') {
        return meta.opciones.find(o => o.value === val)?.label?.toUpperCase() || val;
    }
    return val.toUpperCase();
}