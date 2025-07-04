import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['mammoth', 'pdfjs-dist']
  },
  assetsInclude: ['**/*.worker.js'],
  build: {
    rollupOptions: {
      external: [],
      output: {
        manualChunks: undefined
      }
    },
  },
});