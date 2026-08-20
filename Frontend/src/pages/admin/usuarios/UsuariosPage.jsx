import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  UserPlus,
  RefreshCcw,
  Edit3,
  Eye,
  Wallet,
  History,
  Mail,
  Phone,
  MapPin,
  MoreVertical,
  Shield,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  CreditCard,
  ShoppingBag,
  ArrowRight,
  X,
  Plus,
  Filter,
  Download,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usuariosApi } from "../../../api/usuariosApi";
import { rolesApi } from "../../../api/rolesApi";
import { useAuth } from "../../../context/AuthContext";
import PrecioFormateado from '../../../components/common/PrecioFormateado';
import Swal from 'sweetalert2';

export default function UsuariosPage() {
  const navigate = useNavigate();
  const { token } = useAuth();

  // Estados
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRol, setFilterRol] = useState('all');
  const [filterEstado, setFilterEstado] = useState('all');
  
  // Modales/Drawers
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    usuario: '',
    correoElectronico: '',
    telefono: '',
    direccion: '',
    idRol: '',
    estado: 'activo',
    contrasena: ''
  });

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      const [usrRes, rolesRes] = await Promise.all([
        usuariosApi.getUsuarios(),
        rolesApi.getRoles()
      ]);
      setUsuarios(usrRes.datos || usrRes.data || usrRes || []);
      setRoles(rolesRes.datos || rolesRes || []);
    } catch (error) {
      console.error('Error cargando datos:', error);
      Swal.fire('Error', 'No se pudieron cargar los usuarios', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Filtrado
  const filteredUsers = useMemo(() => {
    return usuarios.filter(u => {
      const fullText = `${u.nombres} ${u.apellidos} ${u.usuario} ${u.correoElectronico}`.toLowerCase();
      const matchesSearch = fullText.includes(searchTerm.toLowerCase());
      const matchesRol = filterRol === 'all' || u.rol?.nombreRol === filterRol;
      const matchesEstado = filterEstado === 'all' || u.estado === filterEstado;
      return matchesSearch && matchesRol && matchesEstado;
    });
  }, [usuarios, searchTerm, filterRol, filterEstado]);

  // Handlers
  const handleOpenModal = (user = null) => {
    if (user) {
      setIsEditing(true);
      setSelectedUser(user);
      setFormData({
        nombres: user.nombres || '',
        apellidos: user.apellidos || '',
        usuario: user.usuario || '',
        correoElectronico: user.correoElectronico || '',
        telefono: user.telefono || '',
        direccion: user.direccion || '',
        idRol: user.rol?.idRol || '',
        estado: user.estado || 'activo',
        contrasena: ''
      });
    } else {
      setIsEditing(false);
      setSelectedUser(null);
      setFormData({
        nombres: '',
        apellidos: '',
        usuario: '',
        correoElectronico: '',
        telefono: '',
        direccion: '',
        idRol: '',
        estado: 'activo',
        contrasena: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const data = { ...formData };
      if (isEditing) {
        delete data.contrasena; // No enviamos contraseña si estamos editando (a menos que haya un campo separado)
        await usuariosApi.updateUsuario(selectedUser.idUsuario, data);
        Swal.fire({
          icon: 'success',
          title: 'Usuario Actualizado',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      } else {
        await usuariosApi.createUsuario(data);
        Swal.fire({
          icon: 'success',
          title: 'Usuario Creado',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      }
      setIsModalOpen(false);
      cargarDatos();
    } catch (error) {
      Swal.fire('Error', error.response?.data?.mensaje || 'Error al guardar el usuario', 'error');
    }
  };

  const toggleEstado = async (user) => {
    const nuevoEstado = user.estado === 'activo' ? 'inactivo' : 'activo';
    const result = await Swal.fire({
      title: '¿Cambiar estado?',
      text: `El usuario pasará a estar ${nuevoEstado}.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await usuariosApi.changeEstadoUsuario(user.idUsuario, nuevoEstado);
        cargarDatos();
        Swal.fire('¡Listo!', 'Estado actualizado.', 'success');
      } catch (error) {
        Swal.fire('Error', 'No se pudo cambiar el estado', 'error');
      }
    }
  };

  // UI Components
  const getColorClasses = (color) => {
    const colorMap = {
      blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
      emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
      amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
      purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
    };
    return colorMap[color] || colorMap.blue;
  };

  const StatCard = ({ title, value, color, icon: Icon, subtext }) => (
    <div className="card-3d card-elevated bg-white dark:bg-slate-800/60 rounded-2xl p-6 border border-gray-100 dark:border-slate-700/50 flex items-center gap-6 overflow-hidden relative group">
      <div className={`p-4 rounded-xl ${getColorClasses(color)} relative z-10 transition-transform group-hover:scale-110 duration-300`}>
        <Icon size={28} />
      </div>
      <div className="relative z-10">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</h3>
        {subtext && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtext}</p>}
      </div>
      <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500 text-gray-400 dark:text-gray-600">
        <Icon size={120} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-4 md:p-8 space-y-8 transition-colors duration-300">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-4">
            <div className="card-3d p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200 dark:shadow-none">
              <Users size={32} />
            </div>
            Gestión de Usuarios
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">Administra tus colaboradores y clientes desde un solo lugar.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={cargarDatos}
            className="card-3d p-3 bg-white dark:bg-slate-800/60 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all shadow-sm"
          >
            <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleOpenModal()}
            className="card-3d card-elevated flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all"
          >
            <Plus size={20} />
            Nuevo Registro
          </motion.button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Usuarios" 
          value={usuarios.length} 
          color="blue" 
          icon={Users}
          subtext="Registrados en el sistema"
        />
        <StatCard 
          title="Usuarios Activos" 
          value={usuarios.filter(u => u.estado === 'activo').length} 
          color="emerald" 
          icon={CheckCircle2}
          subtext="Cuentas con acceso"
        />
        <StatCard 
          title="Saldo en Créditos" 
          value={<PrecioFormateado precio={usuarios.reduce((acc, u) => acc + (parseFloat(u.resumenCredito?.saldoTotal) || 0), 0)} />} 
          color="amber" 
          icon={Wallet}
          subtext="Créditos pendientes"
        />
        <StatCard 
          title="Roles Definidos" 
          value={roles.length} 
          color="purple" 
          icon={Shield}
          subtext="Perfiles de acceso"
        />
      </div>

      {/* Main Content Area */}
      <div className="card-3d card-elevated bg-white dark:bg-slate-800/60 rounded-3xl overflow-hidden">
        
        {/* Filters & Tools */}
        <div className="p-6 border-b border-gray-50 dark:border-slate-700/50 flex flex-col lg:flex-row items-center gap-6 justify-between bg-gray-50/30 dark:bg-slate-800/30">
          <div className="relative w-full lg:max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-indigo-500 transition-colors" size={20} />
            <input 
              type="text"
              placeholder="Buscar por nombre, correo o @usuario..."
              className="card-3d w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-700/40 border-0 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 focus:border-indigo-400 dark:text-white transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
            <div className="card-3d flex items-center gap-2 bg-white dark:bg-slate-700/40 p-1.5 rounded-2xl shadow-sm">
              <select 
                className="bg-transparent border-none text-sm font-semibold text-gray-600 dark:text-gray-300 focus:ring-0 cursor-pointer px-3 py-1.5"
                value={filterRol}
                onChange={(e) => setFilterRol(e.target.value)}
              >
                <option value="all">Todos los Roles</option>
                {roles.map(r => <option key={r.idRol} value={r.nombreRol}>{r.nombreRol}</option>)}
              </select>
              <div className="w-px h-6 bg-gray-200 dark:bg-slate-600/50" />
              <select 
                className="bg-transparent border-none text-sm font-semibold text-gray-600 dark:text-gray-300 focus:ring-0 cursor-pointer px-3 py-1.5"
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
              >
                <option value="all">Cualquier Estado</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="bloqueado">Bloqueado</option>
              </select>
            </div>
            
            <button className="hidden md:flex items-center gap-2 px-4 py-3 text-gray-600 dark:text-gray-300 hover:bg-slate-700/30 dark:hover:bg-slate-700/50 rounded-xl transition-colors font-medium">
              <Download size={18} />
              Exportar
            </button>
          </div>
        </div>

        {/* User List / Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-slate-800/30 text-left">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-slate-700/50">Identidad</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-slate-700/50">Contacto</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-slate-700/50">Rol y Perfil</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-slate-700/50">Actividad</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-slate-700/50">Estado</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right border-b border-gray-100 dark:border-slate-700/50">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
              <AnimatePresence>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400">
                          <Users size={40} />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">No se encontraron usuarios con esos filtros.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u, idx) => (
                    <motion.tr 
                      key={u.idUsuario}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors group"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className={`card-3d w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg ${u.estado === 'activo' ? 'bg-gradient-to-br from-indigo-500 to-blue-600 shadow-blue-200/50 dark:shadow-none' : 'bg-gray-400'}`}>
                            {u.nombres?.charAt(0)}{u.apellidos?.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{u.nombres} {u.apellidos}</div>
                            <div className="text-xs font-mono text-gray-400 dark:text-gray-500">@{u.usuario}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-1.5 text-sm">
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <Mail size={14} className="text-indigo-500" />
                            {u.correoElectronico}
                          </div>
                          {u.telefono && (
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                              <Phone size={14} className="text-emerald-500" />
                              {u.telefono}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-tight
                          ${u.rol?.nombreRol === 'Administrador' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 
                            u.rol?.nombreRol === 'Vendedor' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 
                            'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                          <Shield size={12} />
                          {u.rol?.nombreRol}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center">
                            <ShoppingBag size={18} className="text-indigo-400" />
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-1">{u._count?.ventasComoCliente || 0}</span>
                          </div>
                          <div className="w-px h-8 bg-gray-100 dark:bg-gray-800" />
                          <div className="flex flex-col items-center">
                            <Wallet size={18} className={u.resumenCredito?.saldoTotal > 0 ? 'text-amber-500' : 'text-gray-300'} />
                            <span className={`text-xs font-bold mt-1 ${u.resumenCredito?.saldoTotal > 0 ? 'text-amber-600' : 'text-gray-400'}`}>
                              {u.resumenCredito?.saldoTotal > 0 ? 'Con Deuda' : 'Al día'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <button 
                          onClick={() => toggleEstado(u)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all
                          ${u.estado === 'activo' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 ring-2 ring-emerald-50 dark:ring-0' : 
                            'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 ring-2 ring-rose-50 dark:ring-0'}`}
                        >
                          {u.estado}
                        </button>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => { setSelectedUser(u); setIsDetailsOpen(true); }}
                            className="card-3d p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                            title="Ver Perfil"
                          >
                            <Eye size={18} />
                          </motion.button>
                          
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleOpenModal(u)}
                            className="card-3d p-2 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit3 size={18} />
                          </motion.button>
                          
                          <div className="w-px h-6 bg-gray-100 dark:bg-slate-600/50 mx-1" />
                          
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => navigate(`/admin/usuarios/${u.idUsuario}/ventas`)}
                            className="card-3d p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
                            title="Ver Ventas"
                          >
                            <History size={18} />
                          </motion.button>
                          
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => navigate(`/admin/usuarios/${u.idUsuario}/creditos`)}
                            className="card-3d p-2 text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/30 rounded-lg transition-colors"
                            title="Ver Créditos"
                          >
                            <CreditCard size={18} />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        
        {/* Footer info */}
        <div className="p-6 bg-gray-50/50 dark:bg-slate-800/30 border-t border-gray-100 dark:border-slate-700/50 flex justify-between items-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Mostrando <span className="text-indigo-600 dark:text-indigo-400 font-bold">{filteredUsers.length}</span> de <span className="font-bold">{usuarios.length}</span> registros totales
            </p>
            <div className="flex gap-2">
              <button disabled className="card-3d px-4 py-2 bg-white dark:bg-slate-800/40 rounded-xl text-sm font-bold text-gray-400 dark:text-gray-600 disabled:cursor-not-allowed">Anterior</button>
              <button disabled className="card-3d px-4 py-2 bg-white dark:bg-slate-800/40 rounded-xl text-sm font-bold text-gray-400 dark:text-gray-600 disabled:cursor-not-allowed">Siguiente</button>
            </div>
        </div>
      </div>

      {/* --- FORM MODAL (Wizard/Drawer style) --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-end bg-black/40 dark:bg-black/60 backdrop-blur-sm p-0 md:p-6">
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="card-3d card-elevated w-full max-w-2xl h-full bg-white dark:bg-slate-800/60 shadow-2xl overflow-y-auto md:rounded-3xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="card-3d p-8 border-b border-gray-50 dark:border-slate-700/50 flex items-center justify-between bg-white dark:bg-slate-800/60 sticky top-0 z-10">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                    <div className={`card-3d p-2 rounded-xl ${isEditing ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
                      {isEditing ? <Edit3 size={24} /> : <UserPlus size={24} />}
                    </div>
                    {isEditing ? 'Actualizar Información' : 'Nuevo Colaborador / Cliente'}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">Completa todos los campos requeridos para continuar.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="card-3d p-2 hover:bg-gray-100 dark:hover:bg-slate-700/50 rounded-xl transition-all text-gray-400 hover:text-gray-950 dark:hover:text-white">
                  <X size={28} />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSave} className="p-8 space-y-8 flex-1">
                <div className="space-y-6">
                  <h4 className="text-xs font-black uppercase tracking-widest text-indigo-500 dark:text-indigo-400">Datos Personales</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Nombres</label>
                       <input 
                        required
                        type="text" 
                        className="card-3d w-full px-4 py-3 bg-gray-50 dark:bg-slate-700/40 border-0 rounded-2xl focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30 focus:border-indigo-500 dark:text-white transition-all"
                        placeholder="Ej: Juan Camilo"
                        value={formData.nombres}
                        onChange={(e) => setFormData({...formData, nombres: e.target.value})}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Apellidos</label>
                       <input 
                        required
                        type="text" 
                        className="card-3d w-full px-4 py-3 bg-gray-50 dark:bg-slate-700/40 border-0 rounded-2xl focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30 focus:border-indigo-500 dark:text-white transition-all"
                        placeholder="Ej: Pérez García"
                        value={formData.apellidos}
                        onChange={(e) => setFormData({...formData, apellidos: e.target.value})}
                       />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Dirección de Domicilio</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="text" 
                        className="card-3d w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-slate-700/40 border-0 rounded-2xl focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30 focus:border-indigo-500 dark:text-white transition-all"
                        placeholder="Calle, Carrera, Barrio..."
                        value={formData.direccion}
                        onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-xs font-black uppercase tracking-widest text-indigo-500 dark:text-indigo-400">Credenciales y Acceso</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">@Usuario (Login)</label>
                       <input 
                        required
                        type="text" 
                        className="card-3d w-full px-4 py-3 bg-gray-50 dark:bg-slate-700/40 border-0 rounded-2xl focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30 focus:border-indigo-500 dark:text-white transition-all shadow-inner"
                        placeholder="nombre_usuario"
                        value={formData.usuario}
                        onChange={(e) => setFormData({...formData, usuario: e.target.value})}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Correo Electrónico</label>
                       <input 
                        required
                        type="email" 
                        className="card-3d w-full px-4 py-3 bg-gray-50 dark:bg-slate-700/40 border-0 rounded-2xl focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30 focus:border-indigo-500 dark:text-white transition-all"
                        placeholder="ejemplo@correo.com"
                        value={formData.correoElectronico}
                        onChange={(e) => setFormData({...formData, correoElectronico: e.target.value})}
                       />
                    </div>
                  </div>

                  {!isEditing && (
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1 text-red-500">Contraseña de Seguridad</label>
                      <input 
                        required
                        type="password" 
                        className="card-3d w-full px-4 py-3 bg-gray-50 dark:bg-slate-700/40 border-0 rounded-2xl focus:ring-4 focus:ring-red-50 dark:focus:ring-red-900/30 focus:border-red-500 dark:text-white transition-all"
                        placeholder="Mínimo 8 caracteres"
                        value={formData.contrasena}
                        onChange={(e) => setFormData({...formData, contrasena: e.target.value})}
                      />
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 italic font-medium ml-2">El usuario podrá cambiarla después de su primer ingreso.</p>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <h4 className="text-xs font-black uppercase tracking-widest text-indigo-500 dark:text-indigo-400">Permisos y Estado</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Perfil / Rol</label>
                       <select 
                        required
                        className="card-3d w-full px-4 py-3 bg-gray-50 dark:bg-slate-700/40 border-0 rounded-2xl focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30 focus:border-indigo-500 dark:text-white transition-all"
                        value={formData.idRol}
                        onChange={(e) => setFormData({...formData, idRol: e.target.value})}
                       >
                         <option value="">Selecciona Perfil...</option>
                         {roles.map(r => <option key={r.idRol} value={r.idRol}>{r.nombreRol}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Teléfono Móvil</label>
                       <input 
                        type="text" 
                        className="card-3d w-full px-4 py-3 bg-gray-50 dark:bg-slate-700/40 border-0 rounded-2xl focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30 focus:border-indigo-500 dark:text-white transition-all"
                        placeholder="300 000 0000"
                        value={formData.telefono}
                        onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                       />
                    </div>
                  </div>
                  
                  <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded-md text-indigo-600 focus:ring-indigo-500"
                        checked={formData.estado === 'activo'}
                        onChange={(e) => setFormData({...formData, estado: e.target.checked ? 'activo' : 'inactivo'})}
                      />
                      <div>
                        <span className="text-sm font-bold text-indigo-700 dark:text-indigo-400">Usuario Activo</span>
                        <p className="text-xs text-indigo-600/60 dark:text-indigo-400/50">Permitir inmediatamente el ingreso al sistema.</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="pt-8 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="card-3d flex-1 py-4 px-6 bg-gray-100 dark:bg-slate-700/40 text-gray-600 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-slate-600/60 transition-all"
                  >
                    Descartar
                  </button>
                  <button 
                    type="submit"
                    className="card-3d card-elevated flex-[2] py-4 px-6 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-200 dark:shadow-indigo-900/20 hover:bg-indigo-700 dark:hover:bg-indigo-700 hover:scale-[1.01] active:scale-[0.99] transition-all"
                  >
                    {isEditing ? 'Guardar Cambios' : 'Confirmar Registro'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- DETAILS MODAL --- */}
      <AnimatePresence>
        {isDetailsOpen && selectedUser && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-md p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="card-3d card-elevated w-full max-w-4xl bg-white dark:bg-slate-800/60 rounded-[2.5rem] shadow-2xl overflow-hidden relative border border-gray-200 dark:border-slate-700/50"
            >
              <button 
                onClick={() => setIsDetailsOpen(false)}
                className="card-3d absolute top-6 right-6 p-2 bg-gray-100 dark:bg-slate-700/50 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all z-20"
              >
                <X size={20} />
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* Left Side: Profile Summary */}
                <div className="lg:col-span-5 bg-gradient-to-br from-indigo-600 to-blue-700 p-10 text-white flex flex-col items-center text-center">
                  <div className="w-40 h-40 bg-white/20 backdrop-blur-md rounded-[3rem] p-1.5 border border-white/20 shadow-2xl mb-6">
                    <div className="w-full h-full bg-white rounded-[2.8rem] flex items-center justify-center text-5xl font-black text-indigo-600">
                      {selectedUser.nombres?.charAt(0)}{selectedUser.apellidos?.charAt(0)}
                    </div>
                  </div>
                  
                  <h3 className="text-3xl font-black tracking-tight">{selectedUser.nombres} {selectedUser.apellidos}</h3>
                  <p className="text-indigo-100 font-medium opacity-80 mt-1">@{selectedUser.usuario}</p>
                  
                  <div className="mt-8 px-6 py-3 bg-white/10 backdrop-blur rounded-2xl border border-white/10 w-full">
                    <div className="text-xs font-black uppercase text-indigo-200 tracking-widest mb-1 text-left">Asignación</div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold flex items-center gap-2"><Shield size={16}/> {selectedUser.rol?.nombreRol}</span>
                      <span className="text-xs bg-white text-indigo-600 px-2 py-0.5 rounded-lg font-black">{selectedUser.estado}</span>
                    </div>
                  </div>

                  <div className="mt-10 grid grid-cols-2 gap-4 w-full">
                     <div className="bg-black/10 rounded-2xl p-4 text-left border border-white/5">
                        <TrendingUp size={20} className="mb-2 opacity-60" />
                        <div className="text-2xl font-black">{selectedUser._count?.ventasComoCliente || 0}</div>
                        <div className="text-[10px] uppercase font-bold text-indigo-200">Total Compras</div>
                     </div>
                     <div className="bg-black/10 rounded-2xl p-4 text-left border border-white/5">
                        <Wallet size={20} className="mb-2 opacity-60" />
                        <div className="text-lg font-black leading-tight">
                            <PrecioFormateado precio={selectedUser.resumenCredito?.saldoTotal || 0} />
                        </div>
                        <div className="text-[10px] uppercase font-bold text-indigo-200">Saldo Deuda</div>
                     </div>
                  </div>

                  <div className="mt-auto pt-10 w-full flex flex-col gap-3">
                     <button 
                        onClick={() => { setIsDetailsOpen(false); handleOpenModal(selectedUser); }}
                        className="w-full py-4 bg-white text-indigo-700 rounded-2xl font-black shadow-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                      >
                       <Edit3 size={18} />
                       Editar Perfil
                     </button>
                  </div>
                </div>

                {/* Right Side: Detailed Info */}
                <div className="lg:col-span-7 p-10 bg-white dark:bg-slate-800/50 overflow-y-auto max-h-[80vh] lg:max-h-none">
                  <h4 className="text-xl font-black text-gray-900 dark:text-white mb-8 border-b border-gray-100 dark:border-slate-700/50 pb-4">Detalles de Contacto y Cuenta</h4>
                  
                  <div className="space-y-8">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl">
                        <Mail size={24} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Correo Corporativo / Personal</p>
                        <p className="text-lg font-bold text-gray-700 dark:text-gray-300 break-all">{selectedUser.correoElectronico}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl">
                        <Phone size={24} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Teléfono Móvil / WhatsApp</p>
                        <p className="text-lg font-bold text-gray-700 dark:text-gray-300">{selectedUser.telefono || 'Información no proporcionada'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-2xl">
                        <MapPin size={24} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Dirección Registrada</p>
                        <p className="text-lg font-bold text-gray-700 dark:text-gray-300">{selectedUser.direccion || 'Sin dirección de domicilio'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl">
                        <Calendar size={24} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Fecha de Registro</p>
                        <p className="text-lg font-bold text-gray-700 dark:text-gray-300">
                          {new Date(selectedUser.creadoEn).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 p-6 bg-gray-50 dark:bg-slate-700/30 rounded-3xl border border-dashed border-gray-200 dark:border-slate-600/50">
                    <h5 className="font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                       <History size={18} className="text-indigo-500" />
                       Accesos Rápidos
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                       <button 
                        onClick={() => navigate(`/admin/usuarios/${selectedUser.idUsuario}/ventas`)}
                        className="card-3d py-3 px-4 bg-white dark:bg-slate-700/40 border border-gray-200 dark:border-slate-600 rounded-2xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:border-indigo-500 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all flex items-center justify-between"
                       >
                         Historial Ventas
                         <ArrowRight size={16} />
                       </button>
                       <button 
                        onClick={() => navigate(`/admin/usuarios/${selectedUser.idUsuario}/creditos`)}
                        className="card-3d py-3 px-4 bg-white dark:bg-slate-700/40 border border-gray-200 dark:border-slate-600 rounded-2xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:border-indigo-500 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all flex items-center justify-between"
                       >
                         Gestión Créditos
                         <ArrowRight size={16} />
                       </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}