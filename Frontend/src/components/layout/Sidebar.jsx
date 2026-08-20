import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaShoppingCart,
  FaUsers,
  FaChartBar,
  FaSignOutAlt,
  FaTags,
  FaPalette,
  FaRuler,
  FaBox,
  FaExchangeAlt,
  FaCreditCard,
  FaTruck,
  FaUndo,
  FaPercent,
  FaFileInvoiceDollar,
  FaUserShield,
  FaChevronDown,
  FaChevronRight,
  FaHeart,
  FaStore,
  FaClipboardList,
  FaWarehouse,
  FaShoppingBag,
  FaCoins,
  FaReceipt,
  FaChartLine,
  FaUserCog,
  FaSearch,
  FaBars,
  FaTimes,
  FaMoon,
  FaSun
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { tienePermiso } from "../../utils/permisosHelper";
import ThemeSwitch from '../common/ThemeSwitch';
import Swal from "sweetalert2";
import { Typography, Skeleton } from 'antd';

const { Title, Text } = Typography;

const Sidebar = () => {
  const { logout, usuario, estaAutenticado } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Si no hay usuario autenticado, no renderizar el sidebar
  if (!estaAutenticado || !usuario) {
    return null;
  }

  const [openSections, setOpenSections] = useState({
    productos: false,
    inventario: false,
    ventas: false,
    compras: false,
    creditos: false,
    devoluciones: false,
    descuentos: false,
    pagos: false,
    reportes: false,
    usuarios: false
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState) {
      setSidebarCollapsed(JSON.parse(savedState));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  useEffect(() => {
    // Cerrar menú móvil al cambiar de ruta
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Estás a punto de cerrar tu sesión.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#6b7280",
      customClass: {
        popup: 'dark:bg-slate-800 dark:text-white',
        title: 'dark:text-white',
        htmlContainer: 'dark:text-gray-300'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate("/login");
      }
    });
  };

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const isActive = (path) => {
    // Solo Dashboard tiene coincidencia exacta automática
    if (path === "/admin/dashboard") {
      return location.pathname === "/admin/dashboard" || location.pathname === "/admin";
    }
    // Para otros, requiere coincidencia exacta
    return location.pathname === path;
  };

  const menuSections = [
    {
      title: "Dashboard",
      icon: <FaTachometerAlt />,
      path: "/admin/dashboard",
      key: "dashboard", // Agregado key para mapear con permisos
      items: [],
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Usuarios",
      icon: <FaUsers />,
      key: "usuarios",
      color: "from-blue-500 to-cyan-500",
      items: [
        { text: "Usuarios", icon: <FaUsers />, path: "/admin/usuarios" },
        { text: "Roles", icon: <FaUserShield />, path: "/admin/roles" }
      ]
    },
    {
      title: "Productos",
      icon: <FaStore />,
      key: "productos",
      color: "from-emerald-500 to-teal-500",
      items: [
        { text: "Productos", icon: <FaShoppingBag />, path: "/admin/productos" },
        { text: "Variantes", icon: <FaTags />, path: "/admin/productos/variantes" },
        { text: "Galería", icon: <FaPalette />, path: "/admin/productos/galeria" },
        { text: "Categorías", icon: <FaTags />, path: "/admin/categorias" },
        { text: "Colores", icon: <FaPalette />, path: "/admin/colores" },
        { text: "Tallas", icon: <FaRuler />, path: "/admin/tallas" }
      ]
    },
    {
      title: "Inventario",
      icon: <FaWarehouse />,
      key: "inventario",
      color: "from-amber-500 to-orange-500",
      items: [
        { text: "Inventario", icon: <FaBox />, path: "/admin/inventario" },
        { text: "Movimientos", icon: <FaExchangeAlt />, path: "/admin/inventario/movimientos" },
        { text: "Tipos Movimiento", icon: <FaClipboardList />, path: "/admin/inventario/tipos-movimiento" },
        { text: "Ajustes", icon: <FaWarehouse />, path: "/admin/inventario/ajustes" }
      ]
    },
    {
      title: "Ventas",
      icon: <FaShoppingCart />,
      key: "ventas",
      color: "from-rose-500 to-red-500",
      items: [
        { text: "Ventas", icon: <FaShoppingCart />, path: "/admin/ventas" },
        { text: "Detalles Ventas", icon: <FaFileInvoiceDollar />, path: "/admin/ventas/detalles" },
        { text: "Estados Pedido", icon: <FaClipboardList />, path: "/admin/estados-pedido" }
      ]
    },
    {
      title: "Compras",
      icon: <FaTruck />,
      key: "compras",
      color: "from-indigo-500 to-blue-500",
      items: [
        { text: "Compras", icon: <FaTruck />, path: "/admin/compras" },
        { text: "Detalle Compras", icon: <FaFileInvoiceDollar />, path: "/admin/compras/detalle" },
        { text: "Proveedores", icon: <FaUserCog />, path: "/admin/proveedores" }
      ]
    },
    {
      title: "Créditos & Cobranzas",
      icon: <FaCoins />,
      key: "creditos",
      color: "from-yellow-500 to-amber-500",
      items: [
        { text: "Gestión de Créditos", icon: <FaCoins />, path: "/admin/creditos/gestion" },
        { text: "Historial de Créditos", icon: <FaClipboardList />, path: "/admin/creditos/historial" },
        { text: "Detalle de Créditos", icon: <FaSearch />, path: "/admin/creditos/detalle" }
      ]
    },
    {
      title: "Devoluciones",
      icon: <FaUndo />,
      key: "devoluciones",
      color: "from-violet-500 to-purple-500",
      items: [
        { text: "Devoluciones", icon: <FaUndo />, path: "/admin/devoluciones" },
        { text: "Detalle Devolución", icon: <FaFileInvoiceDollar />, path: "/admin/devoluciones/detalle" }
      ]
    },
    {
      title: "Descuentos",
      icon: <FaPercent />,
      key: "descuentos",
      color: "from-lime-500 to-green-500",
      items: [
        { text: "Descuentos", icon: <FaPercent />, path: "/admin/descuentos" },
        { text: "Historial", icon: <FaChartLine />, path: "/admin/descuentos/historial" }
      ]
    },
    {
      title: "Pagos",
      icon: <FaCreditCard />,
      key: "pagos",
      color: "from-sky-500 to-blue-500",
      items: [
        { text: "Métodos Pago", icon: <FaCreditCard />, path: "/admin/metodos-pago" }
      ]
    },
    {
      title: "Reportes",
      icon: <FaChartBar />,
      key: "reportes",
      color: "from-fuchsia-500 to-pink-500",
      items: [
        { text: "Reportes Ventas", icon: <FaChartBar />, path: "/admin/reportes/ventas" },
        { text: "Reportes Compras", icon: <FaTruck />, path: "/admin/reportes/compras" },
        { text: "Reportes Créditos", icon: <FaCoins />, path: "/admin/reportes/creditos" },
        { text: "Reportes Pagos", icon: <FaReceipt />, path: "/admin/reportes/pagos" },
        { text: "Reportes Inventario", icon: <FaWarehouse />, path: "/admin/reportes/inventario" }
      ]
    }
  ];

  // --- LÓGICA DE PERMISOS ---
  const menuPermitido = menuSections.filter(section => {
    // Si la sección no tiene items, verificamos la sección misma
    if (!section.items || section.items.length === 0) {
      return tienePermiso(usuario, section.key, 'read');
    }

    // Si tiene items, filtramos los items permitidos
    const subitemsPermitidos = section.items.filter(item => {
      // Mapeo manual de rutas a claves de permisos si es necesario
      let clavePermiso = section.key; 
      
      // Casos específicos dentro de grupos
      if (item.path.includes('/roles')) clavePermiso = 'roles';
      if (item.path.includes('/categorias')) clavePermiso = 'categorias';
      if (item.path.includes('/proveedores')) clavePermiso = 'proveedores';
      if (item.path.includes('/galeria')) clavePermiso = 'galeria';

      return tienePermiso(usuario, clavePermiso, 'read');
    });

    // Guardar subitems filtrados de vuelta en la sección (clonando)
    section.items = subitemsPermitidos;

    // Mostrar sección solo si tiene al menos un subitem permitido
    return subitemsPermitidos.length > 0;
  });

  const filteredSections = menuPermitido.filter(section => {
    if (!searchQuery) return true;

    const sectionMatches = section.title.toLowerCase().includes(searchQuery.toLowerCase());
    const itemMatches = section.items?.some(item =>
      item.text.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return sectionMatches || itemMatches;
  });

  const SidebarItem = ({ section }) => {
    const isItemActive = isActive(section.path);
    const hasSubitems = section.items && section.items.length > 0;
    const isExpanded = openSections[section.key];
    const anySubitemActive = section.items?.some(item => isActive(item.path));

    if (!hasSubitems) {
      return (
        <Link
          to={section.path}
          className={`group relative flex items-center gap-3.5 px-4 py-3 mx-2 rounded-2xl transition-all duration-300
            ${isItemActive
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-blue-600 dark:hover:text-blue-400'
            }
            ${sidebarCollapsed ? 'justify-center px-0' : ''}
          `}
        >
          <div className={`flex items-center justify-center transition-all duration-300 ${isItemActive ? 'scale-110' : 'group-hover:scale-110'}`}>
            <span className="text-xl">{section.icon}</span>
          </div>

          {!sidebarCollapsed && (
            <span className={`font-bold text-sm tracking-tight ${isItemActive ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'}`}>
              {section.title}
            </span>
          )}

          {isItemActive && !sidebarCollapsed && (
            <div className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full shadow-sm" />
          )}

          {sidebarCollapsed && (
            <div className="absolute left-full ml-4 px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-2xl">
              {section.title}
            </div>
          )}
        </Link>
      );
    }

    return (
      <div className="mb-1">
        <button
          onClick={() => toggleSection(section.key)}
          className={`group w-full flex items-center justify-between px-4 py-3 mx-2 rounded-2xl transition-all duration-300
            ${isExpanded || anySubitemActive
              ? 'bg-slate-50 dark:bg-slate-700/40 text-blue-600 dark:text-blue-300'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 hover:text-blue-600 dark:hover:text-blue-300'
            }
            ${sidebarCollapsed ? 'justify-center px-0' : ''}
          `}
        >
          <div className="flex items-center gap-3.5">
            <div className={`flex items-center justify-center transition-all duration-300 ${isExpanded ? 'scale-110 text-blue-500' : 'group-hover:scale-110'}`}>
               <span className="text-xl">{section.icon}</span>
            </div>

            {!sidebarCollapsed && (
              <span className="font-bold text-sm tracking-tight">{section.title}</span>
            )}
          </div>

          {!sidebarCollapsed && (
            <div className={`transition-all duration-500 ${isExpanded ? 'rotate-180 text-blue-500' : 'text-slate-300'}`}>
              <FaChevronDown className="text-[10px]" />
            </div>
          )}
          
          {anySubitemActive && !isExpanded && !sidebarCollapsed && (
             <div className="absolute left-1 w-1 h-6 bg-blue-500 rounded-full" />
          )}
        </button>

        <div
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            isExpanded && !sidebarCollapsed ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="ml-9 space-y-1 pr-2 relative">
            <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-100 dark:bg-slate-600/40" />
            {section.items.map((item) => (
              <Link
                key={item.text}
                to={item.path}
                className={`group/item relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200
                  ${isActive(item.path)
                    ? 'bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 font-black'
                    : 'text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-300 hover:bg-slate-50 dark:hover:bg-slate-700/30'
                  }
                `}
              >
                {isActive(item.path) && (
                   <div className="absolute -left-[9px] w-2 h-2 bg-blue-500 rounded-full border-2 border-white dark:border-slate-800" />
                )}
                <span className="text-sm">{item.text}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Overlay para móvil */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30 transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Botón flotante para móvil */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-110 active:scale-95"
      >
        {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      <aside className={`
        relative z-50 h-[calc(100vh-2rem)] my-4 ml-4
        glass-card !rounded-[32px] bg-white dark:bg-gradient-to-b dark:from-slate-800 dark:to-slate-900 dark:border-slate-700/50 border-slate-200/50
        flex flex-col
        transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1)
        ${sidebarCollapsed ? 'w-24' : 'w-72'}
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header Premium - "Floating" effect */}
        <div className="px-6 py-8 border-b border-slate-200 dark:border-slate-700/50">
          <div className={`flex items-center gap-4 transition-all duration-500 ${sidebarCollapsed ? 'justify-center' : ''}`}>
             <div className="relative group/logo cursor-pointer" onClick={() => navigate('/admin/dashboard')}>
                <div className="absolute inset-0 bg-blue-600 rounded-2xl blur-xl opacity-20 group-hover/logo:opacity-40 transition-opacity" />
                <div className="relative w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 transform group-hover/logo:scale-110 group-hover/logo:rotate-3 transition-all duration-500">
                  <FaHeart className="text-xl text-white" />
                </div>
             </div>

            {!sidebarCollapsed && (
              <div className="flex-1 animate-in fade-in slide-in-from-left-4 duration-700">
                <h1 className="text-xl font-black tracking-tighter text-gradient dark:text-white !m-0 leading-tight">
                  Adi Estilos
                </h1>
                <div className="flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   <Text className="!text-[10px] !font-bold !text-slate-400 dark:!text-slate-500 uppercase tracking-widest leading-none">Admin Panel</Text>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search integrated like a "pill" */}
        {!sidebarCollapsed && (
          <div className="px-5 mb-6">
            <div className="relative group">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors text-xs" />
              <input
                type="text"
                placeholder="Buscar funcionalidad..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-100/50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600/50
                         focus:border-blue-500/50 dark:focus:border-blue-400/50 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-200
                         placeholder-slate-400 dark:placeholder-slate-500
                         focus:outline-none transition-all shadow-inner dark:shadow-slate-900/30"
              />
            </div>
          </div>
        )}

        {/* Scrollable Nav Area */}
        <nav className="flex-1 overflow-y-auto px-4 custom-scrollbar space-y-2">
          {filteredSections.map((section, idx) => (
            <div key={section.title}>
               <SidebarItem section={section} />
            </div>
          ))}
        </nav>

        {/* Control Footer - Simplified */}
        <div className="p-5 mt-auto border-t border-slate-200 dark:border-slate-700/50">
           <div className="flex gap-2.5">
              <div className="flex-1 glass-card !rounded-2xl !p-1.5 flex items-center justify-center bg-white dark:bg-slate-700/40 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-all duration-300 border border-slate-100 dark:border-slate-600/50 shadow-sm">
                 <ThemeSwitch />
              </div>
              
              <button 
                onClick={handleLogout}
                className="w-12 h-12 rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-500 dark:text-rose-400 flex items-center justify-center hover:bg-rose-500 dark:hover:bg-rose-600 hover:text-white hover:shadow-lg hover:shadow-rose-500/20 transition-all duration-500 group/logout border border-rose-500/20 dark:border-rose-500/30"
              >
                <FaSignOutAlt className="group-hover/logout:rotate-12 transition-transform" />
              </button>
              
              <button 
                 onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                 className="w-12 h-12 rounded-2xl glass-card !p-0 flex items-center justify-center text-pink-400 dark:text-pink-300 hover:text-pink-600 dark:hover:text-pink-200 hover:bg-pink-50 dark:hover:bg-slate-700/60 transition-all duration-300 border border-pink-100/50 dark:border-slate-600/50 shadow-sm"
              >
                {sidebarCollapsed ? <FaBars className="text-xs" /> : <FaChevronRight className="rotate-180 text-xs" />}
              </button>
           </div>
        </div>
      </aside>


    </>
  );
};

export default Sidebar;