import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  build: {
    target: 'es2015',
    minify: 'terser',
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('element-plus')) {
              return 'element-plus';
            }
            if (id.includes('vue') || id.includes('vuex') || id.includes('vue-router')) {
              return 'vendor';
            }
            return 'deps'; // 其他依赖
          }
        },
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          const cssPattern = /\.(css|less|sass|scss)$/;
          const isCSS = cssPattern.test(assetInfo.name);
          return isCSS
            ? 'assets/css/[name].[hash][extname]'
            : 'assets/[name].[hash][extname]';
        }
      }
    },
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: false,
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    }
  },
  css: {
    postcss: {
      plugins: []
    },
    preprocessorOptions: {
      scss: {
        additionalData: ``
      }
    }
  },
  optimizeDeps: {
    include: ['vue', 'vue-router', 'vuex', 'element-plus'],
    exclude: []
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://your-api-server.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
}) 