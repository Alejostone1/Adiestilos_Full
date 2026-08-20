import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  const API_TARGET = env.VITE_FILES_URL || 'http://localhost:3000';

  return {
    plugins: [react()],

    // ⚙️ Servidor de desarrollo
    server: mode === 'development'
      ? {
          port: 5173,
          open: true,
          proxy: {
            '/api': {
              target: API_TARGET,
              changeOrigin: true,
              secure: false,
            },
            '/uploads': {
              target: API_TARGET,
              changeOrigin: true,
              secure: false,
            },
          },
        }
      : undefined,

    // 👀 Preview del build
    preview: {
      port: 4173,
      strictPort: true,
    },

    // 📦 Build optimizado
    build: {
      outDir: 'dist',
      sourcemap: false,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          // Separación de dependencias pesadas en chunks propios (mejor caché)
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            antd: ['antd', '@ant-design/icons'],
            charts: ['recharts'],
            animacion: ['framer-motion'],
          },
        },
      },
    },
  };
});
