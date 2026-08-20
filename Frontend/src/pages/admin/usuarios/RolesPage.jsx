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
  ChevronRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Search,
  Layout,
  UserCheck,
  Package,
  ShoppingCart,
  TrendingUp,
  Globe,
  RefreshCcw,
  X,
  AlertTriangle,
  Settings,
  Grid
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { rolesApi } from '../../../api/rolesApi';
import Swal from 'sweetalert2';

// Mapeo de iconos para categorias
const ICONOS_CATEGORIAS = {
  'Dashboard': <Layout size={18} />,
  'Usuarios y Seguridad': <Shield size={18} />,
  'Catálogo de Productos': <Package size={18} />,
  'Ventas y Cobranzas': <ShoppingCart size={18} />,
  'Compras e Inventario': <Grid size={18} />,
  'Reportes y Análisis': <TrendingUp size={18} />,
  'E-commerce (Cliente)': <Globe size={18} />
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

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-6 md:p-10 space-y-10 transition-colors duration-300">
      
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
        <div className="space-y-4">
           <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-[11px] font-semibold uppercase tracking-wide">
              <Lock size={14} />
              Gobernanza de Datos
           </div>
           <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white tracking-tight">
              Roles y Seguridad
           </h1>
           <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl">
              Administra privilegios granulares. Define con precisión qué puede ver y hacer cada integrante de la organización.
           </p>
        </div>

        <div className="flex items-center gap-4">
           <button 
             onClick={cargarDatos}
             className="card-3d p-4 bg-white dark:bg-slate-800/60 text-gray-500 dark:text-gray-400 rounded-3xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all border border-gray-100 dark:border-slate-700/50 shadow-sm"
           >
             <RefreshCcw size={24} className={loading ? 'animate-spin' : ''} />
           </button>
           <button 
             onClick={() => handleOpenDrawer()}
             className="px-8 py-4 bg-indigo-600 text-white rounded-[2rem] font-semibold text-lg shadow-2xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3"
           >
             <Plus size={24} />
             Crear Nuevo Perfil
           </button>
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <AnimatePresence>
          {roles.map((role, idx) => (
            <motion.div 
              key={role.idRol}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className={`card-3d card-elevated relative group bg-white dark:bg-slate-800/60 rounded-[2.5rem] p-8 border border-gray-100 dark:border-slate-700/50 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all overflow-hidden ${!role.activo ? 'grayscale' : ''}`}
            >
              {/* Status Badge */}
              <div className="absolute top-8 right-8">
                 <button 
                    onClick={() => toggleStatus(role)}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide transition-all ${role.activo ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/30'}`}
                 >
                    {role.activo ? 'Activo' : 'Suspendido'}
                 </button>
              </div>

              {/* Icon & Title */}
              <div className="flex items-start gap-5 mb-8">
                <div className={`p-4 rounded-3xl ${role.nombreRol === 'Administrador' ? 'bg-red-500 text-white' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none'}`}>
                  <Shield size={28} />
                </div>
                <div>
                   <h3 className="text-xl font-semibold text-gray-900 dark:text-white leading-tight">{role.nombreRol}</h3>
                   <div className="flex items-center gap-2 text-gray-400 font-semibold text-xs mt-1">
                      <Users size={14} />
                      {role._count?.usuarios || 0} Usuarios asignados
                   </div>
                </div>
              </div>

              <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 h-10 mb-8 font-medium italic">
                {role.descripcion || 'Sin descripción técnica del perfil.'}
              </p>

              {/* Progress Summary */}
              <div className="space-y-4 mb-10">
                 <div className="flex justify-between items-end">
                    <span className="text-[11px] font-semibold text-indigo-500 uppercase tracking-wide">Cobertura de Privilegios</span>
                    <span className="text-xl font-semibold text-gray-900 dark:text-white">
                        {Object.values(role.permisos || {}).filter(v => v !== false && v !== 'none').length} / {availablePermissions.length}
                    </span>
                 </div>
                 <div className="w-full h-3 bg-gray-100 dark:bg-slate-700/40 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(Object.values(role.permisos || {}).filter(v => v !== false && v !== 'none').length / availablePermissions.length) * 100}%` }}
                        className="h-full bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.3)]"
                    />
                 </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                 <button 
                  onClick={() => { setViewingRole(role); setIsViewDrawerOpen(true); }}
                  className="flex-1 py-3 px-4 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white rounded-2xl font-semibold hover:shadow-md hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 border border-indigo-100 dark:border-indigo-800/60 hover:border-indigo-600 active:scale-[0.98]"
                  title="Ver atribuciones del perfil"
                 >
                    <Eye size={18} />
                    Ver
                 </button>
                 <button 
                  onClick={() => handleOpenDrawer(role)}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white border border-indigo-100 dark:border-indigo-800/60 hover:border-indigo-600 shadow-sm hover:shadow-md hover:shadow-indigo-500/20 hover:-translate-y-0.5 active:scale-95 transition-all"
                  title="Ajustar matriz de seguridad"
                 >
                    <Edit2 size={20} />
                 </button>
                 {role.nombreRol !== 'Administrador' && (
                    <button 
                        onClick={() => handleDelete(role)}
                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-100 dark:border-rose-800/60 hover:border-rose-600 shadow-sm hover:shadow-md hover:shadow-rose-500/20 hover:-translate-y-0.5 active:scale-95 transition-all"
                        title="Eliminar perfil"
                    >
                        <Trash2 size={20} />
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
          <div className="fixed inset-0 z-[100] flex items-center justify-end bg-black/50 dark:bg-black/80 backdrop-blur-md p-0 md:p-6 lg:p-10">
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 150 }}
              className="w-full max-w-4xl h-full bg-gray-50 dark:bg-slate-900 shadow-2xl overflow-hidden md:rounded-[3rem] flex flex-col border-l border-white/10"
            >
              {/* Header */}
              <div className="p-10 card-3d bg-white dark:bg-slate-800/60 border-b border-gray-100 dark:border-slate-700/50 flex items-center justify-between sticky top-0 z-10">
                 <div>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-4">
                       <div className="p-3 bg-indigo-600 text-white rounded-2xl">
                          <Settings size={24} className="animate-[spin_30s_linear_infinite]" />
                       </div>
                       {editingRole ? 'Ajustar Matriz de Seguridad' : 'Nueva Configuración de Acceso'}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Define los límites y capacidades de este perfil en el ecosistema.</p>
                 </div>
                 <button onClick={() => setIsDrawerOpen(false)} className="card-3d p-3 hover:bg-gray-100 dark:hover:bg-slate-700/50 rounded-2xl transition-all text-gray-400">
                    <X size={32} />
                 </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-10 space-y-12">
                
                {/* Basic Info */}
                <div className="card-3d bg-white dark:bg-slate-800/60 p-8 rounded-[2rem] border border-gray-100 dark:border-slate-700/50 space-y-8">
                   <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-indigo-500 flex items-center gap-2">
                       <Info size={14} /> Identidad del Perfil
                   </h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                         <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Nombre Descriptivo</label>
                         <input 
                            required
                            disabled={editingRole?.nombreRol === 'Administrador'}
                            className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 focus:border-indigo-500 dark:text-white transition-all font-semibold disabled:opacity-50"
                            placeholder="Ej: Operador de Punto de Venta"
                            value={formData.nombreRol}
                            onChange={(e) => setFormData({...formData, nombreRol: e.target.value})}
                         />
                      </div>
                      <div className="flex flex-col justify-end">
                         <label className="flex items-center gap-4 p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl cursor-pointer border border-indigo-100/50 dark:border-indigo-800/20 group">
                            <input 
                                type="checkbox"
                                disabled={editingRole?.nombreRol === 'Administrador'}
                                className="w-6 h-6 rounded-lg text-indigo-600 focus:ring-indigo-500"
                                checked={formData.activo}
                                onChange={(e) => setFormData({...formData, activo: e.target.checked})}
                            />
                            <div>
                                <span className="block font-semibold text-indigo-700 dark:text-indigo-400">Perfil Habilitado</span>
                                <span className="text-[11px] text-indigo-400 font-semibold uppercase tracking-tight">Estado de uso</span>
                            </div>
                         </label>
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Descripción de Responsabilidades</label>
                      <textarea 
                        rows="2"
                        className="card-3d w-full px-6 py-4 bg-gray-50 dark:bg-slate-700/40 border-0 rounded-2xl focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 focus:border-indigo-500 dark:text-white transition-all font-medium resize-none shadow-inner"
                        placeholder="Define para qué se usará este rol..."
                        value={formData.descripcion}
                        onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                      />
                   </div>
                </div>

                {/* Matrix Header */}
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                   <div>
                      <h4 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                         <Lock className="text-indigo-500" /> Matriz de Privilegios
                      </h4>
                      <p className="text-gray-500 dark:text-gray-400 font-medium">Configura el acceso granular módulo por módulo.</p>
                   </div>
                   <button 
                    type="button"
                    onClick={grantFullAccess}
                    className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-900 border-2 border-dashed border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 rounded-2xl font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all hover:border-solid hover:border-indigo-500"
                   >
                     <Unlock size={20} /> Entregar Acceso Total
                   </button>
                </div>

                {/* Categories */}
                <div className="space-y-10 pb-20">
                   {Object.entries(permisosAgrupados).map(([cat, permisos], cIdx) => (
                     <motion.div 
                        key={cat}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
                     >
                        <div className="p-6 bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                           <div className="p-2.5 bg-white dark:bg-gray-800 rounded-xl text-indigo-500 shadow-sm">
                              {ICONOS_CATEGORIAS[cat]}
                           </div>
                           <h5 className="font-semibold text-gray-900 dark:text-white tracking-tight uppercase text-sm">{cat}</h5>
                        </div>

                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                           {permisos.map(p => (
                             <div key={p.clave} className="p-6 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                   <div className="flex-1">
                                      <div className="text-base font-semibold text-gray-800 dark:text-white">{p.modulo}</div>
                                      <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mt-1">{p.descripcion || p.label}</p>
                                   </div>
                                   
                                   <div className="flex gap-2">
                                      {p.tipo === 'boolean' ? (
                                         <label className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-xl cursor-pointer">
                                            <button 
                                                type="button"
                                                onClick={() => setFormData({ ...formData, permisos: { ...formData.permisos, [p.clave]: true } })}
                                                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${formData.permisos[p.clave] === true ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                                            >SÍ</button>
                                            <button 
                                                type="button"
                                                onClick={() => setFormData({ ...formData, permisos: { ...formData.permisos, [p.clave]: false } })}
                                                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${!formData.permisos[p.clave] ? 'bg-white dark:bg-gray-700 text-gray-700 dark:text-white shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                                            >NO</button>
                                         </label>
                                      ) : (
                                         <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl gap-1">
                                            {p.opciones.map(opt => {
                                                const isActive = formData.permisos[p.clave] === opt.value;
                                                return (
                                                    <button 
                                                        key={opt.value}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, permisos: { ...formData.permisos, [p.clave]: opt.value } })}
                                                        className={`px-4 py-2 rounded-xl text-[11px] font-semibold uppercase tracking-tight transition-all ${isActive ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
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
              <div className="p-10 card-3d bg-white dark:bg-slate-800/60 border-t border-gray-100 dark:border-slate-700/50 flex gap-6 sticky bottom-0 z-10">
                 <button 
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    className="card-3d flex-1 py-5 bg-gray-100 dark:bg-slate-700/40 text-gray-600 dark:text-gray-300 rounded-[1.5rem] font-semibold text-lg hover:bg-gray-200 dark:hover:bg-slate-600/60 transition-all"
                 > Descartar </button>
                 <button 
                    type="submit"
                    onClick={handleSave}
                    disabled={submitting}
                    className="card-3d card-elevated flex-[2] py-5 bg-indigo-600 text-white rounded-[1.5rem] font-semibold text-xl shadow-2xl shadow-indigo-200 dark:shadow-indigo-900/20 hover:bg-indigo-700 dark:hover:bg-indigo-700 hover:scale-[1.01] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
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
               className="card-3d card-elevated w-full max-w-2xl bg-white dark:bg-slate-800/60 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-100 dark:border-slate-700/50"
             >
                <div className="p-8 card-3d border-b border-gray-100 dark:border-slate-700/50 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg">
                         <UserCheck size={28} />
                      </div>
                      <div>
                         <h3 className="text-xl font-semibold text-gray-900 dark:text-white uppercase tracking-tight">{viewingRole.nombreRol}</h3>
                         <p className="text-gray-400 font-semibold text-xs uppercase tracking-wide">Resumen de Atribuciones</p>
                      </div>
                   </div>
                   <button onClick={() => setIsViewDrawerOpen(false)} className="p-2 text-gray-400 hover:text-gray-900 rounded-full transition-all">
                      <X size={24} />
                   </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                   {Object.entries(permisosAgrupados).map(([cat, permisos]) => (
                     <div key={cat} className="space-y-3">
                        <div className="flex items-center gap-2 text-indigo-500 mb-2">
                           {ICONOS_CATEGORIAS[cat]}
                           <span className="text-[11px] font-semibold uppercase tracking-wide">{cat}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                           {permisos.map(p => {
                             const valor = viewingRole.permisos[p.clave];
                             const active = valor && valor !== 'none' && valor !== false;
                             return (
                               <div key={p.clave} className={`p-4 rounded-2xl border flex items-center justify-between group transition-all ${active ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-800' : 'bg-gray-50/30 dark:bg-gray-800/20 border-gray-100 dark:border-gray-800 opacity-50'}`}>
                                  <div>
                                     <div className={`text-xs font-semibold ${active ? 'text-indigo-700 dark:text-indigo-400' : 'text-gray-400'}`}>{p.modulo}</div>
                                     <div className="text-[11px] font-semibold text-gray-400 dark:text-gray-500">{optLabel(p, valor)}</div>
                                  </div>
                                  {active ? (
                                    <div className="bg-indigo-500 text-white p-1 rounded-lg">
                                       <CheckCircle2 size={12} />
                                    </div>
                                  ) : (
                                    <div className="text-gray-300">
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

                <div className="p-8 card-3d bg-slate-700/30 dark:bg-slate-700/30 border-t border-gray-100 dark:border-slate-700/50">
                   <button 
                    onClick={() => { setIsViewDrawerOpen(false); handleOpenDrawer(viewingRole); }}
                    className="card-3d card-elevated w-full py-4 bg-indigo-600 text-white rounded-2xl font-semibold shadow-xl shadow-indigo-200 dark:shadow-indigo-900/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                   >
                      <Edit2 size={18} />
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
