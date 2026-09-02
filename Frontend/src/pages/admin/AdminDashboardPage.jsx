import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layout, 
  Typography, 
  message, 
  Spin, 
  Row, 
  Col, 
  Tooltip 
} from 'antd';
import {
  ReloadOutlined,
  FilterOutlined,
  ShoppingCartOutlined,
  CreditCardOutlined,
  ArrowRightOutlined,
  PlusOutlined,
  AppstoreOutlined,
  TeamOutlined,
  DollarCircleOutlined
} from '@ant-design/icons';
import {
  obtenerResumenDashboard,
  obtenerReporteInventario,
  obtenerReporteCreditos
} from '../../api/dashboardApi';

// Componentes del dashboard
import DashboardKPIs from '../../components/admin/dashboard/DashboardKPIs';
import FiltrosDashboard from '../../components/admin/dashboard/FiltrosDashboard';
import VentasChart from '../../components/admin/dashboard/VentasChart';
import InventarioAlertas from '../../components/admin/dashboard/InventarioAlertas';
import TopProductos from '../../components/admin/dashboard/TopProductos';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [inventarioData, setInventarioData] = useState(null);
  const [creditosData, setCreditosData] = useState(null);
  const [filtros, setFiltros] = useState({
    rango: 'mes',
    fechaInicio: null,
    fechaFin: null
  });
  const [showFiltrosAvanzados, setShowFiltrosAvanzados] = useState(false);

  const cargarDatosDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const [dashboardResponse, inventarioResponse, creditosResponse] = await Promise.all([
        obtenerResumenDashboard(filtros.rango),
        obtenerReporteInventario('stock_bajo'),
        obtenerReporteCreditos()
      ]);

      setDashboardData(dashboardResponse.datos);
      setInventarioData({
        stockBajo: inventarioResponse.datos || { items: [] },
        sinStock: { items: [] }, // Backend should ideally provide this or we filter it
        movimientosRecientes: { movimientos: [] }
      });
      setCreditosData(creditosResponse.datos);
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
      message.error('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  }, [filtros.rango]);

  useEffect(() => {
    cargarDatosDashboard();
  }, [cargarDatosDashboard]);

  const handleRefresh = () => {
    cargarDatosDashboard();
  };

  const handleRangoRapido = (rango) => {
    setFiltros(prev => ({ ...prev, rango }));
  };

  const QuickAction = ({ icon, title, onClick, color }) => (
    <div 
      onClick={onClick}
      className="card-3d group cursor-pointer flex flex-col items-center gap-3 p-5 text-center hover:-translate-y-1"
    >
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-transform duration-300 group-hover:scale-110"
        style={{ backgroundColor: `${color}15`, color: color }}
      >
        {icon}
      </div>
      <Text style={{ fontSize: '13px', fontWeight: 600 }} className="text-slate-700 dark:text-slate-200 leading-snug">{title}</Text>
    </div>
  );

  return (
    <div className="dashboard-container relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="bg-mesh">
        <div className="mesh-circle" style={{ top: '-10%', left: '-5%', width: '40%', height: '40%', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' }} />
        <div className="mesh-circle" style={{ bottom: '-10%', right: '-5%', width: '35%', height: '35%', background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)' }} />
      </div>

      <Content className="relative z-10 p-5 md:p-8 lg:p-10 max-w-[1700px] mx-auto w-full">
        
        {/* Header Section */}
        <div className="mb-8 md:mb-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/25 bg-gradient-to-br from-pink-500 to-rose-600">
                <AppstoreOutlined className="text-white text-2xl" />
              </div>
              <div>
                <Title level={1} className="m-0 !font-bold !tracking-tight !text-2xl md:!text-3xl text-slate-900 dark:!text-white">
                  Dashboard
                </Title>
                <Text className="!text-slate-500 dark:!text-slate-400 !text-sm md:!text-base !m-0">
                  Bienvenido de nuevo, aquí tienes el resumen de <span className="font-semibold text-pink-600 dark:text-pink-400">Adi Estilos</span>.
                </Text>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="card-3d p-1.5 flex gap-1 bg-white dark:bg-slate-800/60">
              {['dia', 'semana', 'mes'].map((r) => (
                <button
                  key={r}
                  onClick={() => handleRangoRapido(r)}
                  className={`px-4 md:px-5 py-2 rounded-xl font-semibold text-sm transition-all duration-300 ${
                    filtros.rango === r 
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30' 
                      : 'text-slate-500 dark:text-slate-400 hover:bg-pink-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  {r === 'dia' ? 'Hoy' : r === 'semana' ? 'Semana' : 'Mes'}
                </button>
              ))}
            </div>
            
            <Tooltip title="Actualizar Datos">
              <button 
                onClick={handleRefresh}
                disabled={loading}
                className="card-3d w-12 h-12 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-pink-500 transition-colors bg-white dark:bg-slate-800/60"
              >
                <ReloadOutlined className={loading ? 'animate-spin' : ''} />
              </button>
            </Tooltip>

            <button 
              onClick={() => setShowFiltrosAvanzados(!showFiltrosAvanzados)}
              className="card-3d px-5 md:px-6 py-3 flex items-center gap-2 font-semibold text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800/60 hover:text-pink-600 transition-colors"
            >
              <FilterOutlined />
              Filtros
            </button>
          </div>
        </div>

        {showFiltrosAvanzados && (
          <div className="card-3d mb-8 p-6 animate-in slide-in-from-top duration-500 bg-white dark:bg-slate-800/60">
            <FiltrosDashboard 
              filtros={filtros} 
              onFiltrosChange={(f) => { setFiltros(f); setShowFiltrosAvanzados(false); }} 
              onRefresh={handleRefresh}
              compact
            />
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Spin size="large" />
            <Text className="!text-slate-500 animate-pulse font-medium">Sincronizando métricas en tiempo real...</Text>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 1. KPIs Row - High Impact Highlights */}
            <DashboardKPIs data={dashboardData} loading={loading} rango={filtros.rango} />

            {/* 2. Primary Analysis and Management Row */}
            <Row gutter={[32, 32]}>
              {/* Sales Performance Chart (Main Focus) */}
              <Col xs={24} xl={16}>
                <div className="card-3d h-full p-6 md:p-10 flex flex-col bg-white dark:bg-slate-800/60">
                  <VentasChart data={dashboardData} loading={loading} tipo="line" />
                </div>
              </Col>

              {/* Utility Sidebar: Quick Actions (Management) */}
              <Col xs={24} xl={8}>
                <div className="card-3d h-full p-6 md:p-7 flex flex-col bg-white dark:bg-slate-800/60">
                  <Title level={4} className="!mb-1 !font-semibold dark:!text-white">Accesos Directos</Title>
                  <Paragraph className="!text-slate-500 dark:!text-slate-400 !text-sm !mb-6">Tus acciones más frecuentes</Paragraph>
                  <div className="grid grid-cols-2 gap-4 flex-1">
                    <QuickAction 
                      icon={<PlusOutlined />} 
                      title="Nuevo Producto" 
                      color="#ec4899"
                      onClick={() => navigate('/admin/productos')}
                    />
                    <QuickAction 
                      icon={<ShoppingCartOutlined />} 
                      title="Crear Venta" 
                      color="#db2777"
                      onClick={() => navigate('/admin/ventas')}
                    />
                    <QuickAction 
                      icon={<TeamOutlined />} 
                      title="Clientes" 
                      color="#10b981"
                      onClick={() => navigate('/admin/usuarios')}
                    />
                    <QuickAction 
                      icon={<CreditCardOutlined />} 
                      title="Créditos" 
                      color="#f59e0b"
                      onClick={() => navigate('/admin/ventas-credito')}
                    />
                  </div>
                </div>
              </Col>
            </Row>

            {/* 3. Secondary Metrics Grid: Balanced 3 Columns */}
            <Row gutter={[32, 32]}>
              {/* Best Sellers Column */}
              <Col xs={24} lg={8}>
                <div className="card-3d h-full p-8 bg-white dark:bg-slate-800/60">
                  <TopProductos data={dashboardData} loading={loading} />
                </div>
              </Col>
              
              {/* Status Alertas Column */}
              <Col xs={24} lg={8}>
                <div className="card-3d h-full p-8 bg-white dark:bg-slate-800/60">
                  <InventarioAlertas data={inventarioData} loading={loading} />
                </div>
              </Col>

              {/* Business Health Snapshot Column */}
              <Col xs={24} lg={8}>
                <div className="flex flex-col gap-6 h-full">
                   {/* Compact Inventory Status */}
                    <div className="card-3d relative overflow-hidden group flex-1 bg-white dark:bg-slate-800/60 p-6 md:p-7">
                      <div className="absolute -top-20 -right-20 w-44 h-44 bg-pink-500/10 blur-[70px] group-hover:bg-pink-500/20 transition-all duration-700" />
                      <div className="relative z-10 flex flex-col h-full">
                        <Text className="!text-slate-400 dark:!text-slate-500 !font-semibold !text-[11px] tracking-[0.14em] uppercase block mb-1">Módulo Logístico</Text>
                        <Title level={4} className="!m-0 !font-semibold !mb-6 dark:!text-white">Inventario Global</Title>
                        
                        <div className="grid grid-cols-2 gap-5 mb-6">
                            <div className="p-4 rounded-2xl bg-pink-50/70 dark:bg-pink-900/20 border border-pink-100 dark:border-pink-800/40">
                              <Text className="!text-pink-500/90 dark:!text-pink-300 !text-[11px] font-semibold uppercase block mb-1">SKUs</Text>
                              <Text className="!text-2xl !font-bold !text-slate-900 dark:!text-white">{dashboardData?.resumenInventario?.totalProductos || 0}</Text>
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/30 border border-slate-100 dark:border-slate-700">
                              <Text className="!text-slate-400 dark:!text-slate-500 !text-[11px] font-semibold uppercase block mb-1">Valor</Text>
                              <Text className="!text-lg !font-bold !text-slate-900 dark:!text-white">${Number(dashboardData?.resumenInventario?.valorTotalInventario || 0).toLocaleString('es-CO')}</Text>
                            </div>
                        </div>
                        
                        <button 
                          onClick={() => navigate('/admin/inventario')}
                          className="mt-auto w-full py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-pink-500/25 transition-all"
                        >
                          Kardex Completo <ArrowRightOutlined className="text-[11px]" />
                        </button>
                      </div>
                    </div>

                    {/* Compact Financial Overview */}
                    <div className="card-3d group flex-1 bg-white dark:bg-slate-800/60 p-6 md:p-7">
                       <div className="relative z-10 flex flex-col h-full">
                          <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                              <DollarCircleOutlined className="text-amber-600 dark:text-amber-400 text-lg" />
                            </div>
                            <Title level={4} className="m-0 !font-semibold dark:!text-white">Cartera Activa</Title>
                          </div>
                          
                          <div className="mb-5">
                            <Text className="!text-3xl !font-bold !text-slate-900 dark:!text-white block">${Number(dashboardData?.resumenCreditos?.saldoPendienteTotal || 0).toLocaleString('es-CO')}</Text>
                            <Text className="!text-slate-400 dark:!text-slate-500 !text-sm !font-medium block mt-1">
                                <span className="text-amber-600 dark:text-amber-400 font-semibold">{dashboardData?.resumenCreditos?.creditosActivos || 0} créditos</span> pendientes.
                            </Text>
                          </div>
                            
                          <button 
                            onClick={() => navigate('/admin/ventas-credito')}
                            className="mt-auto w-full py-3 border border-pink-200 dark:border-pink-800/50 hover:bg-pink-50 dark:hover:bg-pink-900/20 text-pink-600 dark:text-pink-400 rounded-xl font-semibold text-xs transition-all"
                          >
                            Gestionar Cobros
                          </button>
                       </div>
                    </div>
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Content>
      
      <style>{`
        .quick-action-card {
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
        }
        .quick-action-card:hover {
          transform: scale(1.05) translateY(-5px) !important;
          background: rgba(255, 255, 255, 0.95);
        }
        .dark .quick-action-card:hover {
          background: rgba(71, 85, 105, 0.6);
          border-color: rgba(107, 114, 128, 0.7);
        }
        .credit-stat .ant-statistic-content {
          color: var(--text-main) !important;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboardPage;