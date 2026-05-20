import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const normalizePath = (id) => id.replace(/\\/g, '/');
const isPackage = (id, packageName) => id.includes(`/node_modules/${packageName}/`);
const isAnyPackage = (id, packageNames) => packageNames.some((packageName) => isPackage(id, packageName));

export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = normalizePath(id);

          if (!normalizedId.includes('/node_modules/')) {
            return undefined;
          }

          if (isAnyPackage(normalizedId, ['react', 'react-dom', 'scheduler'])) {
            return 'react-vendor';
          }

          if (isAnyPackage(normalizedId, ['react-router-dom', '@remix-run/router'])) {
            return 'router';
          }

          if (isPackage(normalizedId, 'recharts')) {
            return 'charts-recharts';
          }

          if (isPackage(normalizedId, 'victory-vendor')) {
            return 'charts-victory';
          }

          if (normalizedId.includes('/node_modules/d3-')) {
            return 'charts-d3';
          }

          if (isAnyPackage(normalizedId, ['react-hook-form', '@hookform', 'zod'])) {
            return 'forms';
          }

          if (isPackage(normalizedId, '@tanstack')) {
            return 'query';
          }

          if (isPackage(normalizedId, 'lucide-react')) {
            return 'icons';
          }

          return 'vendor';
        }
      }
    }
  },
  server: {
    port: 5173
  }
});
