import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: path.resolve(__dirname, 'src/renderer'),
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/renderer/src'),
      '@fluxshare/shared': path.resolve(__dirname, '../../packages/shared/src'),
      '@fluxshare/protocol': path.resolve(__dirname, '../../packages/protocol/src'),
      '@fluxshare/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@fluxshare/utils': path.resolve(__dirname, '../../packages/utils/src')
    }
  },
  build: {
    outDir: path.resolve(__dirname, 'dist/renderer'),
    emptyOutDir: true
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true
  }
});
