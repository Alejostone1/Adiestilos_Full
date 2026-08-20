import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layout, 
  Typography, 
  message, 
  Spin, 
  Row, 
  Col, 
  Card, 
  Space, 
  Button, 
  Statistic, 
  Badge, 
  Divider,
  Tooltip,
  Avatar,
  Tag
} from 'antd';
import {
  DashboardOutlined,
  ReloadOutlined,
  FilterOutlined,
  ShoppingCartOutlined,
  InboxOutlined,
  CreditCardOutlined,
  ArrowRightOutlined,
  PlusOutlined,
  AppstoreOutlined,
  RiseOutlined,
  AlertOutlined,
  TeamOutlined,
  CalendarOutlined,
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
    <Card 
      hoverable 
      onClick={onClick}
      styles={{ body: { padding: '16px' } }}
      style={{ borderRadius: '12px' }}
      className="quick-action-card bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50"
    >
      <Space orientation="vertical" align="center" style={{ width: '100%' }}>
        <div style={{ 
          backgroundColor: `${color}15`, 
          color: color, 
          padding: '12px', 
          borderRadius: '12px',
          fontSize: '20px'
        }}>
          {icon}
        </div>
        <Text strong style={{ fontSize: '12px' }} className="text-slate-700 dark:text-slate-200">{title}</Text>
      </Space>
    </Card>
  );

  return (
    <div className="dashboard-container relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="bg-mesh">
        <div className="mesh-circle" style={{ top: '-10%', left: '-5%', width: '40%', height: '40%', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' }} />
        <div className="mesh-circle" style={{ bottom: '-10%', right: '-5%', width: '35%', height: '35%', background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)' }} />
      </div>

      <Content className="relative z-10 p-6 md:p-10 max-w-[1700px] mx-auto w-full">
        
        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <AppstoreOutlined className="text-white text-2xl" />
              </div>
              <Title level={1} className="m-0 !font-black !tracking-tighter !text-4xl md:!text-5xl dark:!text-white">
                Dashboard
              </Title>
            </div>
            <Paragraph className="!text-slate-500 dark:!text-slate-400 !text-lg !m-0">
              Bienvenido de nuevo. Aquí tienes un resumen de <span className="font-bold text-gradient dark:text-blue-400">Adi Estilos</span>.
            </Paragraph>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="card-3d p-1.5 flex gap-1 bg-white dark:bg-slate-800/60">
              {['dia', 'semana', 'mes'].map((r) => (
                <button
                  key={r}
                  onClick={() => handleRangoRapido(r)}
                  className={`px-6 py-2.5 rounded-xl font-bold transition-all duration-300 ${
                    filtros.rango === r 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' 
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
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
                className="card-3d w-12 h-12 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-blue-500 transition-colors bg-white dark:bg-slate-800/60"
              >
                <ReloadOutlined className={loading ? 'animate-spin' : ''} />
              </button>
            </Tooltip>

            <button 
              onClick={() => setShowFiltrosAvanzados(!showFiltrosAvanzados)}
              className="card-3d px-6 py-3 flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800/60"
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
                <div className="card-3d h-full p-8 flex flex-col justify-center bg-white dark:bg-slate-800/60">
                  <Title level={4} className="!mb-8 !font-black !flex items-center gap-2 dark:!text-white">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                       <RiseOutlined className="text-blue-500 text-sm" />
                    </div>
                    Accesos Directos
                  </Title>
                  <div className="grid grid-cols-2 gap-4 flex-1">
                    <QuickAction 
                      icon={<PlusOutlined />} 
                      title="Nuevo Producto" 
                      color="#3b82f6"
                      onClick={() => navigate('/admin/productos')}
                    />
                    <QuickAction 
                      icon={<ShoppingCartOutlined />} 
                      title="Crear Venta" 
                      color="#8b5cf6"
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
                <div className="flex flex-col gap-8 h-full">
                   {/* Compact Inventory Status */}
                    <div className="card-3d relative overflow-hidden group flex-1 bg-white dark:bg-slate-800/60">
                      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 blur-[80px] group-hover:bg-blue-500/20 transition-all duration-700" />
                      <div className="p-7 relative z-10 flex flex-col h-full">
                        <Text className="!text-slate-500 dark:!text-slate-400 !font-black !text-[10px] tracking-[0.2em] uppercase block mb-1">Módulo Logístico</Text>
                        <Title level={4} className="!m-0 !font-black !mb-6 dark:!text-white">Inventario Global</Title>
                        
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <Statistic 
                              title={<Text className="!text-slate-400 dark:!text-slate-500 !text-[9px] font-black uppercase">SKUs</Text>}
                              value={dashboardData?.resumenInventario?.totalProductos || 0}
                              styles={{ content: { fontWeight: 900, fontSize: '20px', color: 'var(--text-main)' } }}
                            />
                            <Statistic 
                              title={<Text className="!text-blue-500/80 dark:!text-blue-400 !text-[9px] font-black uppercase">Valor</Text>}
                              value={dashboardData?.resumenInventario?.valorTotalInventario || 0}
                              styles={{ content: { fontWeight: 900, fontSize: '18px', color: 'var(--accent-primary)' } }}
                              formatter={(v) => `$${Number(v).toLocaleString('es-CO')}`}
                            />
                        </div>
                        
                        <button 
                          onClick={() => navigate('/admin/inventario')}
                          className="mt-auto w-full py-3 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all"
                        >
                          Kardex Completo <ArrowRightOutlined className="text-[10px]" />
                        </button>
                      </div>
                    </div>

                    {/* Compact Financial Overview */}
                    <div className="card-3d group flex-1 bg-white dark:bg-slate-800/60">
                       <div className="p-7 relative z-10 flex flex-col h-full">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                              <DollarCircleOutlined className="text-amber-600 dark:text-amber-400 text-lg" />
                            </div>
                            <Title level={4} className="m-0 !font-black dark:!text-white">Cartera Activa</Title>
                          </div>
                          
                          <div className="mb-6">
                            <Statistic 
                                value={dashboardData?.resumenCreditos?.saldoPendienteTotal || 0}
                                prefix="$"
                                styles={{ content: { fontWeight: 900, fontSize: '24px', color: 'var(--text-main)' } }}
                            />
                            <Text className="!text-slate-400 dark:!text-slate-500 !text-xs !font-medium">
                                <span className="text-amber-600 dark:text-amber-400 font-bold">{dashboardData?.resumenCreditos?.creditosActivos || 0} créditos</span> pendientes.
                            </Text>
                          </div>
                           
                          <button 
                            onClick={() => navigate('/admin/ventas-credito')}
                            className="mt-auto w-full py-3 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs transition-all"
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