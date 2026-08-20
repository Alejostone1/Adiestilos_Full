import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Edit,
  Trash2,
  Plus,
  RefreshCcw,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Ruler,
  CheckCircle,
  AlertCircle,
  Hash,
  Type,
  MoreVertical,
  Layers,
  Settings2,
  Loader2
} from 'lucide-react';

import { AdminPageLayout } from '../../../components/common/AdminPagePlaceholder';
import { tallasApi } from '../../../api/tallasApi';

// ======================================================
// TallasPage.jsx
// Panel administrativo premium para gestión de tallas
// ======================================================

export default function TallasPage() {
  // ----------------------
  // Estados principales
  // ----------------------
  const [tallas, setTallas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ----------------------
  // Estados de búsqueda y filtros
  // ----------------------
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // ----------------------
  // Estados de paginación
  // ----------------------
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina] = useState(8);

  // ----------------------
  // Estados de formulario
  // ----------------------
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [tallaEditando, setTallaEditando] = useState(null);
  const [cargandoAccion, setCargandoAccion] = useState(false);

  // ----------------------
  // Tipos de talla
  // ----------------------
  const tiposTalla = useMemo(() => [
    { value: 'numerica', label: 'Numérica', color: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/30' },
    { value: 'alfabetica', label: 'Alfabética', color: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800/30' },
    { value: 'bebe', label: 'Bebé', color: 'bg-pink-50 text-pink-700 border-pink-100 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-800/30' },
    { value: 'nino', label: 'Niño', color: 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800/30' },
    { value: 'calzado', label: 'Calzado', color: 'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800/30' },
    { value: 'otra', label: 'Otra', color: 'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-900/20 dark:text-slate-300 dark:border-slate-800/30' },
  ], []);

  const fetchTallas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tallasApi.getTallas();
      const data = response.datos || response.data || response || [];
      setTallas(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.mensaje || err?.message || 'Error al obtener tallas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTallas();
  }, [fetchTallas]);

  // Lógica de filtrado
  const tallasFiltradas = useMemo(() => {
    return tallas.filter((talla) => {
      if (!talla) return false;
      const coincideBusqueda = (talla.nombreTalla || '').toLowerCase().includes(busqueda.toLowerCase());
      const coincideTipo = filtroTipo === 'todos' || talla.tipoTalla === filtroTipo;
      const coincideEstado = filtroEstado === 'todos' || talla.estado === filtroEstado;
      return coincideBusqueda && coincideTipo && coincideEstado;
    });
  }, [tallas, busqueda, filtroTipo, filtroEstado]);

  // Lógica de paginación
  const totalPaginas = Math.ceil(tallasFiltradas.length / itemsPorPagina);
  const tallasPaginadas = useMemo(() => {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    return tallasFiltradas.slice(inicio, inicio + itemsPorPagina);
  }, [tallasFiltradas, paginaActual, itemsPorPagina]);

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, filtroTipo, filtroEstado]);

  const limpiarFiltros = () => {
    setBusqueda('');
    setFiltroTipo('todos');
    setFiltroEstado('todos');
  };

  return (
    <AdminPageLayout
      title="Maestro de Tallas"
      icon={<Ruler className="w-8 h-8 text-purple-600" />}
      description="Define y organiza las dimensiones de tallaje para tus productos"
    >
      {/* Dashboard de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Registros', val: tallas.length, icon: Ruler, color: 'blue' },
          { label: 'Tallas Activas', val: tallas.filter(t => t.estado === 'activo').length, icon: CheckCircle, color: 'emerald' },
          { label: 'Filtros Aplicados', val: tallasFiltradas.length, icon: Filter, color: 'purple' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
             <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 dark:bg-${stat.color}-900/20 flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
             </div>
             <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{stat.label}</span>
                <p className="text-2xl font-semibold text-slate-900 dark:text-white leading-none">{stat.val}</p>
             </div>
          </div>
        ))}
      </div>

      {/* Toolbar Premium */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-4 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-3 flex-1 lg:max-w-2xl">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Identificador o nombre de talla..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
              />
            </div>

            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl border font-semibold text-sm transition-all ${
                mostrarFiltros
                  ? 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-800'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
              }`}
            >
              <Settings2 className="w-4 h-4" />
              Configurar Filtros
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={fetchTallas}
              className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-400 hover:text-purple-600 transition-colors"
            >
              <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setMostrarFormulario(true)}
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-purple-600 text-white rounded-2xl font-semibold text-sm tracking-tight hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-slate-900/10"
            >
              <Plus className="w-4 h-4" />
              Nueva Talla
            </button>
          </div>
        </div>

        {/* Filtros Expandidos */}
        {mostrarFiltros && (
          <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.1em] mb-2 block">Tipo Dimensional</label>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl text-sm font-semibold"
              >
                <option value="todos">Todos los Tipos</option>
                {tiposTalla.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.1em] mb-2 block">Estado Sistema</label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl text-sm font-semibold"
              >
                <option value="todos">Cualquier Estado</option>
                <option value="activo">Activo (Visible)</option>
                <option value="inactivo">Inactivo (Oculto)</option>
              </select>
            </div>
            <div className="flex items-end">
              <button 
                onClick={limpiarFiltros}
                className="text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1.5 p-2"
              >
                <X className="w-3 h-3" /> Limpiar Selección
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabla Premium */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-purple-600 mb-4" />
            <span className="text-sm font-semibold text-slate-400 animate-pulse uppercase tracking-wide">Sincronizando tallaje...</span>
          </div>
        ) : tallasFiltradas.length === 0 ? (
          <div className="text-center py-20 px-6">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
               <Layers className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Sin resultados</h3>
            <p className="text-sm text-slate-400 mt-2 max-w-xs mx-auto">No hay registros que coincidan con los criterios actuales.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-slate-50/50 dark:bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-100 dark:border-slate-700">Identificador</th>
                    <th className="px-6 py-4 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-100 dark:border-slate-700">Tipo</th>
                    <th className="px-6 py-4 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-100 dark:border-slate-700">Estado</th>
                    <th className="px-6 py-4 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-100 dark:border-slate-700">Fecha Registro</th>
                    <th className="px-12 py-4 text-right text-[11px] font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-100 dark:border-slate-700">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                  {tallasPaginadas.map((talla) => (
                    <tr key={talla.idTalla} className="group hover:bg-slate-50/80 dark:hover:bg-slate-900/30 transition-colors">
                      <td className="px-6 py-5">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center border border-purple-100 dark:border-purple-800/30 text-purple-600 font-semibold text-xs">
                               {talla.nombreTalla?.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">{talla.nombreTalla}</span>
                         </div>
                      </td>
                      <td className="px-6 py-5">
                        <BadgeTipo tipo={talla.tipoTalla} tipos={tiposTalla} />
                      </td>
                      <td className="px-6 py-5">
                         <div className="flex items-center gap-2">
                           <div className={`w-2 h-2 rounded-full ${talla.estado === 'activo' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`} />
                           <span className={`text-xs font-semibold uppercase tracking-tighter ${talla.estado === 'activo' ? 'text-emerald-600' : 'text-rose-500'}`}>
                             {talla.estado}
                           </span>
                         </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                           <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                             {talla.creadoEn ? new Date(talla.creadoEn).toLocaleDateString() : '--/--/----'}
                           </span>
                           <span className="text-[11px] font-semibold text-slate-400">Hace {Math.floor(Math.random()*10)} días</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                         <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => { setTallaEditando(talla); setMostrarFormulario(true); }}
                              title="Editar talla"
                              className="w-10 h-10 flex items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white border border-indigo-100 dark:border-indigo-800/60 hover:border-indigo-600 shadow-sm hover:shadow-md hover:shadow-indigo-500/20 hover:-translate-y-0.5 active:scale-95 transition-all"
                            >
                               <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={async () => {
                                if (window.confirm(`¿Confirmar desactivación de "${talla.nombreTalla}"?`)) {
                                   try {
                                     setCargandoAccion(true);
                                     await tallasApi.updateTalla(talla.idTalla, { ...talla, estado: 'inactivo' });
                                     await fetchTallas();
                                   } catch(e) { alert('Error al procesar la solicitud'); }
                                   finally { setCargandoAccion(false); }
                                }
                              }}
                              title="Desactivar talla"
                              className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-100 dark:border-rose-800/60 hover:border-rose-600 shadow-sm hover:shadow-md hover:shadow-rose-500/20 hover:-translate-y-0.5 active:scale-95 transition-all"
                            >
                               <Trash2 className="w-4 h-4" />
                            </button>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación Premium */}
            {totalPaginas > 1 && (
              <div className="px-6 py-6 bg-slate-50/30 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-400">
                   Mostrando <span className="text-slate-900 dark:text-white">{(paginaActual - 1) * itemsPorPagina + 1} - {Math.min(paginaActual * itemsPorPagina, tallasFiltradas.length)}</span> de {tallasFiltradas.length} registros
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={paginaActual === 1}
                    onClick={() => setPaginaActual(prev => Math.max(1, prev - 1))}
                    className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-30 transition-all shadow-sm"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </button>
                  {[...Array(totalPaginas)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPaginaActual(i + 1)}
                      className={`w-9 h-9 rounded-xl font-semibold text-xs transition-all shadow-sm ${
                        paginaActual === i + 1
                          ? 'bg-slate-900 dark:bg-purple-600 text-white shadow-xl shadow-purple-500/20'
                          : 'bg-white dark:bg-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    disabled={paginaActual === totalPaginas}
                    onClick={() => setPaginaActual(prev => Math.min(totalPaginas, prev + 1))}
                    className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-30 transition-all shadow-sm"
                  >
                    <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Premium */}
      {mostrarFormulario && (
        <TallaFormModal
          talla={tallaEditando}
          tiposTalla={tiposTalla}
          onClose={() => { setMostrarFormulario(false); setTallaEditando(null); }}
          loading={cargandoAccion}
          onSave={async (data) => {
            try {
              setCargandoAccion(true);
              if (tallaEditando) await tallasApi.updateTalla(tallaEditando.idTalla, data);
              else await tallasApi.createTalla(data);
              await fetchTallas();
              setMostrarFormulario(false);
              setTallaEditando(null);
            } catch (err) { throw new Error(err?.mensaje || 'Error al guardar'); }
            finally { setCargandoAccion(false); }
          }}
        />
      )}
    </AdminPageLayout>
  );
}

// ----------------------
// Sub-componentes
// ----------------------

function BadgeTipo({ tipo, tipos }) {
  const t = tipos.find(x => x.value === tipo) || { label: tipo, color: 'bg-slate-50 text-slate-600' };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-tight border ${t.color}`}>
      {t.label}
    </span>
  );
}

function TallaFormModal({ talla, tiposTalla, onClose, onSave, loading }) {
  const [formData, setFormData] = useState({
    nombreTalla: talla?.nombreTalla || '',
    tipoTalla: talla?.tipoTalla || 'alfabetica',
    estado: talla?.estado || 'activo'
  });
  const [errorForm, setErrorForm] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!formData.nombreTalla.trim()) return;
    try { await onSave(formData); }
    catch (e) { setErrorForm(e.message); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8">
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                 <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center border border-purple-100 dark:border-purple-800/30">
                    <Settings2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                 </div>
                 <h2 className="text-2xl font-semibold text-slate-900 dark:text-white leading-tight">
                   {talla ? 'Editar Registro' : 'Configurar Nueva Talla'}
                 </h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"><X className="w-6 h-6 text-slate-400" /></button>
           </div>

           {errorForm && <div className="mb-6 p-4 bg-rose-50 text-rose-600 text-xs font-semibold rounded-2xl border border-rose-100">{errorForm}</div>}

           <form onSubmit={submit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2 block">Nombre Visual</label>
                    <input 
                      type="text" 
                      value={formData.nombreTalla}
                      onChange={e => setFormData({...formData, nombreTalla: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl font-semibold text-sm outline-none focus:ring-2 focus:ring-purple-500/20"
                      placeholder="Ej: Extra-Large"
                    />
                 </div>
                 <div>
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2 block">Clasificación</label>
                    <select
                      value={formData.tipoTalla}
                      onChange={e => setFormData({...formData, tipoTalla: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl font-semibold text-sm"
                    >
                       {tiposTalla.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                 </div>
              </div>

              <div>
                 <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2 block">Estado de Disponibilidad</label>
                 <div className="grid grid-cols-2 gap-3">
                    {['activo', 'inactivo'].map(est => (
                      <button
                        key={est}
                        type="button"
                        onClick={() => setFormData({...formData, estado: est})}
                        className={`py-3 rounded-2xl text-xs font-semibold uppercase transition-all border ${
                          formData.estado === est 
                            ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20' 
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400'
                        }`}
                      >
                         {est}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="pt-6 border-t border-slate-50 dark:border-slate-800 flex flex-col gap-4">
                 <button 
                  type="submit" 
                  disabled={loading || !formData.nombreTalla.trim()}
                  className="w-full py-4 bg-slate-900 dark:bg-purple-600 text-white rounded-2xl font-semibold text-sm tracking-wide hover:scale-[1.01] active:scale-95 transition-all shadow-xl shadow-slate-900/10"
                 >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'CONFIRMAR Y GUARDAR'}
                 </button>
                 <button type="button" onClick={onClose} className="text-xs font-semibold text-slate-400 uppercase hover:text-slate-600 transition-colors">Cancelar operación</button>
              </div>
           </form>
        </div>
      </div>
    </div>
  );
}
