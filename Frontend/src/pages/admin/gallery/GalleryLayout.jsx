import React, { useState, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Package, 
  Layers, 
  Users, 
  Grid 
} from 'lucide-react';
import { galeriaApi } from '../../../api/galeriaApi';

// Sub-components (Lazy load or direct import placeholders for now)
import ProductGallery from './ProductGallery';
import VariantGallery from './VariantGallery';
import SupplierGallery from './SupplierGallery';
import CategoryGallery from './CategoryGallery';

const GalleryLayout = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [stats, setStats] = useState({
    products: 0,
    variants: 0,
    suppliers: 0,
    categories: 0,
    totalImages: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await galeriaApi.obtenerResumen();
        setStats({
          products: data.productos || 0,
          variants: data.variantes || 0,
          suppliers: data.proveedores || 0,
          categories: data.categorias || 0,
          totalImages: data.totalImagenes || 0
        });
      } catch (error) {
        console.error('Error fetching gallery stats:', error);
      }
    };
    fetchStats();
  }, []);

  const tabs = [
    { id: 'products', label: 'Productos', icon: Package, count: stats.products },
    { id: 'variants', label: 'Variantes', icon: Layers, count: stats.variants },
    { id: 'suppliers', label: 'Proveedores', icon: Users, count: stats.suppliers },
    { id: 'categories', label: 'Categorías', icon: Grid, count: stats.categories },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-6 space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <ImageIcon className="w-8 h-8 text-purple-600" />
            Galería Central
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gestión centralizada de imágenes del sistema ({stats.totalImages} imágenes totales)
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-1.5 flex overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap
                ${isActive 
                  ? 'bg-purple-600 text-white shadow-md' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                }
              `}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
              {tab.label}
              <span className={`
                ml-2 text-xs py-0.5 px-2 rounded-full
                ${isActive 
                  ? 'bg-white/20 text-white' 
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400'
                }
              `}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm min-h-[600px] p-6">
        {activeTab === 'products' && <ProductGallery />}
        {activeTab === 'variants' && <VariantGallery />}
        {activeTab === 'suppliers' && <SupplierGallery />}
        {activeTab === 'categories' && <CategoryGallery />}
      </div>
    </div>
  );
};

export default GalleryLayout;
