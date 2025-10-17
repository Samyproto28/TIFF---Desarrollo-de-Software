import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import laravel from 'laravel-vite-plugin';
import path from 'path';

export default defineConfig({
  plugins: [
    vue(),
    laravel({
      input: ['resources/js/app.ts'],
      ssr: 'resources/js/ssr.ts',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './resources/js'),
    },
  },
  build: {
    // Generate source maps for production debugging
    sourcemap: true,
    
    // Optimize for production
    minify: 'terser',
    // Note: terserOptions format has changed in newer versions
    // This would need to be adjusted based on the actual terser version
    
    // Chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor libraries
          vendor: ['vue', 'vue-router', 'pinia'],
          
          // Chart.js
          charts: ['chart.js', 'vue-chartjs'],
          
          // UI components
          ui: [
            './resources/js/components/ui',
            './resources/js/components/common',
            './resources/js/components/layout',
          ],
          
          // Election components
          election: [
            './resources/js/components/election',
            './resources/js/components/reports',
          ],
          
          // Page components
          pages: [
            './resources/js/pages',
          ],
          
          // Stores
          stores: [
            './resources/js/stores',
          ],
        },
      },
    },
    
    // Asset inlining threshold
    assetsInlineLimit: 4096,
    
    // Report compressed sizes
    reportCompressedSize: true,
    
    // CSS code splitting
    cssCodeSplit: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'axios',
      'chart.js',
      'vue-chartjs',
    ],
  },
  // CSS configuration
  css: {
    devSourcemap: false,
  },
  // Server configuration
  server: {
    host: true,
  },
  // Preview configuration
  preview: {
    host: true,
  },
});